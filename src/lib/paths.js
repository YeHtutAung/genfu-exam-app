const viteBase = import.meta.env.BASE_URL || '/'

export const BASE_PATH = viteBase === '/' ? '' : viteBase.replace(/\/$/, '')

export function withBase(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${BASE_PATH}${normalized}`
}
