import Main from './components/main'
import { useEffect, useState } from 'react'


export default function App(){
  const [mainState, setmainState] = useState('Home');
  const changeMainState = function(val){
    setmainState(state => val);
  }
  return(
    <div id="app">
      <div className="headerIn">
        <div className="header_account"></div>
        <div className="header_group"></div>
      </div>
      <div className="mainIn">
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