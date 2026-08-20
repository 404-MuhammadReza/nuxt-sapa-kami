<script setup>
import IconAttachment from '~/assets/icons/actions/attachment.svg?component'
import IconClose from '~/assets/icons/actions/close.svg?component'
import IconDocument from '~/assets/icons/actions/document.svg?component'

const props = defineProps({
  label: { type: String, default: 'Lampiran' },
  showLabel: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  maxFiles: { type: Number, default: 5 },
  maxSize: { type: Number, default: 10 * 1024 * 1024 },
  maxTotalSize: { type: Number, default: 25 * 1024 * 1024 },
  accept: { type: String, default: 'image/jpeg,image/png,application/pdf' },
  variant: { type: String, default: 'light', validator: (v) => ['light', 'dark'].includes(v) },
})

const files = defineModel({ type: Array, default: () => [] })
const localError = ref(null)
const fileInputRef = ref(null)

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const handleFileSelect = (event) => {
  localError.value = null
  const selected = Array.from(event.target.files || [])
  if (!selected.length) return

  const current = [...files.value]
  if (current.length + selected.length > props.maxFiles) {
    localError.value = `Maksimal ${props.maxFiles} file yang dapat dilampirkan`
    if (fileInputRef.value) fileInputRef.value.value = ''
    return
  }

  for (const f of selected) {
    if (f.size > props.maxSize) {
      localError.value = `Ukuran file "${f.name}" melebihi batas 10MB`
      if (fileInputRef.value) fileInputRef.value.value = ''
      return
    }
  }

  const total = [...current, ...selected].reduce((acc, f) => acc + f.size, 0)
  if (total > props.maxTotalSize) {
    localError.value = 'Total ukuran seluruh file melebihi batas 25MB'
    if (fileInputRef.value) fileInputRef.value.value = ''
    return
  }

  files.value = [...current, ...selected]
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const removeFile = (index) => {
  localError.value = null
  const updated = [...files.value]
  updated.splice(index, 1)
  files.value = updated
}

const triggerFileInput = () => {
  if (props.disabled || files.value.length >= props.maxFiles) return
  fileInputRef.value?.click()
}
</script>

<template>
  <div :class="['file-input-wrapper', variant]">
    <label v-if="showLabel">{{ label }}</label>
    <input
      ref="fileInputRef"
      type="file"
      multiple
      :accept="accept"
      :disabled="disabled"
      class="hidden-input"
      @change="handleFileSelect"
    >
    <div
      v-if="files.length < maxFiles"
      :class="['dropzone', { disabled }]"
      @click="triggerFileInput"
    >
      <IconAttachment class="icon-upload" />
      <div class="dropzone-text">
        <span>Klik untuk melampirkan berkas (JPG, PNG, PDF maks 10MB)</span>
        <span class="subtext">Maksimal {{ maxFiles }} berkas, total 25MB</span>
      </div>
    </div>
    <div v-if="files.length" class="file-list">
      <div v-for="(file, index) in files" :key="index" class="file-item">
        <IconDocument class="icon-file" />
        <div class="file-info">
          <span class="name">{{ file.name }}</span>
          <span class="size">{{ formatSize(file.size) }}</span>
        </div>
        <IconClose
          v-if="!disabled"
          class="icon-remove"
          @click.stop="removeFile(index)"
        />
      </div>
    </div>
    <span v-if="localError" class="error-text">{{ localError }}</span>
  </div>
</template>

<style scoped>
.file-input-wrapper {
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: var(--size-3xs);
}

.file-input-wrapper label {
  font-size: var(--size-s);
  font-weight: var(--font-medium);

  color: var(--grey-700);
}

.file-input-wrapper .hidden-input {
  display: none;
}

.file-input-wrapper .dropzone {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: var(--size-xs);
  padding: var(--size-s);
  border-radius: var(--size-xs);

  cursor: pointer;
  border: 1px dashed var(--grey-300);
  background-color: var(--grey-50);
  transition: all var(--transition-fast) var(--transition-smooth);
}

.file-input-wrapper.dark .dropzone {
  background-color: var(--grey-100);
  border-color: var(--grey-300);
}

.file-input-wrapper .dropzone:hover:not(.disabled) {
  border-color: var(--blue-500);
  background-color: var(--blue-50);
}

.file-input-wrapper .dropzone.disabled {
  cursor: default;
  opacity: 0.6;
}

.file-input-wrapper .dropzone .icon-upload {
  width: var(--size-l);
  height: var(--size-l);
  flex-shrink: 0;

  color: var(--grey-400);
}

.file-input-wrapper .dropzone .dropzone-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  gap: var(--size-5xs);
}

.file-input-wrapper .dropzone .dropzone-text span {
  font-size: var(--size-xs);
  font-weight: var(--font-medium);

  color: var(--grey-600);
}

.file-input-wrapper .dropzone .dropzone-text .subtext {
  font-size: var(--size-xs);
  font-weight: var(--font-regular);

  color: var(--grey-400);
}

.file-input-wrapper .file-list {
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: var(--size-4xs);
}

.file-input-wrapper .file-item {
  width: 100%;

  display: flex;
  align-items: center;

  gap: var(--size-xs);
  padding: var(--size-3xs) var(--size-xs);
  border-radius: var(--size-xs);

  background-color: var(--grey-100);
  border: 1px solid var(--grey-200);
}

.file-input-wrapper.dark .file-item {
  background-color: var(--white);
  border-color: var(--grey-200);
}

.file-input-wrapper .file-item .icon-file {
  width: var(--size-m);
  height: var(--size-m);
  flex-shrink: 0;

  color: var(--blue-500);
}

.file-input-wrapper .file-item .file-info {
  flex: 1;
  min-width: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--size-xs);
}

.file-input-wrapper .file-item .file-info .name {
  font-size: var(--size-xs);
  font-weight: var(--font-medium);

  color: var(--grey-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-input-wrapper .file-item .file-info .size {
  font-size: var(--size-xs);
  font-weight: var(--font-regular);
  flex-shrink: 0;

  color: var(--grey-400);
}

.file-input-wrapper .file-item .icon-remove {
  width: var(--size-s);
  height: var(--size-s);
  flex-shrink: 0;

  cursor: pointer;
  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.file-input-wrapper .file-item .icon-remove:hover {
  color: var(--red-500);
}

.file-input-wrapper .error-text {
  font-size: var(--size-xs);
  font-weight: var(--font-regular);

  color: var(--red-500);
}
</style>
