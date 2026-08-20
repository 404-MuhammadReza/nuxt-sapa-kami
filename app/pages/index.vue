<script setup>
import IconIdea from '~/assets/icons/menu/idea-fill.svg?component'
import IconCriticism from '~/assets/icons/menu/criticism-fill.svg?component'
import IconSend from '~/assets/icons/actions/send.svg?component'
import IconChevronRight from '~/assets/icons/chevron/right.svg?component'

const form = reactive({ type: '', subject: '', body: '', files: [] })
const resetForm = () => {
  form.type = ''
  form.subject = ''
  form.body = ''
  form.files = []
}
const isValidForm = computed(() => Boolean(form.subject && form.body))

const isConfirmed = ref(false)
const setConfirmed = () => {
  isConfirmed.value = !isConfirmed.value
}

const isSubmitted = ref(false)
const setSubmitted = () => {
  isSubmitted.value = !isSubmitted.value
}

const localMsg = ref(null)
const setErrMsg = (msg = null) => {
  if (msg) localMsg.value = msg
  else localMsg.value = null
  setTimeout(() => {
    localMsg.value = null
  }, 5000)
}

const { isLoading, errMsg, submitAspiration } = useAPI()

const handleSubmit = async () => {
  if (!form.type) return setErrMsg('Pilih jenis aspirasi terlebih dahulu!')
  else setErrMsg()

  if (!isValidForm.value) return
  if (!isConfirmed.value) return setConfirmed()

  const result = await submitAspiration(form)
  if (result) {
    resetForm()
    setSubmitted()
  }

  setConfirmed()
}

const typeOptions = [
  {
    value: 'innovation',
    label: 'Inovasi',
    desc: 'Identitas Anda akan disertakan untuk keperluan apresiasi dan tindak lanjut.',
    icon: IconIdea
  },
  {
    value: 'criticism',
    label: 'Kritik dan Saran',
    desc: 'Aspirasi dikirimkan secara anonim tanpa menyertakan identitas pengirim.',
    icon: IconCriticism
  }
]

const feedbackText = computed(() => {
  if (isSubmitted.value) {
    return {
      title: 'ASPIRASI ANDA TELAH TERKIRIM!',
      desc: 'Terima kasih atas partisipasi Anda. Setiap ide inovasi, kritik, maupun saran yang Anda berikan sangat berarti bagi bahan evaluasi dan pengembangan ke depannya. Masukan Anda telah dicatat dalam sistem dan dapat dipantau pada halaman Riwayat Aspirasi.'
    }
  }

  if (isConfirmed.value) {
    if (form.type === 'innovation') {
      return {
        title: 'KONFIRMASI PENGIRIMAN ASPIRASI "INOVASI"',
        desc: 'Apakah Anda yakin ingin mengirimkan inovasi? Identitas Anda akan disertakan untuk keperluan apresiasi dan tindak lanjut.'
      }
    }

    if (form.type === 'criticism') {
      return {
        title: 'KONFIRMASI PENGIRIMAN ASPIRASI "KRITIK DAN SARAN"',
        desc: 'Apakah Anda yakin ingin mengirimkan kritik dan saran? Aspirasi dikirimkan secara anonim tanpa menyertakan identitas pengirim.'
      }
    }
  }

  return { title: '', desc: '' }
})
</script>

<template>
  <div class="home-page">
    <BaseContainer max-width="1000px">
      <div class="content-wrapper">
        <template v-if="!isConfirmed && !isSubmitted">
          <FeaturesUserCard />

          <form autocomplete="off" @submit.prevent="handleSubmit">
            <BaseInputRadio
              v-model="form.type"
              :options="typeOptions"
              :disabled="isLoading"
            />
            <BaseInputDefault
              v-model="form.subject"
              variant="dark"
              label="Subjek"
              placeholder="Masukkan subjek"
              :disabled="isLoading"
              show-label
              required
            />
            <BaseInputTextarea
              v-model="form.body"
              variant="dark"
              label="Isi Aspirasi"
              placeholder="Tuliskan aspirasi anda secara jelas dan lengkap"
              :disabled="isLoading"
              show-label
              required
            />
            <BaseInputFile
              v-model="form.files"
              variant="dark"
              label="Lampiran Berkas"
              show-label
              :disabled="isLoading"
            />
            <div class="wrapper">
              <BaseMessage
                v-if="localMsg || errMsg"
                :value="localMsg || errMsg"
                variant="danger"
              />
              <BaseButtonDefault
                variant="primary"
                label="Lanjutkan"
                icon-order="right"
                :icon="IconSend"
                :disabled="!isValidForm || isLoading"
                type="submit"
              />
            </div>
          </form>
        </template>

        <template v-else>
          <div :class="['feedback', { 'is-confirmed': isConfirmed }]">
            <div class="text">
              <h3>{{ feedbackText.title }}</h3>
              <span>{{ feedbackText.desc }}</span>
            </div>

            <div class="actions">
              <template v-if="isConfirmed">
                <BaseButtonDefault
                  variant="secondary"
                  label="Batal"
                  :disabled="isLoading"
                  @click="setConfirmed"
                />
                <BaseButtonDefault
                  variant="primary"
                  label="Kirim Aspirasi"
                  icon-order="right"
                  loading-text="Mengirim..."
                  :icon="IconSend"
                  :loading="isLoading"
                  @click="handleSubmit"
                />
              </template>
              <template v-else-if="isSubmitted">
                <BaseButtonDefault
                  variant="secondary"
                  label="Kirim Aspirasi Lain"
                  @click="setSubmitted"
                />
                <NuxtLink to="/history" class="btn-link">
                  <BaseButtonDefault
                    variant="primary"
                    label="Pantau di Riwayat"
                    icon-order="right"
                    :icon="IconChevronRight"
                  />
                </NuxtLink>
              </template>
            </div>
          </div>
        </template>
      </div>
    </BaseContainer>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
  flex: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
}

.home-page .content-wrapper {
  width: 100%;
  z-index: 2;
  flex: 1;

  display: flex;
  flex-direction: column;

  gap: var(--size-s);
}

.home-page .content-wrapper form {
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: flex-end;

  gap: var(--size-s);
  padding-top: var(--size-s);
  border-top: 1px solid var(--grey-200);
}

.home-page .content-wrapper form .wrapper {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: var(--size-s);
}

.home-page .content-wrapper .feedback {
  width: 100%;
  flex: 1;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: var(--size-m);
  padding: var(--size-m);
}

.home-page .content-wrapper .feedback .text {
  max-width: 400px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-xxs);
}

.home-page .content-wrapper .feedback.is-confirmed .text {
  gap: var(--size-5xs);
}

.home-page .content-wrapper .feedback .text h3 {
  font-size: var(--size-xl);
  font-weight: var(--font-extrabold);
  text-align: center;

  color: var(--grey-800);
}

.home-page .content-wrapper .feedback.is-confirmed .text h3 {
  line-height: 1.5;
}

.home-page .content-wrapper .feedback .text span {
  font-size: var(--size-s);
  font-weight: var(--font-medium);

  line-height: 1.5;
  text-align: center;

  color: var(--grey-500);
}

.home-page .content-wrapper .feedback .actions {
  width: 100%;
  max-width: 340px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: var(--size-s);
}

.home-page .content-wrapper .feedback .actions .btn-link {
  text-decoration: none;
}

.home-page .content-wrapper .feedback.is-confirmed .actions :deep(button) {
  flex: 1;
}

@media (max-width: 640px) {
  .home-page .content-wrapper .feedback .actions {
    flex-direction: column;
  }

  .home-page .content-wrapper .feedback .actions :deep(button),
  .home-page .content-wrapper .feedback .actions .btn-link {
    width: 100%;
  }
}
</style>
