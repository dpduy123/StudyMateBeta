'use client'

import { useState } from 'react'
import {
  CircleStackIcon,
  TableCellsIcon,
  KeyIcon,
  LinkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface DatabaseTable {
  name: string
  count?: number
  description: string
  fields: DatabaseField[]
  relations: DatabaseRelation[]
}

interface DatabaseField {
  name: string
  type: string
  nullable: boolean
  default?: string
  description: string
}

interface DatabaseRelation {
  name: string
  type: 'oneToMany' | 'manyToOne' | 'manyToMany'
  target: string
  description: string
}

export function DatabaseViewer() {
  const [selectedTable, setSelectedTable] = useState<string>('User')

  // Schema data based on your Prisma schema
  const tables: DatabaseTable[] = [
    {
      name: 'User',
      description: 'Core user model with profile information',
      fields: [
        { name: 'id', type: 'String', nullable: false, description: 'Unique identifier' },
        { name: 'email', type: 'String', nullable: false, description: 'User email address' },
        { name: 'firstName', type: 'String', nullable: false, description: 'First name' },
        { name: 'lastName', type: 'String', nullable: false, description: 'Last name' },
        { name: 'avatar', type: 'String?', nullable: true, description: 'Profile picture URL' },
        { name: 'bio', type: 'String?', nullable: true, description: 'User biography' },
        { name: 'university', type: 'String', nullable: false, description: 'University name' },
        { name: 'major', type: 'String', nullable: false, description: 'Field of study' },
        { name: 'year', type: 'Int', nullable: false, description: 'Academic year' },
        { name: 'gpa', type: 'Float?', nullable: true, description: 'Grade point average' },
        { name: 'interests', type: 'String[]', nullable: false, description: 'Academic interests' },
        { name: 'skills', type: 'String[]', nullable: false, description: 'Skills and competencies' },
        { name: 'studyGoals', type: 'String[]', nullable: false, description: 'Learning objectives' },
        { name: 'status', type: 'UserStatus', nullable: false, default: 'ACTIVE', description: 'Account status' },
        { name: 'subscriptionTier', type: 'SubscriptionTier', nullable: false, default: 'BASIC', description: 'Subscription level' },
        { name: 'totalMatches', type: 'Int', nullable: false, default: '0', description: 'Total match count' },
        { name: 'averageRating', type: 'Float', nullable: false, default: '0.0', description: 'Average user rating' }
      ],
      relations: [
        { name: 'sentMatches', type: 'oneToMany', target: 'Match', description: 'Matches initiated by user' },
        { name: 'receivedMatches', type: 'oneToMany', target: 'Match', description: 'Matches received by user' },
        { name: 'sentMessages', type: 'oneToMany', target: 'Message', description: 'Private messages sent' },
        { name: 'ownedRooms', type: 'oneToMany', target: 'Room', description: 'Rooms created by user' },
        { name: 'roomMemberships', type: 'oneToMany', target: 'RoomMember', description: 'Room participations' }
      ]
    },
    {
      name: 'Match',
      description: 'Student matching system records',
      fields: [
        { name: 'id', type: 'String', nullable: false, description: 'Unique identifier' },
        { name: 'senderId', type: 'String', nullable: false, description: 'User who sent match request' },
        { name: 'receiverId', type: 'String', nullable: false, description: 'User who received request' },
        { name: 'status', type: 'MatchStatus', nullable: false, default: 'PENDING', description: 'Match status' },
        { name: 'message', type: 'String?', nullable: true, description: 'Optional message with request' },
        { name: 'createdAt', type: 'DateTime', nullable: false, description: 'When match was created' },
        { name: 'respondedAt', type: 'DateTime?', nullable: true, description: 'When response was given' }
      ],
      relations: [
        { name: 'sender', type: 'manyToOne', target: 'User', description: 'User who initiated match' },
        { name: 'receiver', type: 'manyToOne', target: 'User', description: 'User who received match' }
      ]
    },
    {
      name: 'Message',
      description: 'Private messaging system',
      fields: [
        { name: 'id', type: 'String', nullable: false, description: 'Unique identifier' },
        { name: 'senderId', type: 'String', nullable: false, description: 'Message sender' },
        { name: 'receiverId', type: 'String', nullable: false, description: 'Message recipient' },
        { name: 'type', type: 'MessageType', nullable: false, default: 'TEXT', description: 'Message type' },
        { name: 'content', type: 'String', nullable: false, description: 'Message content' },
        { name: 'isRead', type: 'Boolean', nullable: false, default: 'false', description: 'Read status' }
      ],
      relations: [
        { name: 'sender', type: 'manyToOne', target: 'User', description: 'User who sent message' },
        { name: 'receiver', type: 'manyToOne', target: 'User', description: 'User who received message' }
      ]
    },
    {
      name: 'Room',
      description: 'Study rooms for group collaboration',
      fields: [
        { name: 'id', type: 'String', nullable: false, description: 'Unique identifier' },
        { name: 'name', type: 'String', nullable: false, description: 'Room name' },
        { name: 'description', type: 'String?', nullable: true, description: 'Room description' },
        { name: 'type', type: 'RoomType', nullable: false, default: 'STUDY_GROUP', description: 'Room type' },
        { name: 'maxMembers', type: 'Int', nullable: false, default: '10', description: 'Maximum members' },
        { name: 'isPrivate', type: 'Boolean', nullable: false, default: 'false', description: 'Privacy setting' },
        { name: 'allowVideo', type: 'Boolean', nullable: false, default: 'true', description: 'Video calls enabled' },
        { name: 'allowVoice', type: 'Boolean', nullable: false, default: 'true', description: 'Voice calls enabled' }
      ],
      relations: [
        { name: 'owner', type: 'manyToOne', target: 'User', description: 'Room creator' },
        { name: 'members', type: 'oneToMany', target: 'RoomMember', description: 'Room participants' },
        { name: 'messages', type: 'oneToMany', target: 'RoomMessage', description: 'Room chat messages' }
      ]
    }
  ]

  const currentTable = tables.find(t => t.name === selectedTable) || tables[0]

  const getTypeColor = (type: string) => {
    if (type.includes('String')) return 'text-blue-600 bg-blue-50'
    if (type.includes('Int') || type.includes('Float')) return 'text-green-600 bg-green-50'
    if (type.includes('Boolean')) return 'text-purple-600 bg-purple-50'
    if (type.includes('DateTime')) return 'text-orange-600 bg-orange-50'
    if (type.includes('[]')) return 'text-pink-600 bg-pink-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getRelationColor = (type: string) => {
    switch (type) {
      case 'oneToMany': return 'text-blue-600 bg-blue-50'
      case 'manyToOne': return 'text-green-600 bg-green-50'
      case 'manyToMany': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Database Schema</h2>
        <p className="text-gray-600">Explore the database structure and relationships</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tables List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CircleStackIcon className="h-5 w-5 mr-2" />
            Tables
          </h3>
          <div className="space-y-2">
            {tables.map((table) => (
              <button
                key={table.name}
                onClick={() => setSelectedTable(table.name)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedTable === table.name
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="font-medium">{table.name}</div>
                <div className="text-sm text-gray-500">{table.count || 'N/A'} records</div>
              </button>
            ))}
          </div>
        </div>

        {/* Table Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Table Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <TableCellsIcon className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{currentTable.name}</h3>
                <p className="text-gray-600">{currentTable.description}</p>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <KeyIcon className="h-5 w-5 mr-2" />
              Fields
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-900">Name</th>
                    <th className="text-left py-2 font-medium text-gray-900">Type</th>
                    <th className="text-left py-2 font-medium text-gray-900">Nullable</th>
                    <th className="text-left py-2 font-medium text-gray-900">Default</th>
                    <th className="text-left py-2 font-medium text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTable.fields.map((field, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 font-mono text-sm font-medium text-gray-900">
                        {field.name}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(field.type)}`}>
                          {field.type}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          field.nullable ? 'text-yellow-600 bg-yellow-50' : 'text-gray-600 bg-gray-50'
                        }`}>
                          {field.nullable ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-600 font-mono">
                        {field.default || '-'}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {field.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Relations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <LinkIcon className="h-5 w-5 mr-2" />
              Relations
            </h4>
            <div className="space-y-3">
              {currentTable.relations.map((relation, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {relation.name}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRelationColor(relation.type)}`}>
                        {relation.type}
                      </span>
                      <span className="text-sm text-gray-600">→ {relation.target}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{relation.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schema Export */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Schema Operations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="font-medium text-gray-900">Export Schema</div>
                <div className="text-sm text-gray-500">Download Prisma schema</div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="font-medium text-gray-900">Generate Migration</div>
                <div className="text-sm text-gray-500">Create database migration</div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="font-medium text-gray-900">Reset Database</div>
                <div className="text-sm text-red-500">⚠️ Dangerous operation</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}