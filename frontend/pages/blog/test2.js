import React, { useState, useEffect } from 'react'
import BlogDetailMainArea from '@/components/blog/bloghomepage/articlehomepage-mainarea'
// import Header from '@/components/layout/default-layout/header'
// import MyFooter from '@/components/layout/default-layout/my-footer'

export default function Test2(props) {
  return (
    <>
      {/* <Header /> */}
      <BlogDetailMainArea />
      {/* <MyFooter /> */}
    </>
  )
}
Test2.getLayout = (page) => page
