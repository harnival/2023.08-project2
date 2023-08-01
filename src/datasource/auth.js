import { useAuth } from "./firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth'

// 가입 //
const createAccount = function(email, pwd){
    createUserWithEmailAndPassword(useAuth, email, pwd)
    .then(userCred => {
        const user = userCred.user;
        
    })
}
