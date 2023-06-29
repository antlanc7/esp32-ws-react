export default function Temperature(props: { value: number }) {
  const color = () =>
    props.value === undefined
      ? "bg-gray-500"
      : props.value < 18
      ? "bg-blue-600"
      : props.value < 20
      ? "bg-emerald-900"
      : "bg-red-900";
  return (
    <h1 class={`py-2 ${color()}`}>
      Temperature: <b>{props.value}°C</b>
    </h1>
  );
}
