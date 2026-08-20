<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import IconClose from '~/assets/icons/actions/close.svg?component'
import IconDownload from '~/assets/icons/actions/download.svg?component'
import IconChevronLeft from '~/assets/icons/chevron/left.svg?component'
import IconChevronRight from '~/assets/icons/chevron/right.svg?component'
import { downloadFile } from '~/utils/download'

const props = defineProps({
  src: { type: String, default: '' },
  title: { type: String, default: 'Pratinjau Gambar' },
  size: { type: [Number, String], default: null },
  images: { type: Array, default: () => [] },
  initialIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['close'])

const currentIndex = ref(props.initialIndex || 0)
const thumbnailRefs = ref([])

const isGallery = computed(() => Array.isArray(props.images) && props.images.length > 1)

const getAssetUrl = (path) => {
  if (!path) return '#'
  if (path.startsWith('http')) return path
  return `/${path.replace(/^\//, '')}`
}

const galleryItems = computed(() => {
  if (Array.isArray(props.images) && props.images.length > 0) {
    return props.images.map(item => ({
      src: getAssetUrl(item.path || item.src),
      title: item.name || item.title || 'Pratinjau Gambar',
      size: item.size || null
    }))
  }
  return [{
    src: props.src,
    title: props.title,
    size: props.size
  }]
})

const currentItem = computed(() => {
  return galleryItems.value[currentIndex.value] || galleryItems.value[0]
})

const setThumbnailRef = (el, idx) => {
  if (el) {
    thumbnailRefs.value[idx] = el
  }
}

const scrollToActiveThumbnail = (idx) => {
  nextTick(() => {
    const target = thumbnailRefs.value[idx]
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  })
}

watch(currentIndex, (newIdx) => {
  scrollToActiveThumbnail(newIdx)
})

const selectImage = (idx) => {
  currentIndex.value = idx
}

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = galleryItems.value.length - 1
  }
}

const nextImage = () => {
  if (currentIndex.value < galleryItems.value.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return ''
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const handleDownload = () => {
  downloadFile(currentItem.value.src, currentItem.value.title)
}

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    emit('close')
  } else if (isGallery.value && e.key === 'ArrowLeft') {
    prevImage()
  } else if (isGallery.value && e.key === 'ArrowRight') {
    nextImage()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  if (isGallery.value) {
    scrollToActiveThumbnail(currentIndex.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="image-preview-overlay" @click.self="emit('close')">
    <div class="preview-container">
      <div class="preview-header">
        <div class="title-info">
          <span class="file-name" :title="currentItem.title">{{ currentItem.title }}</span>
          <template v-if="currentItem.size">
            <span class="meta-divider">•</span>
            <span class="file-size">{{ formatSize(currentItem.size) }}</span>
          </template>
        </div>
        <div class="header-actions">
          <IconDownload
            class="icon-header icon-download"
            title="Unduh Gambar"
            @click="handleDownload"
          />
          <IconClose
            class="icon-header icon-close"
            title="Tutup (Esc)"
            @click="emit('close')"
          />
        </div>
      </div>
      <div class="preview-body">
        <button
          v-if="isGallery"
          type="button"
          class="btn-nav prev"
          title="Foto Sebelumnya (Panah Kiri)"
          @click="prevImage"
        >
          <IconChevronLeft class="icon-nav" />
        </button>

        <div class="img-wrapper">
          <img
            :key="currentItem.src"
            :src="currentItem.src"
            :alt="currentItem.title"
            class="preview-img"
          >
        </div>

        <button
          v-if="isGallery"
          type="button"
          class="btn-nav next"
          title="Foto Berikutnya (Panah Kanan)"
          @click="nextImage"
        >
          <IconChevronRight class="icon-nav" />
        </button>
      </div>

      <div v-if="isGallery" class="preview-footer">
        <div class="thumbnail-strip">
          <button
            v-for="(img, idx) in galleryItems"
            :key="idx"
            :ref="(el) => setThumbnailRef(el, idx)"
            type="button"
            class="thumbnail-item"
            :class="{ active: idx === currentIndex }"
            :title="img.title"
            @click="selectImage(idx)"
          >
            <img :src="img.src" :alt="img.title" class="thumb-img">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-preview-overlay {
  position: fixed;
  z-index: 100000;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: var(--size-m);
  backdrop-filter: blur(2px);
  background-color: rgba(0, 0, 0, 0.5);
}

.preview-container {
  width: 90vw;
  max-width: 960px;
  height: 85vh;
  max-height: 740px;
  min-height: 520px;

  display: flex;
  flex-direction: column;
  overflow: hidden;

  border-radius: var(--size-l);
  background-color: var(--white);
  border: 1px solid var(--grey-200);
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.1);
}

.preview-header {
  width: 100%;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--size-m);
  padding: var(--size-m);
  border-bottom: 1px solid var(--grey-200);
  background-color: var(--white);
}

.preview-header .title-info {
  flex: 1;
  min-width: 0;

  display: flex;
  align-items: center;

  gap: var(--size-3xs);
}

.preview-header .title-info .file-name {
  font-size: var(--size-m);
  font-weight: var(--font-medium);
  font-family: var(--font-secondary);
  line-height: 1.4;

  color: var(--grey-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-bottom: 2px;
  margin-bottom: -2px;
}

.preview-header .title-info .meta-divider {
  font-size: var(--size-xs);
  line-height: 1;

  color: var(--grey-400);
  flex-shrink: 0;
}

.preview-header .title-info .file-size {
  font-size: var(--size-xs);
  font-weight: var(--font-regular);
  line-height: 1.4;

  color: var(--grey-500);
  flex-shrink: 0;
}

.preview-header .header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;

  gap: var(--size-m);
}

.preview-header .header-actions .icon-header {
  width: var(--size-s);
  height: var(--size-s);
  flex-shrink: 0;

  cursor: pointer;
  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.preview-header .header-actions .icon-download:hover {
  color: var(--grey-700);
}

.preview-header .header-actions .icon-close:hover {
  color: var(--red-500);
}

.preview-body {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  padding: var(--size-m);
  background-color: var(--grey-50);
}

.img-wrapper {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--size-xs);
  border: 1px solid var(--grey-200);
  background-color: var(--white);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.btn-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;

  width: var(--size-3xl);
  height: var(--size-3xl);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  border-radius: var(--size-xs);
  background-color: var(--white);
  border: 1px solid var(--grey-200);
  color: var(--grey-500);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.btn-nav.prev {
  left: var(--size-xxl);
}

.btn-nav.next {
  right: var(--size-xxl);
}

.btn-nav .icon-nav {
  width: var(--size-m);
  height: var(--size-m);
}

/* Thumbnail Strip Footer */
.preview-footer {
  width: 100%;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: var(--size-3xs) var(--size-m);
  background-color: var(--white);
  border-top: 1px solid var(--grey-200);
}

.thumbnail-strip {
  width: 100%;
  max-width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: auto;

  gap: var(--size-3xs);
  padding: var(--size-5xs) 0;
  scrollbar-width: thin;
  scrollbar-color: var(--grey-300) transparent;
}

.thumbnail-strip::-webkit-scrollbar {
  height: 4px;
}

.thumbnail-strip::-webkit-scrollbar-thumb {
  background-color: var(--grey-300);
  border-radius: var(--size-5xs);
}

.thumbnail-item {
  width: var(--size-5xl);
  height: var(--size-5xl);
  flex-shrink: 0;

  padding: 0;
  cursor: pointer;
  overflow: hidden;
  border-radius: var(--size-5xs);
  background-color: var(--grey-100);
  border: 1px solid var(--grey-200);
  opacity: 0.5;
  transition: all var(--transition-fast) var(--transition-smooth);
}

.thumbnail-item:hover {
  opacity: 0.8;
  border-color: var(--grey-300);
}

.thumbnail-item.active {
  opacity: 1;
  border-color: var(--blue-500);
}

.thumbnail-item .thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
