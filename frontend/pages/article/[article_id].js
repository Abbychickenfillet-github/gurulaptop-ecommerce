import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

// 定义组件 ArticleDetail
export default function ArticleDetail(props) {
  // 使用 Router()
  const router = useRouter()

  // 初始化文章状态
  const [article, setArticle] = useState({
    article_id: 0,
    article_title: '',
    article_content: '',
    article_created_date: '',
    article_brand: '',
    article_type: '',
    article_valid_value: '',
    article_url: '',
  })
  console.log('13245')

  const [loading, setLoading] = useState(true) // 加载状态

  const getArticle = async (article_id) => {
    const url = `http://localhost:3005/api/article/article_detail/${article_id}`

    try {
      const res = await fetch(url)
      const resData = await res.json()
      console.log('Response Data:', resData) // 调试信息
      // 检查返回的状态和数据结构
      if (
        resData.status === 'success' &&
        Array.isArray(resData.data) &&
        resData.data.length > 0
      ) {
        setArticle(resData.data[0])
        console.log('Article Loaded:', resData.data[0]) // 确认加载的文章内容
      } else {
        console.log('資料錯誤:', resData)
      }
    } catch (e) {
      console.log('Fetch error:', e)
    } finally {
      setLoading(false) // 完成加载
    }
  }

  useEffect(() => {
    console.log('Router query:', router.query) // 调试信息
    console.log('Router is ready:', router.isReady) // 检查 router.isReady 的状态
    if (router.isReady && router.query.article_id) {
      console.log('Fetching article with ID:', router.query.article_id) // 调试信息
      console.log('11111')

      getArticle(router.query.article_id)
    }
  }, [router.isReady, router.query.article_id])

  return (
    <>
      <ArticleDetailMainArea />

      {article ? (
        <section className="ArticleDetailSectionContentArea">
          <p className="fs-5 fw-bold ArticleDetailSectionContentAreaTitle">
            {article.ArticleTitle}
          </p>
          <p className="ArticleDetailText">{article.article_content}</p>
          <div className="d-flex align-items-center justify-content-center gap-5 mb-5">
            <div className="col-6">
              <img
                className="w-100 h-100 ratio"
                src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
                alt=""
              />
            </div>
            <div className="col-6">
              <img
                className="w-100 h-100 ratio"
                src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
                alt=""
              />
            </div>
          </div>
          <p className="ArticleDetailText">{article.article_content}</p>
          <div className="d-flex align-items-center justify-content-center col-12 mb-5 gap-5">
            <div className="row">
              <div className="col-6">
                <img
                  className="w-100 h-100 ratio"
                  src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
                  alt=""
                />
              </div>
              <div className="col-6">
                <img
                  className="w-100 h-100 ratio"
                  src="https://th.bing.com/th/id/OIP.V5ThX7OGGxexxzFbYvHtBwHaFJ?rs=1&pid=ImgDetMain"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="container d-flex align-items-center justify-content-center col-12">
            <img
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
