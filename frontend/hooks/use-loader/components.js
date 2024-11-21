// https://github.com/Gamote/lottie-react
import Lottie from 'lottie-react'
import catAnimation from '@/assets/loader-cat.json'
import nikeAnimation from '@/assets/loader-nike.json'
import { PacmanLoader } from "react-spinners";

// 展示用載入元件
export function DefaultLoader({ show = true }) {
  return (
    <div className={`semi-loader ${show ? '' : 'semi-loader--hide'}`}></div>
  )
}

// 展示用載入文字元件
export function LoaderText({ text = 'loading', show = false }) {
  return (
    <div className={`loading-text-bg ${show ? '' : 'loading-text--hide'}`}>
      <div className={`loading-text ${show ? '' : 'loading-text--hide'}`}>
        {text}...
      </div>
    </div>
  )
}

// lottie-react
export function CatLoader({ show = false }) {
  return (
    <div className={`cat-loader-bg ${show ? '' : 'cat-loader--hide'}`}>
      <Lottie
        className={`cat-loader ${show ? '' : 'cat-loader--hide'}`}
        animationData={catAnimation}
      />
    </div>
  )
}

// lottie-react
export function NikeLoader({ show = false }) {
  return (
    <div className={`nike-loader-bg ${show ? '' : 'nike-loader--hide'}`}>
      <Lottie
        className={`nike-loader ${show ? '' : 'nike-loader--hide'}`}
        animationData={nikeAnimation}
      />
    </div>
  )
}

export function NoLoader({ show = false }) {
  return <></>
}
