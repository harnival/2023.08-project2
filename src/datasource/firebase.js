import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, serverTimestamp, setDoc, collection, addDoc, arrayUnion, getDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, getUserByEmail } from 'firebase/auth';
import store from "../store/store";

const firebaseConfig = {
  apiKey: "AIzaSyCsNJnVVExrSm0CHOpX2C-12FkaoOu6dH4",
  authDomain: "project2-caeb8.firebaseapp.com",
  projectId: "project2-caeb8",
  storageBucket: "project2-caeb8.appspot.com",
  messagingSenderId: "592853366822",
  appId: "1:592853366822:web:f8850c2eef74545728cee7"
};

const app = initializeApp(firebaseConfig);
const useFirestore = getFirestore(app),
      useAuth = getAuth(app);

// 로그인 //
const userLogin = function(email,pwd){
  signInWithEmailAndPassword(useAuth,email,pwd)
  .then((userCred) => {
    const user = userCred.user;
    const uid = user.uid;
    return uid
  }).then(uid => {
    const userDb = doc(useFirestore,'account', uid)
    getDoc(userDb).then(snapshot => {
      const data = snapshot.data();
      store.dispatch({type: 'setCurrentUser_Login', info : data})
    })
  })
  .catch((err) => {
    console.log("[error code]", err.code)
    console.log("[error message]", err.message)
  })
}
// 로그아웃 //
const userLogout = function(){
  signOut(useAuth)
  .then(() => {
    store.dispatch({type : 'setCurrentUser_Logout'})
  })
}

// 메세지 송신 (input submit event)//
const sendMessage = function(page,uid,info){
  const dbRef = doc(useFirestore,'message', page, 'contents', serverTimestamp())
  updateDoc(dbRef,{
    user : uid, ...info})
}
// 메세지 페이지 입장 //
const MessagePage = function(selectId, uid, page){
  const dbRef = doc(useFirestore,'account', selectId, 'message')
  getDoc(dbRef).then( snapshot => snapshot.data()).then( data => {
  })
}

// 회원가입 & 정보 저장//
const registUser = function(info){
  const infos = info['info'];
  const subInfos = {...info['subInfo']};

  createUserWithEmailAndPassword(useAuth, infos.email, infos.pwd)
  .then((userCred) => {
    const user = userCred.user;
    const generals = {
      ...subInfos,
      id : (!subInfos.id? user.uid : subInfos.id),
      email : infos.email,
      uid : user.uid
    }
    setDoc(doc(useFirestore,'account', user.uid),{
      ...generals,
      group : {},
      follower : [],
      following:[],
      like : [],
      block : []
    })
  })
  .catch(err => {
    console.log("[create error]",err.code,"---",err.message)
  })
}

// 글 게시 //
const feedPosting = async function(uid,body){
  const dbRef = collection(useFirestore,'posts');
  const posting = await addDoc(dbRef, body)

  const userDb = doc(useFirestore,'account', uid);
  await updateDoc(userDb,{
    post : arrayUnion(posting.id)
  })
}

// 댓글 등록 //
const addComment = async function(post, uid, body){
  if(post){
    const dbRef = collection(useFirestore, 'posts', post)
    const addTime = Object.assign(body,{time : serverTimestamp()})
    const posting = await addDoc(dbRef, addTime)
  
    const userDb = doc(useFirestore,'account', uid);
    await updateDoc(userDb,{
      comment : arrayUnion(posting.id)
    })
  }
}

export {useFirestore, useAuth, sendMessage, registUser, feedPosting, addComment, userLogin, userLogout};