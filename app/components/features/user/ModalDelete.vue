<script setup>
import BaseModalConfirmation from '~/components/base/ModalConfirmation.vue'

const props = defineProps({ user: { type: Object, required: true } })
const emit = defineEmits(['close'])

const { isLoading, errMsg, deleteUser } = useAPI()
const handleDelete = async () => {
  const result = await deleteUser(props.user.id)
  if (result) emit('close')
}
</script>

<template>
  <BaseModalConfirmation
    title="Konfirmasi Penghapusan"
    :subtitle="`&quot;${user?.name}&quot;`"
    message="Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
    confirm-label="Hapus"
    confirm-variant="danger"
    :loading="isLoading"
    :err-msg="errMsg"
    @close="emit('close')"
    @confirm="handleDelete"
  />
</template>

