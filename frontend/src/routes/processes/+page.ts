import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  const fetchProcesses = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/processes');
      if (!response.ok) throw new Error('Failed to fetch processes');
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  return {
    streamed: {
      processes: new Promise((resolve) => {
        fetchProcesses().then(resolve);
      })
    }
  };
};