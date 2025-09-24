import si from 'systeminformation';

export async function getSystemInfo() {
  try {
    const [system, osInfo, cpu, baseboard, memLayout, diskLayout, networkInterfaces] = await Promise.all([
      si.system(),
      si.osInfo(),
      si.cpu(),
      si.baseboard(),
      si.memLayout(),
      si.diskLayout(),
      si.networkInterfaces(),
    ]);

    return {
      system: {
        manufacturer: system.manufacturer,
        model: system.model,
        version: system.version,
        sku: system.sku || 'N/A',
      },
      os: {
        distro: osInfo.distro,
        kernel: osInfo.kernel,
        arch: osInfo.arch,
        platform: osInfo.platform,
        release: osInfo.release,
      },
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        speed: `${cpu.speed} GHz`,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        processors: cpu.processors,
      },
      motherboard: {
        manufacturer: baseboard.manufacturer,
        model: baseboard.model,
        version: baseboard.version,
        serial: baseboard.serial,
      },
      memory: memLayout.map(m => ({
        size: `${(m.size / 1024 / 1024 / 1024).toFixed(1)} GB`,
        bank: m.bank,
        type: m.type,
        clockSpeed: `${m.clockSpeed || 0} MHz`,
        manufacturer: m.manufacturer || 'N/A',
        partNum: m.partNum || 'N/A',
      })),
      storage: diskLayout.map(d => ({
        type: d.type,
        name: d.name,
        vendor: d.vendor,
        size: `${(d.size / 1024 / 1024 / 1024).toFixed(1)} GB`,
        interfaceType: d.interfaceType,
      })),
      network: (Array.isArray(networkInterfaces) ? networkInterfaces : [networkInterfaces])
        .filter((iface: any) => iface.ip4 && iface.iface !== 'lo')
        .map((iface: any) => ({
          iface: iface.iface,
          ip4: iface.ip4,
          mac: iface.mac,
          type: iface.type,
        })),
    };
  } catch (error) {
    console.error('Failed to fetch system info:', error);
    return null;
  }
}