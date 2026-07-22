<script setup>
import IconUsers from '~/assets/icons/menu/users-outline.svg?component'
import IconFilter from '~/assets/icons/actions/filter.svg?component'
import IconExport from '~/assets/icons/actions/export.svg?component'

import IconAdd from '~/assets/icons/actions/add.svg?component'
import IconEdit from '~/assets/icons/actions/edit.svg?component'
import IconDelete from '~/assets/icons/actions/delete.svg?component'
import IconReset from '~/assets/icons/actions/reset-password.svg?component'

definePageMeta({ layout: 'admin' })
const filter = reactive({
  query: null,
  role: null,
  limit: 10,
  page: 1
})

const { session } = useSession()
const isSession = (id) => {
  if (session.value?.id === id) return true
  return false
}

const { getUsers, exportUsers } = useAPI()
const { data, pending } = await useAsyncData('users', () => getUsers(filter), {
  getCachedData: (key, nuxtApp) => {
    if (nuxtApp.isHydrating) {
      const cached = nuxtApp.payload.data[key]
      return cached === null ? undefined : cached
    }

    return undefined
  },
  watch: filter, deep: true, lazy: true
})

const users = computed(() => data.value?.data || [])
const pagination = computed(() => data.value?.pagination || null)

const path = ['Admin', 'Kelola Pengguna']
const tableColumns = [
  { key: 'employee_id', label: 'NIK', align: 'center', type: 'text', width: '15%' },
  { key: 'name', label: 'Nama', align: 'left', type: 'text', width: '40%' },
  { key: 'role', label: 'Role', align: 'center', type: 'badge', width: '20%' },
  { key: 'created_at', label: 'Terdaftar Sejak', align: 'center', type: 'date', width: '20%' },
  { key: 'row-actions', label: 'Aksi', align: 'center', type: 'slot', width: '25%' }
]

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' }
]

watch(() => [filter.query, filter.role], () => {
  filter.page = 1
})

const selectedUser = ref(null)

const showModalForm = ref(false)
const showModalDelete = ref(false)
const showModalReset = ref(false)

const handleOpenForm = (user = null) => {
  if (user) selectedUser.value = user
  else selectedUser.value = null

  showModalForm.value = true
}

const handleOpenDelete = (user = null) => {
  if (!user) return

  selectedUser.value = user
  showModalDelete.value = true
}

const handleOpenReset = (user = null) => {
  if (!user) return

  selectedUser.value = user
  showModalReset.value = true
}

const handleCloseModal = () => {
  if (showModalForm.value) showModalForm.value = false
  if (showModalDelete.value) showModalDelete.value = false
  if (showModalReset.value) showModalReset.value = false
  if (selectedUser.value) selectedUser.value = null
}
</script>

<template>
  <div class="users-page">
    <UiPageHeader
      :path="path"
      :icon="IconUsers"
      title="Kelola Pengguna"
      subtitle="Kelola pengguna yang terdaftar di dalam sistem"
    />

    <UiTable
      v-model:query="filter.query"
      v-model:limit="filter.limit"
      v-model:page="filter.page"
      :columns="tableColumns"
      :data="users"
      :pagination="pagination"
      :loading="pending"
      actions
      page-control
    >
      <template #table-actions>
        <BaseInputSelect
          v-model="filter.role"
          :options="roleOptions"
          :icon="IconFilter"
          label="Filter Role"
          placeholder="Role"
          clearable
        />
        <BaseButtonDefault
          label="Ekspor"
          :icon="IconExport"
          :disabled="pending"
          @click="exportUsers(filter)"
        />
        <BaseButtonDefault
          variant="primary"
          label="Tambah"
          :icon="IconAdd"
          :disabled="pending"
          @click="handleOpenForm()"
        />
      </template>
      <template #row-actions="{ row }">
        <div v-if="!isSession(row.id)" class="row-actions">
          <IconEdit
            class="icon-action edit"
            @click="handleOpenForm(row)"
          />
          <IconReset
            class="icon-action reset-password"
            @click="handleOpenReset(row)"
          />
          <IconDelete
            class="icon-action delete"
            @click="handleOpenDelete(row)"
          />
        </div>
        <div v-else class="row-actions">
          <span>aksi tidak tersedia</span>
        </div>
      </template>
    </UiTable>

    <transition name="modal">
      <FeaturesUserModalForm
        v-if="showModalForm"
        :user="selectedUser"
        @close="handleCloseModal"
      />
    </transition>

    <transition name="modal">
      <FeaturesUserModalDelete
        v-if="showModalDelete"
        :user="selectedUser"
        @close="handleCloseModal"
      />
    </transition>

    <transition name="modal">
      <FeaturesUserModalReset
        v-if="showModalReset"
        :user="selectedUser"
        @close="handleCloseModal"
      />
    </transition>
  </div>
</template>

<style scoped>
.users-page {
  width: 100%;
  flex: 1;

  display: flex;
  flex-direction: column;

  gap: var(--size-l);
  padding: var(--size-l);
}

.users-page .row-actions {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: var(--size-s);
}

.users-page .row-actions span {
  font-size: var(--size-s);
  color: var(--grey-400);
}

.users-page .row-actions .icon-action {
  width: var(--size-xl);
  height: var(--size-xl);
  flex-shrink: 0;

  cursor: pointer;
  position: relative;

  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.users-page .row-actions .icon-action.edit:hover {
  color: var(--yellow-400);
}

.users-page .row-actions .icon-action.reset-password:hover {
  color: var(--blue-500);
}

.users-page .row-actions .icon-action.delete:hover {
  color: var(--red-500);
}

</style>


