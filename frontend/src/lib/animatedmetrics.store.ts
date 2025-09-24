import { tweened } from 'svelte/motion';
import { metrics } from './metrics.store';

const animationOptions = { duration: 750, easing: (t: number) => t * (2 - t) };

export const cpuUsage = tweened(0, animationOptions);
export const ramUsage = tweened(0, animationOptions);
export const ramCache = tweened(0, animationOptions);
export const swapUsage = tweened(0, animationOptions);
export const netDown = tweened(0, animationOptions);
export const netUp = tweened(0, animationOptions);
export const loadOne = tweened(0, animationOptions);
export const loadFive = tweened(0, animationOptions);
export const loadFifteen = tweened(0, animationOptions);

metrics.subscribe(newState => {
  if (!newState.latest.cpu) return;

  cpuUsage.set(parseFloat(newState.latest.cpu.usage));
  ramUsage.set(newState.latest.ram.used);
  ramCache.set(newState.latest.ram.cache);
  swapUsage.set(newState.latest.ram.swapUsed);
  netDown.set(newState.latest.network.downloadSpeed);
  netUp.set(newState.latest.network.uploadSpeed);
  loadOne.set(newState.latest.system.load.one);
  loadFive.set(newState.latest.system.load.five);
  loadFifteen.set(newState.latest.system.load.fifteen);
});