import { createStore, combineReducers } from "redux";
import { onAuthStateChanged } from "firebase/auth";

const states = {
    currentUser : {},
}

// set function //
const setCurrentUser = function(state = states.currentUser, action){
    if(action.type === 'setCurrentUser_Login'){
        const info = action.info;
        return {...state, info }
    }
    if(action.type === 'setCurrentUser_Logout'){
        return null;
    }
    return state
}


const dispatch1 = combineReducers({
    setCurrentUser,
})
const store = createStore(dispatch1);
export default store;