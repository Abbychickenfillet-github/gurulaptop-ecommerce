import { useState } from 'react'

// 子頁面(區域)
import Cart from './blocks/cart'
import Ship from './blocks/ship'
import Pay from './blocks/pay'
import Detail from './blocks/detail'

// 進度條
//import ProgressBar from './components/ProgressBar'

// css樣式
//import './styles/OrderSteps.css'

export default function OrderSteps() {
  const maxSteps = 4

  const [step, setStep] = useState(1)

  const [shipping, setShippingData] = useState({
    name: '',
    address: '',
    phone: '',
  })

  // 動態元件語法
  const components = [Cart, Ship, Pay, Detail]
  const BlockComponent = components[step - 1]

  // 上一步 下一步按鈕
  const next = () => {
    // 運送表單用檢查
    if (step === 2) {
      const { name, address, phone } = shipping

      // 有錯誤訊息會跳出警告，不會到"下一步"
      const errors = []

      if (!name) errors.push('姓名沒填~ ')

      if (!address) errors.push('住址沒填~ ')

      if (!phone) errors.push('電話沒填~ ')

      if (errors.length > 0) {
        alert(errors.join(','))
        return
      }
    }

    // 沒錯誤才會到下一步
    if (step < maxSteps) setStep(step + 1)
  }

  // 上一步按鈕
  const prev = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <>
      <h1>訂購流程</h1>
      {/* 進度條 */}
      <div>
        {/* <ProgressBar
          maxSteps={maxSteps}
          step={step}
          progressNames={progressNames}
        /> */}
      </div>
      {/* 子頁面區域 */}
      <div className="order-steps">
        <BlockComponent shipping={shipping} setShippingData={setShippingData} />
      </div>
      {/* 按鈕 */}
      <div>
        <button onClick={prev} disabled={step === 1}>
          上一步
        </button>
        <button onClick={next} disabled={step === maxSteps}>
          下一步
        </button>
      </div>
    </>
  )
}
