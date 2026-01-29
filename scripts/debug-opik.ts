/**
 * Debug script to test Opik trace output with verbose logging
 * Run with: npx tsx scripts/debug-opik.ts
 */
import { Opik } from 'opik'

async function debugOpik() {
  const client = new Opik({
    apiKey: process.env.OPIK_API_KEY!,
    projectName: process.env.OPIK_PROJECT_NAME || 'studymate-ai',
  })

  // Test: Output set at creation time
  const trace = client.trace({
    name: 'debug_output_test',
    input: { message: 'Debug test' },
    output: { response: 'This is the output' },
    metadata: { test: true },
  })
  trace.end()

  console.log('\nTrace data being sent:', JSON.stringify(trace.data, null, 2))

  // Intercept the actual HTTP request
  const origFetch = globalThis.fetch
  globalThis.fetch = async (url: any, opts: any) => {
    if (typeof url === 'string' && url.includes('opik') || (opts?.body && typeof opts.body === 'string')) {
      console.log('\n=== HTTP REQUEST ===')
      console.log('URL:', url)
      if (opts?.body) {
        try {
          const body = JSON.parse(opts.body)
          console.log('BODY:', JSON.stringify(body, null, 2))
        } catch {
          console.log('BODY (raw):', opts.body?.substring?.(0, 2000))
        }
      }
    }
    return origFetch(url, opts)
  }

  await client.flush()
  console.log('\nDone!')

  globalThis.fetch = origFetch
}

debugOpik().catch(console.error)
