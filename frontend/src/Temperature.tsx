interface TemperatureProps {
    value: number | undefined;
}

export default function Temperature(props: TemperatureProps) {
    if (props.value === undefined) {
        return (
            <div className="py-1 bg-gray-500">
                <h1>Temperature: -°C</h1>
            </div>
        );
    }
    const color = (
        props.value < 18 ? "bg-blue-600" :
            props.value < 20 ? "bg-emerald-900" :
                "bg-red-900"
    );
    return (
        <div className={`py-1 ${color}`}>
            <h1>Temperature: {props.value}°C</h1>
        </div>
    );
}