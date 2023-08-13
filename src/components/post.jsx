
import { useAuth } from "../datasource/firebase";
import { Timestamp, updateDoc, doc, query, collection, where, getDocs, deleteDoc,arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useFirestore } from "../datasource/firebase";
import { useRef, useState, useEffect, memo } from "react";

import '../css/post.css'

export default function PostComponent({postData ,postID}){

    const commentData = postData.comment;
    const likeData = postData.like;
    const commentUser = postData.userInfo;
    const otherData = {
        ...postData,
        comment : null,
        like : null,
        userInfo : null
    }
    const invertTime = function(value){
        const time = value * 1000;
        const timeObj = {
            year : new Date(time).getFullYear(),
            month : new Date(time).getMonth() +1,
            date : new Date(time).getDate(),
            hour : new Date(time).getHours() <10? "0"+new Date(time).getHours() : new Date(time).getHours(),
            minute : new Date(time).getMinutes() <10? "0"+new Date(time).getMinutes() : new Date(time).getMinutes(),
        }
        return  `${timeObj.year}년 ${timeObj.month}월 ${timeObj.date}일 ${timeObj.hour}시 ${timeObj.minute}분`
    }
    const [likeText, setlikeText] = useState('')
    useEffect(function(){       // 좋아요 상태에 따른 문구 설정
        async function getFirstLike(){
            if(likeData && !!likeData.length){
                const getID = await getDoc(doc(useFirestore,'account',likeData[0]))
                const getUser = getID.data().general.id;
                if(likeData.length === 1){
                    setlikeText(state => `@${getUser} 님이 좋아합니다.`)
                } else if( likeData.length > 1) {
                    setlikeText(state => `@${getUser}님 외 ${likeData.length-1}명이 좋아합니다.`)
                }
            } else if (likeData.length === 0){
                setlikeText(state => '0')
            }
        }
        getFirstLike()
    },[likeData])
   

    const navigate = useNavigate();
    const [clickOpenOption, setclickOpenOption] = useState(false)

    let commentUnit = useRef()
    const setComment = function(event, postID){ // 댓글 등록
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        if(!!data.text.search(/\w/g)){
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

   
   
    const checkLike = function(){       // 좋아요 클릭 시 반응
        const likeDB = doc(useFirestore,'posts', postID);
        const me = useAuth.currentUser.uid;
        if(likeData.includes(me)){
            updateDoc(likeDB,{
                like : arrayRemove(me)
            })
        } else {
            updateDoc(likeDB,{
                like : arrayUnion(me)
            })
        }
    }
    
    const contentHeight = useRef();
    const commentHeight = useRef();
    useEffect(function(){
        if(contentHeight.current && commentHeight.current){
            const  hei1 = contentHeight.current.offsetHeight;
            const  hei2 = commentHeight.current.offsetHeight;
            if( hei1 > hei2){
                commentHeight.current.style.height = `${hei1}px`
            } else if(hei1 < hei2) {
                contentHeight.current.style.height = `${hei2}px`
            }
        }
    },[commentData])

    const textareaHeight = function(e){
        const q = e.target;
        q.style.height = '1px'
        q.style.height = `${q.scrollHeight}px`
    }

    // =============================================

    function Content({postData}){
        const imageRight = useRef()
        const imageLeft = useRef()
        const imageSlide = useRef()
        useEffect(function(){   // 게시물 이미지 슬라이드 //
            if(postData.media.length !== 0){
                let n=0;
               imageRight.current.addEventListener('click',function(){
                    const wid = imageSlide.current.offsetWidth;
                    const len = postData.media.length
                    if(n < len-1){
                        n++;
                        imageSlide.current.style.transform = `translateX(-${n * wid / len}px)`
                    }
                })
                imageLeft.current.addEventListener('click',function(){
                    const wid = imageSlide.current.offsetWidth;
                    const len = postData.media.length
                    if(n > 0){
                        n--;
                        imageSlide.current.style.transform = `translateX(-${n * wid / len}px)`
                    }
                })
            }
        },[])
        return(
            <div className="h_f_content" ref={contentHeight}>
            <div className="h_f_c_account">
                    <div className="h_f_c_acc_avatar" onClick={() => navigate(`/account/${postData.uid}`)}>
                        <img src={postData['user_photo']}/>
                    </div>
                    <div className="h_f_c_acc_name" onClick={() => navigate(`/account/${postData.uid}`)}>
                        <strong>{postData['user_name']}</strong><br />
                        <span>@{postData['user_id']}</span>
                    </div>
                <div className="h_f_c_acc_sub">
                    <span>{invertTime(postData.time)}</span>
                    <div>
                        <button  type='button' className="h_f_c_acc_optionBtn" onClick={(e) => setclickOpenOption(state => !state)}>옵션</button>
                        {clickOpenOption && (
                            <div className="h_f_c_acc_sub_options">
                            {postData.uid === useAuth.currentUser.uid ? (
                                    <button onClick={(e) => deletePost(postID)}>삭제</button>
                            ) : (
                                <>
                                    <a href="/#" onClick={(e) => e.preventDefault()}>신고</a>
                                    <a href="/#" onClick={(e) => e.preventDefault()}>차단</a>
                                </>
                            )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="h_f_c_text">{postData.text}</div>
            { postData.media.length !== 0 && (
                <div className="h_f_c_image" >
                    <div className="h_f_c_image_slide" ref={imageSlide}>
                        {postData.media.map((v,i) => ( 
                            <div key={i} className="h_f_c_image_unit">
                                <img src={v}/> 
                            </div>))
                        }
                    </div>
                    <button ref={imageLeft} type='button' className="h_f_c_image_left" ><img src="/img/icons/arrow_back.png" />왼쪽으로 이동</button>
                    <button ref={imageRight} type='button' className="h_f_c_image_right"><img src="/img/icons/arrow_forward.png" />오른쪽으로 이동</button>
                </div>
            )}
            </div>
        )
    }
    const ContentComponent = memo(v => Content(v))
    // ===========================================================================
    return(
        <li className='h_f_list'>
        {!!postData.group.title && (
            <div className="h_f_c_groupWrap">
                <div className="h_f_c_group">
                    <div className="h_f_c_g_image">
                        <img src={postData.group.photoURL} />
                    </div>
                    <div className="h_f_c_g_title">
                        <span># {postData.group.title}</span>
                    </div>
                </div>
            </div>
        ) }
        <div className="h_f_list_box">
            <ContentComponent  postData={otherData}/>
            <div className="h_f_comment" ref={commentHeight}>
            <div className="h_f_commentBox">
                <div className="h_f_com_lists">
                    <ul>
                        { !commentData.length? (
                            <li className="no_reply">댓글이 없습니다.</li>
                        ): (
                            commentData.map((val,idx) => {return(
                                <li className="h_f_com_unit" key={"comment_"+idx}>
                                    <div className="h_f_com_u_account">
                                        <div className="h_f_com_u_avatar" onClick={(e) => navigate(`/account/${val.uid}`)}>
                                            <img src={commentUser.find(v => v.uid === val.uid).photoURL} />
                                        </div>
                                        <div className="h_f_com_u_name">@{commentUser.find(v => v.uid === val.uid).id}</div>
                                        <div className="h_f_com_u_time">{invertTime(val.time)}</div>
                                    </div>
                                    <div className="h_f_com_u_text">{val.text}</div>
                                </li>
                            )})
                        )

                        }
                    </ul>
                </div>
                <div className="h_f_com_like">
                    <div className="h_f_com_like_likeWrap">
                        <button onClick={() => checkLike()} type='button' className={`h_f_com_like_like ` + (likeData.includes(useAuth.currentUser.uid) && `likeChecked`)}>likes</button>
                        <p>{likeData && likeText}</p>
                    </div>
                    <div className="h_f_com_like_sendWrap">
                        <button type='button'>send</button>
                    </div>
                </div>
                <div className="h_f_com_input">
                    <form onSubmit={(e)=> setComment(e, postID)}>
                        <textarea name="text" maxLength={120} onInput={(e) => textareaHeight(e)} placeholder="답글을 입력하세요."></textarea>
                        {/* <input type="text" name='text'/> */}
                        <button>답글</button>
                    </form>
                </div>
            </div>
            </div>
        </div>
    </li>
        
    )
}