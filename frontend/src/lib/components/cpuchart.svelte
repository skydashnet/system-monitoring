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
        datasets: [{
          data: Array(30).fill(null),
          borderColor: 'rgb(6, 182, 212)',
          backgroundColor: 'rgba(6, 182, 212, 0.2)',
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(100, 116, 139, 0.1)' }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { display: false } }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            intersect: false,
            mode: 'index',
            callbacks: {
              label: (context) => `${context.formattedValue}%`
            }
          }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
      }
    });
  });

  $: if (chart && metricsHistory.length) {
    const lastEntry = metricsHistory[metricsHistory.length - 1];
    if(lastEntry && chart.data.labels && chart.data.datasets[0].data){
        chart.data.labels.shift();
        chart.data.labels.push(lastEntry.time.substring(0, 5));
        chart.data.datasets[0].data.shift();
        chart.data.datasets[0].data.push(lastEntry.cpuUsage);
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