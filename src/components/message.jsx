import '../css/message.css';

export default function Message(){
    return(
        <div id="message">
            <div className="messageBox">
                <div className="m_list">
                    <div className="m_l_category">
                        <ul>
                            <li><a href="#">전체보기</a></li>
                        </ul>
                    </div>
                    <div className="m_l_list">
                        <ul>
                            <li></li>
                        </ul>
                    </div>
                </div>
                <div className="m_talkbox">
                    <div className="m_t_account">
                        <div className="m_t_a_profile">
                            <div className="m_t_a_p_image">
                                <img src=""/>
                            </div>
                            <div className="m_t_a_p_name">sample name</div>
                        </div>
                    </div>
                    <div className="m_t_messageList">
                        <ul>
                            <li></li>
                        </ul>
                    </div>
                    <div className="m_t_input">
                        <div className="m_t_imageBox">
                        </div>
                        <div className="m_t_text">
                            <div className="m_t_i_btn">
                                <button type="button">이미지 첨부</button>
                            </div>
                            <div className="m_t_i_input">
                                <input type="text" name="text"/>
                            </div>
                            <div className="m_t_i_submit">
                                <button type="button">보내기</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}