import React, { useState, useEffect } from 'react'

export default function BlogUserOverview() {
  const [blogData, setBlogData] = useState(null)

  console.log(blogData)

  useEffect(() => {
    fetch(`http://localhost:3005/api/blog/bloguseroverview`)
      .then((response) => response.json())
      .then((data) => {
        setBlogData(data.data)
        console.log('撈取資料正常')
      })
  }, []) // 加上這個結尾

  if (!blogData) {
    return <p>Loading...</p>
  }

  return (
    <>
      <div className="card-body w-75 h-100">
        <div className="BlogUserOverviewCardBodyContent m-3">
          <div className="d-flex row">
            <p className="BlogUserOverviewCardTitle">{blogData.blog_title}</p>
            <h7 className="card-text mb-4 BlogUserOverviewCardContent">
              {blogData.blog_content}
            </h7>
          </div>
          <div
            style={{ width: '60%' }}
            className="d-flex justify-content-between pe-5"
          >
            <p className="card-text BlogUserOverviewCardType">
              {blogData.blog_user_id}
            </p>
            <p className="text-nowrap">
              <i className="fa-regular fa-comment-dots" />
              {blogData.blog_type}
            </p>
          </div>
          <div className="d-flex justify-content-between pe-5">
            <p>{blogData.blog_type}</p>
            <p>{blogData.blog_created_date}</p>
          </div>
        </div>
      </div>
    </>
  )
}
