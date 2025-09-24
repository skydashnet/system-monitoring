<script lang="ts">
  import { auth } from '$lib/auth.store';

  let username = 'admin';
  let password = 'admin';
  let error = '';

  function handleLogin() {
    if (username === 'admin' && password === 'admin') {
      error = '';
      auth.login(username);
    } else {
      error = 'Invalid username or password.';
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
  <div class="w-full max-w-sm p-8 space-y-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl">
    <div>
      <h2 class="text-center text-3xl font-bold text-slate-900 dark:text-white">
        Skydash<span class="text-cyan-500">.NET</span>
      </h2>
      <p class="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
        Server Monitoring
      </p>
    </div>
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleLogin}>
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="username" class="sr-only">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            bind:value={username}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 placeholder-slate-400 text-slate-900 dark:text-white rounded-t-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
            placeholder="Username"
          />
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            bind:value={password}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 placeholder-slate-400 text-slate-900 dark:text-white rounded-b-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
            placeholder="Password"
          />
        </div>
      </div>
      
      {#if error}
        <p class="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
      {/if}

      <div>
        <button
          type="submit"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-colors"
        >
          Sign in
        </button>
      </div>
    </form>
  </div>
</div>