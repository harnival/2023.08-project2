import Main from './components/main'
import './css/login.css'
import { useEffect, useState } from 'react'
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom'

import {useAuth, useFirestore} from './datasource/firebase';
import { collection, doc, getDocs } from 'firebase/firestore';

export default function App(){
  const [mainState, setmainState] = useState('Home');
  const changeMainState = function(val){
    setmainState(state => val);
  }

  return(
    <div id="app">
        <Router>
          {useAuth.currentUser? (
            <div className='loginPage'>
              <div className="l_header">
                <a href="/#">가입하기</a>
              </div>
              <div className="loginFormWrap">
                <div className="lf_illust">

                </div>
                <form className='loginForm'>
                  <div>
                    <p>* 가입한 이메일과 비밀번호를 입력하고 아래 버튼을 클릭하세요.</p>
                  </div>
                  <div>
                    <div className="lfn" style={{borderBottom : '1px solid black'}}>
                    <input type="text" name='email' placeholder='E-MAIL'/>
                    </div>
                    <div className="lfn">
                    <input type="password" name='pwd'  placeholder='PASSWORD'/>
                    </div>
                  </div>
                    <button>로그인</button>
                </form>
              </div>
            </div>
          ) : (
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
          )}
      </Router>
    </div>
  )
}