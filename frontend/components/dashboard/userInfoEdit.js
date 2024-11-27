import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { useAuth, logout, setAuth } from '@/hooks/use-auth'
import axios from 'axios'
import { taiwanData } from '@/data/address/data.js'
import styles from '@/styles/dashboard.module.scss'

export default function UserProfile() {
  const { auth, setAuth, logout } = useAuth()
  const user_id = auth?.userData?.user_id
 
  const [editableUser, setEditableUser] = useState({
    name: '',
    gender: '',
    password: '',
    birthdate: '',
    phone: '',
    country: '',
    city: '',
    district: '',
    road_name: '',
    detailed_address: '',
    user_id: 0,
    image_path: '',
    remarks: '',
    valid: 1,
  })

  const [profilePic, setProfilePic] = useState(
    editableUser.image_path || 
  (editableUser.gender === 'male' 
    ? 'signup_login/undraw_profile_2.svg'
    : editableUser.gender === 'female'
    ? 'signup_login/undraw_profile_1.svg'
    : '/Vector.svg')
  )
  const [uploadStatus, setUploadStatus] = useState('')
  // 沒有寫就是false
  const [selectedImg, setSelectedImg] = useState(null)

  //裡面要放什麼
  const [districts, setDistricts] = useState([])
  const [roads, setRoads] = useState([])
  // 欄位是否要開放
  const [isDistrictDisabled, setIsDistrictDisabled] = useState(true)
  const [isRoadDisabled, setIsRoadDisabled] = useState(true)

  const groupedCities = {
    北部區域: [
      { CityName: '台北市', CityEngName: 'Taipei City' },
      { CityName: '新北市', CityEngName: 'New Taipei City' },
      { CityName: '基隆市', CityEngName: 'Keelung City' },
      { CityName: '桃園市', CityEngName: 'Taoyuan City' },
      { CityName: '新竹市', CityEngName: 'Hsinchu City' },
      { CityName: '新竹縣', CityEngName: 'Hsinchu County' },
      { CityName: '苗栗縣', CityEngName: 'Miaoli County' },
    ],
    中部區域: [
      { CityName: '臺中市', CityEngName: 'Taichung City' },
      { CityName: '彰化縣', CityEngName: 'Changhua County' },
      { CityName: '南投縣', CityEngName: 'Nantou County' },
      { CityName: '雲林縣', CityEngName: 'Yunlin County' },
    ],
    南部區域: [
      { CityName: '高雄市', CityEngName: 'Kaohsiung City' },
      { CityName: '臺南市', CityEngName: 'Tainan City' },
      { CityName: '嘉義市', CityEngName: 'Chiayi City' },
      { CityName: '嘉義縣', CityEngName: 'Chiayi County' },
      { CityName: '屏東縣', CityEngName: 'Pingtung County' },
    ],
    東部區域: [
      { CityName: '宜蘭縣', CityEngName: 'Yilan County' },
      { CityName: '花蓮縣', CityEngName: 'Hualien County' },
      { CityName: '台東縣', CityEngName: 'Taitung County' },
    ],
    離島區域: [
      { CityName: '金門縣', CityEngName: 'Kinmen County' },
      { CityName: '連江縣', CityEngName: 'Lienchiang County' },
      { CityName: '澎湖縣', CityEngName: 'Penghu County' },
    ],
  }

  const handleCountryChange = (e) => {
    const { name, value } = e.target
    setEditableUser((prev) => ({
      ...prev,
      [name]: value,
      city: '',
      district: '',
      road_name: '',
    }))

    if (value === '台灣') {
      setIsDistrictDisabled(false)
    } else {
      setIsDistrictDisabled(true)
      setIsRoadDisabled(true)
      setDistricts([])
      setRoads([])
    }
  }

  const handleCityChange = (e) => {
    const { name, value } = e.target
    setEditableUser((prev) => ({
      ...prev,
      [name]: value,
      district: '',
      road_name: '',
    }))
    console.log(value)
    const selectedCity = taiwanData.find((city) => city.CityName === value)
    console.log(selectedCity)
    if (selectedCity) {
      setDistricts(selectedCity.AreaList)
      setIsDistrictDisabled(false)
    } else {
      setDistricts([])
      setIsDistrictDisabled(true)
    }
    setRoads([])
    setIsRoadDisabled(true)
  }

  const handleDistrictChange = (e) => {
    const { name, value } = e.target
    setEditableUser((prev) => ({
      ...prev,
      [name]: value,
      road_name: '',
    }))

    const selectedCity = taiwanData.find(
      (city) => city.CityName === editableUser.city
    )
    if (selectedCity) {
      const selectedArea = selectedCity.AreaList.find(
        (area) => area.AreaName === value
      )
      if (selectedArea && selectedArea.RoadList) {
        setRoads(selectedArea.RoadList)
        setIsRoadDisabled(false)
      } else {
        setRoads([])
        setIsRoadDisabled(true)
      }
    }
  }

  const handleRoadChange = (e) => {
    const { name, value } = e.target
    setEditableUser((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
// userInfoEdit.js
useEffect(() => {
  setProfilePic(
    editableUser.image_path || 
    (editableUser.gender === 'male' 
      ? 'signup_login/undraw_profile_2.svg'
      : editableUser.gender === 'female'
      ? 'signup_login/undraw_profile_1.svg'
      : '/Vector.svg')
  )
}, [editableUser.gender, editableUser.image_path]) // 加入相依性

  useEffect(() => {
    const user_id = auth?.userData?.user_id
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3005/api/dashboard/${user_id}`
        )

        if (response.data.status === 'success') {
          // userData原本是鉤子拿的 在axios之後覆蓋掉了，變成userData是從資料庫拿的
          const userData = response.data.data.user
          setEditableUser({
            name: userData.name || '',
            gender: userData.gender || '',
            // password: userData.password || ' ',
            birthdate: userData.birthdate || '',
            phone: userData.phone || '',
            country: userData.country || '',
            city: userData.city || '',
            district: userData.district || '',
            road_name: userData.road_name || '',
            detailed_address: userData.detailed_address || '',
            image_path: userData.image_path || '',
            remarks: userData.remarks || '',
            valid: userData.valid ?? 1,
            email: userData.email || '',
          })

          // 如果國家是台灣，啟用地址選擇
          if (userData.country === '台灣') {
            setIsDistrictDisabled(false)

            // 如果有城市數據，設置區域列表
            const selectedCity = taiwanData.find(
              (city) => city.CityName === userData.city
            )
            if (selectedCity) {
              setDistricts(selectedCity.AreaList)

              // 如果有區域數據，設置路名列表
              const selectedArea = selectedCity.AreaList.find(
                (area) => area.AreaName === userData.district
              )
              if (selectedArea && selectedArea.RoadList) {
                setRoads(selectedArea.RoadList)
                setIsRoadDisabled(false)
              }
            }
          }

          if (userData.image_path) {
            setProfilePic(userData.image_path)
          }
        }
      } catch (error) {
        console.error('無法獲取資料:', error)
        Swal.fire('錯誤', '獲取用戶資料失敗', 'error')
      }
    }
    if (auth.userData?.user_id) {
      fetchData()
    } else {
      console.error('user_id 不存在')
    }
  }, [user_id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log('輸入值型別:', typeof value) // 檢查型別
    console.log('輸入值:', value) // 檢查值
    setEditableUser((prev) => ({
      ...prev,
      [name]: value,
    }))

      // 當性別欄位改變時，且使用者沒有上傳過圖片時才更新預設頭貼
      // 變更下拉式選單沒有改變預設圖片可能是因為原本就有存圖了
      if (name === 'gender' && !editableUser.image_path) {
        let defaultProfilePic;
        switch (value) {
          case 'female':
            defaultProfilePic = '/signup_login/undraw_profile_1.svg';
            break;
          case 'male':
            defaultProfilePic = '/signup_login/undraw_profile_2.svg';
            break;
          default:
            defaultProfilePic = '/Vector.svg';
        }
        setProfilePic(defaultProfilePic);
        setSelectedImg(defaultProfilePic);      
    };
     // 當性別欄位改變時，同時更新 auth 中的 userData
  if (name === 'gender') {
    setAuth((prev) => ({
      ...prev,
      userData: {
        ...prev.userData,
        gender: value
      }
    }))
  }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    // 類似陣列特性的物件
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('錯誤', '檔案不能超過5MB', 'error')
        return
      }

      if (!file.type.startsWith('image/')) {
        // 這是檢查 MIME type，所有圖片文件的 MIME type 都是以 "image/" 開頭的
        Swal.fire('錯誤', '請上傳圖片檔案', 'error')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImg(reader.result)
        setProfilePic(reader.result)
        // 將 base64 圖片數據存儲到 editableUser 的 image_path 中
        setEditableUser((prev) => ({
          ...prev,
          image_path: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }
  // 更新使用者資料
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (!editableUser.name) {
        Swal.fire('錯誤', '請填寫名稱', 'error')
        return
      }
      const dataToSubmit = {
        ...editableUser,
        // email: auth?.userData?.email || editableUser.email,
        // 確保有 email, email已經改成純顯示了所以之前的editableUser裡面的email應該要刪掉
      }
      delete dataToSubmit.password // 移除 password 欄位
      delete dataToSubmit.currentPassword // 移除 currentPassword 欄位
      delete dataToSubmit.newPassword // 移除 newPassword 欄位

      const response = await axios.put(
        `http://localhost:3005/api/dashboard/${user_id}`,
        // editableUser
        dataToSubmit
      )

      if (response.data.status === 'success') {
        Swal.fire('成功', '用戶資料更新成功', 'success')
        setAuth((prev) => ({
          ...prev,
          userData: { 
            ...prev.userData,
            ...dataToSubmit,
            user_id 
          }
        }))
      
      // 替換以上這段
  
        // 改變的結果是輸入的狀態的物件
      }
    } catch (error) {
      console.error('更新失敗:', error)
      Swal.fire(
        '錯誤',
        error.response?.data?.message || '更新失敗，請稍後再試',
        'error'
      )
    }
  }
// 在 userInfoEdit.js 中

  const handleDeactivate = async () => {
    // const {logout} = useAuth()
    try {
      const isConfirmed = await Swal.fire({
        title: '確定要停用帳號嗎？',
        text: '停用後請聯繫客服以重新啟用帳號',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#805AF5',
        cancelButtonColor: '#d33',
        confirmButtonText: '確定停用',
        cancelButtonText: '取消',
      })

      if (!isConfirmed.isConfirmed) {
        return
      }
      //s停用button跟更新button用的是同一個路由所以停用
      const response = await axios.put(
        `http://localhost:3005/api/dashboard/${user_id}`,
        {
          ...editableUser,
          valid: 0,
        }
      )

      if (response.data.status === 'success') {
        Swal.fire({
          title: '帳號已停用',
          icon: 'success',
          confirmButtonColor: '#805AF5',
        })
        // 可選：重新導向到登出頁面或首頁
        try {
          await logout()
          window.location.href = '/'
        } catch (logoutError) {
          console.error('登出錯誤:', logoutError)
          window.location.href = '/'
        }
      }
    } catch (error) {
      console.error('停用失敗:', error)
      Swal.fire({
        title: '停用失敗',
        text: error.response?.data?.message || '請稍後再試',
        icon: 'error',
        confirmButtonColor: '#805AF5',
      })
    }
  }

  const handleProfilePicSubmit = async (e) => {
    e.preventDefault()

    if (!selectedImg) {
      Swal.fire('提示', '請先選擇要上傳的圖片', 'info')
      return
    }

    try {
      const response = await axios.put(
        `http://localhost:3005/api/dashboard/${user_id}`,
        {
          ...editableUser,
          image_path: selectedImg,
        }
      )

      if (response.data.status === 'success') {
        setUploadStatus('頭像更新成功！') //有文字算true,沒有算none?
        //除非想防風報攻擊才需要寫得很認真@@
        setAuth((prev) => ({
          ...prev,
          userData: {
            ...prev.userData,
            image_path: selectedImg
          }
        }));
        const headerResponse = await axios.post('http://localhost:3005/api/header', {
          user_id: user_id
        });
        Swal.fire('成功', '頭像更新成功', 'success')
      }
    } catch (error) {
      console.error('上傳失敗:', error)
      Swal.fire(
        '錯誤',
        error.response?.data?.message || '上傳失敗，請稍後再試',
        'error'
      )
    }
  }

  return (
    <>
      <div className="container">
        <div className="row d-flex justify-content-center">
          <div className="">
            <div className="card">
              <div
                className="card-header d-flex align-items-center"
                style={{ backgroundColor: '#805AF5', color: 'white' }}
              >
                <div
                  className="bg-white"
                  style={{
                    width: '12px',
                    height: '12px',
                    transform: 'rotate(45deg)',
                    marginRight: '8px',
                  }}
                ></div>
                <h5 className="mb-0">檔案管理</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Form Section */}
                  <div className="col-md-8">
                    <form onSubmit={handleSubmit}>
                      {/* 基本資料 */}
                      <div className="mb-3 row">
                        <label
                          htmlFor="name"
                          className="col-sm-3 col-form-label"
                        >
                          使用者名稱
                        </label>
                        <div className="col-sm-9">
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={editableUser.name}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="gender"
                          className="col-sm-3 col-form-label"
                        >
                          性別
                        </label>
                        <div className="col-sm-9">
                          <select
                            className="form-control"
                            id="gender"
                            name="gender"
                            value={editableUser.gender}
                            onChange={handleInputChange}
                          >
                            <option value="">請選擇</option>
                            <option value="male">男</option>
                            <option value="female">女</option>
                            <option value="undisclosed">不公開</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="birthdate"
                          className="col-sm-3 col-form-label"
                        >
                          生日
                        </label>
                        <div className="col-sm-9">
                          <input
                            type="date"
                            className="form-control"
                            id="birthdate"
                            name="birthdate"
                            value={editableUser.birthdate}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label
                          htmlFor="phone"
                          className="col-sm-3 col-form-label"
                        >
                          手機號碼
                        </label>
                        <div className="col-sm-9">
                          <input
                            type="tel"
                            className="form-control"
                            id="phone"
                            name="phone"
                            value={editableUser.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      {/* 地址選擇 */}
                      <div className="address-section">
                        <div className="mb-3 row">
                          <label
                            htmlFor="country"
                            className="col-sm-3 col-form-label"
                          >
                            國家
                          </label>
                          <div className="col-sm-9">
                            <select
                              id="country"
                              className="form-select"
                              name="country"
                              value={editableUser.country}
                              onChange={handleCountryChange}
                            >
                              <option value="">請選擇國家</option>
                              <option value="台灣">台灣</option>
                              <option value="美國">美國</option>
                              <option value="加拿大">加拿大</option>
                              <option value="日本">日本</option>
                              <option value="韓國">韓國</option>
                            </select>
                          </div>
                        </div>

                        <div className="mb-3 row">
                          <label
                            htmlFor="city"
                            className="col-sm-3 col-form-label"
                          >
                            縣市
                          </label>
                          <div className="col-sm-9">
                            <select
                              id="city"
                              name="city"
                              className="form-select"
                              disabled={editableUser.country !== '台灣'}
                              value={editableUser.city}
                              onChange={handleCityChange}
                            >
                              <option value="">請選擇縣市</option>
                              {Object.entries(groupedCities).map(
                                ([region, cities]) => (
                                  <optgroup key={region} label={region}>
                                    {cities.map((city) => (
                                      <option
                                        key={city.CityName}
                                        value={city.CityName}
                                      >
                                        {city.CityName} ({city.CityEngName})
                                      </option>
                                    ))}
                                  </optgroup>
                                )
                              )}
                            </select>
                          </div>
                        </div>

                        <div className="mb-3 row">
                          <label
                            htmlFor="district"
                            className="col-sm-3 col-form-label"
                          >
                            鄉鎮市區
                          </label>
                          <div className="col-sm-9">
                            <select
                              id="district"
                              name="district"
                              className="form-select"
                              disabled={
                                isDistrictDisabled || !editableUser.city
                              }
                              value={editableUser.district}
                              onChange={handleDistrictChange}
                            >
                              <option value="">請選擇鄉鎮市區</option>
                              {districts.map((area) => (
                                <option
                                  key={area.AreaName}
                                  value={area.AreaName}
                                >
                                  {area.AreaName} ({area.ZipCode})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mb-3 row">
                          <label
                            htmlFor="road_name"
                            className="col-sm-3 col-form-label"
                          >
                            路名
                          </label>
                          <div className="col-sm-9">
                            <select
                              id="roadList"
                              name="road_name"
                              className="form-select"
                              disabled={
                                isRoadDisabled || !editableUser.district
                              }
                              value={editableUser.road_name}
                              onChange={handleRoadChange}
                            >
                              <option value="">請選擇居住街道</option>
                              {roads.map((road) => (
                                <option
                                  key={road.RoadName}
                                  value={road.RoadName}
                                >
                                  {road.RoadName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mb-3 row">
                          <label
                            htmlFor="detailed_address"
                            className="col-sm-3 col-form-label"
                          >
                            詳細地址
                          </label>
                          <div className="col-sm-9">
                            <input
                              type="text"
                              id="detailed_address"
                              name="detailed_address"
                              className="form-control"
                              placeholder="巷弄門牌"
                              value={editableUser.detailed_address}
                              onChange={handleInputChange}
                            />
                            <div className="form-text">
                              請輸入詳細地址（例如：1號、2樓、A棟）
                            </div>
                          </div>
                        </div>

                        <div className="mb-3 row">
                          <label
                            htmlFor="remarks"
                            className="col-sm-3 col-form-label"
                          >
                            備註
                          </label>
                          <div className="col-sm-9">
                            <textarea
                              id="remarks"
                              name="remarks"
                              className="form-control"
                              rows={3}
                              placeholder="輸入備註"
                              value={editableUser.remarks}
                              onChange={handleInputChange}
                            />
                            <div className="form-text">
                              地址假如都不在以上選單的話，請填寫於備註
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 電子郵件 */}
                      <div className="mb-3 row">
                        <label
                          htmlFor="email"
                          className="col-sm-3 col-form-label"
                        >
                          電子郵件
                        </label>
                        <div className="col-sm-9">{auth?.userData?.email}</div>
                      </div>

                      <div className="d-flex justify-content-between">
                        <button
                          type="submit"
                          className="btn btn-primary text-light"
                          onChange={handleSubmit}
                        >
                          更新
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary text-light"
                          onClick={handleDeactivate}
                        >
                          停用
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Profile Picture Section */}
                  <div className="col-md-4">
                    <form onSubmit={handleProfilePicSubmit}>
                      <div className="text-center">
                        <img
                          src={profilePic}
                          alt="Profile"
                          className="rounded-circle img-fluid mb-3"
                          style={{ width: '220px', height: '220px', 
                            // margin:'0 auto',
                            //  position:'relative', 
                            }}
                        />
                        <div className="mb-3">
                          <label
                            htmlFor="profile-pic-upload"
                            className={`btn btn-outline-primary ${styles['profile-button']}`}
                          >
                            上傳大頭照
                          </label>
                          <input
                            id="profile-pic-upload"
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={handleImageChange}
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary text-light"
                        >
                          更新
                        </button>
                        {/*  */}
                        {uploadStatus && (
                          <div className="alert alert-success mt-3">
                            {uploadStatus}
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
