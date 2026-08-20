<script setup>
import IconIdea from '~/assets/icons/menu/idea-outline.svg?component'
import IconCriticism from '~/assets/icons/menu/criticism-outline.svg?component'
import IconMessage from '~/assets/icons/menu/message-outline.svg?component'
import IconChevronRight from '~/assets/icons/chevron/right.svg?component'
import IconChevronLeft from '~/assets/icons/chevron/left.svg?component'
import IconAdd from '~/assets/icons/actions/add.svg?component'
import { formatDate } from '~/utils/format'

const props = defineProps({
  items: { type: Array, default: () => [] },
  pagination: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'create', 'reset'])

const type = defineModel('type', { type: String, default: null })
const page = defineModel('page', { type: Number, default: 1 })

const filterTypeOptions = [
  { value: null, label: 'Semua' },
  { value: 'innovation', label: 'Inovasi', icon: IconIdea },
  { value: 'criticism', label: 'Kritik & Saran', icon: IconCriticism }
]

const hasActiveFilter = computed(() => Boolean(type.value))

const emptyStateConfig = computed(() => {
  if (type.value === 'innovation') {
    return {
      icon: IconIdea,
      variant: 'innovation',
      title: 'Belum Ada Inovasi',
      desc: 'Anda belum memiliki riwayat pengajuan inovasi. Bagikan ide kreatif Anda untuk kemajuan bersama.'
    }
  }
  if (type.value === 'criticism') {
    return {
      icon: IconCriticism,
      variant: 'criticism',
      title: 'Belum Ada Kritik & Saran',
      desc: 'Anda belum memiliki riwayat pengajuan kritik atau saran. Setiap masukan anonim Anda sangat berharga.'
    }
  }
  return {
    icon: IconMessage,
    variant: 'default',
    title: 'Belum Ada Riwayat Aspirasi',
    desc: 'Anda belum pernah mengirimkan inovasi maupun kritik & saran. Kirimkan aspirasi pertama Anda sekarang.'
  }
})

const currentRange = computed(() => {
  if (!props.pagination || !props.pagination.total_data) return ''
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

const isCurrentPage = (pageNumber) => {
  return props.pagination?.current_page === pageNumber
}

const changePage = (target) => {
  if (target === '...' || !props.pagination) return
  if (target >= 1 && target <= props.pagination.total_pages) {
    page.value = target
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (props.pagination && props.pagination.current_page < props.pagination.total_pages) {
    changePage(props.pagination.current_page + 1)
  }
}

const prevPage = () => {
  if (props.pagination && props.pagination.current_page > 1) {
    changePage(props.pagination.current_page - 1)
  }
}
</script>

<template>
  <div class="user-history-feed">
    <!-- Segmented Type Filter -->
    <div class="filter-segment-group">
      <button
        v-for="opt in filterTypeOptions"
        :key="opt.value || 'all-type'"
        :class="[
          'segment-btn',
          {
            active: type === opt.value,
            'type-innovation': opt.value === 'innovation',
            'type-criticism': opt.value === 'criticism'
          }
        ]"
        type="button"
        @click="type = opt.value"
      >
        <component :is="opt.icon" v-if="opt.icon" class="segment-icon" />
        <span>{{ opt.label }}</span>
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="feed-list">
      <div v-for="n in 4" :key="n" class="skeleton-row">
        <div class="skeleton-icon" />
        <div class="skeleton-main">
          <div class="skeleton-title" />
          <div class="skeleton-meta" />
        </div>
        <div class="skeleton-badge" />
      </div>
    </div>

    <!-- Feed Content List -->
    <div v-else-if="items.length > 0" class="feed-list">
      <article
        v-for="item in items"
        :key="item.id"
        :class="['inbox-row-card', `type-${item.type}`]"
        @click="emit('select', item)"
      >
        <div :class="['row-icon-box', `type-${item.type}`]">
          <component :is="item.type === 'innovation' ? IconIdea : IconCriticism" class="row-icon" />
        </div>

        <div class="row-main">
          <h4 class="row-title">{{ item.subject }}</h4>
          <div class="row-meta">
            <span :class="['meta-type', `type-${item.type}`]">
              {{ item.type === 'innovation' ? 'Inovasi' : 'Kritik & Saran' }}
            </span>
            <span class="meta-dot" />
            <time class="meta-date">{{ formatDate(item.created_at) }}</time>
          </div>
        </div>

        <div class="row-actions">
          <BaseBadge :value="item.status" />
          <IconChevronRight class="row-chevron" />
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div :class="['empty-icon-badge', `type-${emptyStateConfig.variant}`]">
        <component :is="emptyStateConfig.icon" class="empty-icon" />
      </div>
      <div class="empty-text">
        <h3>{{ emptyStateConfig.title }}</h3>
        <p>{{ emptyStateConfig.desc }}</p>
      </div>
      <div class="empty-action">
        <BaseButtonDefault
          v-if="hasActiveFilter"
          variant="secondary"
          label="Tampilkan Semua"
          @click="emit('reset')"
        />
        <BaseButtonDefault
          v-else
          variant="primary"
          label="Kirim Aspirasi Sekarang"
          :icon="IconAdd"
          @click="emit('create')"
        />
      </div>
    </div>

    <!-- Pagination Controls -->
    <footer v-if="pagination && pagination.total_pages > 1" class="history-pagination">
      <div class="pagination-info">
        <span>Menampilkan <span>{{ currentRange }}</span> dari <span>{{ pagination.total_data }}</span> data</span>
      </div>

      <div class="pagination-controls">
        <button
          class="page-btn page-nav"
          :disabled="pagination.current_page === 1"
          type="button"
          aria-label="Halaman Sebelumnya"
          @click="prevPage"
        >
          <IconChevronLeft class="nav-icon" />
        </button>

        <button
          v-for="(item, index) in availablePages"
          :key="index"
          :class="['page-btn', { 'is-active': isCurrentPage(item) }]"
          :disabled="item === '...'"
          type="button"
          @click="changePage(item)"
        >
          <span>{{ item }}</span>
        </button>

        <button
          class="page-btn page-nav"
          :disabled="pagination.current_page === pagination.total_pages"
          type="button"
          aria-label="Halaman Selanjutnya"
          @click="nextPage"
        >
          <IconChevronRight class="nav-icon" />
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.user-history-feed {
  width: 100%;
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: var(--size-s);
}

/* Full Width Segmented Category Tab */
.filter-segment-group {
  width: 100%;

  display: flex;
  align-items: center;

  padding: var(--size-5xs);
  border-radius: var(--size-xs);

  background-color: var(--grey-100);
  border: 1px solid var(--grey-200);
  gap: var(--size-5xs);
}

.segment-btn {
  flex: 1;
  cursor: pointer;
  border: 1px solid transparent;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: var(--size-4xs);
  padding: var(--size-3xs) var(--size-xs);
  border-radius: var(--size-xxs);

  font-size: var(--size-xs);
  font-weight: var(--font-medium);
  color: var(--grey-600);
  background-color: transparent;
  transition: all var(--transition-fast) var(--transition-smooth);
}

.segment-icon {
  width: var(--size-s);
  height: var(--size-s);
  flex-shrink: 0;
}

.segment-btn.active {
  background-color: var(--white);
  border-color: var(--grey-200);
  color: var(--grey-900);
  font-weight: var(--font-semibold);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.segment-btn.type-innovation.active {
  color: var(--blue-600);
  border-color: var(--blue-200);
  background-color: var(--blue-50);
}

.segment-btn.type-criticism.active {
  color: var(--yellow-700);
  border-color: var(--yellow-200);
  background-color: var(--yellow-50);
}

@media (hover: hover) {
  .segment-btn:hover:not(.active) {
    color: var(--grey-800);
    background-color: var(--grey-200);
  }
}

/* Feed List (Corporate Inbox Style) */
.feed-list {
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: var(--size-3xs);
}

.inbox-row-card {
  width: 100%;
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: var(--size-s);

  padding: var(--size-xs) var(--size-s);
  border-radius: var(--size-xs);

  background-color: var(--white);
  border: 1px solid var(--grey-200);
  transition: all var(--transition-fast) var(--transition-smooth);
}

.row-icon-box {
  width: var(--size-3xl);
  height: var(--size-3xl);
  border-radius: var(--size-xs);
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: var(--grey-100);
  border: 1px solid var(--grey-200);
  color: var(--grey-500);
  transition: all var(--transition-fast) var(--transition-smooth);
}

.row-icon-box.type-innovation {
  background-color: var(--blue-50);
  border-color: var(--blue-200);
  color: var(--blue-600);
}

.row-icon-box.type-criticism {
  background-color: var(--yellow-50);
  border-color: var(--yellow-200);
  color: var(--yellow-700);
}

.row-icon {
  width: var(--size-m);
  height: var(--size-m);
  color: currentColor;
}

.row-main {
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: var(--size-5xs);
}

.row-title {
  font-size: var(--size-s);
  font-weight: var(--font-medium);
  color: var(--grey-800);
  line-height: 1.35;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-meta {
  display: flex;
  align-items: center;
  gap: var(--size-4xs);

  font-size: var(--size-xs);
  font-weight: var(--font-regular);
  font-family: var(--font-secondary);
  color: var(--grey-400);
}

.meta-type {
  color: var(--grey-500);
  font-weight: var(--font-medium);
}

.meta-type.type-innovation {
  color: var(--blue-600);
}

.meta-type.type-criticism {
  color: var(--yellow-700);
}

.meta-dot {
  width: var(--size-5xs);
  height: var(--size-5xs);
  border-radius: 50%;
  background-color: var(--grey-300);
  flex-shrink: 0;
}

.meta-date {
  color: var(--grey-400);
}

.row-actions {
  display: flex;
  align-items: center;
  gap: var(--size-xs);
  flex-shrink: 0;
}

.row-chevron {
  width: var(--size-m);
  height: var(--size-m);
  color: var(--grey-300);
}

@media (hover: hover) {
  .inbox-row-card:hover {
    border-color: var(--grey-300);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  }

  .inbox-row-card.type-innovation:hover {
    border-color: var(--blue-200);
  }

  .inbox-row-card.type-criticism:hover {
    border-color: var(--yellow-200);
  }
}

/* Empty State */
.empty-state {
  width: 100%;
  flex: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  gap: var(--size-s);
  padding: var(--size-xl) var(--size-m);
}

.empty-icon-badge {
  width: var(--size-5xl);
  height: var(--size-5xl);
  border-radius: var(--size-s);

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all var(--transition-fast) var(--transition-smooth);
}

.empty-icon-badge.type-default {
  background-color: var(--grey-100);
  border: 1px solid var(--grey-200);
  color: var(--grey-500);
}

.empty-icon-badge.type-innovation {
  background-color: var(--blue-50);
  border: 1px solid var(--blue-200);
  color: var(--blue-600);
}

.empty-icon-badge.type-criticism {
  background-color: var(--yellow-50);
  border: 1px solid var(--yellow-200);
  color: var(--yellow-700);
}

.empty-icon-badge .empty-icon {
  width: var(--size-xxl);
  height: var(--size-xxl);
  color: currentColor;
}

.empty-text {
  max-width: 400px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-4xs);
}

.empty-text h3 {
  font-size: var(--size-m);
  font-weight: var(--font-bold);
  color: var(--grey-800);
}

.empty-text p {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
  color: var(--grey-500);
  line-height: 1.5;
}

.empty-action {
  margin-top: var(--size-4xs);
}

/* Skeleton Loading (Inbox Row Style) */
.skeleton-row {
  width: 100%;

  display: flex;
  align-items: center;
  gap: var(--size-s);

  padding: var(--size-xs) var(--size-s);
  border-radius: var(--size-xs);

  background-color: var(--white);
  border: 1px solid var(--grey-200);
}

.skeleton-icon {
  width: var(--size-3xl);
  height: var(--size-3xl);
  border-radius: var(--size-xs);
  background-color: var(--grey-100);
  flex-shrink: 0;
}

.skeleton-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--size-5xs);
}

.skeleton-title {
  height: var(--size-s);
  width: 60%;
  border-radius: var(--size-5xs);
  background-color: var(--grey-100);
}

.skeleton-meta {
  height: var(--size-xs);
  width: 35%;
  border-radius: var(--size-5xs);
  background-color: var(--grey-100);
}

.skeleton-badge {
  width: var(--size-5xl);
  height: var(--size-l);
  border-radius: var(--size-3xl);
  background-color: var(--grey-100);
  flex-shrink: 0;
}

/* Pagination */
.history-pagination {
  width: 100%;
  margin-top: auto;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--size-s);
  padding-top: var(--size-s);
  border-top: 1px solid var(--grey-200);
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: var(--size-5xs);
}

.pagination-info span {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
  color: var(--grey-500);
}

.pagination-info span span {
  font-weight: var(--font-bold);
  color: var(--grey-700);
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  border-radius: var(--size-xs);
  border: 1px solid var(--grey-200);
}

.page-btn {
  height: var(--size-3xl);
  min-width: var(--size-3xl);
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  padding: var(--size-xs);

  border: none;
  background-color: var(--white);
  border-right: 1px solid var(--grey-200);
  transition: all var(--transition-fast) var(--transition-smooth);
}

.page-btn:last-child {
  border-right: none;
}

.page-btn.page-nav {
  padding: var(--size-xxs);
}

.page-btn:disabled {
  cursor: default;
}

.page-btn.page-nav:disabled,
.page-btn.is-active {
  background-color: var(--grey-50);
}

.page-btn span {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
  color: var(--grey-500);
}

.page-btn:disabled span {
  color: var(--grey-400);
}

.page-btn.is-active span {
  font-weight: var(--font-bold);
  color: var(--grey-600);
}

.page-btn .nav-icon {
  width: var(--size-xs);
  height: var(--size-xs);
  color: var(--grey-500);
}

.page-btn:disabled .nav-icon {
  color: var(--grey-400);
}

@media (hover: hover) {
  .page-btn:hover:not(:disabled):not(.is-active) {
    background-color: var(--grey-50);
  }

  .page-btn:hover:not(:disabled):not(.is-active) span {
    color: var(--grey-700);
  }

  .page-btn:hover:not(:disabled):not(.is-active) .nav-icon {
    color: var(--grey-700);
  }
}

@media (max-width: 640px) {
  .filter-segment-group {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .history-pagination {
    flex-direction: column;
    align-items: center;
    gap: var(--size-s);
  }
}
</style>
