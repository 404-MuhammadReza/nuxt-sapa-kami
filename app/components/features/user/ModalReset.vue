<script setup>
import BaseModalConfirmation from '~/components/base/ModalConfirmation.vue'

const props = defineProps({ user: { type: Object, required: true } })
const emit = defineEmits(['close'])

const { isLoading, errMsg, resetPassword } = useAPI()
const handleReset = async () => {
  const result = await resetPassword(props.user.id)
  if (result) emit('close')
}
</script>

<template>
  <BaseModalConfirmation
    title="Konfirmasi Reset Password"
    :subtitle="`&quot;${user?.name}&quot;`"
    message="Apakah Anda yakin ingin mereset password pengguna ini? Tindakan ini tidak dapat dibatalkan."
    confirm-label="Reset Password"
    confirm-variant="primary"
    :loading="isLoading"
    :err-msg="errMsg"
    @close="emit('close')"
    @confirm="handleReset"
  />
</template>

