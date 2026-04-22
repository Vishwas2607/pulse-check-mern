import { useState, useEffect } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';

export const RefreshTimer = ({ queryKey }: {queryKey: QueryKey}) => {
  const queryClient = useQueryClient();
  const [secondsAgo, setSecondsAgo] = useState(0);

  const dataUpdatedAt = queryClient.getQueryState(queryKey)?.dataUpdatedAt;

  useEffect(() => {
    if (!dataUpdatedAt) return;

    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - dataUpdatedAt) / 1000);
      setSecondsAgo(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  if (!dataUpdatedAt) return null;

  return (
    <span className="text-sm w-full px-7 text-gray-400">
      Refreshed {secondsAgo === 0 ? "Just Now" : `${secondsAgo}s ago` }
    </span>
  );
};
