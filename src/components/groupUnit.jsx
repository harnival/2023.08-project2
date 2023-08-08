import { collection, onSnapshot, where, query, getDoc, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom"
import { useFirestore } from "../datasource/firebase";

export default function GroupUnit(props) {
    let {groupID} = useParams();
    const [currentPage, setcurrentPage] = useState(groupID)
    const [loadPage, setloadPage] = useState([])
    const [pageNames, setpageNames] = useState()
    const location = useLocation()

    useEffect(function(){
        setpageNames(state => location.state.title)
        const q = query(collection(useFirestore,'posts'),where('group','==',groupID))
        onSnapshot(q, async(snapshotDoc) => {
            const arrs = await Promise.all(
                [...snapshotDoc.docs].map(async(v) => {
                    const data1 = await getDoc(doc(useFirestore,'account',v.data().uid));
                    const data2 = data1.data();
                    return ({...v.data(), name : data2.general.name, photoURL : data2.general.photoURL, postID : v.id})
                })
            )
            setloadPage(state => [...arrs])
        })
    },[currentPage])

    return(
        <div id="groupUnit">
            <div>
                <h3>{pageNames}</h3>
            </div>
            <ul>
                {loadPage.map(v => (
                    <li className="gu_listUnit" key={`groupUnit_${v.postID}`}>
                        <div>
                            <div>
                                <img src={v.photoURL} alt="" />
                            </div>
                            <p>{v.name}</p>
                        </div>
                        <p>{v.text}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}