import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { Readable } from 'node:stream'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const localApiRoutes = new Set([
  'confirm-upload',
  'delete-test',
  'explain',
  'upload-bundle',
  'upload-image',
])

function localApiPlugin() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const route = req.url?.split('?')[0]?.replace(/^\/+/, '')
        if (!route || !localApiRoutes.has(route)) {
          next()
          return
        }

        try {
          const url = new URL(req.url ?? '/', 'http://127.0.0.1')
          const headers = new Headers()
          for (const [key, value] of Object.entries(req.headers)) {
            if (Array.isArray(value)) {
              for (const item of value) headers.append(key, item)
            } else if (value !== undefined) {
              headers.set(key, value)
            }
          }

          const init = {
            method: req.method,
            headers,
          }

          if (req.method !== 'GET' && req.method !== 'HEAD') {
            init.body = Readable.toWeb(req)
            init.duplex = 'half'
          }

          const request = new Request(url, init)
          const handlerUrl = pathToFileURL(resolve(process.cwd(), 'api', `${route}.js`)).href
          const { default: handler } = await import(`${handlerUrl}?t=${Date.now()}`)
          const response = await handler(request)

          res.statusCode = response.status
          response.headers.forEach((value, key) => {
            res.setHeader(key, value)
          })

          const body = Buffer.from(await response.arrayBuffer())
          res.end(body)
        } catch (err) {
          server.config.logger.error(err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Local API failed' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  process.env.SUPABASE_URL ||= env.SUPABASE_URL || env.VITE_SUPABASE_URL
  process.env.SUPABASE_SERVICE_ROLE_KEY ||=
    env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY
  process.env.GEMINI_API_KEY ||= env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY

  return {
    plugins: [react(), localApiPlugin()],
  }
})
