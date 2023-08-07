import { createStore, combineReducers } from "redux";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { useAuth, useFirestore } from "../datasource/firebase";

const states = {
    currentUser : {},
    currentUserGroup : null
    
}

// set function //
const setCurrentUser = function(state = states.currentUser, action){
    if(action.type === 'setCurrentUser_Login'){
        const info = action.info;
        console.log("[user store]",info)
        return {...info}
    }
    if(action.type === 'setCurrentUser_Logout'){
        return null;
    }
    return state
}
const setCurrentUserGroup = function(state = states.currentUserGroup, action){
    if(action.type === 'setCurrentUserGroup'){
        const uid = useAuth.currentUser.uid;
        const info = states.currentUser.group;
        getDoc(doc(useFirestore,'groups'))
    }
    return state
}

const dispatch1 = combineReducers({
    setCurrentUser, setCurrentUserGroup
})
const store = createStore(dispatch1);
export default store;