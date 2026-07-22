<script setup>
import TimahIndustri from '~/assets/logo/timahindustri.svg?component'
import IconSidebar from '~/assets/icons/actions/sidebar-open.svg?component'
const emit = defineEmits(['toggle-sidebar'])
</script>

<template>
  <div class="header-wrapper">
    <div class="logo">
      <TimahIndustri class="timahindustri" />
    </div>
    <button @click="emit('toggle-sidebar')">
      <IconSidebar class="sidebar-icon" />
    </button>
  </div>
</template>

<style scoped>
.header-wrapper {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--size-m);
  padding: var(--size-m);
}

.header-wrapper .logo {
  flex: 1;
}

.header-wrapper .logo .timahindustri {
  height: calc(var(--size-4xl) - var(--size-5xs));
  width: auto;

  flex-shrink: 0;
}

.header-wrapper button {
  width: calc(var(--size-4xl) - var(--size-5xs));
  height: calc(var(--size-4xl) - var(--size-5xs));

  display: flex;
  align-items: center;
  justify-content: center;

  padding: var(--size-4xs);
  border-radius: var(--size-xxs);

  background-color: var(--grey-50);
  border: 1px solid var(--grey-200);
}

.header-wrapper button .sidebar-icon {
  width: 100%;
  height: 100%;

  flex-shrink: 0;
  color: var(--grey-400);
}
</style>
