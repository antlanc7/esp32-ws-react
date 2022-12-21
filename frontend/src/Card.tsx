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
  <div className="card">
    <h2>Output - GPIO {props.pinName}</h2>
    <p className="state" style={pinStateStyle}>{props.pinState}</p>
    <button className="button" onClick={props.onBtnClick}>Toggle</button>
  </div>
  );
}
