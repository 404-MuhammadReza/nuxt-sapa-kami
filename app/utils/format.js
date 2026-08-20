export const formatId = (label) => {
  if (!label) return ''
  return String(label).toLowerCase().replace(/\s+/g, '-')
}

export const formatDate = (dateString) => {
  if (!dateString) return '-'
  const dayjs = useDayjs()
  return dayjs(dateString).format('DD MMMM YYYY')
}


