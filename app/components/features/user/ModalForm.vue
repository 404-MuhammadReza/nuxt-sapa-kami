<script setup>
const props = defineProps({ user: { type: Object, default: null } })
const form = reactive(props.user ? { ...props.user } : { employee_id: '', name: '', role: 'user' })
const invalidForm = computed(() => !form.employee_id || !form.name || !form.role)

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' }
]

const { errMsg, isLoading, createUser, updateUser } = useAPI()
const handleSubmit = async () => {
  if (invalidForm.value) return

  let result
  if (props.user) result = await updateUser(form)
  else result = await createUser(form)

  if (result) emit('close')
}

const emit = defineEmits(['close'])
const displayState = computed(() => {
  if (props.user) return { title: 'Edit Pengguna', button: 'Simpan Perubahan' }
  else return { title: 'Tambah Pengguna', button: 'Tambahkan Pengguna' }
})
</script>

<template>
  <BaseModal max-width="500px" :title="displayState.title" closeable @close="emit('close')" >
    <form @submit.prevent="handleSubmit">
      <BaseInputDefault
        v-model="form.employee_id"
        type="number"
        label="Nomor Induk Karyawan"
        placeholder="Masukkan NIK"
        variant="dark"
        :disabled="isLoading"
        show-label
        required
      />
      <BaseInputDefault
        v-model="form.name"
        label="Nama"
        placeholder="Masukkan nama"
        variant="dark"
        :disabled="isLoading"
        show-label
        required
      />
      <BaseInputSelect
        v-model="form.role"
        label="Role"
        placeholder="Pilih role"
        variant="dark"
        :options="roleOptions"
        :disabled="isLoading"
        show-label
        required
      />
      <BaseMessage
        v-if="errMsg"
        :value="errMsg"
        variant="danger"
      />
      <BaseButtonDefault
        type="submit"
        variant="primary"
        :label="displayState.button"
        :loading="isLoading"
        :disabled="invalidForm"
      />
    </form>
  </BaseModal>
</template>

<style scoped>
.modal-wrapper form {
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: var(--size-m);
}

.modal-wrapper :deep(.container) {
  overflow: visible;
}

.modal-wrapper :deep(.container .content) {
  border-radius: 0 0 var(--size-l) var(--size-l);
}
</style>
