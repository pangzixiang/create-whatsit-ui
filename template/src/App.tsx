import {useEffect, useState} from 'react'
import './App.css'

function App() {
    const [text, setText] = useState("")
    useEffect(() => {
        fetch("/test-service/a").then(res => res.text()).then(txt => setText(txt));
    }, []);
    return (
        <>
            <p>{text}</p>
        </>
    )
}

export default App
