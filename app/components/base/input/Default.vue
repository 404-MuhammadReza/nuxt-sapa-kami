<script setup>
import IconShow from '~/assets/icons/actions/password-show.svg?component'
import IconHide from '~/assets/icons/actions/password-hide.svg?component'

const props = defineProps({
  label: { type: String, required: true },
  icon: { type: [Object, null], default: null },
  placeholder: { type: String, default: null },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  showLabel: { type: Boolean, default: false },
  type: { type: String, default: 'text', validator: (value) => ['text', 'number', 'email', 'password'].includes(value) },
  variant: { type: String, default: 'light', validator: (value) => ['light', 'dark'].includes(value) }
})

const model = defineModel({ type: [String, Number, null], required: true })
const inputClass = computed(() => {
  return [
    'input-wrapper', props.variant,
    { 'with-icon': props.icon }
  ]
})

const showState = ref(false)
const setShowState = () => {
  showState.value = !showState.value
}

const displayType = computed(() => {
  if (props.type !== 'password') return props.type
  return showState.value ? 'text' : 'password'
})
</script>

<template>
  <div :class="inputClass">
    <label v-if="showLabel" :for="formatId(label)">{{ label }}</label>
    <div class="wrapper">
      <component
        :is="icon"
        v-if="icon"
        class="icon-input"
      />
      <input
        :id="formatId(label)"
        v-model="model"
        :type="displayType"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
      >

      <component
        :is="showState ? IconHide : IconShow"
        v-if="type === 'password'"
        class="icon-password"
        @click="setShowState"
      />
    </div>
  </div>
</template>

<style scoped>
.input-wrapper {
  width: 100%;

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
}

.input-wrapper .wrapper .icon-input {
  width: var(--size-m);
  height: var(--size-m);

  position: absolute;
  top: 50%; left: var(--size-xs);
  transform: translateY(-50%);

  color: var(--grey-400);
}

.input-wrapper .wrapper .icon-password {
  width: var(--size-m);
  height: var(--size-m);

  position: absolute;
  top: 50%; right: var(--size-xs);
  transform: translateY(-50%);

  color: var(--grey-400);
  cursor: pointer;
}

.input-wrapper .wrapper input {
  width: 100%;

  padding: var(--size-xxs);
  border-radius: var(--size-xs);

  outline: none;
  color: var(--grey-600);
  transition: color var(--transition-fast) var(--transition-smooth),
              border-color var(--transition-fast) var(--transition-smooth),
              box-shadow var(--transition-fast) var(--transition-smooth);
}

.input-wrapper.light .wrapper input {
  background-color: var(--grey-50);
  border: 1px solid var(--grey-200);
}

.input-wrapper.dark .wrapper input {
  background-color: var(--grey-100);
  border: 1px solid var(--grey-300);
}

.input-wrapper.with-icon .wrapper input {
  padding-left: calc(var(--size-m) + var(--size-xxs) * 2);
}

.input-wrapper .wrapper input,
.input-wrapper input::placeholder {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
}

.input-wrapper .wrapper input::placeholder {
  color: var(--grey-400);
}

.input-wrapper .wrapper input:not(:read-only):focus {
  border-color: var(--blue-500);
  box-shadow: 0 0 0 2px rgba(59, 153, 246, 0.25);
}

.input-wrapper .wrapper input:is(:disabled, :read-only) {
  cursor: default;
}

.input-wrapper .wrapper input:disabled {
  color: var(--grey-400);
  border-color: var(--grey-200)
}

.input-wrapper .wrapper input:disabled::placeholder {
  color: var(--grey-400)
}

.input-wrapper .wrapper input::-webkit-outer-spin-button,
.input-wrapper .wrapper input::-webkit-inner-spin-button {
  margin: 0;
  -webkit-appearance: none;
}
</style>
