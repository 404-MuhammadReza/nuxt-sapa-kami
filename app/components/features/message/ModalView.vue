<script setup>
const message = defineModel({ type: Object, required: true })
const emit = defineEmits(['close'])

const formatLabel = (title) => {
  switch (title) {
    case 'innovation': return 'Inovasi'
    case 'criticism': return 'Kritik dan Saran'
    default: return 'Aspirasi'
  }
}
</script>

<template>
  <BaseModal max-width="500px" title="Lihat Aspirasi" closeable @close="emit('close')">
    <div class="wrapper">
      <BaseInputDefault
        v-if="message.user.name !== 'anonymous'"
        v-model="message.user.name"
        label="Pengirim"
        variant="dark"
        show-label
        readonly
      />
      <BaseInputDefault
        v-model="message.subject"
        label="Subjek"
        variant="dark"
        show-label
        readonly
      />
      <BaseInputTextarea
        v-model="message.body"
        max-height="250px"
        :label="formatLabel(message.type)"
        variant="dark"
        show-label
        auto-resize
        readonly

      />
    </div>
  </BaseModal>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;

  gap: var(--size-s);
}
</style>
