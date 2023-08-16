import { getDoc, onSnapshot, doc, query, collection, deleteDoc, getDocs, where, addDoc, updateDoc, arrayUnion, Timestamp, arrayRemove } from 'firebase/firestore';
import '../css/account.css'
import '../css/account_1023.css'
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useAuth, useFirestore, userLogout } from '../datasource/firebase';
import { useParams, useNavigate } from 'react-router-dom';
import store from '../store/store';


export default function Account(props){

    const navigate = useNavigate();
    let {userID} = useParams();
    const [userInfo, setuserInfo] = useState({
        name : null,
        photoURL : null,
        id : null,
        uid : userID,
        follower: []
    })
    const [openUserMenu, setopenUserMenu] = useState(false) // 유저 메뉴 온오프
    const [userPage, setuserPage] = useState(0)     // 유저 페이지 - 0 : 피드 , 1 : 그룹 , 2 : 좋아요
    const [callPost, setcallPost] = useState([])    // 게시물 불러오기
    const [groupList, setgroupList] = useState([])  // 그룹 리스트 불러오기
    const [likePost, setlikePost] = useState([])    // 좋아요 누른 게시물 불러오기

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
                    name : data.name,
                    photoURL : data.photoURL? data.photoURL : null,
                    id : data.id,
                    uid : userID,
                    group : data.group,
                    like : data.like,
                    follower: data.follower
                }))
            } else {
                console.log("ddddddd")
            }
        })
    },[userID])


    const loadPost =async function(v,postData){
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
                        user_name : userInfo.name, 
                        user_id : userInfo.id , 
                        user_photo : userInfo.photoURL, 
                        userInfo : commentUserArr, 
                        postID : v.id,
                        group : {...groupObj}
                    };
                    return ([v.id, dataObj]);
    }

    useEffect(function(){   // 게시물 로드
        const q = query(collection(useFirestore,'posts'),where('uid','==',userID));
        const data1 = onSnapshot(q, async(snapshotDoc) => {
            const dataArr = await Promise.all(
                snapshotDoc.docs.map(async(v) => {
                    const postData = v.data();
                    return loadPost(v,postData)
                })
            )
            const dataArr2 = [...dataArr].sort((a,b) => a[1].time - b[1].time)
            setcallPost(state => [...dataArr2])
        })
        return () => data1()
    },[userInfo])

    useEffect(function(){   // 그룹 정보 로드
        async function groupLoad(){
            const groups = userInfo.group;
            const maps = await Promise.all(Object.keys(groups).map(async(v) => {
                const groupDB = doc(useFirestore,'groups',v);
                const groupData = await getDoc(groupDB);
                const groupData2 = groupData.data();
                const groupData3 = [v , {...groupData2}];
                return groupData3
            }))
            setgroupList(state => [...maps])
        }
        if(userInfo.group){
            groupLoad()
        }
    },[userInfo])
    useEffect(function(){   // 좋아요 누른 게시물 불러오기
        const db = collection(useFirestore, 'posts')
        const likeQuery = query(db, where('like','array-contains',userID))        
        const queryFunc = async function(){
            const data1 = await getDocs(likeQuery);
            const data2 = data1.docs;
            const data3 = await Promise.all(
                data2.map(async(v) => {
                    const postData = v.data();

                    const uid = v.data().uid;
                    const userdb = doc(useFirestore,'account',uid);
                    const user1 = await getDoc(userdb)
                    const user2 = user1.data();
                    console.log(user2)


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
                        user_name : user2.name, 
                        user_id : user2.id , 
                        user_photo : user2.photoURL, 
                        userInfo : commentUserArr, 
                        postID : v.id,
                        group : {...groupObj}
                    };
                    return ([v.id, dataObj]);
                })
            )
            setlikePost(state => data3);
        }
        queryFunc();

    },[userID])

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

    const timeInvert = function(value){
        const time = value * 1000;
        const timeObj = {
            year : new Date(time).getFullYear(),
            month : new Date(time).getMonth() +1,
            date : new Date(time).getDate(),
            hour : new Date(time).getHours() <10? "0"+new Date(time).getHours() : new Date(time).getHours(),
            minute : new Date(time).getMinutes() <10? "0"+new Date(time).getMinutes() : new Date(time).getMinutes(),
        }
        return `${timeObj.year}/${timeObj.month}/${timeObj.date} ${timeObj.hour}:${timeObj.minute}`
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
    const followUser = function(user){
        const db = doc(useFirestore,'account',user);
        updateDoc(db, {
            follower : arrayUnion(useAuth.currentUser.uid)
        })
    }
    const cancelFollowUser = function(user){
        const db = doc(useFirestore,'account',user);
        updateDoc(db, {
            follower : arrayRemove(useAuth.currentUser.uid)
        })
    }
//  components ============================================================== //
    const PostComponent = memo(function({data, idx}){
        const postID = data[0];
        const v = data[1]
        const i = idx;

        const [clickOpenOption, setclickOpenOption] = useState(false)
        const checkLike = function(){       // 좋아요 클릭 시 반응
            const likeDB = doc(useFirestore,'posts', postID);
            const me = useAuth.currentUser.uid;
            if(v.like.includes(me)){
                updateDoc(likeDB,{
                    like : arrayRemove(me)
                })
            } else {
                updateDoc(likeDB,{
                    like : arrayUnion(me)
                })
            }
        }
        const [likeText, setlikeText] = useState('')
        useEffect(function(){       // 좋아요 상태에 따른 문구 설정
            async function getFirstLike(){
                if(v.like && !!v.like.length){
                    const getID = await getDoc(doc(useFirestore,'account',v.like[0]))
                    const getUser = getID.data().id;
                    if(v.like.length === 1){
                        setlikeText(state => `@${getUser} 님이 좋아합니다.`)
                    } else if( v.like.length > 1) {
                        setlikeText(state => `@${getUser}님 외 ${v.like.length-1}명이 좋아합니다.`)
                    }
                } else if (v.like.length === 0){
                    setlikeText(state => '0')
                }
            }
            getFirstLike()
        },[v.like])
        const textareaHeight = function(e){
            const q = e.target;
            q.style.height = '1px'
            q.style.height = `${q.scrollHeight}px`
        }
        return(
            <li className='acc_f_list' >
                <div className="acc_f_content">
                    {!!v.group.title && (
                        <div className="acc_f_c_group">
                            <div className="acc_f_c_g_image">
                                <img src={v.group.photoURL} />
                            </div>
                            <div className="acc_f_c_g_title">
                                <span># {v.group.title}</span>
                            </div>
                        </div>
                    ) }
                    <div className="acc_f_c_account">
                            <div className="acc_f_c_acc_avatar">
                                <img src={v['user_photo']}/>
                            </div>
                            <div className="acc_f_c_acc_name">
                                <strong>{v['user_name']}</strong><br />
                                <span>@{v['user_id']}</span>
                            </div>
                        <div className="acc_f_c_acc_sub">
                            <span>{timeInvert(v.time)}</span>
                            <div className='acc_f_c_acc_sub_box'>
                                <button  type='button' className="acc_f_c_acc_optionBtn" onClick={(e) => setclickOpenOption(state => !state)}>옵션</button>
                                {clickOpenOption && (
                                    <div className="acc_f_c_acc_sub_options">
                                    {userID === useAuth.currentUser.uid ? (
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
                    <div className="acc_f_c_text">{v.text}</div>
                    {!!v.media.length? (
                        <div className="acc_f_c_image">
                            <div className="acc_f_c_image_slide">
                                {v.media.map((v,i) => ( 
                                    <div key={i} className="acc_f_c_image_unit">
                                        <img src={v}/> 
                                    </div>))}
                            </div>
                            <button type='button' className="acc_f_c_image_left"><img src="/img/icons/arrow_back.png" />왼쪽으로 이동</button>
                            <button type='button' className="acc_f_c_image_right"><img src="/img/icons/arrow_forward.png" />오른쪽으로 이동</button>

                        </div>
                    ): null}
                </div>
                <div className="acc_f_comment">
                    <div className="acc_f_com_like">
                        <div className='acc_f_com_like_like'>
                            <button type='button' onClick={() => checkLike()} className={ v.like.includes(useAuth.currentUser.uid)? `likeChecked` : null}>likes</button>
                            <span>{v.like && likeText}</span>
                        </div>
                        <div className='acc_f_com_like_send'>
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
                                    </div>
                                    <div className="acc_f_com_u_text">
                                        {val.text}
                                        <div className="acc_f_com_u_time">{timeInvert(val.time)}</div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className='acc_f_com_empty'>댓글이 없습니다.</li>
                        )}
                    </ul>
                    <div className="acc_f_com_input">
                        <form onSubmit={(e)=> setComment(e, postID)}>
                            <textarea name="text" maxLength={120} onInput={(e) => textareaHeight(e)} placeholder="답글을 입력하세요."></textarea>
                            <button>submit</button>
                        </form>
                    </div>
                </div>
            </li>
        )
    })
    const GroupComponent = memo(function({data}){
        const groupID = data[0];
        const groupData = data[1];
        const goToUnit =async function(id){
            const storeData = store.getState().setGetGroup[id];
            if(!storeData){
                const db = doc(useFirestore,'groups',id);
                const data1 =await getDoc(db);
                const data2 = data1.data();
                await store.dispatch({
                    type : 'setSelectGroupData',
                    id : id,
                    data : data2
                })
                return navigate(`/group/${id}`,{state : {data : data2}})
            } else {
                const data3 = await store.getState().setGetGroup[id];
                return navigate(`/group/${id}`,{state : {data : data3}})
            }
        }
        return(
            <li className='acc_group_unit' onClick={() => goToUnit(groupID)}>
                <div className="acc_group_unit_box">
                    <div className="acc_g_u_image">
                        <img src={groupData.photoURL} />
                    </div>
                    <div className="acc_g_u_text">
                        <p className='acc_g_u_text_title'># {groupData.title}</p>
                        <p className='acc_g_u_text_desc'>{groupData.description}</p>
                        <p className='acc_g_u_text_user'>{groupData.user.length}명 참여</p>
                    </div>
                </div>
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
                            <p className='acc_i_a_n_desc'>{userInfo.description}</p>
                            <p className="acc_i_a_n_follow">팔로워 <strong>{userInfo.follower? userInfo.follower.length : 0}</strong></p>
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
                                       <div className="acc_i_a_btn1">
                                            <button type='button' onClick={() => setopenUserMenu(state => !state)}>프로필 수정</button>
                                            {openUserMenu && (
                                            <ul className="acc_i_a_b_menu">
                                                <li><a href='/#' onClick={(e) => e.preventDefault()}>edit profile</a></li>
                                                <li><a href='/#' onClick={(e) => {e.preventDefault(); userLogout()}}>logout</a></li>
                                            </ul>
                                        )}
                                       </div>
                                    )}
                        </div>
                        {userID !== useAuth.currentUser.uid? (
                            <div className="acc_i_followBtn">
                                {userInfo.follower && userInfo.follower.includes(useAuth.currentUser.uid)? (
                                    <a href="/#" className='acc_i_f_cancel'>cancel follow</a>
                                ):(
                                    <a href="/#" className='acc_i_f_follow' onClick={(e) => {e.preventDefault(); followUser(userID)}}>follow</a>
                                )}
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
                        <ul className='acc_posts'>
                            {callPost.sort((a,b) => a[1].time - b[1].time).reverse().map((v,i) => (
                                <PostComponent data={v} idx={i} key={v['uid'] + "_" + i}/>
                            ))}
                        </ul>
                    ) : userPage === 1 ? (
                        <div className='acc_group'>
                            <div className='acc_group_section1'>
                                <h3>참여 중인 그룹</h3>
                                <ul>
                                    {groupList.map(v => (
                                        <GroupComponent data={v} key={`group_${v[0]}`}/>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : userPage === 2 ? (
                        <div className='acc_like'>
                            <div className="acc_like_section1">
                                <h3>관심 등록한 포스팅</h3>
                                <ul>
                                    {likePost.map((v,i) => (
                                        <PostComponent data={v} idx={i} key={`likePost_${v[0]}`} />
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : null
                    }
                </div>
            </div>
        </div>
    )
}