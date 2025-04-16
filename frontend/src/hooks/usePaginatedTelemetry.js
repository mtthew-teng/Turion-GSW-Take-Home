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

  // Determine if real-time updates should be active
  const isRealtimeActive = useCallback(() => {
    return page === 1 && 
           !filters.startTime && 
           !filters.endTime && 
           !pauseRealtimeUpdates;
  }, [page, filters.startTime, filters.endTime, pauseRealtimeUpdates]);

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
        const hasAnomaly = newTelemetry.AnomalyFlags > 0;
        
        if (filters.anomaly === true) {
          // We want items with anomalies
          if (filters.anomalyType) {
            // Filter by specific anomaly type
            switch (filters.anomalyType) {
              case 'temperature':
                shouldInclude = (newTelemetry.AnomalyFlags & 1) !== 0;
                break;
              case 'battery':
                shouldInclude = (newTelemetry.AnomalyFlags & 2) !== 0;
                break;
              case 'altitude':
                shouldInclude = (newTelemetry.AnomalyFlags & 4) !== 0;
                break;
              case 'signal':
                shouldInclude = (newTelemetry.AnomalyFlags & 8) !== 0;
                break;
              default:
                shouldInclude = hasAnomaly;
            }
          } else {
            // Any anomaly
            shouldInclude = hasAnomaly;
          }
        } else {
          // We want items WITHOUT anomalies
          shouldInclude = !hasAnomaly;
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

  // Effects to pause real-time updates when certain conditions change
  useEffect(() => {
    // Automatically pause updates when not on page 1
    if (page !== 1) {
      setPauseRealtimeUpdates(true);
    }
  }, [page]);

  useEffect(() => {
    // Pause updates when time filters are active
    if (filters.startTime || filters.endTime) {
      setPauseRealtimeUpdates(true);
    }
  }, [filters.startTime, filters.endTime]);

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