import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  const fetchContainers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/docker/containers');
      if (!response.ok) throw new Error('Failed to fetch containers');
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  return {
    containers: await fetchContainers()
  };
};