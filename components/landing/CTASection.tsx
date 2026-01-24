'use client'

import { motion } from 'framer-motion'
import {
  SparklesIcon,
  ArrowRightIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from '@/lib/i18n/context'

export function CTASection() {
  const { t } = useTranslation()

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-primary-500 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
              <SparklesIcon className="h-4 w-4" />
              <span>{t('landing.cta.freeToStart')}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t('landing.cta.title')}
              <br />
              <span className="text-yellow-300">{t('landing.cta.titleHighlight')}</span>
            </h2>

            <p className="mx-auto max-w-3xl text-xl text-white/90 mb-10 leading-relaxed">
              {t('landing.cta.subtitle')}
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {[
              { icon: UserGroupIcon, value: '10,000+', label: t('landing.cta.stats.activeStudents') },
              { icon: AcademicCapIcon, value: '50+', label: t('landing.cta.stats.universities') },
              { icon: SparklesIcon, value: '50,000+', label: t('landing.cta.stats.successfulMatches') },
              { icon: SparklesIcon, value: '95%', label: t('landing.cta.stats.satisfaction') }
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-yellow-300" />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <button className="group bg-white text-primary-600 hover:bg-gray-50 font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-xl inline-flex items-center">
              {t('landing.cta.signUpNow')}
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105">
              {t('landing.cta.watchDemo')}
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-white/80 text-sm mb-4">
              {t('landing.cta.trustedBy')}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              {[
                'Hanoi University of Science and Technology',
                'National Economics University',
                'VNU University of Engineering and Technology',
                'VNU University of Science'
              ].map((university, index) => (
                <div key={index} className="text-white/70 text-sm font-medium">
                  {university}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Additional Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              title: t('landing.cta.highlights.aiMatching.title'),
              description: t('landing.cta.highlights.aiMatching.description')
            },
            {
              title: t('landing.cta.highlights.safe.title'),
              description: t('landing.cta.highlights.safe.description')
            },
            {
              title: t('landing.cta.highlights.free.title'),
              description: t('landing.cta.highlights.free.description')
            }
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/80">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}