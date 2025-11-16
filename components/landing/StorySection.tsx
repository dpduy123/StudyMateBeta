'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HeartIcon, 
  LightBulbIcon, 
  UsersIcon, 
  SparklesIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ChartBarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export function StorySection() {
  const [activeTab, setActiveTab] = useState<'students' | 'business'>('students')

  const studentValues = [
    {
      icon: HeartIcon,
      title: 'Không ai nên học một mình',
      story: 'Mỗi đêm, hàng nghìn sinh viên thức khuya với những bài tập khó, cảm thấy cô đơn và bế tắc. Họ không thiếu động lực, họ chỉ thiếu một người đồng hành.',
      impact: 'StudyMate tin rằng học tập là hành trình tập thể, nơi mỗi câu hỏi được chia sẻ đều mở ra cơ hội kết nối và cùng nhau tiến bộ.'
    },
    {
      icon: LightBulbIcon,
      title: 'Tri thức phát triển qua chia sẻ',
      story: 'Khi bạn giải thích một khái niệm cho người khác, bạn hiểu nó sâu sắc hơn. Khi bạn nhận được góc nhìn mới, bạn mở rộng tư duy.',
      impact: 'Chúng tôi xây dựng không gian nơi việc dạy và học hòa quyện, nơi mỗi sinh viên vừa là người học, vừa là người truyền cảm hứng.'
    },
    {
      icon: UsersIcon,
      title: 'Cộng đồng tạo nên sức mạnh',
      story: 'Thành công của một sinh viên không chỉ đến từ điểm số, mà từ những mối quan hệ được xây dựng, những kỹ năng hợp tác được rèn luyện.',
      impact: 'StudyMate kết nối những tâm hồn cùng chí hướng, biến những người xa lạ thành đồng đội, và những thử thách thành cơ hội phát triển.'
    },
    {
      icon: SparklesIcon,
      title: 'Công nghệ phục vụ con người',
      story: 'AI không thay thế con người, mà giúp con người tìm thấy nhau dễ dàng hơn. Thuật toán không tạo ra kết nối, mà loại bỏ rào cản để kết nối xảy ra.',
      impact: 'Chúng tôi sử dụng công nghệ để mang lại điều đơn giản nhất nhưng quý giá nhất: cơ hội được học cùng đúng người, đúng thời điểm.'
    }
  ]

  const businessValues = [
    {
      icon: AcademicCapIcon,
      title: 'Giáo dục cần đổi mới',
      story: 'Các trường đại học đang đối mặt với thách thức: sinh viên học online cảm thấy cô lập, tỷ lệ bỏ học tăng, và sự gắn kết với trường giảm sút.',
      impact: 'StudyMate giúp các trường xây dựng cộng đồng học tập số, nơi sinh viên kết nối với nhau bất kể khoảng cách, tăng retention và nâng cao trải nghiệm học tập.'
    },
    {
      icon: BuildingOfficeIcon,
      title: 'Doanh nghiệp cần nhân tài',
      story: 'Các công ty đầu tư hàng tỷ đồng vào đào tạo nhân viên, nhưng kiến thức thường bị quên đi nhanh chóng vì thiếu môi trường thực hành và chia sẻ.',
      impact: 'Với StudyMate, doanh nghiệp tạo ra văn hóa học tập liên tục, nơi nhân viên học từ đồng nghiệp, chia sẻ kinh nghiệm và phát triển kỹ năng thực tế.'
    },
    {
      icon: ChartBarIcon,
      title: 'ROI từ con người',
      story: 'Nghiên cứu cho thấy nhân viên gắn kết với cộng đồng làm việc năng suất hơn 21%, ở lại công ty lâu hơn 59%, và sáng tạo hơn 3 lần.',
      impact: 'StudyMate không chỉ là nền tảng học tập, mà là công cụ xây dựng văn hóa doanh nghiệp, giảm chi phí tuyển dụng và tăng hiệu quả đào tạo.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Hệ sinh thái kết nối',
      story: 'Khoảng cách giữa nhà trường và doanh nghiệp đang ngày càng lớn. Sinh viên ra trường thiếu kỹ năng thực tế, doanh nghiệp khó tìm nhân tài phù hợp.',
      impact: 'StudyMate là cầu nối giữa giáo dục và doanh nghiệp, nơi sinh viên tiếp cận cơ hội thực tế, và doanh nghiệp tìm được tài năng trẻ từ sớm.'
    }
  ]

  const values = activeTab === 'students' ? studentValues : businessValues

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-white via-primary-50/30 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-responsive-xl font-bold text-gray-900 mb-6">
            Tại sao StudyMate tồn tại?
          </h2>
          <p className="mx-auto max-w-3xl text-responsive-base text-gray-600 leading-relaxed mb-8">
            Chúng tôi không chỉ xây dựng một ứng dụng. Chúng tôi đang tạo ra một phong trào,
            nơi học tập trở thành trải nghiệm kết nối và phát triển.
          </p>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="bg-white rounded-xl p-1 shadow-lg border border-gray-200 inline-flex">
              <button
                onClick={() => setActiveTab('students')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'students'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dành cho Sinh viên
              </button>
              <button
                onClick={() => setActiveTab('business')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'business'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dành cho Doanh nghiệp
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-100 text-primary-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="h-7 w-7" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>

                {/* Story */}
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {value.story}
                </p>

                {/* Impact */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-primary-700 font-medium leading-relaxed">
                    {value.impact}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 lg:mt-20 text-center"
        >
          <div className="mx-auto max-w-3xl bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 lg:p-12 text-white shadow-xl">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              {activeTab === 'students' ? 'Xã hội cần StudyMate' : 'Tương lai của giáo dục và doanh nghiệp'}
            </h3>
            <p className="text-lg leading-relaxed opacity-95">
              {activeTab === 'students' 
                ? 'Bởi vì giáo dục không chỉ là việc truyền đạt kiến thức, mà là việc xây dựng con người. Bởi vì thế hệ sinh viên hôm nay không chỉ cần bằng cấp, mà cần kỹ năng hợp tác, khả năng kết nối và tinh thần cộng đồng. StudyMate là cầu nối giữa học thuật và nhân văn, giữa công nghệ và tình người.'
                : 'Trong thời đại số, thành công không đến từ việc làm việc đơn lẻ mà từ sức mạnh cộng đồng. StudyMate kết nối nhà trường, doanh nghiệp và sinh viên trong một hệ sinh thái học tập liên tục, nơi tri thức được chia sẻ, tài năng được phát triển, và tương lai được xây dựng cùng nhau.'
              }
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
