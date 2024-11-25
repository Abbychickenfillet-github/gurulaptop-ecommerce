import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiamond } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/use-auth'
import Header from '@/components/layout/default-layout/header'
import MyFooter from '@/components/layout/default-layout/my-footer'
import BlogDetailMainArea from '@/components/blog/bloghomepage/articlehomepage-mainarea'
import Link from 'next/link'
import { IoArrowBackCircleOutline } from 'react-icons/io5'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)
import Head from 'next/head'

export default function BlogUserEdit() {
  const router = useRouter()
  const { blog_id } = router.query
  const { auth } = useAuth()
  const { userData } = auth

  useEffect(() => {
    if (blog_id) {
      // 先檢查用戶身份
      if (!auth.isAuth) {
        console.log('用戶未登入')
        router.push('/dashboard')
        return
      }

      if (!userData) {
        console.log('無用戶數據')
        router.push('/dashboard')
        return
      }

      // 獲取文章數據並驗證
      fetch(`http://localhost:3005/api/blog/blog-edit/${blog_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((r) => r.json())
        .then((data) => {
          console.log('從後端收到的資料:', data)

          // 驗證文章作者是否為當前用戶
          const blogUserId = String(data.user_id)
          const currentUserId = String(userData.user_id)

          if (blogUserId !== currentUserId) {
            console.log('用戶ID不匹配')
            router.push('/dashboard')
            return
          }

          // 驗證通過，設置表單數據
          setFormData({
            ...data,
            originalImage: data.blog_image,
            blog_image: data.blog_image,
          })
        })
        .catch((error) => {
          console.log('錯誤:', error)
          router.push('/dashboard')
        })
    }
  }, [blog_id, userData, auth.isAuth, router])

  const [formData, setFormData] = useState({
    blog_type: '',
    blog_title: '',
    blog_content: '',
    blog_brand: '',
    blog_brand_model: '',
    blog_keyword: '',
    blog_image: null,
    originalImage: null,
    blog_valid_value: '1',
  })

  const brands = [
    ['ROG', 'DELL', 'Acer', 'Raser'],
    ['GIGABYTE', 'MSI', 'HP', 'ASUS'],
  ]

  useEffect(() => {
    if (blog_id) {
      fetch(`http://localhost:3005/api/blog/blog-edit/${blog_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((r) => r.json())
        .then((data) => {
          console.log('從後端收到的資料:', data)
          setFormData({
            ...data,
            originalImage: data.blog_image,
            blog_image: data.blog_image,
          })
        })
        .catch((error) => console.log('錯誤:', error))
    }
  }, [blog_id])

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formDataToSend = new FormData()

      formDataToSend.append('user_id', userData.user_id)
      formDataToSend.append('blog_type', formData.blog_type)
      formDataToSend.append('blog_title', formData.blog_title)
      formDataToSend.append('blog_content', formData.blog_content)
      formDataToSend.append('blog_brand', formData.blog_brand)
      formDataToSend.append('blog_brand_model', formData.blog_brand_model)
      formDataToSend.append('blog_keyword', formData.blog_keyword)

      // 處理圖片
      if (formData.blog_image instanceof File) {
        formDataToSend.append('blog_image', formData.blog_image)
      } else {
        formDataToSend.append('originalImage', formData.originalImage)
      }

      const response = await fetch(
        `http://localhost:3005/api/blog/blog-edit/${blog_id}`,
        {
          method: 'PUT',
          body: formDataToSend,
        }
      )

      if (response.ok) {
        // window.alert('編輯成功！') // 加入這行
        MySwal.fire({
          title: '編輯成功！',
          icon: 'success',
          confirmButtonText: '確定',
        })
        router.push('/blog/blog-edit-success') // 改用這個路徑
      }
    } catch (error) {
      console.error('錯誤:', error)
    }
  }

  return (
    <>
      <Head>
        <title>編輯部落格</title>
      </Head>
      <Header />
      <BlogDetailMainArea />
      <div className="container">
        <div className="mt-5 mb-5">
          <Link href="/dashboard" className="text-decoration-none fs-5">
            <p className="fs-5 fw-bold">
              <IoArrowBackCircleOutline /> 返回使用者總覽
            </p>
          </Link>
        </div>
      </div>

      <div className="container-lg container-fluid d-flex h-auto flex-column gap-5 mt-5 col-lg-5 col-md-8 col-12">
        {/* 圖片上傳區塊 */}
        <div className="">
          <div className="BlogEditSmallTitle text-nowrap">
            <p>
              <FontAwesomeIcon icon={faDiamond} className="TitleDiamond" />
              {'\u00A0 '}
              {'\u00A0 '}
              新增封面圖片
            </p>
          </div>
        </div>

        <div
          className="BlogImgUploadDiv d-flex align-items-center justify-content-center"
          onClick={() => document.getElementById('imageInput').click()}
        >
          {formData.blog_image || formData.originalImage ? (
            <img
              src={
                formData.blog_image instanceof File
                  ? URL.createObjectURL(formData.blog_image)
                  : `http://localhost:3005${
                      formData.originalImage || formData.blog_image
                    }`
              }
              alt="預覽圖片"
              className="object-fit-cover w-100 h-100"
            />
          ) : (
            <>
              <i className="fa-solid fa-arrow-up-from-bracket" />
              <div style={{ cursor: 'pointer' }}></div>
            </>
          )}
          <input
            type="file"
            onChange={(e) => handleChange('blog_image', e.target.files[0])}
            style={{ display: 'none' }}
            id="imageInput"
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="container-fluid d-flex flex-lg-row flex-column align-items-start justify-content-start">
            <div className="BlogEditSmallTitle text-nowrap col-lg-2 col-12">
              <p>
                <FontAwesomeIcon icon={faDiamond} className="TitleDiamond" />
                {'\u00A0 '}
                {'\u00A0 '}
                標題
              </p>
            </div>
            <div className="col-lg-10 col-11">
              <input
                className="blog-form-control blog-form-control-lg"
                type="text"
                placeholder="標題"
                value={formData.blog_title || ''}
                onChange={(e) => handleChange('blog_title', e.target.value)}
              />
            </div>
          </div>

          <div className="container-lg container-fluid-md  d-flex flex-lg-row flex-column  align-items-start justify-content-start mb-5 mt-5">
            <div className="BlogEditSmallTitle text-nowrap col-2">
              <p>
                <FontAwesomeIcon icon={faDiamond} className="TitleDiamond" />
                {'\u00A0 '}
                {'\u00A0 '}
                內文
              </p>
            </div>
            <div className="col-10">
              <textarea
                className="blog-form-control w-100"
                value={formData.blog_content || ''}
                onChange={(e) => handleChange('blog_content', e.target.value)}
                rows="20"
                placeholder="請輸入內文"
              />
            </div>
          </div>

          <div className="container-lg container-fluid  flex-lg-row flex-column justify-content-between align-items-start mb-5 gap-xxl-5 gap-xl-5 gap-lg-4 gap-md-3 gap-sm-2 gap-xs-2 gap-1">
            <div className="BlogSmallTitleAlign d-flex justify-content-start align-items-start">
              <div className="BlogEditSmallTitle text-nowrap">
                <p>
                  <FontAwesomeIcon icon={faDiamond} className="TitleDiamond" />
                  {'\u00A0 '}
                  {'\u00A0 '}
                  筆電品牌
                </p>
              </div>
            </div>
            <div className="container-lg container-fluid d-flex flex-row justify-content-center mb-5 mt-5 gap-xxl-5 gap-xl-5 gap-lg-4 gap-md-3 gap-sm-2 gap-xs-2 gap-1">
              {brands.map((column, columnIndex) => (
                <div
                  key={columnIndex}
                  className="d-flex flex-column gap-xxl-5  gap-xl-5 gap-lg-4 gap-md-3 gap-sm-2 gap-xs-2 gap-1"
                >
                  {column.map((brand) => (
                    <div
                      key={brand}
                      className={`BlogEditBrandSelected shadow d-flex justify-content-center align-items-center ${
                        brand === formData.blog_brand
                          ? 'BlogEditBrandSelectedActive'
                          : ''
                      }`}
                      onClick={() => handleChange('blog_brand', brand)}
                    >
                      <p className="m-0">{brand}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="container d-flex flex-lg-row flex-column align-items-start justify-content-start mt-5 mb-5">
            <div className="BlogEditSmallTitle text-nowrap col-2">
              <p>
                <FontAwesomeIcon icon={faDiamond} className="TitleDiamond" />
                {'\u00A0 '}
                {'\u00A0 '}
                筆電型號
              </p>
            </div>
            <div className="col-10">
              <input
                className="blog-form-control blog-form-control-lg"
                type="text"
                placeholder="型號"
                value={formData.blog_brand_model || ''}
                onChange={(e) =>
                  handleChange('blog_brand_model', e.target.value)
                }
              />
            </div>
          </div>

          <div className="container d-flex justify-content-start align-items-start mb-5 flex-lg-row flex-column col-12">
            <div className="BlogEditSmallTitle text-nowrap col-10">
              <p>
                <FontAwesomeIcon icon={faDiamond} className="TitleDiamond" />
                {'\u00A0 '}
                {'\u00A0 '}
                類別
              </p>
            </div>

            <div className="d-flex flex-column  gap-xxl-4 gap-xl-4 gap-lg-3 gap-md-2 gap-sm-1 gap-xs-1 gap-1 col-4 w-50 ms-5">
              {['購買心得', '開箱文', '疑難雜症', '活動心得'].map((v) => (
                <div
                  key={v}
                  className={`BlogEditBrandSelected shadow d-flex justify-content-center align-items-center ${
                    v === formData.blog_type
                      ? 'BlogEditBrandSelectedActive'
                      : ''
                  }`}
                  onClick={() => handleChange('blog_type', v)}
                >
                  <p>{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex align-items-start justify-content-start flex-md-row flex-column">
            <div className="BlogEditSmallTitle text-nowrap col-1">
              <p>
                <FontAwesomeIcon icon={faDiamond} className="TitleDiamond" />
                {'\u00A0 '}
                {'\u00A0 '}
                關鍵字
              </p>
            </div>
            <div className="col-9 col-lg-8 col-md-10">
              <input
                className="blog-form-control blog-form-control-lg"
                type="text"
                placeholder="輸入一組你喜歡的關鍵字！"
                value={formData.blog_keyword || ''}
                onChange={(e) => handleChange('blog_keyword', e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex flex-row justify-content-around align-items-center mt-5 mb-5">
            <button className="BlogEditButtonSubmit shadow" type="submit">
              送出
            </button>
            <button
              className="BlogEditButtonDelete shadow "
              type="button"
              onClick={async () => {
                // 顯示確認對話框並等待用戶響應
                const result = await MySwal.fire({
                  icon: 'warning',
                  title: '確定要刪除部落格嗎？',
                  text: '刪除後將無法復原！',
                  showCancelButton: true, // 顯示取消按鈕
                  confirmButtonText: '確定刪除',
                  cancelButtonText: '取消',
                  confirmButtonColor: '#d33', // 確認按鈕的顏色
                  cancelButtonColor: '#3085d6', // 取消按鈕的顏色
                })

                // 如果用戶點擊確認
                if (result.isConfirmed) {
                  try {
                    const res = await fetch(
                      `http://localhost:3005/api/blog/blog-delete/${blog_id}`,
                      {
                        method: 'PUT',
                      }
                    )

                    if (res.ok) {
                      // 刪除成功後顯示成功訊息
                      await MySwal.fire({
                        icon: 'success',
                        title: '刪除成功！',
                        showConfirmButton: false,
                        timer: 1500,
                      })

                      router.push('/blog/blog-delete-success')
                    }
                  } catch (error) {
                    // 發生錯誤時顯示錯誤訊息
                    console.error('刪除失敗:', error)
                    MySwal.fire({
                      icon: 'error',
                      title: '刪除失敗',
                      text: '請稍後再試',
                      showConfirmButton: true,
                    })
                  }
                }
              }}
            >
              刪除
            </button>
          </div>
        </form>
      </div>
      <MyFooter />
    </>
  )
}
BlogUserEdit.getLayout = (page) => page
