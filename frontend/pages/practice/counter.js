import React, {useState, useReducer} from 'react'

function reducer(){

}

export default function Counter(){
    const []=useReducer()
    const [count, setCount] = useState(0)
    function increment() {
        setCount(prevCount=> prevCount + 1)
        // 右邊使用函數式更新(functional update)，接收前一個狀態值:

    }
    function decrement(){
        setCount(prevCount => prevCount -1 )
    }

    return(
        <>
        <h1>用useState做計數器</h1>
        <button onClick={increment}>+</button>
        <span>{count}</span>
        <button onClick={decrement}>-</button>
        </>
    )
}