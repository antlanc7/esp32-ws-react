import { useEffect, useState } from 'react';
import BatteryGauge from 'react-battery-gauge';
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
  const [batteryLevel, setBatteryLevel] = useState<number>();
  const [isBatteryCharging, setIsBatteryCharging] = useState(false);

  useEffect(() => {
    if (!lastMessage) return;
    const msg = lastMessage.data as string;
    const msgSplit = msg.split(":");
    const value = msgSplit[1];
    switch (msgSplit[0]) {
      case "0":
        setLedState(value === "1" ? "ON" : "OFF");
        break;
      case "1":
        setTemperature(parseFloat(value));
        break;
      case "2":
        setBatteryLevel(parseFloat(value));
        break;
      case "3":
        setIsBatteryCharging(value === "1");
        break;
    }
  }, [lastMessage]);

  return (
    <div className="bg-slate-800 text-2xl text-center text-white">
      <div className="min-h-screen max-w-screen-sm mx-auto px-8">
        <div className="flex justify-around items-center px-5">
          <h1 className='text-4xl font-bold py-5'>Thermostat</h1>
          <BatteryGauge value={batteryLevel ?? -1} charging={isBatteryCharging} size={100} />
        </div>
        <Temperature value={temperature} />
        <Card pinName="10" pinState={ledState} onBtnClick={() => sendMessage("toggle")} />
      </div>
    </div>
  );
}
