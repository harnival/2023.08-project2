import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, serverTimestamp, setDoc, collection, addDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

// 회원가입 //
const registUser = function(uid,info){
  const dbRef = doc(useFirestore, 'account', uid)
  setDoc(dbRef, info);
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

export {useFirestore, useAuth, sendMessage, registUser, feedPosting, addComment};