import { useState, useEffect, useCallback } from "react";
import { getPaginatedTelemetry, subscribeTelemetry } from "../services/telemetryService";

const usePaginatedTelemetry = (initialPage = 1, limit = 20) => {
  const [paginatedData, setPaginatedData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedLoading, setPaginatedLoading] = useState(true);
  const [paginatedError, setPaginatedError] = useState(null);
  const [filters, setFilters] = useState({
    startTime: null,
    endTime: null,
    anomaly: null,
    anomalyType: null
  });
  const [pauseRealtimeUpdates, setPauseRealtimeUpdates] = useState(false);

  const fetchData = useCallback(async (pageToFetch = page) => {
    try {
        setPaginatedLoading(true);
      const params = { page: pageToFetch, limit };
      
      // Add time filters if present
      if (filters.startTime) params.start_time = filters.startTime;
      if (filters.endTime) params.end_time = filters.endTime;
      
      // Handle anomaly filtering
      if (filters.anomaly !== null) {
        params.anomaly = filters.anomaly.toString();
      }

      // Add anomaly type if specified
      if (filters.anomalyType) {
        params.anomaly_type = filters.anomalyType;
      }

      console.log("Fetching page", pageToFetch, "with params:", params);
      const res = await getPaginatedTelemetry(params);

      if (!res || !Array.isArray(res.data)) {
        throw new Error("API returned invalid data");
      }

      setPaginatedData(res.data);
      setTotal(res.total);
      setTotalPages(res.total_pages || 1); // Ensure we have at least 1 page
      setPaginatedError(null);
    } catch (err) {
      console.error("Error fetching paginated telemetry:", err);
      setPaginatedError(err.message);
    } finally {
        setPaginatedLoading(false);
    }
  }, [page, limit, filters]);

  // Fetch on mount and whenever page, limit, or filters change
  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

  // Set up WebSocket for real-time updates
  useEffect(() => {
    // Only use WebSocket updates on the first page and when not paused
    if (page !== 1 || pauseRealtimeUpdates) return;
    
    // Subscribe to telemetry updates via WebSocket
    const unsubscribe = subscribeTelemetry((newTelemetry) => {
      // Only update if real-time updates are not paused
      if (!pauseRealtimeUpdates) {
        // Only if we're on the first page and don't have active time filters
        if (page === 1 && !filters.startTime && !filters.endTime) {
          // Check if we should include this item based on anomaly filters
          let shouldInclude = true;
          
          if (filters.anomaly !== null) {
            if (filters.anomaly === true) {
              // Check for any anomaly or specific anomaly type
              if (filters.anomalyType) {
                // Filter by specific anomaly type
                switch (filters.anomalyType) {
                  case 'temperature':
                    shouldInclude = newTelemetry.TemperatureAnomaly;
                    break;
                  case 'battery':
                    shouldInclude = newTelemetry.BatteryAnomaly;
                    break;
                  case 'altitude':
                    shouldInclude = newTelemetry.AltitudeAnomaly;
                    break;
                  case 'signal':
                    shouldInclude = newTelemetry.SignalAnomaly;
                    break;
                  default:
                    shouldInclude = newTelemetry.Anomaly;
                }
              } else {
                // Filter by any anomaly
                shouldInclude = newTelemetry.Anomaly;
              }
            } else {
              // Filter by no anomalies
              shouldInclude = !newTelemetry.Anomaly;
            }
          }
            
          if (shouldInclude) {
            setPaginatedData(prevData => {
              // Create a new array with the new telemetry at the beginning
              const updatedData = [newTelemetry, ...prevData.slice(0, limit - 1)];
              return updatedData;
            });
            
            // Increment total count
            setTotal(prevTotal => prevTotal + 1);
            
            // Recalculate total pages if needed
            const newTotalPages = Math.ceil((total + 1) / limit);
            if (newTotalPages !== totalPages) {
              setTotalPages(newTotalPages);
            }
          }
        }
      }
    });
    
    return () => {
      unsubscribe(); // Clean up WebSocket listener
    };
  }, [page, limit, filters, total, totalPages, pauseRealtimeUpdates]);

  // Method to update filters
  const updateFilters = useCallback((newFilters) => {
    console.log("Updating filters:", newFilters);
    
    // If page is specified in the new filters, update it separately
    if (newFilters.page !== undefined) {
      setPage(newFilters.page);
      // Remove page from newFilters to avoid it being added to filters state
      const { page: _, ...filtersWithoutPage } = newFilters;
      newFilters = filtersWithoutPage;
    }
    
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Toggle pause real-time updates
  const setPauseUpdates = useCallback((shouldPause) => {
    setPauseRealtimeUpdates(shouldPause);
  }, []);

  // Check if real-time updates are active
  const isRealtimeActive = page === 1 && !filters.startTime && !filters.endTime && !pauseRealtimeUpdates;

  return {
    paginatedData,
    page,
    total,
    totalPages,
    paginatedLoading,
    paginatedError,
    setPage,
    filters,
    updateFilters,
    refreshData: fetchData,
    setPauseUpdates,
    isRealtimeActive
  };
};

export default usePaginatedTelemetry;