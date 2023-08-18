import { collection, onSnapshot, where, query, getDocs, getDoc, doc, updateDoc, arrayRemove, arrayUnion, orderBy, addDoc } from "firebase/firestore";
import { useEffect, useState, memo } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom"
import { useAuth, useFirestore } from "../datasource/firebase";

import '../css/groupUnit.css'
import PostComponent from './post.jsx'
import store from "../store/store";


export default function GroupUnit(props) {
    let {groupID} = useParams();
    const [currentPage, setcurrentPage] = useState(groupID)
    const [loadPage, setloadPage] = useState({})
    const [pageInfo, setpageInfo] = useState({})
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(function(){
        const data = location.state.data;
        setpageInfo(state => ({...data}))
    },[])
    
    useEffect(function(){   // 그룹 포스트 정보
        const q = query(collection(useFirestore,'posts'),where('group','==',groupID))
        onSnapshot(q, async(snapshotDoc) => {
            const arrs = await Promise.all(
                snapshotDoc.docs.map(async(v) => {
                    // 유저 정보
                    const data1 = await getDoc(doc(useFirestore,'account',v.data().uid));
                    const data2 = data1.data();
                    
                    // 댓글 목록
                    let commentUserArr = [];
                    if(v.data().comment && v.data().comment.length !== 0){
                        const comments = v.data().comment.map(v => v.uid);
                        const commentUser = [...new Set(comments)]
                        const userData1 = await Promise.all(
                            commentUser.map(async(val) => {
                                const get1 = await getDoc(doc(useFirestore,'account',val));
                                const get2 = get1.data();
                                return({
                                    uid : val,
                                    name : get2.name,
                                    id : get2.id,
                                    photoURL : get2.photoURL
                                })
                            })
                        )
                        commentUserArr = [...userData1];
                    }
                    // 게시글 그룹 정보
                    let groupObj = {}
                    const group = v.data().group;
                    if(group){
                        const groupInfo = await getDoc(doc(useFirestore,'groups',group))
                        const groupData = groupInfo.data()
                            groupObj.title = groupData.title;
                            groupObj.photoURL = groupData.photoURL;
                            groupObj.id = group
                        
                    }
                    // 이미지 배열 정리

                    const mediaArr = Object.entries({...v.data()}).filter(v => v[0].split('_')[0] === 'media')
                    const mediaArr2 = mediaArr.map(v => v[1]);

                    const data3 = {...v.data(),
                        media : [...mediaArr2],
                        user_name : data2.name, 
                        user_id : data2.id , 
                        user_photo : data2.photoURL, 
                        userInfo : commentUserArr, 
                        postID : v.id,
                        group : {...groupObj}
                    };
                    
                    return setloadPage(state => ({...state, [v.id] : data3}))
                })
            )
        })
    },[currentPage])

    const [openGroupMenu, setopenGroupMenu] = useState(false)
    const groupOut = function(){
        const groupdb = doc(useFirestore, 'groups', groupID);
        const uid = useAuth.currentUser.uid;

        updateDoc(groupdb,{
            user : arrayRemove(uid)
        });
        const userdb = doc(useFirestore,'account', uid);
        updateDoc(userdb,{
            group : { [groupID] : null }
        })
    }
    const groupIn = function(){
        const groupdb = doc(useFirestore, 'groups', groupID);
        const uid = useAuth.currentUser.uid;
    
        updateDoc(groupdb,{
            user : arrayUnion(uid)
        });
        const userdb = doc(useFirestore,'account', uid);
        const updates = {...store.getState().setCurrentUser.group}
            updates[groupID] = pageInfo.title;
        updateDoc(userdb,{
            group : updates
        })
    }

    const [categoryPage, setcategoryPage] = useState(0);       // 카테고리 페이지 위치
    const [chatList, setchatList] = useState([])
    useEffect(function(){
        async function gc(){
            const chatQuery = query(collection(useFirestore,'messages'),where('group','==',groupID),orderBy('group'));
            const cq1 = await getDocs(chatQuery);
            const cq2 = cq1.docs;
            const cq3 = await Promise.all(
                cq2.map(async(v) => {
                    const timeSort = [...v.data().contents].sort((a,b) => a.time - b.time)
                    const userArr = await Promise.all(
                        v.data().user.map(async(val) => {
                            const qq = await getDoc(doc(useFirestore,'account',val))
                            const qq2 = qq.data()
                            const infos = [val , {name : qq2.name, photoURL : qq2.photoURL, id : qq2.id}]
                            return infos
                        })
                    )
                    return {...v.data(), contents : timeSort , user : userArr, pageID : v.id}
                })
            )
            setchatList(state => [...cq3])
        }
        gc()
    },[])

    const joinGroupChat = function(pageID){
        const chatdb = doc(useFirestore,'messages',pageID);
        updateDoc(chatdb,{
            user : arrayUnion(useAuth.currentUser.uid)
        })
        .then(() => {
            navigate(`/message/${pageID}`)
        })
    }
    const newGroupChat = async function(){
        const msgdb = collection(useFirestore,'messages');
        const msgId = await addDoc(msgdb,{
            contents: [],
            user : [ useAuth.currentUser.uid ],
            group : groupID,
            number : chatList.length
        });
        navigate(`/message/${msgId.id}`);
    }
    // component ============= //
    const GroupUnitPostComponent = memo(PostComponent);

    return(
        <div id="groupUnit">
            <div className="gu_info">
                <div className="gu_i_image">
                    <img src={pageInfo.photoURL}/>
                </div>
                <div className="gu_i_title">
                    <h3>{pageInfo.title}</h3>
                </div>
                <div className="gu_i_desc">
                    <p>{pageInfo.description}</p>
                </div>
                <div className="gu_i_users">
                    <p>{pageInfo.user && pageInfo.user.length}명 참여</p>
                </div>
                <div className="gu_i_btn">
                    <Link to={'/group'}>
                        <button>뒤로가기</button>
                    </Link>
                </div>
                <div className="gu_i_option">
                    <button onClick={() => setopenGroupMenu(state => !state)}>옵션</button>
                    {openGroupMenu && (
                        <div className="gu_i_o_list">
                            <ul>
                                <li><button>그룹 신고</button></li>
                                {Object.keys(store.getState().setCurrentUser.group).find(v => v === groupID)? (
                                    <li><button onClick={() => groupOut()}>그룹에서 나가기</button></li>
                                ):(
                                    <>
                                        <li><button onClick={() => groupIn()}>그룹 참가하기</button></li>
                                        <li><button>그룹 차단</button></li>
                                    </>
                                    
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <div className="gu_tab">
                <div className="gu_tab_box">
                    <div className="gu_tab_line"></div>
                    <button onClick={() => setcategoryPage(state => 0)}>dashboard</button>
                    <div className="gu_tab_line"></div>
                    <button onClick={() => setcategoryPage(state => 1)}>group chat</button>
                    <div className="gu_tab_line"></div>
                </div>
            </div>
            <div className="gu_main">
                {categoryPage===0 && (
                    <ul>
                        {!Object.entries(loadPage).length? (
                            <li>
                                <strong>텅텅....</strong>
                            </li>
                        ):(
                            Object.entries(loadPage).sort((a,b) => a[1].time - b[1].time).map(v => (
                                <GroupUnitPostComponent postData={v[1]} postID={v[0]} key={`groupUnit_${v[0]}`}/>
                            ))
                        )}
                    </ul>
                )}
                {categoryPage===1 && (
                    <ul>
                        <li>
                            <div className="gu_m_gc_new">
                                <button onClick={() => newGroupChat()}>그룹챗 생성</button>
                                
                            </div>
                        </li>
                        {chatList.map((v,i) => (
                            <li key={v.pageID} className="gu_m_gc_list" onClick={() => joinGroupChat(v.pageID)}>
                                <p className="gu_m_gc_l_number">Group Chat <strong>#{i}</strong></p>
                                <div className="gu_m_gc_box">
                                    <p className="gu_m_gc_box_1">
                                        <span>{v.title}</span>
                                        <span>현재 {v.user&&v.user.length}명 참여중</span>
                                    </p>
                                    <p className="gu_m_gc_box_2">" {v.contents[v.contents.length-1].text} "</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

            </div>
        </div>
    )
}