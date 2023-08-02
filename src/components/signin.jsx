import { redirect } from "react-router-dom"
import { doc, collection, getDocs, query, where } from "firebase/firestore";
import { useFirestore } from "../datasource/firebase";
import { useState, useRef, useEffect, useMemo } from "react";

import '../css/signin.css';

export default function Signin(){
    // common ===================================================== //

    // 페이지 넘버 //
    const [pageNumber, setpageNumber] = useState(1)
    const goToPage = function(n){
        setpageNumber(state => n)
    }
    // --------------------//

    const [infoData, setinfoData] = useState({
        infoForAuth : {},
        InfoForDatabase : {}
    })

    const [sampleRef, setsampleRef] = useState(false)

    const inputInfo = function(event){
        event.preventDefault();
        const q = event.target;
        const w = new FormData(q);
        const data = Object.fromEntries(w.entries());

        if(pageNumber === 1){
            if( data.email && data.pwd ){
                setinfoData(state => ({...state, infoForAuth : {...data} }));
            } else if (!data.email) {

            }
        }

    }

    // 프로필 사진 업로드 //
    const [avatar, setavatar] = useState();
    const imageInput = async function(event){
        const loader = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(loader);
        reader.onload = function(val){
            setavatar(state => val.target.result)
        }
    }
    let fileInput = useRef()
    const clickToImage = function(event){
        event.preventDefault();
        fileInput.click();
    }
    // -------------------- //

    

    // components ----------------------------------------------------------------- //
    const Info1 = function(){
        return(            
            <form className="ip_requireBox" >
                <div className="signin_inputBox">
                        <p className={'sampleClass' + (sampleRef? ' sampleTrue' : '') }>ddddddddddd</p>
                    <div className="signin_ltf use_border" >
                        <input type="email" placeholder="이메일" name="email" onFocus={() => setsampleRef(state => !state)} onBlur={() => {setsampleRef(state => !state)}}/>
                    </div>
                    <div className="signin_ltf use_border" >
                        <input type="password" name="pwd" placeholder="비밀번호"/>
                    </div>
                    <div className="signin_ltf">
                        <input type="password" name="pwd_confirm" placeholder="비밀번호 확인"/>
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
    const QQQ = useMemo(Info1);
    function Info2(){
        return(
            <form className="ip_idBox">
                <h4>ID 입력</h4>
                <div className="ip_input_ltf">
                    <span>@</span>
                    <input type="text" name="id" placeholder="ID"/>
                </div>
                <p>* 영문 대문자 / 소문자 / 숫자 / '.', '_' 만 가능</p>
                <div className="ip_idBox_btn">
                    <button>건너뛰기</button>
                    <button>다음</button>
                </div>
            </form>
        )
    }
    function Info3(){
        return(
            <form className="ip_nameBox" >
                <h4>프로필 입력</h4>
                <div className="ip_input_ltf">
                    <input type="text" name="name"/>
                </div>
                <div className="ip_input_ltf">
                    <textarea name="description" maxLength={200}></textarea>
                </div>
                <div className="ip_nameBox_btn">
                    <button>다음</button>
                </div>
            </form>
        )
    }
    function Info4(){
        return(
            <form className="ip_imageBox" >
                <h4>프로필 사진 선택</h4>
                <div>
                    <div className="ip_img_wrap">
                        <img src={avatar}/>
                        <input type="file" id="ip_img_input" ref={(input) => fileInput = input} onChange={(e) => imageInput(e)} accept="image/*" hidden={true}/>
                        <button onClick={(e) => clickToImage(e)}></button>
                        <input type="hidden" name="photoURL" value={avatar? avatar : ''}/>
                    </div>
                    <p>
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

    return(
        <div id="signin">
           <div className="infoPageBox">
                <p>@@@에 오신 것을 환영합니다!</p>
                <p>가입을 완료하기 전 정보를 입력해주세요.</p>
                <div className="ip_formWrap">
                    <div className="ip_fw_bar">
                        <div className="bar_step1"></div>
                        <div className="bar_step2"></div>
                        <div className="bar_step3"></div>
                        <div className="bar_step4"></div>
                    </div>
                    <div className="ip_fw_content">
                        {pageNumber === 1? ( <QQQ />
                        ) :pageNumber === 2? ( <Info2 />
                        ): pageNumber === 3? ( <Info3 />
                        ): pageNumber === 4? ( <Info4 />
                        ): pageNumber === 0? (
                            <div className="ip_goToHome">
                                <p>가입이 완료되었습니다!</p>
                                <p>이제부터 @@@과 함께해요!</p>
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