import Main from './components/main'
import Login from './components/login';
import Signin from './components/signin';
import { useEffect, useState } from 'react'
import {Routes, Route, Link, redirect, useNavigate} from 'react-router-dom'

import {useAuth, useFirestore, userLogout} from './datasource/firebase';
import { onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDocs } from 'firebase/firestore';
import store from './store/store';

export default function App(){
  const [mainState, setmainState] = useState('Home');
  const changeMainState = function(val){
    setmainState(state => val);
  }

  const navigate = useNavigate();
  useEffect(function(){
    onAuthStateChanged(useAuth,(user) => {
      if(user){
        console.log("[currentUser]",useAuth.currentUser)
        navigate('/')
      } else {
        console.log("[currentUser] logout")
        navigate('/login')
      }    
    })
  },[])  
  // 로그인 시 정보 갱신 //
  store.subscribe(function(){
    console.log('[user info]', store.getState().setCurrentUser)
  })

  const MainPage = function(){
    return(
      <div>
        <div className="headerIn">
          <div className="header_account"></div>
          <div className="header_group"></div>
        </div>
        <div className="mainIn">
          {/* <Editor /> */}
          <Main mainState={mainState} />
        </div>
        <div className="subNavIn">
          <button onClick={(e)=> {e.preventDefault(); changeMainState('Home')}}>홈</button>
          <button onClick={(e)=> {e.preventDefault(); changeMainState('Search')}}>검색</button>
          <button onClick={(e)=> {e.preventDefault(); changeMainState('Group')}}>그룹</button>
          <button onClick={(e)=> {e.preventDefault(); changeMainState('Message')}}>메세지</button>
          <button onClick={(e)=> {e.preventDefault(); changeMainState('Account')}}>내 계정</button>
        </div>
      </div>
    )
  }


  return(
    <div id="app">
      <button onClick={() => userLogout()}>qqqqq</button>
      <Routes>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/signin' element={<Signin />}></Route>
        <Route path='/' element={<MainPage />}></Route>
      </Routes>
    </div>
  )
}