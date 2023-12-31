import Editor from "./editor"
import Home from "./home"
import Message from "./message"
import Account from "./account"
import Group from "./group"
import Search from "./search"
import Setting from './setting'
import Stories from "./stories"
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
                <Route path="/setting" element={<Setting />}></Route>
                <Route path="/stories" element={< Stories />}></Route>
            </Routes>
        </div>
      
    )
}