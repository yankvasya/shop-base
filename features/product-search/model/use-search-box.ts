import { ref } from 'vue'

export function useSearchBox(initial = '') {
  const query = ref(initial)
  const router = useRouter()

  function submit() {
    const value = query.value.trim()
    if (!value) return
    router.push({ path: '/search', query: { q: value } })
  }

  return { query, submit }
}
