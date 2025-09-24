<script lang="ts">
  export let value: number;
  export let max: number;
  export let colorClass: string = 'bg-cyan-500';

  $: percentage = max > 0 ? (value / max) * 100 : 0;
</script>

<div class="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-2">
  <div
    class="h-2 rounded-full {colorClass} transition-all duration-700 ease-out"
    style="width: {percentage}%">
  </div>
</div>