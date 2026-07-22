<script setup>
import IconLoading from '~/assets/icons/loading.svg?component'

const props = defineProps({
  width: { type: String, default: 'auto' },
  label: { type: String, required: true },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: null },
  icon: { type: Object, default: null },
  iconOrder: { type: String, default: 'left', validator: (value) => ['left', 'right'].includes(value) },
  variant: { type: String, default: null, validator: (value) => ['primary', 'warning', 'danger', 'black'].includes(value) },
})

const icon = computed(() => {
  if (props.loading) return IconLoading
  else return props.icon
})

const displayText = computed(() => {
  if (props.loading && props.loadingText) return props.loadingText
  else return props.label
})
</script>

<template>
  <button :type="type" :disabled="disabled || loading" :class="[variant, { loading }]">
    <Component :is="icon" v-if="icon" :class="['icon-button', iconOrder]" />
    <span>{{ displayText }}</span>
  </button>
</template>

<style scoped>
button {
  width: v-bind(width);
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: var(--size-3xs);
  border-radius: var(--size-xs);
  padding: var(--size-xxs) var(--size-m);

  border: none;
  cursor: pointer;
  color: var(--grey-600);
  background-color: var(--grey-50);
  border: 1px solid var(--grey-300);

  transition: color var(--transition-fast) var(--transition-smooth),
              background-color var(--transition-fast) var(--transition-smooth);
}

button:disabled {
  cursor: default;
  color: var(--grey-500);
}

button:is(.primary, .warning, .danger, .black) {
  border: none;
  color: var(--white);
}

button.primary { background-color: var(--blue-500); }
button.warning { background-color: var(--yellow-400); }
button.danger { background-color: var(--red-500); }
button.black { background-color: var(--grey-800); }

button.primary:disabled { background-color: var(--blue-300); }
button.warning:disabled { background-color: var(--yellow-300); }
button.danger:disabled { background-color: var(--red-300); }
button.black:disabled { background-color: var(--grey-500); }

button.loading { background-color: var(--grey-50); }
button.primary.loading { background-color: var(--blue-300); }
button.warning.loading { background-color: var(--yellow-300); }
button.danger.loading { background-color: var(--red-300); }
button.black.loading { background-color: var(--grey-700); }

button:not(.loading):has(.icon-button.right) {
  flex-direction: row-reverse;
}

button .icon-button {
  width: var(--size-m);
  height: var(--size-m);

  display: flex;
  align-items: center;
  justify-content: center;
}

button:not(.primary, .warning, .danger, .black) .icon-button {
  color: var(--grey-500);
}

button span {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
  white-space: nowrap;
}

@media (hover: hover) and (pointer: fine) {
  button:not(:disabled):hover { background-color: var(--grey-100); }
  button.primary:not(:disabled):hover { background-color: var(--blue-600); }
  button.warning:not(:disabled):hover { background-color: var(--yellow-500); }
  button.danger:not(:disabled):hover { background-color: var(--red-600); }
  button.black:not(:disabled):hover { background-color: var(--grey-900); }
}
</style>
