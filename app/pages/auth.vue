<script setup>
import IconError from '~/assets/icons/actions/close.svg?component'
import IconSuccess from '~/assets/icons/notification/success.svg?component'

const form = reactive({ employee_id: '', password: '', new_password: '', confirm_password: '' })
const { isLoading, errMsg, isDefault, login } = useSession()

const passwordRules = computed(() => {
  const pass = form.new_password || ''
  return [
    { label: 'Minimal 8 karakter', filled: pass.length >= 8 },
    { label: 'Mengandung huruf kapital', filled: /[A-Z]/.test(pass) },
    { label: 'Mengandung huruf kecil', filled: /[a-z]/.test(pass) },
    { label: 'Mengandung angka', filled: /\d/.test(pass) },
    { label: 'Mengandung simbol (@$!%*?&#^_-)', filled: /[@$!%*?&#^_-]/.test(pass) }
  ]
})

const isFullfilled = computed(() => {
  return passwordRules.value.every(rule => rule.filled)
})

const passwordMatch = computed(() => {
  if (!isFullfilled.value) return null
  const newPass = form.new_password
  const confPass = form.confirm_password

  if (confPass.length > 0 && newPass !== confPass) {
    return { message: 'Kata sandi baru dan konfirmasi tidak cocok', variant: 'danger' }
  }

  else if (confPass.length > 0 && newPass === confPass) {
    return { message: 'Kata sandi baru dan konfirmasi cocok', variant: 'success' }
  }

  return null
})

const isValidForm = computed(() => {
  const employeeId = String(form.employee_id || '').trim()
  const password = String(form.password || '').trim()
  const isBaseValid = employeeId && password.length >= 8

  if (!isDefault.value) return isBaseValid
  return isBaseValid && isFullfilled.value && (form.new_password === form.confirm_password)
})

const handleLogin = async () => {
  if (!isValidForm.value) return
  await login(form)
}
</script>


<template>
  <div class="auth-page">
    <BaseContainer max-width="1000px">
      <div class="content-wrapper">
        <div class="title">
          <h2>SELAMAT DATANG, TINDUSTRIAN</h2>
          <span>Silahkan masuk untuk mengirimkan aspirasi anda</span>
        </div>
        <form @submit.prevent="handleLogin()">
          <BaseInputDefault
            v-model="form.employee_id"
            variant="dark"
            type="number"
            label="Nomor Induk Karyawan"
            placeholder="Masukkan NIK anda"
            :disabled="isLoading || isDefault"
            show-label
            required
          />
          <BaseInputDefault
            v-if="!isDefault"
            v-model="form.password"
            variant="dark"
            type="password"
            label="Kata Sandi"
            placeholder="Masukkan kata sandi anda"
            :disabled="isLoading || isDefault"
            show-label
            required
          />
          <template v-else>
            <BaseInputDefault
              v-model="form.new_password"
              variant="dark"
              type="password"
              label="Kata Sandi Baru"
              placeholder="Masukkan kata sandi baru anda"
              :disabled="isLoading"
              show-label
              required
            />
            <div :class="['password-checklist', { 'fullfilled': isFullfilled }]">
              <div v-for="(rule, index) in passwordRules" :key="index" :class="['rule-item', { 'filled': rule.filled }]">
                <component :is="rule.filled ? IconSuccess : IconError" class="icon-password-check" />
                <span>{{ rule.label }}</span>
              </div>
            </div>
            <BaseInputDefault
              v-model="form.confirm_password"
              variant="dark"
              type="password"
              label="Konfirmasi Kata Sandi Baru"
              placeholder="Masukkan konfirmasi kata sandi baru anda"
              :disabled="isLoading"
              show-label
              required
            />
            <BaseMessage
              v-if="passwordMatch && !errMsg"
              :value="passwordMatch.message"
              :variant="passwordMatch.variant"
            />
          </template>
          <BaseMessage
            v-if="errMsg"
            :value="errMsg"
            variant="danger"
          />
          <BaseButtonDefault
            variant="primary"
            label="Login"
            type="submit"
            loading-text="Memproses..."
            :loading="isLoading"
            :disabled="!isValidForm"
          />
        </form>
      </div>
    </BaseContainer>
  </div>
</template>

<style scoped>
.auth-page {
  width: 100%;
  flex: 1;

  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-page .content-wrapper {
  width: 100%;
  flex: 1;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: var(--size-4xl);
}

.auth-page .content-wrapper .title {
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;

  gap: var(--size-4xs);
}

.auth-page .content-wrapper .title h2 {
  font-size: var(--size-xl);
  font-weight: var(--font-extrabold);

  text-align: center;
  color: var(--grey-800);
}

.auth-page .content-wrapper .title span {
  font-size: var(--size-s);
  font-weight: var(--font-regular);

  text-align: center;
  color: var(--grey-500);
}

.auth-page .content-wrapper form {
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: var(--size-s);
}

.auth-page .content-wrapper form .password-checklist {
  display: flex;
  flex-direction: column;

  gap: var(--size-3xs);
  padding: var(--size-xxs);
  border-radius: var(--size-xs);

  background-color: var(--grey-100);
  border: 1px dashed var(--grey-200);
  transition: border-color var(--transition-normal) var(--transition-smooth),
              background-color var(--transition-normal) var(--transition-smooth);
}

.auth-page .content-wrapper form .password-checklist.fullfilled {
  border-color: var(--green-200);
  background-color: var(--green-50);
}

.auth-page .content-wrapper form .password-checklist .rule-item {
  display: flex;
  align-items: center;
  gap: var(--size-xs);

  color: var(--grey-500);
  transition: color var(--transition-normal) var(--transition-smooth);
}

.auth-page .content-wrapper form .password-checklist .rule-item.filled {
  color: var(--green-500);
}

.auth-page .content-wrapper form .password-checklist .rule-item .icon-password-check {
  width: var(--size-xxs);
  height: var(--size-xxs);
  flex-shrink: 0;
}

.auth-page .content-wrapper form .password-checklist .rule-item span {
  font-weight: var(--font-regular);
  font-size: var(--size-xs);
}

@media (max-width: 768px) {
  .auth-page .content-wrapper {
    gap: var(--size-l);
    padding-top: var(--size-5xs);
  }
}
</style>
