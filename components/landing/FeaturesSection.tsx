'use client'

import { motion } from 'framer-motion'
import {
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  TrophyIcon,
  ShieldCheckIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

export function FeaturesSection() {
  const features = [
    {
      icon: SparklesIcon,
      title: 'AI Matching thông minh',
      description: 'Thuật toán AI phân tích hồ sơ học thuật của bạn để gợi ý những người bạn học phù hợp nhất dựa trên môn học, sở thích và mục tiêu.',
      color: 'primary'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Tin nhắn thời gian thực',
      description: 'Chat trực tiếp với bạn học, chia sẻ tài liệu, ghi chú và hỗ trợ lẫn nhau trong quá trình học tập một cách hiệu quả.',
      color: 'accent'
    },
    {
      icon: VideoCameraIcon,
      title: 'Phòng học trực tuyến',
      description: 'Tham gia các phòng voice/video chat với chủ đề học thuật, thảo luận nhóm và học tập cùng nhau một cách sinh động.',
      color: 'green'
    },
    {
      icon: TrophyIcon,
      title: 'Hệ thống thành tích',
      description: 'Nhận badge, xếp hạng và tích điểm thông qua hoạt động học tập. Tạo động lực và cạnh tranh lành mạnh trong cộng đồng.',
      color: 'yellow'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Xác thực .edu an toàn',
      description: 'Chỉ sinh viên có email .edu mới được tham gia, đảm bảo môi trường học thuật an toàn và đáng tin cậy 100%.',
      color: 'primary'
    },
    {
      icon: AcademicCapIcon,
      title: 'Cộng đồng chuyên nghiệp',
      description: 'Kết nối với sinh viên cùng trường, cùng ngành và xây dựng mạng lưới quan hệ học thuật lâu dài.',
      color: 'accent'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      primary: 'text-primary-500 bg-primary-50',
      accent: 'text-accent-500 bg-accent-50',
      green: 'text-green-500 bg-green-50',
      yellow: 'text-yellow-500 bg-yellow-50'
    }
    return colors[color as keyof typeof colors] || colors.primary
  }

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-responsive-xl font-bold text-gray-900 mb-4"
          >
            Tính năng nổi bật
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-responsive-base text-gray-600"
          >
            StudyMate tích hợp những tính năng tiên tiến nhất để tạo ra
            trải nghiệm học tập tuyệt vời cho sinh viên
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card card-hover p-6 group"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${getColorClasses(feature.color)} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="h-6 w-6" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-primary-500 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Sẵn sàng kết nối và học tập?
            </h3>
            <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">
              Tham gia cộng đồng hơn 10,000+ sinh viên đang sử dụng StudyMate
              để nâng cao hiệu quả học tập
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 hover:bg-gray-50 font-semibold px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105">
                Khám phá ngay
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105">
                Xem demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}