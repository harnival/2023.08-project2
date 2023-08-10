import { collection, addDoc, serverTimestamp, getDoc, doc, query, where, or, getDocs, Timestamp, updateDoc, arrayUnion, onSnapshot, deleteDoc } from 'firebase/firestore';
import '../css/home.css'
import store from '../store/store';
import {useEffect, useMemo, useRef, useState, memo} from 'react';
import { useAuth, useFirestore } from '../datasource/firebase';
import { useNavigate } from 'react-router-dom';
export default function Home(){
    const navigate = useNavigate();

    const selectGroup = useRef();
    const showGroup = useRef();
    const textArea = useRef()

    const [feedLoading, setfeedLoading] = useState(true)
    const [modal, setmodal] = useState()

    const [postIds, setpostIds] = useState([]);
    const [postFeed, setpostFeed] = useState({});

    useEffect(function(){   // 게시물 데이터베이스에 호출
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

        const unsub = onSnapshot(q, (snapshotDoc) => {
            const docArr = snapshotDoc.docs;
            const docArr2 = [...docArr.map(v => v.id)]
            setpostIds(state => docArr2)
        })
        return () => unsub();
    },[])

    useEffect(function(){   // 피드 게시물 로딩
        console.log("[postID changed]",postIds)
        if( !postIds.length ){
            setfeedLoading(false)
        } else {
            postIds.forEach((v,i) => {
                const db = doc(useFirestore,'posts', v)
                const unsub = onSnapshot(db, async(postDoc) => {
                    const postData = postDoc.data();
                    const myBlock = store.getState().setCurrentUser.block;
    
                    if(!myBlock.some(v => v === postData.uid)){
                        const userDb = await getDoc(doc(useFirestore,'account',postData.uid))
                        const data2 = userDb.data();
        
                        const time = postData.time * 1000;
                        const timeObj = {
                            year : new Date(time).getFullYear(),
                            month : new Date(time).getMonth() +1,
                            date : new Date(time).getDate(),
                            hour : new Date(time).getHours() <10? "0"+new Date(time).getHours() : new Date(time).getHours(),
                            minute : new Date(time).getMinutes() <10? "0"+new Date(time).getMinutes() : new Date(time).getMinutes(),
                        }
        
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
                        const dataObj = {...postData, user_name : data2.general.name, user_id : data2.general.id , user_photo : data2.general.photoURL, time : timeObj, userInfo : commentUserArr, postID : postDoc.id};
                        setpostFeed(state => ({...state, [postDoc.id] : dataObj}))
                        setfeedLoading(false)
                    }
                })
                // return () => unsub()
            })
        }

    },[postIds])

    useEffect(function(){   // 게시물 이미지 슬라이드 //
        console.log("[postFeed changed]",postFeed)
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
    },[postFeed])

// function ============================================================= //
    const setPost = async function(e){  // 게시물 등록 //
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
            time : Timestamp.now().seconds,
            uid : useAuth.currentUser.uid
        }
        addDoc(collection(useFirestore,'posts'),posting)
        .then(() => {
            showGroup.current.value = ''
            selectGroup.current.value = ''
            textArea.current.value = ''
            setselectImage(state => [])
        })
        
    }

    const deletePost = async function(postID){  // 게시물 삭제 //
        const postDB = doc(useFirestore,'posts',postID)
        const likeQuery = query(collection(useFirestore,'account'),where('like','array-contains',postID))

        await getDocs(likeQuery, (snapshot) => {
            snapshot.docs.forEach(v => {
                const userUid = v.id;
                const data = v.data();
                const userDB = doc(useFirestore,'account',userUid);
                updateDoc(userDB,{
                    like : data.like.filter(val => val !== postID)
                })
            })
        })
        await deleteDoc(postDB);

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
    let commentUnit = useRef()
    const setComment = function(event, postID){
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

    const blockUser = function(userID){ // 유저 차단 //
        const db = doc(useFirestore,'account',useAuth.currentUser.uid);
        updateDoc(db,{
            block : arrayUnion(userID)
        })
    }
// components ================================================= //
    const PostComponent = memo(({v}) => {
        const postID = v[0];
        const postData = v[1]
        return(
            <li className='h_f_list'>
                <div className="h_f_content">
                    <div className="h_f_c_account">
                            <div className="h_f_c_acc_avatar">
                                <img src={postData['user_photo']}/>
                            </div>
                            <div className="h_f_c_acc_name">
                                <strong>{postData['user_name']}</strong><br />
                                <span>@{postData['user_id']}</span>
                            </div>
                        <div className="h_f_c_acc_sub">
                            <span>{`${postData.time.year}년 ${postData.time.month}월 ${postData.time.date}일 ${postData.time.hour}시 ${postData.time.minute}분`}</span>
                            <div>
                                <button type='button'>옵션</button>
                                {v[1].uid === useAuth.currentUser.uid ? (
                                    <div className="h_f_c_acc_sub_options">
                                        <a href="/#" onClick={(e) => {e.preventDefault(); deletePost(postID)}}>삭제</a>
                                    </div>
                                ) : (
                                    <div className="h_f_c_acc_sub_options">
                                        <a href="/#" onClick={(e) => e.preventDefault()}>신고</a>
                                        <a href="/#" onClick={(e) => e.preventDefault()}>차단</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="h_f_c_text">{postData.text}</div>
                    <div className="h_f_c_image">
                        <div className="h_f_c_image_slide">
                            {postData.media.map((v,i) => ( 
                                <div key={i} className="h_f_c_image_unit">
                                    <img src={v}/> 
                                </div>))
                            }
                        </div>
                        <button type='button' className="h_f_c_image_left">왼쪽으로 이동</button>
                        <button type='button' className="h_f_c_image_right">오른쪽으로 이동</button>

                    </div>
                </div>
                <div className="h_f_comment">
                    <div className="h_f_com_like">
                        <div>
                            <button type='button'>likes</button>
                            <span>{postData.like}</span>
                        </div>
                        <div>
                            <button type='button'>send</button>
                        </div>
                    </div>
                    <div className="h_f_com_lists">
                        <ul>
                            { !postData.comment.length? (
                                <li>댓글이 없습니다</li>
                            ): (
                                postData.comment.map((val,idx) => {return(
                                    <li className="h_f_com_unit" key={"comment_"+idx}>
                                        <div className="h_f_com_u_account">
                                            <div className="h_f_com_u_avatar" onClick={(e) => navigate(`/account/${val.uid}`)}>
                                                <img src={postData.userInfo.find(v => v.uid === val.uid).photoURL} />
                                            </div>
                                            <div className="h_f_com_u_name">@{postData.userInfo.find(v => v.uid === val.uid).id}</div>
                                            <div className="h_f_com_u_time">{postData.time.seconds}</div>
                                        </div>
                                        <div className="h_f_com_u_text">{val.text}</div>
                                    </li>
                                )})
                            )

                            }
                        </ul>
                    </div>
                    <div className="h_f_com_input">
                        <form onSubmit={(e)=> setComment(e, postID)}>
                            <input type="text" name='text'/>
                            <button>submit</button>
                        </form>
                    </div>
                </div>
            </li>
        )
    }
    )

    const DetailComponent = function({postID}){
        return(
            <div className="h_postDetail">

            </div>
        )
    }
    
    const ReportComponent = function(){
        const close = function(e){
            e.preventDefault();
            setmodal(state => null)
        }
        const submitReport = function(){

        }
        return(
            <div className="h_report">
                <form>
                    <div className="h_r_select">
                        <div className="h_r_s_title"><span>신고 유형</span></div>
                        <ul className="h_r_s_inputBox">
                            <li>
                                <input type="radio" name="type" id="report1" className='h_r_s_input'/>
                                <label htmlFor="report1">가학적, 폭력적인 컨텐츠</label>
                            </li>
                            <li>
                                <input type="radio" name="type" id="report2" className='h_r_s_input'/>
                                <label htmlFor="report2">선정적인 컨텐츠</label>
                            </li>
                            <li>
                                <input type="radio" name="type" id="report3" className='h_r_s_input'/>
                                <label htmlFor="report3">타인을 사칭 및 비방, 괴롭힘 목적</label>
                            </li>
                            <li>
                                <input type="radio" name="type" id="report4" className='h_r_s_input'/>
                                <label htmlFor="report4">잘못된 정보, 가짜 뉴스로 혼란이 예상되는 컨텐츠</label>
                            </li>
                        </ul>
                    </div>
                    <div className="h_r_text">
                        <textarea name="text" id="" maxLength={100} placeholder='추가 신고 내용 입력 (100자 이내)'></textarea>
                    </div>
                    <div className="h_r_btn">
                        <button>제출</button>
                        <button type='button'>닫기</button>
                    </div>
                </form>
            </div>
        )
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
                            <div className='h_new_group'>
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
                            {!Object.entries(postFeed).length? (
                                <div>텅텅.....</div>
                            ) : (
                                Object.entries(postFeed).sort((a,b) => a[1].time.seconds - b[1].time.seconds).reverse().map((v,i) => (   
                                <PostComponent v={v} key={v[0]}/>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

}