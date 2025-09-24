import si from 'systeminformation';

let previousNetStats: si.Systeminformation.NetworkStatsData | null = null;
async function initializeState() {
  try {
    const netData = await si.networkStats();
    previousNetStats = (netData && netData.length > 0) ? netData[0] || null : null;
  } catch (error) {
    console.error("Failed to initialize metrics state:", error);
  }
}

initializeState();

export async function getSystemMetrics() {
  try {
    const [
      cpuData, 
      currentLoad, 
      mem, 
      fsSize, 
      disksIO, 
      networkStats, 
      osInfo, 
      cpuTemp, 
      time,
      processes
    ] = await Promise.all([
      si.cpu(),
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.disksIO(),
      si.networkStats(),
      si.osInfo(),
      si.cpuTemperature(),
      si.time(),
      si.processes(),
    ]);

    // === CPU METRICS ===
    const cpuUsage = currentLoad.currentLoad || 0;

    // === NETWORK SPEED CALCULATION ===
    const mainInterface = networkStats.find(iface => 
      iface.operstate === 'up' && 
      iface.iface !== 'lo' && 
      !iface.iface.startsWith('docker') &&
      !iface.iface.startsWith('veth') &&
      !iface.iface.startsWith('br-')
    ) || networkStats[0];
    
    let downloadSpeed = 0;
    let uploadSpeed = 0;
    
    if (mainInterface) {
      downloadSpeed = (mainInterface.rx_sec || 0) / 1024;
      uploadSpeed = (mainInterface.tx_sec || 0) / 1024;
      
      if ((downloadSpeed === 0 && uploadSpeed === 0) && previousNetStats && 
          previousNetStats.iface === mainInterface.iface && 
          previousNetStats.ms < mainInterface.ms) {
        
        const intervalSeconds = (mainInterface.ms - previousNetStats.ms) / 1000;
        
        if (intervalSeconds >= 0.5 && intervalSeconds <= 10) {
          const rxDiff = mainInterface.rx_bytes - previousNetStats.rx_bytes;
          const txDiff = mainInterface.tx_bytes - previousNetStats.tx_bytes;
          
          if (rxDiff >= 0 && txDiff >= 0) {
            downloadSpeed = rxDiff / intervalSeconds / 1024;
            uploadSpeed = txDiff / intervalSeconds / 1024;
          }
        }
      }
      
      previousNetStats = mainInterface;
    }

    // === RAM CALCULATION ===
    const actualUsedRam = mem.used - (mem.buffcache || 0);

    // === LOAD AVERAGE  ===
    let loadAvg = { one: 0, five: 0, fifteen: 0 };
    try {
      if (process.platform !== 'win32') {
        const os = await import('os');
        const [one, five, fifteen] = os.loadavg();
        loadAvg = { 
          one: one || 0, 
          five: five || 0, 
          fifteen: fifteen || 0 
        };
      }
    } catch (error) {
      console.warn('Could not get load average:', error);
    }

    const top5Processes = processes.list
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 5)
      .map(p => {
        const memInMb = ((p.mem / 100) * mem.total) / (1024 * 1024);
        
        return {
          pid: p.pid,
          user: p.user,
          cpu: p.cpu.toFixed(1),
          mem: memInMb.toFixed(1), 
          command: p.command,
        }
      });

    return {
      cpu: {
        usage: Math.max(0, Math.min(100, cpuUsage)).toFixed(1),
        cores: cpuData.physicalCores || cpuData.cores || 1,
        temp: cpuTemp.main !== null && cpuTemp.main !== undefined ? 
              cpuTemp.main.toFixed(1) : 'N/A',
        freq: cpuData.speed ? cpuData.speed.toFixed(2) : 'N/A',
        model: cpuData.brand || 'Unknown',
        manufacturer: cpuData.manufacturer || 'Unknown',
      },
      ram: {
        total: parseFloat((mem.total / 1024 / 1024 / 1024).toFixed(2)),
        used: parseFloat((actualUsedRam / 1024 / 1024 / 1024).toFixed(2)),
        free: parseFloat((mem.free / 1024 / 1024 / 1024).toFixed(2)),
        cache: parseFloat(((mem.buffcache || 0) / 1024 / 1024 / 1024).toFixed(2)),
        available: parseFloat((mem.available / 1024 / 1024 / 1024).toFixed(2)),
        usagePercent: ((actualUsedRam / mem.total) * 100).toFixed(1),
        swapTotal: parseFloat(((mem.swaptotal || 0) / 1024 / 1024 / 1024).toFixed(2)),
        swapUsed: parseFloat(((mem.swapused || 0) / 1024 / 1024 / 1024).toFixed(2)),
      },
      disks: fsSize
        .filter(disk => 
          disk.mount !== '/dev' && 
          disk.mount !== '/sys/fs/cgroup' && 
          disk.size > 0
        )
        .map(disk => ({
          filesystem: disk.fs,
          size: parseFloat((disk.size / 1024 / 1024 / 1024).toFixed(1)),
          used: parseFloat((disk.used / 1024 / 1024 / 1024).toFixed(1)),
          available: parseFloat(((disk.size - disk.used) / 1024 / 1024 / 1024).toFixed(1)),
          usagePercent: ((disk.used / disk.size) * 100).toFixed(1),
          mount: disk.mount,
          type: disk.type || 'unknown',
        })),
      diskIO: Object.entries(disksIO || {}).map(([device, io]: [string, any]) => ({
        device,
        readSpeed: parseFloat(((io?.rIO_sec || 0) / 1024).toFixed(1)),
        writeSpeed: parseFloat(((io?.wIO_sec || 0) / 1024).toFixed(1)),
        readTotal: parseFloat(((io?.rIO || 0) / 1024 / 1024).toFixed(1)),
        writeTotal: parseFloat(((io?.wIO || 0) / 1024 / 1024).toFixed(1)),
      })),
      network: {
        interface: mainInterface?.iface || 'N/A',
        uploadSpeed: parseFloat(Math.max(0, uploadSpeed).toFixed(1)),
        downloadSpeed: parseFloat(Math.max(0, downloadSpeed).toFixed(1)),
        totalTx: mainInterface ? parseFloat((mainInterface.tx_bytes / 1024 / 1024).toFixed(1)) : 0,
        totalRx: mainInterface ? parseFloat((mainInterface.rx_bytes / 1024 / 1024).toFixed(1)) : 0,
        state: mainInterface?.operstate || 'unknown',
        rxSec: mainInterface ? parseFloat(((mainInterface.rx_sec || 0) / 1024).toFixed(1)) : 0,
        txSec: mainInterface ? parseFloat(((mainInterface.tx_sec || 0) / 1024).toFixed(1)) : 0,
      },
      system: {
        load: {
          current: cpuUsage,
          one: loadAvg.one,
          five: loadAvg.five,
          fifteen: loadAvg.fifteen,
        },
        uptime: time.uptime,
        uptimeFormatted: formatUptime(time.uptime),
      },
      hostname: osInfo.hostname,
      platform: `${osInfo.platform} ${osInfo.release}`,
      arch: osInfo.arch,
      kernel: osInfo.kernel,
      timestamp: Date.now(),
      processes: top5Processes,
    };

  } catch (error) {
    console.error('Failed to fetch detailed system metrics:', error);
    return null;
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function startCpuMonitoring(callback: (usage: number) => void, intervalMs = 1000) {
  const monitor = setInterval(async () => {
    try {
      const load = await si.currentLoad();
      callback(load.currentLoad || 0);
    } catch (error) {
      console.error('CPU monitoring error:', error);
    }
  }, intervalMs);
  
  return () => clearInterval(monitor);
}

export function startNetworkMonitoring(callback: (stats: {up: number, down: number}) => void, intervalMs = 1000) {
  let previousStats: si.Systeminformation.NetworkStatsData | null = null;
  
  const monitor = setInterval(async () => {
    try {
      const networkStats = await si.networkStats();
      const mainInterface = networkStats.find(iface => 
        iface.operstate === 'up' && 
        iface.iface !== 'lo' &&
        !iface.iface.startsWith('docker') &&
        !iface.iface.startsWith('veth') &&
        !iface.iface.startsWith('br-')
      ) || networkStats[0];
      
      if (mainInterface) {
        let down = (mainInterface.rx_sec || 0) / 1024;
        let up = (mainInterface.tx_sec || 0) / 1024;
      
        if ((down === 0 && up === 0) && previousStats && 
            previousStats.iface === mainInterface.iface &&
            previousStats.ms < mainInterface.ms) {
          
          const intervalSec = (mainInterface.ms - previousStats.ms) / 1000;
          if (intervalSec >= 0.5 && intervalSec <= 5) {
            const rxDiff = mainInterface.rx_bytes - previousStats.rx_bytes;
            const txDiff = mainInterface.tx_bytes - previousStats.tx_bytes;
            
            if (rxDiff >= 0 && txDiff >= 0) {
              down = rxDiff / intervalSec / 1024;
              up = txDiff / intervalSec / 1024;
            }
          }
        }
        
        callback({ 
          up: Math.max(0, up), 
          down: Math.max(0, down) 
        });
        
        previousStats = mainInterface;
      }
    } catch (error) {
      console.error('Network monitoring error:', error);
    }
  }, intervalMs);
  
  return () => clearInterval(monitor);
}