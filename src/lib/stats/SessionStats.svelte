<script>
  import { bestSolve, sessionMean } from '../../core/stats.js';
  import { fullSolveTime } from '../../core/solve.js';
  import { formatTime } from '../../core/formatTime.js';
 
  /** @type {{ solves: import('../../core/solve.js').Solve[] }} */
  let { solves } = $props();
 
  const best = $derived(bestSolve(solves));
  const bestTime = $derived(best === null ? null : fullSolveTime(best));
  const mean = $derived(sessionMean(solves));
 
  /** @param {number | null} ms */
  function show(ms) {
    return ms === null ? '–' : formatTime(ms);
  }
</script>
 
<div class="stats">
  <div>
    <span class="label">Best</span>
    <span class="value">{show(bestTime)}</span>
  </div>
  <div>
    <span class="label">Mean</span>
    <span class="value">{show(mean)}</span>
  </div>
</div>
 
<style>
  .stats {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem;
    border-bottom: 1px solid #ccc;
    font-variant-numeric: tabular-nums;
  }
 
  .label {
    opacity: 0.7;
    margin-right: 0.25rem;
  }
 
  .value {
    font-weight: bold;
  }
</style>
