import React from "react";
import useTelemetry from "../hooks/useTelemetry";
import usePaginatedTelemetry from '../hooks/usePaginatedTelemetry';
import CurrentTelemetry from '../components/telemetry/CurrentTelemetry'
import TelemetryGraphMini from '../components/telemetry/TelemetryGraphMini';
import TelemetryTable from "../components/telemetry/TelemetryTable";

const Home = () => {
  const { realtimeData, realtimeError, realtimeLoading } = useTelemetry();
  const {
      paginatedData,
      page,
      total,
      totalPages,
      paginatedLoading,
      paginatedError,
    } = usePaginatedTelemetry(1, 20);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Graphs */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
          <TelemetryGraphMini
            initialData={paginatedData}
            latestTelemetry={realtimeData}
            error={paginatedError}
            loading={paginatedLoading}
            dataKey="Temperature"
            unit="(°C)"
            strokeColor="#F87171" 
          />
          <TelemetryGraphMini
            initialData={paginatedData}
            latestTelemetry={realtimeData}
            error={paginatedError}
            loading={paginatedLoading}
            dataKey="Battery"
            unit="(%)"
            strokeColor="#60A5FA" 
          />
          <TelemetryGraphMini
            initialData={paginatedData}
            latestTelemetry={realtimeData}
            error={paginatedError}
            loading={paginatedLoading}
            dataKey="Altitude"
            unit="(km)"
            strokeColor="#10B981" 
          />
          <TelemetryGraphMini
            initialData={paginatedData}
            latestTelemetry={realtimeData}
            error={paginatedError}
            loading={paginatedLoading}
            dataKey="Signal"
            unit="(dB)"
            strokeColor="#FACC15"
          />
        </div>

        {/* Right column - Stats */}
        <div className="lg:col-span-1 space-y-6">
          <CurrentTelemetry
            telemetry={realtimeData}
            error={realtimeError}
            loading={realtimeLoading}
          />
          <div>Aggregate Statistics</div>
        </div>
        
      </div>

      {/* Telemetry Table Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Telemetry History</h2>
        </div>
        <TelemetryTable paginatedTelemetryHook={usePaginatedTelemetry}/>
      </div>
    </div>
  )
}

export default Home