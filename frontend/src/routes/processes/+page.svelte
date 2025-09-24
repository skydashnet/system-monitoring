<script lang="ts">
  import type { PageData } from './$types';
  import { Search, ArrowUpDown, Skull } from 'lucide-svelte';
  import { onMount, onDestroy } from 'svelte';
  import ProcessDetailModal from '$lib/components/processdetailmodal.svelte';

  interface Process {
    pid: number;
    user: string;
    cpu: number;
    mem: number;
    command: string;
    path: string;
  }

  type SortKey = 'pid' | 'user' | 'cpu' | 'mem';

  interface TableHeader {
    key: SortKey | 'command';
    label: string;
    width: string;
    align: 'text-left' | 'text-right';
    sortable: boolean;
  }

  export let data: PageData;

  // State
  let processes: Process[] = [];
  let searchTerm = '';
  let sortKey: SortKey = 'cpu';
  let sortDirection: 'asc' | 'desc' = 'desc';
  let interval: any;
  let selectedProcess: Process | null = null;

  const tableHeaders: TableHeader[] = [
    { key: 'pid', label: 'PID', width: 'w-24', align: 'text-left', sortable: true },
    { key: 'user', label: 'User', width: 'w-32', align: 'text-left', sortable: true },
    { key: 'cpu', label: 'CPU %', width: 'w-24', align: 'text-right', sortable: true },
    { key: 'mem', label: 'Memory (MB)', width: 'w-32', align: 'text-right', sortable: true },
    { key: 'command', label: 'Command', width: '', align: 'text-left', sortable: false }
  ];

  async function killProcess(pid: number, command: string) {
    if (confirm(`Are you sure you want to kill process ${pid} (${command})?`)) {
        try {
            const response = await fetch('http://localhost:3001/api/processes/kill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pid })
            });
            const result = await response.json();
            if (result.success) {
                console.log(result.message);
                fetchLatestProcesses();
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (err) {
            alert('Failed to send kill command.');
        }
    }
  }

  async function fetchLatestProcesses() {
    try {
        const response = await fetch('http://localhost:3001/api/processes');
        if (response.ok) {
            processes = await response.json();
        }
    } catch (error) {
        console.error("Failed to refresh processes:", error);
    }
  }

  data.streamed.processes.then(p => processes = p as Process[]);

  onMount(() => {
    interval = setInterval(fetchLatestProcesses, 2000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  $: filteredProcesses = processes
    .filter(p => 
      p.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.pid).includes(searchTerm)
    )
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  function handleSort(key: SortKey | 'command', isSortable: boolean) {
    if (!isSortable) return;
    
    if (sortKey === key) {
      sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    } else {
      sortKey = key as SortKey;
      sortDirection = 'desc';
    }
  }

  const getResourceColor = (value: number, high: number, medium: number) => {
    if (value > high) return 'text-red-400';
    if (value > medium) return 'text-amber-400';
    return '';
  }
</script>

{#if selectedProcess}
  <ProcessDetailModal process={selectedProcess} on:close={() => selectedProcess = null} />
{/if}

<div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 h-[calc(100vh-10rem)] flex flex-col">
  <div class="flex justify-between items-center mb-4 flex-shrink-0">
    <h1 class="text-xl font-bold text-slate-800 dark:text-slate-100">Process Manager</h1>
    <div class="relative">
      <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder="Search processes..."
        bind:value={searchTerm}
        class="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md pl-9 pr-3 py-1.5 text-sm w-64 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
      />
    </div>
  </div>

  <div class="flex-grow overflow-auto">
    <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
      <thead class="bg-slate-50 dark:bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
        <tr>
          {#each tableHeaders as item}
            <th 
              class="p-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider {item.width} {item.align} {item.sortable ? 'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700' : ''}"
              on:click={() => handleSort(item.key, item.sortable)}
            >
              <div class="flex items-center {item.align === 'text-right' ? 'justify-end' : 'justify-start'}">
                <span>{item.label}</span>
                {#if sortKey === item.key}
                  <ArrowUpDown class="w-3 h-3 ml-2" />
                {/if}
              </div>
            </th>
          {/each}
          <th class="p-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
        {#if filteredProcesses.length > 0}
            {#each filteredProcesses as p (p.pid)}
                <tr 
                  class="hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-100 cursor-pointer"
                  on:click={() => selectedProcess = p}
                  role="button"
                  tabindex="0"
                  on:keydown={(e) => e.key === 'Enter' && (selectedProcess = p)}
                >
                    <td class="p-3 text-sm font-mono text-slate-500 dark:text-slate-400">{p.pid}</td>
                    <td class="p-3 text-sm truncate">{p.user}</td>
                    <td class="p-3 text-sm font-mono text-right {getResourceColor(p.cpu, 10, 2)}">{p.cpu}</td>
                    <td class="p-3 text-sm font-mono text-right {getResourceColor(p.mem, 500, 100)}">{p.mem}</td>
                    <td class="p-3 text-sm text-slate-600 dark:text-slate-300 font-mono truncate" title={p.command}>{p.command}</td>
                    <td class="p-3 text-center">
                        <button 
                          title="Kill Process"
                          class="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          on:click|stopPropagation={(e) => killProcess(p.pid, p.command)}
                        >
                            <Skull class="w-4 h-4" />
                        </button>
                    </td>
                </tr>
            {/each}
        {:else}
            <tr>
                <td colspan="6" class="text-center p-8 text-slate-500">
                    {#if searchTerm}
                        No processes found for "{searchTerm}"
                    {:else}
                        Loading processes...
                    {/if}
                </td>
            </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>