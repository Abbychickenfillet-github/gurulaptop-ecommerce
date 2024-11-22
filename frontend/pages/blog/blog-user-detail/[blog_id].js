import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import BlogDetailMainArea from '@/components/blog/bloghomepage/articlehomepage-mainarea'
import Link from 'next/link'
import { IoArrowBackCircleOutline } from 'react-icons/io5'
import { useAuth } from '@/hooks/use-auth'
import Header from '@/components/layout/default-layout/header'
import MyFooter from '@/components/layout/default-layout/my-footer'
import Head from 'next/head'

export default function BlogUserDetail() {
  const router = useRouter()
  const { blog_id } = router.query
  const [blogData, setBlogData] = useState(null)
  const { auth } = useAuth()
  const { userData, isAuth } = auth || {}
  const [isLoading, setIsLoading] = useState(true) // 新增 loading 狀態

  useEffect(() => {
    // 等待路由和認證資訊都準備好
    if (!blog_id || auth === undefined) {
      return
    }

    // 認證檢查
    if (!isAuth || !userData) {
      router.push('/blog')
      return
    }

    setIsLoading(true)
    fetch(`http://localhost:3005/api/blog/blog-user-detail/${blog_id}`)
      .then((response) => response.json())
      .then((data) => {
        const blogUserId = String(data.data.user_id)
        const currentUserId = String(userData.user_id)

        if (blogUserId !== currentUserId) {
          console.log('用戶ID不匹配')
          router.push('/blog')
          return
        }

        setBlogData(data.data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        router.push('/blog')
      })
  }, [blog_id, auth, isAuth, userData, router])

  // 顯示載入狀態
  if (isLoading || !blogData) {
    return <p>Loading...</p>
  }

  return (
    <>
      <Head>
        <title>編輯{blogData.blog_title}</title>
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

      <section className="container BlogDetailSectionContentArea mt-5">
        <div className="d-flex flex-column">
          <div>
            <p className="mb-5 mt-5 fs-5 fw-bold BlogDetailSectionContentAreaTitle text-break">
              {blogData.blog_title}
            </p>
          </div>
          {/* <div className="mb-5 mt-5 d-flex flex-column gap-5"> */}
          {/* <p className="fs-5 fw-bold">部落格分類：{blogData.blog_type}</p> */}
        </div>
        {/* <div className="mb-5 mt-5 d-flex flex-column gap-5 fw-bold"> */}
        {/* <p className="fs-5 fw-bold">品牌：{blogData.blog_brand}</p> */}
        {/* </div> */}
        {/* <div className="mb-5 mt-5 d-flex flex-column gap-5">
            <p className="fs-5 fw-bold"> */}
        {/* 購買機型：{blogData.blog_brand_model} */}
        {/* </p> */}
        {/* </div>
        </div> */}
        <div className="">
          <div className="mb-5 mt-5 d-flex flex-column gap-5 ">
            {/* <p className="fs-5 BlogDetailText fw-bold">部落格內文</p> */}
            <p className="fs-5 BlogDetailText text-break">
              {blogData.blog_content}
            </p>
          </div>
          <div className="d-flex align-items-center justify-content-center mb-5">
            <img
              className="w-50 h-50 ratio"
              src={`http://localhost:3005${blogData.blog_image}`}
              alt={blogData.blog_title}
            />
          </div>
        </div>

        <div className="">
          <div className="d-flex  mb-5 gap-xxl-5  gap-xl-5 gap-lg-4 gap-md-3 gap-sm-2 gap-xs-2 gap-1">
            <Link href={`/blog/blog-detail/${blog_id}`}>
              <button className="BlogEditButtonSubmit shadow" type="button">
                前往部落格頁面
              </button>
            </Link>
            <Link href={`/blog/blog-user-edit/${blog_id}`}>
              <button className="BlogEditButtonDelete shadow" type="button">
                前往編輯！
              </button>
            </Link>
          </div>
        </div>
      </section>
      <MyFooter />
    </>
  )
}
BlogUserDetail.getLayout = (page) => page
