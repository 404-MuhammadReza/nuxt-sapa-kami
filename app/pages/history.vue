<script setup>
const filter = reactive({
  type: null,
  limit: 5,
  page: 1
})

const { getUserAspirations } = useAPI()

const { data: historyData, pending: isHistoryLoading, refresh: refreshHistory } = await useAsyncData(
  'user-aspirations-history-page',
  () => getUserAspirations(filter),
  {
    getCachedData: (key, nuxtApp) => {
      if (nuxtApp.isHydrating) {
        const cached = nuxtApp.payload.data[key]
        return cached === null ? undefined : cached
      }
      return undefined
    },
    watch: filter,
    deep: true,
    lazy: true
  }
)

const userAspirations = computed(() => historyData.value?.data || [])
const pagination = computed(() => historyData.value?.pagination || null)

watch(() => filter.type, () => {
  filter.page = 1
})

const resetFilter = () => {
  filter.type = null
  filter.page = 1
}

const selectedAspiration = ref(null)
const handleSetAspiration = (row = null) => {
  selectedAspiration.value = row
}
</script>

<template>
  <div class="history-page">
    <BaseContainer max-width="1000px">
      <div class="content-wrapper">
        <!-- User Profile & Menu Navigation -->
        <FeaturesUserCard />

        <!-- Feed Section with Refined Cards -->
        <div class="feed-section">
          <FeaturesUserHistoryFeed
            v-model:type="filter.type"
            v-model:page="filter.page"
            :items="userAspirations"
            :pagination="pagination"
            :loading="isHistoryLoading"
            @select="handleSetAspiration"
            @create="navigateTo('/')"
            @reset="resetFilter"
          />
        </div>
      </div>
    </BaseContainer>

    <Transition name="drawer">
      <FeaturesAspirationModalView
        v-if="selectedAspiration"
        v-model="selectedAspiration"
        @close="handleSetAspiration()"
        @updated="refreshHistory()"
      />
    </Transition>
  </div>
</template>

<style scoped>
.history-page {
  width: 100%;
  flex: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
}

.history-page .content-wrapper {
  width: 100%;
  z-index: 2;
  flex: 1;

  display: flex;
  flex-direction: column;

  gap: var(--size-s);
}

.feed-section {
  width: 100%;
  flex: 1;

  display: flex;
  flex-direction: column;

  gap: var(--size-s);
  padding-top: var(--size-s);
  border-top: 1px solid var(--grey-200);
}
</style>
