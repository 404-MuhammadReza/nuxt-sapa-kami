<script setup>
defineProps({
  label: { type: String, default: null },
  options: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  direction: { type: String, default: 'horizontal', validator: (value) => ['horizontal', 'vertical'].includes(value) }
})

const model = defineModel({ type: [String, Number, Boolean, null], default: '' })
const handleClick = (value) => model.value = value

const isActive = (value) => { if (model.value === value) return 'active' }
</script>

<template>
  <div :class="['radio-wrapper', direction]">
    <h3 v-if="label">{{ label }}</h3>
    <div class="options">
      <button v-for="item in options" :key="item.value"  type="button" :class="isActive(item.value)" :disabled="disabled" @click="handleClick(item.value)">
      <div class="label">
        <Component :is="item.icon" v-if="item.icon" class="icon-radio" />
        <h3>{{ item.label }}</h3>
      </div>
      <span>{{ item.desc }}</span>
    </button>
    </div>
  </div>
</template>

<style scoped>
.radio-wrapper {
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: var(--size-3xs);
}

.radio-wrapper h3 {
  font-size: var(--size-s);
  font-weight: var(--font-medium);

  color: var(--grey-700);
}

.radio-wrapper .options {
  width: 100%;

  display: flex;
  gap: var(--size-s);
}

.radio-wrapper.vertical .options {
  flex-direction: column;
}

.radio-wrapper .options button {
  width: 100%;

  flex: 1;
  display: flex;
  flex-direction: column;

  cursor: pointer;
  gap: var(--size-3xs);
  padding: var(--size-xxs);
  border-radius: var(--size-xs);

  background-color: var(--grey-100);
  border: 1px solid var(--grey-200);

  transition: border-color var(--transition-normal) var(--transition-smooth),
    background-color var(--transition-normal) var(--transition-smooth),
    box-shadow var(--transition-normal) var(--transition-smooth);
}

.radio-wrapper .options button:disabled {
  cursor: default;
}

.radio-wrapper .options button.active {
  border-color: var(--blue-500);
  background-color: var(--blue-100);
  box-shadow: 0 4px 12px rgba(62, 168, 255, 0.15);
}

.radio-wrapper .options button.active:disabled {
  box-shadow: none;
  border-color: var(--blue-300);
}

.radio-wrapper .options button .label {
  display: flex;
  align-items: center;

  gap: var(--size-3xs);
}

.radio-wrapper .options button .label .icon-radio {
  width: var(--size-m);
  height: auto;
  flex-shrink: 0;

  color: var(--grey-300);
  transition: color var(--transition-normal) var(--transition-smooth);
}

.radio-wrapper .options button.active .label .icon-radio {
  color: var(--blue-300);
}

.radio-wrapper .options button .label h3 {
  font-size: var(--size-s);
  font-weight: var(--font-medium);

  color: var(--grey-500);
  transition: color var(--transition-normal) var(--transition-smooth);
}

.radio-wrapper .options button.active .label h3 {
  color: var(--blue-500);
}

.radio-wrapper .options button span {
  font-size: var(--size-xs);
  text-align: justify;
  line-height: 1.5;

  color: var(--grey-500);
  transition: color var(--transition-normal) var(--transition-smooth);
}

.radio-wrapper .options button.active span {
  color: var(--blue-500);
}

.radio-wrapper .options button:disabled .label .icon-radio,
.radio-wrapper .options button:disabled .label h3,
.radio-wrapper .options button:disabled span {
  color: var(--grey-300);
}

.radio-wrapper .options button.active:disabled .label .icon-radio,
.radio-wrapper .options button.active:disabled .label h3,
.radio-wrapper .options button.active:disabled span {
  color: var(--blue-300);
}
</style>

