// StudyMate AI Agent
// Main agent orchestrator with Gemini function calling

import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'
import { getOpikClient } from '@/lib/ai/opik'
import { ChatMessage, ChatStreamChunk, ToolCall, ToolResult, UserContext } from './types'
import { getSystemPrompt } from './prompts'
import { toolDefinitions, executeTool } from './tools'

export class StudyMateAgent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private model: any
  private generativeAI: GoogleGenerativeAI

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    this.generativeAI = new GoogleGenerativeAI(apiKey)

    // Convert tool definitions to Gemini format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geminiTools: any[] = [{
      functionDeclarations: toolDefinitions.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'OBJECT',
          properties: Object.fromEntries(
            Object.entries(tool.parameters.properties).map(([key, value]) => [
              key,
              {
                type: value.type.toUpperCase(),
                description: value.description,
                ...(value.enum ? { enum: value.enum } : {}),
                ...(value.items ? {
                  items: {
                    type: value.items.type.toUpperCase(),
                    ...(value.items.enum ? { enum: value.items.enum } : {})
                  }
                } : {})
              }
            ])
          ),
          required: tool.parameters.required || []
        }
      }))
    }]

    this.model = this.generativeAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
      tools: geminiTools
    })
  }

  /**
   * Process a chat message and stream the response
   */
  async *chat(
    message: string,
    threadId: string | null,
    userId: string,
    language: 'en' | 'vi' = 'en'
  ): AsyncGenerator<ChatStreamChunk> {
    const startTime = Date.now()

    // Create Opik trace for observability (created early to capture all errors)
    const opikClient = getOpikClient()
    const trace = opikClient?.trace({
      name: 'chatbot_response',
      input: {
        userId,
        threadId: threadId || 'new',
        message,
        language
      },
      metadata: {
        model: 'gemini-2.5-flash',
        feature: 'chatbot',
        environment: process.env.OPIK_ENVIRONMENT || process.env.NODE_ENV || 'development'
      }
    })

    try {
      // TEST MODE: Simulate errors for testing (remove in production)
      if (process.env.NODE_ENV === 'development') {
        if (message.toLowerCase().includes('/test-429')) {
          throw new Error('[429] Rate limit exceeded')
        }
        if (message.toLowerCase().includes('/test-400')) {
          throw new Error('[400] Bad request - invalid input')
        }
        if (message.toLowerCase().includes('/test-404')) {
          throw new Error('[404] Resource not found')
        }
        if (message.toLowerCase().includes('/test-500')) {
          throw new Error('[500] Internal server error')
        }
        if (message.toLowerCase().includes('/test-network')) {
          throw new Error('Network connection timeout')
        }
        if (message.toLowerCase().includes('/test-safety')) {
          throw new Error('Content blocked for safety reasons')
        }
      }

      // Get or create thread
      const thread = await this.getOrCreateThread(threadId, userId, message)

      // Get user context
      const userContext = await this.getUserContext(userId)

      // Get conversation history
      const history = await this.getConversationHistory(thread.id)

      // Build the chat
      const initialResponse = language === 'vi'
        ? 'Tôi đã hiểu. Tôi là StudyMate AI, sẵn sàng hỗ trợ bạn!'
        : 'Understood. I am StudyMate AI, ready to help you!'

      const chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: 'System: ' + getSystemPrompt(userContext, language) }]
          },
          {
            role: 'model',
            parts: [{ text: initialResponse }]
          },
          ...history.map(msg => ({
            role: msg.role === 'USER' ? 'user' as const : 'model' as const,
            parts: [{ text: msg.content }]
          }))
        ]
      })

      // Update trace with actual thread ID
      if (trace) {
        trace.update({
          input: {
            userId,
            threadId: thread.id,
            message,
            language
          }
        })
      }

      // Send message and get response
      const result = await chat.sendMessage(message)

      const response = result.response
      let fullResponse = ''
      const toolCalls: ToolCall[] = []
      const toolResults: ToolResult[] = []

      // Check for function calls
      const functionCalls = response.functionCalls()

      if (functionCalls && functionCalls.length > 0) {
        // Execute each tool
        for (const fc of functionCalls) {
          const toolCall: ToolCall = {
            id: `call_${Date.now()}_${fc.name}`,
            name: fc.name,
            arguments: fc.args as Record<string, unknown>
          }
          toolCalls.push(toolCall)

          yield {
            type: 'tool_call',
            toolCall
          }

          // Execute the tool
          const executeResult = await executeTool(fc.name, fc.args as Record<string, unknown>, userId)

          const toolResult: ToolResult = {
            toolCallId: toolCall.id,
            name: fc.name,
            result: executeResult.result,
            error: executeResult.error
          }
          toolResults.push(toolResult)

          yield {
            type: 'tool_result',
            toolResult
          }
        }

        // Send tool results back to model for final response
        const toolResponseParts = toolResults.map(tr => ({
          functionResponse: {
            name: tr.name,
            response: {
              success: !tr.error,
              data: tr.result,
              error: tr.error
            }
          }
        }))

        const finalResult = await chat.sendMessage(toolResponseParts)
        fullResponse = finalResult.response.text()
      } else {
        // No function calls, just text response
        fullResponse = response.text()
      }

      // Update Opik trace with output
      const latencyMs = Date.now() - startTime
      if (trace) {
        trace.update({
          output: {
            response: fullResponse,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            toolResults: toolResults.length > 0 ? toolResults : undefined
          },
          metadata: {
            model: 'gemini-2.5-flash',
            feature: 'chatbot',
            latencyMs,
            status: 'success',
            hasToolCalls: toolCalls.length > 0,
            toolCount: toolCalls.length
          }
        })
        trace.end()
      }

      // Stream the text response
      yield {
        type: 'text',
        content: fullResponse
      }

      // Save messages to database
      await this.saveMessages(thread.id, message, fullResponse, toolCalls, toolResults, latencyMs)

      yield {
        type: 'done'
      }

    } catch (error) {
      console.error('❌ [Chatbot Agent] Error:', error)

      // Update Opik trace with error
      const latencyMs = Date.now() - startTime
      if (trace) {
        trace.update({
          output: {
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          metadata: {
            model: 'gemini-2.5-flash',
            feature: 'chatbot',
            latencyMs,
            status: 'error',
            errorType: this.getErrorType(error)
          }
        })
        trace.end()
      }

      // Generate friendly error message based on error type
      const friendlyMessage = this.getFriendlyErrorMessage(error)

      yield {
        type: 'error',
        error: friendlyMessage
      }
    }
  }

  /**
   * Get error type for classification
   */
  private getErrorType(error: unknown): string {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorString = errorMessage.toLowerCase()

    if (errorString.includes('429') || errorString.includes('rate limit') || errorString.includes('quota')) {
      return 'rate_limit'
    }
    if (errorString.includes('400') || errorString.includes('bad request') || errorString.includes('invalid')) {
      return 'bad_request'
    }
    if (errorString.includes('404') || errorString.includes('not found')) {
      return 'not_found'
    }
    if (errorString.includes('500') || errorString.includes('502') || errorString.includes('503') || errorString.includes('internal server')) {
      return 'server_error'
    }
    if (errorString.includes('network') || errorString.includes('connection') || errorString.includes('timeout') || errorString.includes('econnrefused')) {
      return 'network_error'
    }
    if (errorString.includes('api key') || errorString.includes('authentication') || errorString.includes('unauthorized') || errorString.includes('401')) {
      return 'auth_error'
    }
    if (errorString.includes('safety') || errorString.includes('blocked') || errorString.includes('harmful')) {
      return 'content_blocked'
    }
    if (errorString.includes('token') || errorString.includes('context length') || errorString.includes('too long')) {
      return 'context_exceeded'
    }

    return 'unknown'
  }

  /**
   * Non-streaming chat for simple use cases
   */
  async chatSync(
    message: string,
    threadId: string | null,
    userId: string,
    language: 'en' | 'vi' = 'en'
  ): Promise<{ threadId: string; response: string; toolCalls?: ToolCall[]; toolResults?: ToolResult[] }> {
    let response = ''
    let finalThreadId = threadId || ''
    const allToolCalls: ToolCall[] = []
    const allToolResults: ToolResult[] = []

    for await (const chunk of this.chat(message, threadId, userId, language)) {
      if (chunk.type === 'text') {
        response += chunk.content || ''
      } else if (chunk.type === 'tool_call' && chunk.toolCall) {
        allToolCalls.push(chunk.toolCall)
      } else if (chunk.type === 'tool_result' && chunk.toolResult) {
        allToolResults.push(chunk.toolResult)
      }
    }

    // Get the thread ID from the first message
    if (!finalThreadId) {
      const latestThread = await prisma.chatThread.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
      finalThreadId = latestThread?.id || ''
    }

    return {
      threadId: finalThreadId,
      response,
      toolCalls: allToolCalls.length > 0 ? allToolCalls : undefined,
      toolResults: allToolResults.length > 0 ? allToolResults : undefined
    }
  }

  private async getOrCreateThread(
    threadId: string | null,
    userId: string,
    firstMessage: string
  ) {
    if (threadId) {
      const existing = await prisma.chatThread.findFirst({
        where: { id: threadId, userId }
      })
      if (existing) return existing
    }

    // Create new thread
    const title = firstMessage.length > 50
      ? firstMessage.substring(0, 50) + '...'
      : firstMessage

    return await prisma.chatThread.create({
      data: {
        userId,
        title
      }
    })
  }

  private async getUserContext(userId: string): Promise<UserContext | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        university: true,
        major: true,
        year: true,
        interests: true,
        skills: true,
        studyGoals: true,
        preferredStudyTime: true,
        languages: true,
        totalMatches: true,
        successfulMatches: true
      }
    })

    return user
  }

  private async getConversationHistory(threadId: string, limit = 10): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        role: true,
        content: true,
        createdAt: true
      }
    })

    // Reverse to get chronological order
    return messages.reverse().map(m => ({
      role: m.role as ChatMessage['role'],
      content: m.content,
      createdAt: m.createdAt
    }))
  }

  private async saveMessages(
    threadId: string,
    userMessage: string,
    assistantMessage: string,
    toolCalls: ToolCall[],
    toolResults: ToolResult[],
    latencyMs: number
  ) {
    // Save user message
    await prisma.chatMessage.create({
      data: {
        threadId,
        role: 'USER',
        content: userMessage
      }
    })

    // Save assistant message
    await prisma.chatMessage.create({
      data: {
        threadId,
        role: 'ASSISTANT',
        content: assistantMessage,
        toolCalls: toolCalls.length > 0 ? JSON.parse(JSON.stringify(toolCalls)) : undefined,
        toolResults: toolResults.length > 0 ? JSON.parse(JSON.stringify(toolResults)) : undefined,
        latencyMs
      }
    })

    // Update thread's updatedAt
    await prisma.chatThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() }
    })
  }

  /**
   * Generate a friendly error message based on error type
   */
  private getFriendlyErrorMessage(error: unknown): string {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorString = errorMessage.toLowerCase()

    // Rate limit error (429)
    if (errorString.includes('429') || errorString.includes('rate limit') || errorString.includes('quota')) {
      return '🌟 Ôi, mình đang được nhiều bạn hỏi quá nên cần nghỉ ngơi một chút! Bạn thử lại sau vài giây nhé. Mình hứa sẽ trả lời ngay khi có thể! 💪'
    }

    // Bad request error (400)
    if (errorString.includes('400') || errorString.includes('bad request') || errorString.includes('invalid')) {
      return '🤔 Hmm, có vẻ mình chưa hiểu rõ câu hỏi của bạn. Bạn thử diễn đạt lại rõ hơn một chút nhé!'
    }

    // Not found error (404)
    if (errorString.includes('404') || errorString.includes('not found')) {
      return '🔍 Hmm, mình không tìm thấy thông tin bạn cần. Bạn thử hỏi lại theo cách khác xem sao nhé!'
    }

    // Server error (500, 502, 503)
    if (errorString.includes('500') || errorString.includes('502') || errorString.includes('503') || errorString.includes('internal server')) {
      return '🔧 Úi, hệ thống đang gặp chút trục trặc kỹ thuật. Đội ngũ kỹ thuật đang khắc phục, bạn thử lại sau một lát nhé!'
    }

    // Network/Connection errors
    if (errorString.includes('network') || errorString.includes('connection') || errorString.includes('timeout') || errorString.includes('econnrefused')) {
      return '📡 Có vẻ như kết nối mạng đang không ổn định. Bạn kiểm tra lại internet và thử lại nhé!'
    }

    // API Key errors
    if (errorString.includes('api key') || errorString.includes('authentication') || errorString.includes('unauthorized') || errorString.includes('401')) {
      return '🔐 Có lỗi xác thực hệ thống. Đội ngũ kỹ thuật đã được thông báo và đang xử lý. Bạn thử lại sau nhé!'
    }

    // Content safety/blocked
    if (errorString.includes('safety') || errorString.includes('blocked') || errorString.includes('harmful')) {
      return '⚠️ Mình không thể trả lời câu hỏi này. Bạn thử hỏi về học tập, tìm bạn học chung hoặc các chủ đề khác nhé!'
    }

    // Token/Context length exceeded
    if (errorString.includes('token') || errorString.includes('context length') || errorString.includes('too long')) {
      return '📝 Tin nhắn hơi dài quá, mình xử lý không kịp. Bạn thử chia nhỏ câu hỏi ra nhé!'
    }

    // Default friendly message
    return '😅 Ối, mình gặp chút trục trặc rồi! Đừng lo, bạn thử gửi lại tin nhắn nhé. Nếu vẫn lỗi, hãy thử refresh trang hoặc quay lại sau một chút. Mình luôn sẵn sàng hỗ trợ bạn! 🤗'
  }
}

// Singleton instance
let agentInstance: StudyMateAgent | null = null

export function getAgent(): StudyMateAgent {
  if (!agentInstance) {
    agentInstance = new StudyMateAgent()
  }
  return agentInstance
}
