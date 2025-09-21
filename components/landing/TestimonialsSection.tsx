'use client'

import { motion } from 'framer-motion'
import {
  StarIcon
} from '@heroicons/react/24/solid'

// Custom Quote Icon component
const QuoteIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
  </svg>
)
import {
  AcademicCapIcon,
  UserGroupIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Nguyễn Minh Anh',
      role: 'Sinh viên năm 3',
      university: 'Đại học Bách khoa Hà Nội',
      avatar: '/avatars/student1.jpg',
      rating: 5,
      content: 'StudyMate đã giúp mình tìm được nhóm học Data Structures tuyệt vời! AI matching thực sự chính xác, những bạn được gợi ý đều có cùng mục tiêu và level học tập. Giờ nhóm mình học đều đặn mỗi tuần và tiến bộ rất nhiều.',
      subject: 'Computer Science'
    },
    {
      name: 'Trần Thị Hương',
      role: 'Sinh viên năm 2',
      university: 'Đại học Kinh tế Quốc dân',
      avatar: '/avatars/student2.jpg',
      rating: 5,
      content: 'Tính năng voice chat rooms quá tiện! Mình thường tham gia room &ldquo;Marketing Discussion&rdquo; vào buổi tối để thảo luận case study với các bạn khác khoa. Môi trường rất friendly và học được nhiều từ các bạn.',
      subject: 'Marketing'
    },
    {
      name: 'Lê Văn Đức',
      role: 'Sinh viên năm 4',
      university: 'Đại học Công nghệ',
      avatar: '/avatars/student3.jpg',
      rating: 5,
      content: 'Badge system của StudyMate tạo động lực học tập cực kỳ tích cực. Mình đã earn được &ldquo;Network Pro&rdquo; sau khi match với 10 bạn và giờ đang hướng đến &ldquo;Study Influencer&rdquo;. Cảm giác achievement rất thú vị!',
      subject: 'Software Engineering'
    },
    {
      name: 'Phạm Thị Lan',
      role: 'Sinh viên năm 1',
      university: 'Đại học Khoa học Tự nhiên',
      avatar: '/avatars/student4.jpg',
      rating: 5,
      content: 'Là sinh viên năm nhất, mình rất lo lắng về việc kết bạn và học nhóm. StudyMate đã giải quyết hoàn toàn vấn đề này! Các bạn match đều rất nice và sẵn sàng giúp đỡ. Cảm ơn team đã tạo ra platform tuyệt vời này.',
      subject: 'Biology'
    }
  ]

  const stats = [
    {
      icon: UserGroupIcon,
      value: '95%',
      label: 'Sinh viên hài lòng'
    },
    {
      icon: AcademicCapIcon,
      value: '80%',
      label: 'Cải thiện điểm số'
    },
    {
      icon: TrophyIcon,
      value: '10,000+',
      label: 'Match thành công'
    }
  ]

  return (
    <section id="testimonials" className="py-16 sm:py-20 lg:py-24 bg-white">
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
            Sinh viên nói gì về StudyMate
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-responsive-base text-gray-600"
          >
            Hàng nghìn sinh viên đã trải nghiệm và đạt được kết quả học tập tuyệt vời
            cùng StudyMate
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl mb-4">
                <stat.icon className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card p-6 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4">
                <QuoteIcon className="h-8 w-8 text-primary-200" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} - {testimonial.university}
                  </div>
                  <div className="inline-block bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium mt-1">
                    {testimonial.subject}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Bạn cũng muốn có trải nghiệm tương tự?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Tham gia cộng đồng StudyMate ngay hôm nay và bắt đầu kết nối
              với những người bạn học tuyệt vời
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary text-lg px-8 py-4">
                Đăng ký miễn phí
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                Xem thêm đánh giá
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}