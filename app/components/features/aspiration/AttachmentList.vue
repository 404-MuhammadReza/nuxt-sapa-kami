<script setup>
import { computed, ref } from 'vue'
import IconDocument from '~/assets/icons/actions/document.svg?component'
import IconDownload from '~/assets/icons/actions/download.svg?component'
import BaseModalImagePreview from '~/components/base/ModalImagePreview.vue'
import { downloadFile } from '~/utils/download'

const props = defineProps({
  attachments: { type: Array, default: () => [] }
})

const previewImage = ref(null)

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const isImage = (type, name = '') => {
  if (type && type.startsWith('image/')) return true
  const ext = name.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)
}

const getFileExtension = (name = '') => {
  return name.split('.').pop()?.toUpperCase() || 'FILE'
}

const imageAttachments = computed(() => {
  if (!props.attachments) return []
  return props.attachments.filter(att => isImage(att.type, att.name))
})

const getAssetUrl = (path) => {
  if (!path) return '#'
  if (path.startsWith('http')) return path
  return `/${path.replace(/^\//, '')}`
}

const handleCardClick = (file) => {
  if (isImage(file.type, file.name)) {
    const idx = imageAttachments.value.findIndex(img => img === file || img.path === file.path)
    previewImage.value = {
      images: imageAttachments.value,
      index: idx >= 0 ? idx : 0
    }
  } else {
    window.open(getAssetUrl(file.path), '_blank', 'noopener,noreferrer')
  }
}

const handleDownload = (file, event) => {
  event.stopPropagation()
  event.preventDefault()
  downloadFile(getAssetUrl(file.path), file.name)
}
</script>

<template>
  <div v-if="attachments && attachments.length" class="attachments-list">
    <div
      v-for="(file, index) in attachments"
      :key="index"
      class="attachment-card"
      @click="handleCardClick(file)"
    >
      <div v-if="isImage(file.type, file.name)" class="thumbnail-preview">
        <img :src="getAssetUrl(file.path)" :alt="file.name">
      </div>
      <IconDocument v-else class="icon-doc" />
      <div class="file-details">
        <span class="file-name">{{ file.name }}</span>
        <span class="file-size">{{ getFileExtension(file.name) }} • {{ formatSize(file.size) }}</span>
      </div>
      <button
        type="button"
        class="btn-download"
        title="Unduh Berkas"
        @click="handleDownload(file, $event)"
      >
        <IconDownload class="icon-download" />
      </button>
    </div>

    <!-- Image Lightbox Modal Preview -->
    <Teleport to="body">
      <Transition name="modal">
        <BaseModalImagePreview
          v-if="previewImage"
          :src="previewImage.images ? '' : getAssetUrl(previewImage.path)"
          :title="previewImage.images ? '' : previewImage.name"
          :size="previewImage.images ? null : previewImage.size"
          :images="previewImage.images || []"
          :initial-index="previewImage.index || 0"
          @close="previewImage = null"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.attachments-list {
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: var(--size-4xs);
}

.attachments-list .attachment-card {
  width: 100%;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  cursor: pointer;

  gap: var(--size-xxs);
  padding: var(--size-3xs) var(--size-s);
  border-radius: var(--size-xs);

  background-color: var(--grey-50);
  border: 1px solid var(--grey-200);
  transition: all var(--transition-fast) var(--transition-smooth);
}

.attachments-list .attachment-card:hover {
  background-color: var(--grey-100);
  border-color: var(--grey-300);
}

.attachments-list .attachment-card .thumbnail-preview {
  width: var(--size-xxl);
  height: var(--size-xxl);
  flex-shrink: 0;

  overflow: hidden;
  border-radius: var(--size-5xs);
  background-color: var(--grey-200);
  border: 1px solid var(--grey-200);
}

.attachments-list .attachment-card .thumbnail-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attachments-list .attachment-card .icon-doc {
  width: var(--size-xl);
  height: var(--size-xl);
  flex-shrink: 0;

  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.attachments-list .attachment-card:hover .icon-doc {
  color: var(--grey-500);
}

.attachments-list .attachment-card .file-details {
  flex: 1;
  min-width: 0;
  margin-right: var(--size-3xs);

  display: flex;
  flex-direction: column;

  gap: var(--size-5xs);
}

.attachments-list .attachment-card .file-details .file-name {
  font-size: var(--size-xs);
  font-weight: var(--font-medium);
  line-height: 1.35;

  color: var(--grey-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-fast) var(--transition-smooth);
}

.attachments-list .attachment-card:hover .file-details .file-name {
  color: var(--black);
}

.attachments-list .attachment-card .file-details .file-size {
  font-size: var(--size-xxs);
  font-weight: var(--font-regular);
  line-height: 1.2;

  color: var(--grey-400);
}

.btn-download {
  width: var(--size-xxl);
  height: var(--size-xxl);
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.btn-download:hover {
  color: var(--grey-600);
}

.btn-download .icon-download {
  width: var(--size-m);
  height: var(--size-m);
}
</style>

