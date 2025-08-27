import React from 'react'
import BlogcreatedCoverimageupload from '@/components/blog/blogcreated/blogcreated-coverimageupload'
import BlogcreatedTitleinput from '@/components/blog/blogcreated/blogcreated-titleinput'
import BlogcreatedCKEditor from '@/components/blog/blogcreated/blogcreated-CKEditor'
import BlogcreatedBrandselection from '@/components/blog/blogcreated/blogcreated-brandselection'
import BlogcreatedCategoryselection from '@/components/blog/blogcreated/blogcreated-categoryselection'
import BlogcreatedActionbuttons from '@/components/blog/blogcreated/blogcreated-actionbuttons'

export default function BlogCreated() {
  return (
    <>
      <div className="BlogEditAlignAllItems">
        <BlogcreatedCoverimageupload />
        <BlogcreatedTitleinput />
        <BlogcreatedCKEditor />
        <BlogcreatedBrandselection />
        <BlogcreatedCategoryselection />
        <BlogcreatedActionbuttons />
      </div>
    </>
  )
}
