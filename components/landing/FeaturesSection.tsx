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
import { useTranslation } from '@/lib/i18n/context'

export function FeaturesSection() {
  const { t } = useTranslation()

  const features = [
    {
      icon: SparklesIcon,
      title: t('landing.features.aiMatching.title'),
      description: t('landing.features.aiMatching.description'),
      color: 'primary'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: t('landing.features.realTimeChat.title'),
      description: t('landing.features.realTimeChat.description'),
      color: 'accent'
    },
    {
      icon: VideoCameraIcon,
      title: t('landing.features.studyRooms.title'),
      description: t('landing.features.studyRooms.description'),
      color: 'green'
    },
    {
      icon: TrophyIcon,
      title: t('landing.features.achievements.title'),
      description: t('landing.features.achievements.description'),
      color: 'yellow'
    },
    {
      icon: ShieldCheckIcon,
      title: t('landing.features.eduVerification.title'),
      description: t('landing.features.eduVerification.description'),
      color: 'primary'
    },
    {
      icon: AcademicCapIcon,
      title: t('landing.features.community.title'),
      description: t('landing.features.community.description'),
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
            {t('landing.features.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-responsive-base text-gray-600"
          >
            {t('landing.features.subtitle')}
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

        
      </div>
    </section>
  )
}