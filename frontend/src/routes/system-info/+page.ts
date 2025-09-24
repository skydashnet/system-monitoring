import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  try {
    const response = await fetch('http://localhost:3001/api/system-info');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const systemInfo = await response.json();
    return {
      systemInfo,
      error: null 
    };
  } catch (error: any) {
    console.error('Could not fetch system info:', error);
    return {
      systemInfo: null,
      error: 'Failed to load system information.'
    };
  }
};