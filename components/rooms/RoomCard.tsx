'use client'

import { useState } from 'react'
import { LockClosedIcon, VideoCameraIcon, MicrophoneIcon, ChatBubbleLeftRightIcon, ComputerDesktopIcon, UserGroupIcon, HashtagIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Room } from '@/hooks/useRooms'

interface RoomCardProps {
  room: Room
  onJoinRoom: (roomId: string) => void
  onRoomDeleted?: () => void
}
import { DeleteDialog } from '@/components/ui/DeleteDialog'
import toast from 'react-hot-toast'

const RoomCard: React.FC<RoomCardProps> = ({ room, onJoinRoom, onRoomDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteRoom = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/rooms/${room.id}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast.success('Đã xóa phòng thành công!')
        setShowDeleteDialog(false)
        // Call the refresh function if provided, otherwise reload the page
        if (onRoomDeleted) {
          onRoomDeleted()
        } else {
          window.location.reload()
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Không thể xóa phòng')
      }
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error('Có lỗi xảy ra khi xóa phòng')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
      >
        <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>bởi {room.owner.name}</span>
                      {room.isOwner && (
                        <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          Chủ phòng
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {room.isPrivate && (
                      <div className="flex items-center space-x-1 text-gray-500">
                        <LockClosedIcon className="h-4 w-4" />
                        <span className="text-xs font-medium">Riêng tư</span>
                      </div>
                    )}
                    {room.isOwner && (
                      <button
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={isDeleting}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xóa phòng"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{room.description}</p>

      <div className="flex items-center space-x-2 mb-4">
        <HashtagIcon className="h-5 w-5 text-primary-600" />
        <span className="font-medium text-primary-700">{room.topic}</span>
      </div>

      {/* Room Features */}
      <div className="flex items-center space-x-3 mb-4">
        {room.allowVideo && (
          <div className="flex items-center space-x-1 text-green-600">
            <VideoCameraIcon className="h-4 w-4" />
            <span className="text-xs">Video</span>
          </div>
        )}
        {room.allowVoice && (
          <div className="flex items-center space-x-1 text-blue-600">
            <MicrophoneIcon className="h-4 w-4" />
            <span className="text-xs">Voice</span>
          </div>
        )}
        {room.allowText && (
          <div className="flex items-center space-x-1 text-purple-600">
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            <span className="text-xs">Text</span>
          </div>
        )}
        {room.allowScreenShare && (
          <div className="flex items-center space-x-1 text-orange-600">
            <ComputerDesktopIcon className="h-4 w-4" />
            <span className="text-xs">Screen Share</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {room.tags.map((tag) => (
          <span
            key={tag}
            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>

    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <UserGroupIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-700">
            {room.currentMembers} / {room.maxMembers}
          </span>
          {room.currentMembers >= room.maxMembers && (
            <span className="text-xs text-red-600 font-medium">Đầy</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {room.isMember ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-600 font-medium">Đã tham gia</span>
              <Link
                href={`/rooms/${room.id}`}
                className="btn-primary text-sm py-2 px-4"
              >
                Vào phòng
              </Link>
            </div>
          ) : room.currentMembers >= room.maxMembers ? (
            <button
              disabled
              className="btn-secondary text-sm py-2 px-4 opacity-50 cursor-not-allowed"
            >
              Đầy
            </button>
          ) : (
            <button
              onClick={() => onJoinRoom(room.id)}
              className="btn-secondary text-sm py-2 px-4 hover:btn-primary transition-all"
            >
              Tham gia
            </button>
          )}
        </div>
        </div>
      </div>
    </motion.div>

    {/* Delete Dialog */}
    <DeleteDialog
      isOpen={showDeleteDialog}
      onClose={() => setShowDeleteDialog(false)}
      onConfirm={handleDeleteRoom}
      title="Xóa phòng học"
      description="Bạn có chắc chắn muốn xóa phòng này?"
      itemName={room.name}
      isLoading={isDeleting}
      confirmText="Xóa phòng"
      cancelText="Hủy"
    />
    </>
  )
}

export default RoomCard
