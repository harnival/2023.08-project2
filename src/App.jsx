import Main from './components/main'
import Login from './components/login';
import Signin from './components/signin';
import { useEffect, useState } from 'react'
import {Routes, Route, Link, redirect, useNavigate} from 'react-router-dom'

import {useAuth, useFirestore, userLogout} from './datasource/firebase';
import { onAuthStateChanged } from 'firebase/auth'
import {  doc, getDoc } from 'firebase/firestore';
import store from './store/store';

import './css/mainpage.css';

export default function App(){
  const navigate = useNavigate();
  const [mainState, setmainState] = useState('Home');
  const changeMainState = function(val){
    setmainState(state => val);
  }
  useEffect(function(){
    onAuthStateChanged(useAuth,(user) => {
      if(user){
        const userDb = doc(useFirestore, 'account', user.uid);
        getDoc(userDb).then(snapshot => {
          const data = snapshot.data();
          store.dispatch({type : 'setCurrentUser_Login' , info : data})
          console.log("[currentUser]",useAuth.currentUser)
          navigate('/')
        })
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
        <div className="headerIn">
        <button onClick={() => userLogout()}>qqqqq</button>

          <div className="header_account"></div>
          <div className="header_group"></div>
        </div>
        <div className="mainIn">
          {/* <Editor /> */}
          <Main />
        </div>
        <div className="subNavIn">
          <ul>
            <li><Link to='/'>홈</Link></li>
            <li><Link to='/search'>검색</Link></li>
            <li><Link to='/group'>그룹</Link></li>
            <li><Link to='/message'>메세지</Link></li>
            <li><Link to={`/account/${useAuth.currentUser.uid}`}>내 계정</Link></li>
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