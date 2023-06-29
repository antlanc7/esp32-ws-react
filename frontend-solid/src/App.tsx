import { createSignal, onCleanup } from "solid-js";
import { z } from "zod";
import Temperature from "./Temperature";
import Card from "./Card";
import Battery from "./Battery";

const wsMsgSchema = z.object({
  led: z.boolean(),
  temp: z.number(),
  battery: z.number(),
  charging: z.boolean(),
});

type WsMsg = z.infer<typeof wsMsgSchema>;

const App = () => {
  const ESP_URL = import.meta.env.VITE_ESP32_URL ?? "";
  const [status, setStatus] = createSignal<WsMsg>({
    led: false,
    temp: 0,
    battery: 0,
    charging: false,
  });

  const eventSource = new EventSource(ESP_URL + "/events");
  eventSource.addEventListener("status", (event) => {
    wsMsgSchema
      .parseAsync(JSON.parse(event.data))
      .then((data) => setStatus(data))
      .catch((err) => console.error(err));
  });

  onCleanup(() => eventSource.close());

  const setWifi = () => {
    const ssid = prompt("SSID");
    const password = prompt("Password");
    if (!ssid || !password) return;
    fetch(ESP_URL + "/wifi", {
      method: "POST",
      body: JSON.stringify({ ssid, password }),
    })
      .then((res) => res.json())
      .then((res) => alert(res));
  };

  const toggleLed = () => fetch(ESP_URL + "/toggle");
  const rebootM5 = () => fetch(ESP_URL + "/reboot");

  return (
    <div class="bg-slate-800 text-2xl text-center text-white">
      <div class="min-h-screen max-w-screen-sm mx-auto px-8">
        <h1 class="text-4xl font-bold py-5">M5Stick Thermostat</h1>
        <Temperature value={status().temp} />
        <Card pinState={status().led} onBtnClick={toggleLed} />
        <Battery value={status().battery} charging={status().charging} />
        <div class="flex gap-4 items-center justify-center">
          <button
            onClick={setWifi}
            class="rounded select-none py-4 px-16 bg-slate-400 text-slate-800 hover:bg-slate-300 active:translate-y-0.5"
          >
            Set WiFi
          </button>
          <button
            onClick={rebootM5}
            class="rounded select-none py-4 px-16 bg-slate-400 text-slate-800 hover:bg-slate-300 active:translate-y-0.5"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
