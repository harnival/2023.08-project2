import { useEffect, useState } from 'react';
import '../css/message.css';
import MessageUnit from './messageUnit';

import { Routes, Route, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth, useFirestore } from '../datasource/firebase';


export default function Message(){

    const [callList, setcallList] = useState([]);
    const [nowPage, setnowPage] = useState();
    const [nowPageID, setnowPageID] = useState();
    const navigate = useNavigate();

    const Layout = () => (  // route 스타일링
        <div className='m_talkbox'>
            <Outlet />
        </div>
    )
    useEffect(function(){   // 리스트 불러오기
        const q = query(collection(useFirestore,'messages'),where('user','array-contains',useAuth.currentUser.uid));
        const unsub = onSnapshot(q,async(snapDoc) => {
            const sntArr = [...snapDoc.docs]
            const dataArr1 = await Promise.all(
                sntArr.map(async(v) => {
                    const timeSort = [...v.data().contents].sort((a,b) => a.time - b.time)
                    const userArr = await Promise.all(
                        v.data().user.map(async(val) => {
                            const qq = await getDoc(doc(useFirestore,'account',val))
                            const qq2 = qq.data()
                            const infos = [val , {name : qq2.general.name, photoURL : qq2.general.photoURL, id : qq2.general.id}]
                            return infos
                        })
                    )
                    return {...v.data(), contents : timeSort , user : userArr, pageID : v.id}
                })
            )
            setcallList(state => ([...dataArr1]))
        })
        
        return () => unsub()
    },[])

    // 말풍선 css //
    useEffect(function(){
        const boxes = document.querySelectorAll(".m_l_preview")
       callList.forEach((v,i) => {
            const con = [...v.contents];
            if(!v.contents.length){
                return true;
            }
            const last = con.pop().uid;
            if( last === useAuth.currentUser.uid){
                boxes[i].classList.add("m_l_p_t_send")
                boxes[i].classList.remove("m_l_p_t_receive")
            } else {
                boxes[i].classList.remove("m_l_p_t_send")
                boxes[i].classList.add("m_l_p_t_receive")
            }
       })
    },[callList])

    const goToMessage = function(id){
        // const msgObj = callList.find(v => v.pageID === id);
        setnowPageID(state => id)
    }

    useEffect(function(){
        if(nowPageID){
            const id = nowPageID;
            navigate(`${id}`, { state : {data : callList.find(v => v.pageID === id)}})
        }
    },[nowPageID])
    const location = useLocation();
    useEffect(function(){
        if( location.pathname.includes('/message/') && nowPageID !== location.pathname.split('/message/')[1]){
            setnowPageID(state => location.pathname.split('/message/')[1])            
        }
    },[location])

    
    return(
        <div id="message">
            <div className="messageBox">
                <div className="m_list">
                    <div className="m_l_category">
                        <ul>
                            <li><a href="#">전체보기</a></li>
                        </ul>
                    </div>
                    <div className="m_l_list">
                        <ul>
                            {callList.map(v => (
                                <li key={`message_${v.pageID}`}>
                                    <div className="m_l_box" onClick={(e) => {e.preventDefault(); goToMessage(v.pageID)}}>
                                        <div className="m_l_infoWrap">
                                            { v.user.filter(v => v[0] !== useAuth.currentUser.uid).map(v => (
                                                <div className="m_l_info" key={`info_${v[0]}`}>
                                                    <div className="m_l_i_avatars">
                                                            <img src={v[1].photoURL} />
                                                    </div>
                                                    <div className="m_l_i_ids">
                                                        <p className='ids_name'>{v[1].name}</p>
                                                        <p className='ids_id'>@{v[1].id}</p>
                                                    </div>
                                                </div>
                                            )) }
                                        </div>
                                        <div className="m_l_preview">
                                            {v.contents && !!v.contents.length && (
                                                <div className="m_l_p_text">
                                                    <p className="m_l_p_t_id">
                                                        @{v.user.find(val => (val[0] === v.contents[v.contents.length-1].uid))[1].id}
                                                    </p>
                                                    <p className="m_l_p_t_content">
                                                        {v.contents[v.contents.length-1].text}
                                                    </p>
                                                </div>
                                            ) }
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path=':pageID' element={<MessageUnit props1={callList.find(v => v.pageID === nowPageID)}/>}></Route>
                    </Route>
                </Routes>
            </div>
        </div>
    )
}