<script setup>
import TimahIndustri from '~/assets/logo/timahindustri.svg?component'
import IconDashboard from '~/assets/icons/menu/dashboard-fill.svg?component'
import IconMessage from '~/assets/icons/menu/message-fill.svg?component'
import IconUsers from '~/assets/icons/menu/users-fill.svg?component'

const { session } = useSession()
const nav = computed(() => {
  const route = [
    { name: 'Dashboard', path: '/admin', icon: IconDashboard },
    { name: 'Kelola Aspirasi', path: '/admin/aspirations', icon: IconMessage },
  ]

  if (session.value?.role === 'super_admin') {
    route.push({ name: 'Kelola Pengguna', path: '/admin/users', icon: IconUsers })
  }

  return route
})
</script>

<template>
  <div class="sidebar-wrapper">
    <div class="logo">
      <TimahIndustri class="timahindustri" />
    </div>
    <div class="content">
      <div class="nav-wrapper">
        <h3>Menu</h3>
        <nav>
          <NuxtLink v-for="item in nav" :key="item.name" :to="item.path">
            <component :is="item.icon" class="nav-icon" />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </nav>
      </div>
    </div>
    <footer>
      <FeaturesUserCard with-name />
      <NuxtLink to="/" class="action">
        <BaseButtonDefault label="Masuk sebagai Pengguna" />
      </NuxtLink>
    </footer>
  </div>
</template>

<style scoped>
.sidebar-wrapper {
  width: 100%;
  flex: 1;

  display: flex;
  flex-direction: column;

  gap: var(--size-xxl);
}

.sidebar-wrapper .logo {
  width: 100%;
}

.sidebar-wrapper .logo .timahindustri {
  height: calc(var(--size-4xl) - var(--size-5xs));
  width: auto;

  flex-shrink: 0;
}

.sidebar-wrapper .content {
  width: 100%;
  flex: 1;

  display: flex;
  flex-direction: column;

  gap: var(--size-m);
}

.sidebar-wrapper .content .nav-wrapper {
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: var(--size-xxs);
}

.sidebar-wrapper .content .nav-wrapper h3 {
  font-weight: var(--font-semibold);
  font-size: var(--size-s);

  color: var(--grey-700);
}

.sidebar-wrapper .content .nav-wrapper nav {
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: var(--size-5xs);
}

.sidebar-wrapper .content .nav-wrapper nav a {
  width: 100%;

  display: flex;
  align-items: center;

  gap: var(--size-xxs);
  padding: var(--size-s);
  border-radius: var(--size-xxs);

  text-decoration: none;
  transition: background-color var(--transition-normal) var(--transition-smooth);
}

.sidebar-wrapper .content .nav-wrapper nav a:is(.router-link-active, .router-link-exact-active) {
  background-color: var(--grey-50);
}

.sidebar-wrapper .content .nav-wrapper nav a * {
  transition: color var(--transition-normal) var(--transition-smooth);
}

.sidebar-wrapper .content .nav-wrapper nav a:is(.router-link-active, .router-link-exact-active) * {
  color: var(--grey-700);
}

.sidebar-wrapper .content .nav-wrapper nav a .nav-icon {
  width: var(--size-l);
  height: var(--size-l);
  flex-shrink: 0;

  color: var(--grey-300);
}

.sidebar-wrapper .content .nav-wrapper nav a span {
  font-size: var(--size-s);
  font-weight: var(--font-medium);

  color: var(--grey-500);
}

.sidebar-wrapper footer {
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: var(--size-3xs);
}

.sidebar-wrapper :deep(.user-card) {
  padding: var(--size-3xs);
  border-radius: var(--size-m);
}

.sidebar-wrapper :deep(.user-card .action) {
  padding-right: var(--size-5xs);
}

.sidebar-wrapper :deep(.user-card .avatar) {
  border-radius: var(--size-xxs);
}

.sidebar-wrapper footer a,
.sidebar-wrapper footer a :deep(button) {
  width: 100%;
  text-decoration: none;
}

@media (hover: hover) {
  .sidebar-wrapper .content .nav-wrapper nav a:hover {
    background-color: var(--grey-50);
  }
}
</style>

