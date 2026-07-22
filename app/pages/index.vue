<script setup>
import IconSend from '~/assets/icons/actions/send.svg?component'
import IconIdea from '~/assets/icons/menu/idea-fill.svg?component'
import IconCriticism from '~/assets/icons/menu/criticism-fill.svg?component'

const { session } = useSession()
const isAdmin = computed(() => ['admin', 'super_admin'].includes(session.value?.role))

const form = reactive({ type: '', subject: '', body: '' })
const resetForm = () => { form.type = ''; form.subject = ''; form.body = '' }
const isValidForm = computed(() => form.subject && form.body)

const isConfirmed = ref(false)
const setConfirmed = () => isConfirmed.value = !isConfirmed.value

const isSubmitted = ref(false)
const setSubmitted = () => isSubmitted.value = !isSubmitted.value

const localMsg = ref(null)
const setErrMsg = (msg = null) => {
  if (msg) localMsg.value = msg
  else localMsg.value = null
  setTimeout(() => { localMsg.value = null }, 5000)
}

const { isLoading, errMsg, submitMessage } = useAPI()
const handleSubmit = async () => {
  if (!form.type) return setErrMsg('Pilih jenis aspirasi terlebih dahulu!')
  else setErrMsg()

  if (!isValidForm.value) return
  if (!isConfirmed.value) return setConfirmed()

  const result = await submitMessage(form)
  if (result) {
    resetForm()
    setSubmitted()
  }

  setConfirmed()
}

const typeOptions = [
  { value: 'innovation', label: 'Inovasi', desc: 'Identitas Anda akan disertakan untuk keperluan apresiasi dan tindak lanjut.', icon: IconIdea },
  { value: 'criticism', label: 'Kritik dan Saran', desc: 'Aspirasi dikirimkan secara anonim tanpa menyertakan identitas pengirim.', icon: IconCriticism }
]

const feedbackText = computed(() => {
  if (isSubmitted.value) {
    return {
      title: 'ASPIRASI ANDA TELAH TERKIRIM!',
      desc: 'Terima kasih atas partisipasi Anda. Setiap ide inovasi, kritik, maupun saran yang Anda berikan sangat berarti bagi bahan evaluasi dan pengembangan ke depannya. Masukan Anda telah dicatat dalam sistem dan akan ditindaklanjuti sesuai dengan prosedur yang berlaku.'
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
        <template v-if="!isSubmitted && !isConfirmed">
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
              label="Aspirasi"
              placeholder="Masukkan aspirasi anda"
              :max-length="2500"
              :disabled="isLoading"
              show-label
              required
            />
            <div class="wrapper">
              <BaseMessage
                v-if="errMsg || localMsg"
                :value="errMsg || localMsg"
                :variant="localMsg ? 'warning' : 'danger'"
              />
              <BaseButtonDefault
                width="fit-content"
                variant="primary"
                type="submit"
                label="Submit"
                icon-order="right"
                :icon="IconSend"
                :disabled="!isValidForm"
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
                  variant="primary"
                  label="Kirim Lagi"
                  @click="setSubmitted"
                />
              </template>
            </div>
          </div>
        </template>
      </div>
    </BaseContainer>
    <NuxtLink v-if="isAdmin" to="/admin" class="admin-nav">
      <BaseButtonDefault label="Masuk sebagai Admin" />
    </NuxtLink>
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
  max-width: 300px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: var(--size-s);
}

.home-page .content-wrapper .feedback.is-confirmed .actions :deep(button) {
  flex: 1;
}

.home-page .admin-nav {
  position: absolute;
  bottom: 0; right: 0;
  z-index: 0;

  text-decoration: none;
}

@media (max-height: 750px) {
  .home-page .admin-nav {
    display: none;
  }
}
</style>
