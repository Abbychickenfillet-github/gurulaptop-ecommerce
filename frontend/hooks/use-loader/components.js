'use client'

import dynamic from 'next/dynamic'
import { PacmanLoader } from 'react-spinners'

// 動態載入元件（client only）
export const CatLoader = dynamic(() => import('./CatLoaderOnlyClient'), { ssr: false })
export const NikeLoader = dynamic(() => import('./NikeLoaderOnlyClient'), { ssr: false })

export function DefaultLoader({ show = true }) {
  return (
    <div className={`semi-loader ${show ? '' : 'semi-loader--hide'}`}></div>
  )
}

export function LoaderText({ text = 'loading', show = false }) {
  return (
    <div className={`loading-text-bg ${show ? '' : 'loading-text--hide'}`}>
      <div className={`loading-text ${show ? '' : 'loading-text--hide'}`}>
        {text}...
      </div>
    </div>
  )
}

export function NoLoader({ show = false }) {
  return <></>
}
