import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './reset.css';
import { BrowserRouter as Router } from 'react-router-dom';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Router>
        <App />
    </Router>
);

if("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js")
        .then(reg => {
            reg.pushManager.getSubscription();
            reg.showNotification("서비스워커 등록 후", {
                body: "현재 : " + new Date()
            })
        })
}
if( !("Notification" in window)) {
    alert("알림 지원 안 됨.")
} else if(!Notification.permission || Notification.permission == "default") {
    Notification.requestPermission()
        .then(res => {
            if( res == "granted"){
              alert("notification permitted.")
            }
        })
} else if( Notification.permission == "granted") {
    console.log("[notification] permitted.")
} else if( Notification.permission == "denied") {
    console.log("[notification] denied");
}