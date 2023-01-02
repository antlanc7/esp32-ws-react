type CardProps = {
  pinName: string;
  pinState: string;
  onBtnClick: () => void;
}

export default (props: CardProps) => (
  <div className="inline-block shadow-lg p-5 bg-slate-700 box-border w-full">
    <p className={`my-5 w-min text-slate-800 mx-auto rounded py-2.5 px-6 ${props.pinState === "ON" ? "bg-yellow-400" : "bg-gray-500"}`}>LED</p>
    <button className="my-5 rounded select-none py-4 px-16 bg-slate-400 text-slate-800 hover:bg-slate-300 active:translate-y-0.5" onClick={props.onBtnClick}>Toggle</button>
  </div>
);
