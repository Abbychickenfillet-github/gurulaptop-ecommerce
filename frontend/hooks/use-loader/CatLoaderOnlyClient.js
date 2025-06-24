'use client'

import Lottie from 'lottie-react'
import catAnimation from '@/assets/loader-cat.json'

export default function CatLoader({ show = false }) {
  return (
    <div className={`cat-loader-bg ${show ? '' : 'cat-loader--hide'}`}>
      <Lottie
        className={`cat-loader ${show ? '' : 'cat-loader--hide'}`}
        animationData={catAnimation}
      />
    </div>
  )
}
