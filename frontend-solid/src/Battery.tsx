export default function Battery(props: { value: number; charging: boolean }) {
  return (
    <div class="flex flex-col items-center p-4">
      <p class="text-2xl font-bold">
        Battery: {props.charging && "⚡"}
        {props.value}%
      </p>
    </div>
  );
}
