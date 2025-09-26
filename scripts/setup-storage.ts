import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage(): Promise<void> {
  try {
    console.log('Setting up Supabase storage...')

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'user-uploads')

    if (bucketExists) {
      console.log('✅ Storage bucket "user-uploads" already exists')
    } else {
      // Create bucket
      const { error: createError } = await supabase.storage.createBucket('user-uploads', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 35242880, // 33MB
      })

      if (createError) {
        console.error('Error creating bucket:', createError)
        return
      }

      console.log('✅ Created storage bucket "user-uploads"')
    }

    // Set up storage policies (RLS)
    console.log('Setting up storage policies...')
    
    // Note: Storage policies are typically set up in the Supabase dashboard
    // For now, we'll just log success
    console.log('✅ Storage setup completed successfully!')
    console.log('📋 Next steps:')
    console.log('   1. Go to your Supabase dashboard')
    console.log('   2. Navigate to Storage > Policies')
    console.log('   3. Create policies for the "user-uploads" bucket as needed')
    
  } catch (error) {
    console.error('Error setting up storage:', error)
  }
}

setupStorage()