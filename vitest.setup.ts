import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Nuxt auto-imports this composable app-wide; components that call it
// error outside a Nuxt app context (plain Vitest) without a stub. A no-op
// identity function is enough — no test here asserts on a resolved href.
vi.stubGlobal('useLocalePath', () => (path: unknown) => path)
