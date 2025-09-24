import si from 'systeminformation';

export async function getProcessList() {
  try {
    const processes = await si.processes();
    const totalMem = (await si.mem()).total;
    const processList = processes.list.map(p => {
      const memInMb = ((p.mem / 100) * totalMem) / (1024 * 1024);
      return {
        pid: p.pid,
        user: p.user,
        cpu: parseFloat(p.cpu.toFixed(1)),
        mem: parseFloat(memInMb.toFixed(1)),
        command: p.command,
        path: p.path,
      };
    });

    return processList;
  } catch (error) {
    console.error('Failed to fetch process list:', error);
    return [];
  }
}