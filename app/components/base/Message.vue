<script setup>
import IconError from '~/assets/icons/notification/error.svg?component'
import IconSuccess from '~/assets/icons/notification/success.svg?component'
import IconWarning from '~/assets/icons/notification/warning.svg?component'
import IconNotification from '~/assets/icons/notification/default.svg?component'

defineProps({
  value: { type: String, required: true },
  variant: {
    type: String, default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger'].includes(value)
  },
  justify: {
    type: String, default: 'center',
    validator: (value) => ['start', 'center', 'end'].includes(value)
  },
})

const getIcon = (variant) => {
  switch (variant) {
    case 'success': return IconSuccess
    case 'warning': return IconWarning
    case 'danger': return IconError
    default: return IconNotification
  }
}
</script>

<template>
  <div :class="['message-wrapper', variant, justify]">
    <component :is="getIcon(variant)" class="icon-message" />
    <span>{{ value }}</span>
  </div>
</template>

<style scoped>
.message-wrapper {
  flex: 1;

  display: flex;
  align-items: center;

  gap: var(--size-3xs);
  padding: var(--size-xxs) var(--size-xs);
  border-radius: var(--size-xs);
}

.message-wrapper.primary {
  color: var(--blue-500);
  background-color: var(--blue-50);
  border: 1px dashed var(--blue-200);
}

.message-wrapper.success {
  color: var(--green-500);
  background-color: var(--green-50);
  border: 1px dashed var(--green-200);
}

.message-wrapper.warning {
  color: var(--yellow-500);
  background-color: var(--yellow-50);
  border: 1px dashed var(--yellow-200);
}

.message-wrapper.danger {
  color: var(--red-500);
  background-color: var(--red-50);
  border: 1px dashed var(--red-200);
}

.message-wrapper.start {
  justify-content: flex-start;
}

.message-wrapper.center {
  justify-content: center;
}

.message-wrapper.end {
  justify-content: flex-end;
}

.message-wrapper .icon-message {
  width: var(--size-s);
  height: var(--size-s);

  flex-shrink: 0;
}

.message-wrapper span {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
}
</style>
