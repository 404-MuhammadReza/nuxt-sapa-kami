<script setup>
import IconIdea from '~/assets/icons/menu/idea-outline.svg?component'
import IconCriticism from '~/assets/icons/menu/criticism-outline.svg?component'

defineProps({
  value: { type: String, required: true },
  variant: { type: String, default: null }
})

const getValue = (raw) => {
  if (!raw) return null

  switch (raw) {
    case 'innovation': return 'Inovasi'
    case 'criticism': return 'Kritik & Saran'
    case 'open': return 'Terbuka'
    case 'close': return 'Ditutup'
    case 'accepted': return 'Diterima'
    case 'rejected': return 'Ditolak'
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
    case 'open': return 'primary'
    case 'close': return null
    case 'accepted': return 'success'
    case 'rejected': return 'danger'
  }

  return null
}
</script>

<template>
  <div :class="['badge-wrapper', getVariant(variant, value)]">
    <IconIdea v-if="value === 'innovation'" class="badge-icon" />
    <IconCriticism v-else-if="value === 'criticism'" class="badge-icon" />
    <span>{{ getValue(value) }}</span>
  </div>
</template>

<style scoped>
.badge-wrapper {
  width: fit-content;
  height: var(--size-xl);
  box-sizing: border-box;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: var(--size-5xs);
  padding: 0 var(--size-xs);
  border-radius: var(--size-3xl);

  color: var(--grey-600);
  background-color: var(--grey-50);
  border: 1px solid var(--grey-200);
}

.badge-icon {
  width: var(--size-xs);
  height: var(--size-xs);
  flex-shrink: 0;
}

.badge-wrapper.primary {
  color: var(--blue-600);
  border-color: var(--blue-200);
  background-color: var(--blue-50);
}

.badge-wrapper.success {
  color: var(--green-600);
  border-color: var(--green-200);
  background-color: var(--green-50);
}

.badge-wrapper.warning {
  color: var(--yellow-700);
  border-color: var(--yellow-200);
  background-color: var(--yellow-50);
}

.badge-wrapper.danger {
  color: var(--red-600);
  border-color: var(--red-200);
  background-color: var(--red-50);
}

.badge-wrapper span {
  font-size: var(--size-xxs);
  font-weight: var(--font-semibold);
  line-height: 1;
}
</style>
