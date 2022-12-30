import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import Card from './Card';
import Temperature from './Temperature';

export default function App() {
  const { sendMessage, lastMessage } = useWebSocket(
    `ws://${import.meta.env.PROD ? window.location.hostname : import.meta.env.VITE_ESP32_URI}/ws`,
    { shouldReconnect: (closeEvent) => true }
  );
  const [ledState, setLedState] = useState("OFF");
  const [temperature, setTemperature] = useState<number>();

  useEffect(() => {
    const msg = lastMessage?.data;
    if (msg === undefined) return;
    if (msg == "ON" || msg == "OFF") {
      setLedState(msg);
    } else {
      setTemperature(parseFloat(msg));
    }
  }, [lastMessage]);

  return (
    <div className="bg-slate-800 text-2xl">
      <div className="text-center min-h-screen text-white p-8 max-w-screen-sm my-0 mx-auto">
        <h1 className='text-4xl font-bold my-5'>M5Stick Thermostat</h1>
        <Temperature value={temperature} />
        <Card pinName="10" pinState={ledState} onBtnClick={() => sendMessage("toggle")} />
      </div>
    </div>
  );
}
