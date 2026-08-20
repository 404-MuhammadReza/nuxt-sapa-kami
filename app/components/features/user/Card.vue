<script setup>
import UserThumbnail from '~/assets/img/user-thumbnail.svg?component'
import IconMenu from '~/assets/icons/actions/menu.svg?component'
import IconSend from '~/assets/icons/actions/send.svg?component'
import IconMessage from '~/assets/icons/menu/message-outline.svg?component'
import IconDashboard from '~/assets/icons/menu/dashboard-outline.svg?component'
import IconLogout from '~/assets/icons/actions/logout.svg?component'

const props = defineProps({
  withName: { type: Boolean, default: false },
  placement: { type: String, default: 'bottom', validator: (value) => ['top', 'bottom'].includes(value) }
})

const { session, logout } = useSession()
const route = useRoute()

const isAdmin = computed(() => ['admin', 'super_admin'].includes(session.value?.role))

const display = computed(() => {
  if (props.withName) return { top: session.value?.name, bottom: `#${session.value?.employee_id}`, class: 'with-name' }
  return { top: `#${session.value?.employee_id}`, bottom: 'Nomor Induk Karyawan', class: 'without-name' }
})

const [dropdownState, toggleDropdown] = useToggle(false)

const cardRef = ref(null)
onClickOutside(cardRef, () => {
  if (dropdownState.value) toggleDropdown(false)
})

watch(() => route.fullPath, () => {
  if (dropdownState.value) toggleDropdown(false)
})

const handleLogout = async () => {
  toggleDropdown(false)
  await logout()
}

const cardClass = computed(() => [
  'user-card',
  `placement-${props.placement}`,
  `direction-${props.placement === 'top' ? 'up' : 'down'}`,
  { 'is-open': dropdownState.value }
])
</script>

<template>
  <div ref="cardRef" :class="cardClass">
    <div class="avatar">
      <UserThumbnail class="user-thumbnail" />
    </div>

    <div :class="['info', display.class]">
      <h3>{{ display.top }}</h3>
      <span>{{ display.bottom }}</span>
    </div>

    <button
      type="button"
      class="action"
      :class="{ 'is-open': dropdownState }"
      aria-label="Menu"
      :aria-expanded="dropdownState"
      @click="toggleDropdown()"
    >
      <IconMenu class="icon-menu" />
    </button>

    <Transition name="dropdown">
      <div v-if="dropdownState" class="dropdown">
        <ul>
          <li v-if="route.path !== '/'">
            <NuxtLink to="/" @click="toggleDropdown(false)">
              <IconSend class="menu-icon" />
              <span>Kirim Aspirasi</span>
            </NuxtLink>
          </li>
          <li v-if="route.path !== '/history'">
            <NuxtLink to="/history" @click="toggleDropdown(false)">
              <IconMessage class="menu-icon" />
              <span>Riwayat Aspirasi</span>
            </NuxtLink>
          </li>
          <li v-if="isAdmin && !route.path.startsWith('/admin')">
            <NuxtLink to="/admin" @click="toggleDropdown(false)">
              <IconDashboard class="menu-icon" />
              <span>Panel Admin</span>
            </NuxtLink>
          </li>
          <li class="logout" @click="handleLogout">
            <IconLogout class="menu-icon" />
            <span>Keluar</span>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.user-card {
  width: 100%;
  position: relative;

  display: flex;
  align-items: center;

  gap: var(--size-xxs);
  padding: var(--size-xxs);
  border-radius: var(--size-xs);

  background-color: var(--grey-100);
  border: 1px solid var(--grey-200);
}

.user-card .avatar {
  width: var(--size-4xl);
  height: var(--size-4xl);
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  border-radius: var(--size-xxs);
  background-color: var(--grey-200);
  border: 1px solid var(--grey-300);
}

.user-card .avatar .user-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-card .info {
  width: 100%;
  min-width: 0;
  flex: 1;

  display: flex;
  gap: var(--size-5xs);
}

.user-card .info.with-name {
  flex-direction: column;
}

.user-card .info.without-name {
  flex-direction: column-reverse;
}

.user-card .info * {
  max-width: 100%;

  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  line-height: 1.2;
}

.user-card .info span {
  font-size: var(--size-xs);
  color: var(--grey-500);
}

.user-card .info h3 {
  font-size: var(--size-s);
  color: var(--grey-700);
}

.user-card .info.with-name h3 {
  font-weight: var(--font-medium);
}

.user-card .info.without-name h3 {
  font-weight: var(--font-bold);
}

.user-card .action {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  padding: var(--size-4xs);
  background: transparent;
  border: none;
  outline: none;
  color: var(--grey-400);
  cursor: pointer;
  transition: color var(--transition-fast) var(--transition-smooth);
}

.user-card .action .icon-menu {
  width: var(--size-xl);
  height: var(--size-xl);
  color: currentColor;
}

.user-card .dropdown {
  position: absolute;
  right: 0;
  left: auto;
  z-index: 20;

  width: max-content;
  min-width: 180px;
  max-width: 240px;
  overflow: hidden;
  border-radius: var(--size-xs);

  background-color: var(--white);
  border: 1px solid var(--grey-200);
}

.user-card.direction-down .dropdown {
  top: calc(100% + var(--size-3xs));
  bottom: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.04);
}

.user-card.direction-up .dropdown {
  bottom: calc(100% + var(--size-3xs));
  top: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.04);
}

.user-card .dropdown ul {
  width: 100%;

  display: flex;
  flex-direction: column;

  list-style: none;
}

.user-card .dropdown ul li {
  width: 100%;

  display: flex;
  align-items: center;

  border-bottom: 1px solid var(--grey-200);
}

.user-card .dropdown ul li:last-child {
  border-bottom: none;
}

.user-card .dropdown ul li a,
.user-card .dropdown ul li.logout {
  width: 100%;

  display: flex;
  align-items: center;

  gap: var(--size-xs);
  padding: var(--size-xs) var(--size-s);
  cursor: pointer;
  text-decoration: none;
  outline: none;

  font-size: var(--size-s);
  font-weight: var(--font-regular);
  font-family: var(--font-secondary);
  color: var(--grey-500);

  transition: background-color var(--transition-fast) var(--transition-smooth),
              color var(--transition-fast) var(--transition-smooth);
}

.user-card .dropdown ul li a .menu-icon,
.user-card .dropdown ul li.logout .menu-icon {
  width: var(--size-m);
  height: var(--size-m);
  flex-shrink: 0;
  color: currentColor;
}

.user-card .dropdown ul li.logout {
  color: var(--red-400);
}

@media (hover: hover) {
  .user-card .action:hover,
  .user-card .action.is-open {
    color: var(--grey-700);
  }

  .user-card .dropdown ul li:hover,
  .user-card .dropdown ul li a:hover {
    background-color: var(--grey-50);
    color: var(--grey-700);
  }

  .user-card .dropdown ul li.logout:hover {
    color: var(--red-500);
    background-color: var(--red-50);
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--transition-normal) var(--transition-smooth),
              transform var(--transition-normal) var(--transition-smooth);
}

.user-card.direction-down .dropdown-enter-from,
.user-card.direction-down .dropdown-leave-to {
  opacity: 0;
  transform: translateY(calc(var(--size-xxs) * -1));
}

.user-card.direction-up .dropdown-enter-from,
.user-card.direction-up .dropdown-leave-to {
  opacity: 0;
  transform: translateY(calc(var(--size-xxs) * 1));
}
</style>
