import Editor from "./editor"
import Home from "./home"
import Message from "./message"
import '../css/main.css'
// -----------------------------------------
import { useState } from "react"

// -----------------------------------------
export default function Main(props){
    
    return(
        <div id="mainBox">
            {props.mainState === 'Home'? <Home /> : 
            props.mainState === 'Message'? <Message /> : null
            }
        </div>
    )
}