export interface DiskInfo {
  filesystem: string;
  size: number;
  used: number;
  mount: string;
  read: string;
  write: string;
}

export interface ProcessInfo {
  pid: number;
  user: string;
  cpu: string;
  mem: string;
  command: string;
}

export interface SystemMetrics {
  cpu: {
    usage: string;
    cores: number;
    temp: string;
    freq: string;
  };
  ram: {
    total: number;
    used: number;
    cache: number;
    swapTotal: number;
    swapUsed: number;
  };
  disks: DiskInfo[];
  processes: ProcessInfo[];
  network: {
    uploadSpeed: number;
    downloadSpeed: number;
  };
  system: {
    load: {
      one: number;
      five: number;
      fifteen: number;
    };
    uptime: number;
  };
  hostname: string;
}