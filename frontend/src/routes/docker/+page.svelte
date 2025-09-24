<script lang="ts">
  import type { PageData } from './$types';
  import { onMount, onDestroy } from 'svelte';
  import DockerDetailModal from '$lib/components/dockerdetailmodal.svelte';
  import { Play, Square, RefreshCw } from 'lucide-svelte';

  export let data: PageData;

  let containers = data.containers;
  let selectedContainer: any | null = null;
  let interval: any;
  let loadingActionId: string | null = null;

  async function handleAction(action: 'start' | 'stop' | 'restart', containerId: string) {
    loadingActionId = containerId;
    try {
        const response = await fetch(`http://localhost:3001/api/docker/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: containerId })
        });
        
        if (!response.ok) {
            const result = await response.json();
            alert(`Error: ${result.message || 'Failed to perform action.'}`);
        }
        
        setTimeout(() => {
            refreshData();
            loadingActionId = null;
        }, 1500);

    } catch (error) {
        alert('Failed to connect to the server.');
        loadingActionId = null;
    }
  }

  async function refreshData() {
    try {
        const response = await fetch('http://localhost:3001/api/docker/containers');
        if (response.ok) {
            containers = await response.json();
        }
    } catch (error) {
        console.error("Failed to refresh containers:", error);
    }
  }

  onMount(() => {
    interval = setInterval(refreshData, 5000);  
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

{#if selectedContainer}
    <DockerDetailModal container={selectedContainer} on:close={() => selectedContainer = null} />
{/if}

<div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-lg p-4 h-[calc(100vh-10rem)] flex flex-col">
  <h1 class="text-xl font-bold dark:text-slate-100 mb-4 flex-shrink-0">Docker Containers</h1>

  <div class="flex-grow overflow-auto">
    <table class="min-w-full divide-y dark:divide-slate-700">
      <thead class="bg-slate-50 dark:bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
        <tr>
          <th class="p-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-32">Status</th>
          <th class="p-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
          <th class="p-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Image</th>
          <th class="p-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Ports</th>
          <th class="p-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider w-24">CPU %</th>
          <th class="p-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider w-28">Mem (MB)</th>
          <th class="p-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider w-32">Actions</th>
        </tr>
      </thead>
      <tbody class="dark:bg-slate-800 divide-y dark:divide-slate-700">
        {#if containers && containers.length > 0}
            {#each containers as c (c.id)}
              <tr class="hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-150 {loadingActionId === c.id ? 'opacity-50' : ''}">
                
                <td class="p-3 text-sm cursor-pointer" on:click={() => selectedContainer = c} on:keydown={(e) => e.key === 'Enter' && (selectedContainer = c)} role="button" tabindex="0">
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-2 {c.state === 'running' ? 'bg-green-500' : 'bg-red-500'}"></div>
                    <span class="capitalize">{c.state}</span>
                  </div>
                </td>
                <td class="p-3 text-sm font-semibold truncate cursor-pointer" on:click={() => selectedContainer = c} on:keydown={(e) => e.key === 'Enter' && (selectedContainer = c)} role="button" tabindex="0">{c.name}</td>
                <td class="p-3 text-sm text-slate-400 truncate cursor-pointer" on:click={() => selectedContainer = c} on:keydown={(e) => e.key === 'Enter' && (selectedContainer = c)} role="button" tabindex="0">{c.image}</td>
                <td class="p-3 text-sm font-mono truncate cursor-pointer" on:click={() => selectedContainer = c} on:keydown={(e) => e.key === 'Enter' && (selectedContainer = c)} role="button" tabindex="0">{c.ports || '-'}</td>
                <td class="p-3 text-sm font-mono text-right cursor-pointer" on:click={() => selectedContainer = c} on:keydown={(e) => e.key === 'Enter' && (selectedContainer = c)} role="button" tabindex="0">{c.cpuPercent.toFixed(2)}</td>
                <td class="p-3 text-sm font-mono text-right cursor-pointer" on:click={() => selectedContainer = c} on:keydown={(e) => e.key === 'Enter' && (selectedContainer = c)} role="button" tabindex="0">{c.memUsage.toFixed(1)}</td>
                
                <td class="p-3 text-center">
                  <div class="flex items-center justify-center space-x-2">
                    {#if c.state !== 'running'}
                      <button on:click|stopPropagation={() => handleAction('start', c.id)} title="Start Container" class="p-1 text-slate-400 hover:text-green-500 disabled:opacity-25" disabled={loadingActionId !== null}>
                        <Play class="w-4 h-4" />
                      </button>
                    {/if}
                    {#if c.state === 'running'}
                      <button on:click|stopPropagation={() => handleAction('stop', c.id)} title="Stop Container" class="p-1 text-slate-400 hover:text-red-500 disabled:opacity-25" disabled={loadingActionId !== null}>
                        <Square class="w-4 h-4" />
                      </button>
                      <button on:click|stopPropagation={() => handleAction('restart', c.id)} title="Restart Container" class="p-1 text-slate-400 hover:text-cyan-500 disabled:opacity-25" disabled={loadingActionId !== null}>
                        <RefreshCw class="w-4 h-4" />
                      </button>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
        {:else}
            <tr>
                <td colspan="7" class="text-center p-8 text-slate-500">
                    No Docker containers found.
                </td>
            </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>