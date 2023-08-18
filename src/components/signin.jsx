import { redirect } from "react-router-dom"
import { doc, collection, getDocs, query, where } from "firebase/firestore";
import { useFirestore, registUser, useAuth, findEmail } from "../datasource/firebase";
import { useState, useRef, useEffect, useMemo } from "react";

import '../css/signin.css';

export default function Signin(){
    // common ===================================================== //

    // 페이지 넘버 //
    const [pageNumber, setpageNumber] = useState(1)
    const goToPage = function(n){
        setpageNumber(n)
    }
    useEffect(function(){
        if(pageNumber === 0) {
            registUser(infoData.current)
        }
    },[pageNumber])
    // --------------------//
    const infoData = useRef({
        info : {},
        subInfo : {}
    })
    const inputInfo = function(event){
        event.preventDefault();
        const q = event.target;
        const w = new FormData(q);
        const data = Object.fromEntries(w.entries());

        if(pageNumber === 1){
            const r = infoData.current.info
            infoData.current.info = {...r, ...data};
            console.log(infoData.current.info)
            goToPage(2)
        } else if(pageNumber === 2){
            const r = infoData.current.subInfo
            infoData.current.subInfo = {...r, ...data};
            console.log(infoData.current)
            goToPage(3)
        } else if(pageNumber === 3){
            const r = infoData.current.subInfo
            infoData.current.subInfo = {...r, ...data};
            console.log(infoData.current)
            goToPage(4)
        } else if(pageNumber === 4){
            const r = infoData.current.subInfo
            infoData.current.subInfo = {...r, ...data};
            console.log(infoData.current)
            goToPage(0)
        } 
    }
   
    // components ----------------------------------------------------------------- //
    const Info1 = function(){
        const [requiredAuth, setrequiredAuth] = useState({
            email : null,
            pwd : false,
            pwdConfirm : null,
        })
        const checkValue = function(e){
            e.preventDefault();
            const q = e.target;
            const w = new FormData(q);
            const data = Object.fromEntries(w.entries());
            
            if( !data.email ){
                setrequiredAuth(state => ({...state, email : 1}))
            } else {
                const dataDb = collection(useFirestore, 'account');
                const getQuery = query(dataDb, where('email','==',data.email));
                getDocs(getQuery)
                .then( snapshot => {
                    const dataArr = snapshot.docs;
                    if(dataArr.length){
                        setrequiredAuth(state => ({...state, email : 2}))
                    } else {
                        if( !data.pwd ){
                            setrequiredAuth(state => ({...state, pwd : true}))
                        } else if( !data.pwd_confirm ){
                            setrequiredAuth(state => ({...state, pwdConfirm : 1}))
                        } else if( data.pwd !== data.pwd_confirm ){
                            setrequiredAuth(state => ({...state, pwdConfirm : 2}))
                        } else {
                            inputInfo(e)
                        }
                    }
                })    
            }
        }
        return(            
            <form className="ip_requireBox" onSubmit={(e) => checkValue(e)}>
                <div className="signin_inputBox">
                    <div className={"signin_ltf use_border" + (requiredAuth.email? " requiredRef" : "")} >
                        <input type="email" placeholder="이메일" name="email" onFocus={() => setrequiredAuth({...requiredAuth, email : null})}/>
                        {requiredAuth.email == 1? (<p>이메일을 입력해주세요.</p>) : null}
                        {requiredAuth.email == 2? (<p>이미 등록된 이메일입니다.</p>) : null}
                    </div>
                    <div className={"signin_ltf use_border" + (requiredAuth.pwd? " requiredRef" : "")} >
                        <input type="password" name="pwd" placeholder="비밀번호" onFocus={() => setrequiredAuth({...requiredAuth, pwd : false})}/>
                        {requiredAuth.pwd? (<p>비밀번호를 입력해주세요.</p>) : null}
                    </div>
                    <div className={"signin_ltf " + (requiredAuth.pwdConfirm? " requiredRef" : "")}>
                        <input type="password" name="pwd_confirm" placeholder="비밀번호 확인" onFocus={() => setrequiredAuth({...requiredAuth, pwdConfirm : null})}/>
                        {requiredAuth.pwdConfirm == 1? (<p>확인란을 입력해주세요.</p>) : null}
                        {requiredAuth.pwdConfirm == 2? (<p>비밀번호가 일치하지 않습니다.</p>) : null}
                    </div>
                </div>
                <div className="signin_btn">
                    <button>가입하기</button>
                </div>
                <div>
                    <p>* 이미 계정이 있는 경우 <a href="/#">로그인하기</a></p>
                </div>
            </form>
        )
    }
    function Info2(){
        return(
            <form className="ip_idBox" onSubmit={(e) => inputInfo(e)}>
                <h4>ID 입력</h4>
                <div className="ip_input_ltf">
                    <span>@</span>
                    <input type="text" name="id" placeholder="ID"/>
                </div>
                <p>* 영문 대문자 / 소문자 / 숫자 / '.', '_' 만 가능</p>
                <p>* 미입력 시, 자동으로 ID가 생성됩니다. ID는 설정에서 수정할 수 있습니다.</p>
                <div className="ip_idBox_btn">
                    <button>건너뛰기</button>
                    <button>다음</button>
                </div>
            </form>
        )
    }
    function Info3(){
        const [descNum, setdescNum] = useState(0)
        const changeNum = function(e){
            const q = e.target.value;
            setdescNum(q.length)
        }

        const [requiredInfo, setrequiredInfo] = useState(false)
        const checkValue = function(e){
            e.preventDefault();
            const q = e.target;
            const w = new FormData(q);
            const data = Object.fromEntries(w.entries());
            if(!data.name){
                setrequiredInfo(true)
            } else {
                inputInfo(e)
            }
        }
        return(
            <form className="ip_nameBox" onSubmit={(e) => checkValue(e)}>
                <h4>프로필 입력</h4>
                <div className={"signin_ltf use_border" + (requiredInfo? " requiredRef" : "")}>
                    <input type="text" name="name" placeholder="프로필 이름 (20자 이내)" maxLength={20}/>
                    {requiredInfo? (<p>프로필 이름을 입력해주십시오.</p>) : null}
                </div>
                <div className="ip_input_ltf">
                    <textarea name="description" maxLength={150} onInput={(e) => changeNum(e)} placeholder="프로필 작성"></textarea>
                    <span className="ip_desc_number">{descNum}/150</span>
                </div>
                <div className="ip_nameBox_btn">
                    <button>다음</button>
                </div>
            </form>
        )
    }
    function Info4(){
        // 프로필 사진 업로드 //
        const [avatar, setavatar] = useState();
        const imageInput = async function(event){
            const loader = event.target.files[0];
            const size = loader.size;
            const limit = 1048487;
            if(loader){
                if(size < limit) {
                    const reader = new FileReader();
                    reader.readAsDataURL(loader);
                    reader.onload = function(val){
                        setavatar(state => val.target.result)
                    }
                } else {
                    event.target.value = '';
                    alert(" 1MB 이하 이미지 파일만 등록이 가능합니다.")
                    return false;
                }
            }
        }
        let fileInput = useRef()
        const clickToImage = function(event){
            event.preventDefault();
            fileInput.click();
        }
        // -------------------- //
        return(
            <form className="ip_imageBox" onSubmit={(e) => inputInfo(e)}>
                <h4>프로필 사진 선택</h4>
                <div>
                    <div className="ip_img_wrap">
                        <img src={avatar}/>
                        <input type="file" id="ip_img_input" ref={(input) => fileInput = input} onChange={(e) => imageInput(e)} accept="image/*" hidden={true}/>
                        <button onClick={(e) => clickToImage(e)}></button>
                        <input type="hidden" name="photoURL" value={avatar? avatar : ''}/>
                    </div>
                    <p>
                        <span>- 미입력 시, 기본 이미지가 입력됩니다.</span>
                        <span>- 설정 탭에서 언제든 수정할 수 있습니다.</span>
                    </p>
                </div>
                <div className="ip_imageBox_btn">
                    <button>건너뛰기</button>
                    <button>완료</button>
                </div>
            </form>
        )
    }
    useEffect(function(){
        const q = document.querySelectorAll(".bar_step");
        [...q].map( (v,i) => {
            if(i < pageNumber){
                v.classList.add("active")
            }else {
                v.classList.remove("active")
            }
        })
    },[pageNumber])
    return(
        <div id="signin">
            <div className="l_bg_box">
                <div className="bg1"></div>
                <div className="bg2"></div>
            </div>
           <div className="infoPageBox">
                <p>RODEE에 오신 것을 환영합니다!</p>
                <p>가입을 완료하기 전 정보를 입력해주세요.</p>
                <div className="ip_formWrap">
                    <div className="ip_fw_bar">
                        <div className="bar_step bar_step1"></div>
                        <div className="bar_step bar_step2"></div>
                        <div className="bar_step bar_step3"></div>
                        <div className="bar_step bar_step4"></div>
                    </div>
                    <div className="ip_fw_content">
                        {pageNumber === 1? ( <Info1 inputInfo={inputInfo}/>
                        ) :pageNumber === 2? ( <Info2 />
                        ): pageNumber === 3? ( <Info3 />
                        ): pageNumber === 4? ( <Info4 />
                        ): pageNumber === 0? (
                            <div className="ip_goToHome">
                                <p>가입이 완료되었습니다!</p>
                                <p>이제부터 RODEE과 함께해요!</p>
                                <div className="ip_gth_btn">
                                    <a href="/#">홈 화면으로 가기</a>
                                </div>
                            </div>
                        ): goToPage(1)}
                    </div>
                </div>
                
            </div>
        </div>
    )
}