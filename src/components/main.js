import Editor from "./editor"
import Home from "./home"
import Message from "./message"
import Account from "./account"
import Group from "./group"
import Search from "./search"

import '../css/main.css'
// -----------------------------------------

// -----------------------------------------
export default function Main(props){
    
    return(
        <div id="mainBox">
            {props.mainState === 'Home'? <Home /> : 
            props.mainState === 'Message'? <Message /> : 
            props.mainState === 'Account'? <Account /> : 
            props.mainState === 'Group'? <Group /> :
            props.mainState === 'Search'? <Search /> : null
            }
        </div>
    )
}