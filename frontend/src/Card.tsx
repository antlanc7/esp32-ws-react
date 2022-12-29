type CardProps = {
  pinName: string;
  pinState: string;
  onBtnClick: () => void;
}

export default function Card(props: CardProps) {
  const pinStateStyle = {
    backgroundColor: props.pinState === "ON" ? "gold" : "gray"
  }

  return (
    <div className="inline-block shadow-lg p-5 bg-slate-700 box-border w-full">
      <h2 className="my-5 mx-0">Output - GPIO {props.pinName}</h2>
      <p className="my-5 outline-none w-min text-slate-800 mx-auto rounded no-border py-2.5 px-6" style={pinStateStyle}>{props.pinState}</p>
      <button className="my-5 rounded select-none py-4 px-16 bg-slate-400 text-slate-800 hover:bg-slate-500 active:translate-y-0.5" onClick={props.onBtnClick}>Toggle</button>
    </div>
  );
}
