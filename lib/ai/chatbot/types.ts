// Chatbot Types

export type ChatRole = 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL'

export interface ChatMessage {
  id?: string
  role: ChatRole
  content: string
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
  createdAt?: Date
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolResult {
  toolCallId: string
  name: string
  result: unknown
  error?: string
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, {
      type: string
      description: string
      enum?: string[]
    }>
    required?: string[]
  }
}

export interface UserContext {
  id: string
  firstName: string
  lastName: string
  university: string
  major: string
  year: number
  interests: string[]
  skills: string[]
  studyGoals: string[]
  preferredStudyTime: string[]
  languages: string[]
  totalMatches: number
  successfulMatches: number
}

export interface ChatStreamChunk {
  type: 'text' | 'tool_call' | 'tool_result' | 'error' | 'done'
  content?: string
  toolCall?: ToolCall
  toolResult?: ToolResult
  error?: string
}

export interface ChatRequest {
  message: string
  threadId?: string
}

export interface ChatResponse {
  threadId: string
  message: ChatMessage
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
}
