import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
export default function ArticleDetailSection() {
  const router = useRouter()
  const { ArticleId } = router.query // 從路由中獲取 ArticleId
  const [article, setArticle] = useState(null) // 初始化 article 狀態

  useEffect(() => {
    // 確保 ArticleId 存在後進行 fetch
    if (ArticleId) {
      fetch(`/article/${ArticleId}`) // 假設你的 API 路徑是這樣
        // process.env.NEXT_PUBLIC_API_BASE_URL/api/article/${ArticleId}
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          return response.json()
        })
        .then((data) => setArticle(data.article)) // 更新狀態
        .catch((error) => console.error('Error fetching article:', error)) // 錯誤處理
    }
  }, [ArticleId]) // 當 ArticleId 改變時重新執行

  return (
    <>
      {article ? (
        <section className="ArticleDetailSectionContentArea">
          <p className="fs-5 fw-bold ArticleDetailSectionContentAreaTitle">
            {article.ArticleTitle}
          </p>
          <p className="ArticleDetailText">{article.ArticleContent}</p>
          <div className="d-flex align-items-center justify-content-center gap-5 mb-5">
            <div className="col-6">
              <Image
                className="w-100 h-100 ratio"
                src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
                alt=""
              />
            </div>
            <div className="col-6">
              <Image
                className="w-100 h-100 ratio"
                src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
                alt=""
              />
            </div>
          </div>
          <p className="ArticleDetailText">{article.ArticleContent}</p>
          <div className="d-flex align-items-center justify-content-center col-12 mb-5 gap-5">
            <div className="row">
              <div className="col-6">
                <Image
                  className="w-100 h-100 ratio"
                  src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
                  alt=""
                />
              </div>
              <div className="col-6">
                <Image
                  className="w-100 h-100 ratio"
                  src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="container d-flex align-items-center justify-content-center col-12">
            <Image
              className="w-50 h-50 ratio"
              src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
              alt=""
            />
          </div>
        </section>
      ) : (
        <p>Loading...</p> // 加載中的提示
      )}
    </>
  )
}
