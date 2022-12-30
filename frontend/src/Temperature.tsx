interface TemperatureProps {
    value: number | undefined;
}

export default function Temperature(props: TemperatureProps) {
    const color = (
        props.value === undefined ? "bg-gray-500" :
            props.value < 18 ? "bg-blue-600" :
                props.value < 20 ? "bg-emerald-900" : 
                    "bg-red-900"                  
    );
    return (
        <div className={`py-1 ${color}`}>
            <h1>Temperature: {props.value ?? "-"}°C</h1>
        </div>
    );
}
