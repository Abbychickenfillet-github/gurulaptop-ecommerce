import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

export default function BlogUserOverview() {
  // 1. 所有的 hooks
  const router = useRouter()
  const { auth } = useAuth()
  const { isAuth } = auth

  const [blogData, setBlogData] = useState([])

  // 2. 登入驗證的 Effect
  // useEffect(() => {
  //   if (!isAuth) {
  //     router.push('http://localhost:3000/member/login')
  //   }
  // }, [isAuth, router])

  // 3. 資料讀取的 Effect
  useEffect(() => {
    // 改用 isAuth 判斷
    if (!isAuth) return

    const pathParts = router.asPath.split('/')
    const user_id = pathParts[pathParts.length - 1]

    if (user_id) {
      fetch(`http://localhost:3005/api/blog/blog_user_overview/${user_id}`)
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
  }, [router.asPath, isAuth])

  // 4. 立即驗證阻擋
  if (!isAuth) {
    return null
  }

  // 5. 取得使用者資料
  const { userData } = auth
  const user_id = userData.user_id
  console.log(user_id)

  // 6. Loading 判斷
  if (!blogData || blogData.length === 0) {
    return <p>Loading...</p>
  }

  // 7. return JSX

  return (
    <div className="container d-flex flex-column gap-5">
      {blogData.map((blog) => (
        <Link
          key={blog.blog_id}
          href={`/blog/blog-user-detail/${blog.blog_id}`}
          style={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          <div
            key={blog.blog_id}
            className="card d-flex flex-row BlogUserOverviewCard"
            href={`/blog/blog-detail/${blog.blog_id}`}
          >
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
                    版主：Jack&nbsp;
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

      {/* {user_id === blog.user_id && (
        <button className="edit-button">編輯</button>
      )} */}
    </div>
  )
}
