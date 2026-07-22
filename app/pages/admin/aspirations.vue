<script setup>
import IconMessage from '~/assets/icons/menu/message-outline.svg?component'
import IconFilter from '~/assets/icons/actions/filter.svg?component'
import IconExport from '~/assets/icons/actions/export.svg?component'
import IconChevron from '~/assets/icons/chevron/right.svg?component'
import IconShow from '~/assets/icons/actions/password-show.svg?component'

definePageMeta({ layout: 'admin' })

const dayjs = useDayjs()
const filter = reactive({
  query: null,
  type: null,
  start_date: dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
  end_date: dayjs().format('YYYY-MM-DD'),
  limit: 10,
  page: 1
})

const { getMessages, exportMessages } = useAPI()
const { data, pending } = await useAsyncData('messages', () => getMessages(filter), {
  getCachedData: (key, nuxtApp) => {
    if (nuxtApp.isHydrating) {
      const cached = nuxtApp.payload.data[key]
      return cached === null ? undefined : cached
    }

    return undefined
  },
  watch: filter, deep: true, lazy: true
})

const messages = computed(() => data.value?.data || [])
const pagination = computed(() => data.value?.pagination || null)

const path = ['Admin', 'Kelola Aspirasi']

const tableColumns = [
  { key: 'user.name', label: 'Pengirim', align: 'left', type: 'text', width: '25%' },
  { key: 'type', label: 'Kategori', align: 'center', type: 'badge', width: '20%' },
  { key: 'subject', label: 'Subjek', align: 'left', type: 'text', width: '40%' },
  { key: 'created_at', label: 'Tanggal', align: 'center', type: 'date', width: '15%' },
  { key: 'row-actions', label: 'Aksi', align: 'center', type: 'slot', width: '10%' }
]

const typeOptions = [
  { value: 'innovation', label: 'Inovasi' },
  { value: 'criticism', label: 'Kritik dan Saran' }
]

watch(() => [filter.query, filter.role, filter.type, filter.start_date, filter.end_date], () => {
  filter.page = 1
})

const selectedMessage = ref(null)
const handleSetMsg = (row = null) => {
  selectedMessage.value = row
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
      :data="messages"
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
          <BaseButtonDefault
            label="Ekspor"
            :icon="IconExport"
            :disabled="pending"
            @click="exportMessages(filter)"
          />
        </div>
      </template>
      <template #row-actions="{ row }">
        <div class="row-actions">
          <IconShow
            class="icon-action view"
            @click.stop="handleSetMsg(row)"
          />
        </div>
      </template>
    </UiTable>

    <Transition name="modal">
      <FeaturesMessageModalView
        v-if="selectedMessage"
        v-model="selectedMessage"
        @close="handleSetMsg()"
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

@media (max-width: 768px) {
  .aspirations-page :deep(.actions .right) {
    flex-direction: column;
  }

  .aspirations-page .range-wrapper {
    min-width: 100%;
  }
}
</style>
