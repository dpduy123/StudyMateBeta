'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export function PricingSection() {
  const [activeTab, setActiveTab] = useState('B2C')
  
  const b2cPlans = [
    {
      name: 'Basic',
      price: 'Miễn phí',
      period: '',
      description: 'Hoàn hảo cho sinh viên mới bắt đầu + Quảng cáo',
      icon: SparklesIcon,
      color: 'gray',
      popular: false,
      features: [
        '5 lượt match mỗi ngày',
        '5 phòng học nhóm mỗi ngày',
        'Chat cơ bản với bạn đã match',
        'Hồ sơ học thuật cơ bản',
        'Thông báo email',
        'Banner quảng cáo (45k CPM)',
        'Native ads trong feed',
        'Hỗ trợ cộng đồng'
      ]
    },
    {
      name: 'Premium',
      price: '79.000đ',
      period: '/tháng',
      description: 'Dành cho sinh viên muốn tối ưu trải nghiệm',
      icon: StarIcon,
      color: 'primary',
      popular: true,
      features: [
        'Unlimited matches',
        'Unlimited phòng học nhóm',
        'Bộ lọc nâng cao',
        'Chat + Voice/Video calls',
        'Chia sẻ file không giới hạn',
        'Priority matching',
        'Không quảng cáo',
        'Thống kê học tập',
        'Hỗ trợ ưu tiên'
      ]
    },
    {
      name: 'Elite',
      price: '149.000đ',
      period: '/tháng',
      description: 'Cho những người muốn phát triển toàn diện',
      icon: TrophyIcon,
      color: 'accent',
      popular: false,
      features: [
        'Tất cả tính năng Premium',
        'AI Tutor Access 24/7',
        'Exclusive Events & Workshops',
        'Career Mentoring',
        'Networking với Alumni',
        'Profile boost',
        'Advanced analytics',
        'Dedicated support'
      ]
    }
  ]

  const b2bPlans = [
    {
      name: 'Partnership',
      price: '289 triệu',
      period: '/năm',
      description: 'Phí thường niên cho trường ĐH (2027: 10 trường, 2028: 20 trường)',
      icon: BuildingOfficeIcon,
      color: 'blue',
      popular: false,
      features: [
        'StudyMate portal với domain riêng (studymate.hust.edu.vn)',
        'SSO tích hợp với hệ thống sinh viên hiện có',
        'AI matching trong nội bộ trường + liên trường',
        'Video rooms cho lớp học trực tuyến (up to 100 users)',
        'Analytics Dashboard (+10 triệu/năm)',
        'Custom branding (logo, màu sắc trường)',
        'API webhooks gửi data về LMS hiện tại',
        'Training và deployment support'
      ]
    },
    {
      name: 'Ecosystem',
      price: '250.000đ',
      period: '/đăng ký',
      description: 'B2B2C cho doanh nghiệp (2027: 50 DN, 2028: 80 DN)',
      icon: GlobeAltIcon,
      color: 'purple',
      popular: true,
      features: [
        'Phí đăng ký doanh nghiệp một lần: 250k',
        'Affiliates revenue: 7% + 25k/giao dịch',
        'Không gian hội họp ảo cho nhân viên',
        'Khóa học nội bộ và training',
        'Cross-company networking events',
        'Corporate study groups',
        'Employee skill matching',
        'Analytics cho HR và Learning & Development'
      ]
    }
  ]

  const getColorClasses = (color: string, popular: boolean) => {
    if (popular) {
      return {
        card: 'border-2 border-primary-500 bg-white relative md:transform md:scale-105',
        button: 'btn-primary w-full',
        icon: 'text-primary-500 bg-primary-100',
        badge: 'bg-primary-500 text-white'
      }
    }

    const colors = {
      gray: {
        card: 'border border-gray-200 bg-white',
        button: 'btn-secondary w-full',
        icon: 'text-gray-500 bg-gray-100',
        badge: 'bg-gray-500 text-white'
      },
      primary: {
        card: 'border border-primary-200 bg-white',
        button: 'btn-primary w-full',
        icon: 'text-primary-500 bg-primary-100',
        badge: 'bg-primary-500 text-white'
      },
      accent: {
        card: 'border border-accent-200 bg-white',
        button: 'btn-accent w-full',
        icon: 'text-accent-500 bg-accent-100',
        badge: 'bg-accent-500 text-white'
      },
      blue: {
        card: 'border border-blue-200 bg-white',
        button: 'bg-blue-600 hover:bg-blue-700 text-white w-full rounded-xl px-6 py-3 font-semibold transition-colors',
        icon: 'text-blue-500 bg-blue-100',
        badge: 'bg-blue-500 text-white'
      },
      purple: {
        card: 'border border-purple-200 bg-white',
        button: 'bg-purple-600 hover:bg-purple-700 text-white w-full rounded-xl px-6 py-3 font-semibold transition-colors',
        icon: 'text-purple-500 bg-purple-100',
        badge: 'bg-purple-500 text-white'
      }
    }

    return colors[color as keyof typeof colors] || colors.gray
  }

  const currentPlans = activeTab === 'B2C' ? b2cPlans : b2bPlans

  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
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
            Đề xuất kinh doanh
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-responsive-base text-gray-600 mb-8"
          >
            Tìm hiểu các mô hình kinh doanh phù hợp với StudyMate
          </motion.p>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center mb-8"
          >
            <div className="bg-white rounded-xl p-1 shadow-lg border border-gray-200">
              <button
                onClick={() => setActiveTab('B2C')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'B2C'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                B2C Freemium
              </button>
              <button
                onClick={() => setActiveTab('B2B')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'B2B'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                B2B Partnership & B2B2C Ecosystem
              </button>
            </div>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className={`grid gap-8 lg:gap-8 ${activeTab === 'B2C' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'}`}>
          {currentPlans.map((plan, index) => {
            const colorClasses = getColorClasses(plan.color, plan.popular)

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${colorClasses.card}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${colorClasses.badge}`}>
                      Phổ biến nhất
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colorClasses.icon} mb-4`}>
                    <plan.icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {plan.description}
                  </p>

                  <div className="flex items-end justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-600 ml-1">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className={colorClasses.button}>
                  {activeTab === 'B2C' 
                    ? (plan.name === 'Basic' ? 'Bắt đầu miễn phí' : `Chọn ${plan.name}`)
                    : (plan.name === 'Partnership' ? 'Liên hệ hợp tác' : 'Tìm hiểu thêm')
                  }
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {activeTab === 'B2C' ? 'Câu hỏi thường gặp' : 'Thông tin hợp tác'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {activeTab === 'B2C' ? (
                <>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Tại sao Basic miễn phí?
                    </h4>
                    <p className="text-gray-600">
                      Thu nhập từ quảng cáo: Banner CPM 45k, Native Ads 45k CPM, Sponsored Content 5M CPD.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Có thể hủy gói trả phí không?
                    </h4>
                    <p className="text-gray-600">
                      Có, bạn có thể hủy bất cứ lúc nào và vẫn sử dụng được đến hết chu kỳ thanh toán.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Quảng cáo có làm phiền không?
                    </h4>
                    <p className="text-gray-600">
                      Quảng cáo được tối ưu cho sinh viên: sách, khóa học, việc làm. Premium/Elite không có ads.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Conversion rate từ Basic lên Premium?
                    </h4>
                    <p className="text-gray-600">
                      Giả định 15% user đăng nhập tham gia 3+ rooms sẽ nâng cấp lên Premium (79k/tháng).
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Partnership 289 triệu/năm bao gồm gì?
                    </h4>
                    <p className="text-gray-600">
                      Unlimited users cho 1 trường ĐH. Analytics Dashboard riêng +10M/năm. Target: 10 trường 2027, 20 trường 2028.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      B2B2C Ecosystem kiếm tiền thế nào?
                    </h4>
                    <p className="text-gray-600">
                      Phí đăng ký DN: 250k. Affiliates: 7% + 25k/transaction từ không gian hội họp, khóa học.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Target market B2B2C?
                    </h4>
                    <p className="text-gray-600">
                      2027: 50 doanh nghiệp. 2028: 80 doanh nghiệp. Focus: banking, tech, consulting firms.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      ROI cho doanh nghiệp như thế nào?
                    </h4>
                    <p className="text-gray-600">
                      Employee retention tăng 20%, training cost giảm 30% nhờ peer-to-peer learning.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}