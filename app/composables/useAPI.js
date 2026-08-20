import { useCustomFetch } from '~/composables/useCustomFetch'

export const useAPI = () => {
  const isLoading = ref(false)
  const setLoading = (value) => {
    isLoading.value = value
  }

  const errMsg = ref(null)
  const setErrMsg = (value) => {
    errMsg.value = value
    setTimeout(() => {
      errMsg.value = null
    }, 5000)
  }

  const getUsers = async (filter) => {
    const payload = formatFilter('user', filter)
    return await useCustomFetch('/api/admin/user', {
      method: 'GET',
      params: payload,
      _rawRes: true,
      _rawErr: true,
    })
  }

  const createUser = async (data) => {
    setLoading(true)
    setErrMsg(null)

    const payload = formatBody('user', data)
    const response = await useCustomFetch('/api/admin/user', {
      method: 'POST',
      body: payload,
    })

    if (response) await refreshNuxtData('users')
    else setErrMsg('Terjadi kesalahan saat membuat user')

    setLoading(false)
    return response
  }

  const updateUser = async (data) => {
    setLoading(true)
    setErrMsg(null)
    const payload = formatBody('user', data)
    const response = await useCustomFetch(`/api/admin/user/${data.id}`, {
      method: 'PUT',
      body: payload,
    })

    if (response) await refreshNuxtData('users')
    else setErrMsg('Terjadi kesalahan saat memperbarui user')

    setLoading(false)
    return response
  }

  const deleteUser = async (id) => {
    setLoading(true)
    setErrMsg(null)

    const response = await useCustomFetch(`/api/admin/user/${id}`, {
      method: 'DELETE',
      _rawRes: true,
    })

    if (response?.success) await refreshNuxtData('users')
    else setErrMsg('Terjadi kesalahan saat menghapus user')

    setLoading(false)
    return response
  }

  const exportUsers = async (filter) => {
    const payload = formatFilter('user', filter)
    const response = await useCustomFetch('/api/admin/user/export', {
      method: 'GET',
      params: payload,
      _rawRes: true,
    })

    if (response) download(response, 'users', 'xlsx')
  }

  const resetPassword = async (id) => {
    setLoading(true)
    setErrMsg(null)

    const response = await useCustomFetch(`/api/admin/user/${id}/reset`, {
      method: 'POST',
      _rawRes: true,
    })

    if (!response?.success) setErrMsg('Terjadi kesalahan saat mereset password')

    setLoading(false)
    return response
  }

  const getAspirations = async (filter) => {
    const payload = formatFilter('aspiration', filter)
    return await useCustomFetch('/api/admin/aspiration', {
      method: 'GET',
      params: payload,
      _rawRes: true,
      _rawErr: true,
    })
  }

  const getUserAspirations = async (filter) => {
    const payload = formatFilter('aspiration', filter)
    return await useCustomFetch('/api/aspiration', {
      method: 'GET',
      params: payload,
      _rawRes: true,
      _rawErr: true,
    })
  }

  const getAspirationById = async (id) => {
    return await useCustomFetch(`/api/aspiration/${id}`, {
      method: 'GET',
      _rawRes: true,
      _rawErr: true,
    })
  }

  const submitAspiration = async (data) => {
    setLoading(true)
    setErrMsg(null)

    let body
    if (data instanceof FormData) {
      body = data
    } else {
      const formData = new FormData()
      formData.append('type', data.type || '')
      formData.append('subject', data.subject || '')
      formData.append('body', data.body || '')
      if (data.files && Array.isArray(data.files)) {
        data.files.forEach((file) => {
          formData.append('files', file)
        })
      }
      body = formData
    }

    const response = await useCustomFetch('/api/aspiration', {
      method: 'POST',
      body,
      _rawRes: true,
    })

    if (!response?.success) {
      setErrMsg('Terjadi kesalahan saat mengirim aspirasi')
    }

    setLoading(false)
    return response
  }

  const closeAspiration = async (id) => {
    setLoading(true)
    setErrMsg(null)

    const response = await useCustomFetch(`/api/aspiration/${id}/close`, {
      method: 'POST',
      _rawRes: true,
    })

    if (!response?.success) {
      setErrMsg('Terjadi kesalahan saat menutup aspirasi')
    }

    setLoading(false)
    return response
  }

  const voteAspiration = async (id, value) => {
    setLoading(true)
    setErrMsg(null)

    const response = await useCustomFetch(`/api/aspiration/${id}/vote`, {
      method: 'POST',
      body: { value },
      _rawRes: true,
    })

    if (!response?.success) {
      setErrMsg('Terjadi kesalahan saat memberikan vote')
    }

    setLoading(false)
    return response
  }

  const sendDiscussion = async (id, data) => {
    setLoading(true)
    setErrMsg(null)

    let body
    if (data instanceof FormData) {
      body = data
    } else {
      const formData = new FormData()
      formData.append('message', data.message || '')
      if (data.files && Array.isArray(data.files)) {
        data.files.forEach((file) => {
          formData.append('files', file)
        })
      }
      body = formData
    }

    const response = await useCustomFetch(`/api/aspiration/${id}/discussion`, {
      method: 'POST',
      body,
      _rawRes: true,
    })

    if (!response?.success) {
      setErrMsg('Terjadi kesalahan saat mengirim pesan')
    }

    setLoading(false)
    return response
  }

  const deleteAspiration = async (id) => {
    setLoading(true)
    setErrMsg(null)

    const response = await useCustomFetch(`/api/admin/aspiration/${id}`, {
      method: 'DELETE',
      _rawRes: true,
    })

    if (response?.success) await refreshNuxtData('aspirations')
    else setErrMsg('Terjadi kesalahan saat menghapus aspirasi')

    setLoading(false)
    return response
  }

  const exportAspirations = async (filter) => {
    const payload = formatFilter('aspiration', filter)
    const response = await useCustomFetch('/api/admin/aspiration/export', {
      method: 'GET',
      params: payload,
      _rawRes: true,
    })

    if (response) download(response, 'aspirations', 'xlsx')
  }

  const getDashboard = async () => {
    return await useCustomFetch('/api/admin/dashboard', {
      method: 'GET',
      _rawErr: true
    })
  }

  return {
    isLoading,
    errMsg,

    getUsers,
    createUser,
    updateUser,
    deleteUser,
    exportUsers,
    resetPassword,

    getAspirations,
    getUserAspirations,
    getAspirationById,
    submitAspiration,
    closeAspiration,
    voteAspiration,
    sendDiscussion,
    deleteAspiration,
    exportAspirations,
    getDashboard,
  }
}

// Helper function to trigger file download in browser
const download = (url, filename, extension) => {
  const dummy = window.URL.createObjectURL(url)
  const link = document.createElement('a')

  link.href = dummy
  link.setAttribute('download', `${filename}.${extension}`)

  link.click()
  window.URL.revokeObjectURL(dummy)
}

const formatBody = (entity, data) => {
  switch (entity) {
    case 'user':
      return {
        employee_id: data.employee_id,
        name: data.name,
        role: data.role,
      }

    case 'aspiration':
      return {
        type: data.type,
        subject: data.subject,
        body: data.body,
      }

    default: return null
  }
}

const formatFilter = (entity, filter) => {
  const payload = { limit: filter.limit, page: filter.page }
  switch (entity) {
    case 'user':
      if (filter.role) payload.role = filter.role
      if (filter.query) payload.query = filter.query
      break

    case 'aspiration':
      if (filter.status) payload.status = filter.status
      if (filter.type) payload.type = filter.type
      if (filter.query) payload.query = filter.query
      if (filter.start_date) payload.start_date = filter.start_date
      if (filter.end_date) payload.end_date = filter.end_date
      break

    default: return null
  }

  return payload
}
