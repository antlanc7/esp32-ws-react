import { useEffect, useRef, useState } from 'react';
import Card from './Card';
import Temperature from './Temperature';

function App() {
  const ws = useRef<WebSocket | null>(null);
  const [ledState, setLedState] = useState("OFF");
  const [temperature, setTemperature] = useState<number>();

  const sendToggle = () => {
    ws.current?.send("toggle");
  }

  const initWebSocket = () => {
    const ws = new WebSocket(`ws://${import.meta.env.PROD ? window.location.hostname : import.meta.env.VITE_ESP32_URI}/ws`)
    ws.onopen = () => console.log("Connected to server");
    ws.onclose = () => console.log("Disconnected from server");
    ws.onmessage = (evt) => {
      if (evt.data == "ON" || evt.data == "OFF") {
        setLedState(evt.data);
      } else {
        setTemperature(parseFloat(evt.data));
      }
    }
    return ws;
  }

  useEffect(() => {
    ws.current ??= initWebSocket();
  }, []);

  return (
    <div className="bg-slate-800 text-2xl">
      <div className="text-center min-h-screen text-white p-8 max-w-screen-sm my-0 mx-auto">
        <h1 className='text-4xl font-bold my-5'>ESP WebSocket Server</h1>
        <Temperature value={temperature} />
        <Card pinName="10" pinState={ledState} onBtnClick={sendToggle} />
      </div>
    </div>
  );
}

export default App;
