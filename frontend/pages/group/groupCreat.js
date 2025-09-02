import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSearchParams } from 'next/navigation'
import EventButton from '@/components/event/EventButton'
import Swal from 'sweetalert2'
import NextBreadCrumb from '@/components/common/next-breadcrumb'
import Head from 'next/head'
import Image from 'next/image'
export default function GroupCreat() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 從 URL 獲取活動資訊
  const eventId = searchParams.get('eventId')
  const eventName = searchParams.get('eventName')
  const eventStartTime = searchParams.get('eventStartTime')
  // const eventEndTime = searchParams.get('eventEndTime')

  const [formData, setFormData] = useState({
    group_name: eventName ? `${eventName}揪團` : '',
    max_members: '',
    description: '',
    image: null,
    group_time: '',
    event_id: eventId || null,
  })
  const [imagePreview, setImagePreview] = useState('')

  // 檢查登入狀態
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/check`,
          {
            credentials: 'include',
          },
        )

        /*
         * 🔧 修復說明：
         * 
         * ❌ 原本錯誤的地方：
         * - 第 32 行：'process.env.NEXT_PUBLIC_API_BASE_URL/api/auth/check'
         * - 缺少 ${} 語法來正確引用環境變數
         * 
         * ✅ 修復後的寫法：
         * - 第 32 行：`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/check`
         * - 使用 ${} 語法正確引用環境變數
         * 
         * 💡 為什麼會錯：
         * - 沒有 ${} 的話，JavaScript 會將 process.env.NEXT_PUBLIC_API_BASE_URL 當作字串字面量
         * - 最終 URL 會變成：process.env.NEXT_PUBLIC_API_BASE_URL/api/auth/check
         * - 這會導致 404 錯誤，因為沒有這樣的 URL
         */

        if (!response.ok) {
          await Swal.fire({
            icon: 'warning',
            title: '請先登入8',
            text: '即將導向登入頁面...',
            showConfirmButton: false,
            timer: 1500,
          })
          router.push('/login')
        }
      } catch (err) {
        console.error('驗證失敗:', err)
        await Swal.fire({
          icon: 'error',
          title: '驗證失敗',
          text: '請重新登入',
          showConfirmButton: false,
          timer: 1500,
        })
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        await Swal.fire({
          icon: 'warning',
          title: '檔案過大',
          text: '圖片大小不能超過 5MB',
          showConfirmButton: false,
          timer: 1500,
        })
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

    try {
      // 基本驗證
      if (!formData.group_name?.trim()) {
        await Swal.fire({
          icon: 'warning',
          title: '提示',
          text: '請輸入群組名稱',
          showConfirmButton: false,
          timer: 1500,
        })
        return
      }
      if (!formData.description?.trim()) {
        await Swal.fire({
          icon: 'warning',
          title: '提示',
          text: '請輸入群組描述',
          showConfirmButton: false,
          timer: 1500,
        })
        return
      }
      if (!formData.max_members) {
        await Swal.fire({
          icon: 'warning',
          title: '提示',
          text: '請選擇人數上限',
          showConfirmButton: false,
          timer: 1500,
        })
        return
      }
      if (!formData.group_time) {
        await Swal.fire({
          icon: 'warning',
          title: '提示',
          text: '請選擇活動時間',
          showConfirmButton: false,
          timer: 1500,
        })
        return
      }

      // 驗證活動時間不能早於現在
      const selectedTime = new Date(formData.group_time)
      const now = new Date()
      if (selectedTime < now) {
        await Swal.fire({
          icon: 'warning',
          title: '提示',
          text: '活動時間不能早於現在',
          showConfirmButton: false,
          timer: 1500,
        })
        return
      }

      // 如果有活動時間限制，進行驗證
      if (eventStartTime) {
        const eventStart = new Date(eventStartTime)
        const now = new Date()

        if (selectedTime < now) {
          await Swal.fire({
            icon: 'warning',
            title: '提示',
            text: '揪團時間不能早於現在',
            showConfirmButton: false,
            timer: 1500,
          })
          return
        }

        if (selectedTime > eventStart) {
          await Swal.fire({
            icon: 'warning',
            title: '提示',
            text: '揪團時間必須在活動開始前',
            showConfirmButton: false,
            timer: 1500,
          })
          return
        }
      }

      // 驗證群組名稱長度
      if (formData.group_name.trim().length > 50) {
        await Swal.fire({
          icon: 'warning',
          title: '提示',
          text: '群組名稱不能超過50字',
          showConfirmButton: false,
          timer: 1500,
        })
        return
      }

      // 驗證描述長度
      if (formData.description.trim().length > 500) {
        await Swal.fire({
          icon: 'warning',
          title: '提示',
          text: '群組描述不能超過500字',
          showConfirmButton: false,
          timer: 1500,
        })
        return
      }

      // 確認提交
      const confirmResult = await Swal.fire({
        icon: 'question',
        title: '確認建立',
        text: '確定要建立揪團嗎？',
        showCancelButton: true,
        confirmButtonText: '確定',
        cancelButtonText: '取消',
      })

      if (!confirmResult.isConfirmed) {
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/group`,
        {
          method: 'POST',
          credentials: 'include',
          body: submitFormData,
        },
      )

      /*
       * 🔧 修復說明：
       * 
       * ❌ 原本錯誤的地方：
       * - 第 237 行：'process.env.NEXT_PUBLIC_API_BASE_URL/api/group'
       * - 缺少 ${} 語法來正確引用環境變數
       * 
       * ✅ 修復後的寫法：
       * - 第 237 行：`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/group`
       * - 使用 ${} 語法正確引用環境變數
       * 
       * 💡 為什麼會錯：
       * - 沒有 ${} 的話，JavaScript 會將 process.env.NEXT_PUBLIC_API_BASE_URL 當作字串字面量
       * - 最終 URL 會變成：process.env.NEXT_PUBLIC_API_BASE_URL/api/group
       * - 這會導致 404 錯誤，因為沒有這樣的 URL
       */

      const result = await response.json()

      if (result.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: '建立成功！',
          text: '即將進入揪團列表...',
          showConfirmButton: false,
          timer: 1500,
        })

        // 儲存聊天室 ID 並確保它被正確設置
        if (result.data.chat_room_id) {
          console.log('Setting chat room ID:', result.data.chat_room_id)
          localStorage.setItem('currentChatRoomId', result.data.chat_room_id)

          // 延遲跳轉前確認數據已經儲存
          setTimeout(() => {
            const savedId = localStorage.getItem('currentChatRoomId')
            console.log('Saved chat room ID before redirect:', savedId)
            router.push('/group')
          }, 1500)
        } else {
          console.error('No chat room ID received from server')
          await Swal.fire({
            icon: 'error',
            title: '錯誤',
            text: '無法取得聊天室資訊',
            showConfirmButton: false,
            timer: 2000,
          })
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
      await Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: err.message || '發生錯誤，請稍後再試',
        showConfirmButton: false,
        timer: 2000,
      })
    }
  }

  return (
    <>
      <Head>
        <title>創建揪團</title>
      </Head>
      <div className="group-creat-wrapper">
        <div className="container">
          <NextBreadCrumb />
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="group-creat-card p-4">
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
                        <Image
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
    </>
  )
}
