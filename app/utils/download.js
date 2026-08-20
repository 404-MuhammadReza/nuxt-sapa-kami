export const downloadFile = async (url, filename) => {
  if (!url || url === '#') return

  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = blobUrl
    link.setAttribute('download', filename || 'download')
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Download failed, fallback to direct open:', error)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename || 'download')
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
