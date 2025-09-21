'use client'

import { motion } from 'framer-motion'
import {
  CheckIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

export function PricingSection() {
  const plans = [
    {
      name: 'Basic',
      price: 'Miễn phí',
      period: '',
      description: 'Hoàn hảo cho sinh viên mới bắt đầu',
      icon: SparklesIcon,
      color: 'gray',
      popular: false,
      features: [
        '5 lượt match mỗi ngày',
        '5 phòng học nhóm mỗi ngày',
        'Chat cơ bản với bạn đã match',
        'Hồ sơ học thuật cơ bản',
        'Thông báo email',
        'Hỗ trợ cộng đồng'
      ]
    },
    {
      name: 'Premium',
      price: '79.000 VNĐ',
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
        'Thống kê học tập',
        'Hỗ trợ ưu tiên'
      ]
    },
    {
      name: 'Elite',
      price: '149.000 VNĐ',
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

  const getColorClasses = (color: string, popular: boolean) => {
    if (popular) {
      return {
        card: 'border-2 border-primary-500 bg-white relative transform scale-105',
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
      }
    }

    return colors[color as keyof typeof colors] || colors.gray
  }

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
            Chọn gói phù hợp với bạn
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-responsive-base text-gray-600"
          >
            Bắt đầu miễn phí và nâng cấp khi bạn muốn trải nghiệm
            nhiều tính năng hơn
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8">
          {plans.map((plan, index) => {
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
                  {plan.name === 'Basic' ? 'Bắt đầu miễn phí' : `Chọn ${plan.name}`}
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
              Các câu hỏi thường gặp
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
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
                  Có hỗ trợ sinh viên quốc tế không?
                </h4>
                <p className="text-gray-600">
                  Hiện tại chúng tôi chỉ hỗ trợ email .edu của các trường tại Việt Nam.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Thanh toán có an toàn không?
                </h4>
                <p className="text-gray-600">
                  Tất cả thanh toán được mã hóa và xử lý qua các cổng thanh toán uy tín.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Có thể nâng cấp gói sau không?
                </h4>
                <p className="text-gray-600">
                  Có, bạn có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào trong tài khoản.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}