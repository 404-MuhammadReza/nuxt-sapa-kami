<script setup>
import IconSearch from '~/assets/icons/actions/search.svg?component'
import IconLoading from '~/assets/icons/loading.svg?component'

import IconChevronLeft from '~/assets/icons/chevron/left.svg?component'
import IconChevronRight from '~/assets/icons/chevron/right.svg?component'

const props = defineProps({
  minWidth: { type: String, default: '800px' },
  columns: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] },
  pagination: { type: Object, default: () => null },
  loading: { type: Boolean, default: false },
  actions: { type: Boolean, default: false },
  pageControl: { type: Boolean, default: false }
})

const query = defineModel('query', { type: String, default: '' })
const page = defineModel('page', { type: Number, default: 1 })
const limit = defineModel('limit', { type: Number, default: 10 })

const draftQuery = ref('')
let searchTimeout = null
watch(draftQuery, (newQuery) => {
  clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    query.value = newQuery
  }, 500)
})

const limitOptions = [100, 50, 25, 10]
const currentShow = computed(() => {
  if (!props.pagination) return null

  const start = (props.pagination.current_page - 1) * props.pagination.limit + 1
  const end = Math.min(props.pagination.current_page * props.pagination.limit, props.pagination.total_data)
  return `${start} - ${end}`
})

const availablePages = computed(() => {
  if (!props.pagination) return []

  const total = props.pagination.total_pages
  const current = props.pagination.current_page
  const items = []

  if (total <= 5) {
    for (let i = 1; i <= total; i++) items.push(i)
  } else {
    if (current <= 3) items.push(1, 2, 3, 4, '...', total)
    else if (current >= total - 2) items.push(1, '...', total - 3, total - 2, total - 1, total)
    else items.push(1, '...', current - 1, current, current + 1, '...', total)
  }

  return items
})

const changePage = (target) => {
  if (target === '...') return
  if (target >= 1 && target <= props.pagination.total_pages) {
    page.value = target
  }
}

const nextPage = () => {
  if (props.pagination.current_page < props.pagination.total_pages) {
    page.value = props.pagination.current_page + 1
  }
}

const prevPage = () => {
  if (props.pagination.current_page > 1) {
    page.value = props.pagination.current_page - 1
  }
}

const getValue = (object, key) => {
  return key.split('.').reduce((acc, part) => acc && acc[part], object)
}

const dayjs = useDayjs()
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return dayjs(dateString).format('DD MMMM YYYY')
}

const getWidth = (width) => {
  return { width: width || 'auto' }
}

const isCurrentPage = (pageNumber) => {
  return props.pagination.current_page === pageNumber
}
</script>

<template>
  <div class="table-container">
    <div v-if="actions" class="actions">
      <div class="left">
        <BaseInputDefault
          v-model="draftQuery"
          :icon="IconSearch"
          label="Pencarian"
          placeholder="Pencarian..."
        />
      </div>
      <div v-if="$slots['table-actions']" class="right">
        <slot name="table-actions" />
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th :style="getWidth('80px')"><span>#</span></th>
            <th v-for="column in columns" :key="column.key" :style="getWidth(column.width)">
              <div :class="['wrapper', column.align]">
                <span>{{ column.label }}</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading || props.data.length === 0">
            <td :colspan="columns.length + 1">
              <div class="wrapper no-body">
                <template v-if="loading">
                  <IconLoading class="icon-loading" />
                  <span>Memuat data...</span>
                </template>
                <template v-else>
                  <span>Data tidak ditemukan</span>
                </template>
              </div>
            </td>
          </tr>
          <template v-else>
            <tr v-for="(row, index) in data" :key="index">
              <td>
                <div class="wrapper index">
                  <span>{{ index + 1 }}</span>
                </div>
              </td>
              <td v-for="column in columns" :key="column.key">
                <div :class="['wrapper', column.align]">
                  <span v-if="getValue(row, column.key) === 'anonymous'" class="anonymous">anonim</span>
                  <span v-else-if="column.type === 'text'">{{ getValue(row, column.key) }}</span>
                  <span v-else-if="column.type === 'date'">{{ formatDate(getValue(row, column.key)) }}</span>
                  <BaseBadge v-else-if="column.type === 'badge'" :value="getValue(row, column.key)" />
                  <template v-else-if="column.type === 'slot'">
                    <slot :name="column.key" :row="row" :index="index" />
                  </template>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <footer v-if="pageControl">
      <div class="info">
        <template v-if="currentShow">
          <span>Menampilkan <span>{{ currentShow }}</span> dari <span>{{ pagination?.total_data }}</span> data</span>
        </template>
        <template v-else>
          <span>Menampilkan <span>{{ data.length }}</span> data</span>
        </template>
      </div>
      <div class="control">
        <div class="limit">
          <BaseInputSelect
            v-model="limit"
            :options="limitOptions"
            label="Tampilkan"
            direction="up"
          />
        </div>
        <div class="pagination">
          <button :disabled="pagination?.current_page === 1" @click="prevPage">
            <IconChevronLeft class="icon-chevron" />
          </button>

          <button v-for="(item, index) in availablePages" :key="index" :class="{ 'is-active': isCurrentPage(item) }" :disabled="item === '...'" @click="changePage(item)">
            <span>{{ item }}</span>
          </button>

          <button :disabled="pagination?.current_page === pagination?.total_pages || data.length === 0" @click="nextPage">
            <IconChevronRight class="icon-chevron" />
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.table-container {
  width: 100%;

  display: flex;
  flex-direction: column;
  border-radius: var(--size-m);

  background-color: var(--white);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.table-container .actions {
  width: 100%;

  display: flex;
  align-items: stretch;
  justify-content: space-between;

  gap: var(--size-m);
  padding: var(--size-m);
}

.table-container .actions .left {
  flex: 1;
  max-width: 300px;
}

.table-container .actions .right {
  min-width: 275px;
  display: flex;
  align-items: stretch;

  gap: var(--size-xxs);
}

.table-container .table-wrapper {
  width: 100%;
  overflow-x: auto;

  scrollbar-width: thin;
  scrollbar-color: var(--grey-200) var(--grey-50);
}

.table-container .table-wrapper table {
  width: 100%;
  min-width: v-bind(minWidth);

  table-layout: fixed;
  border-collapse: collapse;
}

.table-container .table-wrapper table thead {
  background-color: var(--grey-50);
  border-top: 1px solid var(--grey-200);
  border-bottom: 1px solid var(--grey-200);
}

.table-container .table-wrapper table thead th span {
  font-size: var(--size-s);
  font-weight: var(--font-medium);
  line-height: 1.2;

  color: var(--grey-500);
}

.table-container .table-wrapper table tbody tr {
  border-bottom: 1px solid var(--grey-200);
  transition: background-color var(--transition-fast) var(--transition-smooth);
}

.table-container .table-wrapper table thead th,
.table-container .table-wrapper table tbody td {
  padding: var(--size-xs);
}

.table-container .table-wrapper table thead th .wrapper,
.table-container .table-wrapper table tbody td .wrapper {
  width: 100%;

  display: flex;
  align-items: center;
  overflow: hidden;
}

.table-container .table-wrapper table thead th .wrapper.center,
.table-container .table-wrapper table tbody td .wrapper.center,
.table-container .table-wrapper table tbody td .wrapper.index {
  justify-content: center;
}

.table-container .table-wrapper table tbody td span {
  font-size: var(--size-s);
  font-weight: var(--font-regular);

  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  color: var(--grey-700);
}

.table-container .table-wrapper table tbody td .wrapper.index span,
.table-container .table-wrapper table tbody tr td .wrapper.no-body span {
  color: var(--grey-400);
}

.table-container .table-wrapper table tbody tr td .wrapper span.anonymous {
  font-style: italic;
  color: var(--grey-400);
}

.table-container .table-wrapper table tbody tr td:has(.wrapper.no-body) {
  background-color: var(--grey-100);
}

.table-container .table-wrapper table tbody tr td .wrapper.no-body {
  gap: var(--size-xxs);
  padding: var(--size-m);
  justify-content: center;
}

.table-container .table-wrapper table tbody tr td .wrapper.no-body .icon-loading {
  width: var(--size-m);
  height: var(--size-m);
  flex-shrink: 0;

  color: var(--grey-400);
}

.table-container footer {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--size-m);
  padding: var(--size-m);
}

.table-container footer .info {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: var(--size-5xs);
}

.table-container footer .info span {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
  color: var(--grey-500);
}

.table-container footer .info span span {
  font-weight: var(--font-bold);

  color: var(--grey-700);
}

.table-container footer .control {
  display: flex;
  align-items: center;

  gap: var(--size-xxs);
}

.table-container footer .control .limit {
  max-width: 80px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.table-container footer .control .limit :deep(input) {
  padding: var(--size-3xs) var(--size-s);
}

.table-container footer .control .limit :deep(.icon-chevron) {
  width: var(--size-xs);
  height: var(--size-xs);
}

.table-container footer .control .pagination {
  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  border-radius: var(--size-xs);
  border: 1px solid var(--grey-200);
}

.table-container footer .control .pagination button {
  height: var(--size-3xl);
  min-width: var(--size-3xl);
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  padding: var(--size-xs);

  border: none;
  background-color: var(--grey-white);
  border-right: 1px solid var(--grey-200);
  transition: all var(--transition-fast) var(--transition-smooth);
}

.table-container footer .control .pagination button:last-child {
  border: none
}

.table-container footer .control .pagination button:has(.icon-chevron) {
  padding: var(--size-xxs);
}

.table-container footer .control .pagination button:disabled {
  cursor: default;
}

.table-container footer .control .pagination button:has(.icon-chevron):disabled,
.table-container footer .control .pagination button.is-active {
  background-color: var(--grey-50);
}

.table-container footer .control .pagination button span {
  font-size: var(--size-s);
  font-weight: var(--font-regular);

  color: var(--grey-500);
}

.table-container footer .control .pagination button:disabled span {
  color: var(--grey-400);
}

.table-container footer .control .pagination button.is-active span {
  font-weight: var(--font-bold);
  color: var(--grey-600);
}

.table-container footer .control .pagination button .icon-chevron {
  height: 100%;
  width: auto;

  color: var(--grey-500);
}

.table-container footer .control .pagination button .icon-chevron * {
  stroke-width: 1.75;
}

.table-container footer .control .pagination button:disabled .icon-chevron {
  color: var(--grey-300);
}

@media (hover: hover) {
  .table-container .table-wrapper table tbody tr:hover {
    background-color: var(--grey-50);
  }

  .table-container footer .control .pagination button:hover:not(:disabled) {
    background-color: var(--grey-50);
  }
}

@media (max-width: 768px) {
  .table-container .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .table-container .actions .left {
    max-width: none;
  }

  .table-container .actions .right {
    min-width: 100%;
  }

  .table-container .table-wrapper table tbody tr td .wrapper.no-body {
    justify-content: flex-start;
  }

  .table-container footer {
    flex-direction: column;
    align-items: flex-end;
  }
}
</style>
