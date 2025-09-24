import { writable } from 'svelte/store';
import type { SystemMetrics } from './types';

export interface MetricsState {
  latest: SystemMetrics;
  history: {
    time: string;
    cpuUsage: number;
    networkUp: number;
    networkDown: number;
  }[];
}

const initialState: MetricsState = {
  latest: {
    cpu: { usage: '0.0', cores: 0, temp: '0', freq: '0' },
    ram: { total: 0, used: 0, cache: 0, swapTotal: 0, swapUsed: 0 },
    disks: [],
    processes: [],
    network: { uploadSpeed: 0, downloadSpeed: 0 },
    system: {
      load: { one: 0, five: 0, fifteen: 0 },
      uptime: 0,
    },
    hostname: 'Loading...',
  },
  history: [],
};

export const metrics = writable<MetricsState>(initialState);

const setupWebSocket = () => {
  if (typeof window === 'undefined') return;

  const connect = () => {
    const ws = new WebSocket('ws://localhost:3001/ws');

    ws.onmessage = (event) => {
      try {
        const data: SystemMetrics = JSON.parse(event.data);
        if (!data) return;

        metrics.update((currentState) => {
          const newHistoryEntry = {
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            cpuUsage: parseFloat(data.cpu.usage),
            networkUp: data.network.uploadSpeed,
            networkDown: data.network.downloadSpeed,
          };

          const updatedHistory = [...currentState.history, newHistoryEntry].slice(-30);

          return {
            latest: data,
            history: updatedHistory,
          };
        });
      } catch (err) {
        console.error('Failed to parse websocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting in 2 seconds...');
      setTimeout(connect, 2000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      ws.close();
    };
  };

  connect();
};

setupWebSocket();