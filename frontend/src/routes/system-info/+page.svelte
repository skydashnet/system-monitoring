<script lang="ts">
  import type { PageData } from './$types';
  import DashboardCard from '$lib/components/dashboardcard.svelte';
  import InfoRow from '$lib/components/InfoRow.svelte';
  import { Server, Cpu, MemoryStick, HardDrive, Network } from 'lucide-svelte';

  export let data: PageData;
  const { systemInfo, error } = data;
</script>

<h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">System Information</h1>

{#if error}
  <p class="text-red-500">{error}</p>
{:else if !systemInfo}
  <p>Loading system information...</p>
{:else}
  <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
    
    <DashboardCard title="System & OS" class="xl:col-span-1">
      <div slot="icon"><Server class="w-5 h-5"/></div>
      <dl>
        <InfoRow label="Manufacturer">{systemInfo.system.manufacturer}</InfoRow>
        <InfoRow label="Model">{systemInfo.system.model}</InfoRow>
        <InfoRow label="Distro">{systemInfo.os.distro}</InfoRow>
        <InfoRow label="Kernel">{systemInfo.os.kernel}</InfoRow>
        <InfoRow label="Architecture">{systemInfo.os.arch}</InfoRow>
      </dl>
    </DashboardCard>

    <DashboardCard title="Processor" class="xl:col-span-2">
      <div slot="icon"><Cpu class="w-5 h-5"/></div>
      <dl>
        <InfoRow label="Brand">{systemInfo.cpu.brand}</InfoRow>
        <InfoRow label="Manufacturer">{systemInfo.cpu.manufacturer}</InfoRow>
        <InfoRow label="Speed">{systemInfo.cpu.speed}</InfoRow>
        <InfoRow label="Cores / Processors">{systemInfo.cpu.cores} / {systemInfo.cpu.processors}</InfoRow>
        <InfoRow label="Physical Cores">{systemInfo.cpu.physicalCores}</InfoRow>
      </dl>
    </DashboardCard>

    <DashboardCard title="Motherboard" class="xl:col-span-1">
      <div slot="icon"><svg xmlns="http://www.w.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg></div>
      <dl>
        <InfoRow label="Manufacturer">{systemInfo.motherboard.manufacturer}</InfoRow>
        <InfoRow label="Model">{systemInfo.motherboard.model}</InfoRow>
        <InfoRow label="Version">{systemInfo.motherboard.version}</InfoRow>
        <InfoRow label="Serial">{systemInfo.motherboard.serial}</InfoRow>
      </dl>
    </DashboardCard>

    <DashboardCard title="Memory Modules" class="xl:col-span-2">
      <div slot="icon"><MemoryStick class="w-5 h-5"/></div>
      <div class="space-y-2">
        {#if systemInfo.memory && systemInfo.memory.length > 0}
            {#each systemInfo.memory as mem}
            <div class="bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md text-xs font-mono">
                {mem.bank}: {mem.manufacturer} {mem.partNum} - {mem.size} {mem.type} @ {mem.clockSpeed}
            </div>
            {/each}
        {:else}
            <p class="text-xs text-slate-500">No detailed memory module data available.</p>
        {/if}
      </div>
    </DashboardCard>

    <DashboardCard title="Storage Devices" class="xl:col-span-3">
        <div slot="icon"><HardDrive class="w-5 h-5"/></div>
        <div class="space-y-3 font-mono text-sm">
          {#each systemInfo.storage as disk}
            <div class="grid grid-cols-4 gap-4 items-center bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md">
              <span class="truncate col-span-2">{disk.name}</span>
              <span class="text-cyan-400">{disk.interfaceType}</span>
              <span>{disk.size}</span>
            </div>
          {/each}
        </div>
    </DashboardCard>

    <DashboardCard title="Network Interfaces" class="xl:col-span-3">
        <div slot="icon"><Network class="w-5 h-5"/></div>
        <div class="space-y-3">
          {#each systemInfo.network as iface}
            <div class="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md font-mono text-sm">
              <div class="flex justify-between items-center mb-1">
                <h4 class="font-bold text-slate-800 dark:text-slate-200">{iface.iface} <span class="text-xs text-slate-400">({iface.type})</span></h4>
                <span class="text-xs text-slate-500 dark:text-slate-400">{iface.mac}</span>
              </div>
              <span class="text-green-500">IP: {iface.ip4}</span>
            </div>
          {/each}
        </div>
    </DashboardCard>
  </div>
{/if}