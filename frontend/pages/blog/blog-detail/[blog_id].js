import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import BlogDetailMainArea from '@/components/blog/bloghomepage/articlehomepage-mainarea'
import Link from 'next/link'
import BlogComment from '@/components/blog/blogdetail/blog-comment'
import BloghomepageCardgroup from '@/components/blog/bloghomepage/bloghomepage-cardgroup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiamond } from '@fortawesome/free-solid-svg-icons'
import Header from '@/components/layout/default-layout/header'
import MyFooter from '@/components/layout/default-layout/my-footer'
import { IoArrowBackCircleOutline } from 'react-icons/io5'

export default function BlogId() {
  const router = useRouter()
  const { blog_id } = router.query // 動態獲取 blog_id
  const [blogData, setBlogData] = useState(null)
  console.log(blogData)

  useEffect(() => {
    if (blog_id) {
      fetch(`http://localhost:3005/api/blog/blog-detail/${blog_id}`) // 這裡替換為你實際的 API 路徑
        .then((response) => response.json())
        .then((data) => {
          setBlogData(data.data) // 設定資料
          console.log('撈取資料正常')
        })
        .catch((error) => console.error('Error fetching blog data:', error))
    }
  }, [blog_id]) // 當 blog_id 改變時重新執行 useEffect

  if (!blogData) {
    return <p>Loading...</p> // 當資料還沒載入時顯示 loading
  }
  // 確認一下圖片路徑
  console.log(`確認一下圖片路徑`)
  console.log(`http://localhost:3005${blogData.blog_image}`)

  return (
    <>
      <Header />
      <BlogDetailMainArea />
      <div className="container">
        <div className="mt-5 mb-5">
          <Link href="/blog" className="text-decoration-none fs-5">
            <p className="fs-5 fw-bold">
              <IoArrowBackCircleOutline /> 返回部落格首頁搜尋！
            </p>
          </Link>
        </div>
      </div>
      {/* <div>
        <div className="mt-5">
          <div className="mb-5">
            <p className="fs-5 fw-bold">購買機型</p>
          </div>
          <div className="mb-5">
            <p className="fs-5 fw-bold">Swift 14 AI AMD</p>
          </div>
          <div className="w-100 h-25 overflow-hidden m-auto">
            <img
              className="object-fit-cover w-100 h-100"
              src="https://images.acer.com/is/image/acer/acer-laptop-swift-14-ai-amd-designed-to-unfold-your-potential:KSP-with-Specs-XL"
              alt
            />
          </div>
        </div> */}
      <section className="container BlogDetailSectionContentArea mt-5">
        <div className="d-flex flex-column">
          <div>
            <p className="fs-5 fw-bold text-break  BlogDetailSectionContentAreaTitle">
              {blogData.blog_title}
            </p>
            {/* <p className="fs-5 BlogDetailSectionContentAreaTitle">
              {blogData.blog_title}
            </p> */}
          </div>
          {/* <div className="d-flex flex-column gap-5"> */}
          {/* <p className="fs-5 fw-bold "> 部落格分類：{blogData.blog_type}</p> */}
          {/* <p className="fs-5">開箱文</p> */}
        </div>
        {/* <div className="d-flex flex-column gap-5 fw-bold "> */}
        {/* <p className="fs-5 fw-bold ">品牌：{blogData.blog_brand}</p> */}
        {/* <p>123</p> */}
        {/* </div> */}
        {/* <div className="d-flex flex-column gap-5"> */}
        {/* <p className="fs-5 fw-bold"> */}
        {/* 購買機型：{blogData.blog_brand_model} */}
        {/* </p> */}
        {/* <p>123</p> */}
        {/* </div> */}
        {/* </div> */}

        <div className="d-flex flex-column gap-5">
          {/* <p className="fs-5 BlogDetailText fw-bold">部落格內文</p> */}
          <p className="fs-5 BlogDetailText text-break">
            {blogData.blog_content}
          </p>
        </div>
        <div className="d-flex align-items-center justify-content-center">
          <img
            className="w-50 h-50 ratio mb-5"
            src={`http://localhost:3005${blogData.blog_image}`}
            alt
          />
        </div>
      </section>
      <BlogComment blog_id={blog_id} />

      <div className="container ArticleSmallTitle text-nowrap">
        <p>
          <FontAwesomeIcon icon={faDiamond} className="me-4" />
          <span>更多熱門文章</span>
        </p>
      </div>
      <BloghomepageCardgroup />
      {/* 空格在 footer 隔出空間 */}
      <div className="mb-5 "></div>
      <div className="mb-5 "></div>
      <div className="mb-5 "></div>
      {/* 空格在 footer 隔出空間 */}
      <MyFooter />
    </>
  )
}
BlogId.getLayout = (page) => page
