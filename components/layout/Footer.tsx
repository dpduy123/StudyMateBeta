'use client'

import Link from 'next/link'
import {
  AcademicCapIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  HeartIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
// Social media icons as SVG components
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
)

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348S9.746 16.988 8.449 16.988zM12.017 7.729c-2.209 0-4.258 1.746-4.258 4.258s1.746 4.258 4.258 4.258s4.258-1.746 4.258-4.258S14.529 7.729 12.017 7.729z"/>
  </svg>
)

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

export function Footer() {
  const footerSections = [
    {
      title: 'Sản phẩm',
      links: [
        { name: 'Tính năng', href: '#features' },
        { name: 'Cách hoạt động', href: '#how-it-works' },
        { name: 'Bảng giá', href: '#pricing' },
        { name: 'Đánh giá', href: '#testimonials' }
      ]
    },
    {
      title: 'Cộng đồng',
      links: [
        { name: 'Tìm bạn học', href: '/discover' },
        { name: 'Phòng học nhóm', href: '/rooms' },
        { name: 'Sự kiện', href: '/events' },
        { name: 'Blog', href: '/blog' }
      ]
    },
    {
      title: 'Hỗ trợ',
      links: [
        { name: 'Trung tâm trợ giúp', href: '/help' },
        { name: 'Liên hệ', href: '/contact' },
        { name: 'Báo cáo sự cố', href: '/report' },
        { name: 'An toàn cộng đồng', href: '/safety' }
      ]
    },
    {
      title: 'Công ty',
      links: [
        { name: 'Về chúng tôi', href: '/about' },
        { name: 'Tuyển dụng', href: '/careers' },
        { name: 'Báo chí', href: '/press' },
        { name: 'Đối tác', href: '/partners' }
      ]
    }
  ]

  const socialLinks = [
    { name: 'Facebook', icon: FacebookIcon, href: '#' },
    { name: 'Twitter', icon: TwitterIcon, href: '#' },
    { name: 'Instagram', icon: InstagramIcon, href: '#' },
    { name: 'LinkedIn', icon: LinkedInIcon, href: '#' }
  ]

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'An toàn 100%',
      description: 'Xác thực email .edu'
    },
    {
      icon: AcademicCapIcon,
      title: 'Hỗ trợ học tập',
      description: 'AI matching thông minh'
    },
    {
      icon: UserGroupIcon,
      title: 'Cộng đồng lớn',
      description: '10,000+ sinh viên'
    }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Top Section */}
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Sẵn sàng kết nối với bạn học?
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Tham gia cùng hàng nghìn sinh viên đang học tập hiệu quả trên StudyMate
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-primary">
                  Đăng ký miễn phí
                </button>
                <button className="btn-secondary bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                  Tải ứng dụng
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-xl mb-3">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">StudyMate</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-xs">
              Nền tảng kết nối sinh viên hàng đầu Việt Nam, giúp bạn tìm bạn học phù hợp và phát triển bản thân.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-4 w-4" />
                <span>support@studymate.vn</span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-4 w-4" />
                <span>1900 1234</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-4 w-4" />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <span className="text-gray-400">Theo dõi chúng tôi:</span>
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <span>Made with</span>
              <HeartIcon className="h-4 w-4 text-red-500" />
              <span>in Vietnam</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2024 StudyMate. Tất cả quyền được bảo lưu.</p>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}