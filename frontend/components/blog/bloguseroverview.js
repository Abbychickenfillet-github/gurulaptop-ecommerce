import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

// 改為接收props的組件
export default function BlogUserOverview({ specificUserId = null }) {
  const { auth } = useAuth()
  const { isAuth, userData } = auth
  const [blogData, setBlogData] = useState([])

  useEffect(() => {
    if (!isAuth) return

    // 使用 specificUserId（如果有提供），否則使用當前登入用戶的 ID
    const targetUserId = specificUserId || userData?.user_id

    if (targetUserId) {
      fetch(`http://localhost:3005/api/blog/blog_user_overview/${targetUserId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log('API回傳的資料:', data)
          const dataArray = Array.isArray(data) ? data : [data]
          setBlogData(dataArray)
        })
        .catch((error) => {
          console.error('錯誤:', error)
        })
    }
  }, [isAuth, userData, specificUserId])

  if (!isAuth) {
    return null
  }

  if (!blogData || blogData.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <p>尚無發文紀錄</p>
      </div>
    )
  }
  console.log(blogData)

  let hasData = false

  if (
    blogData &&
    blogData?.length > 0 &&
    blogData[0]?.message !== '找不到該文章'
  ) {
    hasData = true
  }

  return !hasData ? (
    <div className="container text-center mt-5">
      <p className="fs-4">沒有部落格，新增一下！</p>
      <Link href="/blog/blog-created">
        <button className="BlogEditButtonSubmit mt-3">立即新增部落格</button>
      </Link>
    </div>
  ) : (
    // 如果有資料，顯示部落格列表
    <div className="container d-flex flex-column gap-5">
      {blogData.map((blog) => (
        <Link
          key={blog.blog_id}
          href={`/blog/blog-user-detail/${blog.blog_id}`}
          style={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          <div className="card d-flex flex-row BlogUserOverviewCard">
            <img
              src={
                `http://localhost:3005${blog.blog_image}` ||
                'https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain'
              }
              className="card-img-top w-25 h-100 object-fit-cover BlogUserOverviewCardImg"
              alt="blog"
            />
            <div className="card-body w-75 h-100">
              <div className="BlogUserOverviewCardBodyContent m-3">
                <div className="d-flex row">
                  <p className="BlogUserOverviewCardTitle">{blog.blog_title}</p>
                  <h7 className="card-text mb-4 BlogUserOverviewCardContent">
                    {blog.blog_content}
                  </h7>
                </div>
                <div
                  style={{ width: '60%' }}
                  className="d-flex justify-content-between pe-5"
                >
                  <p className="card-text BlogUserOverviewCardType">
                    版主：{blog.user_name}&nbsp;
                  </p>
                </div>
                <div className="d-flex justify-content-between pe-5 mt-3">
                  <p>{blog.blog_type}</p>
                  <p>{blog.blog_created_date}</p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
