import si from 'systeminformation';
import { execSync } from 'child_process';

interface PortMapping {
  host?: string;
  container?: string;
  protocol?: string;
}

export async function getDockerContainers() {
  try {
    const [containers, stats] = await Promise.all([
      si.dockerContainers(true),
      si.dockerContainerStats('*')
    ]);

    return containers.map(container => {
      const containerStats = stats.find(s => s.id === container.id);
      
      let portsDisplay = 'None';
      if (container.ports && Array.isArray(container.ports) && container.ports.length > 0) {
        portsDisplay = container.ports
          .map((port: any) => {
            if (typeof port === 'string') {
              return port;
            } else if (typeof port === 'object' && port !== null) {
              const hostPort = port.PublicPort || port.hostPort || port.public || '?';
              const containerPort = port.PrivatePort || port.containerPort || port.private || '?';
              const protocol = port.Type || port.protocol || '';
              return `${hostPort}:${containerPort}${protocol ? `/${protocol}` : ''}`;
            }
            return String(port);
          })
          .filter(p => p !== '?' && p !== ':?')
          .join(', ') || 'None';
      }

      return {
        id: container.id,
        name: container.name ? container.name.replace(/^\//, '') : 'Unknown',
        image: container.image || 'Unknown',
        state: container.state || 'unknown',
        statusMessage: container.command || container.state || 'No status',
        created: container.created || null,
        ports: portsDisplay,
        memUsage: containerStats?.memoryStats?.usage ? 
          parseFloat((containerStats.memoryStats.usage / (1024 * 1024)).toFixed(1)) : 0,
        memLimit: containerStats?.memoryStats?.limit ? 
          parseFloat((containerStats.memoryStats.limit / (1024 * 1024)).toFixed(1)) : 0,
        memPercent: containerStats?.memoryStats?.usage && containerStats?.memoryStats?.limit ?
          parseFloat(((containerStats.memoryStats.usage / containerStats.memoryStats.limit) * 100).toFixed(1)) : 0,
        cpuPercent: containerStats?.cpuPercent ? 
          parseFloat(containerStats.cpuPercent.toFixed(2)) : 0,
        networkRx: containerStats?.networks ? 
          Object.values(containerStats.networks).reduce((total: number, net: any) => 
            total + (net.rx_bytes || 0), 0) / (1024 * 1024) : 0,
        networkTx: containerStats?.networks ? 
          Object.values(containerStats.networks).reduce((total: number, net: any) => 
            total + (net.tx_bytes || 0), 0) / (1024 * 1024) : 0,
        blockRead: containerStats?.blockIO?.r ? 
          parseFloat((containerStats.blockIO.r / (1024 * 1024)).toFixed(1)) : 0,
        blockWrite: containerStats?.blockIO?.w ? 
          parseFloat((containerStats.blockIO.w / (1024 * 1024)).toFixed(1)) : 0,
      };
    });
  } catch (error) {
    console.error('Failed to fetch docker containers:', error);
    return [];
  }
}

export async function getDockerInfo() {
  try {
    const dockerInfo = await si.dockerInfo();
    return {
      containers: dockerInfo.containers || 0,
      containersRunning: dockerInfo.containersRunning || 0,
      containersPaused: dockerInfo.containersPaused || 0,
      containersStopped: dockerInfo.containersStopped || 0,
      images: dockerInfo.images || 0,
      serverVersion: dockerInfo.serverVersion || 'Unknown',
      driver: (dockerInfo as any).driver || 'Unknown',
      loggingDriver: dockerInfo.loggingDriver || 'Unknown',
      memTotal: dockerInfo.memTotal ? 
        parseFloat((dockerInfo.memTotal / (1024 * 1024 * 1024)).toFixed(2)) : 0,
      architecture: dockerInfo.architecture || 'Unknown',
      kernelVersion: dockerInfo.kernelVersion || 'Unknown',
      operatingSystem: dockerInfo.operatingSystem || 'Unknown',
    };
  } catch (error) {
    console.error('Failed to fetch docker info:', error);
    return null;
  }
}

export async function getDockerContainer(idOrName: string) {
  try {
    const containers = await getDockerContainers();
    return containers.find(c => 
      c.id === idOrName || 
      c.name === idOrName || 
      c.id.startsWith(idOrName)
    ) || null;
  } catch (error) {
    console.error(`Failed to fetch docker container ${idOrName}:`, error);
    return null;
  }
}

export async function controlDockerContainer(idOrName: string, action: 'start' | 'stop' | 'restart') {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const command = `docker ${action} ${idOrName}`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      throw new Error(stderr);
    }
    
    return {
      success: true,
      message: `Container ${action} successful`,
      output: stdout.trim()
    };
  } catch (error) {
    console.error(`Failed to ${action} container ${idOrName}:`, error);
    return {
      success: false,
      message: `Failed to ${action} container`,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export function getDockerLogs(containerId: string): string {
    try {
        if (!/^[a-zA-Z0-9]+$/.test(containerId)) {
            throw new Error('Invalid container ID format.');
        }
        const command = `docker logs --tail 100 ${containerId}`;
        const logs = execSync(command, { encoding: 'utf-8' });
        return logs;
    } catch (error: any) {
        console.error(`Failed to fetch logs for container ${containerId}:`, error.message);
        if (error.stderr) {
            return `Error from Docker: ${error.stderr}`;
        }
        return `Error fetching logs for container ${containerId}.`;
    }
}

export function startDockerMonitoring(
  callback: (containers: any[]) => void, 
  intervalMs = 1500
) {
  const monitor = setInterval(async () => {
    try {
      const containers = await getDockerContainers();
      callback(containers);
    } catch (error) {
      console.error('Docker monitoring error:', error);
    }
  }, intervalMs);
  
  return () => clearInterval(monitor);
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function executeDockerCommand(command: string): { success: boolean; message: string } {
    try {
        if (!/^[a-zA-Z0-9\s-]+$/.test(command)) {
            throw new Error('Invalid command format.');
        }
        const result = execSync(`docker ${command}`, { encoding: 'utf-8' });
        return { success: true, message: result.trim() };
    } catch (error: any) {
        const errorMessage = error.stderr || error.message;
        console.error(`Failed to execute 'docker ${command}':`, errorMessage);
        return { success: false, message: errorMessage };
    }
}

export function startContainer(containerId: string) {
    return executeDockerCommand(`start ${containerId}`);
}

export function stopContainer(containerId: string) {
    return executeDockerCommand(`stop ${containerId}`);
}

export function restartContainer(containerId: string) {
    return executeDockerCommand(`restart ${containerId}`);
}