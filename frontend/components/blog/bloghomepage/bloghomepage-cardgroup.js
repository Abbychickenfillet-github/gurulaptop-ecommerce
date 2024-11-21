import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function BloghomepageCardgroup() {
  // 設定狀態存放文章資料
  const [blogs, setBlogs] = useState([])

  // 將文章分組，每組2篇
  const rows = []
  for (let i = 0; i < blogs.length; i += 2) {
    rows.push(blogs.slice(i, i + 2))
  }

  // 載入6筆文章資料
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const queryParams = new URLSearchParams({
          limit: 6, // 限制只撈6筆
        })

        const res = await fetch(`http://localhost:3005/api/blog/blogcardgroup`)
        const data = await res.json()

        if (data.blogs) {
          setBlogs(data.blogs)
          console.log(data)
        }
      } catch (err) {
        console.error('載入文章錯誤:', err)
      }
    }

    fetchBlogs()
  }, []) // 只在組件掛載時執行一次

  return (
    <>
      <div className="container">
        <div className="row g-4">
          {blogs.map((data, index) => (
            <div className="col-md-6" key={index}>
              <Link
                className="text-decoration-none"
                href={`/blog/blog-detail/${data.blog_id}`}
                passHref
              >
                <div className="card d-flex flex-row bg-white ArticleSmallerCard">
                  <div className="w-50 position-relative">
                    <img
                      src={
                        data.blog_image
                          ? `http://localhost:3005${data.blog_image}`
                          : 'http://localhost:3005/blog-images/nolaptopupload.jpeg'
                      }
                      className="w-100 h-100 ratio object-fit-cover position-center"
                      alt="..."
                      style={{ objectPosition: 'center' }}
                    />
                    <div className="ArticleSmallerCardHeadHover position-absolute left-0 bottom-0 w-100 h-25 container">
                      <p className="ArticleSmallerCardHeadHoverP">
                        {data.blog_brand}
                      </p>
                    </div>
                  </div>
                  <div className="w-50">
                    <div className="card-body h-100 d-flex flex-column m-2">
                      <div className="flex-grow-1">
                        <h5 className="ArticleSmallerCardTitle mb-2 text-dark">
                          {data.blog_title}
                        </h5>
                        <p className="ArticleSmallerCardContent mb-3 text-dark">
                          {data.blog_content}
                        </p>
                      </div>
                      <div className="d-flex justify-content-between flex-column flex-xl-row">
                        <p className="mb-0 text-dark text-nowrap">
                          {data.blog_type}
                        </p>
                        <p className="mb-0 text-dark text-nowrap">
                          {data.blog_created_date}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
