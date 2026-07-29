import { ref } from 'vue'

// Shared sidebar collapse state (singleton pattern, mirrors useFilters.js)
const STORAGE_KEY = 'sidebar-collapsed'
const COLLAPSE_BREAKPOINT = 900

// Auto-collapse on small viewports, otherwise restore the persisted preference
const savedCollapsed = localStorage.getItem(STORAGE_KEY) === 'true'
const isSmallViewport = typeof window !== 'undefined' && window.innerWidth < COLLAPSE_BREAKPOINT
const collapsed = ref(savedCollapsed || isSmallViewport)

let resizeHandlerAttached = false

export function useSidebar() {
  const setCollapsed = (value) => {
    collapsed.value = value
    localStorage.setItem(STORAGE_KEY, String(value))
  }

  const toggleCollapsed = () => {
    setCollapsed(!collapsed.value)
  }

  // Auto-collapse below the breakpoint; only attach once app-wide
  if (typeof window !== 'undefined' && !resizeHandlerAttached) {
    resizeHandlerAttached = true
    window.addEventListener('resize', () => {
      if (window.innerWidth < COLLAPSE_BREAKPOINT) {
        collapsed.value = true
      }
    })
  }

  return {
    collapsed,
    setCollapsed,
    toggleCollapsed
  }
}
