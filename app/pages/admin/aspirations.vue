<script setup>
import IconMessage from '~/assets/icons/menu/message-outline.svg?component'
import IconFilter from '~/assets/icons/actions/filter.svg?component'
import IconExport from '~/assets/icons/actions/export.svg?component'
import IconChevron from '~/assets/icons/chevron/right.svg?component'
import IconShow from '~/assets/icons/actions/password-show.svg?component'
import IconDelete from '~/assets/icons/actions/delete.svg?component'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const dayjs = useDayjs()
const filter = reactive({
  query: route.query.query ? String(route.query.query) : null,
  type: route.query.type ? String(route.query.type) : null,
  status: route.query.status ? String(route.query.status) : null,
  start_date: route.query.start_date ? String(route.query.start_date) : dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
  end_date: route.query.end_date ? String(route.query.end_date) : dayjs().format('YYYY-MM-DD'),
  limit: 10,
  page: 1
})

watch(() => route.query, (query) => {
  filter.type = query.type ? String(query.type) : null
  filter.status = query.status ? String(query.status) : null
  filter.query = query.query ? String(query.query) : null
  if (query.start_date) filter.start_date = String(query.start_date)
  if (query.end_date) filter.end_date = String(query.end_date)
  filter.page = 1
})

const { session } = useSession()
const isSuperAdmin = computed(() => session.value?.role === 'super_admin')

const { getAspirations, exportAspirations, deleteAspiration, isLoading } = useAPI()
const { data, pending, refresh } = await useAsyncData('aspirations', () => getAspirations(filter), {
  getCachedData: (key, nuxtApp) => {
    if (nuxtApp.isHydrating) {
      const cached = nuxtApp.payload.data[key]
      return cached === null ? undefined : cached
    }

    return undefined
  },
  watch: filter, deep: true, lazy: true
})

const aspirations = computed(() => data.value?.data || [])
const pagination = computed(() => data.value?.pagination || null)

const path = ['Admin', 'Kelola Aspirasi']

const tableColumns = [
  { key: 'sender.name', label: 'Pengirim', align: 'left', type: 'text', width: '20%' },
  { key: 'type', label: 'Kategori', align: 'center', type: 'badge', width: '15%' },
  { key: 'subject', label: 'Subjek', align: 'left', type: 'text', width: '30%' },
  { key: 'status', label: 'Status', align: 'center', type: 'badge', width: '15%' },
  { key: 'created_at', label: 'Tanggal', align: 'center', type: 'date', width: '10%' },
  { key: 'row-actions', label: 'Aksi', align: 'center', type: 'slot', width: '10%' }
]

const typeOptions = [
  { value: 'innovation', label: 'Inovasi' },
  { value: 'criticism', label: 'Kritik dan Saran' }
]

const statusOptions = [
  { value: 'open', label: 'Terbuka' },
  { value: 'close', label: 'Ditutup' },
  { value: 'accepted', label: 'Diterima' },
  { value: 'rejected', label: 'Ditolak' }
]

watch(() => [filter.query, filter.type, filter.status, filter.start_date, filter.end_date], () => {
  filter.page = 1
})

const selectedAspiration = ref(null)
const handleSetAspiration = (row = null) => {
  selectedAspiration.value = row
}

const isDeleting = ref(false)
const targetDelete = ref(null)
const handleDeleteConfirm = (row) => {
  if (!isSuperAdmin.value) return
  targetDelete.value = row
  isDeleting.value = true
}

const handleDelete = async () => {
  if (!isSuperAdmin.value || !targetDelete.value?.id) return
  const res = await deleteAspiration(targetDelete.value.id)
  if (res?.success) {
    isDeleting.value = false
    targetDelete.value = null
    await refresh()
  }
}
</script>

<template>
  <div class="aspirations-page">
    <UiPageHeader
      :path="path"
      :icon="IconMessage"
      title="Kelola Aspirasi"
      subtitle="Kelola aspirasi yang masuk ke dalam sistem"
    />

    <UiTable
      v-model:query="filter.query"
      v-model:limit="filter.limit"
      v-model:page="filter.page"
      :columns="tableColumns"
      :data="aspirations"
      :pagination="pagination"
      :loading="pending"
      actions
      page-control
    >
      <template #table-actions>
        <div class="range-wrapper">
          <BaseInputDate
            v-model="filter.start_date"
            :icon="IconFilter"
            label="Filter Tanggal Mulai"
            placeholder="Tanggal Mulai"
            clearable
          />
          <div class="chevron">
            <IconChevron class="icon-chevron" />
          </div>
          <BaseInputDate
            v-model="filter.end_date"
            :icon="IconFilter"
            label="Filter Tanggal Selesai"
            placeholder="Tanggal Selesai"
            clearable
          />
        </div>
        <div class="range-wrapper">
          <BaseInputSelect
            v-model="filter.type"
            :options="typeOptions"
            :icon="IconFilter"
            label="Filter Kategori"
            placeholder="Kategori"
            clearable
          />
          <BaseInputSelect
            v-model="filter.status"
            :options="statusOptions"
            :icon="IconFilter"
            label="Filter Status"
            placeholder="Status"
            clearable
          />
          <BaseButtonDefault
            label="Ekspor"
            :icon="IconExport"
            :disabled="pending"
            @click="exportAspirations(filter)"
          />
        </div>
      </template>
      <template #row-actions="{ row }">
        <div class="row-actions">
          <IconShow
            class="icon-action view"
            @click.stop="handleSetAspiration(row)"
          />
          <IconDelete
            v-if="isSuperAdmin"
            class="icon-action delete"
            @click.stop="handleDeleteConfirm(row)"
          />
        </div>
      </template>
    </UiTable>

    <Transition name="drawer">
      <FeaturesAspirationModalView
        v-if="selectedAspiration"
        v-model="selectedAspiration"
        @close="handleSetAspiration()"
        @updated="refresh()"
      />
    </Transition>

    <Transition name="modal">
      <BaseModalConfirmation
        v-if="isDeleting"
        title="Hapus Aspirasi"
        message="Apakah Anda yakin ingin menghapus aspirasi ini? Seluruh data diskusi dan lampiran terkait akan ikut terhapus secara permanen."
        confirm-label="Hapus"
        confirm-variant="danger"
        :loading="isLoading"
        @close="isDeleting = false"
        @confirm="handleDelete"
      />
    </Transition>
  </div>
</template>

<style scoped>
.aspirations-page {
  width: 100%;
  flex: 1;

  display: flex;
  flex-direction: column;

  gap: var(--size-l);
  padding: var(--size-l);
}

.aspirations-page .range-wrapper {
  min-width: 350px;

  display: flex;
  align-items: stretch;
  gap: var(--size-xxs);
}

.aspirations-page .range-wrapper .chevron {
  display: flex;
  align-items: center;
  justify-content: center;
}

.aspirations-page .range-wrapper .chevron .icon-chevron {
  width: var(--size-s);
  height: var(--size-s);
  flex-shrink: 0;

  color: var(--grey-400);
}

.aspirations-page .row-actions {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: var(--size-s);
}

.aspirations-page .row-actions .icon-action {
  width: var(--size-xl);
  height: var(--size-xl);
  flex-shrink: 0;

  cursor: pointer;
  position: relative;

  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.aspirations-page .row-actions .icon-action:hover {
  color: var(--blue-600);
}

.aspirations-page .row-actions .icon-action.delete:hover {
  color: var(--red-600);
}

.delete-confirm-box {
  display: flex;
  flex-direction: column;
  gap: var(--size-m);
}

.delete-confirm-box p {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
  line-height: 1.5;
  color: var(--grey-600);
}

.delete-confirm-box .modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--size-xs);
}

@media (max-width: 768px) {
  .aspirations-page :deep(.actions .right) {
    flex-direction: column;
  }

  .aspirations-page .range-wrapper {
    min-width: 100%;
  }
}
</style>
