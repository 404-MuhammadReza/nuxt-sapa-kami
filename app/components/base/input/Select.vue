<script setup>
import IconChevron from '~/assets/icons/chevron/down.svg?component'

const props = defineProps({
  maxHeight: { type: String, default: '400px' },
  label: { type: String, default: '' },
  icon: { type: [Object, null], default: null },
  options: { type: Array, required: true },
  placeholder: { type: String, default: null },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  showLabel: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  variant: { type: String, default: 'light', validator: (value) => ['light', 'dark'].includes(value) },
  direction: { type: String, default: 'down', validator: (value) => ['up', 'down'].includes(value) }
})

const model = defineModel({ type: [String, Number, Boolean, null], required: true })
const displayValue = computed(() => {
  if (!props.options) return null
  const selected = props.options.find(opt => getValue(opt) === model.value)
  return selected ? getLabel(selected) : null
})

const [dropdownState, toggleDropdown] = useToggle(false)

const selectRef = ref(null)
onClickOutside(selectRef, () => {
  if (dropdownState.value) toggleDropdown(false)
})

const selectOption = (option = null) => {
  if (option) model.value = getValue(option)
  else model.value = null

  toggleDropdown(false)
}

const getLabel = (option) => typeof option === 'object' ? option.label : option
const getValue = (option) => typeof option === 'object' ? option.value : option
const isSelected = (option) => getValue(option) === model.value ? 'is-selected' : ''

const selectClass = computed(() => {
  return [
    'input-wrapper', props.variant,
    `direction-${props.direction}`,
    {
      direction: props.direction,
      'with-icon': props.icon,
      'is-dropped': dropdownState.value
    }
  ]
})
</script>

<template>
  <div ref="selectRef" :class="selectClass">
    <label v-if="showLabel" :for="formatId(label)">{{ label }}</label>
    <div class="wrapper" @click="toggleDropdown()">
      <component
        :is="icon"
        v-if="icon"
        class="icon-input"
      />
      <input
        :id="formatId(label)"
        v-model="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        readonly
      >
      <IconChevron class="icon-chevron" />
    </div>

    <Transition name="dropdown">
      <div v-if="dropdownState" class="dropdown">
        <ul v-if="options.length > 0">
          <li v-for="(option, index) in options" :key="index" :class="isSelected(option)" @click="selectOption(option)">
            <span>{{ getLabel(option) }}</span>
          </li>
          <li v-if="clearable && displayValue" class="clear" @click="selectOption()">
            <span>Hapus Pilihan</span>
          </li>
        </ul>
        <div v-else class="no-options">
          <span>opsi tidak tersedia</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.input-wrapper {
  width: 100%;
  position: relative;

  display: flex;
  flex-direction: column;

  gap: var(--size-3xs);
}

.input-wrapper label {
  font-size: var(--size-s);
  font-weight: var(--font-medium);

  color: var(--grey-700);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.input-wrapper:has(.wrapper input:required) label::after {
  content: '*';

  margin-left: 1px;
  color: var(--red-500);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.input-wrapper:has(.wrapper input:disabled) label {
  color: var(--grey-500);
}

.input-wrapper:has(.wrapper input:disabled) label::after {
  color: var(--grey-400);
}

.input-wrapper .wrapper {
  width: 100%;
  position: relative;

  cursor: pointer;
}

.input-wrapper .wrapper:has(input:disabled) {
  cursor: default;
  pointer-events: none;
}

.input-wrapper .wrapper .icon-input,
.input-wrapper .wrapper .icon-chevron {
  width: var(--size-m);
  height: var(--size-m);

  position: absolute; top: 50%;
  transform: translateY(-50%);
}

.input-wrapper .wrapper .icon-input {
  left: var(--size-xs);
  color: var(--grey-400);
}

.input-wrapper .wrapper .icon-chevron {
  right: var(--size-xs);
  color: var(--grey-300);

  transition: transform var(--transition-normal) var(--transition-smooth);
}

.input-wrapper:not(.direction-up).is-dropped .wrapper .icon-chevron,
.input-wrapper:not(.is-dropped).direction-up .wrapper .icon-chevron {
  transform: translateY(-50%) rotate(180deg);
}

.input-wrapper .wrapper input {
  width: 100%;

  pointer-events: none;
  padding: var(--size-xxs);
  border-radius: var(--size-xs);

  outline: none;
  color: var(--grey-600);
  transition: color var(--transition-fast) var(--transition-smooth),
              border-color var(--transition-fast) var(--transition-smooth),
              box-shadow var(--transition-fast) var(--transition-smooth);
}

.input-wrapper.with-icon .wrapper input {
  padding-left: calc(var(--size-m) + var(--size-xxs) * 2);
}

.input-wrapper.light .wrapper input {
  background-color: var(--grey-50);
  border: 1px solid var(--grey-200);
}

.input-wrapper.dark .wrapper input {
  background-color: var(--grey-100);
  border: 1px solid var(--grey-300);
}

.input-wrapper .wrapper input,
.input-wrapper input::placeholder {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
}

.input-wrapper .wrapper input::placeholder {
  color: var(--grey-400);
}

.input-wrapper .wrapper input:disabled {
  color: var(--grey-400);
  border-color: var(--grey-200)
}

.input-wrapper .wrapper input:disabled::placeholder {
  color: var(--grey-400)
}

.input-wrapper .dropdown {
  max-height: var(--maxHeight);

  position: absolute;
  left: 0; right: 0;
  z-index: 1;

  overflow-y: auto;
  scrollbar-color: transparent transparent;
  border-radius: var(--size-xs);

  background-color: var(--white);
  border: 1px solid var(--grey-200);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.input-wrapper.direction-down .dropdown {
  top: calc(100% + var(--size-5xs));
  bottom: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.input-wrapper.direction-up .dropdown {
  bottom: calc(100% + var(--size-5xs));
  top: auto;
  box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
}

.input-wrapper .dropdown ul {
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: var(--size-2xs);

  list-style: none;
}

.input-wrapper .dropdown ul li {
  width: 100%;

  display: flex;
  align-items: center;

  cursor: pointer;
  padding: var(--size-xs);

  font-size: var(--size-s);
  font-weight: var(--font-regular);
  font-family: var(--font-secondary);

  color: var(--grey-500);
  border-bottom: 1px solid var(--grey-200);

  transition: background-color var(--transition-fast) var(--transition-smooth),
              color var(--transition-fast) var(--transition-smooth);
}

.input-wrapper .dropdown ul li:last-child {
  border-bottom: none;
}

.input-wrapper .dropdown ul li.clear {
  width: 100%;
  justify-content: center;

  color: var(--red-400);
  background-color: var(--red-50);
}

.input-wrapper .dropdown ul li.is-selected {
  background-color: var(--grey-50);
  color: var(--grey-600);
}

.input-wrapper .dropdown .no-options {
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: var(--size-xs);
}

.input-wrapper .dropdown .no-options span {
  font-size: var(--size-s);
  font-weight: var(--font-regular);

  color: var(--grey-400);
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity var(--transition-normal) var(--transition-smooth),
              transform var(--transition-normal) var(--transition-smooth);
}

.input-wrapper.direction-down .dropdown-enter-from,
.input-wrapper.direction-down .dropdown-leave-to {
  opacity: 0;
  transform: translateY(calc(var(--size-xxs) * -1));
}

.input-wrapper.direction-up .dropdown-enter-from,
.input-wrapper.direction-up .dropdown-leave-to {
  opacity: 0;
  transform: translateY(calc(var(--size-xxs) * 1));
}

@media (hover: hover) {
  .input-wrapper .dropdown ul li:hover {
    background-color: var(--grey-50);
  }

  .input-wrapper .dropdown ul li.clear:hover {
    color: var(--red-500);
    background-color: var(--red-100);
  }
}


</style>
