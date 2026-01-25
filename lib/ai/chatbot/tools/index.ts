// Chatbot Tools Registry

import { ToolDefinition } from '../types'
import { searchStudyPartners } from './search-partners'
import { getUserProfile } from './get-profile'
import { sendConnectionRequest } from './send-connection'
import { findStudyRooms } from './find-rooms'
import { searchKnowledge } from './search-knowledge'
import { searchExternalKnowledge } from './search-external'

// Tool definitions for Gemini function calling
export const toolDefinitions: ToolDefinition[] = [
  {
    name: 'search_study_partners',
    description: 'Tìm kiếm bạn học phù hợp với tiêu chí. Trả về danh sách người dùng phù hợp với điểm số match.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Mô tả tiêu chí tìm kiếm bằng ngôn ngữ tự nhiên. Ví dụ: "học Machine Learning, rảnh tối", "giỏi Python, cùng trường UIT"'
        },
        limit: {
          type: 'number',
          description: 'Số lượng kết quả tối đa (mặc định: 5)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_user_profile',
    description: 'Lấy thông tin chi tiết về một người dùng cụ thể.',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID của người dùng cần xem thông tin'
        }
      },
      required: ['userId']
    }
  },
  {
    name: 'send_connection_request',
    description: 'Gửi lời mời kết nối đến một người dùng.',
    parameters: {
      type: 'object',
      properties: {
        targetUserId: {
          type: 'string',
          description: 'ID của người dùng muốn kết nối'
        },
        message: {
          type: 'string',
          description: 'Tin nhắn kèm theo lời mời (tùy chọn)'
        }
      },
      required: ['targetUserId']
    }
  },
  {
    name: 'find_study_rooms',
    description: 'Tìm phòng học nhóm đang hoạt động theo chủ đề.',
    parameters: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Chủ đề hoặc môn học muốn tìm phòng. Ví dụ: "algorithms", "machine learning", "web development"'
        },
        limit: {
          type: 'number',
          description: 'Số lượng kết quả tối đa (mặc định: 5)'
        }
      },
      required: ['topic']
    }
  },
  {
    name: 'search_knowledge',
    description: 'Tìm kiếm trong knowledge base về tips học tập, hướng dẫn sử dụng StudyMate, và FAQ.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Câu hỏi hoặc từ khóa tìm kiếm. Ví dụ: "cách học hiệu quả", "tăng match rate", "sử dụng phòng học"'
        },
        category: {
          type: 'string',
          description: 'Danh mục tìm kiếm (tùy chọn)',
          enum: ['study_tips', 'platform_help', 'faq', 'academic']
        }
      },
      required: ['query']
    }
  },
  {
    name: 'search_external_knowledge',
    description: 'Tìm kiếm kiến thức từ Wikipedia và các nguồn học thuật bên ngoài. Dùng khi cần thông tin về khái niệm, định nghĩa, hoặc kiến thức học thuật.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Chủ đề hoặc khái niệm cần tìm hiểu. Ví dụ: "machine learning là gì", "phương pháp Pomodoro", "lập trình Python"'
        },
        sources: {
          type: 'array',
          description: 'Nguồn tìm kiếm (mặc định: cả hai)',
          items: {
            type: 'string',
            enum: ['wikipedia', 'academic']
          }
        },
        language: {
          type: 'string',
          description: 'Ngôn ngữ ưu tiên (mặc định: vi)',
          enum: ['vi', 'en']
        }
      },
      required: ['query']
    }
  }
]

// Tool executors map
export const toolExecutors: Record<string, (args: Record<string, unknown>, userId: string) => Promise<unknown>> = {
  search_study_partners: searchStudyPartners,
  get_user_profile: getUserProfile,
  send_connection_request: sendConnectionRequest,
  find_study_rooms: findStudyRooms,
  search_knowledge: searchKnowledge,
  search_external_knowledge: searchExternalKnowledge
}

// Execute a tool by name
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const executor = toolExecutors[toolName]

  if (!executor) {
    return { success: false, error: `Unknown tool: ${toolName}` }
  }

  try {
    const result = await executor(args, userId)
    return { success: true, result }
  } catch (error) {
    console.error(`Tool execution error [${toolName}]:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Tool execution failed'
    }
  }
}
