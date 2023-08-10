import { collection, addDoc, serverTimestamp, getDoc, doc, query, where, or, getDocs } from 'firebase/firestore';
import '../css/home.css'
import store from '../store/store';
import {useEffect, useRef, useState} from 'react';
import { useAuth, useFirestore } from '../datasource/firebase';
import { useNavigate } from 'react-router-dom';
export default function Home(){
    const navigate = useNavigate();

    const selectGroup = useRef();
    const showGroup = useRef();
    const textArea = useRef()

    const [feedLoading, setfeedLoading] = useState(true)
    const [totalFeed, settotalFeed] = useState([])
    const [addPost, setaddPost] = useState()

    
    const getPosts = async function(){
        const myGroup = Object.keys(store.getState().setCurrentUser.group)
        const myFollower = store.getState().setCurrentUser.follower;
        myFollower.push(useAuth.currentUser.uid);
        const q = !myGroup.length ? (
            query(collection(useFirestore,'posts'),where('uid', 'in', myFollower))
            ) : (
            query(collection(useFirestore,'posts'),or(
                where('group','in', myGroup),
                where('uid', 'in',myFollower)
            ))
        );
        const snapshots = await getDocs(q);
        const dataArr = await Promise.all(
            snapshots.docs.map(async(v) => {
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
        settotalFeed(state => dataArr2);
        setfeedLoading(false)
    }
    useEffect(function(){   // 피드 로딩
        getPosts()
    },[addPost])
    
    // 게시물 이미지 슬라이드 //
    useEffect(function(){
        const lists = document.querySelectorAll(".h_f_list");
        lists.forEach((v,i) => {
            let n=0;
            v.querySelector(".h_f_c_image_right").addEventListener('click',function(){
                const slide = v.querySelector(".h_f_c_image_slide");
                const len = v.querySelectorAll(".h_f_c_image_unit").length
                if(n < len-1){
                    n++;
                    slide.style.transform = `translateX(-${n * slide.offsetWidth / len}px)`
                }
            })
            v.querySelector(".h_f_c_image_left").addEventListener('click',function(){
                const slide = v.querySelector(".h_f_c_image_slide");
                const len = v.querySelectorAll(".h_f_c_image_unit").length
                if(n > 0){
                    n--;
                    slide.style.transform = `translateX(-${n * slide.offsetWidth / len}px)`
                }
            })
        })
    },[totalFeed])

    const setPost = function(e){
        e.preventDefault();
        const q = e.target;
        const formdata = new FormData(q);
        const data = Object.fromEntries(formdata.entries());
        const posting = {
            comment : [],
            group : data.group,
            like: [],
            media: selectImage,
            text: data.text,
            time : serverTimestamp(),
            uid : useAuth.currentUser.uid
        }
        addDoc(collection(useFirestore,'posts'),posting)
        .then(() => {
            showGroup.current.value = ''
            selectGroup.current.value = ''
            textArea.current.value = ''
            setselectImage(state => [])
            setaddPost(state => posting)
        })
    }
   
    // 이미지 업로드 //
    const [selectImage, setselectImage] = useState([]);
    const postImage = async function(event){
        if(selectImage.length <5){
            const loader = event.target.files[0];
            if(loader){
                const reader = new FileReader();
                reader.readAsDataURL(loader);
                reader.onload = function(val){
                    setselectImage(state => ([...state, val.target.result]))
                }
            }
        }
    }
    let fileInput = useRef()
    const clickToImage = function(event){
        event.preventDefault();
        fileInput.click();
    }
    const deleteImage = function(idx){
        setselectImage(state => state.filter((v,i) => i !== idx))
    }

    // textarea focus //
    const textareaFocus = function(e){
        const q = e.target.parentElement;
        q.style.outline = '2px solid black'
    }
    const textareaBlur = function(e){
        const q = e.target.parentElement;
        q.style.outline = 'none'
    }

    // comment //
    const setComment = function(event){
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

    }


    // return =====================================================//
    if(feedLoading){
        return(
            <div id="home">
                <div className="loadingPage">
                    <h1>Loading.....</h1>
                </div>
            </div>
        )
    } else {
        return(
            <div id="home">
                <div className="homeBox">
                    <div className="h_category">
                        <ul>
                            <li></li>
                        </ul>
                    </div>
                    <div className="h_new">
                        <form onSubmit={(e) => setPost(e)}>
                            <div>
                                <input ref={showGroup} type="text" readOnly={true} placeholder='그룹 선택'/>
                                <input ref={selectGroup} type="hidden" name='group'/>
                                <ul>
                                    <li onClick={(e) => {selectGroup.current.value = ""; showGroup.current.value = "그룹 없음"}}>그룹 없음</li>
                                    {Object.entries(store.getState().setCurrentUser.group).map(v => 
                                        <li key={v[0]} onClick={(e) => {selectGroup.current.value = v[0]; showGroup.current.value = v[1]}}>{v[1]}</li>
                                    )}
                                </ul>
                            </div>
                            <div className='h_new_content'>
                                <textarea ref={textArea} name="text" id="" maxLength="200" onFocus={(e)=>textareaFocus(e)} onBlur={(e)=>textareaBlur(e)}></textarea>
                                <div className='h_new_c_imageBox'>
                                    {selectImage.map((v,i) => (
                                        <div className="h_new_c_image" key={`selectImage_${i}`}>
                                            <button onClick={(e)=>{e.preventDefault();deleteImage(i)}}>이미지 삭제</button>
                                            <img src={v}/>
                                        </div>
                                    ))}
                                    <input ref={input => fileInput = input} type="file" hidden={true} accept='image/*' onChange={(e) => postImage(e)}/>
                                </div>
                                <div className="h_new_content_btn">
                                    <button type='button' onClick={(e) => clickToImage(e)}>사진 업로드</button>
                                </div>
                            </div>
                            <div className="h_new_btn">
                                <button type='submit' className='h_new_submit'>게시</button>
                                <button type='button' className='h_new_cancel'>취소</button>
                            </div>
                        </form>
                    </div>
                    <div className="h_feed">
                        <ul>
                            {!totalFeed.length? (
                                <div>텅텅.....</div>
                            ): (
                                totalFeed.map((v,i) => (
                                    <li className='h_f_list' key={v['user_id'] + "_" + i}>
                                        <div className="h_f_content">
                                            <div className="h_f_c_account">
                                                    <div className="h_f_c_acc_avatar">
                                                        <img src={v['user_photo']}/>
                                                    </div>
                                                    <div className="h_f_c_acc_name">
                                                        <strong>{v['user_name']}</strong><br />
                                                        <span>@{v['user_id']}</span>
                                                    </div>
                                                <div className="h_f_c_acc_sub">
                                                    <span>{`${v.time.year}년 ${v.time.month}월 ${v.time.date}일 ${v.time.hour}시 ${v.time.minute}분`}</span>
                                                    <div>
                                                        <button type='button'>옵션</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h_f_c_text">{v.text}</div>
                                            <div className="h_f_c_image">
                                                <div className="h_f_c_image_slide">
                                                    {v.media.map((v,i) => ( 
                                                        <div key={i} className="h_f_c_image_unit">
                                                            <img src={v}/> 
                                                        </div>))}
                                                </div>
                                                <button type='button' className="h_f_c_image_left">왼쪽으로 이동</button>
                                                <button type='button' className="h_f_c_image_right">오른쪽으로 이동</button>
        
                                            </div>
                                        </div>
                                        <div className="h_f_comment">
                                            <div className="h_f_com_like">
                                                <div>
                                                    <button type='button'>likes</button>
                                                    <span>{v.like}</span>
                                                </div>
                                                <div>
                                                    <button type='button'>send</button>
                                                </div>
                                            </div>
                                            <div className="h_f_com_lists">
                                                <ul>
                                                    { !v.comment.length? (
                                                        <li>댓글이 없습니다</li>
                                                    ): (
                                                        v.comment.map((val,idx) => {return(
                                                            <li className="h_f_com_unit" key={"comment_"+idx}>
                                                                <div className="h_f_com_u_account">
                                                                    <div className="h_f_com_u_avatar" onClick={(e) => navigate(`/account/${val.uid}`)}>
                                                                        <img src={v.userInfo.find(v => v.uid === val.uid).photoURL} />
                                                                    </div>
                                                                    <div className="h_f_com_u_name">@{v.userInfo.find(v => v.uid === val.uid).id}</div>
                                                                    <div className="h_f_com_u_time">{v.time.seconds}</div>
                                                                </div>
                                                                <div className="h_f_com_u_text">{v.text}</div>
                                                            </li>
                                                        )})
                                                    )

                                                    }
                                                </ul>
                                            </div>
                                            <div className="h_f_com_input">
                                                <div>
                                                    <input type="text" />
                                                    <button>submit</button>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

}