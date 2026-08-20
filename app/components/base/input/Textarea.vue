<script setup>
const props = defineProps({
  maxHeight: { type: String, default: '200px' },
  maxLength: { type: Number, default: null },
  label: { type: String, default: '' },
  placeholder: { type: String, default: null },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  showLabel: { type: Boolean, default: false },
  autoResize: { type: Boolean, default: false }
})

const model = defineModel({ type: [String, null], required: true })

const textareaRef = ref(null)
const adjustHeight = () => {
  if (!textareaRef.value || !props.autoResize) return

  textareaRef.value.style.height = 'auto'
  textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
}

watch(model, () => {
  nextTick(() => { adjustHeight() })
}, { immediate: true })
</script>

<template>
  <div class="input-wrapper">
    <label v-if="showLabel" :for="formatId(label)">{{ label }}</label>
    <span v-if="!readonly">{{ model.length || 0 }} / {{ maxLength || '∞' }}</span>
    <textarea
      :id="formatId(label)"
      ref="textareaRef"
      v-model="model"
      :rows="5"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxLength"
      @input="adjustHeight"
    />
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

.input-wrapper:has(textarea:required) label::after {
  content: '*';

  margin-left: 1px;
  color: var(--red-500);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.input-wrapper:has(textarea:disabled) label {
  color: var(--grey-500);
}

.input-wrapper:has(textarea:disabled) label::after {
  color: var(--grey-400);
}

.input-wrapper span {
  position: absolute;
  right: var(--size-xs);
  bottom: var(--size-xs);

  font-size: var(--size-xs);
  font-weight: var(--font-medium);

  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.input-wrapper:has(textarea:disabled) span {
  color: var(--grey-300);
}

.input-wrapper textarea {
  width: 100%;
  max-height: v-bind(maxHeight);

  resize: none;
  padding: var(--size-xxs);
  border-radius: var(--size-xs);

  outline: none;
  color: var(--grey-600);
  background-color: var(--grey-100);
  border: 1px solid var(--grey-300);
  scrollbar-color: transparent transparent;

  transition: color var(--transition-fast) var(--transition-smooth),
              border-color var(--transition-fast) var(--transition-smooth),
              box-shadow var(--transition-fast) var(--transition-smooth);
}

.input-wrapper textarea,
.input-wrapper textarea:disabled {
  font-size: var(--size-s);
  font-weight: var(--font-regular);

  line-height: 1.5;
}

.input-wrapper textarea::placeholder {
  color: var(--grey-400);
}

.input-wrapper textarea:not(:read-only):focus {
  border-color: var(--blue-500);
  box-shadow: 0 0 0 2px rgba(59, 153, 246, 0.25);
}

.input-wrapper textarea:is(:disabled, :read-only) {
  cursor: default;
}

.input-wrapper textarea:disabled {
  color: var(--grey-400);
  border-color: var(--grey-200)
}

.input-wrapper textarea:disabled::placeholder {
  color: var(--grey-400)
}
</style>
