export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseURL = config.backendUrl

  const { pathname, search } = getRequestURL(event)
  const subPath = pathname.replace(/^\/stream\/?/, '')
  const targetUrl = `${baseURL}/api/${subPath}/stream${search}`

  const controller = new AbortController()

  event.node.req.on('close', () => {
    if (!event.node.res.writableEnded) {
      controller.abort()
    }
  })

  return proxyRequest(event, targetUrl, {
    fetch: (target, opts) => fetch(target, { ...opts, signal: controller.signal })
  })
})
