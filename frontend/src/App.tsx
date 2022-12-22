import { useEffect, useRef, useState } from 'react';
import './App.css';
import Card from './Card';

function App() {
  const ws = useRef<WebSocket | null>(null);
  const [ledState, setLedState] = useState("OFF");
  const [temperature, setTemperature] = useState(0);

  const temperatureStyle = {
    backgroundColor: temperature > 20 ? "red" : "blue",
    color: "white"
  }

  const sendToggle = () => {
    ws.current?.send("toggle");
  }

  const initWebSocket = () => {
    ws.current = new WebSocket(`ws://${import.meta.env.PROD ? window.location.hostname : "esp32-0abc5c.fritz.box"}/ws`)
    ws.current.onopen = () => console.log("Connected to server");
    ws.current.onclose = () => console.log("Disconnected from server");
    ws.current.onmessage = (evt) => {
      if (evt.data == "ON" || evt.data == "OFF") {
        setLedState(evt.data);
      } else {
        setTemperature(parseFloat(evt.data));
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
        <h2 className="temperature" style={temperatureStyle}>Temperature: {temperature}°C</h2>
        <Card pinName="10" pinState={ledState} onBtnClick={sendToggle} />
      </div>
    </div>
  );
}

export default App;
