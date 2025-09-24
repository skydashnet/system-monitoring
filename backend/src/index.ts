import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { getSystemMetrics } from './services/metricsService';
import { getProcessList } from './services/processesService';
import { getDockerContainers, getDockerLogs, startContainer, stopContainer, restartContainer } from './services/dockerService';
import { getSystemInfo } from './services/systemInfoService'; 
import type { ServerWebSocket } from 'bun';

const clientIntervals = new Map<string, NodeJS.Timeout>();

const app = new Elysia()
  .use(cors())
  .get('/api/metrics', async () => {
    const metrics = await getSystemMetrics();
    return metrics;
  })
  .get('/api/processes', async () => {
    const processes = await getProcessList();
    return processes;
  })
  .post('/api/processes/kill', async ({ body }) => {
    const { pid } = body;
    console.log(`Received request to kill process with PID: ${pid}`);
    try {
      process.kill(pid, 'SIGTERM'); 
      return { success: true, message: `Signal sent to process ${pid}` };
    } catch (error: any) {
      console.error(`Failed to kill process ${pid}:`, error.message);
      return { success: false, message: error.message };
    }
  }, { 
    body: t.Object({
      pid: t.Numeric()
    })
  })
  .get('/api/docker/containers', async () => {
    return await getDockerContainers();
  })
  .get('/api/docker/logs/:id', async ({ params: { id } }) => {
    return await getDockerLogs(id);
  })
  .post('/api/docker/start', ({ body }) => startContainer(body.id), {
    body: t.Object({ id: t.String() })
  })
  .post('/api/docker/stop', ({ body }) => stopContainer(body.id), {
    body: t.Object({ id: t.String() })
  })
  .post('/api/docker/restart', ({ body }) => restartContainer(body.id), {
    body: t.Object({ id: t.String() })
  })
  .get('/api/system-info', async () => {
    const info = await getSystemInfo();
    return info;
  })
  .ws('/ws', {
    open(ws) {
      const clientId = ws.id;
      console.log(`Client connected: ${clientId}`);
      const interval = setInterval(async () => {
        if (clientIntervals.has(clientId)) {
          const metrics = await getSystemMetrics();
          ws.send(JSON.stringify(metrics));
        }
      }, 1000);

      clientIntervals.set(clientId, interval);
    },
    close(ws) {
      const clientId = ws.id;
      console.log(`Client disconnected: ${clientId}`);
      if (clientIntervals.has(clientId)) {
        clearInterval(clientIntervals.get(clientId));
        clientIntervals.delete(clientId);
      }
    },
  })
  .listen(3001);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);