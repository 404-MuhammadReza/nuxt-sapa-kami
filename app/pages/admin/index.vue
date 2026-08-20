<script setup>
import VueApexCharts from 'vue3-apexcharts'

import IconDashboard from '~/assets/icons/menu/dashboard-outline.svg?component'
import IconCriticism from '~/assets/icons/menu/criticism-outline.svg?component'
import IconMessage from '~/assets/icons/menu/message-outline.svg?component'
import IconShow from '~/assets/icons/actions/password-show.svg?component'
import IconUsers from '~/assets/icons/menu/users-outline.svg?component'
import IconIdea from '~/assets/icons/menu/idea-outline.svg?component'
import IconChevron from '~/assets/icons/chevron/right.svg?component'

definePageMeta({ layout: 'admin' })
const path = ['Admin', 'Dashboard']

const { getDashboard } = useAPI()
const { data } = await useAsyncData('dashboard', () => getDashboard(), {
  getCachedData: (key, nuxtApp) => {
    if (nuxtApp.isHydrating) {
      const cached = nuxtApp.payload.data[key]
      return cached === null ? undefined : cached
    }

    return undefined
  }
})

// Helper Functions
// Format percentage value with + or - sign
const formatPercentage = (value) => {
  if (!value) return '0%'
  if (value > 0) return `+${value}%`
  return `${value}%`
}

// Determine the variant based on the percentage value
const getVariant = (value) => {
  if (!value) return 'neutral'
  if (value < 0) return 'danger'
  if (value > 0) return 'success'
  return 'neutral'
}

// Get the card title based on the key
const getCardTitle = (key) => {
  switch (key) {
    case 'aspirations': return 'Aspirasi'
    case 'innovations': return 'Inovasi'
    case 'criticisms': return 'Kritik & Saran'
    case 'active_users': return 'Pengguna Aktif'
    default: return key
  }
}

// Get the card description based on the key
const getCardDescription = (key) => {
  switch (key) {
    case 'aspirations': return 'Total aspirasi bulan ini'
    case 'innovations': return 'Total inovasi bulan ini'
    case 'criticisms': return 'Total kritik & saran bulan ini'
    case 'active_users': return 'Total pengguna aktif bulan ini'
    default: return ''
  }
}

// Get the card icon based on the key
const getCardIcon = (key) => {
  switch (key) {
    case 'aspirations': return IconMessage
    case 'innovations': return IconIdea
    case 'criticisms': return IconCriticism
    case 'active_users': return IconUsers
    default: return IconDashboard
  }
}

const sparklineOptions = (variant) => {
  let color = 'var(--grey-500)'
  if (variant === 'success') color = 'var(--green-500)'
  if (variant === 'danger') color = 'var(--red-500)'

  return {
    chart: {
      type: 'area',
      sparkline: { enabled: true },
      animations: { enabled: true, easing: 'easeinout', speed: 800, dynamicAnimation: { enabled: true, speed: 350 } },
      selection: { enabled: false }
    },
    states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] }
    },
    colors: [color],
    tooltip: { enabled: false },
  }
}

const kpis = computed(() => {
  if (!data.value?.kpis) return []

  return Object.entries(data.value.kpis).map(([key, kpi]) => {
    const variant = getVariant(kpi.percentage)

    return {
      id: key,
      title: getCardTitle(key),
      icon: getCardIcon(key),
      description: getCardDescription(key),
      total: kpi.total,
      percentage: `${formatPercentage(kpi.percentage)} dari bulan lalu`,
      variant: variant,
      sparklineSeries: [{ name: 'Trend', data: kpi.sparkline }],
      sparklineOptions: sparklineOptions(variant)
    }
  })
})

const chartState = ref('weekly')
const switchChartState = (state) => {
  if (['weekly', 'monthly'].includes(state)) {
    chartState.value = state
  }
}

const chartData = computed(() => {
  if (!data.value || !data.value.charts) return { labels: [], datasets: [] }

  const rawData = chartState.value === 'weekly'
    ? data.value.charts.weekly || []
    : data.value.charts.monthly || []

  const labels = rawData.map(item => {
    const dateObj = new Date(item.date)
    return new Intl.DateTimeFormat('id-ID', {
      weekday: chartState.value === 'weekly' ? 'short' : undefined,
      month: chartState.value === 'monthly' ? 'short' : undefined
    }).format(dateObj)
  })

  const datasets = [
    { name: 'Inovasi', data: rawData.map(item => item.innovations || 0) },
    { name: 'Kritik dan Saran', data: rawData.map(item => item.criticisms || 0) }
  ]

  return { labels, datasets }
})

const chartOptions = computed(() => ({
  chart: { type: 'area', fontFamily: 'var(--font-secondary)', toolbar: { show: false }, zoom: { enabled: true } },
  colors: ['var(--blue-500)', 'var(--yellow-500)'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 90, 100] } },
  xaxis: {
    categories: chartData.value.labels,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: 'var(--grey-500)', fontFamily: 'var(--font-secondary)', fontWeight: 'var(--font-regular)' } }
  },
  yaxis: {
    labels: { style: { colors: 'var(--grey-500)', fontFamily: 'var(--font-secondary)', fontWeight: 'var(--font-regular)' } }
  },
  grid: { borderColor: 'var(--grey-200)', strokeDashArray: 4 },
  legend: { position: 'top', horizontalAlign: 'right', markers: { radius: 12 } },
  markers: { size: 0, hover: { size: 5 } },
  tooltip: { theme: 'light', shared: true, intersect: false }
}))

const tableColumns = [
  { key: 'sender.name', label: 'Pengirim', align: 'left', type: 'text', width: '25%' },
  { key: 'type', label: 'Kategori', align: 'center', type: 'badge', width: '20%' },
  { key: 'subject', label: 'Subjek', align: 'left', type: 'text', width: '40%' },
  { key: 'created_at', label: 'Tanggal', align: 'center', type: 'date', width: '15%' },
  { key: 'row-actions', label: 'Aksi', align: 'center', type: 'slot', width: '10%' }
]

const selectedAspiration = ref(null)
const handleSetAspiration = (row = null) => {
  selectedAspiration.value = row
}
</script>

<template>
  <div class="dashboard-page">
    <UiPageHeader
      :path="path"
      :icon="IconDashboard"
      title="Dashboard"
      subtitle="Ringkasan informasi dan statistik sistem"
    />

    <div class="content">
      <div class="kpis-list">
        <div v-for="kpi in kpis" :key="kpi.id" class="card kpi">
          <div class="header">
            <div class="icon-wrapper">
              <component :is="kpi.icon" class="kpi-icon" />
            </div>
            <div class="title">
              <h2>{{ kpi.title }}</h2>
              <span>{{ kpi.description }}</span>
            </div>
          </div>
          <div class="value">
            <h3>{{ kpi.total }}</h3>
            <BaseBadge :value="kpi.percentage" :variant="kpi.variant" />
          </div>
          <div class="chart-wrapper">
            <ClientOnly>
              <VueApexCharts
                width="100%"
                height="100%"
                :options="kpi.sparklineOptions"
                :series="kpi.sparklineSeries"
              />
            </ClientOnly>
          </div>
        </div>
      </div>

      <div class="card aspirations-chart">
        <div class="header">
          <div class="title">
            <h2>Tren Aspirasi</h2>
            <span>Distribusi inovasi, kritik & saran</span>
          </div>
          <div class="switcher">
            <button :class="{'active': chartState === 'weekly'}" @click="switchChartState('weekly')">Mingguan</button>
            <button :class="{'active': chartState === 'monthly'}" @click="switchChartState('monthly')">Bulanan</button>
          </div>
        </div>
        <div class="chart-wrapper">
          <ClientOnly>
            <VueApexCharts
              width="100%"
              height="300"
              :options="chartOptions"
              :series="chartData.datasets"
            />
          </ClientOnly>
        </div>
      </div>

      <div class="card latest-aspirations">
        <div class="header">
          <div class="title">
            <h2>Aspirasi Terbaru</h2>
            <span>Daftar aspirasi terbaru dari pengguna</span>
          </div>
          <NuxtLink to="/admin/aspirations" class="view-all">
            <span>Lihat semua</span>
            <IconChevron class="icon-chevron" />
          </NuxtLink>
        </div>
        <UiTable :columns="tableColumns" :data="data.latest_aspirations">
          <template #row-actions="{ row }">
            <div class="row-actions">
              <IconShow class="icon-action view" @click.stop="handleSetAspiration(row)" />
            </div>
          </template>
        </UiTable>
      </div>
    </div>
    <Transition name="drawer">
      <FeaturesAspirationModalView
        v-if="selectedAspiration"
        v-model="selectedAspiration"
        @close="handleSetAspiration()"
      />
    </Transition>
  </div>
</template>

<style scoped>
.dashboard-page {
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: var(--size-l);
  padding: var(--size-l);
}

.dashboard-page .content {
  width: 100%;
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: var(--size-l);
}

.dashboard-page .card {
  width: 100%;

  display: flex;
  flex-direction: column;
  overflow: hidden;

  gap: var(--size-s);
  padding: var(--size-s);
  border-radius: var(--size-s);

  background-color: var(--white);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.075);
}

.dashboard-page .card .header {
  display: flex;
  align-items: center;
  gap: var(--size-xs);
}

.dashboard-page .card .header .title {
  display: flex;
  flex-direction: column;

  gap: var(--size-xxs);
}

.dashboard-page .card .header .title h2 {
  font-size: var(--size-m);
  font-weight: var(--font-bold);

  color: var(--grey-700);
}

.dashboard-page .card .header .title span {
  font-size: var(--size-s);
  font-weight: var(--font-regular);

  color: var(--grey-400);
}

.dashboard-page .kpis-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--size-l);
}

.dashboard-page .kpis-list .card.kpi {
  position: relative;
}

.dashboard-page .kpis-list .card.kpi .header,
.dashboard-page .kpis-list .card.kpi .value {
  position: relative;
  z-index: 2;
}

.dashboard-page .kpis-list .card.kpi .header .icon-wrapper {
  width: var(--size-5xl);
  height: var(--size-5xl);
  flex-shrink: 0;

  display: flex;
  align-items: center;

  gap: var(--size-xs);
  padding: var(--size-xs);
  border-radius: var(--size-xs);

  background-color: var(--grey-50);
  border: 1px solid var(--grey-200);
}

.dashboard-page .kpis-list .card.kpi .header .icon-wrapper .kpi-icon {
  width: var(--size-3xl);
  height: var(--size-3xl);

  color: var(--grey-400);
}

.dashboard-page .kpis-list .card.kpi .value {
  display: flex;
  flex-direction: column;
  gap: var(--size-xs);
}

.dashboard-page .kpis-list .card.kpi .value h3 {
  font-size: var(--size-3xl);
  font-weight: var(--font-extrabold);

  color: var(--grey-800);
}

.dashboard-page .kpis-list .card.kpi .chart-wrapper {
  width: 45%;
  height: 50%;

  position: absolute;
  bottom: 0; right: -0;
}

.dashboard-page .card:is(.aspirations-chart, .latest-aspirations) .header {
  width: 100%;
  justify-content: space-between;
}

.dashboard-page .card.aspirations-chart .header .switcher {
  display: flex;
  align-items: center;

  gap: var(--size-5xs);
  padding: var(--size-5xs);
  border-radius: var(--size-xs);

  background-color: var(--grey-50);
  border: 1px solid var(--grey-200);
}

.dashboard-page .card.aspirations-chart .header .switcher button {
  cursor: pointer;
  border-radius: var(--size-xxs);
  padding: var(--size-3xs) var(--size-s);

  font-size: var(--size-s);
  font-weight: var(--font-medium);

  color: var(--grey-400);
  background-color: transparent;
  border: 1px solid transparent;

  transition: color var(--transition-normal) var(--transition-smooth),
              border-color var(--transition-normal) var(--transition-smooth),
              background-color var(--transition-normal) var(--transition-smooth);
}

.dashboard-page .card.aspirations-chart .header .switcher button.active {
  color: var(--grey-700);
  background-color: var(--white);
  border: 1px solid var(--grey-200);
}

.dashboard-page .card.latest-aspirations {
  gap: 0;
  padding: 0;
}

.dashboard-page .card.latest-aspirations .header {
  gap: var(--size-xxs);
  padding: var(--size-s);
}

.dashboard-page .card.latest-aspirations .header a.view-all {
  display: flex;
  align-items: center;
  gap: var(--size-5xs);

  text-decoration: none;
  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.dashboard-page .card.latest-aspirations .header a.view-all:hover {
  text-decoration: underline;
  color: var(--grey-600);
}

.dashboard-page .card.latest-aspirations .header a.view-all span {
  font-size: var(--size-s);
  font-weight: var(--font-regular);

  white-space: nowrap;
}

.dashboard-page .card.latest-aspirations .header a.view-all .icon-chevron {
  width: var(--size-s);
  height: var(--size-s);
  flex-shrink: 0;
}

.dashboard-page .card.latest-aspirations .header a.view-all .icon-chevron * {
  stroke-width: 1.75;
}

.dashboard-page .card.latest-aspirations .chart-wrapper {
  width: 100%;
}

.dashboard-page .card.latest-aspirations :deep(.table-container) {
  box-shadow: none;
}

.dashboard-page .card.latest-aspirations :deep(.table-container .table-wrapper table tbody tr:last-child) {
  border-bottom: none;
}

.dashboard-page .card.latest-aspirations :deep(.table-container .table-wrapper table tbody tr td:has(.wrapper.no-body)) {
  background-color: var(--white);
}

.dashboard-page .card.latest-aspirations .row-actions {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: var(--size-s);
}

.dashboard-page .card.latest-aspirations .row-actions .icon-action {
  width: var(--size-xl);
  height: var(--size-xl);
  flex-shrink: 0;

  cursor: pointer;
  position: relative;

  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.dashboard-page .card.latest-aspirations .row-actions .icon-action:hover {
  color: var(--blue-600);
}
</style>
