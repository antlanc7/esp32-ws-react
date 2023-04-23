import { useEffect, useState } from "react";
import Card from "./Card";
import Temperature from "./Temperature";
import Battery from "./Battery";

import { z } from "zod";

const wsMsgSchema = z.object({
  led: z.boolean(),
  temp: z.number(),
  battery: z.number(),
  charging: z.boolean(),
});

type WsMsg = z.infer<typeof wsMsgSchema>;

export default function App() {
  const ESP_URL = import.meta.env.VITE_ESP32_URL ?? "";
  const [status, setStatus] = useState<WsMsg>({
    led: false,
    temp: 0,
    battery: 0,
    charging: false,
  });

  useEffect(() => {
    const eventSource = new EventSource(ESP_URL + "/events");
    eventSource.addEventListener("status", (event) => {
      wsMsgSchema
        .parseAsync(JSON.parse(event.data))
        .then((data) => setStatus(data))
        .catch((err) => console.error(err));
    });
    return () => eventSource.close();
  }, []);

  const setWifi = () => {
    const ssid = prompt("SSID");
    const password = prompt("Password");
    if (!ssid || !password) return;
    fetch(ESP_URL + "/wifi", {
      method: "POST",
      body: JSON.stringify({ ssid, password }),
    }).then((res) => alert(res));
  };

  const toggleLed = () => fetch(ESP_URL + "/toggle");
  const rebootM5 = () => fetch(ESP_URL + "/reboot");

  return (
    <div className="bg-slate-800 text-2xl text-center text-white">
      <div className="min-h-screen max-w-screen-sm mx-auto px-8">
        <h1 className="text-4xl font-bold py-5">M5Stick Thermostat</h1>
        <Temperature value={status.temp} />
        <Card pinState={status.led} onBtnClick={toggleLed} />
        <Battery value={status.battery} charging={status.charging} />
        <div className="flex gap-4 items-center justify-center">
          <button
            onClick={setWifi}
            className="rounded select-none py-4 px-16 bg-slate-400 text-slate-800 hover:bg-slate-300 active:translate-y-0.5"
          >
            Set WiFi
          </button>
          <button
            onClick={rebootM5}
            className="rounded select-none py-4 px-16 bg-slate-400 text-slate-800 hover:bg-slate-300 active:translate-y-0.5"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
