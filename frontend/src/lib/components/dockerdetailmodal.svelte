<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X } from 'lucide-svelte';

  export let container: any;
  const dispatch = createEventDispatcher();

  let activeTab: 'Details' | 'Logs' = 'Details';
  let logs = 'Loading logs...';
  let isLoadingLogs = false;

  async function fetchLogs() {
    if (isLoadingLogs) return;
    isLoadingLogs = true;
    logs = 'Loading logs...';
    try {
        const response = await fetch(`http://localhost:3001/api/docker/logs/${container.id}`);
        const logOutput = await response.text();
        if(response.ok) {
            logs = logOutput || 'This container has no logs.';
        } else {
            logs = `Failed to load logs.\n\nServer Response:\n${logOutput}`;
        }
    } catch (err) {
        logs = 'Error connecting to the server to fetch logs.';
    } finally {
        isLoadingLogs = false;
    }
  }

  function closeModal() {
    dispatch('close');
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') closeModal();
  }

  $: if (activeTab === 'Logs') {
    fetchLogs();
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" on:click={closeModal} role="presentation">
  
  <div 
    class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-xl w-full max-w-3xl flex flex-col" 
    on:click|stopPropagation 
    role="dialog" 
    aria-modal="true"
  >
    
    <header class="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
      <div class="flex items-center gap-4 min-w-0">
         <h2 class="text-xl font-semibold dark:text-white truncate" title={container.name}>{container.name}</h2>
         <span class="px-2 py-1 text-xs font-medium rounded-full border flex-shrink-0 {container.state === 'running' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}">
           {container.state}
         </span>
      </div>
      <button on:click={closeModal} class="text-slate-500 dark:text-slate-400 hover:dark:text-white transition-colors text-2xl">&times;</button>
    </header>
    
    <div class="border-b dark:border-slate-700 px-4 flex-shrink-0">
      <button on:click={() => activeTab = 'Details'} class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'Details' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}">Details</button>
      <button on:click={() => activeTab = 'Logs'} class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'Logs' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}">Logs</button>
    </div>

    <div class="p-6 overflow-y-auto {activeTab === 'Logs' ? 'h-[60vh]' : ''}">
      {#if activeTab === 'Details'}
        <dl class="grid grid-cols-[max-content,1fr] gap-x-6 gap-y-4 text-sm font-mono">
          <dt class="text-slate-400 self-start">ID</dt>
          <dd class="truncate" title={container.id}>{container.id}</dd>
          
          <dt class="text-slate-400 self-start">Image</dt>
          <dd class="truncate" title={container.image}>{container.image}</dd>

          <dt class="text-slate-400 self-start">Status</dt>
          <dd class="whitespace-pre-wrap">{container.statusMessage}</dd>
          
          <dt class="text-slate-400 self-start">Ports</dt>
          <dd class="whitespace-pre-wrap">{container.ports || 'N/A'}</dd>
        </dl>
      {:else if activeTab === 'Logs'}
        <pre class="bg-slate-900/70 p-4 rounded-md text-xs text-slate-300 h-full font-mono whitespace-pre-wrap">{logs}</pre>
      {/if}
    </div>
  </div>
</div>