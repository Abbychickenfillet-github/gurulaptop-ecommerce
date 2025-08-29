import React, { useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

export default function BlogcreatedCKEditor() {
  const [editorData, setEditorData] = useState('')

  const handleEditorChange = (event, editor) => {
    const data = editor.getData()
    setEditorData(data)
  }

  const getFormattedTimestamp = () => {
    const now = new Date()
    return now.toISOString().slice(0, 19).replace('T', ' ')
  }

  return (
    <>
      <CKEditor
        editor={ClassicEditor}
        data={editorData}
        onChange={handleEditorChange}
      />
    </>
  )
}
