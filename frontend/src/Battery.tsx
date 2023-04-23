export default function Battery(props: { value: number; charging: boolean }) {
  // battery svg
  return (
    <div className="flex flex-col items-center p-4">
      <p className="text-2xl font-bold">
        Battery: {props.charging && "⚡"}
        {props.value}%
      </p>
    </div>
  );
}
