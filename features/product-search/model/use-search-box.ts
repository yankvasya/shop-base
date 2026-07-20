import { ref } from 'vue'

export function useSearchBox(initial = '') {
  const query = ref(initial)
  const router = useRouter()
  const localePath = useLocalePath()

  function submit() {
    const value = query.value.trim()
    if (!value) return
    router.push(localePath({ path: '/search', query: { q: value } }))
  }

  return { query, submit }
}
