<script setup>
import IconClose from '~/assets/icons/actions/close.svg?component'
import IconCalendar from '~/assets/icons/calendar.svg?component'
import IconChevronLeft from '~/assets/icons/chevron/left.svg?component'
import IconChevronRight from '~/assets/icons/chevron/right.svg?component'

const props = defineProps({
  width: { type: String, default: '100%' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Pilih tanggal' },
  showLabel: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  position: {
    type: String,
    default: 'bottom',
    validator: (val) => ['center', 'top', 'bottom', 'left', 'right'].includes(val)
  }
})

const model = defineModel({ type: [String, null], required: true })

const calendarState = ref(false)
const setState = (state) => {
  if (typeof state === 'boolean') calendarState.value = state
  else calendarState.value = !calendarState.value

  if (calendarState.value) {
    syncViewDate()
    viewMode.value = 'date'
  }
}

const inputRef = ref(null)
onClickOutside(inputRef, () => setState(false))

const dayjs = useDayjs()
const viewMode = ref('date')
const viewDate = ref(dayjs())
const selectedDate = ref(null)

const daysOptions = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const monthOptions = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const shortMonthsOptions = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des']

const displayValue = computed(() => {
  if (!model.value) return ''
  const d = dayjs(model.value)
  if (!d.isValid()) return model.value

  return `${d.format('DD')} ${monthOptions[d.month()]} ${d.format('YYYY')}`
})

const syncViewDate = () => {
  if (model.value) {
    const d = dayjs(model.value)
    if (d.isValid()) {
      selectedDate.value = d.startOf('day').toDate()
      viewDate.value = d.startOf('month').toDate()
      return
    }
  }
  selectedDate.value = null
  viewDate.value = dayjs().startOf('month').toDate()
}

onMounted(() => syncViewDate())

// 3. Fungsi untuk menghapus tanggal
const clearDate = () => {
  model.value = null
  selectedDate.value = null
  viewDate.value = dayjs().startOf('month').toDate()
}

const prev = () => {
  if (viewMode.value === 'date') viewDate.value = dayjs(viewDate.value).subtract(1, 'month').toDate()
  else if (viewMode.value === 'month') viewDate.value = dayjs(viewDate.value).subtract(1, 'year').toDate()
  else if (viewMode.value === 'year') viewDate.value = dayjs(viewDate.value).subtract(12, 'year').toDate()
}

const next = () => {
  if (viewMode.value === 'date') viewDate.value = dayjs(viewDate.value).add(1, 'month').toDate()
  else if (viewMode.value === 'month') viewDate.value = dayjs(viewDate.value).add(1, 'year').toDate()
  else if (viewMode.value === 'year') viewDate.value = dayjs(viewDate.value).add(12, 'year').toDate()
}

const calendarDays = computed(() => {
  const target = dayjs(viewDate.value)
  const firstDay = target.startOf('month').day()
  const daysInMonth = target.daysInMonth()
  const prevMonth = target.subtract(1, 'month')
  const daysInPrevMonth = prevMonth.daysInMonth()

  const days = []
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ date: daysInPrevMonth - i, isCurrentMonth: false, fullDate: prevMonth.date(daysInPrevMonth - i).toDate() })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: i, isCurrentMonth: true, fullDate: target.date(i).toDate() })
  }

  const remaining = 42 - days.length
  const nextMonth = target.add(1, 'month')
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: i, isCurrentMonth: false, fullDate: nextMonth.date(i).toDate() })
  }

  return days
})

const yearRange = computed(() => {
  const currentYear = viewDate.value.getFullYear()
  const startYear = Math.floor(currentYear / 12) * 12
  return Array.from({ length: 12 }, (_, i) => startYear + i)
})

const selectDay = (day) => {
  selectedDate.value = day.fullDate
  if (!day.isCurrentMonth) viewDate.value = dayjs(day.fullDate).startOf('month').toDate()

  model.value = dayjs(day.fullDate).format('YYYY-MM-DD')
  setState(false)
}

const selectMonth = (index) => {
  viewDate.value = dayjs(viewDate.value).month(index).toDate()
  viewMode.value = 'date'
}

const selectYear = (year) => {
  viewDate.value = dayjs(viewDate.value).year(year).toDate()
  viewMode.value = 'month'
}

const isSameDay = (d1, d2) => d1 && d2 && dayjs(d1).isSame(d2, 'day')

const headerTitle = computed(() => {
  if (viewMode.value === 'year') return `${yearRange.value[0]} - ${yearRange.value[11]}`
  return ''
})

const inputClass = computed(() => {
  return {
    'placeholder': !displayValue.value,
    'required': props.required
  }
})
</script>

<template>
  <div ref="inputRef" class="input-wrapper" :class="inputClass">
    <label v-if="showLabel" :for="label">{{ label }}</label>

    <div class="container" @click="setState(true)">
      <span>{{ displayValue || placeholder }}</span>
      <IconClose v-if="clearable && model" class="icon-clear" @click.stop="clearDate" />
      <IconCalendar v-else class="icon-date" />
    </div>

    <Transition name="calendarState">
      <div v-if="calendarState" class="calendar-wrapper" :class="position">
        <header>
          <IconChevronLeft class="icon-chevron" @click.stop="prev" />
          <div class="selectors">
            <template v-if="['date', 'month'].includes(viewMode)">
              <span @click.stop="viewMode = 'month'">{{ monthOptions[viewDate.getMonth()] }}</span>
              <span @click.stop="viewMode = 'year'">{{ viewDate.getFullYear() }}</span>
            </template>
            <span v-else class="disabled">{{ headerTitle }}</span>
          </div>
          <IconChevronRight class="icon-chevron" @click.stop="next" />
        </header>

        <div v-if="viewMode === 'date'" class="date">
          <span v-for="day in daysOptions" :key="day">{{ day }}</span>
          <button
            v-for="(day, index) in calendarDays"
            :key="index"
            type="button"
            :class="{
              'muted': !day.isCurrentMonth,
              'selected': isSameDay(day.fullDate, selectedDate)
            }"
            @click.stop="selectDay(day)">
            {{ day.date }}
          </button>
        </div>

        <div v-if="viewMode === 'month'" class="month-year">
          <button
            v-for="(month, index) in shortMonthsOptions"
            :key="month"
            type="button"
            :class="{ 'selected': index === viewDate.getMonth() }"
            @click.stop="selectMonth(index)">
            {{ month }}
          </button>
        </div>

        <div v-if="viewMode === 'year'" class="month-year">
          <button
            v-for="year in yearRange"
            :key="year"
            type="button"
            :class="{ 'selected': year === viewDate.getFullYear() }"
            @click.stop="selectYear(year)">
            {{ year }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.input-wrapper {
  width: v-bind(width);
  position: relative;

  display: flex;
  flex-direction: column;
  gap: var(--size-3xs);
}

.input-wrapper label {
  font-size: var(--size-s);
  font-weight: var(--font-medium);
  color: var(--grey-700);
}

.input-wrapper.required label::after {
  content: '*';
  margin-left: 2px;
  color: var(--red-500);
}

.input-wrapper .container {
  width: 100%;
  flex: 1;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: var(--size-xs);
  border-radius: var(--size-xs);
  background-color: var(--grey-50);
  border: 1px solid var(--grey-200);

  transition: border-color var(--transition-fast) var(--transition-smooth);
}

.input-wrapper .container span {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
  color: var(--grey-600);
}

.input-wrapper.placeholder .container span {
  color: var(--grey-400);
}

.input-wrapper .container .icon-date {
  width: var(--size-s);
  height: var(--size-s);
}

.input-wrapper .container .icon-clear {
  width: var(--size-xxs);
  height: var(--size-xxs);
}

.input-wrapper .container .icon-date,
.input-wrapper .container .icon-clear {
  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.input-wrapper .calendar-wrapper {
  min-width: 300px;
  position: absolute;
  z-index: 10;

  border-radius: var(--size-xs);
  background-color: var(--white);
  border: 1px solid var(--grey-200);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.input-wrapper .calendar-wrapper.center {
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) scale(1);
}

.input-wrapper .calendar-wrapper.bottom {
  left: 50%;
  transform: translateX(-50%);
  top: calc(100% + var(--size-3xs));
}

.input-wrapper .calendar-wrapper.top {
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(100% + var(--size-3xs));
}

.input-wrapper .calendar-wrapper.right {
  top: 50%;
  transform: translateY(-50%);
  left: calc(100% + var(--size-3xs));
}

.input-wrapper .calendar-wrapper.left {
  top: 50%;
  transform: translateY(-50%);
  right: calc(100% + var(--size-3xs));
}

.input-wrapper .calendar-wrapper header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: var(--size-xs) var(--size-s);
  border-bottom: 1px solid var(--grey-200);
}

.input-wrapper .calendar-wrapper header .icon-chevron {
  width: var(--size-s);
  height: var(--size-s);

  cursor: pointer;
  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.input-wrapper .calendar-wrapper header .icon-chevron * {
  stroke-width: 1.75;
}

.input-wrapper .calendar-wrapper header .selectors {
  display: flex;
  gap: var(--size-3xs);
}

.input-wrapper .calendar-wrapper header .selectors span {
  cursor: pointer;
  font-size: var(--size-s);
  font-weight: var(--font-medium);
  color: var(--grey-600);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.input-wrapper .calendar-wrapper header .selectors span.disabled {
  cursor: default;
}

.input-wrapper .calendar-wrapper .date {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--size-4xs);
  padding: var(--size-xs);
}

.input-wrapper .calendar-wrapper .date span {
  font-size: var(--size-xs);
  font-weight: var(--font-medium);
  text-align: center;
  color: var(--grey-500);
  margin-bottom: var(--size-4xs);
}

.input-wrapper .calendar-wrapper .month-year {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--size-xxs);
  padding: var(--size-s);
}

.input-wrapper .calendar-wrapper button {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
  cursor: pointer;
  border-radius: var(--size-3xs);
  background-color: transparent;
  color: var(--grey-600);
  border: 1px solid transparent;
  transition: all var(--transition-fast) var(--transition-smooth);
}

.input-wrapper .calendar-wrapper .date button {
  width: 100%;
  aspect-ratio: 1;
}

.input-wrapper .calendar-wrapper .month-year button {
  padding: var(--size-xs);
}

.input-wrapper .calendar-wrapper button.muted {
  color: var(--grey-400);
}

.input-wrapper .calendar-wrapper button.selected {
  background-color: var(--grey-100);
  color: var(--grey-700);
  font-weight: var(--font-bold);
}

.calendarState-enter-active, .calendarState-leave-active {
  transition: opacity var(--transition-normal) var(--transition-smooth),
              transform var(--transition-normal) var(--transition-smooth);
}

.calendarState-enter-from, .calendarState-leave-to {
  opacity: 0;
  transform: translateY(calc(var(--size-4xs) * -1));
}

@media (hover: hover) {
  .input-wrapper .container .icon-clear:hover {
    color: var(--red-500);
  }

  .input-wrapper .calendar-wrapper header .icon-chevron:hover {
    color: var(--grey-600);
  }

  .input-wrapper .calendar-wrapper header .selectors span:hover:not(.disabled) {
    color: var(--grey-800);
  }

  .input-wrapper .calendar-wrapper button:hover {
    background-color: var(--grey-50);
  }
}
</style>
