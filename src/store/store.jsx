import { createStore, combineReducers } from "redux";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc, onSnapshot } from "firebase/firestore";
import { useAuth, useFirestore } from "../datasource/firebase";

const states = {
    currentUser : null,
    currentSelectGroup : null,
    selectGroupData : {},
    pageLoadDone : true,
    message1023On : false
}

// dispatch function ====================================================================== //

// 로그인한 유저 정보 저장 //
const setCurrentUser = function(state = states.currentUser, action){
    if(action.type === 'setCurrentUser_Login' && action.info){
        const info = action.info;
        state = {...info}
    }
    if(action.type === 'setCurrentUser_Logout'){
        state =  null;
    }
    return state
}
// 그룹 정보 저장 //
const setSelectGroupData = function(state = states.selectGroupData, action){
    state = {...state, [action.id] : action.data}
    return state
}
// 그룹 정보 불러오기 //
const setGetGroup = function(state = states.selectGroupData){
    return state
}
const setMessage1023On = function(state = states.message1023On, action){
    if(action.type === 'setMessage1023On' && window.innerWidth <= 1023){
        state = action.value
    }
    return state
}

// =================================================================================
const reducers = combineReducers({
    setCurrentUser, setSelectGroupData, setGetGroup, setMessage1023On
})
const store = createStore(reducers);
export default store;