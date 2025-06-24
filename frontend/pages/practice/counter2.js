import React, {useReducer} from 'react'
function reducer(state, action){
// it's going to take current state, this action is what we pass into this dispatch function. We call dispatch with, is going to set to this action variable here and then our current state is going to be in this state variable. and a reducer is going to return our new updated state. 
// action is going to call dispatch function
switch (action.type){
    case 'increment':
        return {count:state.count +1}
    case 'decrement':
        return {count: state.count-1}
    default:
        return state   
}
return {count: state.count +1}
}
export default function Counter2(){
    // first param: function reducer, second param: initial state
    const [state, dispatch] = useReducer(reducer, {count: 0})
    function increment(){
        // setCount(prevCount=>prevCount+1)
        dispatch({type: 'increment'})
    }
    function decrement(){
        dispatch({type: 'decrement'})
    }
    // return value is going to be 2 function: first portion: state(previous object), second: return dispatch-  in order to update our state
    return(
        <>
        <h1>用useReducer做計數器</h1>
        <button onClick={increment}>+</button>
        <span>{state.count}</span>
        <button onClick={decrement}>-</button>
        </>
    )
}