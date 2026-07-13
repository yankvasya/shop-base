import { computed } from 'vue'

interface SessionStatus {
  isLoggedIn: boolean
}

/**
 * Session status is fetched once via a shared `useFetch` key, so the
 * result (and its SSR payload) is reused across every component that
 * calls this — the header and any account page all agree on the same
 * login state without extra round trips.
 */
export function useAuth() {
  const { data, refresh } = useFetch<SessionStatus>('/api/auth/session', {
    key: 'auth-session',
    default: () => ({ isLoggedIn: false }),
  })

  const isLoggedIn = computed(() => data.value?.isLoggedIn ?? false)

  function login(returnTo?: string) {
    const target = returnTo ?? (import.meta.client ? window.location.pathname : '/account')
    window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(target)}`
  }

  async function logout() {
    const result = await $fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = result.redirectTo
  }

  return { isLoggedIn, refresh, login, logout }
}
