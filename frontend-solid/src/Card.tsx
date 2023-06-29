export default function Card(props: {
  pinState: boolean;
  onBtnClick: () => void;
}) {
  return (
    <div class="inline-block shadow-lg p-5 bg-slate-700 box-border w-full rounded-lg">
      <p
        class={`my-5 w-min text-slate-800 mx-auto rounded py-2.5 px-6 ${
          props.pinState ? "bg-yellow-400" : "bg-gray-500"
        }`}
      >
        LED
      </p>
      <button
        class="my-5 rounded select-none py-4 px-16 bg-slate-400 text-slate-800 hover:bg-slate-300 active:translate-y-0.5"
        onClick={props.onBtnClick}
      >
        Toggle
      </button>
    </div>
  );
}
