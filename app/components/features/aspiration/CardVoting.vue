<script setup>
import IconRosetteCheck from '~/assets/icons/notification/rosette-check.svg?component'
import IconError from '~/assets/icons/notification/error.svg?component'
import IconDocument from '~/assets/icons/actions/document.svg?component'
import { formatDate } from '~/utils/format'

const props = defineProps({
  aspiration: { type: Object, required: true },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['vote'])

const { session } = useSession()

const isOnlyAdmin = computed(() => session.value?.role === 'admin')

const isOwner = computed(() => {
  if (!session.value || !props.aspiration) return false
  const senderId = props.aspiration?.user_id || props.aspiration?.sender_id || props.aspiration?.user?.id || props.aspiration?.sender?.id
  return senderId === session.value.id
})

const isInnovation = computed(() => props.aspiration?.type === 'innovation')
const isInnovationOpen = computed(() => props.aspiration?.status === 'open')
const isAccepted = computed(() => props.aspiration?.status === 'accepted')
const isRejected = computed(() => props.aspiration?.status === 'rejected')
const isClosed = computed(() => props.aspiration?.status === 'close')
const isDecided = computed(() => props.aspiration?.status !== 'open')
const canVote = computed(() => isOnlyAdmin.value && isInnovationOpen.value && !isOwner.value)

const userHasVoted = computed(() => {
  if (props.aspiration?.user_vote) return props.aspiration.user_vote
  if (!Array.isArray(props.aspiration?.votes) || !session.value?.id) return null
  const v = props.aspiration.votes.find(x => x.user_id === session.value.id || x.voter_id === session.value.id || x.admin_id === session.value.id)
  return v ? v.value : null
})

const acceptCount = computed(() => props.aspiration?.vote_count?.accept ?? props.aspiration?.agree_count ?? 0)
const rejectCount = computed(() => props.aspiration?.vote_count?.reject ?? props.aspiration?.reject_count ?? 0)
const totalAdmins = computed(() => props.aspiration?.vote_count?.total_admins ?? props.aspiration?.total_admins ?? 0)
const totalVotes = computed(() => acceptCount.value + rejectCount.value)

const acceptPercent = computed(() => {
  const base = totalAdmins.value || totalVotes.value
  if (!base) return 0
  return Math.round((acceptCount.value / base) * 100)
})

const rejectPercent = computed(() => {
  const base = totalAdmins.value || totalVotes.value
  if (!base) return 0
  return Math.round((rejectCount.value / base) * 100)
})

const handleVote = (val) => {
  if (userHasVoted.value === val) return
  emit('vote', val)
}
</script>

<template>
        <!-- 5. Innovation Voting & Decision Card (Modern Poll Cards) -->
        <div v-if="isInnovation" class="info-card voting-card bottom-anchored">
          <!-- Official Verdict Banner when Decided -->
          <div v-if="isDecided" :class="['verdict-banner', { 'is-accepted': isAccepted, 'is-rejected': isRejected, 'is-closed': isClosed }]">
            <div class="verdict-banner-content">
              <IconRosetteCheck v-if="isAccepted" class="verdict-icon" />
              <IconError v-else-if="isRejected" class="verdict-icon" />
              <IconDocument v-else class="verdict-icon" />
              <div class="verdict-text-group">
                <span class="verdict-title">
                  {{ isAccepted ? 'Usulan Inovasi Disetujui' : (isRejected ? 'Usulan Inovasi Ditolak' : 'Persetujuan Ditutup') }}
                </span>
                <span class="verdict-desc">
                  {{ isAccepted ? 'Kuorum persetujuan manajemen telah terpenuhi.' : (isRejected ? 'Kuorum persetujuan manajemen tidak tercapai atau ditolak.' : 'Periode evaluasi inovasi telah berakhir.') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Header -->
          <div class="card-header voting-header">
            <div class="card-title-group">
              <h4 class="card-title">{{ isDecided ? 'Hasil Persetujuan Manajemen' : 'Persetujuan Manajemen' }}</h4>
            </div>
            <div class="voting-header-meta">
              <span class="voting-meta-total">{{ totalVotes }} / {{ totalAdmins || totalVotes }} Suara Masuk</span>
              <template v-if="isInnovationOpen && aspiration.expired_at">
                <span class="voting-meta-divider">•</span>
                <span class="voting-meta-deadline">s.d. {{ formatDate(aspiration.expired_at) }}</span>
              </template>
              <template v-else-if="isDecided">
                <span class="voting-meta-divider">•</span>
                <span class="voting-meta-finished">Selesai</span>
              </template>
            </div>
          </div>

          <div class="card-body voting-card-body">
            <!-- Agree Poll Row Card (Clickable Button) -->
            <component
              :is="canVote ? 'button' : 'div'"
              type="button"
              :class="[
                'poll-row-card',
                'agree',
                {
                  'is-interactive': canVote,
                  'is-selected': userHasVoted === 'accept' && !isRejected,
                  'is-winner': isAccepted,
                  'is-dimmed': isRejected
                }
              ]"
              :disabled="isLoading"
              @click="canVote && handleVote('accept')"
            >
              <div class="poll-row-top">
                <div class="poll-row-label">
                  <div class="stat-badge agree">
                    <IconRosetteCheck class="stat-badge-icon" />
                    <span>Setuju</span>
                  </div>
                  <span v-if="userHasVoted === 'accept'" class="voted-badge agree">Dipilih</span>
                </div>

                <div class="poll-row-stats">
                  <span class="poll-percent-val">{{ acceptPercent }}%</span>
                  <span class="poll-count-val">({{ acceptCount }} Suara)</span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="poll-track">
                <div
                  class="poll-fill agree"
                  :style="{ width: `${acceptPercent}%` }"
                />
              </div>
            </component>

            <!-- Reject Poll Row Card (Clickable Button) -->
            <component
              :is="canVote ? 'button' : 'div'"
              type="button"
              :class="[
                'poll-row-card',
                'reject',
                {
                  'is-interactive': canVote,
                  'is-selected': userHasVoted === 'reject' && !isAccepted,
                  'is-winner': isRejected,
                  'is-dimmed': isAccepted
                }
              ]"
              :disabled="isLoading"
              @click="canVote && handleVote('reject')"
            >
              <div class="poll-row-top">
                <div class="poll-row-label">
                  <div class="stat-badge reject">
                    <IconError class="stat-badge-icon" />
                    <span>Tolak</span>
                  </div>
                  <span v-if="userHasVoted === 'reject'" class="voted-badge reject">Dipilih</span>
                </div>

                <div class="poll-row-stats">
                  <span class="poll-percent-val">{{ rejectPercent }}%</span>
                  <span class="poll-count-val">({{ rejectCount }} Suara)</span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="poll-track">
                <div
                  class="poll-fill reject"
                  :style="{ width: `${rejectPercent}%` }"
                />
              </div>
            </component>

            <!-- Admin Voting Instruction Hint -->
            <p
              v-if="isInnovationOpen && isOnlyAdmin"
              class="voting-instruction-hint"
            >
              <template v-if="isOwner">
                Pengusul inovasi tidak dapat memberikan suara voting.
              </template>
              <template v-else-if="userHasVoted">
                Klik opsi lainnya jika ingin mengubah pilihan suara.
              </template>
              <template v-else>
                Klik salah satu opsi di atas untuk memberikan suara.
              </template>
            </p>
          </div>
        </div>
</template>

<style scoped>
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


/* Voting Card (Modern Poll Cards with Verdict State) */
.voting-card {
  border-color: var(--grey-200);
  overflow: hidden;
}

/* Official Verdict Banner */
.verdict-banner {
  display: flex;
  align-items: center;

  gap: var(--size-s);
  padding: var(--size-s);
  border-bottom: 1px solid var(--grey-200);
}

.verdict-banner.is-accepted {
  background-color: var(--green-50);
  border-color: var(--green-200);
}

.verdict-banner.is-rejected {
  background-color: var(--red-50);
  border-color: var(--red-200);
}

.verdict-banner.is-closed {
  background-color: var(--grey-100);
  border-color: var(--grey-200);
}

.verdict-banner-content {
  display: flex;
  align-items: center;
  gap: var(--size-s);
}

.verdict-icon {
  width: var(--size-xxl);
  height: var(--size-xxl);
  flex-shrink: 0;
}

.verdict-banner.is-accepted .verdict-icon {
  color: var(--green-700);
}

.verdict-banner.is-rejected .verdict-icon {
  color: var(--red-700);
}

.verdict-banner.is-closed .verdict-icon {
  color: var(--grey-700);
}

.verdict-text-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.verdict-title {
  font-size: var(--size-s);
  font-weight: var(--font-bold);
  font-family: var(--font-primary);
  line-height: 1.25;
}

.verdict-banner.is-accepted .verdict-title {
  color: var(--green-900);
}

.verdict-banner.is-rejected .verdict-title {
  color: var(--red-900);
}

.verdict-banner.is-closed .verdict-title {
  color: var(--grey-900);
}

.verdict-desc {
  font-size: var(--size-xxs);
  font-weight: var(--font-regular);
  color: var(--grey-600);
  line-height: 1.2;
}

.verdict-banner.is-accepted .verdict-desc {
  color: var(--green-700);
}

.verdict-banner.is-rejected .verdict-desc {
  color: var(--red-700);
}

.verdict-banner.is-closed .verdict-desc {
  color: var(--grey-600);
}

/* Card Header */
.voting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: var(--size-xs) var(--size-s);
  background-color: var(--grey-50);
  border-bottom: 1px solid var(--grey-200);
}

.voting-header .card-title {
  font-size: var(--size-xs);
  font-weight: var(--font-bold);
  font-family: var(--font-primary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--grey-700);
}

.voting-header-meta {
  display: flex;
  align-items: center;
  gap: var(--size-3xs);

  font-size: var(--size-xxs);
  font-weight: var(--font-medium);
  color: var(--grey-600);
}

.voting-meta-total {
  font-weight: var(--font-semibold);
  color: var(--grey-800);
}

.voting-meta-divider {
  color: var(--grey-300);
}

.voting-meta-deadline {
  color: var(--grey-600);
}

.voting-meta-finished {
  font-weight: var(--font-semibold);
  color: var(--grey-700);
}

.voting-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--size-xs);
  padding: var(--size-s);
  background-color: var(--white);
}

/* Modern Poll Cards (Interactive & Static) */
.poll-row-card {
  width: 100%;
  text-align: left;
  font-family: inherit;
  color: inherit;
  outline: none;

  display: flex;
  flex-direction: column;
  gap: var(--size-3xs);

  padding: var(--size-s);
  border-radius: var(--size-xs);
  border: 1px solid var(--grey-200);
  background-color: var(--grey-50);
  transition: all var(--transition-fast) var(--transition-smooth);
}

.poll-row-card.agree {
  background-color: var(--green-50);
  border-color: var(--green-200);
}

.poll-row-card.reject {
  background-color: var(--red-50);
  border-color: var(--red-200);
}

/* Interactive button states when voting is active */
.poll-row-card.is-interactive {
  cursor: pointer;
}

.poll-row-card.is-interactive.is-selected {
  cursor: default;
}

@media (hover: hover) {
  .poll-row-card.agree.is-interactive:hover:not(:disabled) {
    border-color: var(--green-400);
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.08);
  }

  .poll-row-card.reject.is-interactive:hover:not(:disabled) {
    border-color: var(--red-400);
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.08);
  }
}

/* Selected state (matches hover outline) & Final Winner state */
.poll-row-card.agree.is-selected,
.poll-row-card.agree.is-winner {
  border-color: var(--green-400);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.08);
}

.poll-row-card.reject.is-selected,
.poll-row-card.reject.is-winner {
  border-color: var(--red-400);
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.08);
}

.poll-row-card.is-dimmed {
  opacity: 0.55;
}

.poll-row-card:disabled {
  opacity: 0.6;
  cursor: default;
}

.poll-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--size-s);
}

.poll-row-label {
  display: flex;
  align-items: center;
  gap: var(--size-xs);
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--size-4xs);

  font-size: var(--size-s);
  font-weight: var(--font-extrabold);
  font-family: var(--font-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-badge.agree {
  color: var(--green-800);
}

.stat-badge.reject {
  color: var(--red-800);
}

.stat-badge-icon {
  width: var(--size-m);
  height: var(--size-m);
}

/* Inline Selected Badge next to option label */
.voted-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 2px var(--size-3xs);
  border-radius: var(--size-3xl);

  font-size: var(--size-xxs);
  font-weight: var(--font-semibold);
  font-family: var(--font-primary);
  line-height: 1.2;
}

.voted-badge.agree {
  color: var(--green-800);
  background-color: var(--green-100);
  border: 1px solid var(--green-300);
}

.voted-badge.reject {
  color: var(--red-800);
  background-color: var(--red-100);
  border: 1px solid var(--red-300);
}

.poll-row-stats {
  display: flex;
  align-items: baseline;
  gap: var(--size-4xs);
}

.poll-percent-val {
  font-size: var(--size-m);
  font-weight: var(--font-extrabold);
  font-family: var(--font-primary);
  line-height: 1;
}

.poll-row-card.agree .poll-percent-val {
  color: var(--green-900);
}

.poll-row-card.reject .poll-percent-val {
  color: var(--red-900);
}

.poll-row-card.agree .poll-count-val {
  font-size: var(--size-xxs);
  font-weight: var(--font-semibold);
  color: var(--green-700);
}

.poll-row-card.reject .poll-count-val {
  font-size: var(--size-xxs);
  font-weight: var(--font-semibold);
  color: var(--red-700);
}

/* Progress Bar */
.poll-track {
  width: 100%;
  height: 6px;

  border-radius: var(--size-3xl);
  background-color: rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.poll-fill {
  height: 100%;
  border-radius: var(--size-3xl);
  transition: width var(--transition-normal) var(--transition-smooth);
}

.poll-fill.agree {
  background-color: var(--green-500);
}

.poll-fill.reject {
  background-color: var(--red-500);
}

/* Minimal Voting Instruction Hint at bottom center */
.voting-instruction-hint {
  margin: 0;
  width: 100%;
  text-align: center;

  font-size: var(--size-xxs);
  font-weight: var(--font-regular);
  font-family: var(--font-primary);
  color: var(--grey-500);
  line-height: 1.3;
}

</style>
