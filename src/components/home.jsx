import { collection, addDoc, serverTimestamp, getDoc, doc, query, where, or, getDocs, Timestamp, updateDoc, arrayUnion, onSnapshot, deleteDoc } from 'firebase/firestore';
import '../css/home.css'
import store from '../store/store';
import {useEffect, useMemo, useRef, useState, memo} from 'react';
import { useAuth, useFirestore } from '../datasource/firebase';
import { useNavigate } from 'react-router-dom';

import PostComponent from './post';

export default function Home(){
    const navigate = useNavigate();

    const selectGroup = useRef();
    const showGroup = useRef();
    const textArea = useRef()

    const [feedLoading, setfeedLoading] = useState(true)
    const [modal, setmodal] = useState()

    const [postIds, setpostIds] = useState([]);
    const [postFeed, setpostFeed] = useState({});
    const [selectImage, setselectImage] = useState([]);


    // useEffect(function(){   // 게시물 데이터베이스에 호출
    //     const myGroup = Object.keys(store.getState().setCurrentUser.group)
    //     const myFollower = store.getState().setCurrentUser.follower;        
    //         myFollower.push(useAuth.currentUser.uid);
    //     const q = !myGroup.length ? (
    //         query(collection(useFirestore,'posts'),where('uid', 'in', myFollower))
    //         ) : (
    //         query(collection(useFirestore,'posts'),or(
    //             where('group','in', myGroup),
    //             where('uid', 'in',myFollower)
    //         ))
    //     );

    //     const unsub = onSnapshot(q, (snapshotDoc) => {
    //         const docArr = snapshotDoc.docs;
    //         const docArr2 = [...docArr.map(v => v.id)]
    //         setpostIds(state => docArr2)
    //     })
    //     return () => unsub();
    // },[])
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

        const unsub = onSnapshot(q, async(snapshotDoc) => {
            const docArr = snapshotDoc.docs;
            const myBlock =  store.getState().setCurrentUser.block;
            const docArr1 = docArr.filter(v => !myBlock.includes(v.data().uid))
            const docArr2 = await Promise.all(docArr1.map(async(v) => {
                const postData = v.data()
                const userDb = await getDoc(doc(useFirestore,'account',postData.uid))
                const data2 = userDb.data();
                
                // 댓글 정보
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
                    user_name : data2.name, 
                    user_id : data2.id , 
                    user_photo : data2.photoURL, 
                    userInfo : commentUserArr, 
                    postID : v.id,
                    group : {...groupObj}
                };
                return [v.id, dataObj]
            }))
            setpostFeed(state => docArr2)
            setfeedLoading(false)
        })
        return () => unsub();
    },[])

    // useEffect(function(){   // 피드 게시물 로딩
    //     if( !postIds.length ){
    //         setfeedLoading(false)
    //     } else {
    //         postIds.forEach((v,i) => {
    //             const db = doc(useFirestore,'posts', v)
    //             const unsub = onSnapshot(db, async(postDoc) => {
    //                 const postData = postDoc.data();
    //                 const myBlock = store.getState().setCurrentUser.block;
    
    //                 if(!myBlock.some(v => v === postData.uid)){
    //                     // 작성자 정보
    //                     const userDb = await getDoc(doc(useFirestore,'account',postData.uid))
    //                     const data2 = userDb.data();
                        
    //                     // 댓글 정보
    //                     let commentUserArr = [];
    //                     if(postData.comment.length !== 0){
    //                         const comments = postData.comment.map(v => v.uid);
    //                         const commentUser = [...new Set(comments)]
    //                         const userData1 = await Promise.all(
    //                             commentUser.map(async(v) => {
    //                                 const get1 = await getDoc(doc(useFirestore,'account',v));
    //                                 const get2 = get1.data();
    //                                 return({
    //                                     uid : v,
    //                                     name : get2.name,
    //                                     id : get2.id,
    //                                     photoURL : get2.photoURL
    //                                 })
    //                             })
    //                         )
    //                         commentUserArr = [...userData1];
    //                     }
    //                     // 게시글 그룹 정보
    //                     let groupObj = {}
    //                     const group = postData.group;
    //                     if(group){
    //                         const groupInfo = await getDoc(doc(useFirestore,'groups',group))
    //                         const groupData = groupInfo.data()
    //                             groupObj.title = groupData.title;
    //                             groupObj.photoURL = groupData.photoURL;
    //                             groupObj.id = group
    //                     }
    //                     // 이미지 배열 정리
    //                     const mediaArr = Object.entries({...postData}).filter(v => v[0].split('_')[0] === 'media')
    //                     const mediaArr2 = mediaArr.map(v => v[1]);

    //                     const dataObj = {...postData,
    //                         media : [...mediaArr2],
    //                         user_name : data2.name, 
    //                         user_id : data2.id , 
    //                         user_photo : data2.photoURL, 
    //                         // time : timeObj, 
    //                         userInfo : commentUserArr, 
    //                         postID : postDoc.id,
    //                         group : {...groupObj}
    //                     };
    //                     setpostFeed(state => ({...state, [postDoc.id] : dataObj}))
    //                     setfeedLoading(false)
    //                 }
    //             })
    //         })
    //     }

    // },[postIds])

   

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
            text: data.text,
            time : Timestamp.now().seconds,
            uid : useAuth.currentUser.uid
        }
        if(selectImage.length > 0){
            await Promise.all(
                selectImage.map((v,i) => {
                    posting[`media_${i}`] = v
                })
            )
        }
        addDoc(collection(useFirestore,'posts'),posting)
        .then(() => {
            textArea.current.value = ''
            setselectImage(state => [])
        })        
    }


    // 이미지 업로드 //
    const postImage = async function(event){
        if(selectImage.length <5){
                const loader = event.target.files[0];
                const size = loader.size;
                const limit = 1048487;
                if(loader){
                    if( size < limit){
                        const reader = new FileReader();
                        reader.readAsDataURL(loader);
                        reader.onload = function(val){
                            setselectImage(state => ([...state, val.target.result]))
                        }
                    } else {
                        event.target.value = '';
                        alert(" 1MB 이하 이미지 파일만 등록이 가능합니다.")
                        return false;
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


    const blockUser = function(userID){ // 유저 차단 //
        const db = doc(useFirestore,'account',useAuth.currentUser.uid);
        updateDoc(db,{
            block : arrayUnion(userID)
        })
    }
    // const contentHeight = useRef();
    // const commentHeight = useRef();
    // useEffect(function(){
    //     if(contentHeight.current && commentHeight.current){
    //         const  hei1 = contentHeight.current.offsetHeight;
    //         const  hei2 = commentHeight.current.offsetHeight;
    //         if( hei1 > hei2){
    //             commentHeight.current.style.height = `${hei1}px`
    //         } else if(hei1 < hei2) {
    //             contentHeight.current.style.height = `${hei2}px`
    //         }
    //     }
    // },[])
   
// components ================================================= //
   

    const HomeUnitPostComponent = memo(PostComponent)
   
    
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
                                {/* <input ref={showGroup} type="text" readOnly={true} placeholder='그룹 선택'/>
                                <input ref={selectGroup} type="hidden" name='group'/> */}
                                {store.getState().setCurrentUser.group == {}? (
                                    <ul>
                                        <li
                                        // onClick={(e) => {selectGroup.current.value = ""; showGroup.current.value = "그룹 없음"}}
                                        >
                                            <input type="radio" name="group" value=""  id="radio_default" hidden={true} checked={true}/>
                                            <label htmlFor="radio_default">그룹 없음</label>
                                        </li>
                                    </ul>
                                ):(
                                    <ul>
                                        <li
                                        // onClick={(e) => {selectGroup.current.value = ""; showGroup.current.value = "그룹 없음"}}
                                        >
                                            <input type="radio" name="group" value=""  id="radio_default" hidden={false} defaultChecked={true}/>
                                            <label htmlFor="radio_default">그룹 없음</label>
                                        </li>
                                        {Object.entries(store.getState().setCurrentUser.group).map(v => 
                                            <li key={v[0]}
                                            // onClick={(e) => {selectGroup.current.value = v[0]; showGroup.current.value = v[1]}}
                                            >
                                                <input type="radio" name="group" value={v[0]} id={`radio_${v[0]}`} hidden={false} />
                                                <label htmlFor={`radio_${v[0]}`}>{v[1]}</label>
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>
                            <div className='h_new_content'>
                                <textarea ref={textArea} name="text" id="" maxLength="200" onFocus={(e)=>textareaFocus(e)} onBlur={(e)=>textareaBlur(e)} placeholder='오늘의 소식을 알리세요.'></textarea>
                                <div className='h_new_c_imageBox'>
                                    {selectImage.map((v,i) => (
                                        <div className="h_new_c_image" key={`selectImage_${i}`}>
                                            <button onClick={(e)=>{e.preventDefault();deleteImage(i)}}>이미지 삭제</button>
                                            <img src={v}/>
                                        </div>
                                    ))}
                                    <input ref={input => fileInput = input} type="file" hidden={true} accept='image/*' onChange={(e) => postImage(e)}/>
                                </div>
                            </div>
                            <div className="h_new_btn">
                                <div className="h_new_content_btn">
                                    <button type='button' onClick={(e) => clickToImage(e)}>사진 업로드</button>
                                </div>
                                <div>
                                    <button type='submit' className='h_new_submit'>게시</button>
                                    <button type='button' className='h_new_cancel'>취소</button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="h_feed">
                        <ul>
                            {/* {!Object.entries(postFeed).length? ( */}
                            {!postFeed.length? (
                                <div className='home_empty'>첫 소식을 업데이트 해보세요!</div>
                            ) : (
                                // Object.entries(postFeed).sort((a,b) => a[1].time - b[1].time).reverse().map((v,i) => {
                                postFeed.sort((a,b) => a[1].time - b[1].time).reverse().map((v,i) => {
                                    return(   
                                        < HomeUnitPostComponent postData={v[1]} postID={v[0]} key={`post_${v[0]}`}/>
                                )})
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

}