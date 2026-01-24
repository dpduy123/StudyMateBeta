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
import { useTranslation } from '@/lib/i18n/context'

export function PricingSection() {
  const { t, tArray } = useTranslation()
  const [activeTab, setActiveTab] = useState('B2C')

  const b2cPlans = [
    {
      name: t('landing.pricing.basic.name'),
      price: t('landing.pricing.basic.price'),
      period: '',
      description: t('landing.pricing.basic.description'),
      icon: SparklesIcon,
      color: 'gray',
      popular: false,
      features: tArray('landing.pricing.basic.features'),
      cta: t('landing.pricing.basic.cta')
    },
    {
      name: t('landing.pricing.premium.name'),
      price: t('landing.pricing.premium.price'),
      period: t('landing.pricing.premium.period'),
      description: t('landing.pricing.premium.description'),
      icon: StarIcon,
      color: 'primary',
      popular: true,
      features: tArray('landing.pricing.premium.features'),
      cta: t('landing.pricing.premium.cta')
    },
    {
      name: t('landing.pricing.elite.name'),
      price: t('landing.pricing.elite.price'),
      period: t('landing.pricing.elite.period'),
      description: t('landing.pricing.elite.description'),
      icon: TrophyIcon,
      color: 'accent',
      popular: false,
      features: tArray('landing.pricing.elite.features'),
      cta: t('landing.pricing.elite.cta')
    }
  ]

  const b2bPlans = [
    {
      name: t('landing.pricing.partnership.name'),
      price: t('landing.pricing.partnership.price'),
      period: t('landing.pricing.partnership.period'),
      description: t('landing.pricing.partnership.description'),
      icon: BuildingOfficeIcon,
      color: 'blue',
      popular: false,
      features: tArray('landing.pricing.partnership.features'),
      cta: t('landing.pricing.partnership.cta')
    },
    {
      name: t('landing.pricing.ecosystem.name'),
      price: t('landing.pricing.ecosystem.price'),
      period: t('landing.pricing.ecosystem.period'),
      description: t('landing.pricing.ecosystem.description'),
      icon: GlobeAltIcon,
      color: 'purple',
      popular: true,
      features: tArray('landing.pricing.ecosystem.features'),
      cta: t('landing.pricing.ecosystem.cta')
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
            {t('landing.pricing.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-responsive-base text-gray-600 mb-8"
          >
            {t('landing.pricing.subtitle')}
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
                {t('landing.pricing.b2cFreemium')}
              </button>
              <button
                onClick={() => setActiveTab('B2B')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'B2B'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('landing.pricing.b2bPartnership')}
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
                      {t('landing.pricing.mostPopular')}
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
                  {plan.cta}
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
              {activeTab === 'B2C' ? t('landing.pricing.faq.title') : t('landing.pricing.faq.partnerInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {activeTab === 'B2C' ? (
                <>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t('landing.pricing.faq.whyFree')}
                    </h4>
                    <p className="text-gray-600">
                      {t('landing.pricing.faq.whyFreeAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t('landing.pricing.faq.canCancel')}
                    </h4>
                    <p className="text-gray-600">
                      {t('landing.pricing.faq.canCancelAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t('landing.pricing.faq.adsAnnoying')}
                    </h4>
                    <p className="text-gray-600">
                      {t('landing.pricing.faq.adsAnnoyingAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t('landing.pricing.faq.conversionRate')}
                    </h4>
                    <p className="text-gray-600">
                      {t('landing.pricing.faq.conversionRateAnswer')}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t('landing.pricing.faq.partnershipIncludes')}
                    </h4>
                    <p className="text-gray-600">
                      {t('landing.pricing.faq.partnershipIncludesAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t('landing.pricing.faq.b2b2cRevenue')}
                    </h4>
                    <p className="text-gray-600">
                      {t('landing.pricing.faq.b2b2cRevenueAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t('landing.pricing.faq.b2b2cTarget')}
                    </h4>
                    <p className="text-gray-600">
                      {t('landing.pricing.faq.b2b2cTargetAnswer')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t('landing.pricing.faq.b2bROI')}
                    </h4>
                    <p className="text-gray-600">
                      {t('landing.pricing.faq.b2bROIAnswer')}
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