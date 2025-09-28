import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

// Sample users data
const sampleUsers = [
  {
    email: 'minh.le@student.hust.edu.vn',
    firstName: 'Minh',
    lastName: 'Lê',
    university: 'Đại học Bách khoa Hà Nội',
    major: 'Khoa học Máy tính',
    year: 3,
    bio: 'Đam mê AI và Machine Learning. Tìm bạn cùng nghiên cứu và làm project.',
    interests: ['Coding', 'Research', 'AI', 'Gaming', 'Tech Events'],
    skills: ['Python', 'JavaScript', 'React', 'Machine Learning', 'Data Science'],
    studyGoals: ['Trở thành AI Engineer', 'Tham gia dự án open source', 'Học Deep Learning'],
    preferredStudyTime: ['Tối (19:00-22:00)', 'Cuối tuần'],
    languages: ['Tiếng Việt', 'English'],
    gpa: 3.8
  },
  {
    email: 'huong.tran@student.neu.edu.vn',
    firstName: 'Hương',
    lastName: 'Trần',
    university: 'Đại học Kinh tế Quốc dân',
    major: 'Marketing',
    year: 2,
    bio: 'Yêu thích marketing và social media. Mong muốn tìm bạn cùng làm case study.',
    interests: ['Social Media', 'Photography', 'Marketing', 'Travel', 'Fashion'],
    skills: ['Digital Marketing', 'Content Creation', 'Analytics', 'Photoshop', 'Canva'],
    studyGoals: ['Trở thành Digital Marketing Manager', 'Khởi nghiệp startup', 'Học UX/UI'],
    preferredStudyTime: ['Chiều (14:00-17:00)', 'Tối (19:00-21:00)'],
    languages: ['Tiếng Việt', 'English', 'Korean'],
    gpa: 3.6
  },
  {
    email: 'duc.nguyen@student.hust.edu.vn',
    firstName: 'Đức',
    lastName: 'Nguyễn',
    university: 'Đại học Bách khoa Hà Nội',
    major: 'Software Engineering',
    year: 4,
    bio: 'Senior developer với 2 năm kinh nghiệm. Sẵn sàng mentor và học hỏi lẫn nhau.',
    interests: ['Open Source', 'System Design', 'Mentoring', 'Reading', 'Coffee'],
    skills: ['Java', 'Spring Boot', 'Docker', 'Kubernetes', 'AWS', 'System Design'],
    studyGoals: ['Trở thành Solution Architect', 'Contribute open source', 'Học Cloud Computing'],
    preferredStudyTime: ['Sáng (8:00-11:00)', 'Chiều (14:00-16:00)'],
    languages: ['Tiếng Việt', 'English'],
    gpa: 3.9
  },
  {
    email: 'linh.pham@student.vnu.edu.vn',
    firstName: 'Linh',
    lastName: 'Phạm',
    university: 'Đại học Quốc gia Hà Nội',
    major: 'Data Science',
    year: 3,
    bio: 'Passionate about data analysis và machine learning. Tìm teammate cho các cuộc thi.',
    interests: ['Data Analysis', 'Statistics', 'Research', 'Kaggle', 'Visualization'],
    skills: ['Python', 'R', 'SQL', 'Tableau', 'TensorFlow', 'Statistics'],
    studyGoals: ['Trở thành Data Scientist', 'Thắng cuộc thi Kaggle', 'Học MLOps'],
    preferredStudyTime: ['Tối (20:00-23:00)', 'Cuối tuần'],
    languages: ['Tiếng Việt', 'English', 'Chinese'],
    gpa: 3.7
  },
  {
    email: 'nam.hoang@student.neu.edu.vn',
    firstName: 'Nam',
    lastName: 'Hoàng',
    university: 'Đại học Kinh tế Quốc dân',
    major: 'Business Administration',
    year: 2,
    bio: 'Quan tâm đến startup và entrepreneurship. Muốn học thêm về business model.',
    interests: ['Startup', 'Business', 'Leadership', 'Networking', 'Investment'],
    skills: ['Business Planning', 'Financial Analysis', 'Presentation', 'Excel', 'Market Research'],
    studyGoals: ['Khởi nghiệp', 'Học về Investment', 'Phát triển leadership skills'],
    preferredStudyTime: ['Chiều (15:00-18:00)', 'Tối (19:00-21:00)'],
    languages: ['Tiếng Việt', 'English'],
    gpa: 3.5
  },
  {
    email: 'anh.vu@student.hcmut.edu.vn',
    firstName: 'Anh',
    lastName: 'Vũ',
    university: 'Đại học Bách khoa TP.HCM',
    major: 'Electrical Engineering',
    year: 3,
    bio: 'Yêu thích IoT và embedded systems. Tìm bạn cùng làm hardware projects.',
    interests: ['IoT', 'Hardware', 'Robotics', 'Electronics', 'Arduino'],
    skills: ['C/C++', 'Arduino', 'PCB Design', 'Circuit Analysis', 'Embedded Systems'],
    studyGoals: ['Trở thành IoT Engineer', 'Làm startup hardware', 'Học về AI Edge'],
    preferredStudyTime: ['Sáng (9:00-12:00)', 'Chiều (14:00-17:00)'],
    languages: ['Tiếng Việt', 'English'],
    gpa: 3.6
  },
  {
    email: 'thao.le@student.ueh.edu.vn',
    firstName: 'Thảo',
    lastName: 'Lê',
    university: 'Đại học Kinh tế TP.HCM',
    major: 'Finance',
    year: 4,
    bio: 'Quan tâm đến fintech và cryptocurrency. Muốn tìm hiểu về blockchain.',
    interests: ['Finance', 'Cryptocurrency', 'Blockchain', 'Investment', 'Trading'],
    skills: ['Financial Modeling', 'Risk Analysis', 'Excel', 'Bloomberg', 'Python'],
    studyGoals: ['Trở thành Financial Analyst', 'Học về DeFi', 'Làm fintech startup'],
    preferredStudyTime: ['Tối (18:00-21:00)', 'Cuối tuần'],
    languages: ['Tiếng Việt', 'English', 'Japanese'],
    gpa: 3.8
  },
  {
    email: 'quan.tran@student.hust.edu.vn',
    firstName: 'Quân',
    lastName: 'Trần',
    university: 'Đại học Bách khoa Hà Nội',
    major: 'Mechanical Engineering',
    year: 2,
    bio: 'Passionate về automotive engineering và green technology. Tìm bạn cùng chí hướng.',
    interests: ['Automotive', 'Green Tech', 'CAD Design', 'Manufacturing', 'Innovation'],
    skills: ['AutoCAD', 'SolidWorks', 'MATLAB', '3D Printing', 'Manufacturing'],
    studyGoals: ['Làm automotive engineer', 'Phát triển xe điện', 'Học Industry 4.0'],
    preferredStudyTime: ['Sáng (8:00-11:00)', 'Chiều (13:00-16:00)'],
    languages: ['Tiếng Việt', 'English', 'German'],
    gpa: 3.4
  },
  {
    email: 'yen.nguyen@student.vnu.edu.vn',
    firstName: 'Yến',
    lastName: 'Nguyễn',
    university: 'Đại học Quốc gia Hà Nội',
    major: 'Psychology',
    year: 3,
    bio: 'Quan tâm đến UX psychology và behavioral design. Tìm bạn cùng research.',
    interests: ['Psychology', 'UX Design', 'Research', 'Human Behavior', 'Mental Health'],
    skills: ['Research Methods', 'SPSS', 'User Research', 'Figma', 'Survey Design'],
    studyGoals: ['Trở thành UX Researcher', 'Học về behavioral economics', 'Phát triển app mental health'],
    preferredStudyTime: ['Chiều (14:00-17:00)', 'Tối (19:00-22:00)'],
    languages: ['Tiếng Việt', 'English'],
    gpa: 3.7
  },
  {
    email: 'long.phan@student.hcmus.edu.vn',
    firstName: 'Long',
    lastName: 'Phan',
    university: 'Đại học Khoa học Tự nhiên TP.HCM',
    major: 'Mathematics',
    year: 4,
    bio: 'Yêu thích toán ứng dụng và optimization. Tìm bạn cùng giải quyết bài toán thực tế.',
    interests: ['Applied Math', 'Optimization', 'Statistics', 'Financial Math', 'Algorithms'],
    skills: ['MATLAB', 'R', 'Python', 'Mathematical Modeling', 'Statistical Analysis'],
    studyGoals: ['Trở thành Quantitative Analyst', 'Nghiên cứu optimization', 'Học về algorithmic trading'],
    preferredStudyTime: ['Tối (20:00-23:00)', 'Cuối tuần'],
    languages: ['Tiếng Việt', 'English', 'French'],
    gpa: 3.9
  }
]

export async function POST(request: NextRequest) {
  try {
    // Create Supabase admin client
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key for admin operations
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client for auth check
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Not needed for POST request
          },
        },
      }
    )

    // Check if user is authenticated (optional - remove in production)
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting to create sample users...')
    const createdUsers = []

    for (const userData of sampleUsers) {
      try {
        // First create auth user in Supabase using admin client
        const { data: authUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: 'TempPassword123!', // They can change this later
          email_confirm: true,
          user_metadata: {
            firstName: userData.firstName,
            lastName: userData.lastName
          }
        })

        if (signUpError) {
          console.error(`Error creating auth user for ${userData.email}:`, signUpError)
          continue
        }

        if (!authUser.user) {
          console.error(`No user returned for ${userData.email}`)
          continue
        }

        // Then create user profile in database
        const dbUser = await prisma.user.create({
          data: {
            id: authUser.user.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            university: userData.university,
            major: userData.major,
            year: userData.year,
            bio: userData.bio,
            interests: userData.interests,
            skills: userData.skills,
            studyGoals: userData.studyGoals,
            preferredStudyTime: userData.preferredStudyTime,
            languages: userData.languages,
            gpa: userData.gpa,
            isProfilePublic: true,
            totalMatches: Math.floor(Math.random() * 50) + 10, // Random 10-60
            successfulMatches: Math.floor(Math.random() * 30) + 5, // Random 5-35
            averageRating: 3.5 + Math.random() * 1.5, // Random 3.5-5.0
          }
        })

        createdUsers.push({
          authId: authUser.user.id,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          dbUser: dbUser
        })

        console.log(`✅ Created user: ${userData.firstName} ${userData.lastName}`)

      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error)
      }
    }

    return NextResponse.json({
      message: `Successfully created ${createdUsers.length} users`,
      users: createdUsers,
      total: sampleUsers.length
    })

  } catch (error) {
    console.error('Error in seed users endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Not needed for DELETE request
          },
        },
      }
    )

    // Check if user is authenticated
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all test users from database
    const emails = sampleUsers.map(user => user.email)

    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          in: emails
        }
      }
    })

    // Note: Supabase auth users need to be deleted manually from dashboard
    // or with admin API calls which require service key

    return NextResponse.json({
      message: `Deleted ${deletedUsers.count} users from database`,
      note: 'Auth users need to be deleted manually from Supabase dashboard'
    })

  } catch (error) {
    console.error('Error deleting seed users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}