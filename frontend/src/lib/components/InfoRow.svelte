<script lang="ts">
  export let label: string;
</script>

<div class="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-700/50 gap-4">
  <dt class="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">{label}</dt>
  <dd class="text-sm font-medium text-slate-700 dark:text-slate-200 text-right font-mono truncate min-w-0">
    <slot />
  </dd>
</div>