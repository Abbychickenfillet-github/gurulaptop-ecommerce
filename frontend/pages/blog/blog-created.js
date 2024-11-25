import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiamond } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import { Upload } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import Header from '@/components/layout/default-layout/header'
import MyFooter from '@/components/layout/default-layout/my-footer'
import BlogDetailMainArea from '@/components/blog/bloghomepage/articlehomepage-mainarea'
import NextBreadCrumb from '@/components/common/next-breadcrumb'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)
import Head from 'next/head'

export default function Blogcreated(props) {
  const router = useRouter() // 加入 router

  // -------------------使用者-------------------
  const { auth } = useAuth()
  const { isAuth, userData } = auth // 一起解構
  const user_id = userData.user_id
  console.log(user_id)

  const brands = [
    ['ROG', 'DELL', 'Acer', 'Raser'],
    ['GIGABYTE', 'MSI', 'HP', 'ASUS'],
  ]
  // 建立一個可重用的時間函數
  function getTimestamp() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  // 狀態定義

  const [blog_type, setType] = useState('')
  const [blog_title, setTitle] = useState('')
  const [blog_content, setContent] = useState('')
  const [blog_brand, setBrand] = useState('')
  const [blog_brand_model, setBrandModel] = useState('')
  const [blog_keyword, setKeyword] = useState('')
  const [blog_valid_value, setValidvalue] = useState('1')
  const [blog_created_date, setDate] = useState(getTimestamp())
  const [blog_image, setImage] = useState(null)

  // 處理表單提交，把原本的預設狀態弄掉
  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('user_id', user_id)
    formData.append('blog_type', blog_type)
    formData.append('blog_title', blog_title)
    formData.append('blog_content', blog_content)
    formData.append('blog_brand', blog_brand)
    formData.append('blog_brand_model', blog_brand_model)
    formData.append('blog_keyword', blog_keyword)
    formData.append('blog_valid_value', '1')
    formData.append('blog_created_date', getTimestamp())
    if (blog_image) {
      formData.append('blog_image', blog_image)
    }

    try {
      const response = await fetch(
        'http://localhost:3005/api/blog/blog-created',
        {
          method: 'POST',
          body: formData,
        }
      )
      console.log('成功連結')

      const result = await response.json()

      if (response.ok) {
        MySwal.fire({
          icon: 'success',
          title: '部落格新增成功',
          showConfirmButton: false,
          timer: 1500,
        })
        if (result.blog_id) {
          // toast.success('部落格新增成功')
          router.push(`/blog`)
        }
      } else {
        MySwal.fire({
          icon: 'error',
          title: '部落格新增失敗',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (error) {
      console.error('錯誤:', error)

      MySwal.fire({
        icon: 'error',
        title: '部落格新增失敗',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  return (
    <>
      <Head>
        <title>新增部落格</title>
      </Head>
      <Header />
      {/* <ToastContainer /> */}
      <BlogDetailMainArea />
      <div className="container mt-5">
        <NextBreadCrumb
          bgClass="bg-transparent"
          isChevron={true}
          isHomeIcon={true}
        />
      </div>
      <div className="container-lg container-fluid d-flex h-auto flex-column gap-5 mt-5 col-lg-5 col-md-8 col-12">
        {/* 圖片上傳區塊 */}
        <div className="">
          <div className="BlogEditSmallTitle text-nowrap">
            <p>
              <FontAwesomeIcon
                icon={faDiamond}
                className="TitleDiamond"
                size="xs"
              />
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
          {blog_image ? (
            <img
              src={URL.createObjectURL(blog_image)}
              alt="預覽圖片"
              className="object-fit-cover w-100 h-100"
            />
          ) : (
            <>
              <div className="cursor-pointer">
                <Upload className="w-24 h-24" />
              </div>
            </>
          )}
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            style={{ display: 'none' }}
            id="imageInput"
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* 標題區塊 */}

          <div className="container-fluid d-flex flex-lg-row flex-column align-items-start justify-content-start">
            <div className="BlogEditSmallTitle text-nowrap col-lg-2 col-12">
              <p>
                <FontAwesomeIcon icon={faDiamond} className="TitleDiamond" />
                {'\u00A0 '}
                {'\u00A0 '}
                標題
              </p>
            </div>
            <div className="col-lg-10 col-10">
              <input
                className="blog-form-control blog-form-control-lg"
                type="text"
                placeholder="標題"
                value={blog_title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* 文章內容區塊 */}

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
                value={blog_content}
                onChange={(e) => setContent(e.target.value)}
                rows="20"
                placeholder="請輸入內文"
              />
            </div>
          </div>

          {/* 品牌選擇區塊 */}
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
                        brand === blog_brand
                          ? 'BlogEditBrandSelectedActive'
                          : ''
                      }`}
                      onClick={() => setBrand(brand)}
                    >
                      <p className="m-0">{brand}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 標題區塊 */}
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
                placeholder="筆電型號"
                value={blog_brand_model}
                onChange={(e) => setBrandModel(e.target.value)}
              />
            </div>
          </div>
          {/* 類別選擇區塊 */}
          <div className="container d-flex justify-content-start align-items-start mb-5 flex-lg-row flex-column col-12">
            <div className="BlogEditSmallTitle text-nowrap col-8">
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
                    v === blog_type ? 'BlogEditBrandSelectedActive' : ''
                  }`}
                  onClick={() => setType(v)}
                >
                  <p>{v}</p>
                </div>
              ))}
            </div>
          </div>
          {/* 關鍵字區塊 */}
          <div className="container d-flex flex-lg-row flex-column align-items-start justify-content-start">
            <div className="BlogEditSmallTitle text-nowrap col-3">
              <p>
                <FontAwesomeIcon icon={faDiamond} className="TitleDiamond" />
                {'\u00A0 '}
                {'\u00A0 '}
                關鍵字
              </p>
            </div>
            <div className="col-10">
              <input
                className="blog-form-control blog-form-control-lg"
                type="text"
                placeholder="輸入一組你喜歡的關鍵字！"
                value={blog_keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          {/* 按鈕區塊 */}
          <div className="container d-flex flex-row justify-content-around align-items-center mt-5 mb-5 col-4">
            <button className="BlogEditButtonSubmit shadow" type="submit">
              送出
            </button>
          </div>
        </form>
      </div>
      <MyFooter />
    </>
  )
}

Blogcreated.getLayout = (page) => page
