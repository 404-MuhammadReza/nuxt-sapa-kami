<script setup>
defineProps({ user: { type: Object, required: true } })
const emit = defineEmits(['close'])

const { isLoading, errMsg, deleteUser } = useAPI()
const handleDelete = async (id) => {
  const result = await deleteUser(id)
  if (result) emit('close')
}
</script>

<template>
  <BaseModal max-width="400px">
    <div class="wrapper">
      <div class="text">
        <h2>Konfirmasi Penghapusan</h2>
        <h3>"{{ user.name }}"</h3>
        <span>Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.</span>
      </div>
      <BaseMessage
          v-if="errMsg"
          :message="errMsg"
          variant="danger"
        />
      <div class="actions">
        <BaseButtonDefault
          variant="secondary"
          label="Batal"
          :disabled="isLoading"
          @click="emit('close')"
        />
        <BaseButtonDefault
          variant="danger"
          label="Hapus"
          :loading="isLoading"
          @click="handleDelete(user.id)"
        />
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.wrapper {
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: var(--size-m);
}

.wrapper .text {
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: var(--size-4xs);
}

.wrapper .text h2 {
  font-size: var(--size-l);
  font-weight: var(--font-bold);
  font-family: var(--font-secondary);

  text-align: center;
  line-height: 1.5;

  color: var(--grey-600);
}

.wrapper .text h3 {
  font-size: var(--size-xl);

  font-weight: var(--font-extrabold);
  font-family: var(--font-secondary);

  text-align: center;
  line-height: 1.5;

  color: var(--grey-700);
}

.wrapper .text span {
  font-size: var(--size-s);
  text-align: center;
  line-height: 1.5;

  color: var(--grey-500);
}

.wrapper .actions {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: var(--size-m);
}

.wrapper .actions :deep(button) {
  flex: 1;
}
</style>
