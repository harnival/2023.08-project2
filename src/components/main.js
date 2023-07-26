import Editor from "./editor"
import Home from "./home"
import '../css/main.css'
// -----------------------------------------
import { useState } from "react"

// -----------------------------------------
export default function Main(props){
    
    return(
        <div id="mainBox">
            {props.mainState === 'Home'? <Home /> : null
            }
        </div>
    )
}