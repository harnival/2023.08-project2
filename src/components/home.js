import '../css/home.css'

export default function Home(){

    return(
        <div id="home">
            <div className="homeBox">
                <div className="h_category">

                </div>
                <div className="h_feed">
                    <ul>
                        <li className='h_f_list'>
                            <div className="h_f_content">
                                <div className="h_f_c_account">
                                        <div className="h_f_c_acc_avatar">
                                            <img src=""/>
                                        </div>
                                        <div className="h_f_c_acc_name">
                                            <strong>SAMPLE NAME</strong><br />
                                            <span>@SAMPLE ID</span>
                                        </div>
                                    <div className="h_f_c_acc_sub">
                                        <span>sample time</span>
                                        <button type='button' ></button>
                                    </div>
                                </div>
                                <div className="h_f_c_text">sample text--------</div>
                                <div className="h_f_c_image"></div>
                            </div>
                            <div className="h_f_comment">
                                <div className="h_f_com_unit">
                                    <div className="h_f_com_u_account"></div>
                                    <div className="h_f_com_u_text"></div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}