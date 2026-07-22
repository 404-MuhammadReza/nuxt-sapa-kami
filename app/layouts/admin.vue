<script setup>
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 768)

const [sideState, toggleSide ] = useToggle(false)

const sideRef = ref(null)
onClickOutside(sideRef, () => {
  if (isMobile.value && sideState.value) {
    toggleSide(false)
  }
})

const route = useRoute()
watch(() => route.path, () => {
  if (isMobile.value) toggleSide(false)
})
</script>

<template>
  <div class="app-layouts">
    <header v-if ="isMobile">
      <UiMobileHeader @toggle-sidebar="toggleSide(true)" />
    </header>
    <aside ref="sideRef" :class="{ 'is-open': sideState }">
      <UiSidebar />
    </aside>
    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layouts {
  width: 100%;
  height: 100dvh;

  display: flex;
  align-items: stretch;

  gap: var(--size-m);
  padding: var(--size-m);
}

.app-layouts aside {
  width: 25%;
  max-width: 275px;

  display: flex;
  flex-direction: column;
}

.app-layouts main {
  flex: 1;
  overflow: auto;

  display: flex;
  flex-direction: column;
  border-radius: var(--size-m);

  background-color: var(--grey-50);
  border: 1px solid var(--grey-200);
  scrollbar-color: transparent transparent;
}

@media (max-width: 768px) {
  .app-layouts {
    flex-direction: column;

    gap: 0;
    padding: 0;
  }

  .app-layouts aside {
    width: 80%;
    height: 100dvh;
    max-width: 275px;

    position: fixed;
    top: 0; left: 0;
    z-index: 1000;

    padding: var(--size-l);
    transform: translateX(-100%);

    background-color: var(--white);
    box-shadow: 4px 0 25px rgba(0, 0, 0, 0.1);
    transition: transform var(--transition-normal) var(--transition-smooth);
  }

  .app-layouts aside.is-open {
    transform: translateX(0);
  }

  .app-layouts:has(aside.is-open) header,
  .app-layouts:has(aside.is-open) main {
    pointer-events: none;
  }

  .app-layouts main {
    border-radius: 0;
  }
}
</style>

<style>
body { background-color: var(--white); }
</style>
