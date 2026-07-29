<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="brand">
      <!-- Collapsed rail is only 68px wide: the full wordmark overflows it,
           so swap to a compact monogram (first letter) that fits instead. -->
      <span v-if="collapsed" class="brand-mark" :title="t('nav.companyName')">{{ brandInitial }}</span>
      <span v-else class="brand-name">{{ t('nav.companyName') }}</span>
      <span v-if="!collapsed" class="brand-subtitle">{{ t('nav.subtitle') }}</span>
    </div>

    <nav class="nav-list">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :exact-active-class="item.exact ? 'nav-link-active' : ''"
        :active-class="item.exact ? '' : 'nav-link-active'"
        class="nav-link"
        :title="collapsed ? t(item.labelKey) : null"
      >
        <svg class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
          <path :d="item.icon" />
        </svg>
        <span v-if="!collapsed" class="nav-label">{{ t(item.labelKey) }}</span>
      </router-link>

      <button
        class="collapse-toggle"
        :aria-label="collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')"
        :aria-expanded="!collapsed"
        :title="collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')"
        @click="toggleCollapsed"
      >
        <svg class="nav-icon" viewBox="0 0 20 20" fill="currentColor">
          <path v-if="collapsed" fill-rule="evenodd" d="M7.72 14.53a.75.75 0 010-1.06L11.19 10 7.72 6.53a.75.75 0 011.06-1.06l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06 0z" clip-rule="evenodd" />
          <path v-else fill-rule="evenodd" d="M12.28 5.47a.75.75 0 010 1.06L8.81 10l3.47 3.47a.75.75 0 11-1.06 1.06l-4-4a.75.75 0 010-1.06l4-4a.75.75 0 011.06 0z" clip-rule="evenodd" />
        </svg>
        <span v-if="!collapsed" class="nav-label">{{ t('nav.collapseSidebar') }}</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <LanguageSwitcher />
      <ProfileMenu
        @show-profile-details="$emit('show-profile-details')"
        @show-tasks="$emit('show-tasks')"
      />
    </div>
  </aside>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useSidebar } from '../composables/useSidebar'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ProfileMenu from './ProfileMenu.vue'

export default {
  name: 'AppSidebar',
  components: {
    LanguageSwitcher,
    ProfileMenu
  },
  emits: ['show-profile-details', 'show-tasks'],
  setup() {
    const { t } = useI18n()
    const { collapsed, toggleCollapsed } = useSidebar()

    const navItems = [
      {
        path: '/',
        labelKey: 'nav.overview',
        exact: true,
        icon: 'M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM11 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z'
      },
      {
        path: '/inventory',
        labelKey: 'nav.inventory',
        exact: false,
        // Archive box: lidded crate with a visible band + handle cutout.
        icon: 'M3 5a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm1 4h12v7a1 1 0 01-1 1H5a1 1 0 01-1-1V9zm4 2a1 1 0 000 2h2a1 1 0 100-2H8z'
      },
      {
        path: '/orders',
        labelKey: 'nav.orders',
        exact: false,
        // Clipboard: backing board + clip tab + list lines as negative space.
        icon: 'M7 2a1 1 0 00-1 1v1H5a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1h-1V3a1 1 0 00-1-1H7zm0 2h6v1H7V4zM6 9h8v1.2H6V9zm0 2.6h8v1.2H6v-1.2zm0 2.6h5v1.2H6v-1.2z'
      },
      {
        path: '/spending',
        labelKey: 'nav.finance',
        exact: false,
        icon: 'M10 2a1 1 0 011 1v1.07a4.002 4.002 0 013 3.68 1 1 0 11-2 .1 2 2 0 00-1.8-1.83H9.7a1.7 1.7 0 000 3.4h.6a3.7 3.7 0 010 7.4 4.002 4.002 0 01-3.99-3.75 1 1 0 112-.1 2 2 0 001.99 1.85h.6a1.7 1.7 0 000-3.4h-.6a3.7 3.7 0 010-7.4V3a1 1 0 011-1z'
      },
      {
        path: '/demand',
        labelKey: 'nav.demandForecast',
        exact: false,
        icon: 'M3 16.5L8 11l3.5 3.5L17 8M17 8h-4M17 8v4'
      },
      {
        path: '/reports',
        labelKey: 'nav.reports',
        exact: false,
        // Document with a folded top-right corner and text lines below it.
        icon: 'M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414a1 1 0 00-.293-.707l-4.414-4.414A1 1 0 0010.586 2H6zm5 1.5L13.5 6H12a1 1 0 01-1-1V3.5zM7 10h6v1.2H7V10zm0 2.6h6v1.2H7v-1.2zm0 2.6h4v1.2H7v-1.2z'
      }
    ]

    // Compact monogram for the collapsed rail (first letter of the company name).
    const brandInitial = computed(() => (t('nav.companyName') || '').trim().charAt(0).toUpperCase())

    return {
      t,
      navItems,
      collapsed,
      toggleCollapsed,
      brandInitial
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-on-dark);
  display: flex;
  flex-direction: column;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 100;
  overflow-y: auto;
  transition: width 0.2s ease;
}

.sidebar.collapsed {
  width: var(--sidebar-width-collapsed);
}

.brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-5) var(--space-5);
}

.sidebar.collapsed .brand {
  padding: var(--space-5) var(--space-2);
  align-items: center;
  text-align: center;
}

.brand-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-on-dark);
  letter-spacing: -0.025em;
  line-height: 1.2;
  /* Guard against overflow if this is ever shown in a narrow rail. */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Compact square monogram shown instead of the wordmark when collapsed;
   fixed size keeps it well inside the 68px rail regardless of content. */
.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-on-dark);
  color: var(--text-on-dark);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--text-on-dark-muted);
  font-weight: 400;
}

.nav-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0.625rem var(--space-3);
  color: var(--text-on-dark-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: var(--radius-sm);
  border-left: 3px solid transparent;
  transition: all 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 0.625rem var(--space-2);
}

.nav-link:hover {
  color: var(--text-on-dark);
  background: rgba(255, 255, 255, 0.06);
}

.nav-link-active {
  color: var(--text-on-dark);
  background: rgba(37, 99, 235, 0.15);
  border-left-color: var(--accent);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapse-toggle {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0.625rem var(--space-3);
  background: none;
  border: none;
  border-left: 3px solid transparent;
  color: var(--text-on-dark-muted);
  font-family: inherit;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.sidebar.collapsed .collapse-toggle {
  justify-content: center;
  padding: 0.625rem var(--space-2);
}

.collapse-toggle:hover {
  color: var(--text-on-dark);
  background: rgba(255, 255, 255, 0.06);
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border-top: 1px solid var(--border-on-dark);
}

/* --- Dark-sidebar adaptation for LanguageSwitcher / ProfileMenu ---
   Both components were built for a white header; override their
   colors/borders here rather than editing the shared components. */
.sidebar-footer :deep(.language-button),
.sidebar-footer :deep(.profile-button) {
  width: 100%;
  background: transparent;
  border-color: var(--border-on-dark);
  color: var(--text-on-dark);
}

.sidebar-footer :deep(.language-button:hover),
.sidebar-footer :deep(.profile-button:hover) {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--border-on-dark);
}

.sidebar-footer :deep(.language-label),
.sidebar-footer :deep(.profile-name) {
  color: var(--text-on-dark);
}

.sidebar-footer :deep(.globe-icon),
.sidebar-footer :deep(.chevron) {
  color: var(--text-on-dark-muted);
}

/* Dropdown menus stay on their light-surface styling (they render as
   floating panels over app content, not on the dark rail) but need
   repositioning so they don't get clipped by the narrow sidebar. */
.sidebar-footer :deep(.dropdown-menu) {
  left: 0;
  right: auto;
  bottom: calc(100% + 0.5rem);
  top: auto;
}

.sidebar.collapsed .sidebar-footer :deep(.language-label),
.sidebar.collapsed .sidebar-footer :deep(.profile-name),
.sidebar.collapsed .sidebar-footer :deep(.chevron) {
  display: none;
}

.sidebar.collapsed .sidebar-footer :deep(.language-button),
.sidebar.collapsed .sidebar-footer :deep(.profile-button) {
  justify-content: center;
  padding: 0.5rem;
}

@media (max-width: 900px) {
  .sidebar {
    width: var(--sidebar-width-collapsed);
  }

  .sidebar .brand-subtitle,
  .sidebar .nav-label {
    display: none;
  }

  .sidebar .brand {
    padding: var(--space-5) var(--space-2);
    align-items: center;
    text-align: center;
  }

  .sidebar .nav-link,
  .sidebar .collapse-toggle {
    justify-content: center;
    padding: 0.625rem var(--space-2);
  }
}
</style>
