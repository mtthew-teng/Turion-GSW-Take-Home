import React from 'react'

const Home = () => {
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
          <div>Graph</div>
          <div>Graph</div>
          <div>Graph</div>
          <div>Graph</div>
        </div>

        {/* Right column - Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div>Current Telemetry</div>
          <div>Aggregate Statistics</div>
        </div>
        
      </div>

      {/* Telemetry Table Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Telemetry History</h2>
        </div>
        <div>Table</div>
      </div>
    </div>
  )
}

export default Home