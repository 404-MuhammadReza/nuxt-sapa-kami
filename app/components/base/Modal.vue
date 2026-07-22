<script setup>
import IconClose from '~/assets/icons/actions/close.svg?component'

defineProps({
  maxWidth: { type: String, default: 'none' },
  title: { type: String, default: null },
  closeable: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div class="modal-wrapper">
    <div class="container">
      <header v-if="title">
        <h2>{{ title }}</h2>
        <IconClose
          v-if="closeable"
          class="icon-close"
          @click="emit('close')"
        />
      </header>
      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-wrapper {
  position: fixed;
  z-index: 9999;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: var(--size-l);
  backdrop-filter: blur(2px);
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-wrapper .container {
  width: 100%;
  max-width: v-bind(maxWidth);

  display: flex;
  flex-direction: column;
  overflow: hidden;

  border-radius: var(--size-l);
  background-color: var(--white);
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.1);
}

.modal-wrapper .container header {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--size-m);
  padding: var(--size-m);
  border-bottom: 1px solid var(--grey-300);
}

.modal-wrapper .container header h2 {
  font-size: var(--size-m);
  font-weight: var(--font-medium);
  font-family: var(--font-secondary);

  color: var(--grey-800);
}

.modal-wrapper .container header .icon-close {
  width: var(--size-s);
  height: var(--size-s);
  flex-shrink: 0;

  cursor: pointer;
  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.modal-wrapper .container header .icon-close:hover {
  color: var(--red-500);
}

.modal-wrapper .container .content {
  width: 100%;

  padding: var(--size-m);
  background-color: var(--grey-50);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-normal) var(--transition-smooth);
}

.modal-enter-active .container,
.modal-leave-active .container {
  transition: transform var(--transition-normal) var(--transition-pop),
              opacity var(--transition-normal) var(--transition-smooth);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .container,
.modal-leave-to .container {
  opacity: 0;
  transform: scale(0.9) translateY(15px);
}
</style>
