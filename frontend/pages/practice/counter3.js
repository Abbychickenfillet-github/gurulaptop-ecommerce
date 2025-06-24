import React, {useReducer} FROM 'react'

const ACTIONS ={
    INCREMENT: 'increment',
    DECREMENT:'decrement'
}

function reducer(state,action){
    switch(action.type){
        case ACTIONS.INCREMENT:
        return{ count: state.count+1 }
        case ACTIONS.DECREMENT:
        return{count:state.count+1}
        default:
            return state
    }
}
// reducer放在外面。function increment放在裡面
export default function Counter3(){
    const [state, dispatch] = useReducer(reducer,{count:0})
    
    function increment(){
        dispatch({type: ACTIONS.INCREMENT})
    }
}