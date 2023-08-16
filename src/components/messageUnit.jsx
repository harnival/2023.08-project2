import { arrayUnion, doc, onSnapshot, serverTimestamp, updateDoc, Timestamp } from "firebase/firestore"
import { memo, useEffect, useRef, useState } from "react"
import { useParams, useLocation } from "react-router-dom"
import { useAuth, useFirestore } from "../datasource/firebase"

export default function MessageUnit(props){
    // return =================================================================== //
    const { pageID } = useParams();
    

    const [loadingComp, setloadingComp] = useState(true)
    const [mediaInput, setmediaInput] = useState([])

    const msgData = props.props1;
    useEffect(function(){
        if(msgData){
            setloadingComp(false)
            console.log(msgData)
        }
    },[])

    const msgTextInput = useRef();
    let msgMediaInput = useRef();


    // 메시지 입력 //
    const submitMsg = function(event){
        event.preventDefault();
        const formData = new FormData(event.target)
        const data = {...Object.fromEntries(formData.entries())};
        const db = doc(useFirestore,'messages',msgData.pageID);
        const servertime = Timestamp.now();
        if(!!data.text){
            updateDoc(db,{
                contents : arrayUnion({
                    text : data.text,
                    uid : useAuth.currentUser.uid,
                    time : servertime,
                    media : [...mediaInput]
                })
            })
            return () => {
                msgTextInput.current.value = ''
                setmediaInput(state => [])
            }
        }
    }
    // 이미지 업로드 //
    const clickToMedia = function(event){
        event.preventDefault();
        msgMediaInput.click()
    }
    const inputImage = async function(event){
        if(mediaInput.length <5){
            const loader = event.target.files[0];
            if(loader){
                const reader = new FileReader();
                reader.readAsDataURL(loader);
                reader.onload = function(val){
                    setmediaInput(state => ([...state, val.target.result]))
                }
            }
        }
    }
    const deleteImage = function(idx){
        setmediaInput(state => state.filter((v,i) => i !== idx))
    }
    const invertTime = function(value){
        const time = value*1000;
        const timeObj = {
            year : new Date(time).getFullYear(),
            month : new Date(time).getMonth() +1,
            date : new Date(time).getDate(),
            hour : new Date(time).getHours() <10? "0"+new Date(time).getHours() : new Date(time).getHours(),
            minute : new Date(time).getMinutes() <10? "0"+new Date(time).getMinutes() : new Date(time).getMinutes(),
        }
        return  `${timeObj.year}/${timeObj.month}/${timeObj.date} ${timeObj.hour}:${timeObj.minute}`
    }

    const CommentComponent = memo(function({v}){
        return(
            <li >
                <div className="m_t_ml_account">
                    <div className="m_t_ml_avatar">
                        <img src={msgData.user.find(val => val[0] === v.uid)[1].photoURL} />
                    </div>
                    <div className="m_t_ml_display">
                        <div className="m_t_ml_name">{msgData.user.find(val => val[0] === v.uid)[1].name}</div>
                        <div className="m_t_ml_id">@{msgData.user.find(val => val[0] === v.uid)[1].id}</div>
                    </div>
                </div>
                <div className="m_t_ml_content">
                    <div className="m_t_ml_c_text">
                        <p>{v.text}</p>
                        <span>{invertTime(v.time.seconds)}</span>
                    </div>
                    {!!v.media.length && (
                        <div className="m_t_ml_c_media">
                            <ul>
                                {v.media.map(val => (
                                    <li><img src={val} /></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </li>
        )
    })
        // return================================================================//
    if(loadingComp){
        return(
            <div className="loadingComps">
                <h1>Loading....</h1>
            </div>
        )
    } else {
        return(
            <div className={`messageUnit message_${pageID}`}>
                <div className="m_t_account">
                    {msgData.group && (
                        <div>
                            ddddddddddddddddddd
                        </div>
                    )}
                    {msgData.user.filter(v => v[0] !== useAuth.currentUser.uid).map(v => (
                        <div className="m_t_a_profile" key={`account_${v[0]}`}>
                            <div className="m_t_a_p_image">
                                <img src={v[1].photoURL}/>
                            </div>
                            <div className="m_t_a_p_account">
                                <p className="m_t_a_p_name">{v[1].name}</p>
                                <p className="m_t_a_p_id">@{v[1].id}</p>
                            </div>
                        </div>

                    ))}
                </div>
                <div className="m_t_messageList">
                    <ul>
                        {msgData.contents.map((v,i) => (
                            <CommentComponent v={v} key={`message_${msgData.pageID}_${i}`}/>
                        ))}
                    </ul>
                </div>
                <div className="m_t_input">
                    <div className="m_t_imageBox">
                        {mediaInput.map((v,i) => (
                            <div className="m_t_i_image">
                                <img src={v} />
                                <button type="button" onClick={(e) => deleteImage(i)}>이미지 삭제</button>
                            </div>
                        ))}
                    </div>
                    <form className="m_t_text" onSubmit={(e) => submitMsg(e)}>
                        <div className="m_t_i_btn">
                            <input ref={input => msgMediaInput = input} type="file" hidden={true} onChange={(e) => inputImage(e)}/>
                            <button type="button" onClick={(e) => clickToMedia(e)}>이미지 첨부</button>
                        </div>
                        <div className="m_t_i_input">
                            <input type="text" name="text" ref={msgTextInput} placeholder="메세지를 입력하세요."/>
                        </div>
                        <div className="m_t_i_submit">
                            <button>
                                보내기
                                <img src="/img/icons/arrow-up-bold.svg"/>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}
