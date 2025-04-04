import React from "react";
import { FaMountain, FaSignal } from "react-icons/fa";
import { FaTemperatureHalf, FaBatteryHalf } from "react-icons/fa6";

const CurrentTelemetry = () => {
  return (
    <div className="p-4 md:p-6 bg-white rounded-xl shadow-md h-[350px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Current Telemetry</h2>
            <span>Time</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 flex-grow">
            <div>Telemetry Item</div>
            <div>Telemetry Item</div>
            <div>Telemetry Item</div>
            <div>Telemetry Item</div>
        </div>
    </div>
  )
}

export default CurrentTelemetry