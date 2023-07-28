import '../css/account.css'
import { useEffect } from 'react';

export default function Account(){
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
    useEffect(function(){
        const lists = document.querySelectorAll(".acc_f_list");
        lists.forEach((v,i) => {
            let n=0;
            v.querySelector(".acc_f_c_image_left").addEventListener('click',function(){
                const slide = v.querySelector(".acc_f_c_image_slide");
                const len = v.querySelectorAll(".acc_f_c_image_unit").length
                if(n < len-1){
                    n++;
                    slide.style.transform = `translateX(-${n * slide.offsetWidth / len}px)`
                }
            })
            v.querySelector(".acc_f_c_image_right").addEventListener('click',function(){
                const slide = v.querySelector(".acc_f_c_image_slide");
                const len = v.querySelectorAll(".acc_f_c_image_unit").length
                if(n > 0){
                    n--;
                    slide.style.transform = `translateX(-${n * slide.offsetWidth / len}px)`
                }
            })

        })
    },[])

    return(
        <div id="account">
            <div className="accountBox">
                <div className="acc_info">
                    <div className="acc_i_account">
                        <div className="acc_i_a_avatar">

                        </div>
                        <div className="acc_i_a_name">
                            <p className="acc_i_a_n_name"></p>
                            <p className="acc_i_a_n_id"></p>
                            <p className="acc_i_a_n_follow"></p>
                        </div>
                        <div className="acc_i_a_btn">
                            <button type="button"></button>
                            <ul className="acc_i_a_b_menu">
                                <li>follow</li>
                                <li>send message</li>
                                <li>group</li>
                                <li>block</li>
                            </ul>
                        </div>
                    </div>
                    <div className="acc_i_followBtn">
                        <a href="/#">follow</a>
                        <a href="/#">cancel follow</a>
                    </div>
                </div>
                <div className="acc_feed">
                    <ul>
                        {sampleData.map((v,i) => (
                            <li className='acc_f_list' key={v['user_id'] + "_" + i}>
                                <div className="acc_f_content">
                                    <div className="acc_f_c_account">
                                            <div className="acc_f_c_acc_avatar">
                                                <img src={v['user_photo']}/>
                                            </div>
                                            <div className="acc_f_c_acc_name">
                                                <strong>{v['user_name']}</strong><br />
                                                <span>@{v['user_id']}</span>
                                            </div>
                                        <div className="acc_f_c_acc_sub">
                                            <span>{v.time}</span>
                                            <div>
                                                <button type='button'>옵션</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="acc_f_c_text">{v.text}</div>
                                    <div className="acc_f_c_image">
                                        <div className="acc_f_c_image_slide">
                                            {v.image.map((v,i) => ( 
                                                <div key={i} className="acc_f_c_image_unit">
                                                    <img src={v}/> 
                                                </div>))}
                                        </div>
                                        <button type='button' className="acc_f_c_image_left">왼쪽으로 이동</button>
                                        <button type='button' className="acc_f_c_image_right">오른쪽으로 이동</button>

                                    </div>
                                </div>
                                <div className="acc_f_comment">
                                    <div className="acc_f_com_like">
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
                                            <li className="acc_f_com_unit" key={"comment_"+i}>
                                                <div className="acc_f_com_u_account">
                                                    <div className="acc_f_com_u_avatar">
                                                        <img src={v['user_image']} />
                                                    </div>
                                                    <div className="acc_f_com_u_name">@{v['user_id']}</div>
                                                    <div className="acc_f_com_u_time">{v.time}</div>
                                                </div>
                                                <div className="acc_f_com_u_text">{v.text}</div>
                                            </li>
                                        ))}
                                        <li className="acc_f_com_input">
                                            <div >
                                                <input type="text" />
                                                <button>submit</button>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}