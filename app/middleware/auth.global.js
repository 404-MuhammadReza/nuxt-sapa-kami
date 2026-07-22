export default defineNuxtRouteMiddleware(async (to) => {
  const { session, getSession } = useSession()

  if (!session.value) {
    const { error } = await useAsyncData('session', getSession, {
      getCachedData: (key, nuxtApp) => {
        if (nuxtApp.isHydrating) {
          const cached = nuxtApp.payload.data[key]
          return cached === null ? undefined : cached
        }

        return undefined
      },
    })

    if (error.value) {
      throw createError(error.value)
    }
  }

  const path = to.path.toLowerCase()
  const role = session.value?.role || null

  if (path.startsWith('/auth') && session.value) return navigateTo('/')
  if (!path.startsWith('/auth') && !session.value) return navigateTo('/auth')

  if (path.startsWith('/admin')) {
    if (role !== 'admin' && role !== 'super_admin') return navigateTo('/')
    if (path.startsWith('/admin/users') && role !== 'super_admin') return navigateTo('/')
  }
})
