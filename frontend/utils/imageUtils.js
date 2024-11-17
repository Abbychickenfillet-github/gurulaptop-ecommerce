export const getGroupImage = (imagePath) => {
  if (!imagePath || imagePath.trim() === '') {
    return 'http://localhost:3005/uploads/groups/group-default.png'
  }

  // 如果已經是完整的 URL，直接返回
  if (imagePath.startsWith('http')) {
    return imagePath
  }

  // 確保路徑正確
  return `http://localhost:3005${imagePath}`
}
