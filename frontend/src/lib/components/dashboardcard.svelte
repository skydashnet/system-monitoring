<script lang="ts">
  export let title: string;
</script>

<div class="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 {$$props.class || ''}">
  <div class="flex items-center mb-3">
    <div class="text-cyan-500">
      <slot name="icon" />
    </div>
    <h2 class="ml-3 text-md font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
      {title}
    </h2>
  </div>
  <div class="mt-1">
    <slot />
  </div>
</div>