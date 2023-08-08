import { useParams } from "react-router-dom"

export default function MessageUnit(){
    const { pageID } = useParams()
    return(
        <div className={`message_${pageID}`}>
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
    )
}