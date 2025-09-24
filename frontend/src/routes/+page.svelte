<script lang="ts">
  import { metrics } from '$lib/metrics.store';
  import { cpuUsage, ramUsage, ramCache, swapUsage, netDown, netUp, loadOne, loadFive, loadFifteen } from '$lib/animatedmetrics.store';

  import DashboardCard from '$lib/components/dashboardcard.svelte';
  import CpuChart from '$lib/components/cpuchart.svelte';
  import ProgressBar from '$lib/components/progressbar.svelte';
  import NetworkChart from '$lib/components/networkchart.svelte';
  import { Cpu, MemoryStick, HardDrive, Network, Server, Settings, List, } from 'lucide-svelte';

  function formatUptime(seconds: number) {
    if (!seconds) return '0 minutes';
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d, ${h}h, ${m}m`;
  }

  function formatSpeed(kbps: number) {
    if (kbps < 1024) {
      return { value: kbps.toFixed(1), unit: 'KB/s' };
    } else if (kbps < 1024 * 1024) {
      return { value: (kbps / 1024).toFixed(1), unit: 'MB/s' };
    } else {
      return { value: (kbps / (1024 * 1024)).toFixed(1), unit: 'GB/s' };
    }
  }

  $: formattedDown = formatSpeed($netDown);
  $: formattedUp = formatSpeed($netUp);
</script>

<div class="flex justify-between items-center mb-6">
  <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
  <button class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
    <Settings class="w-5 h-5" />
  </button>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

  <DashboardCard title="CPU">
    <div slot="icon"><Cpu class="w-5 h-5"/></div>
    <div class="flex flex-col h-full">
      <div class="grid grid-cols-3 text-center">
        <div>
          <div class="text-xs text-slate-400">Usage</div>
          <div class="text-3xl font-bold text-cyan-400">{$cpuUsage.toFixed(1)}<span class="text-2xl">%</span></div>
        </div>
        <div>
          <div class="text-xs text-slate-400">Temp</div>
          <div class="text-3xl font-bold">{$metrics.latest.cpu.temp}<span class="text-2xl">°C</span></div>
        </div>
        <div>
          <div class="text-xs text-slate-400">Freq</div>
          <div class="text-3xl font-bold">{$metrics.latest.cpu.freq}<span class="text-xl">GHz</span></div>
        </div>
      </div>
      <div class="flex-grow mt-3 h-32">
        <CpuChart metricsHistory={$metrics.history} />
      </div>
    </div>
  </DashboardCard>

  <DashboardCard title="RAM & SWAP">
    <div slot="icon"><MemoryStick class="w-5 h-5"/></div>
    <div class="flex flex-col justify-between h-full">
      <div class="grid grid-cols-3 text-center text-sm mb-3">
        <div>
            <div class="text-xs text-slate-400">Total</div>
            <div class="font-bold">{$metrics.latest.ram.total.toFixed(2)}<span class="text-xs">GB</span></div>
        </div>
        <div>
            <div class="text-xs text-slate-400">Used</div>
            <div class="font-bold">{$ramUsage.toFixed(2)}<span class="text-xs">GB</span></div>
        </div>
        <div>
            <div class="text-xs text-slate-400">Cache</div>
            <div class="font-bold">{$ramCache.toFixed(2)}<span class="text-xs">GB</span></div>
        </div>
      </div>
      <div class="space-y-3">
          <div>
            <div class="flex justify-between mb-1 text-xs font-mono">
                <span>RAM Usage</span>
                <span>{$ramUsage.toFixed(2)} / {$metrics.latest.ram.total.toFixed(2)} GB</span>
            </div>
            <ProgressBar value={$ramUsage} max={$metrics.latest.ram.total} colorClass="bg-cyan-500" />
          </div>
          <div>
            <div class="flex justify-between mb-1 text-xs font-mono">
                <span>Swap Usage</span>
                <span>{$swapUsage.toFixed(2)} / {$metrics.latest.ram.swapTotal.toFixed(2)} GB</span>
            </div>
            <ProgressBar value={$swapUsage} max={$metrics.latest.ram.swapTotal} colorClass="bg-purple-500" />
          </div>
      </div>
    </div>
  </DashboardCard>

  <DashboardCard title="DISK DRIVES">
    <div slot="icon"><HardDrive class="w-5 h-5"/></div>
    <div class="flex flex-col justify-center h-full space-y-3">
      {#if $metrics.latest.disks.length > 0}
        {#each $metrics.latest.disks as disk}
          <div class="text-xs font-mono">
              <div class="flex justify-between items-center mb-1">
                  <span class="truncate pr-2">{disk.mount}</span>
                  <span class="text-slate-400 flex-shrink-0">
                    R:{disk.read}K/s W:{disk.write}K/s
                  </span>
              </div>
              <ProgressBar value={disk.used} max={disk.size} colorClass="bg-cyan-500" />
          </div>
        {/each}
      {:else}
        <p class="text-center text-xs text-slate-500">No disk data available.</p>
      {/if}
    </div>
  </DashboardCard>

  <DashboardCard title="NETWORK" class="lg:col-span-1 xl:col-span-2">
    <div slot="icon"><Network class="w-5 h-5"/></div>
    <div class="flex flex-col h-full">
      <div class="grid grid-cols-2 text-center">
        <div>
            <div class="text-sm">Download</div>
            <div class="text-2xl font-bold text-green-400">
              {formattedDown.value}<span class="text-lg"> {formattedDown.unit}</span>
            </div>
        </div>
        <div>
            <div class="text-sm">Upload</div>
            <div class="text-2xl font-bold text-sky-400">
              {formattedUp.value}<span class="text-lg"> {formattedUp.unit}</span>
            </div>
        </div>
      </div>
      <div class="flex-grow mt-2 h-24">
         <NetworkChart metricsHistory={$metrics.history} />
      </div>
    </div>
  </DashboardCard>

  <DashboardCard title="SYSTEM">
    <div slot="icon"><Server class="w-5 h-5"/></div>
    <div class="flex flex-col justify-between h-full text-center">
        <div>
            <div class="text-sm text-slate-400 mb-1">Load Average</div>
            <div class="grid grid-cols-3">
                <div class="text-3xl font-bold">{$loadOne.toFixed(2)}</div>
                <div class="text-3xl font-bold">{$loadFive.toFixed(2)}</div>
                <div class="text-3xl font-bold">{$loadFifteen.toFixed(2)}</div>
                <div class="text-xs text-slate-400">1 min</div>
                <div class="text-xs text-slate-400">5 min</div>
                <div class="text-xs text-slate-400">15 min</div>
            </div>
        </div>
        <div class="border-t border-slate-200 dark:border-slate-700 mt-3 pt-3">
            <div class="text-sm text-slate-400">Uptime</div>
            <div class="text-lg font-semibold">{formatUptime($metrics.latest.system.uptime)}</div>
        </div>
    </div>
  </DashboardCard>

  <DashboardCard title="TOP PROCESSES" class="lg:col-span-2 xl:col-span-3">
    <div slot="icon"><List class="w-5 h-5"/></div>
    <div class="text-sm font-mono overflow-x-auto">
        <table class="w-full">
          <thead>
              <tr class="text-left text-xs text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th class="p-2 w-16">PID</th>
                  <th class="p-2">User</th>
                  <th class="p-2 w-20 text-right">CPU%</th>
                  <th class="p-2 w-20 text-right">MEM(MB)</th> 
                  <th class="p-2">Command</th>
              </tr>
          </thead>
          <tbody>
              {#each $metrics.latest.processes as p}
                  <tr class="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                      <td class="p-2">{p.pid}</td>
                      <td class="p-2 truncate">{p.user}</td>
                      <td class="p-2 text-right text-cyan-400">{p.cpu}</td>
                      <td class="p-2 text-right text-green-400">{p.mem}</td> 
                      <td class="p-2 truncate">{p.command}</td>
                  </tr>
              {/each}
          </tbody>
        </table>
    </div>
  </DashboardCard>

</div>