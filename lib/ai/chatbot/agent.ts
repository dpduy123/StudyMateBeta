// StudyMate AI Agent
// Main agent orchestrator with Gemini function calling

import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'
import { traceAICall } from '@/lib/ai/opik'
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
                ...(value.enum ? { enum: value.enum } : {})
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
    userId: string
  ): AsyncGenerator<ChatStreamChunk> {
    const startTime = Date.now()

    try {
      // Get or create thread
      const thread = await this.getOrCreateThread(threadId, userId, message)

      // Get user context
      const userContext = await this.getUserContext(userId)

      // Get conversation history
      const history = await this.getConversationHistory(thread.id)

      // Build the chat
      const chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: 'System: ' + getSystemPrompt(userContext) }]
          },
          {
            role: 'model',
            parts: [{ text: 'Tôi đã hiểu. Tôi là StudyMate AI, sẵn sàng hỗ trợ bạn!' }]
          },
          ...history.map(msg => ({
            role: msg.role === 'USER' ? 'user' as const : 'model' as const,
            parts: [{ text: msg.content }]
          }))
        ]
      })

      // Send message and get response
      const result = await traceAICall(
        'chatbot_response',
        {
          userId,
          threadId: thread.id,
          messagePreview: message.substring(0, 100)
        },
        async () => {
          return await chat.sendMessage(message)
        },
        {
          model: 'gemini-2.5-flash',
          feature: 'chatbot'
        }
      )

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

      // Stream the text response
      yield {
        type: 'text',
        content: fullResponse
      }

      // Save messages to database
      await this.saveMessages(thread.id, message, fullResponse, toolCalls, toolResults, Date.now() - startTime)

      yield {
        type: 'done'
      }

    } catch (error) {
      console.error('❌ [Chatbot Agent] Error:', error)
      yield {
        type: 'error',
        error: error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.'
      }
    }
  }

  /**
   * Non-streaming chat for simple use cases
   */
  async chatSync(
    message: string,
    threadId: string | null,
    userId: string
  ): Promise<{ threadId: string; response: string; toolCalls?: ToolCall[]; toolResults?: ToolResult[] }> {
    let response = ''
    let finalThreadId = threadId || ''
    const allToolCalls: ToolCall[] = []
    const allToolResults: ToolResult[] = []

    for await (const chunk of this.chat(message, threadId, userId)) {
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
}

// Singleton instance
let agentInstance: StudyMateAgent | null = null

export function getAgent(): StudyMateAgent {
  if (!agentInstance) {
    agentInstance = new StudyMateAgent()
  }
  return agentInstance
}
