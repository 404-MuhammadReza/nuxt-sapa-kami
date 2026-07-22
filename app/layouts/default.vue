<template>
  <div class="app-layouts">
    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layouts {
  width: 100%;
}

.app-layouts main {
  width: 100%;
  min-height: 100dvh;

  display: flex;
  flex-direction: column;

  padding: var(--size-l);
}
</style>

<style>
body { background-color: var(--grey-50); }
</style>
