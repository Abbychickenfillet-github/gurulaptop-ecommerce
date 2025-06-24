'use client'

import Lottie from 'lottie-react'
import nikeAnimation from '@/assets/loader-nike.json'

export default function NikeLoader({ show = false }) {
  return (
    <div className={`nike-loader-bg ${show ? '' : 'nike-loader--hide'}`}>
      <Lottie
        className={`nike-loader ${show ? '' : 'nike-loader--hide'}`}
        animationData={nikeAnimation}
      />
    </div>
  )
}
