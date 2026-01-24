'use client'

import { motion } from 'framer-motion'
import {
  UserPlusIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from '@/lib/i18n/context'

export function HowItWorksSection() {
  const { t, tArray } = useTranslation()

  const steps = [
    {
      step: '01',
      icon: UserPlusIcon,
      title: t('landing.howItWorks.step1.title'),
      description: t('landing.howItWorks.step1.description'),
      features: tArray('landing.howItWorks.step1.features')
    },
    {
      step: '02',
      icon: SparklesIcon,
      title: t('landing.howItWorks.step2.title'),
      description: t('landing.howItWorks.step2.description'),
      features: tArray('landing.howItWorks.step2.features')
    },
    {
      step: '03',
      icon: ChatBubbleLeftRightIcon,
      title: t('landing.howItWorks.step3.title'),
      description: t('landing.howItWorks.step3.description'),
      features: tArray('landing.howItWorks.step3.features')
    },
    {
      step: '04',
      icon: TrophyIcon,
      title: t('landing.howItWorks.step4.title'),
      description: t('landing.howItWorks.step4.description'),
      features: tArray('landing.howItWorks.step4.features')
    }
  ]

  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-white">
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
            {t('landing.howItWorks.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-responsive-base text-gray-600"
          >
            {t('landing.howItWorks.subtitle')}
          </motion.p>
        </div>

        {/* Steps */}
        <div className="space-y-16 lg:space-y-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-8 lg:gap-16`}
            >
              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full font-bold text-lg mb-6">
                  {step.step}
                </div>

                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {step.description}
                </p>

                <ul className="space-y-3">
                  {step.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center justify-center lg:justify-start space-x-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div className="flex-1 relative">
                <div className="relative w-full max-w-md mx-auto">
                  {/* Main Card */}
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-50 rounded-2xl shadow-lg mb-6">
                        <step.icon className="h-10 w-10 text-primary-500" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h4>
                      <p className="text-gray-600">
                        {t('landing.howItWorks.step')} {step.step}
                      </p>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-accent-200 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-green-200 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1/2 -right-6 w-4 h-4 bg-yellow-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -bottom-32 left-1/2 transform -translate-x-1/2">
                      <div className="w-0.5 h-16 bg-primary-200"></div>
                      <div className="w-3 h-3 bg-primary-400 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-6 py-3 rounded-full font-medium mb-6">
            <TrophyIcon className="h-5 w-5" />
            <span>{t('landing.howItWorks.freeForStudents')}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {t('landing.howItWorks.startToday')}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {t('landing.howItWorks.joinThousands')}
          </p>
          <button className="btn-primary text-lg px-8 py-4">
            {t('landing.howItWorks.signUpFree')}
          </button>
        </motion.div>
      </div>
    </section>
  )
}