/**
 * Verification script for Task 17.3: Optimistic UI Feedback
 * 
 * This script verifies that:
 * 1. All interactive elements have instant visual feedback classes
 * 2. Hardware-accelerated animations are properly applied
 * 3. Layout shift prevention is implemented
 */

import fs from 'fs'
import path from 'path'

interface VerificationResult {
  passed: boolean
  message: string
  details?: string[]
}

const results: VerificationResult[] = []

// Files to check
const filesToCheck = [
  'components/chat/MessageBubble.tsx',
  'components/chat/ConversationsList.tsx',
  'components/chat/MessageInput.tsx',
  'components/chat/ReactionPicker.tsx',
  'app/globals.css'
]

// Required CSS classes for optimistic feedback
const requiredClasses = {
  'instant-feedback': 'Instant visual feedback for interactive elements',
  'button-press': 'Button press effect with hardware acceleration',
  'hardware-accelerated': 'Hardware acceleration with translateZ(0)',
  'smooth-color': 'Smooth color transitions',
  'card-press': 'Card press effect for conversation cards',
  'ripple-effect': 'Ripple effect for primary actions',
  'optimistic-pending': 'Optimistic pending state',
  'optimistic-error': 'Optimistic error state',
  'no-layout-shift': 'Prevent layout shifts',
}

// Required keyframe animations
const requiredAnimations = [
  'messageFadeIn',
  'conversationSlideIn',
  'successPulse',
  'errorShake',
  'loadingPulse'
]

function checkFileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    return ''
  }
}

function verifyGlobalCSS(): void {
  console.log('\n🎨 Verifying global CSS...')
  
  const cssPath = 'app/globals.css'
  if (!checkFileExists(cssPath)) {
    results.push({
      passed: false,
      message: 'Global CSS file not found'
    })
    return
  }

  const content = readFileContent(cssPath)
  const missingClasses: string[] = []
  const missingAnimations: string[] = []

  // Check for required CSS classes
  Object.entries(requiredClasses).forEach(([className, description]) => {
    if (!content.includes(`.${className}`)) {
      missingClasses.push(`${className} - ${description}`)
    }
  })

  // Check for required animations
  requiredAnimations.forEach(animation => {
    if (!content.includes(`@keyframes ${animation}`)) {
      missingAnimations.push(animation)
    }
  })

  // Check for hardware acceleration properties
  const hasTranslateZ = content.includes('translateZ(0)')
  const hasWillChange = content.includes('will-change')
  const hasBackfaceVisibility = content.includes('backface-visibility')

  if (missingClasses.length === 0 && missingAnimations.length === 0) {
    results.push({
      passed: true,
      message: '✅ All required CSS classes and animations are present'
    })
  } else {
    const details: string[] = []
    if (missingClasses.length > 0) {
      details.push('Missing CSS classes:', ...missingClasses)
    }
    if (missingAnimations.length > 0) {
      details.push('Missing animations:', ...missingAnimations)
    }
    results.push({
      passed: false,
      message: '❌ Missing CSS classes or animations',
      details
    })
  }

  // Verify hardware acceleration
  if (hasTranslateZ && hasWillChange) {
    results.push({
      passed: true,
      message: '✅ Hardware acceleration properties are present'
    })
  } else {
    results.push({
      passed: false,
      message: '❌ Missing hardware acceleration properties',
      details: [
        !hasTranslateZ ? 'Missing translateZ(0)' : '',
        !hasWillChange ? 'Missing will-change' : '',
        !hasBackfaceVisibility ? 'Missing backface-visibility' : ''
      ].filter(Boolean)
    })
  }

  // Check for reduced motion support
  if (content.includes('@media (prefers-reduced-motion: reduce)')) {
    results.push({
      passed: true,
      message: '✅ Reduced motion support is implemented'
    })
  } else {
    results.push({
      passed: false,
      message: '⚠️  Reduced motion support not found'
    })
  }
}

function verifyComponentClasses(): void {
  console.log('\n🔍 Verifying component classes...')

  const componentChecks = [
    {
      file: 'components/chat/MessageBubble.tsx',
      requiredClasses: ['hardware-accelerated', 'instant-feedback', 'button-press', 'smooth-color', 'optimistic-pending', 'optimistic-error'],
      description: 'MessageBubble component'
    },
    {
      file: 'components/chat/ConversationsList.tsx',
      requiredClasses: ['hardware-accelerated', 'card-press'],
      description: 'ConversationsList component'
    },
    {
      file: 'components/chat/MessageInput.tsx',
      requiredClasses: ['hardware-accelerated', 'button-press', 'ripple-effect', 'smooth-color', 'no-layout-shift'],
      description: 'MessageInput component'
    },
    {
      file: 'components/chat/ReactionPicker.tsx',
      requiredClasses: ['instant-feedback', 'hardware-accelerated'],
      description: 'ReactionPicker component'
    }
  ]

  componentChecks.forEach(check => {
    if (!checkFileExists(check.file)) {
      results.push({
        passed: false,
        message: `❌ ${check.description} file not found`
      })
      return
    }

    const content = readFileContent(check.file)
    const missingClasses = check.requiredClasses.filter(
      className => !content.includes(className)
    )

    if (missingClasses.length === 0) {
      results.push({
        passed: true,
        message: `✅ ${check.description} has all required classes`
      })
    } else {
      results.push({
        passed: false,
        message: `❌ ${check.description} is missing classes`,
        details: missingClasses
      })
    }
  })
}

function verifyLayoutShiftPrevention(): void {
  console.log('\n📐 Verifying layout shift prevention...')

  const checks = [
    {
      file: 'components/chat/MessageInput.tsx',
      pattern: 'no-layout-shift',
      description: 'MessageInput has layout shift prevention'
    },
    {
      file: 'components/chat/ConversationsList.tsx',
      pattern: 'contentVisibility',
      description: 'ConversationsList uses content-visibility'
    },
    {
      file: 'app/globals.css',
      pattern: 'contain:',
      description: 'CSS containment is implemented'
    }
  ]

  checks.forEach(check => {
    const content = readFileContent(check.file)
    if (content.includes(check.pattern)) {
      results.push({
        passed: true,
        message: `✅ ${check.description}`
      })
    } else {
      results.push({
        passed: false,
        message: `❌ ${check.description} - not found`
      })
    }
  })
}

function verifyAccessibility(): void {
  console.log('\n♿ Verifying accessibility...')

  const checks = [
    {
      file: 'components/chat/MessageInput.tsx',
      pattern: 'aria-label',
      description: 'MessageInput has aria-labels'
    },
    {
      file: 'components/chat/MessageBubble.tsx',
      pattern: 'aria-label',
      description: 'MessageBubble has aria-labels'
    },
    {
      file: 'components/chat/ReactionPicker.tsx',
      pattern: 'aria-label',
      description: 'ReactionPicker has aria-labels'
    }
  ]

  checks.forEach(check => {
    const content = readFileContent(check.file)
    if (content.includes(check.pattern)) {
      results.push({
        passed: true,
        message: `✅ ${check.description}`
      })
    } else {
      results.push({
        passed: false,
        message: `⚠️  ${check.description} - not found`
      })
    }
  })
}

function printResults(): void {
  console.log('\n' + '='.repeat(60))
  console.log('📊 VERIFICATION RESULTS - Task 17.3: Optimistic UI Feedback')
  console.log('='.repeat(60))

  const passed = results.filter(r => r.passed).length
  const total = results.length

  results.forEach(result => {
    console.log(`\n${result.message}`)
    if (result.details && result.details.length > 0) {
      result.details.forEach(detail => {
        console.log(`  - ${detail}`)
      })
    }
  })

  console.log('\n' + '='.repeat(60))
  console.log(`✨ Summary: ${passed}/${total} checks passed`)
  console.log('='.repeat(60))

  if (passed === total) {
    console.log('\n🎉 All verifications passed! Task 17.3 is complete.')
    process.exit(0)
  } else {
    console.log('\n⚠️  Some verifications failed. Please review the results above.')
    process.exit(1)
  }
}

// Run verifications
console.log('🚀 Starting verification for Task 17.3: Optimistic UI Feedback')
console.log('=' .repeat(60))

verifyGlobalCSS()
verifyComponentClasses()
verifyLayoutShiftPrevention()
verifyAccessibility()
printResults()
