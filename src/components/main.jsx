import Editor from "./editor"
import Home from "./home"
import Message from "./message"
import Account from "./account"
import Group from "./group"
import Search from "./search"
import { useAuth } from "../datasource/firebase"

import { Route, Routes, useParams } from "react-router-dom"
import '../css/main.css'
// -----------------------------------------

// -----------------------------------------
export default function Main(props){
    let {userID} = useParams();
    return(
        <div id="mainBox">
            <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route path="search" element={<Search />}></Route>
                <Route path="group/*" element={<Group />}></Route>
                <Route path="message/*" element={<Message />}></Route>
                <Route path={`account/:userID`} element={<Account />}></Route>
            </Routes>
        </div>
        // <div id="mainBox">
        //     {props.mainState === 'Home'? <Home /> : 
        //     props.mainState === 'Message'? <Message /> : 
        //     props.mainState === 'Account'? <Account userID={useAuth.currentUser.uid}/> : 
        //     props.mainState === 'Group'? <Group /> :
        //     props.mainState === 'Search'? <Search /> : null
        //     }
        // </div>
    )
}