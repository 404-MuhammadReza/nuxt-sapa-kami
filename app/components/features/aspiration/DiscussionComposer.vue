<script setup>
import IconAttachment from '~/assets/icons/actions/attachment.svg?component'
import IconSend from '~/assets/icons/actions/send.svg?component'
import IconClose from '~/assets/icons/actions/close.svg?component'
import IconDocument from '~/assets/icons/actions/document.svg?component'

const props = defineProps({
  isOpen: { type: Boolean, default: true },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['sendMessage'])

const discussionMessage = ref('')
const discussionFiles = ref([])
const chatFileError = ref('')
const fileInputRef = ref(null)
const composerTextareaRef = ref(null)

const triggerChatFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleSelectChatFiles = (event) => {
  chatFileError.value = ''
  const files = Array.from(event.target.files || [])
  if (!files.length) return

  const currentCount = discussionFiles.value.length
  if (currentCount + files.length > 5) {
    chatFileError.value = 'Maksimal 5 berkas yang dapat dilampirkan'
    event.target.value = ''
    return
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  for (const file of files) {
    if (file.size > maxSize) {
      chatFileError.value = `Ukuran berkas "${file.name}" melebihi batas 10MB`
      event.target.value = ''
      return
    }
  }

  discussionFiles.value = [...discussionFiles.value, ...files]
  event.target.value = ''
}

const removeChatFile = (index) => {
  discussionFiles.value.splice(index, 1)
  chatFileError.value = ''
}

const autoGrowTextarea = () => {
  if (!composerTextareaRef.value) return
  composerTextareaRef.value.style.height = 'auto'
  const newHeight = Math.max(32, Math.min(composerTextareaRef.value.scrollHeight, 120))
  composerTextareaRef.value.style.height = `${newHeight}px`
}

const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendMessage()
  }
}

const handleSendMessage = () => {
  if (props.isLoading || (!discussionMessage.value.trim() && !discussionFiles.value.length)) return

  emit('sendMessage', {
    message: discussionMessage.value.trim(),
    files: [...discussionFiles.value]
  })

  discussionMessage.value = ''
  discussionFiles.value = []
  chatFileError.value = ''

  if (composerTextareaRef.value) {
    composerTextareaRef.value.style.height = 'auto'
  }
}

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<template>
        <div v-if="isOpen" class="chat-composer">
          <!-- Staged Files Preview -->
          <div v-if="discussionFiles.length" class="staged-files">
            <div
              v-for="(file, fIdx) in discussionFiles"
              :key="fIdx"
              class="staged-chip"
            >
              <IconDocument class="chip-icon" />
              <span class="chip-name">{{ file.name }}</span>
              <span class="chip-size">({{ formatSize(file.size) }})</span>
              <button
                type="button"
                class="chip-remove"
                title="Hapus berkas"
                @click="removeChatFile(fIdx)"
              >
                <IconClose class="chip-close" />
              </button>
            </div>
          </div>

          <!-- Input Bar: Separate Attachment Button, Input Container, and Send Button with Standard Rounded Corners -->
          <div class="composer-action-group">
            <input
              ref="fileInputRef"
              type="file"
              multiple
              class="file-input-hidden"
              @change="handleSelectChatFiles"
            >

            <button
              type="button"
              class="btn-clip"
              title="Lampirkan berkas (Maks 5 berkas, 10MB)"
              :disabled="isLoading || discussionFiles.length >= 5"
              @click="triggerChatFileInput"
            >
              <IconAttachment class="clip-icon" />
            </button>

            <div class="composer-input-wrapper">
              <textarea
                ref="composerTextareaRef"
                v-model="discussionMessage"
                rows="1"
                placeholder="Tulis pesan diskusi..."
                :disabled="isLoading"
                class="composer-input"
                @keydown="handleKeydown"
                @input="autoGrowTextarea"
              />
            </div>

            <button
              type="button"
              class="btn-send"
              title="Kirim pesan (Enter)"
              :disabled="isLoading || !discussionMessage.trim()"
              @click="handleSendMessage"
            >
              <IconSend class="send-icon" />
            </button>
          </div>

          <!-- Bottom hint / error row -->
          <div class="composer-meta-row">
            <span v-if="chatFileError" class="meta-error">{{ chatFileError }}</span>
            <span v-else class="meta-hint">Enter untuk kirim, Shift + Enter untuk baris baru</span>
          </div>
        </div>

        <!-- Closed State Footer -->
        <div v-else class="chat-closed-footer">
          <span>Sesi diskusi telah ditutup</span>
        </div>
</template>

<style scoped>
.chat-composer {
  flex-shrink: 0;

  display: flex;
  flex-direction: column;

  gap: var(--size-3xs);
  padding: var(--size-xs) var(--size-m);
  border-top: 1px solid var(--grey-200);
  background-color: var(--white);
}

.staged-files {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: var(--size-4xs);
  padding-bottom: 2px;
}

.staged-chip {
  display: flex;
  align-items: center;

  gap: var(--size-4xs);
  padding: var(--size-4xs) var(--size-xs);
  border-radius: var(--size-3xl);

  background-color: var(--grey-50);
  border: 1px solid var(--grey-200);
}

.staged-chip .chip-icon {
  width: var(--size-s);
  height: var(--size-s);
  flex-shrink: 0;

  color: var(--grey-500);
}

.staged-chip .chip-name {
  max-width: 140px;

  font-size: var(--size-xs);
  font-weight: var(--font-medium);
  color: var(--grey-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.staged-chip .chip-size {
  font-size: var(--size-xxs);
  color: var(--grey-400);
  flex-shrink: 0;
}

.chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.chip-close {
  width: var(--size-xxs);
  height: var(--size-xxs);
  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.chip-remove:hover .chip-close {
  color: var(--red-500);
}

/* Composer Action Group (Separate Container per element: Attachment, Textarea, Send) */
.composer-action-group {
  display: flex;
  align-items: flex-end;
  gap: var(--size-3xs);
}

.file-input-hidden {
  display: none;
}

.btn-clip {
  width: 40px;
  height: 40px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;
  border-radius: var(--size-xs);
  background-color: var(--grey-50);
  border: 1px solid var(--grey-300);
  cursor: pointer;
  color: var(--grey-500);
  transition: all var(--transition-fast) var(--transition-smooth);
}

.btn-clip:hover:not(:disabled) {
  color: var(--blue-600);
  background-color: var(--blue-50);
  border-color: var(--blue-300);
}

.btn-clip:disabled {
  opacity: 0.5;
  cursor: default;
}

.clip-icon {
  width: var(--size-m);
  height: var(--size-m);
}

.composer-input-wrapper {
  flex: 1;

  display: flex;
  align-items: center;

  border-radius: var(--size-xs);
  background-color: var(--grey-50);
  border: 1px solid var(--grey-300);
  transition: border-color var(--transition-fast) var(--transition-smooth),
              box-shadow var(--transition-fast) var(--transition-smooth),
              background-color var(--transition-fast) var(--transition-smooth);
}

.composer-input-wrapper:focus-within {
  background-color: var(--white);
  border-color: var(--blue-500);
  box-shadow: 0 0 0 2px rgba(59, 153, 246, 0.25);
}

.composer-input {
  width: 100%;
  min-height: 40px;
  height: 40px;
  max-height: 120px;
  resize: none;

  display: flex;
  align-items: center;

  box-sizing: border-box;
  padding: 9px var(--size-xs);
  border: none;
  outline: none;
  background: transparent;

  font-size: var(--size-s);
  font-weight: var(--font-regular);
  font-family: var(--font-secondary);
  line-height: 20px;
  color: var(--grey-800);
}

.composer-input::placeholder {
  color: var(--grey-400);
}

.btn-send {
  width: 40px;
  height: 40px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;
  border: none;
  border-radius: var(--size-xs);
  background-color: var(--blue-500);
  cursor: pointer;
  color: var(--white);
  transition: background-color var(--transition-fast) var(--transition-smooth);
}

.btn-send:hover:not(:disabled) {
  background-color: var(--blue-600);
}

.btn-send:disabled {
  background-color: var(--blue-300);
  cursor: default;
}

.send-icon {
  width: var(--size-m);
  height: var(--size-m);
}

.composer-meta-row {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  padding-top: var(--size-5xs);
  text-align: center;
}

.meta-hint {
  font-size: var(--size-xs);
  color: var(--grey-400);
  text-align: center;
}

.meta-error {
  font-size: var(--size-xs);
  color: var(--red-500);
  font-weight: var(--font-medium);
  text-align: center;
}

.chat-closed-footer {
  padding: var(--size-s);
  text-align: center;
  font-size: var(--size-s);
  font-weight: var(--font-medium);
  background-color: var(--grey-100);
  color: var(--grey-500);
  border-top: 1px solid var(--grey-200);
}

</style>
