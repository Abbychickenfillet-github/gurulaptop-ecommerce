export const getGroupImage = (imagePath) => {
  if (!imagePath || imagePath.trim() === '') {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/groups/group-default.png`
  }

  // 如果已經是完整的 URL，直接返回
  if (imagePath.startsWith('http')) {
    return imagePath
  }

  // 確保路徑正確
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${imagePath}`
}
