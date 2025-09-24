<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  import type { MetricsState } from '$lib/metrics.store';

  export let metricsHistory: MetricsState['history'];
  let canvasElement: HTMLCanvasElement;
  let chart: Chart;

  onMount(() => {
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array(30).fill(''),
        datasets: [
          { label: 'Download', data: Array(30).fill(null), borderColor: 'rgb(34, 197, 94)', backgroundColor: 'rgba(34, 197, 94, 0.1)', tension: 0.4, fill: true, pointRadius: 0, borderWidth: 1.5 },
          { label: 'Upload', data: Array(30).fill(null), borderColor: 'rgb(14, 165, 233)', backgroundColor: 'rgba(14, 165, 233, 0.1)', tension: 0.4, fill: true, pointRadius: 0, borderWidth: 1.5 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(100, 116, 139, 0.1)' }, ticks: { font: { size: 10 }, callback: (value: any) => `${value} KB/s` } },
          x: { grid: { display: false }, ticks: { display: false } }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                intersect: false,
                mode: 'index',
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.formattedValue} KB/s`
                }
            }
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false }
      }
    });
  });

  $: if (chart && metricsHistory.length) {
    const lastEntry = metricsHistory[metricsHistory.length - 1];
    if(lastEntry && chart.data.labels && chart.data.datasets[0].data && chart.data.datasets[1].data){
        chart.data.labels.shift();
        chart.data.labels.push(lastEntry.time.substring(0, 5));
        chart.data.datasets[0].data.shift();
        chart.data.datasets[0].data.push(lastEntry.networkDown);
        chart.data.datasets[1].data.shift();
        chart.data.datasets[1].data.push(lastEntry.networkUp);
        chart.update('none');
    }
  }

  onDestroy(() => {
    chart?.destroy();
  });
</script>

<div class="h-full w-full relative overflow-hidden">
  <canvas bind:this={canvasElement} class="transition-transform duration-1000 ease-linear"></canvas>
</div>