<script setup>
import IconSend from '~/assets/icons/actions/send.svg?component'
import IconIdea from '~/assets/icons/menu/idea-fill.svg?component'
import IconCriticism from '~/assets/icons/menu/criticism-fill.svg?component'

const form = reactive({ type: 'innovation', subject: '', body: '' })
const resetForm = () => { form.subject = ''; form.body = '' }
const isValidForm = computed(() => form.subject && form.body)

const isSubmitted = ref(false)
const setSubmitted = () => isSubmitted.value = !isSubmitted.value

const { isLoading, errMsg, submitMessage } = useAPI()
const handleSubmit = async () => {
  if (!isValidForm.value) return

  const result = await submitMessage(form)
  if (result) {
    resetForm()
    setSubmitted()
  }
}

const typeOptions = [
  { value: 'innovation', label: 'Inovasi', desc: 'Identitas Anda akan disertakan untuk keperluan apresiasi dan tindak lanjut.', icon: IconIdea },
  { value: 'criticism', label: 'Kritik dan Saran', desc: 'Pesan dikirimkan secara anonim tanpa menyertakan identitas pengirim.', icon: IconCriticism }
]
</script>

<template>
  <div class="home-page">
    <BaseContainer max-width="1000px">
      <div class="content-wrapper">
        <template v-if="!isSubmitted">
          <FeaturesUserCard />
          <form @submit.prevent="handleSubmit">
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
              :max-length="500"
              :disabled="isLoading"
              show-label
              required
            />
            <div class="wrapper">
              <BaseMessage
                v-if="errMsg"
                :value="errMsg"
                variant="danger"
              />
              <BaseButtonDefault
                width="fit-content"
                variant="primary"
                type="submit"
                label="Kirim"
                icon-order="right"
                loading-text="Mengirim..."
                :icon="IconSend"
                :loading="isLoading"
                :disabled="!isValidForm"
              />
            </div>
          </form>
        </template>
        <template v-else>
          <div class="feedback">
            <div class="text">
              <h3>ASPIRASI ANDA TELAH TERKIRIM!</h3>
              <span>
                Terima kasih atas partisipasi Anda. Setiap ide inovasi, kritik, maupun saran yang Anda berikan sangat
                berarti bagi bahan evaluasi dan pengembangan ke depannya. Masukan Anda telah dicatat dalam sistem dan
                akan ditindaklanjuti sesuai dengan prosedur yang berlaku.
              </span>
            </div>
            <BaseButtonDefault
              variant="primary"
              label="Kirim Lagi"
              @click="setSubmitted"
            />
          </div>
        </template>
      </div>
    </BaseContainer>
    <NuxtLink to="/admin" class="admin-nav">
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

.home-page .content-wrapper .feedback .text h3 {
  font-size: var(--size-xl);
  font-weight: var(--font-extrabold);

  color: var(--grey-800);
}

.home-page .content-wrapper .feedback .text span {
  font-size: var(--size-s);
  font-weight: var(--font-medium);

  line-height: 1.5;
  text-align: center;

  color: var(--grey-500);
}

.home-page .admin-nav {
  position: absolute;
  bottom: 0; right: 0;
  z-index: 1;

  text-decoration: none;
}

/* .home-page .admin-nav :deep(button) {
  background-color: var(--white);
  border: 1px solid var(--grey-200);
}

.home-page .admin-nav :deep(button:hover) {
  background-color: var(--grey-50);
} */
</style>
