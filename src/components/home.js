import '../css/home.css'

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
            '../assets/img/sample1.jpg',
            '../assets/img/sample2.jpg',
            '../assets/img/sample3.png',
            '../assets/img/sample4.jpg'
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
        ]
    }]

    return(
        <div id="home">
            <div className="homeBox">
                <div className="h_category">
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
                                            {v.image.map((v,i) => ( <img key={i} src={v}/> ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="h_f_comment">
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