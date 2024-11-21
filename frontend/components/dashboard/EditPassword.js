import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '@/hooks/use-auth'
import axios from 'axios'
import Accordion from 'react-bootstrap/Accordion'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'

export default function EditPassword(props) {
  const { auth } = useAuth()

  // 所有的 state 要在最前面定義
  const [showpassword, setShowpassword] = useState(false)
  const [showpassword2, setShowpassword2] = useState(false)
  const [showpassword3, setShowpassword3] = useState(false)
  const [showNewPasswordInput, setShowNewPasswordInput] = useState(false)

  const [editableUser, setEditableUser] = useState({
    currentPassword: '',
    newPassword1: '',
    newPassword2: '',
  })
  // user_id 的聲明要在 state 之後
  // 保持 hooks 的使用順序一致（React Hooks 規則）

  // State 的順序很重要，因為 React 是依靠 hooks 調用的順序來維護狀態的。這樣修改後，錯誤應該就會解決了。
  // 另外，建議在開發過程中使用 React DevTools 來幫助調試狀態的變化。
  const user_id = auth?.userData?.user_id
  useEffect(() => {
    // 檢查 user_id 是否存在
    if (!auth?.userData?.user_id) {
      console.error('User ID not found')
      return
    }
    console.log('Current user_id:', user_id) // 用來檢查 user_id 是否正確獲取
  }, [user_id])

  const pwdCheck = async () => {
    // 移除 e 參數，因為我們改用 onClick
    const user_id = auth?.userData?.user_id

    //  檢查必要條件:從勾子抓到登入後的這個user_id
    if (!user_id) {
      console.error('User ID 不存在')
      return // Handle this case appropriately
    }
    if (!editableUser.currentPassword) {
      Swal.fire('錯誤', '請輸入密碼', 'error')
      return
    }
    // createObjectURL(file) 這個是瀏覽器端還沒有傳送到伺服器用previewURL,setPreviewURL 暫時性的預覽長得很像一個網址可以直接用網址就可以看到那張圖。改成用useEffect主要是因為createObjectURL會占掉記憶體空間，用revokeObjectURL(objectURL)
    try {
      const responsePwdSend = await fetch(
        `http://localhost:3005/api/dashboard/pwdCheck/${user_id}/`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: editableUser.currentPassword,
          }),
        }
      )

      // 嘗試把輸入的值丟回去後做處理
      // 檢查後端回應的 status 是否為 'pwdmatch'
      // 我這邊要先接到後端回傳的回應是否回pwdmatch,似乎我的值沒有成功丟回去，我丟回去axios方法用post,現在到底要不用get or post?
      // 用fetch不能response.data.data
      const data = await responsePwdSend.json()
      console.log('回應資料:', data) // 除錯用
      // axios.才要responsePwdSend.data,用fetch只要
      if (data.status === 'pwdmatch') {
        Swal.fire('成功', '密碼與資料表相符', 'success')
        setShowNewPasswordInput(true)
        console.log('成功')
      } else {
        Swal.fire('錯誤', '密碼輸入錯誤', 'error')
      }
    } catch (error) {
      Swal.fire('錯誤', '密碼輸入錯誤或伺服器回應錯誤', 'error')
    }
  }
  const validatePassword = (password) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)

    if (password.length < minLength) {
      return '密碼長度至少需要8個字元'
    }
    if (!hasUpperCase || !hasLowerCase) {
      return '密碼需要包含大小寫字母'
    }
    if (!hasNumbers) {
      return '密碼需要包含數字'
    }
    return ''
  }

  const confirmPwdReset = async () => {
    try {
      // 檢查新密碼是否有值
      if (!editableUser.newPassword1) {
        newErrors.confirmpassword = '確認密碼為必填'
      } else if (editableUser.newPassword1 !== editableUser.newPassword2) {
        newErrors.newPassword = '密碼與確認密碼不相符'
      }
      // 驗證密碼格式
      const validationError = validatePassword(editableUser.newPassword1)
      if (validationError) {
        Swal.fire('錯誤', validationError, 'error')
        return
      }
      if (!editableUser.newPassword1) {
        Swal.fire('錯誤', '請輸入新密碼1', 'error')
        return
      }
      if (!editableUser.newPassword2) {
        Swal.fire('錯誤', '請輸入新密碼2', 'error')
        return
      }

      const user_id = auth?.userData?.user_id
      const response = await axios.put(
        `http://localhost:3005/api/dashboard/${user_id}/pwdReset`,
        {
          newPassword1: editableUser.newPassword1,
          newPassword2: editableUser.newPassword2,
        }
      )

      if (response.data.status === 'resetPwd success') {
        Swal.fire('成功', '密碼更新成功！記得記住新密碼', 'success')
        // 清空輸入框
        setEditableUser((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword1: '',
          newPassword2: '',
        }))
        setShowNewPasswordInput(false)
      }
    } catch (error) {
      console.error('密碼更新失敗:', error)
      Swal.fire(
        '錯誤',
        error.response?.data?.message || '密碼更新失敗',
        'error'
      )
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log('輸入值型別:', typeof value) // 檢查型別
    console.log('輸入值:', value) // 檢查值
    setEditableUser((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  return (
    <>
      <div className="mt-5 row">
        <div className="col-md-10 mx-auto">
          {' '}
          {/* 調整寬度並置中 */}
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header className="accord-header">
                <label htmlFor="password" className="col-form-label">
                  {auth?.userData?.name}的密碼修改
                </label>
              </Accordion.Header>
              <Accordion.Body className="p-4">
                {' '}
                {/* 增加內部間距 */}
                <div className="mb-3">
                  <div className="row justify-content-center">
                    <div className="col-md-8">
                      {/* 當前密碼輸入區 */}
                      <div className="position-relative mb-4">
                        <input
                          type={showpassword ? 'text' : 'password'}
                          className="form-control form-control-lg" // 調大輸入框
                          name="currentPassword"
                          value={editableUser.currentPassword || ''}
                          placeholder="請輸入當前密碼"
                          onChange={handleInputChange}
                        />
                        <button
                          type="button"
                          className="btn position-absolute top-50 end-0 translate-middle-y bg-transparent border-0 pe-3"
                          onClick={() => setShowpassword(!showpassword)}
                        >
                          {showpassword ? (
                            <AiOutlineEyeInvisible size={20} color="#6c757d" />
                          ) : (
                            <AiOutlineEye size={20} color="#6c757d" />
                          )}
                        </button>
                      </div>

                      <div className="form-text mb-4">
                        要先輸入密碼正確，才能輸入新的密碼
                      </div>

                      <div className="d-flex justify-content-end mb-4">
                        <button
                          type="button"
                          className="btn btn-primary px-4 py-2" // 調整按鈕大小
                          onClick={pwdCheck}
                        >
                          送出檢查
                        </button>
                      </div>

                      {/* 分隔線 */}
                      <div className="border-bottom my-4"></div>
                    </div>
                  </div>
                </div>
                {/* 新密碼輸入區 */}
                {showNewPasswordInput && (
                  <div className="row justify-content-center">
                    <div className="col-md-8">
                      {/* 密碼格式提示 */}
                      <div className="alert alert-info mb-4 shadow-sm">
                        <small>
                          <div className="fw-bold mb-2">
                            密碼必須符合以下要求：
                          </div>
                          <ul className="mb-0">
                            <li>至少 8 個字元</li>
                            <li>包含大寫和小寫字母</li>
                            <li>包含數字</li>
                          </ul>
                        </small>
                      </div>

                      {/* 第一個密碼輸入框 */}
                      <div className="position-relative mb-4">
                        <input
                          type={showpassword2 ? 'text' : 'password'}
                          className="form-control form-control-lg"
                          name="newPassword1"
                          value={editableUser.newPassword1}
                          onChange={handleInputChange}
                          placeholder="請輸入新密碼"
                        />
                        <button
                          type="button"
                          className="btn position-absolute top-50 end-0 translate-middle-y bg-transparent border-0 pe-3"
                          onClick={() => setShowpassword2(!showpassword2)}
                        >
                          {showpassword2 ? (
                            <AiOutlineEyeInvisible size={20} color="#6c757d" />
                          ) : (
                            <AiOutlineEye size={20} color="#6c757d" />
                          )}
                        </button>
                      </div>

                      {/* 第二個密碼輸入框 */}
                      <div className="position-relative mb-4">
                        <input
                          type={showpassword3 ? 'text' : 'password'}
                          className="form-control form-control-lg"
                          name="newPassword2"
                          value={editableUser.newPassword2}
                          onChange={handleInputChange}
                          placeholder="請確認新密碼"
                        />
                        <button
                          type="button"
                          className="btn position-absolute top-50 end-0 translate-middle-y bg-transparent border-0 pe-3"
                          onClick={() => setShowpassword3(!showpassword3)}
                        >
                          {showpassword3 ? (
                            <AiOutlineEyeInvisible size={20} color="#6c757d" />
                          ) : (
                            <AiOutlineEye size={20} color="#6c757d" />
                          )}
                        </button>
                      </div>

                      {/* 確認按鈕 */}
                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-secondary px-4 py-2"
                          onClick={confirmPwdReset}
                        >
                          確認修改
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </div>

      {/* 可以考慮加入一些自定義 CSS */}
      <style jsx>{`
        .form-control-lg {
          padding-right: 2.5rem;
        }

        .accord-header {
          background-color: #f8f9fa;
        }

        .form-control:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
      `}</style>
    </>
  )
}
