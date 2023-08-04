import { useEffect } from 'react'
import '../css/group.css'
import { BrowserRouter as Router, Routes, Link, Route, useParams, useNavigate } from 'react-router-dom'
export default function Group(){
    useEffect(function(){

    })

    function GroupMain(){
        return(
            <div className="g_b_main">
                <div className="g_b_my">
                    <h3>내가 참여한 그룹</h3>
                    <ul>
                        {new Array(10).fill().map(v => (
                        <li className='g_b_my_list'>
                            <div className="g_b_my_img">
                                <div className="g_b_img_wrap">
                                    <img src={v.photoURL}/>
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
                </div>

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
                    <div className="g_s_btn">
                        <button>검색</button>
                    </div>
                </div>
                <div className="g_body">
                    <Routes>
                        <Route path='/' element={<GroupMain />}></Route>
                        <Route path={`${ids}`}></Route>
                    </Routes>
                </div>
            </div>
        </div>
    )
}