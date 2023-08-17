import { memo, useEffect, useRef, useState } from 'react';
import '../css/message.css';
import '../css/message_1023.css'
import MessageUnit from './messageUnit';

import { Routes, Route, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth, useFirestore } from '../datasource/firebase';
import store from '../store/store';
import { useSelector } from 'react-redux';


export default function Message(){

    const [callList, setcallList] = useState([]);
    const [nowList, setnowList] = useState([]);
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
                            const infos = [val , {name : qq2.name, photoURL : qq2.photoURL, id : qq2.id}]
                            return infos
                        })
                    )
                    const groupInfo = {};
                    if(!!v.data().group){
                        const db = doc(useFirestore,'groups',v.data().group);
                        const gi1 = await getDoc(db);
                        const gi2 = gi1.data();
                            groupInfo.title = gi2.title
                            groupInfo.photoURL = gi2.photoURL
                            groupInfo.id = v.data().group
                    }
                    return {...v.data(), contents : timeSort , user : userArr, pageID : v.id , group : (!!v.data().group?  groupInfo: null)}
                })
            )
            setcallList(state => ([...dataArr1]))
            setnowList(state => ([...dataArr1]))
        })
        return () => unsub()
    },[])

   

    // 말풍선 css //
    useEffect(function(){
        const boxes = document.querySelectorAll(".m_l_preview")
       nowList.forEach((v,i) => {
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
    },[nowList])

    const goToMessage = function(id){
        setnowPageID(state => id)
    }


    const location = useLocation();
    const msgBoxRef = useRef();

    useEffect(function(){
        if(nowPageID){
            navigate(`${nowPageID}`)
            msgBoxRef.current.style.left = '-100vw'
        }
    },[nowPageID])

    useEffect(function(){
        if( location.pathname.includes('/message') && nowPageID !== location.pathname.split('/message/')[1]){
            const pathID = location.pathname.split('/message/');
            console.log(pathID)
            if( pathID[0] === '/message'){
                msgBoxRef.current.style.left = '0'
                setnowPageID(state => null)
                console.log("[message oooooooooooo]")
            } 
        }
        console.log(location.pathname, nowPageID)
    },[location.pathname])

    const [category, setcategory] = useState()
    useEffect(function(){
        if(category){
           const list = [...callList];
           console.log(list)
           const list2 = list.filter(v => v.group && v.group.id === category)
           setnowList(state => [...list2])
        } else {
            setnowList(state => [...callList])
        }
    },[category,callList])

    const selectCategory = function(e,id){
        e.preventDefault();
        const q = e.target;
        const w = document.querySelectorAll(".activeCategory");
        [...w].map(v => v.classList.remove("activeCategory"))
        q.classList.add("activeCategory")
        setcategory(state => id)
    }
     const leftBtn = useRef();
     const rightBtn = useRef();
     const categorySlide = useRef();
     useEffect(function(){
        const container = document.querySelector(".m_l_category");
        const slide = document.querySelector(".m_l_category ul");
        if(container.offsetWidth >= slide.offsetWidth){
            leftBtn.current.style.display = 'none'
            rightBtn.current.style.display = 'none'
        } else {
            if(slide.offsetLeft >= 0) {
                leftBtn.current.style.display = 'none'
                rightBtn.current.style.display = 'block'
            } else if( -slide.offsetLeft > slide.offsetWidth - container.offsetWidth){
                leftBtn.current.style.display = 'block'
                rightBtn.current.style.display = 'none'
            } else {
                leftBtn.current.style.display = 'block'
                rightBtn.current.style.display = 'block'
            }
        }

     },[]) 
     
    const MessageMemoComponent = memo(MessageUnit);
    return(
        <div id="message">
            <div className="messageBox"  ref={msgBoxRef}>
                <div className="m_list">
                    <div className="m_l_category">
                        <ul>
                            <li><a href="#" onClick={(e) => selectCategory(e,null)} className='activeCategory'>전체보기</a></li>
                            {Object.entries(store.getState().setCurrentUser.group).map(v => (
                                <li><a href="/" onClick={(e) => selectCategory(e,v[0])}># {v[1]}</a></li>
                            ))}
                        </ul>
                        <button ref={leftBtn}>왼쪽으로 이동</button>
                        <button ref={rightBtn}>오른쪽으로 이동</button>
                    </div>
                    <div className="m_l_list">
                        <ul>
                            {nowList.map(v => (
                                <li key={`message_${v.pageID}`}>
                                    {v.group && (
                                        <div className="m_l_group">
                                            <div className="m_l_g_image">
                                                <img src={v.group.photoURL}/>
                                            </div>
                                            <div className="m_l_g_title">
                                                <strong># {v.group.title} </strong> Group Chat
                                            </div>
                                        </div>
                                    )}
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
                        <Route path=':pageID' element={<MessageMemoComponent props1={nowList.find(v => v.pageID === nowPageID)}/>}></Route>
                    </Route>
                </Routes>
            </div>
        </div>
    )
}