<script setup>
import IconCalendar from '~/assets/icons/calendar.svg?component'
import BaseBadge from '~/components/base/Badge.vue'
import { formatDate } from '~/utils/format'

const props = defineProps({
  aspiration: { type: Object, required: true }
})

const isCriticism = computed(() => props.aspiration?.type === 'criticism')

const senderName = computed(() => {
  if (isCriticism.value) return 'Anonim'
  return props.aspiration?.sender?.name || props.aspiration?.user?.name || 'Karyawan'
})

const senderSubtitle = computed(() => {
  if (isCriticism.value) return 'Pengirim Aspirasi'
  const nik = props.aspiration?.sender?.nik || props.aspiration?.user?.nik
  return nik ? `NIK: ${nik}` : 'Pengirim Aspirasi'
})

const senderInitial = computed(() => {
  if (isCriticism.value) return '?'
  const name = senderName.value || 'K'
  return name.charAt(0).toUpperCase()
})
</script>

<template>
  <!-- 1. Unified Sender & Status Card -->
  <div class="info-card sender-card">
    <div class="sender-card-header">
      <div class="sender-card-main">
        <div :class="['sender-avatar', { anonymous: isCriticism }]">
          <span>{{ senderInitial }}</span>
        </div>
        <div class="sender-info">
          <span :class="['sender-name', { anonymous: isCriticism || !aspiration?.sender?.name }]">{{ senderName }}</span>
          <span class="sender-subtitle">{{ senderSubtitle }}</span>
        </div>
      </div>
    </div>
    <div class="sender-card-meta">
      <div class="sender-card-badges">
        <BaseBadge :value="aspiration.type" />
        <BaseBadge :value="aspiration.status" />
      </div>
      <div class="meta-pill">
        <IconCalendar class="icon-meta" />
        <span>{{ formatDate(aspiration.created_at) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Base Info Card */
.info-card {
  width: 100%;
  flex-shrink: 0;

  display: flex;
  flex-direction: column;

  border-radius: var(--size-xs);
  background-color: var(--white);
  border: 1px solid var(--grey-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

/* Sender & Metadata Card */
.sender-card {
  display: flex;
  flex-direction: column;
  padding: var(--size-s);
}

.sender-card-header {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-bottom: var(--size-xs);
}

.sender-card-main {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;

  gap: var(--size-xs);
}

.sender-card-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: var(--size-4xs);
}

.sender-avatar {
  width: var(--size-3xl);
  height: var(--size-3xl);
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: var(--size-3xs);
  background-color: var(--blue-100);
  border: 1px solid var(--blue-200);
}

.sender-avatar span {
  font-size: var(--size-m);
  font-weight: var(--font-bold);
  font-family: var(--font-primary);

  color: var(--blue-700);
}

.sender-avatar.anonymous {
  background-color: var(--yellow-100);
  border-color: var(--yellow-200);
}

.sender-avatar.anonymous span {
  color: var(--yellow-800);
}

.sender-info {
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 2px;
}

.sender-name {
  font-size: var(--size-s);
  font-weight: var(--font-bold);
  font-family: var(--font-primary);

  color: var(--grey-800);
}

.sender-name.anonymous {
  font-style: italic;
  font-weight: var(--font-regular);
  color: var(--grey-400);
}

.sender-subtitle {
  font-size: var(--size-xs);
  font-weight: var(--font-regular);

  color: var(--grey-500);
}

.sender-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  gap: var(--size-4xs);
  padding-top: var(--size-xs);
  border-top: 1px dashed var(--grey-200);
}

.meta-pill {
  display: inline-flex;
  align-items: center;

  gap: var(--size-4xs);
  padding: var(--size-5xs) var(--size-xs);
  border-radius: var(--size-3xl);

  font-size: var(--size-xxs);
  font-weight: var(--font-medium);
  background-color: var(--grey-50);
  color: var(--grey-600);
  border: 1px solid var(--grey-200);
}

.meta-pill .icon-meta {
  width: var(--size-xs);
  height: var(--size-xs);
  color: var(--grey-400);
}
</style>
