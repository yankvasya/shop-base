export default defineNuxtRouteMiddleware(async () => {
  // Same key as useAuth() — reuses the cached SSR result instead of a
  // second round trip when a page also calls useAuth() itself.
  const { data } = await useFetch<{ isLoggedIn: boolean }>('/api/auth/session', {
    key: 'auth-session',
    default: () => ({ isLoggedIn: false }),
  })

  if (!data.value?.isLoggedIn) {
    const returnTo = useRequestURL().pathname
    return navigateTo(`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`, { external: true })
  }
})
