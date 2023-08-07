import { getDoc, onSnapshot, doc, query, collection, orderBy, getDocs } from 'firebase/firestore';
import '../css/account.css'
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth, useFirestore } from '../datasource/firebase';
import { useParams } from 'react-router-dom';

export default function Account(props){
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
                    v.querySelector(".acc_f_c_image_left").addEventListener('click',function(){
                        const slide = v.querySelector(".acc_f_c_image_slide");
                        const len = v.querySelectorAll(".acc_f_c_image_unit").length
                        if(n < len-1){
                            n++;
                            slide.style.transform = `translateX(-${n * slide.offsetWidth / len}px)`
                        }
                    })
                    v.querySelector(".acc_f_c_image_right").addEventListener('click',function(){
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
    useEffect(function(){
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
    useEffect(function(){

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
            }else {
                console.log("fsdfsdfsdf")
            }
        })
    },[userID])
    useEffect(function(){
        onSnapshot(doc(useFirestore,'account', userID), async (docData) => {
            const postData = docData.data();
            const newData = await Promise.all(
                postData.post.map(async(v) => {
                    const data1 = await getDoc(doc(useFirestore,'posts',v))
                    const data2 = data1.data()
                    const data3 = {...data2,
                        user_name : postData.general.name,
                        user_photo : postData.general.photoURL,
                        user_id : postData.general.id
                    }
                    console.log("[onsnapshot]",data3)
                    return data3
                })
            )
            setcallPost(newData)
        })
    },[userID])

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
                                {userID == useAuth.currentUser.uid?(
                                    <div className="acc_i_a_btn1">
                                        <button type="button" onClick={() => setopenUserMenu(state => !state)}>사용자 메뉴</button>
                                        {openUserMenu && (
                                            <ul className="acc_i_a_b_menu">
                                                <li><a href='/#' onClick={(e) => e.preventDefault()}>follow</a></li>
                                                <li><a href='/#' onClick={(e) => e.preventDefault()}>send message</a></li>
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
                                            <span>{v.time}</span>
                                            <div>
                                                <button type='button'>옵션</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="acc_f_c_text">{v.text}</div>
                                    {v.image? (
                                        <div className="acc_f_c_image">
                                            <div className="acc_f_c_image_slide">
                                                {v.image.map((v,i) => ( 
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
                                            v.comment.map((v,i) => (
                                                <li className="acc_f_com_unit" key={"comment_"+i}>
                                                    <div className="acc_f_com_u_account">
                                                        <div className="acc_f_com_u_avatar">
                                                            <img src={v['user_image']} />
                                                        </div>
                                                        <div className="acc_f_com_u_name">@{v['user_id']}</div>
                                                        <div className="acc_f_com_u_time">{v.time}</div>
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