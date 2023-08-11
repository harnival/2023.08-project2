
import { useAuth } from "../datasource/firebase";
import { Timestamp, updateDoc, doc, query, collection, where, getDocs, deleteDoc,arrayUnion } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useFirestore } from "../datasource/firebase";
import { useRef, useState, useEffect } from "react";
import '../css/post.css'
export default function PostComponent({v}){
    const postID = v[0];
    const postData = v[1]

    const navigate = useNavigate();
    const [clickOpenOption, setclickOpenOption] = useState(false)

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


    // ===========================================================================
    return(
        <li className='h_f_list'>
            <div className="h_f_content">
                {!!postData.group.title && (
                    <div className="h_f_c_group">
                        <div className="h_f_c_g_image">
                            <img src={postData.group.photoURL} />
                        </div>
                        <div className="h_f_c_g_title">
                            <span># {postData.group.title}</span>
                        </div>
                    </div>
                ) }
                <div className="h_f_c_account">
                        <div className="h_f_c_acc_avatar" onClick={() => navigate(`/account/${postData.uid}`)}>
                            <img src={postData['user_photo']}/>
                        </div>
                        <div className="h_f_c_acc_name" onClick={() => navigate(`/account/${postData.uid}`)}>
                            <strong>{postData['user_name']}</strong><br />
                            <span>@{postData['user_id']}</span>
                        </div>
                    <div className="h_f_c_acc_sub">
                        <span>{`${postData.time.year}년 ${postData.time.month}월 ${postData.time.date}일 ${postData.time.hour}시 ${postData.time.minute}분`}</span>
                        <div>
                            <button  type='button' className="h_f_c_acc_optionBtn" onClick={(e) => setclickOpenOption(state => !state)}>옵션</button>
                            {clickOpenOption && (
                                <div className="h_f_c_acc_sub_options">
                                {v[1].uid === useAuth.currentUser.uid ? (
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
                    <div className="h_f_c_image">
                        <div className="h_f_c_image_slide" ref={imageSlide}>
                            {postData.media.map((v,i) => ( 
                                <div key={i} className="h_f_c_image_unit">
                                    <img src={v}/> 
                                </div>))
                            }
                        </div>
                        <button ref={imageLeft} type='button' className="h_f_c_image_left" >왼쪽으로 이동</button>
                        <button ref={imageRight} type='button' className="h_f_c_image_right">오른쪽으로 이동</button>
                    </div>
                )}
            </div>
            <div className="h_f_comment">
                <div className="h_f_com_like">
                    <div>
                        <button type='button' className="h_f_com_like_like">likes</button>
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