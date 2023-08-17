
import { collection, limit, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import '../css/search.css'
import { useFirestore } from '../datasource/firebase';
import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';

import PostComponent from './post'

export default function Search(){
    const navigate = useNavigate();
    const [searchUserList, setsearchUserList] = useState([])
    const [searchPostList, setsearchPostList] = useState([])
    const [keyword, setkeyword] = useState()
    const [searchDone, setsearchDone] = useState(true)

    const searchResult =async function(e){
        e.preventDefault();
        const q = e.target;
        const form = new FormData(q);
        const data = Object.fromEntries(form.entries()).search;
        console.log(data)
        if(!data.match(/[\wㄱ-ㅎㅏ-ㅣ가-힣]/g)){
            return console.log("검색어 입력")
        }
        setkeyword(state => data)
        setsearchUserList(state => [])
        const searchUserQuery1 = query(collection(useFirestore,'account'),where('name','<=', data+'\uf8ff'),limit(3))
        const searchUserQuery2 = query(collection(useFirestore,'account'),where('id','<=',data+'\uf8ff'),limit(3))
        const searchPostQuery = query(collection(useFirestore,'posts'),where('text','>=',data),limit(5))
        const total = {};

        const ud1 = await getDocs(searchUserQuery1);
        const ud2 = ud1.docs;
        const ud3 = await Promise.all( ud2.map(v => total[v.uid] = v.data()) )
        
        const ud2_1 = await getDocs(searchUserQuery2);
        const ud2_2 = ud2_1.docs;
        const ud2_3 = await Promise.all( ud2_2.map(v => total[v.uid] = v.data()) )
        setsearchUserList(state => Object.values(total))

        const pd1 = await getDocs(searchPostQuery);
        const pd2 = pd1.docs;
        const pd3 = await Promise.all( pd2.map(async(v) => {
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
            return dataObj
        }) )
        setsearchPostList(state => [...pd3])

        return setsearchDone(false)
    }

    const SearchPostComponent = memo(PostComponent);

    return(
        <div id="search">
            <div className="searchBox">
                <div className="s_search">
                    <form className="s_s_inputBox" id='searchInput' onSubmit={(e) => searchResult(e)}>
                        <input type="text" name="search" placeholder="검색어를 입력하세요."/>
                    </form>
                    <div className="s_s_btn">
                        <button form='searchInput'>검색</button>
                    </div>
                </div>
                {searchDone && (
                    <p className='s_main_empty'>검색어를 입력하세요.</p>
                )}
                {!searchDone && (
                <div className="s_main">
                    <div className="s_m_text">
                        검색 결과 : <strong>[ {keyword} ]</strong> 
                    </div>
                    <div className="s_m_list">
                        <div className="s_m_l_section1">
                            <h3>계정</h3>
                            <ul>
                                {searchUserList.length === 0? (
                                    <li className='s_m_l_section1_empty'>검색 결과가 없습니다.</li>
                                ): (
                                    searchUserList.map(v => (
                                        <li key={v.uid} className='s_m_l_section1_list' onClick={() => navigate(`/account/${v.uid}`)}>
                                            <div className="list_1">
                                                <div className="s_m_l_user_image">
                                                    <img src={v.photoURL} />
                                                </div>
                                                <div className="s_m_l_user_text">
                                                    <p>@{v.id}</p>
                                                    <p>{v.name}</p>
                                                    <p style={{color : 'rgb(255,255,255,0.6)'}}>팔로워 {v.follower.length}</p>
                                                    <p style={{paddingLeft : '1rem'}}>{v.description}</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                        <div className="s_m_l_section2">
                            <h3>post</h3>
                            <ul>
                                {searchPostList.map(v => (
                                    <SearchPostComponent postData={v} postID={v.postID} key={`post_${v.postID}`} />
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    )
}