import { redirect } from "react-router-dom"

export default function Signin(){
    const goToInfo = function(e){
        const q = new FormData(e.target);
        const data = Object.fromEntries(q.entries());
    }
    const InfoPage = function(props){

        return(
            <div className="signinBox2">
                <div className="infoPageBox">

                </div>
            </div>
        )
    }
    return(
        <div id="signin">
            <div className="signinBox1">
                <div className="formWrap">
                    <form>
                        <div className="signin_inputBox">
                            <div className="signin_ltf">
                                <input type="text" placeholder="이메일"/>
                            </div>
                            <div className="signin_ltf">
                                <input type="text" placeholder="비밀번호"/>
                            </div>
                            <div className="signin_ltf">
                                <input type="text" placeholder="비밀번호 확인"/>
                            </div>
                        </div>
                        <div className="signin_btn">
                            <button>가입하기</button>
                        </div>
                    </form>
                    <div>
                        <p>* 이미 계정이 있는 경우 <a href="/#">로그인하기</a></p>
                    </div>
                </div>
            </div>
        </div>
    )
}