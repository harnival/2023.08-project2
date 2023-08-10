import { useEffect, useRef, useState } from 'react'
import '../css/group.css'
import { BrowserRouter as Router, Routes, Link, Route, useParams, useNavigate } from 'react-router-dom'
import { useAuth, useFirestore } from '../datasource/firebase'
import { addDoc, arrayUnion, collection, doc,getDoc, getDocs, onSnapshot, query, updateDoc, where} from 'firebase/firestore';
import store from '../store/store';
import GroupUnit from './groupUnit'

export default function Group(){
    const navigate = useNavigate();

    const uid = useAuth.currentUser.uid
    const [callGroup, setcallGroup] = useState([]);
    const [limitDesc, setlimitDesc] = useState()

    useEffect(function(){   //그룹 게시물 변화 감시
        const checkChange = async function(){
            const w = Object.keys(store.getState().setCurrentUser.group);
            
        }
        checkChange()
    },[])

    useEffect(function(){ //초기 그룹 입력
        async function callFirst(){
            const w = Object.keys(store.getState().setCurrentUser.group);
            const ee = await Promise.all(w.map(async (v) => {
                const snapshot = await getDoc(doc(useFirestore,'groups',v));
                const data = snapshot.data()
                return {...data, id : v}
            }))
            setcallGroup(state => ([...ee]))
        }
        callFirst()
    },[])

    const [selectAvatar, setselectAvatar] = useState()
    let imageFileReader = useRef();
    const selectImage = function(e){
        const loader = e.target.files[0];
        if(loader){
            const reader = new FileReader()
            reader.readAsDataURL(loader);
            reader.onload = function(val){
                setselectAvatar(state => val.target.result)
            }
        }
    }
    const clickToImage = function(){
        imageFileReader.click()
    }
    const makeGroup = async function(e){
        e.preventDefault();
        const q = new FormData(e.target);
        const data = Object.fromEntries(q.entries());
        const groupAdd = {
            photoURL : selectAvatar,
            title : data.title,
            description: data.desc,
            user : [useAuth.currentUser.uid]
        }

        const groupDB = collection(useFirestore,'groups');
        const userDB = doc(useFirestore,'account',useAuth.currentUser.uid);
        const adddocs = await addDoc(groupDB,groupAdd);
        await updateDoc(userDB,{
            group : arrayUnion(adddocs.id)
        })
        return navigate(`/group/${adddocs.id}`)
    }


    function GroupMain(){
        return(
            <div className="g_b_main">
                <div className="g_b_my">
                    <h3>내가 참여한 그룹</h3>
                    <ul>
                        {callGroup.map(v => (
                        <li className='g_b_my_list' key={`group_${v.id}`}>
                            <div className="g_b_my_img">
                                <div className="g_b_img_wrap">
                                    <Link to={`${v.id}`} state={{title : v.title}}>
                                        <img src={v.photoURL? v.photoURL : null}/>
                                    </Link>
                                </div>
                                <div className="g_b_my_alarm"></div>
                            </div>
                            <div className="g_b_my_text">
                                <p>{v.title}</p>
                                <p>{v.description}</p>
                                <p>{v.user.length}명 참여</p>
                            </div>
                        </li>
                        ))}
                    </ul>
                </div>
                {/* <div className="g_b_popular">
                    <h3>추천 그룹</h3>
                    <p>@@@ 그룹의 유저들이 참여한 그룹입니다.</p>
                    <ul>
                    {new Array(10).fill().map(v => (
                        <li className='g_b_my_list'>
                            <div className="g_b_my_img">
                                <img src="" alt="" />
                                <div className="g_b_my_alarm"></div>
                            </div>
                            <div className="g_b_my_text">
                                <p>sample title</p>
                                <p>sample sub</p>
                                <p>000명 참여</p>
                            </div>
                        </li>
                        ))}
                    </ul>
                </div> */}

            </div>
        )
    }

    return(
        <div id="group">
            <div className="groupBox">
                <div className="g_search">
                    <div className="g_s_inputBox">
                        <input type="text" name='search' placeholder='검색어를 입력하세요.'/>
                    </div>
                    <div className="g_s_btn g_s_btn1">
                        <button>검색</button>
                    </div>
                    <div className="g_s_btn g_s_btn2">
                        <button>그룹 생성</button>
                    </div>
                </div>
                <div className="g_new">
                    <form className="g_new_box" onSubmit={(e) => makeGroup(e)}>
                        <div className="g_new_image" onClick={(e) => clickToImage(e)}>
                                <img src={selectAvatar} />
                                <input ref={input => imageFileReader = input} type="file" id="g_new_image_file" accept='image/*' onChange={(e) => selectImage(e)} hidden={true}/>
                        </div>
                        <div className="g_new_text">
                            <div className="g_new_t_title">
                                <input type="text" name="title" id="" placeholder='# 그룹 타이틀' />
                            </div>
                            <div className="g_new_t_desc">
                                <textarea name="desc" maxLength={100} placeholder='그룹 설명 (100자 이내)'></textarea>
                                <span></span>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="g_body">
                    <Routes>
                        <Route path='/' element={<GroupMain />}></Route>
                        <Route path=':groupID' element={<GroupUnit />}></Route>
                    </Routes>
                </div>
            </div>
        </div>
    )
}