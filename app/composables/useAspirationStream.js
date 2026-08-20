export const useAspirationStream = () => {
  const eventSource = ref(null)
  const isConnected = ref(false)

  const connect = (aspirationId, onDiscussionReceived) => {
    disconnect()
    if (!aspirationId) return

    const streamUrl = `/stream/aspiration/${aspirationId}`
    eventSource.value = new EventSource(streamUrl, { withCredentials: true })

    eventSource.value.addEventListener('connected', () => {
      isConnected.value = true
      console.log(`[SSE] Connected to aspiration ${aspirationId} stream`)
    })

    eventSource.value.addEventListener('new_discussion', (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (onDiscussionReceived && typeof onDiscussionReceived === 'function') {
          onDiscussionReceived(payload)
        }
      } catch (err) {
        console.error('[SSE] Error parsing event data:', err)
      }
    })

    eventSource.value.onerror = (err) => {
      isConnected.value = false
      console.warn(`[SSE] Connection error/closed for aspiration ${aspirationId}`, err)
    }
  }

  const disconnect = () => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
      isConnected.value = false
      console.log('[SSE] Disconnected and cleaned up stream')
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    connect,
    disconnect,
  }
}

