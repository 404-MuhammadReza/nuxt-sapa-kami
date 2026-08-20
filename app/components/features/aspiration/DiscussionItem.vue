<script setup>
import IconDocument from '~/assets/icons/actions/document.svg?component'
import IconDownload from '~/assets/icons/actions/download.svg?component'
import { downloadFile } from '~/utils/download'

const props = defineProps({
  message: { type: Object, required: true },
  isCriticism: { type: Boolean, default: false },
  isInnovation: { type: Boolean, default: false },
  aspirationSenderId: { type: [Number, String], default: null },
  aspirationSenderName: { type: String, default: 'Pengirim' }
})

const emit = defineEmits(['previewImage'])

const dayjs = useDayjs()
const { session } = useSession()

const isMyMessage = computed(() => {
  if (!props.message) return false
  if (typeof props.message.is_you === 'boolean') {
    return props.message.is_you
  }
  const senderId = props.message.sender?.id || props.message.sender_id || props.message.user_id
  if (session.value?.id && senderId) {
    return senderId === session.value.id
  }
  return false
})

const isAspirationSenderMsg = computed(() => {
  if (!props.message) return false
  if (typeof props.message.is_sender === 'boolean') {
    return props.message.is_sender
  }
  const msgSenderId = props.message.sender?.id || props.message.sender_id || props.message.user_id
  if (msgSenderId && props.aspirationSenderId) {
    return msgSenderId === props.aspirationSenderId
  }
  return false
})

const senderName = computed(() => {
  if (isMyMessage.value) return 'Anda'
  if (props.isCriticism && isAspirationSenderMsg.value) {
    return 'Anonim'
  }
  if (props.message.sender?.name) return props.message.sender.name
  if (props.isInnovation && isAspirationSenderMsg.value) {
    return props.aspirationSenderName || 'Pengirim'
  }
  return 'Anonim'
})

const roleLabel = computed(() => {
  if (isAspirationSenderMsg.value) return 'Pengirim'
  if (props.message.sender?.role === 'super_admin') return 'IT Support'
  return 'Manajemen'
})

const senderInitial = computed(() => {
  if (isMyMessage.value) {
    return session.value?.name ? session.value.name.charAt(0).toUpperCase() : 'U'
  }
  if (props.isCriticism && isAspirationSenderMsg.value) return '?'
  if (props.message.sender?.name) return props.message.sender.name.charAt(0).toUpperCase()
  if (isAspirationSenderMsg.value) {
    return props.aspirationSenderName ? props.aspirationSenderName.charAt(0).toUpperCase() : 'P'
  }
  if (props.message.sender?.role === 'super_admin') return 'I'
  return 'M'
})

const senderColorStyle = computed(() => {
  if (isMyMessage.value) {
    return {
      avatarBg: 'var(--blue-100)',
      avatarBorder: 'var(--blue-200)',
      avatarColor: 'var(--blue-700)',
      authorColor: 'var(--blue-700)'
    }
  }

  if (props.isCriticism && isAspirationSenderMsg.value) {
    return {
      avatarBg: 'var(--yellow-100)',
      avatarBorder: 'var(--yellow-200)',
      avatarColor: 'var(--yellow-800)',
      authorColor: 'var(--yellow-800)'
    }
  }

  if (props.isInnovation && isAspirationSenderMsg.value) {
    return {
      avatarBg: 'var(--blue-100)',
      avatarBorder: 'var(--blue-300)',
      avatarColor: 'var(--blue-800)',
      authorColor: 'var(--blue-800)'
    }
  }

  const identifier = String(props.message.sender?.id || props.message.sender_id || props.message.user_id || props.message.sender?.name || (props.message.sender?.role ? `role-${props.message.sender.role}` : 'management'))
  let hash = 0
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash * 31 + identifier.charCodeAt(i)) & 0xffffffff
  }

  const hue = Math.abs((hash * 137.5) % 360)
  return {
    avatarBg: `hsl(${hue}, 85%, 95%)`,
    avatarBorder: `hsl(${hue}, 60%, 80%)`,
    avatarColor: `hsl(${hue}, 80%, 30%)`,
    authorColor: `hsl(${hue}, 80%, 32%)`
  }
})

const formatChatTime = (dateString) => {
  if (!dateString) return '-'
  return dayjs(dateString).format('DD MMM, HH:mm')
}

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getAssetUrl = (path) => {
  if (!path) return '#'
  if (path.startsWith('http')) return path
  return `/${path.replace(/^\//, '')}`
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
  if (!props.message?.attachments) return []
  return props.message.attachments.filter(att => isImage(att.type, att.name))
})

const documentAttachments = computed(() => {
  if (!props.message?.attachments) return []
  return props.message.attachments.filter(att => !isImage(att.type, att.name))
})

const visibleImages = computed(() => {
  return imageAttachments.value.slice(0, 4)
})

const remainingImageCount = computed(() => {
  return Math.max(0, imageAttachments.value.length - 4)
})

const handleImageClick = (idx) => {
  emit('previewImage', {
    images: imageAttachments.value,
    index: idx
  })
}

const handleChatAttachmentClick = (att) => {
  if (isImage(att.type, att.name)) {
    const idx = imageAttachments.value.findIndex(img => img === att || img.path === att.path)
    emit('previewImage', {
      images: imageAttachments.value,
      index: idx >= 0 ? idx : 0
    })
  } else {
    window.open(getAssetUrl(att.path), '_blank', 'noopener,noreferrer')
  }
}

const handleChatDownload = (att, event) => {
  event.stopPropagation()
  event.preventDefault()
  downloadFile(getAssetUrl(att.path), att.name)
}
</script>

<template>
  <div :class="['msg-row', { 'is-me': isMyMessage }]">
    <!-- Avatar (only for others) -->
    <div
      v-if="!isMyMessage"
      class="msg-avatar"
      :style="{
        backgroundColor: senderColorStyle.avatarBg,
        borderColor: senderColorStyle.avatarBorder,
        color: senderColorStyle.avatarColor
      }"
      :title="senderName"
    >
      <span>{{ senderInitial }}</span>
    </div>

    <!-- Bubble Content -->
    <div class="msg-bubble">
      <div class="msg-top">
        <span
          class="msg-author"
          :style="{ color: senderColorStyle.authorColor }"
        >
          {{ senderName }}
        </span>
        <template v-if="!isMyMessage">
          <span class="msg-divider">•</span>
          <span class="msg-role-hint">{{ roleLabel }}</span>
        </template>
      </div>

      <!-- Message Text -->
      <div v-if="message.message" class="msg-text">
        <p>{{ message.message }}</p>
      </div>

      <!-- Image Gallery Grid -->
      <div
        v-if="imageAttachments.length"
        :class="['chat-media-grid', `grid-${imageAttachments.length >= 4 ? 4 : imageAttachments.length}`]"
      >
        <div
          v-for="(img, idx) in visibleImages"
          :key="idx"
          class="media-item"
          :title="img.name"
          @click="handleImageClick(idx)"
        >
          <img :src="getAssetUrl(img.path)" :alt="img.name" loading="lazy">
          <div v-if="idx === 3 && remainingImageCount > 0" class="media-overlay">
            <span>+{{ remainingImageCount }}</span>
          </div>
        </div>
      </div>

      <!-- Document Files List -->
      <div v-if="documentAttachments.length" class="chat-files-list">
        <div
          v-for="(att, aIdx) in documentAttachments"
          :key="aIdx"
          class="chat-file-card"
          :title="att.name"
          @click="handleChatAttachmentClick(att)"
        >
          <IconDocument class="icon-doc" />
          <div class="file-meta">
            <span class="file-title">{{ att.name }}</span>
            <span class="file-subtitle">
              {{ getFileExtension(att.name) }} • {{ formatSize(att.size) }}
            </span>
          </div>
          <button
            type="button"
            class="btn-dl-file"
            title="Unduh Berkas"
            @click="handleChatDownload(att, $event)"
          >
            <IconDownload class="icon-dl" />
          </button>
        </div>
      </div>

      <!-- Timestamp bottom right -->
      <div class="msg-bottom">
        <span class="msg-timestamp">{{ formatChatTime(message.created_at) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.msg-row {
  width: 100%;

  display: flex;
  align-items: flex-end;

  gap: var(--size-xs);
}

.msg-row.is-me {
  justify-content: flex-end;
}

.msg-avatar {
  width: var(--size-xxl);
  height: var(--size-xxl);
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: var(--size-3xs);
  background-color: var(--grey-100);
  border: 1px solid var(--grey-300);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.msg-avatar span {
  font-size: var(--size-xs);
  font-weight: var(--font-bold);
  color: inherit;
}

.msg-bubble {
  min-width: 140px;
  max-width: 82%;

  display: flex;
  flex-direction: column;

  gap: var(--size-4xs);
  padding: var(--size-xs) var(--size-s);
  border-radius: var(--size-xs) var(--size-xs) var(--size-xs) 2px;

  background-color: var(--white);
  border: 1px solid var(--grey-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.msg-row.is-me .msg-bubble {
  border-radius: var(--size-xs) var(--size-xs) 2px var(--size-xs);
  background-color: var(--blue-50);
  border-color: var(--blue-200);
}

.msg-top {
  display: flex;
  align-items: center;

  gap: var(--size-4xs);
  line-height: 1.2;
}

.msg-author {
  font-size: var(--size-xs);
  font-weight: var(--font-semibold);
  color: var(--blue-700);
  line-height: 1;
}

.msg-row.is-me .msg-author {
  color: var(--blue-800);
}

.msg-divider {
  font-size: var(--size-xs);
  font-weight: var(--font-bold);
  color: var(--grey-400);
  line-height: 1;
  display: inline-flex;
  align-items: center;
}

.msg-role-hint {
  font-size: var(--size-xxs);
  font-weight: var(--font-regular);
  color: var(--grey-400);
  line-height: 1;
}

.msg-row.is-me .msg-role-hint {
  color: var(--blue-600);
}

.msg-bottom {
  width: 100%;

  display: flex;
  justify-content: flex-end;

  margin-top: 2px;
}

.msg-timestamp {
  font-size: var(--size-xxs);
  font-weight: var(--font-regular);
  color: var(--grey-400);
}

.msg-row.is-me .msg-timestamp {
  color: var(--blue-500);
}

.msg-text {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
  line-height: 1.55;
  word-break: break-word;
  white-space: pre-wrap;
  color: var(--grey-800);
}

.msg-text p {
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.55;
}

/* Image Media Gallery */
.chat-media-grid {
  width: 100%;
  background-color: transparent;
}

.chat-media-grid.grid-1 {
  display: flex;
}

.chat-media-grid.grid-1 .media-item {
  width: 100%;
  height: auto;
  max-height: 220px;
}

.chat-media-grid.grid-1 .media-item img {
  aspect-ratio: 16 / 10;
  max-height: 220px;
}

.chat-media-grid.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--size-4xs);
}

.chat-media-grid.grid-2 .media-item {
  aspect-ratio: 4 / 3;
  max-height: 140px;
}

.chat-media-grid.grid-3 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--size-4xs);
}

.chat-media-grid.grid-3 .media-item:first-child {
  grid-row: span 2;
  height: 100%;
  min-height: 160px;
  aspect-ratio: unset;
}

.chat-media-grid.grid-3 .media-item:not(:first-child) {
  height: 85px;
}

.chat-media-grid.grid-4 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--size-4xs);
}

.chat-media-grid.grid-4 .media-item {
  aspect-ratio: 4 / 3;
  max-height: 100px;
}

.media-item {
  position: relative;
  overflow: hidden;
  cursor: pointer;

  border-radius: var(--size-xs);
  border: 1px solid var(--grey-200);
  background-color: var(--grey-100);
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: filter var(--transition-fast) var(--transition-smooth);
}

.media-item:hover img {
  filter: brightness(0.92);
}

.msg-row.is-me .media-item {
  border-color: var(--blue-200);
}

.media-overlay {
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: var(--size-xs);
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  transition: background-color var(--transition-fast) var(--transition-smooth);
}

.media-overlay:hover {
  background-color: rgba(0, 0, 0, 0.55);
}

.media-overlay span {
  font-size: var(--size-m);
  font-weight: var(--font-bold);
  color: var(--white);
}

/* Document Files List */
.chat-files-list {
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: var(--size-4xs);
}

.chat-file-card {
  width: 100%;

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

.chat-file-card:hover {
  background-color: var(--grey-100);
  border-color: var(--grey-300);
}

.chat-file-card .icon-doc {
  width: var(--size-xl);
  height: var(--size-xl);
  flex-shrink: 0;
  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.chat-file-card:hover .icon-doc {
  color: var(--grey-500);
}

.chat-file-card .file-meta {
  flex: 1;
  min-width: 0;
  margin-right: var(--size-3xs);

  display: flex;
  flex-direction: column;

  gap: var(--size-5xs);
}

.chat-file-card .file-meta .file-title {
  font-size: var(--size-xs);
  font-weight: var(--font-medium);
  line-height: 1.35;
  color: var(--grey-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-fast) var(--transition-smooth);
}

.chat-file-card:hover .file-meta .file-title {
  color: var(--black);
}

.chat-file-card .file-meta .file-subtitle {
  font-size: var(--size-xxs);
  font-weight: var(--font-regular);
  line-height: 1.2;
  color: var(--grey-400);
}

.btn-dl-file {
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

.btn-dl-file:hover {
  color: var(--grey-600);
}

.btn-dl-file .icon-dl {
  width: var(--size-m);
  height: var(--size-m);
}

/* Outgoing Message (is-me) File Card Styling - Opsi A: White Elevated Card */
.msg-row.is-me .chat-file-card {
  background-color: var(--white);
  border-color: var(--blue-200);
}

.msg-row.is-me .chat-file-card:hover {
  background-color: var(--white);
  border-color: var(--blue-300);
  box-shadow: 0 1px 3px rgba(30, 77, 183, 0.08);
}

.msg-row.is-me .chat-file-card .icon-doc {
  color: var(--blue-400);
}

.msg-row.is-me .chat-file-card:hover .icon-doc {
  color: var(--blue-500);
}

.msg-row.is-me .chat-file-card .file-meta .file-title {
  color: var(--blue-900);
}

.msg-row.is-me .chat-file-card .file-meta .file-subtitle {
  color: var(--blue-400);
}

.msg-row.is-me .btn-dl-file {
  color: var(--blue-400);
}

.msg-row.is-me .btn-dl-file:hover {
  color: var(--blue-600);
}
</style>
