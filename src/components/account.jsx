import { getDoc, onSnapshot, doc, query, collection, orderBy, getDocs, where, addDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import '../css/account.css'
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useAuth, useFirestore } from '../datasource/firebase';
import { useParams, useNavigate } from 'react-router-dom';
import store from '../store/store';

import PostComponent from './post';

export default function Account(props){

    const navigate = useNavigate();
    let {userID} = useParams();
    const [userInfo, setuserInfo] = useState({
        name : null,
        photoURL : null,
        id : null,
        uid : userID,
    })
    const [openUserMenu, setopenUserMenu] = useState(false) // 유저 메뉴 온오프
    const [userPage, setuserPage] = useState(0)     // 유저 페이지 - 0 : 피드 , 1 : 그룹 , 2 : 좋아요
    const [callPost, setcallPost] = useState([])    // 게시물 불러오기
    const [groupList, setgroupList] = useState([])  // 그룹 리스트 불러오기

    useEffect(function(){   // 게시물 미디어 슬라이드 //
         if(callPost){
            const lists = document.querySelectorAll(".acc_f_c_image");
                lists.forEach((v,i) => {
                    let n=0;
                    v.querySelector(".acc_f_c_image_right").addEventListener('click',function(){
                        const slide = v.querySelector(".acc_f_c_image_slide");
                        const len = v.querySelectorAll(".acc_f_c_image_unit").length
                        if(n < len-1){
                            n++;
                            slide.style.transform = `translateX(-${n * slide.offsetWidth / len}px)`
                        }
                    })
                    v.querySelector(".acc_f_c_image_left").addEventListener('click',function(){
                        const slide = v.querySelector(".acc_f_c_image_slide");
                        const len = v.querySelectorAll(".acc_f_c_image_unit").length
                        if(n > 0){
                            n--;
                            slide.style.transform = `translateX(-${n * slide.offsetWidth / len}px)`
                        }
                    })
                })
         }
    },[callPost])

    useEffect(function(){   // 유저 메뉴 온오프 //
        if(openUserMenu){
            const btn = [...document.querySelectorAll(".acc_i_a_b_menu a")];
            const btn2 = document.querySelector(".acc_i_a_btn1 button");
            const qqq = function(e){
                if(!btn.includes(e.target) && btn2 !== e.target){
                    setopenUserMenu(false)
                }
            }
            window.addEventListener("click",qqq)
            return () => {
                window.removeEventListener("click",qqq)
            }
        }
    },[openUserMenu])

    useEffect(function(){   // 유저 정보 로드
        getDoc(doc(useFirestore,'account', userID))
        .then(snapshot => {
            if(snapshot.data()){
                const data = snapshot.data();
                setuserInfo(state => ({
                    name : data.general.name,
                    photoURL : data.general.photoURL? data.general.photoURL : null,
                    id : data.general.id,
                    uid : userID,
                    group : data.group,
                    like : data.like    
                }))
            } else {
                console.log("ddddddd")
            }
        })
    },[userID])

    const changeTime = function(timestamp){
        const time = timestamp * 1000;
        const timeObj = {
            year : new Date(time).getFullYear(),
            month : new Date(time).getMonth() +1,
            date : new Date(time).getDate(),
            hour : new Date(time).getHours() <10? "0"+new Date(time).getHours() : new Date(time).getHours(),
            minute : new Date(time).getMinutes() <10? "0"+new Date(time).getMinutes() : new Date(time).getMinutes(),
        }
        return `${timeObj.year}년 ${timeObj.month}월 ${timeObj.date}일 ${timeObj.hour}시 ${timeObj.minute}분`
    }

    useEffect(function(){   // 게시물 로드
        const q = query(collection(useFirestore,'posts'),where('uid','==',userID));
        const data1 = onSnapshot(q, async(snapshotDoc) => {
            const dataArr = await Promise.all(
                snapshotDoc.docs.map(async(v) => {
                    const postData = v.data();
                    // 시간 변환
                    const time = postData.time * 1000;
                    const timeObj = {
                        year : new Date(time).getFullYear(),
                        month : new Date(time).getMonth() +1,
                        date : new Date(time).getDate(),
                        hour : new Date(time).getHours() <10? "0"+new Date(time).getHours() : new Date(time).getHours(),
                        minute : new Date(time).getMinutes() <10? "0"+new Date(time).getMinutes() : new Date(time).getMinutes(),
                    }
                    // 댓글 목록
                    let commentUserArr = [];
                    if(postData.comment.length !== 0){
                        const comments = postData.comment.map(v => v.uid);
                        const commentUser = [...new Set(comments)]
                        const userData1 = await Promise.all(
                            commentUser.map(async(v) => {
                                const get1 = await getDoc(doc(useFirestore,'account',v));
                                const get2 = get1.data();
                                return({
                                    uid : v,
                                    name : get2.general.name,
                                    id : get2.general.id,
                                    photoURL : get2.general.photoURL
                                })
                            })
                        )
                        commentUserArr = [...userData1];
                    }
                    // 게시글 그룹 정보
                    let groupObj = {}
                    const group = postData.group;
                    if(group){
                        const groupInfo = await getDoc(doc(useFirestore,'groups',group))
                        const groupData = groupInfo.data()
                            groupObj.title = groupData.title;
                            groupObj.photoURL = groupData.photoURL;
                            groupObj.id = group
                    }
                    // 이미지 배열 정리
                    const mediaArr = Object.entries({...postData}).filter(v => v[0].split('_')[0] === 'media')
                    const mediaArr2 = mediaArr.map(v => v[1]);


                    const dataObj = {...postData,
                        media : [...mediaArr2],
                        user_name : userInfo.name, 
                        user_id : userInfo.id , 
                        user_photo : userInfo.photoURL, 
                        time : timeObj, 
                        userInfo : commentUserArr, 
                        postID : v.id,
                        group : {...groupObj}
                    };
                    return ([v.id, dataObj]);
    
                })
            )
            const dataArr2 = [...dataArr].sort((a,b) => a[1].time - b[1].time)
            setcallPost(state => [...dataArr2])
        })
        return () => data1()
    },[userInfo])

    useEffect(function(){   // 그룹 정보 로드
        async function groupLoad(){
            const group = userInfo.group;
            const maps = await Promise.all(group.map(async(v) => {
                const groupDB = doc(useFirestore,'groups',v);
                const groupData = await getDoc(groupDB);
                const groupData2 = groupData.data();
                const groupData3 = [v , {...groupData2}];
                return groupData3
            }))
            setgroupList(state => [...maps])
        }
        groupLoad()
    },[userInfo])
    const sendMessage = function(){
        if(userID !== useAuth.currentUser.uid){
            const q = query(collection(useFirestore,'messages'),where('user','in', [[userID, useAuth.currentUser.uid],[useAuth.currentUser.uid, userID]]));
            getDocs(q)
            .then(async(snapshotDoc) => {
                const docs = snapshotDoc.docs;
                if (!docs.length){
                    const arr1 = docs.map(v => v.data());
                    const addMessage = await addDoc(collection(useFirestore,'messages'),{
                        contents : [],
                        user : [
                            userID,
                            useAuth.currentUser.uid
                        ]
                    })
                    updateDoc(doc(useFirestore,'account',userID),{
                        message : arrayUnion(addMessage.id)
                    })
                    updateDoc(doc(useFirestore,'account', useAuth.currentUser.uid),{
                        message : arrayUnion(addMessage.id)
                    })
                    navigate(`/message/${addMessage.id}`);
                } else {
                    const arr1 = docs.map(v => v.id);                    
                    navigate(`/message/${arr1[0]}`);
                }
            })
        }
    }
    let commentUnit = useRef()
    const setComment = function(event, postID){     // 댓글 입력
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        console.log(data)
        const posting = {
            uid : useAuth.currentUser.uid,
            text : data.text,
            time : Timestamp.now().seconds
        }
        const db = doc(useFirestore,'posts',postID);
        updateDoc(db,{
            comment : arrayUnion(posting)
        })
        return () => {
            commentUnit.current.value = ''
        }
    }

//  components ============================================================== //
    const PostComponent = memo(function({data, idx}){
        const postID = data[0];
        const v = data[1]
        const i = idx;

        return(
            <li className='acc_f_list' >
                <div className="acc_f_content">
                    <div className="acc_f_c_account">
                            <div className="acc_f_c_acc_avatar">
                                <img src={v['user_photo']}/>
                            </div>
                            <div className="acc_f_c_acc_name">
                                <strong>{v['user_name']}</strong><br />
                                <span>@{v['user_id']}</span>
                            </div>
                        <div className="acc_f_c_acc_sub">
                            <span>{`${v.time.year}년 ${v.time.month}월 ${v.time.date}일 ${v.time.hour}시 ${v.time.minute}분`}</span>
                            <div>
                                <button type='button'>옵션</button>
                            </div>
                        </div>
                    </div>
                    <div className="acc_f_c_text">{v.text}</div>
                    {!!v.media.length? (
                        <div className="acc_f_c_image">
                            <div className="acc_f_c_image_slide">
                                {v.media.map((v,i) => ( 
                                    <div key={i} className="acc_f_c_image_unit">
                                        <img src={v}/> 
                                    </div>))}
                            </div>
                            <button type='button' className="acc_f_c_image_left">왼쪽으로 이동</button>
                            <button type='button' className="acc_f_c_image_right">오른쪽으로 이동</button>

                        </div>
                    ): null}
                </div>
                <div className="acc_f_comment">
                    <div className="acc_f_com_like">
                        <div>
                            <button type='button'>likes</button>
                            <span>{v.like}</span>
                        </div>
                        <div>
                            <button type='button'>send</button>
                        </div>
                    </div>
                    <ul>
                        {v.comment && v.comment.length !== 0? (
                            v.comment.map((val,idx) => (
                                <li className="acc_f_com_unit" key={"comment_"+idx}>
                                    <div className="acc_f_com_u_account">
                                        <div className="acc_f_com_u_avatar">
                                            <img src={v.userInfo.find(v => v.uid === val.uid).photoURL} />
                                        </div>
                                        <div className="acc_f_com_u_name">@{v.userInfo.find(v => v.uid === val.uid).id}</div>
                                        <div className="acc_f_com_u_time">{changeTime(val.time.seconds)}</div>
                                    </div>
                                    <div className="acc_f_com_u_text">{val.text}</div>
                                </li>
                            ))
                        ) : (
                            <li>댓글이 없습니다.</li>
                        )}
                        <li className="acc_f_com_input">
                            <form onSubmit={(e)=> setComment(e, postID)}>
                                <input type="text" name='text'/>
                                <button>submit</button>
                            </form>
                        </li>
                    </ul>
                </div>
            </li>
        )
    })
    const GroupComponent = memo(function({data}){
        return(
            <li>

            </li>
        )
    })


    

//  return ================================================================ //
    return(
        <div id="account">
            <div className="accountBox">
                <div className="acc_info">
                    <div className="acc_i_account">
                        <div className="acc_i_a_avatar">
                            <img src={userInfo.photoURL} />
                        </div>
                        <div className="acc_i_a_name">
                            <p className="acc_i_a_n_name">{userInfo.name}</p>
                            <p className="acc_i_a_n_id">@{userInfo.id}</p>
                            <p className="acc_i_a_n_follow"></p>
                                {userID !== useAuth.currentUser.uid?(
                                    <div className="acc_i_a_btn1">
                                        <button type="button" onClick={() => setopenUserMenu(state => !state)}>사용자 메뉴</button>
                                        {openUserMenu && (
                                            <ul className="acc_i_a_b_menu">
                                                <li><a href='/#' onClick={(e) => e.preventDefault()}>follow</a></li>
                                                <li><a href='/#' onClick={(e) => {e.preventDefault(); sendMessage()}}>send message</a></li>
                                                <li><a href='/#' onClick={(e) => e.preventDefault()}>group</a></li>
                                                <li><a href='/#' onClick={(e) => e.preventDefault()}>block</a></li>
                                            </ul>
                                        )}
                                    </div>) : (
                                       <div className="acc_i_a_btn2">
                                            <button>프로필 수정</button>
                                       </div>
                                    )}
                        </div>
                        {userID !== useAuth.currentUser.uid? (
                            <div className="acc_i_followBtn">
                                <a href="/#">follow</a>
                                <a href="/#">cancel follow</a>
                            </div>
                        ) : null }
                        <div className="acc_i_pageMenu">
                            <ul>
                                <li><button type='button' onClick={() => setuserPage(state => 0)}>feed</button></li>
                                <li><button type='button' onClick={() => setuserPage(state => 1)}>group</button></li>
                                <li><button type='button' onClick={() => setuserPage(state => 2)}>like</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="acc_feed">
                    {store.getState().setCurrentUser.block.some(v => v === userID) ? (
                        <div>
                            <p><strong>차단한 유저입니다.</strong></p>
                        </div>
                    ): userPage === 0 ? (
                        <ul>
                            {callPost.map((v,i) => (
                                <PostComponent data={v} idx={i} key={v['uid'] + "_" + i}/>
                            ))}
                        </ul>
                    ) : userPage === 1 ? (
                        <div className='acc_group'>
                            <ul>

                            </ul>
                        </div>
                    ) : userPage === 2 ? (
                        <div className='acc_like'>

                        </div>
                    ) : null
                    }
                </div>
            </div>
        </div>
    )
}