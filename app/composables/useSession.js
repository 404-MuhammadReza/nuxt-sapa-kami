import { useCustomFetch } from '~/composables/useCustomFetch'

export const useSession = () => {
  const session = useState('session', () => null)

  const getSession = async () => {
    const user = await useCustomFetch('/api/session', { method: 'GET' })

    session.value = user
    return user
  }

  const isDefault = ref(false)
  const setDefault = (value) => { isDefault.value = value }

  const isLoading = ref(false)
  const setLoading = (value) => { isLoading.value = value }

  const errMsg = ref(null)
  const setErrMsg = (value) => {
    errMsg.value = value
    setTimeout(() => { errMsg.value = null }, 5000)
  }

  const login = async(data) => {
    setLoading(true)
    const payload = formatPayload(data)

    try {
      await useCustomFetch('/api/auth/login', {
        method: 'POST',
        body: payload,
        _rawErr: true
      })

      await getSession()
      await navigateTo('/')
    } catch (error) {
      if (error.status === 409) setDefault(true)
      else if (error.status === 401) setErrMsg('NIK atau Password salah. Silakan coba lagi.')
      else setErrMsg('Gagal memproses login. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const response = await useCustomFetch('/api/session/logout', {
      method: 'POST',
      _rawRes: true,
    })

    if (response?.success) {
      session.value = null
      navigateTo('/auth')
    }
  }

  return {
    session, isLoading, errMsg, isDefault,
    getSession, login, logout,
  }
}

const formatPayload = (data) => {
  if (!data) return null

  let payload = {
    employee_id: data.employee_id,
    password: data.password,
  }

  if (data.new_password) payload.new_password = data.new_password
  return payload
}
