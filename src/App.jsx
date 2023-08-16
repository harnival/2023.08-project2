import Main from './components/main'
import Login from './components/login';
import Signin from './components/signin';
import { useEffect, useState } from 'react'
import {Routes, Route, Link, redirect, useNavigate} from 'react-router-dom'

import {useAuth, useFirestore, userLogout} from './datasource/firebase';
import { onAuthStateChanged } from 'firebase/auth'
import {  doc, getDoc, onSnapshot } from 'firebase/firestore';
import store from './store/store';

import './css/app.css';

export default function App(){
  const navigate = useNavigate();
  useEffect(function(){
    onAuthStateChanged(useAuth,(user) => {
      if(user){
        const userDb = doc(useFirestore, 'account', user.uid);
        const unsub = onSnapshot(userDb, async(snapshot) => {
          const data = snapshot.data();
          await store.dispatch({type : 'setCurrentUser_Login' , info : data})
          navigate('/')
        })
        return () => unsub()
      } else {
        store.dispatch({type : 'setCurrentUser_Logout'})
        console.log("[currentUser] logout")
        navigate('/login')
      }    
    })
  },[])
  
  if(useAuth.currentUser){
    return(
      <div id='app'>
        <div className="mainIn">
          {/* <Editor /> */}
          <Main />
        </div>
        <div className="subNavIn">
          <ul>
            <li onClick={() => navigate(`/account/${useAuth.currentUser.uid}`)}>
              <div className='myAccount_box'>
                <img src={store.getState().setCurrentUser.photoURL} className='myAccount_icon'/>
              </div>
              내 계정
            </li>
            <li onClick={() => navigate('/')}>
              <img src="/img/icons/home.svg" />
              홈
            </li>
            <li onClick={() => navigate('/search')}>
              <img src="/img/icons/search.svg" />
              검색
            </li>
            <li onClick={() => navigate('/group')}>
              <img src="/img/icons/group.svg" />
              그룹
            </li>
            <li onClick={() => navigate('/message')}>
              <img src="/img/icons/message.svg" />
              메세지
            </li>
          </ul>
        </div>
      </div>
    )
  } else {
    return(
      <div id="app" key={Date.now()}>
          <Routes>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/signin' element={<Signin />}></Route>
          </Routes>
      </div>
    )

  }
}