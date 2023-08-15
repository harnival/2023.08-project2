import { useEffect, useRef, useState } from 'react'
import '../css/group.css'
import { BrowserRouter as Router, Routes, Link, Route, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, useFirestore } from '../datasource/firebase'
import { addDoc, arrayUnion, collection, doc,getDoc, getDocs, onSnapshot, query, updateDoc, where} from 'firebase/firestore';
import store from '../store/store';
import GroupUnit from './groupUnit'

export default function Group(){
    const navigate = useNavigate();

    const uid = useAuth.currentUser.uid
    const [callGroup, setcallGroup] = useState([]);
    const [limitDesc, setlimitDesc] = useState()
    const [searchList, setsearchList] = useState([]);
    const [recomGroup, setrecomGroup] = useState([]);

    useEffect(function(){   //그룹 게시물 변화 감시
       
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
    useEffect(function(){
        async function recomm(){
            const groups = Object.entries(store.getState().setCurrentUser.group);
            const groupLen = groups.length;
            const chooseGroup = Math.floor(Math.random()*groupLen);
            const userList =await  getDoc(doc(useFirestore,'groups',groups[chooseGroup][0]))
            const userListData = userList.data().user;
            setrecomGroup(state => state[0] = groups[chooseGroup])
            
            const total = {};
            await Promise.all(userListData.map(v => {
                getDoc(useFirestore,'account',v)
                .then(snapshot => Object.keys(snapshot.data().group))
                .then(data => {
                    data.forEach(v => total[v] = (total[v]||0)+1)
                })
            }))
            await Promise.all(Object.entries(total).sort((a,b) => a[1] - b[1]).map((v,i) => {
                if(i < 10){
                    getDoc(doc(useFirestore,'groups',v[0]))
                    .then(snapshot => snapshot.data())
                    .then(data => setrecomGroup(state => state[1] = [...state[1], data]))
                }
            }))
        }
        recomm()
    },[])
    // 그룹 생성 //
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
            group : arrayUnion({[adddocs.id] : groupAdd.title})
        })
        return navigate(`/group/${adddocs.id}`, {state : {data : groupAdd}})
    }
    const gNew = useRef();
    const gNewChild = useRef({
        input : null,
        textarea: null
    })
    const toggleNew = function(){
        gNew.current.classList.toggle('g_new_toggle')
        if(gNew.current.classList.contains("g_new_toggle")){
            if(gNewChild.current.input){
                gNewChild.current.input.value = ''
                gNewChild.current.textarea.value = ''
                setselectAvatar(state => '')
            }
        }
    }
    const goToUnit =async function(id){     // 그룹 페이지로 이동
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
            return navigate(`${id}`,{state : {data : data2}})
        } else {
            const data3 = await store.getState().setGetGroup[id];
            return navigate(`${id}`,{state : {data : data3}})
        }
    }
    const searchGroup = async function(e){
        e.preventDefault()
        const q = e.target;
        const w = new FormData(q);
        const data = Object.fromEntries(w.entries());
        const keyword = data.search;
        setsearchList(state => [])

        const groupQuery = query(collection(useFirestore,'groups'), where('title','>=',keyword))
        const groupQuery2 = query(collection(useFirestore,'groups'), where('description','>=',`#${keyword}`))
        const groupQuery3 = query(collection(useFirestore,'groups'), where('description','>=',keyword))
        const data1 = await getDocs(groupQuery);
            const data1_2 =await Promise.all( data1.docs.map(v => [v.id, v.data()]))
            setsearchList(state => [...data1_2])
        const data2 = await getDocs(groupQuery2);
            const data2_2 =await Promise.all( data2.docs.map(v => [v.id, v.data()]))
            setsearchList(state => [...state, ...data2_2])
        const data3 = await getDocs(groupQuery3);
            const data3_2 =await Promise.all( data3.docs.map(v => [v.id, v.data()]))
            setsearchList(state => [...state, ...data3_2])
        return navigate(`/group/search/q/${keyword}`, {state : {data : searchList}});
    }


    // ======================================================================================================================
    function GroupMain(){   // 그룹 메인 페이지 component
        return(
            <div className="g_b_main">
                <div className="g_b_my">
                    <h3>내가 참여한 그룹</h3>
                    <ul>
                        {callGroup.map(v => (
                        <li className='g_b_my_list' key={`group_${v.id}`} onClick={() => goToUnit(v.id)}>
                            <div className="g_b_my_img">
                                <div className="g_b_img_wrap">
                                    <img src={v.photoURL? v.photoURL : null}/>
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
                <div className="g_b_popular">
                    <h3>추천 그룹</h3>
                    <p>{recomGroup[0]&&recomGroup[0][1]} 그룹의 유저들이 참여한 그룹입니다.</p>
                    <ul>
                    
                    </ul>
                </div>

            </div>
        )
    }

    function GroupSearchComponent(){
        const location = useLocation();
        const {keyword} = useParams()
        const groupData = location.state.data;

        return(
            <div className="g_b_searchResult">
                <div className="g_b_sr_text">
                    <button type='button' onClick={() => navigate('/group')}>뒤로 가기</button>
                    <p>검색 결과 : {keyword}</p>
                </div>
                <div className="g_b_sr_list">
                    <ul>
                        {groupData.length === 0 && (
                            <li className='g_b_sr_empty'>검색 결과가 없습니다.</li>
                        )}
                        {groupData.map(v => (
                            <li>
                                <img src={v.photoURL} />
                                <div className="g_b_sr_list_text">
                                    <p>{v.title}</p>
                                    <p>{v.description}</p>
                                    <p>{v.user&&v.user.length}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )
    }
// =============================================================================================
    return(
        <div id="group">
            <div className="groupBox">
                <div className="g_search">
                    <form className="g_s_inputBox" id='groupSearch' onSubmit={(e) => searchGroup(e)}>
                        <input type="text" name='search' placeholder='검색어를 입력하세요.'/>
                    </form>
                    <div className="g_s_btn g_s_btn1">
                        <button form='groupSearch'>검색</button>
                    </div>
                    <div className="g_s_btn g_s_btn2">
                        <button onClick={() => toggleNew()}>그룹 생성</button>
                    </div>
                </div>
                <div className="g_new g_new_toggle" ref={gNew}>
                    <form className="g_new_box" onSubmit={(e) => makeGroup(e)}>
                        <div className="g_new_image" onClick={(e) => clickToImage(e)}>
                                <img src={selectAvatar} />
                                <input ref={input => imageFileReader = input} type="file" id="g_new_image_file" accept='image/*' onChange={(e) => selectImage(e)} hidden={true}/>
                                {!selectAvatar && (
                                    <div className="g_new_i_cover">
                                        <p className="cover_bg"></p>
                                        <p>* 이미지 파일( .jpg, .png, .webp, .svg 등) 만 사용 가능합니다.</p>
                                        <p>* 이미지는 전체 사이즈가 적용됩니다.</p>
                                        <p style={{color : 'red'}}>* 추가를 위해 클릭해주세요.</p>
                                    </div>
                                )}
                        </div>
                        <div className="g_new_text">
                            <div className="g_new_t_title">
                                <input ref={input => gNewChild.current.input = input} type="text" name="title" id="" placeholder='# 그룹 타이틀' />
                            </div>
                            <div className="g_new_t_desc">
                                <textarea ref={input => gNewChild.current.textarea = input} name="desc" maxLength={100} placeholder='그룹 설명 (100자 이내)'></textarea>
                                <span></span>
                            </div>
                            <div className="g_new_btn">
                                <button>생성하기</button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="g_body">
                    <Routes>
                        <Route path='/' element={<GroupMain />}></Route>
                        <Route path=':groupID' element={<GroupUnit />}></Route>
                        <Route path='search/q/:keyword' element={<GroupSearchComponent />}></Route>
                    </Routes>
                </div>
            </div>
        </div>
    )
}