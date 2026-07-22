<script setup>
defineProps({
  value: { type: String, required: true },
  variant: { type: String, default: null }
})

const getValue = (raw) => {
  if (!raw) return null

  switch (raw) {
    case 'innovation': return 'Inovasi'
    case 'criticism': return 'Kritik dan Saran'
  }

  if (typeof raw === 'string') return raw.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  else return raw
}

const getVariant = (variant, value) => {
  if (variant) return variant

  switch (value) {
    case 'innovation': return 'primary'
    case 'criticism': return 'warning'
    case 'admin': return 'primary'
    case 'super_admin': return 'danger'
  }

  return null
}
</script>

<template>
  <div :class="['badge-wrapper', getVariant(variant, value)]">
    <span>{{ getValue(value) }}</span>
  </div>
</template>

<style scoped>
.badge-wrapper {
  width: fit-content;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 100px;
  padding: var(--size-4xs) var(--size-s);

  color: var(--grey-500);
  background-color: var(--grey-50);
  border: 1px solid var(--grey-200);
}

.badge-wrapper.primary {
  color: var(--blue-500);
  border-color: var(--blue-200);
  background-color: var(--blue-50);
}

.badge-wrapper.success {
  color: var(--green-500);
  border-color: var(--green-200);
  background-color: var(--green-50);
}

.badge-wrapper.warning {
  color: var(--yellow-500);
  border-color: var(--yellow-200);
  background-color: var(--yellow-50);
}

.badge-wrapper.danger {
  color: var(--red-500);
  border-color: var(--red-200);
  background-color: var(--red-50);
}

.badge-wrapper span {
  font-size: var(--size-xs);
  font-weight: var(--font-medium);
}
</style>
