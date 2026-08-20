<script setup>
import IconAttachment from '~/assets/icons/actions/attachment.svg?component'
import IconClose from '~/assets/icons/actions/close.svg?component'
import IconDocument from '~/assets/icons/actions/document.svg?component'
import BaseButtonDefault from '~/components/base/button/Default.vue'
import BaseModalConfirmation from '~/components/base/ModalConfirmation.vue'
import BaseModalImagePreview from '~/components/base/ModalImagePreview.vue'
import FeaturesAspirationAttachmentList from '~/components/features/aspiration/AttachmentList.vue'
import FeaturesAspirationCardSender from '~/components/features/aspiration/CardSender.vue'
import FeaturesAspirationCardVoting from '~/components/features/aspiration/CardVoting.vue'
import FeaturesAspirationDiscussionItem from '~/components/features/aspiration/DiscussionItem.vue'
import FeaturesAspirationDiscussionComposer from '~/components/features/aspiration/DiscussionComposer.vue'

const aspiration = defineModel({ type: Object, required: true })
const emit = defineEmits(['close', 'updated'])

const { session } = useSession()
const {
  isLoading,
  getAspirationById,
  closeAspiration,
  voteAspiration,
  sendDiscussion
} = useAPI()

const { connect, disconnect } = useAspirationStream()

const currentDetail = ref({ ...aspiration.value })
const discussions = ref([])
const isFetchingDetail = ref(true)
const chatPreviewImage = ref(null)
const isClosingDiscussion = ref(false)
const discussionListRef = ref(null)
const activeMobileTab = ref('detail') // 'detail' | 'discussion'

const isSuperAdmin = computed(() => session.value?.role === 'super_admin')

const isOwner = computed(() => {
  if (!session.value || !currentDetail.value) return false
  const senderId = currentDetail.value?.user_id || currentDetail.value?.sender_id || currentDetail.value?.user?.id || currentDetail.value?.sender?.id
  return senderId === session.value.id
})

const isInnovation = computed(() => currentDetail.value?.type === 'innovation')
const isCriticism = computed(() => currentDetail.value?.type === 'criticism')
const isOpen = computed(() => currentDetail.value?.status === 'open')
const isCriticismOpen = computed(() => isCriticism.value && isOpen.value)

const getAssetUrl = (path) => {
  if (!path) return '#'
  if (path.startsWith('http')) return path
  return `/${path.replace(/^\//, '')}`
}

const scrollToBottom = (behavior = 'auto') => {
  nextTick(() => {
    if (!discussionListRef.value) return
    discussionListRef.value.scrollTo({
      top: discussionListRef.value.scrollHeight,
      behavior
    })
    requestAnimationFrame(() => {
      if (discussionListRef.value) {
        discussionListRef.value.scrollTop = discussionListRef.value.scrollHeight
      }
    })
  })
}

watch(activeMobileTab, (newTab) => {
  if (newTab === 'discussion') {
    scrollToBottom()
  }
})

const handleNewDiscussion = (newMsg) => {
  if (!newMsg) return
  const exists = discussions.value.some((d) => d.id === newMsg.id)
  if (!exists) {
    discussions.value.push(newMsg)
    scrollToBottom('smooth')
  }
}

const fetchDetail = async () => {
  if (!aspiration.value?.id) return
  isFetchingDetail.value = true
  const res = await getAspirationById(aspiration.value.id)
  if (res?.data) {
    currentDetail.value = res.data
    discussions.value = res.data.discussions || []
    if (activeMobileTab.value === 'discussion') {
      scrollToBottom()
    }
  }
  isFetchingDetail.value = false
}

const handleSendDiscussion = async ({ message, files }) => {
  const data = { message, files }
  const res = await sendDiscussion(aspiration.value.id, data)
  if (res?.success) {
    if (res.data) {
      handleNewDiscussion(res.data)
    }
  }
}

const confirmCloseDiscussion = async () => {
  const res = await closeAspiration(aspiration.value.id)
  if (res?.success) {
    currentDetail.value.status = 'close'
    isClosingDiscussion.value = false
    emit('updated')
  }
}

const handleVote = async (value) => {
  const res = await voteAspiration(aspiration.value.id, value)
  if (res?.success) {
    await fetchDetail()
    emit('updated')
  }
}

const handlePreviewImage = (att) => {
  chatPreviewImage.value = att
}

onMounted(async () => {
  await fetchDetail()
  if (aspiration.value?.id) {
    connect(aspiration.value.id, handleNewDiscussion)
  }
  scrollToBottom()
})

onUnmounted(() => {
  disconnect()
})

// Handle ESC key to close drawer
const handleGlobalKeydown = (e) => {
  if (e.key === 'Escape' && !chatPreviewImage.value && !isClosingDiscussion.value) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="drawer-overlay" @click.self="emit('close')">
    <aside class="drawer-panel" role="dialog" aria-modal="true" aria-label="Detail Aspirasi">
      <!-- Sticky Drawer Header -->
      <header class="drawer-header">
        <div class="drawer-header-main">
          <h2 class="drawer-title">{{ currentDetail.subject }}</h2>
          <button
            type="button"
            class="btn-close-drawer"
            title="Tutup Panel"
            @click="emit('close')"
          >
            <IconClose class="icon-close" />
          </button>
        </div>

        <!-- Segmented Tab Bar Switcher -->
        <div class="drawer-tabs-bar">
          <button
            type="button"
            :class="['drawer-tab-btn', { active: activeMobileTab === 'detail' }]"
            @click="activeMobileTab = 'detail'"
          >
            <span>Detail Aspirasi</span>
          </button>
          <button
            type="button"
            :class="['drawer-tab-btn', { active: activeMobileTab === 'discussion' }]"
            @click="activeMobileTab = 'discussion'"
          >
            <span>Diskusi & Tanggapan</span>
            <span class="tab-count-badge">{{ discussions.length }}</span>
          </button>
        </div>
      </header>

      <!-- Drawer Body Content: Detail & Voting Pane -->
      <div v-show="activeMobileTab === 'detail'" class="drawer-body-pane detail-pane">
        <!-- 1. Sender & Metadata Card -->
        <FeaturesAspirationCardSender :aspiration="currentDetail" />

        <!-- 2. Description Card -->
        <div class="info-card">
          <div class="card-header">
            <div class="card-title-group">
              <IconDocument class="card-icon" />
              <h4 class="card-title">Deskripsi Aspirasi</h4>
            </div>
          </div>
          <div class="card-body">
            <p class="description-text">{{ currentDetail.body }}</p>
          </div>
        </div>

        <!-- 3. Attachments Card -->
        <div v-if="currentDetail.attachments && currentDetail.attachments.length" class="info-card">
          <div class="card-header">
            <div class="card-title-group">
              <IconAttachment class="card-icon" />
              <h4 class="card-title">Lampiran Berkas</h4>
            </div>
            <span class="card-count">{{ currentDetail.attachments.length }} Berkas</span>
          </div>
          <div class="card-body attachment-card-body">
            <FeaturesAspirationAttachmentList :attachments="currentDetail.attachments" />
          </div>
        </div>

        <!-- 4. Close Criticism Action Card (For Criticism) -->
        <div v-if="isCriticismOpen && (isSuperAdmin || isOwner)" class="info-card action-card bottom-anchored">
          <div class="action-card-content">
            <div class="action-card-text">
              <h4 class="action-card-title">Selesaikan Diskusi</h4>
              <p class="action-card-desc">Tutup sesi ini apabila pembahasan telah selesai atau tersolusikan.</p>
            </div>
            <BaseButtonDefault
              variant="warning"
              label="Tutup Diskusi"
              :loading="isLoading"
              @click="isClosingDiscussion = true"
            />
          </div>
        </div>

        <!-- 5. Innovation Voting & Decision Card -->
        <FeaturesAspirationCardVoting
          v-if="isInnovation"
          :aspiration="currentDetail"
          :is-loading="isLoading"
          @vote="handleVote"
        />
      </div>

      <!-- Drawer Body Content: Discussion & Chat Pane -->
      <div v-show="activeMobileTab === 'discussion'" class="drawer-body-pane chat-pane">
        <!-- Chat Message Thread -->
        <div ref="discussionListRef" class="chat-messages">
          <!-- Empty State -->
          <div v-if="!discussions.length" class="empty-chat">
            <div class="empty-circle">
              <IconAttachment class="empty-icon" />
            </div>
            <span class="empty-heading">Belum Ada Diskusi</span>
            <span class="empty-subheading">Kirimkan tanggapan atau masukan untuk memulai obrolan.</span>
          </div>

          <!-- Message Bubbles via Sub-component -->
          <FeaturesAspirationDiscussionItem
            v-for="msg in discussions"
            :key="msg.id"
            :message="msg"
            :is-criticism="isCriticism"
            :is-innovation="isInnovation"
            :aspiration-sender-id="currentDetail?.user_id || currentDetail?.sender_id || currentDetail?.user?.id || currentDetail?.sender?.id"
            :aspiration-sender-name="currentDetail?.sender?.name || currentDetail?.user?.name"
            @preview-image="handlePreviewImage"
          />
        </div>

        <!-- Discussion Composer via Sub-component -->
        <FeaturesAspirationDiscussionComposer
          :is-open="isOpen"
          :is-loading="isLoading"
          @send-message="handleSendDiscussion"
        />
      </div>

      <!-- Chat Attachment Lightbox Modal Preview -->
      <Teleport to="body">
        <Transition name="modal">
          <BaseModalImagePreview
            v-if="chatPreviewImage"
            :src="chatPreviewImage.images ? '' : getAssetUrl(chatPreviewImage.path || chatPreviewImage.src)"
            :title="chatPreviewImage.images ? '' : (chatPreviewImage.name || chatPreviewImage.title)"
            :size="chatPreviewImage.images ? null : chatPreviewImage.size"
            :images="chatPreviewImage.images || []"
            :initial-index="chatPreviewImage.index || 0"
            @close="chatPreviewImage = null"
          />
        </Transition>
      </Teleport>

      <!-- Confirmation Modal for Closing Discussion -->
      <Teleport to="body">
        <Transition name="modal">
          <BaseModalConfirmation
            v-if="isClosingDiscussion"
            title="Konfirmasi Tutup Diskusi"
            message="Apakah Anda yakin ingin menutup sesi diskusi ini? Setelah ditutup, sesi ini tidak dapat menerima tanggapan baru lagi."
            confirm-label="Ya, Tutup Diskusi"
            confirm-variant="danger"
            :loading="isLoading"
            @close="isClosingDiscussion = false"
            @confirm="confirmCloseDiscussion"
          />
        </Transition>
      </Teleport>
    </aside>
  </div>
</template>

<style scoped>
/* ==========================================================================
   Slide-over Drawer Shell & Overlay
   ========================================================================== */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  display: flex;
  justify-content: flex-end;

  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: opacity var(--transition-normal) var(--transition-smooth);
}

.drawer-panel {
  width: 100%;
  max-width: 600px;
  height: 100%;
  max-height: 100vh;

  display: flex;
  flex-direction: column;

  background-color: var(--white);
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* ==========================================================================
   Sticky Header & Segmented Tabs
   ========================================================================== */
.drawer-header {
  width: 100%;
  flex-shrink: 0;

  display: flex;
  flex-direction: column;

  gap: var(--size-xs);
  padding: var(--size-m) var(--size-l) var(--size-s);
  border-bottom: 1px solid var(--grey-200);
  background-color: var(--white);
  z-index: 10;
}

.drawer-header-main {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--size-s);
}

.drawer-title {
  flex: 1;
  min-width: 0;

  font-size: var(--size-l);
  font-weight: var(--font-bold);
  font-family: var(--font-primary);
  line-height: 1.35;
  color: var(--grey-900);
}

.btn-close-drawer {
  width: var(--size-xxl);
  height: var(--size-xxl);
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: var(--size-5xs);
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--grey-400);
  transition: color var(--transition-fast) var(--transition-smooth);
}

.btn-close-drawer:hover {
  background: transparent;
  color: var(--red-500);
}

.btn-close-drawer .icon-close {
  width: var(--size-s);
  height: var(--size-s);
}

/* Segmented Switcher Tabs */
.drawer-tabs-bar {
  width: 100%;

  display: flex;
  align-items: center;

  gap: var(--size-5xs);
  padding: var(--size-5xs);
  border-radius: var(--size-xs);

  background-color: var(--grey-100);
  border: 1px solid var(--grey-200);
}

.drawer-tab-btn {
  flex: 1;
  height: var(--size-3xl);

  display: flex;
  align-items: center;
  justify-content: center;

  gap: var(--size-3xs);
  padding: 0 var(--size-s);
  border-radius: var(--size-3xs);
  border: none;
  background: transparent;

  font-size: var(--size-xs);
  font-weight: var(--font-medium);
  font-family: var(--font-primary);
  color: var(--grey-600);
  cursor: pointer;
  transition: all var(--transition-fast) var(--transition-smooth);
}

.drawer-tab-btn.active {
  background-color: var(--white);
  color: var(--grey-800);
  font-weight: var(--font-semibold);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: var(--size-l);
  height: var(--size-l);
  padding: 0 var(--size-4xs);
  border-radius: var(--size-3xl);

  font-size: var(--size-xxs);
  font-weight: var(--font-bold);
  background-color: var(--grey-200);
  color: var(--grey-700);
}

.drawer-tab-btn.active .tab-count-badge {
  background-color: var(--grey-200);
  color: var(--grey-800);
}

/* ==========================================================================
   Drawer Body Panes
   ========================================================================== */
.drawer-body-pane {
  flex: 1;
  min-height: 0;

  display: flex;
  flex-direction: column;
}

.detail-pane {
  overflow-y: auto;
  overscroll-behavior: contain;
  gap: var(--size-s);
  padding: var(--size-m);
  padding-bottom: var(--size-xl);
  background-color: var(--grey-50);
}

/* Base Info Card */
.info-card {
  width: 100%;
  flex-shrink: 0;

  display: flex;
  flex-direction: column;

  border-radius: var(--size-xs);
  background-color: var(--white);
  border: 1px solid var(--grey-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.bottom-anchored {
  margin-top: auto;
}

/* Card Header & Body */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: var(--size-xs) var(--size-s);
  background-color: var(--grey-50);
  border-bottom: 1px solid var(--grey-200);
}

.card-title-group {
  display: flex;
  align-items: center;

  gap: var(--size-4xs);
}

.card-icon {
  width: var(--size-s);
  height: var(--size-s);
  color: var(--grey-500);
}

.card-title {
  font-size: var(--size-xs);
  font-weight: var(--font-bold);
  font-family: var(--font-primary);
  text-transform: uppercase;
  letter-spacing: 0.3px;

  color: var(--grey-700);
}

.card-count {
  font-size: var(--size-xs);
  font-weight: var(--font-regular);

  color: var(--grey-500);
}

.card-body {
  padding: var(--size-s);
}

.description-text {
  font-size: var(--size-s);
  font-weight: var(--font-regular);
  line-height: 1.65;
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: pre-wrap;

  color: var(--grey-800);
}

.attachment-card-body {
  padding: var(--size-xs) var(--size-s);
}

/* Action Card (e.g. Selesaikan Diskusi) */
.action-card {
  padding: var(--size-s);
  background-color: var(--yellow-50);
  border-color: var(--yellow-200);
}

.action-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--size-s);
}

.action-card-text {
  display: flex;
  flex-direction: column;

  gap: 2px;
}

.action-card-title {
  font-size: var(--size-s);
  font-weight: var(--font-bold);
  font-family: var(--font-primary);

  color: var(--yellow-900);
}

.action-card-desc {
  font-size: var(--size-xs);
  font-weight: var(--font-regular);

  color: var(--yellow-800);
}

/* ==========================================================================
   Chat Pane & Empty State
   ========================================================================== */
.chat-pane {
  overflow: hidden;
  min-height: 0;
  background-color: var(--grey-50);
}

.chat-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;

  display: flex;
  flex-direction: column;

  gap: var(--size-s);
  padding: var(--size-m);
}

/* Empty Chat */
.empty-chat {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  gap: var(--size-4xs);
  padding: var(--size-xl) var(--size-m);
}

.empty-circle {
  width: var(--size-3xl);
  height: var(--size-3xl);

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
  background-color: var(--grey-100);
  border: 1px solid var(--grey-200);
}

.empty-icon {
  width: var(--size-m);
  height: var(--size-m);
  color: var(--grey-400);
}

.empty-heading {
  font-size: var(--size-s);
  font-weight: var(--font-semibold);
  color: var(--grey-700);
}

.empty-subheading {
  max-width: 240px;
  font-size: var(--size-xs);
  font-weight: var(--font-regular);
  line-height: 1.4;
  color: var(--grey-400);
}

/* ==========================================================================
   Mobile Responsive Adjustments (Full Screen Sheet)
   ========================================================================== */
@media (max-width: 768px) {
  .drawer-panel {
    max-width: 100vw;
    border-radius: 0;
  }

  .drawer-header {
    padding: var(--size-s) var(--size-m) var(--size-xs);
  }

  .drawer-title {
    font-size: var(--size-m);
  }

  .detail-pane {
    padding: var(--size-m);
    gap: var(--size-s);
  }

  .chat-messages {
    padding: var(--size-s);
  }
}
</style>
