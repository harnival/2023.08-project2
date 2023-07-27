import Main from './components/main'
import Editor from './components/editor';
import { useEffect, useState } from 'react'
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom'


export default function App(){
  const [mainState, setmainState] = useState('Home');
  const changeMainState = function(val){
    setmainState(state => val);
  }
  return(
    <div id="app">
        <Router>
        <div className="headerIn">
          <div className="header_account"></div>
          <div className="header_group"></div>
        </div>
        <div className="mainIn">
          <Editor />
          {/* <Main mainState={mainState} /> */}
        </div>
        <div className="subNavIn">
          <button onClick={(e)=> {e.preventDefault(); changeMainState('Home')}}>홈</button>
          <button onClick={(e)=> {e.preventDefault(); changeMainState('Search')}}>검색</button>
          <button onClick={(e)=> {e.preventDefault(); changeMainState('Group')}}>그룹</button>
          <button onClick={(e)=> {e.preventDefault(); changeMainState('Message')}}>메세지</button>
          <button onClick={(e)=> {e.preventDefault(); changeMainState('Account')}}>내 계정</button>
        </div>
      </Router>
    </div>
  )
}