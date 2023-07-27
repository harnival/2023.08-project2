import '../css/home.css'

import {useEffect} from 'react';
export default function Home(){

    // ----------------------------------------
    // avatar --> account 페이지 이동
    // 욥션 --> 수정/삭제/팔로우/차단
    // comment --> 작성 / 삭제
    // 게시글 슬라이드
    // ----------------------------------------
    const sampleData = [{
        time : 123456789,
        user_name : 'sample name',
        user_id : 'sample id',
        user_photo : null,
        text : 'sample text---',
        image : [
            '/img/sample1.jpg',
            '/img/sample2.jpg',
            '/img/sample3.png',
            '/img/sample4.jpg'
        ],
        comment : [{
            user_id : 'sample comment id 1',
            user_image : null,
            text : 'sample comment text 1',
            time : 123456789
            },{
            user_id : 'sample comment id 2',
            user_image : null,
            text : 'sample comment text 2',
            time : 22222222
            }
        ],
        like : 15
    }]
    const userData = {
        name : 'sample name',
        id : 'sample id',
        email : 'sample email',
        board : {
            sampleGroup1 : [
                {text : 'sample text1',
                time : 123456789},
                {text : 'sample text2',
                time : 123488889}
            ]
        }
    }
    const newData = {
        id : 'user id',
        text : "sample new text",
        image : [],
        time : 123456789
    }
    // 게시물 이미지 슬라이드 //
    useEffect(function(){
        const lists = document.querySelectorAll(".h_f_list");
        lists.forEach((v,i) => {
            let n=0;
            v.querySelector(".h_f_c_image_left").addEventListener('click',function(){
                const slide = v.querySelector(".h_f_c_image_slide");
                const len = v.querySelectorAll(".h_f_c_image_unit").length
                if(n < len-1){
                    n++;
                    slide.style.transform = `translateX(-${n * slide.offsetWidth / len}px)`
                }
            })
            v.querySelector(".h_f_c_image_right").addEventListener('click',function(){
                const slide = v.querySelector(".h_f_c_image_slide");
                const len = v.querySelectorAll(".h_f_c_image_unit").length
                if(n > 0){
                    n--;
                    slide.style.transform = `translateX(-${n * slide.offsetWidth / len}px)`
                }
            })

        })
    },[])
    return(
        <div id="home">
            <div className="homeBox">
                <div className="h_category">
                    <ul>
                        <li></li>
                    </ul>
                </div>
                <div className="h_new">
                    <form>
                        <div>
                            <input type="text" readOnly={true} placeholder='그룹 선택'/>
                            <ul>
                                
                            </ul>
                        </div>
                        <div>
                            <textarea name="text" id="" maxLength="200"></textarea>
                            <div>
                                {newData['image'].map((v,i) => ( <img src={v} /> ))}
                            </div>
                        </div>
                        <div className="h_new_btn">
                            <button type='submit' className='h_new_submit'>게시</button>
                            <button type='button' className='h_new_cancel'>취소</button>
                        </div>
                    </form>
                    <a href="/" onClick={(e) => e.preventDefault()} className='h_new_door'>새 글</a>
                </div>
                <div className="h_feed">
                    <ul>
                        {sampleData.map((v,i) => (
                            <li className='h_f_list' key={v['user_id'] + "_" + i}>
                                <div className="h_f_content">
                                    <div className="h_f_c_account">
                                            <div className="h_f_c_acc_avatar">
                                                <img src={v['user_photo']}/>
                                            </div>
                                            <div className="h_f_c_acc_name">
                                                <strong>{v['user_name']}</strong><br />
                                                <span>@{v['user_id']}</span>
                                            </div>
                                        <div className="h_f_c_acc_sub">
                                            <span>{v.time}</span>
                                            <div>
                                                <button type='button'>옵션</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h_f_c_text">{v.text}</div>
                                    <div className="h_f_c_image">
                                        <div className="h_f_c_image_slide">
                                            {v.image.map((v,i) => ( 
                                                <div key={i} className="h_f_c_image_unit">
                                                    <img src={v}/> 
                                                </div>))}
                                        </div>
                                        <button type='button' className="h_f_c_image_left">왼쪽으로 이동</button>
                                        <button type='button' className="h_f_c_image_right">오른쪽으로 이동</button>

                                    </div>
                                </div>
                                <div className="h_f_comment">
                                    <div className="h_f_com_like">
                                        <div>
                                            <button type='button'>likes</button>
                                            <span>{v.like}</span>
                                        </div>
                                        <div>
                                            <button type='button'>send</button>
                                        </div>
                                    </div>
                                    <ul>
                                        {v.comment.map((v,i) => (
                                            <li className="h_f_com_unit" key={"comment_"+i}>
                                                <div className="h_f_com_u_account">
                                                    <div className="h_f_com_u_avatar">
                                                        <img src={v['user_image']} />
                                                    </div>
                                                    <div className="h_f_com_u_name">@{v['user_id']}</div>
                                                    <div className="h_f_com_u_time">{v.time}</div>
                                                </div>
                                                <div className="h_f_com_u_text">{v.text}</div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="h_f_com_input">
                                        <input type="text" />
                                        <button>submit</button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}