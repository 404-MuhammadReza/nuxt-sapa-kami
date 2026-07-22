<script setup>
import UserThumbnail from '~/assets/img/user-thumbnail.svg?component'
import IconLogout from '~/assets/icons/actions/logout.svg?component'

const props = defineProps({ withName: { type: Boolean, default: false } })

const { session, logout } = useSession()
const display = computed(() => {
  if (props.withName) return { top: session.value?.name, bottom: `#${session.value?.employee_id}`, class: 'with-name' }
  return { top: `#${session.value?.employee_id}`, bottom: 'Nomor Induk Karyawan', class: 'without-name' }
})
</script>

<template>
  <div class="user-card">
    <div class="avatar">
      <UserThumbnail class="user-thumbnail" />
    </div>
    <div :class="['info', display.class]">
      <h3>{{ display.top }}</h3>
      <span>{{ display.bottom }}</span>
    </div>
    <div class="action" @click="logout()">
      <IconLogout class="icon-logout" />
      <span>keluar</span>
    </div>
  </div>
</template>

<style scoped>
.user-card {
  width: 100%;

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
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;

  cursor: pointer;
  gap: var(--size-5xs);
  color: var(--grey-400);
  transition: color var(--transition-normal) var(--transition-smooth);
}

.user-card .action .icon-logout {
  width: var(--size-xl);
  height: auto;
}

.user-card .action span {
  font-size: var(--size-xs);
}

@media (hover: hover) {
  .user-card .action:hover {
    color: var(--red-500);
  }
}
</style>
