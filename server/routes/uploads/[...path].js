export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseURL = config.backendUrl

  const { pathname, search } = getRequestURL(event)
  const url = `${baseURL}${pathname}${search}`

  return proxyRequest(event, url)
})
