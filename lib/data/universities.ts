export interface University {
  id: string
  name: string
  shortName: string
  location: string
  type: 'public' | 'private' | 'international'
}

export interface Major {
  id: string
  name: string
  category: string
  description?: string
}

export const UNIVERSITIES: University[] = [
  // Các trường đại học công lập
  {
    id: 'hust',
    name: 'Đại học Bách khoa Hà Nội',
    shortName: 'HUST',
    location: 'Hà Nội',
    type: 'public'
  },
  {
    id: 'neu',
    name: 'Đại học Kinh tế Quốc dân',
    shortName: 'NEU',
    location: 'Hà Nội',
    type: 'public'
  },
  {
    id: 'tmu',
    name: 'Đại học Thương mại',
    shortName: 'TMU',
    location: 'Hà Nội',
    type: 'public'
  },
  {
    id: 'UET',
    name: 'Đại học Công nghệ - ĐHQGHN',
    shortName: 'UET',
    location: 'Hà Nội',
    type: 'public'
  },

  // Khối Đại học Quốc gia TP.HCM
  {
    id: 'hcmus',
    name: 'Đại học Khoa học Tự nhiên - ĐHQG TP.HCM',
    shortName: 'HCMUS',
    location: 'TP.HCM',
    type: 'public'
  },
  {
    id: 'hcmUIT',
    name: 'Đại học Công nghệ Thông tin - ĐHQG TP.HCM',
    shortName: 'HCMUIT',
    location: 'TP.HCM',
    type: 'public'
  },
  {
    id: 'hcmiu',
    name: 'Đại học Quốc Tế - ĐHQG TP.HCM',
    shortName: 'HCMIU',
    location: 'TP.HCM',
    type: 'public'
  },
  {
    id: 'hcmue',
    name: 'Đại học Kinh tế - Luật - ĐHQG TP.HCM',
    shortName: 'HCMUE',
    location: 'TP.HCM',
    type: 'public'
  },

  {
    id: 'hcmut',
    name: 'Đại học Bách khoa TP.HCM',
    shortName: 'HCMUT',
    location: 'TP.HCM',
    type: 'public'
  },
  {
    id: 'hcmussh',
    name: 'Đại học Khoa học Xã hội và Nhân văn TP.HCM',
    shortName: 'HCMUSSH',
    location: 'TP.HCM',
    type: 'public'
  },
  {
    id: 'ueh',
    name: 'Đại học Kinh tế TP.HCM',
    shortName: 'UEH',
    location: 'TP.HCM',
    type: 'public'
  },
  {
    id: 'ctu',
    name: 'Đại học Cần Thơ',
    shortName: 'CTU',
    location: 'Cần Thơ',
    type: 'public'
  },
  {
    id: 'dut',
    name: 'Đại học Bách khoa Đà Nẵng',
    shortName: 'DUT',
    location: 'Đà Nẵng',
    type: 'public'
  },
  {
    id: 'hue',
    name: 'Đại học Huế',
    shortName: 'HUE',
    location: 'Huế',
    type: 'public'
  },
  {
    id: 'tnu',
    name: 'Đại học Thái Nguyên',
    shortName: 'TNU',
    location: 'Thái Nguyên',
    type: 'public'
  },

  // Các trường đại học tư thục
  {
    id: 'fpt',
    name: 'Đại học FPT',
    shortName: 'FPT',
    location: 'Hà Nội, TP.HCM, Đà Nẵng',
    type: 'private'
  },
  {
    id: 'rmit',
    name: 'Đại học RMIT Việt Nam',
    shortName: 'RMIT',
    location: 'TP.HCM, Hà Nội',
    type: 'private'
  },
  {
    id: 'vinuni',
    name: 'Đại học VinUni',
    shortName: 'VinUni',
    location: 'Hà Nội',
    type: 'private'
  },

  // Các trường quốc tế
  {
    id: 'fulbright',
    name: 'Đại học Fulbright Việt Nam',
    shortName: 'Fulbright',
    location: 'TP.HCM',
    type: 'international'
  },
  {
    id: 'british-uni',
    name: 'Đại học Anh Quốc Việt Nam',
    shortName: 'BUV',
    location: 'Hà Nội',
    type: 'international'
  }
]

export const MAJORS: Major[] = [
  // Công nghệ thông tin
  {
    id: 'cs',
    name: 'Khoa học Máy tính',
    category: 'Công nghệ thông tin',
    description: 'Computer Science'
  },
  {
    id: 'se',
    name: 'Kỹ thuật Phần mềm',
    category: 'Công nghệ thông tin',
    description: 'Software Engineering'
  },
  {
    id: 'it',
    name: 'Công nghệ Thông tin',
    category: 'Công nghệ thông tin',
    description: 'Information Technology'
  },
  {
    id: 'ds',
    name: 'Khoa học Dữ liệu',
    category: 'Công nghệ thông tin',
    description: 'Data Science'
  },
  {
    id: 'ai',
    name: 'Trí tuệ Nhân tạo',
    category: 'Công nghệ thông tin',
    description: 'Artificial Intelligence'
  },
  {
    id: 'cyber',
    name: 'An toàn thông tin',
    category: 'Công nghệ thông tin',
    description: 'Cybersecurity'
  },

  // Kinh tế - Kinh doanh
  {
    id: 'business',
    name: 'Quản trị Kinh doanh',
    category: 'Kinh tế - Kinh doanh',
    description: 'Business Administration'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    category: 'Kinh tế - Kinh doanh',
    description: 'Marketing'
  },
  {
    id: 'finance',
    name: 'Tài chính - Ngân hàng',
    category: 'Kinh tế - Kinh doanh',
    description: 'Finance & Banking'
  },
  {
    id: 'accounting',
    name: 'Kế toán',
    category: 'Kinh tế - Kinh doanh',
    description: 'Accounting'
  },
  {
    id: 'economics',
    name: 'Kinh tế',
    category: 'Kinh tế - Kinh doanh',
    description: 'Economics'
  },
  {
    id: 'tourism',
    name: 'Du lịch - Khách sạn',
    category: 'Kinh tế - Kinh doanh',
    description: 'Tourism & Hospitality'
  },

  // Kỹ thuật
  {
    id: 'mechanical',
    name: 'Kỹ thuật Cơ khí',
    category: 'Kỹ thuật',
    description: 'Mechanical Engineering'
  },
  {
    id: 'electrical',
    name: 'Kỹ thuật Điện',
    category: 'Kỹ thuật',
    description: 'Electrical Engineering'
  },
  {
    id: 'civil',
    name: 'Kỹ thuật Xây dựng',
    category: 'Kỹ thuật',
    description: 'Civil Engineering'
  },
  {
    id: 'chemical',
    name: 'Kỹ thuật Hóa học',
    category: 'Kỹ thuật',
    description: 'Chemical Engineering'
  },
  {
    id: 'biomedical',
    name: 'Kỹ thuật Y sinh',
    category: 'Kỹ thuật',
    description: 'Biomedical Engineering'
  },

  // Y khoa - Sức khỏe
  {
    id: 'medicine',
    name: 'Y khoa',
    category: 'Y khoa - Sức khỏe',
    description: 'Medicine'
  },
  {
    id: 'pharmacy',
    name: 'Dược học',
    category: 'Y khoa - Sức khỏe',
    description: 'Pharmacy'
  },
  {
    id: 'nursing',
    name: 'Điều dưỡng',
    category: 'Y khoa - Sức khỏe',
    description: 'Nursing'
  },
  {
    id: 'dentistry',
    name: 'Nha khoa',
    category: 'Y khoa - Sức khỏe',
    description: 'Dentistry'
  },

  // Khoa học tự nhiên
  {
    id: 'math',
    name: 'Toán học',
    category: 'Khoa học tự nhiên',
    description: 'Mathematics'
  },
  {
    id: 'physics',
    name: 'Vật lý',
    category: 'Khoa học tự nhiên',
    description: 'Physics'
  },
  {
    id: 'chemistry',
    name: 'Hóa học',
    category: 'Khoa học tự nhiên',
    description: 'Chemistry'
  },
  {
    id: 'biology',
    name: 'Sinh học',
    category: 'Khoa học tự nhiên',
    description: 'Biology'
  },
  {
    id: 'environmental',
    name: 'Khoa học Môi trường',
    category: 'Khoa học tự nhiên',
    description: 'Environmental Science'
  },

  // Xã hội - Nhân văn
  {
    id: 'psychology',
    name: 'Tâm lý học',
    category: 'Xã hội - Nhân văn',
    description: 'Psychology'
  },
  {
    id: 'sociology',
    name: 'Xã hội học',
    category: 'Xã hội - Nhân văn',
    description: 'Sociology'
  },
  {
    id: 'journalism',
    name: 'Báo chí - Truyền thông',
    category: 'Xã hội - Nhân văn',
    description: 'Journalism & Communication'
  },
  {
    id: 'linguistics',
    name: 'Ngôn ngữ học',
    category: 'Xã hội - Nhân văn',
    description: 'Linguistics'
  },
  {
    id: 'history',
    name: 'Lịch sử',
    category: 'Xã hội - Nhân văn',
    description: 'History'
  },

  // Nghệ thuật - Thiết kế
  {
    id: 'graphic-design',
    name: 'Thiết kế Đồ họa',
    category: 'Nghệ thuật - Thiết kế',
    description: 'Graphic Design'
  },
  {
    id: 'fashion',
    name: 'Thiết kế Thời trang',
    category: 'Nghệ thuật - Thiết kế',
    description: 'Fashion Design'
  },
  {
    id: 'architecture',
    name: 'Kiến trúc',
    category: 'Nghệ thuật - Thiết kế',
    description: 'Architecture'
  },
  {
    id: 'fine-arts',
    name: 'Mỹ thuật',
    category: 'Nghệ thuật - Thiết kế',
    description: 'Fine Arts'
  },

  // Luật - Chính trị
  {
    id: 'law',
    name: 'Luật',
    category: 'Luật - Chính trị',
    description: 'Law'
  },
  {
    id: 'political',
    name: 'Chính trị học',
    category: 'Luật - Chính trị',
    description: 'Political Science'
  },
  {
    id: 'international-relations',
    name: 'Quan hệ Quốc tế',
    category: 'Luật - Chính trị',
    description: 'International Relations'
  },

  // Nông nghiệp - Môi trường
  {
    id: 'agriculture',
    name: 'Nông nghiệp',
    category: 'Nông nghiệp - Môi trường',
    description: 'Agriculture'
  },
  {
    id: 'forestry',
    name: 'Lâm nghiệp',
    category: 'Nông nghiệp - Môi trường',
    description: 'Forestry'
  },
  {
    id: 'fisheries',
    name: 'Thủy sản',
    category: 'Nông nghiệp - Môi trường',
    description: 'Fisheries'
  }
]

// Helper functions
export function getUniversitiesByType(type: 'public' | 'private' | 'international'): University[] {
  return UNIVERSITIES.filter(uni => uni.type === type)
}

export function getMajorsByCategory(category: string): Major[] {
  return MAJORS.filter(major => major.category === category)
}

export function searchUniversities(query: string): University[] {
  const lowercaseQuery = query.toLowerCase()
  return UNIVERSITIES.filter(uni => 
    uni.name.toLowerCase().includes(lowercaseQuery) ||
    uni.shortName.toLowerCase().includes(lowercaseQuery) ||
    uni.location.toLowerCase().includes(lowercaseQuery)
  )
}

export function searchMajors(query: string): Major[] {
  const lowercaseQuery = query.toLowerCase()
  return MAJORS.filter(major => 
    major.name.toLowerCase().includes(lowercaseQuery) ||
    major.category.toLowerCase().includes(lowercaseQuery) ||
    (major.description && major.description.toLowerCase().includes(lowercaseQuery))
  )
}

export function getUniversityById(id: string): University | undefined {
  return UNIVERSITIES.find(uni => uni.id === id)
}

export function getMajorById(id: string): Major | undefined {
  return MAJORS.find(major => major.id === id)
}
