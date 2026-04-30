'use client';

import { useEffect } from 'react';

export default function LogClient({ latestId }) {
  useEffect(() => {
    if (latestId) {
      localStorage.setItem('last_seen_log_id', latestId.toString());
      // Dispatch a storage event to update the sidebar immediately if needed
      window.dispatchEvent(new Event('storage'));
    }
  }, [latestId]);

  return null;
}
