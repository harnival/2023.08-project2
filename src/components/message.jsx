import { useEffect, useState } from 'react';
import '../css/message.css';
import MessageUnit from './messageUnit';

import { Routes, Route, Link } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuth, useFirestore } from '../datasource/firebase';


export default function Message(){

    const [callList, setcallList] = useState([]);

    useEffect(function(){   // 리스트 불러오기
        const setList = async function(){
            const q = query(collection(useFirestore,'messages'),where('user','array-contains',useAuth.currentUser.uid));
            const snapshots = await getDocs(q)
            const dataArr1 = await Promise.all(
                snapshots.docs.map(async(v) => {
                    const user = v.data().user
                    const gets = await Promise.all(
                        v.data().user.map(async(val) => {
                            const qq = await getDoc(doc(useFirestore,'account',val))
                            const qq2 = qq.data()
                            return [val , {name : qq2.general.name, photoURL : qq2.general.photoURL, id : qq2.general.id}]
                        })
                    )
                    return {...v.data(), user : [...gets]}
                })
            )
            console.log(dataArr1)
            
        }
        setList()
    },[])

    return(
        <div id="message">
            <div className="messageBox">
                <div className="m_list">
                    <div className="m_l_category">
                        <ul>
                            <li><a href="#">전체보기</a></li>
                        </ul>
                    </div>
                    <div className="m_l_list">
                        <ul>
                            {callList.map(v => (
                                <li key={`message_${v.pageID}`}>
                                    <div className="m_l_Box">
                                        <div className="m_l_info">
                                            <div className="m_l_i_avatars">
                                                <ul>
                                                    {v.user.map((val) => {
                                                        return(
                                                            <li>{val[1].photoURL}</li>
                                                        )
                                                    })}
                                                </ul>
                                            </div>
                                            <div className="m_l_i_ids">
                                                {v.user.map(v => {
                                                    console.log(v)
                                                    const obj1 = {}
                                                    const makeArr = async function(){
                                                        const data1 = await getDoc(doc(useFirestore,'account',v))
                                                        const data2 = data1.data()
                                                        obj1.name = data2.general.name;
                                                        obj1.id = data2.general.id
                                                    }
                                                    makeArr();
                                                    return(
                                                    <li key={`username_${obj1.id}`}> {obj1.name} </li> )

                                                })}
                                            </div>
                                        </div>
                                        <div className="m_l_preview">
                                            <div className="m_l_p_avatar"></div>
                                            <div className="m_l_p_text">
                                                <div className="m_l_p_t_id"></div>
                                                <div className="m_l_p_t_content"></div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="m_talkBox">
                    <Routes>
                        <Route path=':pageID' element={<MessageUnit />}></Route>
                    </Routes>
                </div>
            </div>
        </div>
    )
}