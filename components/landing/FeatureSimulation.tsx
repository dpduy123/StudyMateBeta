'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    SparklesIcon,
    HeartIcon,
    XMarkIcon,
    ChatBubbleLeftRightIcon,
    VideoCameraIcon,
    TrophyIcon,
    PaperAirplaneIcon,
    UserGroupIcon,
    StarIcon,
    CheckIcon,
    LightBulbIcon
} from '@heroicons/react/24/outline'

type SimulationType = 'matching' | 'chat' | 'rooms' | 'achievements' | 'verification'

interface FeatureValue {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    benefits: string[]
}

export function FeatureSimulation() {
    const [activeSimulation, setActiveSimulation] = useState<SimulationType>('matching')

    const simulations = [
        { id: 'matching' as SimulationType, name: 'AI Matching', icon: SparklesIcon },
        { id: 'chat' as SimulationType, name: 'Chat Real-time', icon: ChatBubbleLeftRightIcon },
        { id: 'rooms' as SimulationType, name: 'Phòng học', icon: VideoCameraIcon },
        { id: 'achievements' as SimulationType, name: 'Thành tích', icon: TrophyIcon },
        { id: 'verification' as SimulationType, name: 'Xác thực .edu', icon: CheckIcon }
    ]

    const featureValues: Record<SimulationType, FeatureValue> = {
        matching: {
            icon: SparklesIcon,
            title: 'Tìm đúng người, đúng thời điểm',
            description: 'AI phân tích hồ sơ học thuật, sở thích và mục tiêu của bạn để gợi ý những người bạn học tương thích nhất. Không còn lãng phí thời gian với những kết nối không phù hợp.',
            benefits: [
                'Tiết kiệm 80% thời gian tìm kiếm bạn học',
                'Tỷ lệ match thành công cao hơn 3 lần',
                'Kết nối với người cùng mục tiêu và level',
                'Thuật toán học từ hành vi của bạn'
            ]
        },
        chat: {
            icon: ChatBubbleLeftRightIcon,
            title: 'Kết nối tức thì, không rào cản',
            description: 'Chat real-time với typing indicator, chia sẻ file, hình ảnh và tài liệu học tập. Mọi câu hỏi đều được giải đáp ngay lập tức, không phải chờ đợi.',
            benefits: [
                'Phản hồi trung bình dưới 2 phút',
                'Chia sẻ tài liệu không giới hạn',
                'Lưu trữ lịch sử trò chuyện vĩnh viễn',
                'Thông báo real-time trên mọi thiết bị'
            ]
        },
        rooms: {
            icon: VideoCameraIcon,
            title: 'Học nhóm như gặp mặt trực tiếp',
            description: 'Phòng học video/voice với screen sharing, whiteboard và chat. Tạo không gian học tập tập trung, nơi mọi người cùng tiến bộ.',
            benefits: [
                'Tăng 65% hiệu quả học nhóm',
                'Giảm cảm giác cô đơn khi học online',
                'Chia sẻ màn hình và tài liệu dễ dàng',
                'Ghi lại session để xem lại sau'
            ]
        },
        achievements: {
            icon: TrophyIcon,
            title: 'Động lực học tập mỗi ngày',
            description: 'Hệ thống badges, điểm thưởng và bảng xếp hạng biến việc học thành trò chơi. Mỗi thành tích nhỏ đều được ghi nhận và tôn vinh.',
            benefits: [
                'Tăng 40% thời gian học tập đều đặn',
                'Tạo thói quen học tập lâu dài',
                'Cạnh tranh lành mạnh với bạn bè',
                'Nhận thưởng và ưu đãi đặc biệt'
            ]
        },
        verification: {
            icon: CheckIcon,
            title: 'Môi trường an toàn 100%',
            description: 'Chỉ sinh viên có email .edu được xác thực mới có thể tham gia. Quy trình xác thực tự động và nhanh chóng, đảm bảo cộng đồng học thuật chất lượng cao.',
            benefits: [
                'Xác thực email .edu trong 30 giây',
                'Bảo vệ thông tin cá nhân tuyệt đối',
                'Chặn spam và tài khoản giả mạo',
                'Cộng đồng sinh viên đáng tin cậy'
            ]
        }
    }

    const currentValue = featureValues[activeSimulation]

    return (
        <section className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-responsive-xl font-bold text-gray-900 mb-4">
                        Trải nghiệm thực tế, hiểu giá trị ngay
                    </h2>
                    <p className="mx-auto max-w-2xl text-responsive-base text-gray-600">
                        Đừng chỉ đọc về tính năng. Hãy thử ngay và cảm nhận sự khác biệt.
                    </p>
                </motion.div>

                {/* Tabs */}
                <div className="flex justify-center mb-12 overflow-x-auto pb-2">
                    <div className="inline-flex bg-white rounded-xl p-1 shadow-lg border border-gray-200 space-x-1">
                        {simulations.map((sim) => (
                            <button
                                key={sim.id}
                                onClick={() => setActiveSimulation(sim.id)}
                                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 whitespace-nowrap ${activeSimulation === sim.id
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <sim.icon className="h-5 w-5" />
                                <span className="text-sm">{sim.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Left: Value Explanation */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSimulation}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6"
                        >
                            {/* Icon & Title */}
                            <div>
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl mb-4">
                                    <currentValue.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                    {currentValue.title}
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {currentValue.description}
                                </p>
                            </div>

                            {/* Benefits */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
                                    Giá trị mang lại
                                </h4>
                                <ul className="space-y-3">
                                    {currentValue.benefits.map((benefit, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start space-x-3"
                                        >
                                            <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mt-0.5">
                                                <CheckIcon className="h-4 w-4" />
                                            </div>
                                            <span className="text-gray-700 leading-relaxed">{benefit}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                {activeSimulation === 'matching' && (
                                    <>
                                        <div className="bg-primary-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-primary-600">95%</div>
                                            <div className="text-xs text-gray-600 mt-1">Độ chính xác</div>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-green-600">3x</div>
                                            <div className="text-xs text-gray-600 mt-1">Nhanh hơn</div>
                                        </div>
                                        <div className="bg-yellow-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-yellow-600">10k+</div>
                                            <div className="text-xs text-gray-600 mt-1">Matches</div>
                                        </div>
                                    </>
                                )}
                                {activeSimulation === 'chat' && (
                                    <>
                                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-blue-600">&lt;2m</div>
                                            <div className="text-xs text-gray-600 mt-1">Phản hồi</div>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-green-600">100%</div>
                                            <div className="text-xs text-gray-600 mt-1">Real-time</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-purple-600">∞</div>
                                            <div className="text-xs text-gray-600 mt-1">Lưu trữ</div>
                                        </div>
                                    </>
                                )}
                                {activeSimulation === 'rooms' && (
                                    <>
                                        <div className="bg-red-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-red-600">65%</div>
                                            <div className="text-xs text-gray-600 mt-1">Hiệu quả</div>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-blue-600">HD</div>
                                            <div className="text-xs text-gray-600 mt-1">Video</div>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-green-600">10</div>
                                            <div className="text-xs text-gray-600 mt-1">Người</div>
                                        </div>
                                    </>
                                )}
                                {activeSimulation === 'achievements' && (
                                    <>
                                        <div className="bg-yellow-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-yellow-600">40%</div>
                                            <div className="text-xs text-gray-600 mt-1">Động lực</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-purple-600">50+</div>
                                            <div className="text-xs text-gray-600 mt-1">Badges</div>
                                        </div>
                                        <div className="bg-red-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-red-600">Top</div>
                                            <div className="text-xs text-gray-600 mt-1">Ranking</div>
                                        </div>
                                    </>
                                )}
                                {activeSimulation === 'verification' && (
                                    <>
                                        <div className="bg-green-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-green-600">30s</div>
                                            <div className="text-xs text-gray-600 mt-1">Xác thực</div>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-blue-600">100%</div>
                                            <div className="text-xs text-gray-600 mt-1">An toàn</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-purple-600">0</div>
                                            <div className="text-xs text-gray-600 mt-1">Spam</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Right: Interactive Simulation */}
                    <div className="lg:sticky lg:top-8">
                        <AnimatePresence mode="wait">
                            {activeSimulation === 'matching' && <MatchingSimulation key="matching" />}
                            {activeSimulation === 'chat' && <ChatSimulation key="chat" />}
                            {activeSimulation === 'rooms' && <RoomsSimulation key="rooms" />}
                            {activeSimulation === 'achievements' && <AchievementsSimulation key="achievements" />}
                            {activeSimulation === 'verification' && <VerificationSimulation key="verification" />}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    )
}

// AI Matching Simulation - Already created in previous version
function MatchingSimulation() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState<'left' | 'right' | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({
        major: 'all',
        year: 'all',
        studyTime: 'all'
    })

    const allProfiles = [
        {
            id: 1,
            name: 'Minh Anh',
            avatar: 'MA',
            university: 'ĐH Bách Khoa HN',
            major: 'Khoa học Máy tính',
            year: 3,
            matchScore: 95,
            interests: ['AI', 'Python', 'Research', 'Gaming'],
            skills: ['Machine Learning', 'Deep Learning', 'TensorFlow'],
            studyGoals: ['Trở thành AI Engineer', 'Nghiên cứu NLP'],
            studyTime: 'Tối',
            gpa: 3.8,
            totalMatches: 45,
            bio: 'Đam mê AI và Machine Learning. Tìm bạn cùng nghiên cứu và làm project.',
            languages: ['Tiếng Việt', 'English'],
            isOnline: true
        },
        {
            id: 2,
            name: 'Thị Hương',
            avatar: 'TH',
            university: 'ĐH Kinh tế Quốc dân',
            major: 'Marketing',
            year: 2,
            matchScore: 88,
            interests: ['Social Media', 'Design', 'Content', 'Photography'],
            skills: ['Digital Marketing', 'Content Creation', 'Canva'],
            studyGoals: ['Trở thành Digital Marketer', 'Khởi nghiệp'],
            studyTime: 'Chiều',
            gpa: 3.6,
            totalMatches: 38,
            bio: 'Yêu thích marketing và social media. Mong muốn tìm bạn cùng làm case study.',
            languages: ['Tiếng Việt', 'English', 'Korean'],
            isOnline: false
        },
        {
            id: 3,
            name: 'Văn Đức',
            avatar: 'VD',
            university: 'ĐH Công nghệ',
            major: 'Khoa học Máy tính',
            year: 4,
            matchScore: 92,
            interests: ['Open Source', 'System Design', 'Mentoring'],
            skills: ['Java', 'Spring Boot', 'Docker', 'AWS'],
            studyGoals: ['Solution Architect', 'Contribute OSS'],
            studyTime: 'Sáng',
            gpa: 3.9,
            totalMatches: 52,
            bio: 'Senior developer với 2 năm kinh nghiệm. Sẵn sàng mentor và học hỏi.',
            languages: ['Tiếng Việt', 'English'],
            isOnline: true
        }
    ]

    const filteredProfiles = allProfiles.filter(profile => {
        if (filters.major !== 'all' && profile.major !== filters.major) return false
        if (filters.year !== 'all' && profile.year.toString() !== filters.year) return false
        if (filters.studyTime !== 'all' && profile.studyTime !== filters.studyTime) return false
        return true
    })

    const currentProfile = filteredProfiles[currentIndex] || allProfiles[0]

    const handleSwipe = (dir: 'left' | 'right') => {
        setDirection(dir)
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % filteredProfiles.length)
            setDirection(null)
        }, 300)
    }

    const resetFilters = () => {
        setFilters({ major: 'all', year: 'all', studyTime: 'all' })
        setCurrentIndex(0)
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100"
        >
            {/* Header with Filters */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <SparklesIcon className="h-6 w-6 text-primary-600" />
                        <h3 className="text-lg font-bold text-gray-900">AI Smart Matching</h3>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-1"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <span>Lọc</span>
                    </button>
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white rounded-xl p-4 mb-4 border border-gray-200"
                        >
                            <div className="grid grid-cols-3 gap-3 mb-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Ngành học</label>
                                    <select
                                        value={filters.major}
                                        onChange={(e) => setFilters({ ...filters, major: e.target.value })}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="Khoa học Máy tính">KHMT</option>
                                        <option value="Marketing">Marketing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Năm học</label>
                                    <select
                                        value={filters.year}
                                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="2">Năm 2</option>
                                        <option value="3">Năm 3</option>
                                        <option value="4">Năm 4</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Thời gian</label>
                                    <select
                                        value={filters.studyTime}
                                        onChange={(e) => setFilters({ ...filters, studyTime: e.target.value })}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="Sáng">Sáng</option>
                                        <option value="Chiều">Chiều</option>
                                        <option value="Tối">Tối</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Tìm thấy {filteredProfiles.length} kết quả</span>
                                <button
                                    onClick={resetFilters}
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Đặt lại
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Match Score Banner */}
                <div className="text-center">
                    <div className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-full shadow-lg">
                        <SparklesIcon className="h-5 w-5" />
                        <span className="font-bold">{currentProfile.matchScore}% Match với bạn</span>
                    </div>
                </div>
            </div>

            {/* Profile Card */}
            <motion.div
                key={currentProfile.id}
                animate={{
                    x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
                    opacity: direction ? 0 : 1,
                    rotate: direction === 'left' ? -15 : direction === 'right' ? 15 : 0
                }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6"
            >
                {/* Cover & Avatar */}
                <div className="relative h-32 bg-gradient-to-r from-primary-500 to-primary-600">
                    <div className="absolute -bottom-12 left-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                <span className="text-3xl font-bold text-primary-600">{currentProfile.avatar}</span>
                            </div>
                            {currentProfile.isOnline && (
                                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="pt-16 px-6 pb-6">
                    <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{currentProfile.name}</h3>
                                <p className="text-gray-600">{currentProfile.university}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-600">GPA</div>
                                <div className="text-xl font-bold text-primary-600">{currentProfile.gpa}</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm flex-wrap gap-y-2">
                            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                                {currentProfile.major}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                                Năm {currentProfile.year}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                                {currentProfile.studyTime}
                            </span>
                        </div>
                    </div>

                    <div className="mb-4 pb-4 border-b border-gray-100">
                        <p className="text-gray-700 leading-relaxed">{currentProfile.bio}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                            <div className="text-xl font-bold text-gray-900">{currentProfile.totalMatches}</div>
                            <div className="text-xs text-gray-600">Kết nối</div>
                        </div>
                        <div className="bg-primary-50 rounded-lg p-3 text-center border border-primary-100">
                            <div className="text-xl font-bold text-primary-600">{currentProfile.matchScore}%</div>
                            <div className="text-xs text-gray-600">Tương thích</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                            <div className="text-xl font-bold text-gray-900">{currentProfile.languages.length}</div>
                            <div className="text-xs text-gray-600">Ngôn ngữ</div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Sở thích</h4>
                        <div className="flex flex-wrap gap-2">
                            {currentProfile.interests.map((interest, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Kỹ năng</h4>
                        <div className="flex flex-wrap gap-2">
                            {currentProfile.skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm border border-primary-100">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Mục tiêu học tập</h4>
                        <div className="space-y-2">
                            {currentProfile.studyGoals.map((goal, i) => (
                                <div key={i} className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm text-gray-700">{goal}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center space-x-4">
                <button
                    onClick={() => handleSwipe('left')}
                    className="group w-16 h-16 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-600 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
                >
                    <XMarkIcon className="h-8 w-8 group-hover:scale-110 transition-transform" />
                </button>
                <button className="w-12 h-12 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-600 rounded-full flex items-center justify-center transition-all shadow-lg">
                    <StarIcon className="h-6 w-6" />
                </button>
                <button
                    onClick={() => handleSwipe('right')}
                    className="group w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
                >
                    <HeartIcon className="h-8 w-8 group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* Progress Indicator */}
            <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                    <span>{currentIndex + 1} / {filteredProfiles.length}</span>
                    <span>•</span>
                    <span className="text-primary-600 font-medium">
                        {filteredProfiles.length - currentIndex - 1} profiles còn lại
                    </span>
                </div>
            </div>
        </motion.div>
    )
}

// Chat Simulation
function ChatSimulation() {
    const [messages, setMessages] = useState([
        { id: 1, text: 'Chào bạn! Mình thấy bạn cũng học AI nhỉ?', sender: 'other', time: '10:30' },
        { id: 2, text: 'Ừa đúng rồi! Bạn đang học phần nào?', sender: 'me', time: '10:31' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    const handleSend = () => {
        if (!input.trim()) return

        const newMessage = {
            id: messages.length + 1,
            text: input,
            sender: 'me' as const,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }

        setMessages([...messages, newMessage])
        setInput('')

        setIsTyping(true)
        setTimeout(() => {
            setIsTyping(false)
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                text: 'Hay quá! Mình đang nghiên cứu về Neural Networks. Bạn có muốn học nhóm không?',
                sender: 'other',
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            }])
        }, 2000)
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
            <div className="bg-primary-600 text-white p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                    MA
                </div>
                <div>
                    <h3 className="font-semibold">Minh Anh</h3>
                    <p className="text-sm text-primary-100">Đang online</p>
                </div>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender === 'me'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-900 shadow-sm'
                            }`}>
                            <p>{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-primary-100' : 'text-gray-500'}`}>
                                {msg.time}
                            </p>
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                        onClick={handleSend}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}


// Rooms Simulation - Upgraded
function RoomsSimulation() {
    const [joinedRoomId, setJoinedRoomId] = useState<number | null>(null)
    const [micOn, setMicOn] = useState(true)
    const [cameraOn, setCameraOn] = useState(false)

    const rooms = [
        {
            id: 1,
            name: 'Ôn thi Toán Cao Cấp',
            members: 5,
            max: 8,
            topic: 'Đạo hàm & Tích phân',
            active: true,
            owner: 'Minh Anh',
            duration: '45 phút',
            participants: [
                { name: 'Minh Anh', avatar: 'MA', isSpeaking: true, isOwner: true },
                { name: 'Thu Trang', avatar: 'TT', isSpeaking: false, isOwner: false },
                { name: 'Văn Đức', avatar: 'VD', isSpeaking: false, isOwner: false },
                { name: 'Hương', avatar: 'H', isSpeaking: true, isOwner: false },
                { name: 'Bạn', avatar: 'B', isSpeaking: false, isOwner: false }
            ]
        },
        {
            id: 2,
            name: 'Thảo luận C++ Advanced',
            members: 3,
            max: 6,
            topic: 'Smart Pointers & RAII',
            active: true,
            owner: 'Văn Đức',
            duration: '1 giờ 20 phút',
            participants: [
                { name: 'Văn Đức', avatar: 'VD', isSpeaking: false, isOwner: true },
                { name: 'Minh', avatar: 'M', isSpeaking: false, isOwner: false },
                { name: 'Tuấn', avatar: 'T', isSpeaking: true, isOwner: false }
            ]
        },
        {
            id: 3,
            name: 'Marketing Strategy Workshop',
            members: 4,
            max: 10,
            topic: 'Social Media Marketing',
            active: false,
            owner: 'Thị Hương',
            duration: 'Chưa bắt đầu',
            participants: []
        }
    ]

    const handleJoinRoom = (roomId: number) => {
        setJoinedRoomId(joinedRoomId === roomId ? null : roomId)
        if (joinedRoomId !== roomId) {
            setMicOn(true)
            setCameraOn(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
        >
            {rooms.map((room) => (
                <div key={room.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                                    {room.active && (
                                        <span className="flex items-center space-x-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                            <span>Live</span>
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{room.topic}</p>
                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                    <span className="flex items-center space-x-1">
                                        <UserGroupIcon className="h-3.5 w-3.5" />
                                        <span>{room.members}/{room.max} người</span>
                                    </span>
                                    <span>•</span>
                                    <span>Host: {room.owner}</span>
                                    <span>•</span>
                                    <span>{room.duration}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleJoinRoom(room.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${joinedRoomId === room.id
                                        ? 'bg-gray-100 text-gray-700 border border-gray-200'
                                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                                    }`}
                            >
                                {joinedRoomId === room.id ? 'Rời phòng' : 'Tham gia'}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {joinedRoomId === room.id && room.participants.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-5"
                            >
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                        Thành viên ({room.participants.length})
                                    </h4>
                                    <div className="grid grid-cols-5 gap-3">
                                        {room.participants.map((participant, i) => (
                                            <div key={i} className="text-center">
                                                <div className={`relative w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${participant.isSpeaking
                                                        ? 'bg-primary-600 ring-2 ring-primary-300 ring-offset-2'
                                                        : 'bg-gray-400'
                                                    }`}>
                                                    {participant.avatar}
                                                    {participant.isOwner && (
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                                            <span className="text-xs">👑</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 truncate">{participant.name}</p>
                                                {participant.isSpeaking && (
                                                    <div className="flex justify-center mt-1">
                                                        <div className="flex space-x-0.5">
                                                            <div className="w-1 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                                                            <div className="w-1 h-3 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                                                            <div className="w-1 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-center space-x-3 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => setMicOn(!micOn)}
                                        className={`p-3 rounded-full transition-all ${micOn
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                                            }`}
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            {micOn ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            )}
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setCameraOn(!cameraOn)}
                                        className={`p-3 rounded-full transition-all ${cameraOn
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                                            }`}
                                    >
                                        <VideoCameraIcon className="h-5 w-5" />
                                    </button>
                                    <button className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                    <button className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </motion.div>
    )
}

// Achievements Simulation - Upgraded
function AchievementsSimulation() {
    const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard'>('badges')

    const badges = [
        { name: 'Network Pro', icon: UserGroupIcon, earned: true, description: 'Kết nối 10+ bạn', progress: 100 },
        { name: 'Chat Master', icon: ChatBubbleLeftRightIcon, earned: true, description: 'Gửi 100+ tin nhắn', progress: 100 },
        { name: 'Study Streak', icon: TrophyIcon, earned: false, description: 'Học 7 ngày liên tiếp', progress: 57 },
        { name: 'Room Host', icon: VideoCameraIcon, earned: false, description: 'Tạo 5 phòng học', progress: 40 },
        { name: 'Helper', icon: HeartIcon, earned: false, description: 'Giúp đỡ 20 bạn', progress: 25 },
        { name: 'Early Bird', icon: SparklesIcon, earned: true, description: 'Tham gia sớm', progress: 100 }
    ]

    const leaderboard = [
        { rank: 1, name: 'Nguyễn Văn A', points: 1250, badges: 12, avatar: 'NA', trend: 'up' },
        { rank: 2, name: 'Trần Thị B', points: 980, badges: 10, avatar: 'TB', trend: 'same' },
        { rank: 3, name: 'Lê Minh C', points: 920, badges: 9, avatar: 'LC', trend: 'up' },
        { rank: 4, name: 'Bạn', points: 850, badges: 8, avatar: 'B', isYou: true, trend: 'up' },
        { rank: 5, name: 'Phạm Hương D', points: 720, badges: 7, avatar: 'PD', trend: 'down' }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
            <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Thành tích của bạn</h3>
                    <div className="flex items-center space-x-2 text-sm">
                        <TrophyIcon className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold text-gray-900">850 điểm</span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('badges')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${activeTab === 'badges'
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Badges
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${activeTab === 'leaderboard'
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Bảng xếp hạng
                    </button>
                </div>
            </div>

            <div className="p-5">
                <AnimatePresence mode="wait">
                    {activeTab === 'badges' ? (
                        <motion.div
                            key="badges"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-3 gap-4"
                        >
                            {badges.map((badge, i) => (
                                <div key={i} className={`text-center p-4 rounded-xl border-2 transition-all ${badge.earned
                                        ? 'bg-primary-50 border-primary-200'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <div className={`w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center ${badge.earned ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-500'
                                        }`}>
                                        <badge.icon className="h-7 w-7" />
                                    </div>
                                    <p className={`text-sm font-bold mb-1 ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {badge.name}
                                    </p>
                                    <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                                    {!badge.earned && (
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-primary-600 h-1.5 rounded-full transition-all"
                                                style={{ width: `${badge.progress}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="leaderboard"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            {leaderboard.map((user, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${user.isYou
                                            ? 'bg-primary-50 border-2 border-primary-500'
                                            : 'bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                user.rank === 2 ? 'bg-gray-200 text-gray-700' :
                                                    user.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>
                                            #{user.rank}
                                        </div>
                                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {user.avatar}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold text-gray-900">{user.name}</span>
                                                {user.isYou && (
                                                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                                                        Bạn
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600">{user.badges} badges</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center space-x-2">
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">{user.points}</p>
                                            <p className="text-xs text-gray-500">điểm</p>
                                        </div>
                                        {user.trend === 'up' && (
                                            <div className="text-green-500">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                </svg>
                                            </div>
                                        )}
                                        {user.trend === 'down' && (
                                            <div className="text-red-500">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}


// Email Verification Simulation
function VerificationSimulation() {
    const [step, setStep] = useState<'input' | 'sending' | 'sent' | 'verifying' | 'verified'>('input')
    const [email, setEmail] = useState('')
    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validate .edu email
        if (!email.endsWith('.edu') && !email.endsWith('.edu.vn')) {
            setError('Vui lòng sử dụng email trường đại học (.edu hoặc .edu.vn)')
            return
        }

        // Simulate sending email
        setStep('sending')
        setTimeout(() => {
            setStep('sent')
        }, 1500)
    }

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) return

        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`)
            nextInput?.focus()
        }

        // Auto verify when all filled
        if (newCode.every(c => c !== '') && newCode.join('').length === 6) {
            setStep('verifying')
            setTimeout(() => {
                setStep('verified')
            }, 1500)
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`)
            prevInput?.focus()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <CheckIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Xác thực Email .edu</h3>
                        <p className="text-sm text-gray-600">Chỉ dành cho sinh viên</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {/* Step 1: Email Input */}
                    {step === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="mb-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        1
                                    </div>
                                    <h4 className="font-semibold text-gray-900">Nhập email trường đại học</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Sử dụng email có đuôi .edu hoặc .edu.vn do trường cấp
                                </p>
                            </div>

                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email sinh viên
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="student@university.edu.vn"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        required
                                    />
                                    {error && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{error}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="flex items-start space-x-3">
                                        <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">Tại sao cần xác thực?</p>
                                            <ul className="space-y-1 text-xs">
                                                <li>• Đảm bảo bạn là sinh viên thực</li>
                                                <li>• Bảo vệ cộng đồng khỏi spam</li>
                                                <li>• Tạo môi trường học tập an toàn</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-colors"
                                >
                                    Gửi mã xác thực
                                </button>
                            </form>

                            {/* Example emails */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-2">Ví dụ email hợp lệ:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['student@hust.edu.vn', 'user@bku.edu.vn', 'name@uit.edu.vn'].map((ex, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setEmail(ex)}
                                            className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                                        >
                                            {ex}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Sending */}
                    {step === 'sending' && (
                        <motion.div
                            key="sending"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center py-12"
                        >
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Đang gửi mã xác thực...</h4>
                            <p className="text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
                        </motion.div>
                    )}

                    {/* Step 3: Code Input */}
                    {step === 'sent' && (
                        <motion.div
                            key="sent"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="mb-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                                        <CheckIcon className="h-5 w-5" />
                                    </div>
                                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        2
                                    </div>
                                    <h4 className="font-semibold text-gray-900">Nhập mã xác thực</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    Mã 6 số đã được gửi đến <span className="font-medium text-gray-900">{email}</span>
                                </p>
                            </div>

                            <div className="flex justify-center space-x-2 mb-6">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`code-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                                    />
                                ))}
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                                <div className="flex items-start space-x-3">
                                    <svg className="h-5 w-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div className="text-sm text-green-800">
                                        <p className="font-medium">Email đã được gửi!</p>
                                        <p className="text-xs mt-1">Kiểm tra hộp thư đến hoặc spam</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep('input')}
                                className="w-full text-sm text-gray-600 hover:text-gray-900 py-2"
                            >
                                Không nhận được mã? <span className="text-primary-600 font-medium">Gửi lại</span>
                            </button>
                        </motion.div>
                    )}

                    {/* Step 4: Verifying */}
                    {step === 'verifying' && (
                        <motion.div
                            key="verifying"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center py-12"
                        >
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Đang xác thực...</h4>
                            <p className="text-sm text-gray-600">Kiểm tra mã của bạn</p>
                        </motion.div>
                    )}

                    {/* Step 5: Verified */}
                    {step === 'verified' && (
                        <motion.div
                            key="verified"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center py-12"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <CheckIcon className="h-10 w-10 text-green-600" />
                            </motion.div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">Xác thực thành công!</h4>
                            <p className="text-gray-600 mb-6">
                                Tài khoản của bạn đã được xác thực
                            </p>

                            <div className="bg-gradient-to-r from-primary-50 to-green-50 rounded-xl p-6 mb-6">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                                            <CheckIcon className="h-6 w-6 text-green-600" />
                                        </div>
                                        <p className="text-xs font-medium text-gray-700">Email xác thực</p>
                                    </div>
                                    <div>
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700">Tài khoản an toàn</p>
                                    </div>
                                    <div>
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                                            <UserGroupIcon className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <p className="text-xs font-medium text-gray-700">Sẵn sàng kết nối</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setStep('input')
                                    setEmail('')
                                    setCode(['', '', '', '', '', ''])
                                }}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-colors"
                            >
                                Thử lại
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
