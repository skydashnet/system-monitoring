<script lang="ts">
  import "../app.css";
  import { auth } from '$lib/auth.store';
  import LoginPage from '$lib/components/loginpage.svelte';
  import Sidebar from '$lib/components/sidebar.svelte';
  import { ChevronLeft, Menu } from 'lucide-svelte';

  let isCollapsed = false;
  let isMobileNavOpen = false;
</script>

{#if $auth.isAuthenticated}
  <div class="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-sans overflow-hidden">
    <div class="hidden md:block relative transition-all duration-300 ease-in-out {isCollapsed ? 'w-20' : 'w-64'}">
      <div class="fixed top-0 left-0 h-full {isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out z-20">
        <Sidebar {isCollapsed} username={$auth.username || ''} />
      </div>
      <button on:click={() => isCollapsed = !isCollapsed} class="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-slate-100 dark:bg-slate-700 hover:bg-cyan-500 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-white transition-all z-30 border dark:border-slate-600">
        <ChevronLeft class="w-4 h-4 transition-transform duration-300 {isCollapsed ? 'rotate-180' : ''}" />
      </button>
    </div>

    <div class:pointer-events-none={!isMobileNavOpen} class="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity {isMobileNavOpen ? 'opacity-100' : 'opacity-0'}" on:click={() => isMobileNavOpen = false} role="presentation"></div>
    <aside class="fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 z-50 md:hidden {isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}">
      <Sidebar isCollapsed={false} username={$auth.username || ''} />
    </aside>

    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="flex-shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b dark:border-slate-700 p-4 flex items-center">
          <button on:click={() => isMobileNavOpen = true} class="md:hidden mr-4 p-1 text-slate-600 dark:text-slate-300">
              <Menu class="w-6 h-6" />
          </button>
      </header>
      <div class="flex-1 overflow-y-auto">
          <div class="p-6">
              <slot />
          </div>
      </div>
    </main>
  </div>
{:else}
  <LoginPage />
{/if}