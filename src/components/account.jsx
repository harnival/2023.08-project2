import { getDoc, onSnapshot, doc, query, collection, orderBy, getDocs, where, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import '../css/account.css'
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth, useFirestore } from '../datasource/firebase';
import { useParams, useNavigate } from 'react-router-dom';

export default function Account(props){

    const navigate = useNavigate();
    let {userID} = useParams();
    const [userInfo, setuserInfo] = useState({
        name : null,
        photoURL : null,
        id : null,
        uid : userID,
    })
    const [callPost, setcallPost] = useState([])    // 게시물 불러오기
    const [openUserMenu, setopenUserMenu] = useState(false) // 유저 메뉴 온오프
    const [existID, setexistID] = useState(false)

    useEffect(function(){
         // 게시물 미디어 슬라이드 //
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
                }))
            } else {
                console.log("ddddddd")
            }
        })
    },[userID])

    const setPost = async function(){   // 피드 로드
        const q = query(collection(useFirestore,'posts'),where('uid','==',userID));
        const data1 = onSnapshot(q, async(snapshotDoc) => {
            const dataArr = await Promise.all(
                snapshotDoc.docs.map(async(v) => {
                    const time = v.data().time.seconds * 1000;
                    const timeObj = {
                        year : new Date(time).getFullYear(),
                        month : new Date(time).getMonth() +1,
                        date : new Date(time).getDate(),
                        hour : new Date(time).getHours() <10? "0"+new Date(time).getHours() : new Date(time).getHours(),
                        minute : new Date(time).getMinutes() <10? "0"+new Date(time).getMinutes() : new Date(time).getMinutes(),
                    }
                    const data1 = await getDoc(doc(useFirestore,'account',v.data().uid))
                    const data2 = data1.data()
                    
                    const comments = v.data().comment.map(v => v.uid);
                    if(!!comments.length){
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
                        console.log(commentUser)
                        return ({...v.data(), user_name : data2.general.name, user_id : data2.general.id , user_photo : data2.general.photoURL, time : timeObj, userInfo : userData1});
                    }
                    return ({...v.data(), user_name : data2.general.name, user_id : data2.general.id , user_photo : data2.general.photoURL, time : timeObj});
    
                })
            )
            const dataArr2 = [...dataArr].sort((a,b) => a.time.seconds - b.time.seconds)
            setcallPost(state => dataArr2)
        })
    }
    useEffect(function(){
        setPost()
    },[userID])
    useEffect(function(){
        return () => setPost()
    },[])

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
                    </div>
                </div>
                <div className="acc_feed">
                    <ul>
                        {callPost.map((v,i) =>{return(
                            <li className='acc_f_list' key={v['uid'] + "_" + i}>
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
                                                <li className="acc_f_com_unit" key={"comment_"+i}>
                                                    <div className="acc_f_com_u_account">
                                                        <div className="acc_f_com_u_avatar">
                                                            <img src={v.userInfo.find(v => v.uid === val.uid).photoURL} />
                                                        </div>
                                                        <div className="acc_f_com_u_name">@{v.userInfo.find(v => v.uid === val.uid).id}</div>
                                                        <div className="acc_f_com_u_time">{v.time.seconds}</div>
                                                    </div>
                                                    <div className="acc_f_com_u_text">{v.text}</div>
                                                </li>
                                            ))
                                        ) : (
                                            <li>댓글이 없습니다.</li>
                                        )}
                                        <li className="acc_f_com_input">
                                            <div >
                                                <input type="text" />
                                                <button>submit</button>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        )}
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}