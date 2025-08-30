import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
// 定義組件 ArticleDetail
export default function ArticleDetail(props) {
  // 使用 Router()
  const router = useRouter()

  // 初始化文章狀態
  const [article, setArticle] = useState(null)
  console.log('13245')

  const [loading, setLoading] = useState(true) // 加載狀態

  const getArticle = async (article_id) => {
    const url = `process.env.NEXT_PUBLIC_API_BASE_URL/api/article/article_detail/${article_id}`

    try {
      const res = await fetch(url)
      const resData = await res.json()
      console.log('Response Data:', resData) // 調試信息
      // 檢查返回的狀態和數據結構
      if (
        resData.status === 'success' &&
        Array.isArray(resData.data) &&
        resData.data.length > 0
      ) {
        setArticle(resData.data[0])
        console.log('Article Loaded:', resData.data[0]) // 確認加載的文章内容
      } else {
        console.log('資料錯誤:', resData)
      }
    } catch (e) {
      console.log('Fetch error:', e)
    } finally {
      setLoading(false) // 完成加載
    }
  }

  useEffect(() => {
    console.log('Router query:', router.query) // 調試信息
    console.log('Router is ready:', router.isReady) // 檢查 router.isReady 的狀態
    if (router.isReady && router.query.article_id) {
      console.log('Fetching article with ID:', router.query.article_id) // 調試信息
      console.log('11111')

      getArticle(router.query.article_id)
    }
  }, [router.isReady, router.query.article_id])

  return (
    <>
      {article ? (
        <section className="ArticleDetailSectionContentArea">
          <p className="fs-5 fw-bold ArticleDetailSectionContentAreaTitle">
            {article.ArticleTitle}
          </p>
          <p className="ArticleDetailText">{article.article_content}</p>
          <div className="d-flex align-items-center justify-content-center gap-5 mb-5">
            <div className="col-6">
              <Image
                className="w-100 h-100 ratio"
                src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
                alt="Article image 1"
                width={400}
                height={300}
              />
            </div>
            <div className="col-6">
              <Image
                className="w-100 h-100 ratio"
                src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
                alt="Article image 2"
                width={400}
                height={300}
              />
            </div>
          </div>
          <p className="ArticleDetailText">{article.article_content}</p>
          <div className="d-flex align-items-center justify-content-center col-12 mb-5 gap-5">
            <div className="row">
              <div className="col-6">
                <Image
                  className="w-100 h-100 ratio"
                  src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
                  alt="Article image 3"
                  width={400}
                  height={300}
                />
              </div>
              <div className="col-6">
                <Image
                  className="w-100 h-100 ratio"
                  src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
                  alt="Article image 4"
                  width={400}
                  height={300}
                />
              </div>
            </div>
          </div>
          <div className="container d-flex align-items-center justify-content-center col-12">
            <Image
              className="w-50 h-50 ratio"
              src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
              alt="Article image 5"
              width={400}
              height={300}
            />
          </div>
        </section>
      ) : (
        <p>Loading...</p> // 加載中的提示
      )}
    </>
  )
}
