import { motion } from 'framer-motion'
import {
  AcademicCapIcon,
  UserIcon,
  BookOpenIcon,
  ClockIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  LanguageIcon
} from '@heroicons/react/24/outline'

// Step 2: Bio/Introduction
export const Step2Bio = ({ formData, handleInputChange }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="text-center mb-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
      >
        <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Giới thiệu bản thân
      </h2>
      <p className="text-gray-600">
        Chia sẻ về bản thân để mọi người hiểu bạn hơn
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Giới thiệu về bạn (tùy chọn)
      </label>
      <textarea
        name="bio"
        value={formData.bio}
        onChange={handleInputChange}
        rows={6}
        placeholder="Viết vài dòng về bản thân, sở thích, điều bạn đam mê, hoặc điều bạn muốn chia sẻ với mọi người..."
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
      />
      <p className="mt-2 text-xs text-gray-500">
        💡 Tip: Một giới thiệu thú vị giúp bạn dễ dàng kết nối với người khác hơn
      </p>
    </div>
  </motion.div>
)

// Step 3: Study Goals
export const Step3Goals = ({ formData, handleInputChange }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="text-center mb-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
      >
        <SparklesIcon className="h-8 w-8 text-white" />
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Mục tiêu học tập
      </h2>
      <p className="text-gray-600">
        Bạn muốn đạt được điều gì trong học tập?
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Mục tiêu của bạn (phân cách bằng dấu phẩy)
      </label>
      <textarea
        name="studyGoals"
        value={formData.studyGoals}
        onChange={handleInputChange}
        rows={5}
        placeholder="Ví dụ: Cải thiện điểm số, Chuẩn bị thi IELTS, Học thêm kỹ năng lập trình, Tìm bạn học nhóm"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
      />
      <p className="mt-2 text-xs text-gray-500">
        💡 Tip: Mục tiêu rõ ràng giúp bạn tìm được những người bạn học phù hợp
      </p>
    </div>
  </motion.div>
)

// Step 5: Skills
export const Step5Skills = ({ formData, toggleSkill, SKILLS }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="text-center mb-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
      >
        <UserIcon className="h-8 w-8 text-white" />
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Kỹ năng của bạn
      </h2>
      <p className="text-gray-600">
        Những kỹ năng bạn có hoặc đang học (tùy chọn)
      </p>
    </div>

    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">Chọn kỹ năng</label>
        <span className="text-xs text-green-600 font-medium">{formData.skills.length} đã chọn</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SKILLS.map((skill: string, index: number) => (
          <motion.button
            key={skill}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            type="button"
            onClick={() => toggleSkill(skill)}
            className={`px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm ${
              formData.skills.includes(skill)
                ? 'border-green-500 bg-green-50 text-green-700 shadow-md scale-105'
                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
            }`}
          >
            {skill}
          </motion.button>
        ))}
      </div>
    </div>
  </motion.div>
)

// Step 6: Languages
export const Step6Languages = ({ formData, toggleLanguage, LANGUAGES }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="text-center mb-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
      >
        <LanguageIcon className="h-8 w-8 text-white" />
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Ngôn ngữ
      </h2>
      <p className="text-gray-600">
        Những ngôn ngữ bạn biết hoặc đang học (tùy chọn)
      </p>
    </div>

    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">Chọn ngôn ngữ</label>
        <span className="text-xs text-indigo-600 font-medium">{formData.languages.length} đã chọn</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LANGUAGES.map((language: any, index: number) => (
          <motion.button
            key={language.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            type="button"
            onClick={() => toggleLanguage(language.value)}
            className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
              formData.languages.includes(language.value)
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md scale-105'
                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            {language.label}
          </motion.button>
        ))}
      </div>
    </div>
  </motion.div>
)
