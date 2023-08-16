import { useEffect, useRef, useState } from "react"
import store from "../store/store"

import '../css/setting.css'
import { doc, updateDoc } from "firebase/firestore"
import { useAuth, useFirestore } from "../datasource/firebase"
export default function Setting(){

    // components //
    const EditProfileComponent = function(){
        const [userProfile, setuserProfile] = useState({...store.getState().setCurrentUser})
        const [editOn, seteditOn] = useState({
            name : false,
            id : false,
            description : false
        })
        useEffect(function(){
            console.log(editOn)
        },[editOn])
        let imageBox = useRef();
        const changeImage = function(e){
            const loader = e.target.files[0];
            const size = loader.size;
            const limit = 1048487;
            if(loader){
                if(size < limit) {
                    const reader = new FileReader();
                    reader.readAsDataURL(loader);
                    reader.onload = function(val){
                        setuserProfile(state => ({...state, photoURL : val.target.result}))
                    }
                } else {
                    e.target.value = '';
                    alert(" 1MB 이하 이미지 파일만 등록이 가능합니다.")
                    return false;
                }
            }
        }
        const clickToImage = function(){
            imageBox.click()
        }
        const editComplete = function(e,key){
            e.preventDefault();
            const userdb = doc(useFirestore,'account',useAuth.currentUser.uid);
            const data = Object.fromEntries(new FormData(e.target).entries());
            if( data[key] === ''){
                return seteditOn(state => ({...state, [key] : false}))
            }
            if( key==='id' && data.id.match(/\W/g)){
                return alert("아이디는 영문 대/소문자, 숫자, '_' 만 사용 가능합니다.")
            }
            updateDoc(userdb,{
                [key] : data[key]
            })
            return seteditOn(state => ({...state, [key] : false}))
            
        }
        return(
            <div className="s_editProfile">
                <div className="s_ep_title">
                    {window.innerWidth <= 1023 && (
                        <button>뒤로가기</button>
                    )}
                    <h2>프로필 수정</h2>
                </div>
                <div className="s_ep_main">
                    <div className="s_ep_m_photo">
                        <div className="s_ep_m_photo_image" onClick={() => clickToImage()}>
                            <img src={userProfile.photoURL} />
                            <input ref={input => imageBox = input} type="file" name="photoURL" id="" hidden={true} onChange={(e) => changeImage(e)} accept="image/*"/>
                            <div className="s_ep_m_p_image_cover"></div>
                        </div>
                        <div className="s_ep_m_photo_text">
                            <p>* 프로필 사진을 수정하려면 이미지를 클릭해주세요.</p>
                            <p>* .jpg , .png , .webp 등 이미지 형식만 가능합니다.</p>
                            <p>* 1MB 이하 이미지를 사용해 주십시오.</p>
                        </div>
                    </div>
                    <div className="s_ep_m_id s_ep_m_info">
                        <h3>ID</h3>
                        {!editOn.id?(
                            <div className="s_ep_m_complete">
                                <span>@{userProfile.id}</span>
                                <button className="s_ep_edit_btn" onClick={() => seteditOn(state => ({...state, id : true}))}>수정하기</button>
                            </div>
                        ):(
                            <form className="s_ep_m_edit" onSubmit={(e) => editComplete(e,'id')}>
                                <input type="text" name="id" autoFocus={true} autoComplete="false"/>
                                <button className="s_ep_complete_btn">수정완료</button>
                            </form>
                        )}
                    </div>
                    <div className="s_ep_m_name s_ep_m_info">
                        <h3>NAME</h3>
                        {!editOn.name?(
                            <div className="s_ep_m_complete">
                                <span>{userProfile.name}</span>
                                <button className="s_ep_edit_btn" onClick={() => seteditOn(state => ({...state, name : true}))}>수정하기</button>
                            </div>
                        ):(
                            <form className="s_ep_m_edit" onSubmit={(e) => editComplete(e,'name')}>
                                <input type="text" name="name" autoFocus={true} autoComplete="false"/>
                                <button className="s_ep_complete_btn">수정완료</button>
                            </form>
                        )}
                    </div>
                    <div className="s_ep_m_desc s_ep_m_info">
                        <h3>DESCRIPTION</h3>
                        {!editOn.description?(
                            <div className="s_ep_m_complete">
                                <span>{userProfile.description}</span>
                                <button className="s_ep_edit_btn" onClick={() => seteditOn(state => ({...state, description : true}))}>수정하기</button>
                            </div>
                        ):(
                            <form className="s_ep_m_edit" onSubmit={(e) => editComplete(e,'description')}>
                                <input type="text" name="description" autoFocus={true} autoComplete="false"/>
                                <button className="s_ep_complete_btn">수정완료</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        )
    }
    //==============================================================================//
    return(
        <div id="setting">
            <div className="settingBox">
                <div className="s_menu">
                    <h2>SETTINGS</h2>
                    <ul>
                        <li><a href="/">프로필 수정</a></li>
                        <li><a href="/"></a></li>
                    </ul>
                </div>
                <div className="s_main">
                    <EditProfileComponent />
                </div>
            </div>
        </div>
    )
}