<script lang="ts">
  import { page } from '$app/stores';
  import { metrics } from '$lib/metrics.store';
  import { auth } from '$lib/auth.store';
  import { LayoutDashboard, List, Container, Info, LogOut } from 'lucide-svelte';

  export let isCollapsed: boolean = false;
  export let username: string;

  const isActive = (path: string) => $page.url.pathname === path;
  
  const getProgress = (current: number, max: number) => max > 0 ? (current / max) * 100 : 0;
  $: cpuProgress = getProgress(parseFloat($metrics.latest.cpu.usage), 100);
  $: ramProgress = getProgress($metrics.latest.ram.used, $metrics.latest.ram.total);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/processes', label: 'Processes', icon: List },
    { href: '/docker', label: 'Docker', icon: Container },
    { href: '/system-info', label: 'System Info', icon: Info },
  ];
</script>

<div class="p-4 flex flex-col h-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700">
  <div class="flex items-center mb-8 transition-all duration-300 {isCollapsed ? 'justify-center' : 'justify-start'}">
      <h1 class="text-xl font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
          {#if isCollapsed}
            S<span class="text-cyan-500">.N</span>
          {:else}
            Skydash<span class="text-cyan-500">.NET</span>
          {/if}
      </h1>
  </div>
  
  <div class="text-center mb-8 transition-opacity duration-200 {isCollapsed ? 'opacity-0 h-0 invisible' : 'opacity-100'}">
      <p class="text-sm font-semibold text-slate-800 dark:text-white truncate">{$metrics.latest.hostname}</p>
      <p class="text-xs text-slate-500 dark:text-slate-400">Logged in as {username}</p>
  </div>

  <nav class="flex-grow space-y-2">
    {#each navItems as item}
      <a href={item.href} class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group relative {isActive(item.href) ? 'bg-cyan-500/10 text-cyan-500' : 'hover:bg-slate-100 dark:hover:bg-slate-700'} {isCollapsed ? 'justify-center' : ''}">
          <svelte:component this={item.icon} class="w-5 h-5 flex-shrink-0" />
          <span class="ml-3 whitespace-nowrap transition-opacity duration-200 {isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}">{item.label}</span>
          {#if isCollapsed}
            <span class="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">{item.label}</span>
          {/if}
      </a>
    {/each}
  </nav>

  <div class="mt-auto flex-shrink-0 space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
      <h3 class="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider transition-opacity duration-200 {isCollapsed ? 'opacity-0 h-0 invisible text-center' : 'opacity-100 px-3'}">Live Stats</h3>
      <div class="text-xs px-3">
          <div class="flex justify-between items-center {isCollapsed ? 'flex-col' : ''}">
              <span>CPU</span>
              <span class="font-mono">{$metrics.latest.cpu.usage}%</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1 mt-1"><div class="bg-cyan-500 h-1 rounded-full" style="width: {cpuProgress}%"></div></div>
      </div>
      <div class="text-xs px-3">
          <div class="flex justify-between items-center {isCollapsed ? 'flex-col' : ''}">
              <span>RAM</span>
              <span class="font-mono">{$metrics.latest.ram.used.toFixed(1)}GB</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1 mt-1"><div class="bg-green-500 h-1 rounded-full" style="width: {ramProgress}%"></div></div>
      </div>
  </div>

  <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center text-xs {isCollapsed ? 'flex-col-reverse gap-3' : 'justify-between'}">
      <div class="flex items-center text-green-500">
          <span class="relative flex h-2 w-2 mr-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {#if !isCollapsed}Connected{/if}
      </div>
      <button on:click={() => auth.logout()} class="flex items-center hover:text-slate-800 dark:hover:text-white transition-colors">
        <LogOut class="w-4 h-4" />
          <span class="ml-2 whitespace-nowrap transition-opacity duration-200 {isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}">Logout</span>
      </button>
  </div>
</div>