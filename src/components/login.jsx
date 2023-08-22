import { Link, redirect } from 'react-router-dom'
import '../css/login.css'

import { userLogin } from '../datasource/firebase'

export default function Login(){

    const submitLogin = function(e){
        e.preventDefault()
        const q = new FormData(e.target);
        const data = Object.fromEntries(q.entries());
        userLogin(data.email, data.pwd);
        redirect("/")
    }

    return(
        <div className='loginPage'>
            <div className="l_bg_box">
                <div className="bg1"></div>
                <div className="bg2"></div>
            </div>
            <div className="l_header">
                <Link to='/signin'>가입하기</Link>
            </div>
            <div className="loginFormWrap">
                <div className="lf_icon">
                    <div className="lf_icon_box">
                        <img src="img/icons/rodent-icon.png" />
                    </div>
                    <div className="lf_icon_title">
                        <img src="img/icons/title2.png" />
                    </div>
                </div>
                <form className='loginForm' onSubmit={(e) => submitLogin(e)}>
                    <div>
                        <p style={{wordBreak : 'keep all', whiteSpace : 'nowrap', color : 'white'}}>* 가입한 이메일과 비밀번호를 입력하고 아래 버튼을 클릭하세요.</p>
                    </div>
                    <div>
                        <div className="lfn" style={{borderBottom : '1px solid black'}}>
                        <input type="text" name='email' placeholder='E-MAIL'/>
                        </div>
                        <div className="lfn">
                            <input type="password" name='pwd'  placeholder='PASSWORD'/>
                        </div>
                    </div>
                    <button className='lf_login'>LOGIN</button>
                </form>
            </div>
        </div>
    )
}