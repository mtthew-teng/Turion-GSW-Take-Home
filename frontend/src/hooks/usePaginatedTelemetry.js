import { useState, useEffect, useCallback } from "react";
import { getPaginatedTelemetry, subscribeTelemetry } from "../services/telemetryService";
import { 
  hasTemperatureAnomaly, 
  hasBatteryAnomaly, 
  hasAltitudeAnomaly, 
  hasSignalAnomaly 
} from "../utils/anomalyConstants";

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

  // Determine if real-time updates should be active
  const isRealtimeActive = useCallback(() => {
    return page === 1 && !pauseRealtimeUpdates;
  }, [page, pauseRealtimeUpdates]);

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

      const res = await getPaginatedTelemetry(params);

      if (!res || !Array.isArray(res.data)) {
        throw new Error("API returned invalid data");
      }

      setPaginatedData(res.data);
      setTotal(res.total);
      setTotalPages(res.total_pages || 1);
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

  // Effect to handle real-time updates via WebSocket
  useEffect(() => {
    // Only subscribe if real-time updates are active
    if (!isRealtimeActive()) return;
    
    const unsubscribe = subscribeTelemetry((newTelemetry) => {
      // Check if we should include this item based on anomaly filters
      let shouldInclude = true;
      
      if (filters.anomaly !== null) {
        // Check if the telemetry has any anomaly flags set
        const hasAnyAnomaly = newTelemetry.AnomalyFlags > 0;
        
        if (filters.anomaly === true) {
          // We want items with anomalies
          if (filters.anomalyType) {
            // Filter by specific anomaly type
            switch (filters.anomalyType) {
              case 'temperature':
                shouldInclude = hasTemperatureAnomaly(newTelemetry.AnomalyFlags);
                break;
              case 'battery':
                shouldInclude = hasBatteryAnomaly(newTelemetry.AnomalyFlags);
                break;
              case 'altitude':
                shouldInclude = hasAltitudeAnomaly(newTelemetry.AnomalyFlags);
                break;
              case 'signal':
                shouldInclude = hasSignalAnomaly(newTelemetry.AnomalyFlags);
                break;
              default:
                shouldInclude = hasAnyAnomaly;
            }
          } else {
            // Any anomaly
            shouldInclude = hasAnyAnomaly;
          }
        } else {
          // We want items WITHOUT anomalies
          shouldInclude = !hasAnyAnomaly;
        }
      }
        
      if (shouldInclude) {
        setPaginatedData(prevData => {
          // Create a new array with the new telemetry at the beginning
          return [newTelemetry, ...prevData.slice(0, limit - 1)];
        });
        
        // Increment total count
        setTotal(prevTotal => prevTotal + 1);
        
        // Recalculate total pages if needed
        setTotalPages(current => Math.max(current, Math.ceil((total + 1) / limit)));
      }
    });
    
    return unsubscribe;
  }, [isRealtimeActive, filters, total, limit]);

  // Method to update filters
  const updateFilters = useCallback((newFilters) => {
    // If page is specified in the new filters, update it separately
    if (newFilters.page !== undefined) {
      setPage(newFilters.page);
      // Remove page from newFilters
      const { page: _, ...filtersWithoutPage } = newFilters;
      newFilters = filtersWithoutPage;
    }
    
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

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
    setPauseUpdates: setPauseRealtimeUpdates,
    isRealtimeActive: isRealtimeActive()
  };
};

export default usePaginatedTelemetry;