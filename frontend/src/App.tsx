import { useEffect, useRef, useState } from 'react';
import './App.css';
import Card from './Card';

function App() {
  const ws = useRef<WebSocket|null>(null);
  const [ledState, setLedState] = useState("OFF");

  const sendToggle = () => {
    ws.current?.send("toggle");
  }

  const initWebSocket = () => {
    ws.current = new WebSocket(`ws://${import.meta.env.PROD ? window.location.hostname : "192.168.137.162"}/ws`)
    ws.current.onopen = () => console.log("Connected to server");
    ws.current.onclose = () => console.log("Disconnected from server");
    ws.current.onmessage = (evt) => {
      switch (evt.data) {
        case "0":
          setLedState("OFF");
          break;
        case "1":
          setLedState("ON");
          break;
        default:
          console.log("Unknown message: " + evt.data);
      }
    }
  }

  useEffect(() => {
    if (ws.current == null) initWebSocket();
  }, []);

  return (
    <div className="App">
      <div className="content">
        <div className="topnav">
          <h1>ESP WebSocket Server</h1>
        </div>
        <Card pinName="10" pinState={ledState} onBtnClick={sendToggle}/>
      </div>
    </div>
  );
}

export default App;
