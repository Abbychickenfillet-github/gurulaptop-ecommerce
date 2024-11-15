import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSearchParams } from 'next/navigation'
import EventButton from '@/components/event/EventButton'

export default function GroupCreat() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 從 URL 獲取活動資訊
  const eventId = searchParams.get('eventId')
  const eventName = searchParams.get('eventName')
  const eventStartTime = searchParams.get('eventStartTime')
  const eventEndTime = searchParams.get('eventEndTime')

  const [formData, setFormData] = useState({
    group_name: eventName ? `${eventName}揪團` : '',
    max_members: '',
    description: '',
    image: null,
    group_time: '',
    event_id: eventId || null,
  })
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 檢查登入狀態
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3005/api/auth/check', {
          credentials: 'include',
        })

        if (!response.ok) {
          router.push('/login')
        }
      } catch (err) {
        console.error('驗證失敗:', err)
        router.push('/login')
      }
    }

    checkAuth()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('圖片大小不能超過 5MB')
        return
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }))

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // 基本驗證
      if (!formData.group_name?.trim()) {
        setError('請輸入群組名稱')
        return
      }
      if (!formData.description?.trim()) {
        setError('請輸入群組描述')
        return
      }
      if (!formData.max_members) {
        setError('請選擇人數上限')
        return
      }
      if (!formData.group_time) {
        setError('請選擇活動時間')
        return
      }

      // 驗證活動時間不能早於現在
      const selectedTime = new Date(formData.group_time)
      const now = new Date()
      if (selectedTime < now) {
        setError('活動時間不能早於現在')
        return
      }

      // 如果有活動時間限制，進行驗證
      if (eventStartTime) {
        const eventStart = new Date(eventStartTime)
        const now = new Date()

        // 檢查揪團時間是否在當前時間與活動開始時間之間
        if (selectedTime < now) {
          setError('揪團時間不能早於現在')
          return
        }

        if (selectedTime > eventStart) {
          setError('揪團時間必須在活動開始前')
          return
        }
      }

      // 驗證群組名稱長度
      if (formData.group_name.trim().length > 20) {
        setError('群組名稱不能超過20字')
        return
      }

      // 驗證描述長度
      if (formData.description.trim().length > 500) {
        setError('群組描述不能超過500字')
        return
      }

      // 創建 FormData 對象
      const submitFormData = new FormData()
      submitFormData.append('group_name', formData.group_name.trim())
      submitFormData.append('description', formData.description.trim())
      submitFormData.append('max_members', formData.max_members)
      submitFormData.append('group_time', formData.group_time)
      if (formData.event_id) {
        submitFormData.append('event_id', formData.event_id)
      }
      if (formData.image) {
        submitFormData.append('group_img', formData.image)
      }

      // 發送請求
      const response = await fetch('http://localhost:3005/api/group', {
        method: 'POST',
        credentials: 'include',
        body: submitFormData,
      })

      const result = await response.json()

      if (result.status === 'success') {
        setSuccess('群組建立成功！')

        // 儲存聊天室 ID 並確保它被正確設置
        if (result.data.chat_room_id) {
          console.log('Setting chat room ID:', result.data.chat_room_id)
          localStorage.setItem('currentChatRoomId', result.data.chat_room_id)

          // 延遲跳轉前確認數據已經儲存
          setTimeout(() => {
            const savedId = localStorage.getItem('currentChatRoomId')
            console.log('Saved chat room ID before redirect:', savedId)
            router.push('/chatroom')
          }, 1500)
        } else {
          console.error('No chat room ID received from server')
        }

        // 清空表單
        setFormData({
          group_name: '',
          max_members: '',
          description: '',
          image: null,
          group_time: '',
          event_id: null,
        })
        setImagePreview('')
      } else {
        throw new Error(result.message || '建立群組失敗')
      }
    } catch (err) {
      console.error('群組建立錯誤:', err)
      setError(err.message || '發生錯誤，請稍後再試')
    }
  }

  return (
    <div className="group-creat-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="group-creat-card p-4">
              {/* 動態標題 */}
              <h2 className="text-center mb-4">揪團表單</h2>

              {/* 活動相關資訊提示 */}
              {eventName && (
                <div className="alert alert-info mb-4">
                  此揪團關聯活動：{eventName}
                  <br />
                  活動開始時間：{new Date(eventStartTime).toLocaleString()}
                  <br />
                  <small className="text-muted">
                    提醒：揪團時間必須安排在活動開始前
                  </small>
                </div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                {/* 群組名稱 */}
                <div className="mb-3">
                  <label htmlFor="group_name" className="group-creat-label">
                    群組名稱
                    <span className="group-creat-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="group_name"
                    name="group_name"
                    value={formData.group_name}
                    onChange={handleInputChange}
                    className="form-control group-creat-input"
                    placeholder="請輸入群組名稱"
                    maxLength={20}
                    required
                  />
                </div>

                {/* 活動時間 */}
                <div className="mb-3">
                  <label htmlFor="group_time" className="group-creat-label">
                    活動時間
                    <span className="group-creat-required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="group_time"
                    name="group_time"
                    value={formData.group_time}
                    onChange={handleInputChange}
                    className="form-control group-creat-input group-time-input"
                    min={new Date().toISOString().slice(0, 16)}
                    max={
                      eventStartTime
                        ? new Date(eventStartTime).toISOString().slice(0, 16)
                        : null
                    }
                    required
                  />
                </div>

                {/* 人數上限 */}
                <div className="mb-3">
                  <label htmlFor="max_members" className="group-creat-label">
                    人數上限
                    <span className="group-creat-required">*</span>
                  </label>
                  <select
                    name="max_members"
                    value={formData.max_members}
                    onChange={handleInputChange}
                    className="group-creat-select"
                    required
                  >
                    <option value="">請選擇人數上限</option>
                    <option value="2">2人</option>
                    <option value="3">3人</option>
                    <option value="4">4人</option>
                    <option value="5">5人</option>
                    <option value="6">6人</option>
                    <option value="7">7人</option>
                    <option value="8">8人</option>
                  </select>
                </div>

                {/* 群組描述 */}
                <div className="mb-4">
                  <label htmlFor="description" className="group-creat-label">
                    群組描述
                    <span className="group-creat-required">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-control group-creat-input"
                    rows={4}
                    placeholder="請描述你的群組"
                    maxLength={500}
                    required
                  />
                </div>

                {/* 圖片上傳 */}
                <div className="mb-4">
                  <label htmlFor="group_img" className="group-creat-label">
                    群組圖片
                  </label>
                  <div className="group-creat-image-preview">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <span className="text-white-50">預覽圖片</span>
                    )}
                  </div>
                  <label className="group-creat-upload-btn d-block text-center">
                    選擇圖片
                    <input
                      type="file"
                      id="group_img"
                      className="group-creat-file-input"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                {/* 提交按鈕 */}
                <EventButton type="submit">建立群組</EventButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
