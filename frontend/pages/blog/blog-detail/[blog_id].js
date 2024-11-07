import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ArticleDetailMainArea from '@/components/blog/blogdetail/blogdetail-mainarea'

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

  return (
    <>
      <ArticleDetailMainArea />
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
      <section className="BlogDetailSectionContentArea">
        <div className="d-flex align-items-center justify-content-center mb-5">
          <img className="w-50 h-50 ratio" src={blogData.blog_image} alt />
        </div>
        <p className="fs-5 fw-bold BlogDetailSectionContentAreaTitle">
          {blogData.blog_title}
        </p>
        <p className="BlogDetailText">{blogData.blog_content}</p>
        <p className="BlogDetailText">要不要刪除阿</p>
      </section>
    </>
  )
}
