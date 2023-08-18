import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore"
import { useEffect, useRef, useState } from "react"
import { useAuth, useFirestore } from "../datasource/firebase"
import store from "../store/store"
import html2canvas from 'html2canvas';

import '../css/stories.css'
import { useNavigate } from "react-router-dom";
export default function Stories(){
    const navigate = useNavigate();
    const [userInfo, setuserInfo] = useState([])
    const [stickers, setstickers] = useState([])
    useEffect(function(){
        async function load(){
            const followers = store.getState().setCurrentUser.follower;
                followers.push(useAuth.currentUser.uid)
            const userQuery = query(collection(useFirestore,'account'),where('uid','in',followers));
            const data1 = await getDocs(userQuery);
            const data2 = data1.docs;
            const data3 = await Promise.all(
                data2.map(v => v.data())
            )
            const data4 = [...data3].sort((a,b) => {
                return (a.story && !!a.story.length) ? 1 : -1
            })
            setuserInfo(state => [...data4])
        }
        load()
        async function loadSticker(){
            const db = doc(useFirestore,'items','sticker');
            const data1 = await getDoc(db);
            const data2 = data1.data();
            setstickers(state => Object.entries(data2));
        }
        loadSticker()
    },[])
    // components =====================================================//
    const ComponentMain = function(){
        return(
            <div className="componentMain">
                <div className="cmain_userImage">
                    {userInfo.map(v => (
                        <div className="cmain_ui_unit">
                            <img src={v.photoURL} />
                        </div>
                    ))}
                </div>
                <ul>
                    {userInfo.filter(v => v.story && !!v.story).map(v => (
                        <li key={v.uid}>
                            <div className="story_time">
                                {v.story.map((v) => (
                                    <div><p></p></div>
                                ))}
                            </div>
                            {v.story.map(val => (
                                <div className="story_unit">
                                    <div className="story_image">
                                        <img src={val.story} />
                                    </div>
                                </div>
                            ))
                            }
                        </li>
                    ))}
                </ul>
            </div>
        )
    }
    const ComponentMake = function(){
        let imageFile = useRef();
        const imageCanvas = useRef();
        const [nowSelect, setnowSelect] = useState('')
        const openImage = function(event){
            const loader = event.target.files[0];
            const size = loader.size;
            const limit = 1048487;
            if(loader){
                if(size < limit) {
                    const reader = new FileReader();
                    reader.readAsDataURL(loader);
                    reader.onload = function(val){
                        setnowSelect(state => val.target.result)
                    }
                } else {
                    event.target.value = '';
                    alert(" 1MB 이하 이미지 파일만 등록이 가능합니다.")
                    return false;
                }
            }
        }
        // 그리기 도구 //
        const [mouseevent, setmouseevent] = useState(false)
        const [drawOption, setdrawOption] = useState({
            color : 'black',
            width : 4
        })
        const [selectTool, setselectTool] = useState('')
        useEffect(function(){
            const canvass = document.querySelector(".cmake_board canvas")
            function moveEvent(e){
                if(mouseevent && selectTool == 'pen'){
                    const can = canvass.getContext('2d');
                    if(drawOption.color === 'erase'){
                        can.globalCompositeOperation = "destination-out"
                    } else {
                        can.globalCompositeOperation = "source-over"
                    }
                    can.fillStyle = drawOption.color!=='erase'? drawOption.color : 'black';
                    can.strokeStyle = drawOption.color!=='erase'? drawOption.color : 'black';
                    const mx = e.offsetX, my = e.offsetY;
                    can.beginPath();
                    can.arc( mx,my,drawOption.width,0,2*Math.PI )
                    can.fill();
                    can.stroke();
                }
            }
            canvass.addEventListener('mousemove',moveEvent)
            return () => canvass.removeEventListener('mousemove',moveEvent)
        },[mouseevent])

        useEffect(function(){
            imageFile.click()

            const canvass = document.querySelector(".cmake_board canvas")
            const boards = document.querySelector(".cmake_board")
                canvass.width = boards.offsetWidth;
                canvass.height = boards.offsetHeight;
            function downEvent(e){
                setmouseevent(state => true);
            }
            function upEvent(e){
                setmouseevent(state => false)
            }
            
            canvass.addEventListener('mousedown',downEvent)
            canvass.addEventListener('mouseup',upEvent)
            
            return () => {
                canvass.removeEventListener('mousedown',downEvent)
                canvass.removeEventListener('mouseup',upEvent)
            }
        },[])

        // 스티커 추가 //
        const [stickerList, setstickerList] = useState([])
        const [selectSticker, setselectSticker] = useState(null)
        const addSticker = function(val){
            setstickerList(state => [...stickerList, val])
        }
        useEffect(function(){
            const qq = document.querySelectorAll(".cmake_b_sticker");
            qq.forEach(v => {
                let keyval;
                v.addEventListener('mousedown',function(event){
                    keyval = true
                    const elem = event.target;
                    let [poLeft, poTop] = [+elem.offsetLeft, +elem.offsetTop]
                    window.addEventListener('mousemove',function(event){
                        if(keyval){
                            const mx = event.movementX;
                            const my = event.movementY;
                            poLeft += mx; poTop += my;
                            if(elem.offsetTop < 0){
                                const ih = window.innerHeight;
                                keyval = false
                                elem.style.transition = '.3s ease'
                                poTop = ih/2;
                            }else{
                                elem.style.transition = ''
                            }
                        }
                        elem.style.top = `${poTop}px`
                        elem.style.left = `${poLeft}px`
                    })
                })
                window.addEventListener('mouseup',function(e){
                    keyval = false
                })
            })
        },[stickerList])
       

        //업로드//
        const uploadStory = function(){
            const elem = document.getElementById('elementToCapture')
            const userdb = doc(useFirestore,'account',useAuth.currentUser.uid);
            if(elem){
                html2canvas(elem)
                .then((canvas) => {
                    const image = canvas.toDataURL('image/png');
                    updateDoc(userdb,{ story : arrayUnion(image) })
                })
                .then(() => navigate('/stories'))
            }
        }
        return(
            <div className="componentMake">
                <input ref={input => imageFile = input} type="file" name="image" id="" accept="image/.jpg,image/.png" onChange={(e) => openImage(e)}/>
                <div className="cmake_tools">
                    <div className="cmake_t_pen">
                        <button onClick={(e) => {e.preventDefault(); setselectTool(state => state == 'pen'? null : 'pen')}}>펜 도구</button>
                        <ul className={"pen_color " + (selectTool==='pen'? 'showOption' : '')}>
                            <li className={drawOption.color==='black'? 'selectedTool' : ''} style={{backgroundColor : 'black'}} onClick={() => setdrawOption(state => ({...state, color : 'black'}) )}>black</li>
                            <li className={drawOption.color==='red'? 'selectedTool' : ''} style={{backgroundColor : 'red'}} onClick={() => setdrawOption(state => ({...state, color : 'red'}) )}>red</li>
                            <li className={drawOption.color==='blue'? 'selectedTool' : ''} style={{backgroundColor : 'blue'}} onClick={() => setdrawOption(state => ({...state, color : 'blue'}) )}>blue</li>
                            <li className={drawOption.color==='green'? 'selectedTool' : ''} style={{backgroundColor : 'green'}} onClick={() => setdrawOption(state => ({...state, color : 'green'}) )}>green</li>
                            <li className={drawOption.color==='erase'? 'selectedTool' : ''} style={{backgroundColor : 'white'}} onClick={() => setdrawOption(state => ({...state, color : 'erase'}) )}>erase</li>
                            <li className={drawOption.width===2? 'selectedTool':''} style={{fontSize : '100%'}} onClick={() => setdrawOption(state => ({...state, width : 2}))}>2px</li>
                            <li className={drawOption.width===4? 'selectedTool':''} style={{fontSize : '100%'}} onClick={() => setdrawOption(state => ({...state, width : 4}))}>4px</li>
                            <li className={drawOption.width===6? 'selectedTool':''} style={{fontSize : '100%'}} onClick={() => setdrawOption(state => ({...state, width : 6}))}>6px</li>
                            <li className={drawOption.width===10? 'selectedTool':''} style={{fontSize : '100%'}} onClick={() => setdrawOption(state => ({...state, width : 10}))}>10px</li>
                        </ul>
                    </div>
                    <div className="cmake_t_sticker">
                        <button onClick={(e) => {e.preventDefault(); setselectTool(state => 'sticker')}} >스티커</button>
                        <ul className={"cmake_sticker " + (selectTool==='sticker'? 'showOption' : '')}>
                           {stickers.map((v,i) => (
                            <li onClick={() => addSticker(v[1])} key={`sticker_${i}`}>
                                {v[0]}
                                <img src={v[1]} />
                            </li>
                           ))}
                        </ul>
                    </div>
                    <div className="cmake_t_text">
                        <button>텍스트</button>
                    </div>
                </div>
                <div className="cmake_board" id="elementToCapture">
                    <img src={nowSelect} />
                    <canvas ref={imageCanvas}></canvas>
                    {stickerList.map((v,i) => (
                        <div className="cmake_b_sticker" key={`sticker_${i}`}>
                            <img src={v} draggable="false"/>
                        </div>
                    ))}
                </div>
                <div className="cmake_submit">
                    <button onClick={(e) => {e.preventDefault(); uploadStory()}}>업로드</button>
                </div>
            </div>
        )
    }
    return(
        <div id="stories">
            <div className="storiesBox">
                <ComponentMake />
            </div>
        </div>
    )
}