import { collection, onSnapshot, where, query, getDoc, doc } from "firebase/firestore";
import { useEffect, useState, memo } from "react";
import { useParams, useLocation, Link } from "react-router-dom"
import { useFirestore } from "../datasource/firebase";

import '../css/groupUnit.css'
import PostComponent from './post.jsx'
import store from "../store/store";


export default function GroupUnit(props) {
    let {groupID} = useParams();
    const [currentPage, setcurrentPage] = useState(groupID)
    const [loadPage, setloadPage] = useState([])
    const [pageInfo, setpageInfo] = useState({})
    const location = useLocation()

    useEffect(function(){
        setpageInfo(state => ({...location.state}))
        const q = query(collection(useFirestore,'posts'),where('group','==',groupID))
        onSnapshot(q, async(snapshotDoc) => {
            const arrs = await Promise.all(
                snapshotDoc.docs.map(async(v) => {
                    // 유저 정보
                    const data1 = await getDoc(doc(useFirestore,'account',v.data().uid));
                    const data2 = data1.data();
                    // 시간 변환
                    const time = v.data().time * 1000;
                    const timeObj = {
                        year : new Date(time).getFullYear(),
                        month : new Date(time).getMonth() +1,
                        date : new Date(time).getDate(),
                        hour : new Date(time).getHours() <10? "0"+new Date(time).getHours() : new Date(time).getHours(),
                        minute : new Date(time).getMinutes() <10? "0"+new Date(time).getMinutes() : new Date(time).getMinutes(),
                    }
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
                        user_name : data2.general.name, 
                        user_id : data2.general.id , 
                        user_photo : data2.general.photoURL, 
                        time : timeObj, 
                        userInfo : commentUserArr, 
                        postID : v.id,
                        group : {...groupObj}
                    };
                    
                    return ([v.id, data3])
                })
            )
            setloadPage(state => [...arrs])
        })
    },[currentPage])

    // component ============= //
    const GroupUnitPostComponent = memo(({v}) => PostComponent({v}));

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
                    <p>{pageInfo.desc}</p>
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
                    <button>옵션</button>
                    <div className="gu_i_o_list">
                        <ul>
                            <li><button>그룹 신고</button></li>
                            {Object.keys(store.getState().setCurrentUser.group).find(v => v === groupID)? (
                                <li><button>그룹에서 나가기</button></li>
                            ):(
                                <>
                                    <li><button>그룹 참가하기</button></li>
                                    <li><button>그룹 차단</button></li>
                                </>
                                
                            )}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="gu_tab">
                <div className="gu_tab_box">
                    <div className="gu_tab_line"></div>
                    <button>dashboard</button>
                    <div className="gu_tab_line"></div>
                    <button>group chat</button>
                    <div className="gu_tab_line"></div>
                </div>
            </div>
            <div className="gu_main">
                <ul>
                    {!loadPage.length? (
                        <li>
                            <strong>텅텅....</strong>
                        </li>
                    ):(
                        loadPage.map(v => (
                            <GroupUnitPostComponent v={v} key={`groupUnit_${v.postID}`}/>
                        ))
                    )}
                </ul>

            </div>
        </div>
    )
}