<script setup>
import BaseModal from '~/components/base/Modal.vue'
import BaseButtonDefault from '~/components/base/button/Default.vue'
import BaseMessage from '~/components/base/Message.vue'

defineProps({
  title: { type: String, default: 'Konfirmasi Tindakan' },
  subtitle: { type: String, default: null },
  message: { type: String, default: 'Apakah Anda yakin ingin melanjutkan tindakan ini?' },
  confirmLabel: { type: String, default: 'Konfirmasi' },
  confirmVariant: { type: String, default: 'danger' },
  cancelLabel: { type: String, default: 'Batal' },
  loading: { type: Boolean, default: false },
  errMsg: { type: String, default: null },
  maxWidth: { type: String, default: '400px' }
})

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <BaseModal :max-width="maxWidth" :title="title" closeable @close="emit('close')">
    <div class="confirm-wrapper">
      <div class="confirm-content">
        <h3 v-if="subtitle" class="confirm-subtitle">{{ subtitle }}</h3>
        <p class="confirm-message">{{ message }}</p>
      </div>

      <BaseMessage
        v-if="errMsg"
        :value="errMsg"
        variant="danger"
      />

      <div class="confirm-actions">
        <BaseButtonDefault
          variant="secondary"
          :label="cancelLabel"
          :disabled="loading"
          @click="emit('close')"
        />
        <BaseButtonDefault
          :variant="confirmVariant"
          :label="confirmLabel"
          :loading="loading"
          @click="emit('confirm')"
        />
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.confirm-wrapper {
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: var(--size-m);
}

.confirm-content {
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: var(--size-4xs);
}

.confirm-subtitle {
  font-size: var(--size-m);
  font-weight: var(--font-extrabold);
  font-family: var(--font-primary);
  line-height: 1.4;
  color: var(--grey-800);
}

.confirm-message {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
  font-family: var(--font-secondary);
  line-height: 1.5;
  color: var(--grey-600);
}

.confirm-actions {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: var(--size-s);
}
</style>
