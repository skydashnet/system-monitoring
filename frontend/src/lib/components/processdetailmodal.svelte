<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { X } from 'lucide-svelte';

  export let process: any;

  const dispatch = createEventDispatcher();
  let modalElement: HTMLDivElement;

  function closeModal() {
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  onMount(() => {
    modalElement.focus();
  });
</script>

<svelte:window on:keydown={handleKeydown}/>

<div 
  class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
  on:click={closeModal}
  role="presentation"
>
  <div 
    bind:this={modalElement}
    class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-2xl flex flex-col overflow-hidden outline-none"
    on:click|stopPropagation
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <header class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
      <h2 id="modal-title" class="text-lg font-semibold text-slate-900 dark:text-white truncate">
        Process Detail: <span class="font-mono text-cyan-500">{process.pid}</span>
      </h2>
      <button on:click={closeModal} class="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
        <X class="w-5 h-5" />
      </button>
    </header>

    <main class="p-6 space-y-3 font-mono text-sm">
        <div class="grid grid-cols-4 gap-2"><dt class="text-slate-500 dark:text-slate-400">Command</dt><dd class="col-span-3 truncate text-cyan-400" title={process.command}>{process.command}</dd></div>
        <div class="grid grid-cols-4 gap-2"><dt class="text-slate-500 dark:text-slate-400">Full Path</dt><dd class="col-span-3 truncate" title={process.path}>{process.path || 'N/A'}</dd></div>
        <div class="grid grid-cols-4 gap-2"><dt class="text-slate-500 dark:text-slate-400">User</dt><dd class="col-span-3">{process.user}</dd></div>
        <div class="grid grid-cols-4 gap-2"><dt class="text-slate-500 dark:text-slate-400">CPU Usage</dt><dd class="col-span-3">{process.cpu}%</dd></div>
        <div class="grid grid-cols-4 gap-2"><dt class="text-slate-500 dark:text-slate-400">Memory</dt><dd class="col-span-3">{process.mem} MB</dd></div>
    </main>
  </div>
</div>