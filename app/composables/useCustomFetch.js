import { appendResponseHeader } from 'h3'

let isFatalError = false
let clientRefreshPromise = null

export const useCustomFetch = async (request, options = {}) => {
  const nuxtApp = useNuxtApp()
  const event = import.meta.server ? nuxtApp.ssrContext?.event : null

  if (import.meta.server) {
    const headers = useRequestHeaders(['cookie'])

    if (event.context._refreshedCookie) headers.cookie = event.context._refreshedCookie
    options = { ...options, headers: { ...options.headers, ...headers } }
  }

  try {
    const response = await $fetch(request, options)
    if (options._rawRes) return response
    return response.data
  } catch (error) {
    const { statusCode, statusMessage, message } = getErr(error)

    if ([502, 503, 504].includes(statusCode)) {
      if (import.meta.server) {
        throw createError({ statusCode, statusMessage, message, fatal: true })
      }

      else if (!isFatalError) {
        isFatalError = true
        showError({ statusCode, statusMessage, message, fatal: true })
      }

      return null
    }

    if ([401, 403].includes(statusCode) && !request.startsWith('/api/auth/') && !options._retry) {
      try {
        return await nuxtApp.runWithContext(async () => {
          await refreshToken(event)
          return await useCustomFetch(request, { ...options, _retry: true })
        })
      } catch { return null }
    }

    if (options._rawErr) throw createError({ statusCode, statusMessage, message })
    else return null
  }
}

const refreshToken = (event) => {
  if (import.meta.server) {
    if (!event.context._refreshPromise) {
      const headers = useRequestHeaders(['cookie'])

      event.context._refreshPromise = $fetch
        .raw('/api/auth/refresh', { method: 'GET', headers })
        .then((res) => {
          const setCookies =
            typeof res.headers.getSetCookie === 'function'
              ? res.headers.getSetCookie()
              : res.headers.get('set-cookie')
                ? [res.headers.get('set-cookie')]
                : []

          if (setCookies.length) {
            for (const cookie of setCookies) {
              appendResponseHeader(event, 'set-cookie', cookie)
            }

            const newCookiePairs = setCookies.map((c) => c.split(';')[0]).join('; ')
            event.context._refreshedCookie = mergeCookieHeader(headers.cookie, newCookiePairs)
          }
        })
        .finally(() => { event.context._refreshPromise = null })
    }

    return event.context._refreshPromise
  }

  if (!clientRefreshPromise) {
    clientRefreshPromise = $fetch('/api/auth/refresh', { method: 'GET' }).finally(() => {
      clientRefreshPromise = null
    })
  }

  return clientRefreshPromise
}

const mergeCookieHeader = (oldCookieHeader = '', newCookiePairs = '') => {
  const map = new Map()

  const parse = (str) => {
    str
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((pair) => {
        const idx = pair.indexOf('=')
        if (idx === -1) return
        map.set(pair.slice(0, idx), pair.slice(idx + 1))
      })
  }

  parse(oldCookieHeader)
  parse(newCookiePairs)

  return Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}

const getErr = (error) => {
  const statusCode = error?.response?.status || 500
  const statusMessage = error?.response?.statusText || 'Internal Server Error'
  const message =
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    'Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.'

  return { statusCode, statusMessage, message }
}

// let isFatalError = false
// let refreshPromise = null

// export const useCustomFetch = async (request, options = {}) => {
//   if (import.meta.server) {
//     const headers = useRequestHeaders(['cookie'])
//     options.headers = { ...headers, ...options.headers }
//   }

//   try {
//     const response = await $fetch(request, options)
//     if (options._rawRes) return response
//     return response.data
//   } catch (error) {
//     const { statusCode, statusMessage, message } = getErr(error)
//     if (import.meta.server) {
//       if ([502, 503, 504].includes(statusCode)) {
//         throw createError({ statusCode, statusMessage, message, fatal: true })
//       }

//       return null
//     }

//     if ([502, 503, 504].includes(statusCode)) {
//       if (!isFatalError) {
//         isFatalError = true
//         showError({ statusCode, statusMessage, message, fatal: true })
//       }

//       return null
//     }

//     if ([401, 403].includes(statusCode) && !request.startsWith('/api/auth/') && !options._retry) {
//       if (!refreshPromise) {
//         refreshPromise = $fetch('/api/auth/refresh', { method: 'GET' })
//         .finally(() => { refreshPromise = null })
//       }

//       try {
//         await refreshPromise
//         return await useCustomFetch(request, { ...options, _retry: true })
//       } catch {
//         return null
//       }
//     }

//     if (options._rawErr) throw createError({ statusCode, statusMessage, message })
//     else return null
//   }
// }

// const getErr = (error) => {
//   const statusCode = error?.response?.status || 500
//   const statusMessage = error?.response?.statusText || 'Internal Server Error'
//   const message = error?.response?.data?.detail || error?.response?.data?.message || 'Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.'

//   return { statusCode, statusMessage, message }
// }
