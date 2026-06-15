#!/usr/bin/env node

const baseUrl = process.env.SMOKE_BASE_URL
const userToken = process.env.SMOKE_USER_TOKEN
const adminToken = process.env.SMOKE_ADMIN_TOKEN

if (!baseUrl) {
  console.log('Admin API smoke test not run.')
  console.log('Set SMOKE_BASE_URL, and optionally SMOKE_USER_TOKEN and SMOKE_ADMIN_TOKEN.')
  console.log('Example: SMOKE_BASE_URL=https://example.vercel.app SMOKE_ADMIN_TOKEN=... npm run smoke:admin-auth')
  process.exit(0)
}

const endpoints = [
  {
    path: '/api/upload-bundle',
    init: () => ({ method: 'POST', body: new FormData() }),
  },
  {
    path: '/api/confirm-upload',
    init: () => ({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }),
  },
  {
    path: '/api/upload-image',
    init: () => ({ method: 'POST', body: new FormData() }),
  },
]

const cases = [
  { name: 'anonymous', token: null, expected: 401 },
  ...(userToken ? [{ name: 'normal user', token: userToken, expected: 403 }] : []),
  ...(adminToken ? [{ name: 'admin', token: adminToken, expected: null }] : []),
]

let failures = 0

for (const endpoint of endpoints) {
  for (const testCase of cases) {
    const init = endpoint.init()
    if (testCase.token) {
      init.headers = {
        ...(init.headers || {}),
        Authorization: `Bearer ${testCase.token}`,
      }
    }

    const res = await fetch(new URL(endpoint.path, baseUrl), init)
    const label = `${testCase.name} ${endpoint.path}`

    if (testCase.expected && res.status !== testCase.expected) {
      failures++
      console.error(`FAIL ${label}: expected ${testCase.expected}, got ${res.status}`)
      continue
    }

    if (!testCase.expected && (res.status === 401 || res.status === 403)) {
      failures++
      console.error(`FAIL ${label}: admin token was rejected with ${res.status}`)
      continue
    }

    console.log(`PASS ${label}: ${res.status}`)
  }
}

if (failures > 0) {
  process.exit(1)
}
