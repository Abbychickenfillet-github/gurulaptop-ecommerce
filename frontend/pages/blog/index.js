import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import BlogDetailMainArea from '@/components/blog/bloghomepage/articlehomepage-mainarea'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import Header from '@/components/layout/default-layout/header'
import MyFooter from '@/components/layout/default-layout/my-footer'
import NextBreadCrumb from '@/components/common/next-breadcrumb'
import Head from 'next/head'
import { Search } from 'lucide-react'

export default function BlogSearchPage() {
  const [blogs, setBlogs] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ITEMS_PER_PAGE = 6

  // -------------------使用者-------------------
  const { auth } = useAuth()
  const { userData } = auth
  const user_id = userData?.user_id
  console.log(user_id)
  // -------------------使用者-------------------

  // 統一的過濾狀態
  const [filters, setFilters] = useState({
    searchText: '',
    types: [],
    brands: [],
  })

  // 統一的文章載入邏輯
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const queryParams = new URLSearchParams({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: filters.searchText,
          types: filters.types.join(','),
          brands: filters.brands.join(','),
        })

        const res = await fetch(
          `http://localhost:3005/api/blog/search?${queryParams}`
        )
        const data = await res.json()

        if (data.blogs) {
          setBlogs(data.blogs)
          setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE))
        }
      } catch (err) {
        console.error('載入文章錯誤:', err)
      }
    }
    fetchBlogs()
  }, [currentPage, filters])

  // 統一的事件處理函數
  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, searchText: e.target.value }))
    setCurrentPage(1)
  }

  // 修改 handleTypeChange 函數
  const handleTypeChange = (e) => {
    const { value, checked } = e.target
    setFilters((prev) => ({
      ...prev,
      types: checked ? [value] : [], // 改為單選：選中時只存一個值，取消時清空
      // brands: [] // 如果需要互斥，取消註解這行
    }))
    setCurrentPage(1)
  }

  // 修改 handleBrandChange 函數
  const handleBrandChange = (e) => {
    const { value, checked } = e.target
    setFilters((prev) => ({
      ...prev,
      brands: checked ? [value] : [], // 改為單選：選中時只存一個值，取消時清空
      // types: [] // 如果需要互斥，取消註解這行
    }))
    setCurrentPage(1)
  }

  // 分頁處理
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  return (
    <>
      <Head>
        <title>部落格</title>
      </Head>
      <Header />

      <BlogDetailMainArea />

      {/* <p>目前沒有部落格喔！來新增部落格吧！</p> */}

      {/* 搜尋列 */}
      <div className="BlogMain container-fluid">
        <div className="BlogSearchBox">
          <div className="d-flex justify-content-center">
            <input
              type="text"
              value={filters.searchText}
              onChange={handleSearch}
              className="blog-form-control BlogSearchInputStyle"
              placeholder="Search"
            />
            <button className="btn" onClick={(e) => e.preventDefault()}>
              <Search
                className="SearchIcon"
                size={20}
                onClick={(e) => e.preventDefault()}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="mt-5">
          <NextBreadCrumb
            bgClass="bg-transparent"
            isChevron={true}
            isHomeIcon={true}
          />
        </div>

        {/* 分類選擇 */}
        <div className="BlogTypeSearch bg-transparent mt-5">
          <div className="d-flex justify-content-around gap-3 flex-wrap">
            {['購買心得', '開箱文', '疑難雜症', '活動心得'].map((type, i) => (
              <div key={type} className="BlogTypeCheckbox text-nowrap col-2">
                <input
                  type="checkbox"
                  id={`typeCheck${i}`}
                  value={type}
                  checked={filters.types.includes(type)}
                  onChange={handleTypeChange}
                />
                <label
                  htmlFor={`typeCheck${i}`}
                  className="BlogTypeCheckboxLabel"
                >
                  &nbsp;&nbsp;{type}
                </label>
              </div>
            ))}
          </div>
        </div>
        {/* 紫線 */}
        <div className="PurpleLine m-auto w-75" />
        {/* 紫線 */}

        {/* 品牌選擇 */}
        <div className="ArticleBrandSearch bg-transparent mt-5 mb-3">
          <form>
            <div className="row justify-content-between gap-3">
              {['Acer', 'Asus', 'Gigabyte', 'HP', 'MSI', 'Raser'].map(
                (brand, i) => (
                  <div
                    key={brand}
                    className="ArticleCheckbox text-nowrap col-2"
                  >
                    <input
                      type="checkbox"
                      id={`brandCheck${i}`}
                      value={brand}
                      checked={filters.brands.includes(brand)}
                      onChange={handleBrandChange}
                    />
                    <label
                      htmlFor={`brandCheck${i}`}
                      className="ArticleCheckboxLabel"
                    >
                      &nbsp;&nbsp;{brand}
                    </label>
                  </div>
                )
              )}
            </div>
          </form>
        </div>
        {/* 搜尋列 */}
        {/* 新增按鈕 */}
        {/* 有人好像新增 btn-primary 的全域樣式，改成紫色的 */}
        {/* 修改登入判斷邏輯 */}
        <div className="d-flex flex-row-reverse mb-5">
          {user_id ? (
            <Link href="/blog/blog-created">
              <button
                type="button"
                className="btn text-white BlogIndexCreatedButton"
              >
                新增發文！
              </button>
            </Link>
          ) : (
            <Link href="http://localhost:3000/member/login">
              <button
                type="button"
                className="btn text-white BlogIndexCreatedButton"
              >
                登入後發文
              </button>
            </Link>
          )}
        </div>
        {/* 有人好像新增 btn-primary 的全域樣式，改成紫色的 */}
        {/* 文章列表區塊 */}
        <div className="position-relative">
          <div className="d-flex flex-column align-items-center justify-content-center gap-3">
            <div className="row">
              {blogs.map((blog) => (
                <div className="col-md-12 col-lg-6 mb-5" key={blog.blog_id}>
                  <Link href={`/blog/blog-detail/${blog.blog_id}`} passHref>
                    <div className="card d-flex flex-row BlogCard shadow w-100">
                      <img
                        src={
                          blog.blog_image
                            ? `http://localhost:3005${blog.blog_image}`
                            : 'http://localhost:3005/blog-images/nolaptopupload.jpeg'
                        }
                        className="card-img-top w-50 h-100 BlogCardImg"
                        alt={blog.blog_title}
                      />
                      <div className="card-body w-50 h-100">
                        <div className="BlogCardBodyContent">
                          <div className="row">
                            <p className="BlogCardTitle">{blog.blog_title}</p>
                            <h7 className="card-text mb-md-4 BlogCardContent">
                              {blog.blog_content}
                            </h7>
                          </div>
                          <div className="d-flex justify-content-between">
                            <p className="card-text BlogCardType">
                              版主：{blog.user_id || 'Unknown'}
                            </p>
                            <p>{blog.blog_brand}</p>
                          </div>
                          <div className="d-flex justify-content-between">
                            <p>{blog.blog_type}</p>
                            <p>
                              {new Date(
                                blog.blog_created_date
                              ).toLocaleDateString()}
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
        </div>
        {/* 小卡片製作 */}
        {/* 小卡片製作 */}
        {/* 小卡片製作 */}
        {/* 小卡片製作 */}
        {/* 小卡片製作 */}
        {/* 小卡片製作 */}
        {/* 小卡片製作 */}
        {/* 頁數 nav */}
        {/* 頁數 nav */}
        {/* 頁數 nav */}
        {/* 頁數 nav */}
        {/* 頁數 nav */}
        {/* 更新分頁導航 */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center my-4">
            <nav aria-label="Page navigation">
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                </li>

                {/* 頁碼按鈕 */}
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1
                  // 只顯示當前頁面附近的頁碼
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <li
                        key={pageNumber}
                        className={`page-item ${
                          currentPage === pageNumber ? 'active' : ''
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    )
                  }
                  // 顯示省略號
                  if (
                    (pageNumber === currentPage - 2 && currentPage > 3) ||
                    (pageNumber === currentPage + 2 &&
                      currentPage < totalPages - 2)
                  ) {
                    return (
                      <li
                        key={`ellipsis-${pageNumber}`}
                        className="page-item disabled"
                      >
                        <span className="page-link">...</span>
                      </li>
                    )
                  }
                  return null
                })}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? 'disabled' : ''
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    »
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
      <MyFooter />
    </>
  )
}
BlogSearchPage.getLayout = (page) => page
