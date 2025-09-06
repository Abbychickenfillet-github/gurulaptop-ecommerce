import React from 'react'
import styles from '@/styles/BlogHomePage.module.scss'

export default function BlogDetailMainArea() {
  return (
    <>
      <div className={`container-fluid ${styles.BlogSectionContainer}`}>
        <div className="container">
          <div className="ArticleSectionTitle">
            <p className="text-light">Blog</p>
          </div>
          <div className="ArticleSectionIntroduction">
            <p className="text-light">分享你在 GURU 的完美體驗！</p>
          </div>
        </div>
      </div>
    </>
  )
}
