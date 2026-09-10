import { useEffect, useState, useRef } from "react";

/**
 * Generic data-fetching hook with loading / error / data states.
 * `fetcher` is called whenever `deps` change; stale responses (from a
 * request superseded by a newer one, e.g. rapid filter changes) are
 * discarded so the UI never flashes outdated data.
 */
export function useFetch(fetcher, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (currentRequest === requestId.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (currentRequest === requestId.current) {
          setError(err?.response?.data?.error || err.message || "Something went wrong.");
          setLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
