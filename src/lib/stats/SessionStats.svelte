<script>
  import { bestSolve, sessionMean, nonDNFSolveCount } from '../../core/stats.js';
  import { fullSolveTime } from '../../core/solve.js';
  import { formatTime } from '../../core/formatTime.js';

  /** @typedef {import('../../storage/solves.js').SavedSolve} SavedSolve */
 
  /** @type {{ solves: SavedSolve[],
               onselect?: (solve: SavedSolve) => void }} */
  let { solves, onselect } = $props();
 
  const best = $derived(bestSolve(solves));
  const bestTime = $derived(best === null ? null : fullSolveTime(best));
  const mean = $derived(sessionMean(solves));
  const nonDNFCount = $derived(nonDNFSolveCount(solves));
  const solveCount = $derived(solves.length);
 
  /** @param {number | null} ms */
  function show(ms) {
    return ms === null ? '-' : formatTime(ms);
  }
</script>
 
<div class="stats">
  <div>
    <span class="label">Best</span>
    <!-- class:active un onclick if pārbaude, vai ir kaut vai viens liciens sesijā -->
    <button class="solve-time" class:active={best !== null} 
      onclick={() => {
        if (best !== null) {
          onselect?.(best);
        }
      }}> <!-- Nospiežot uz laika, solve objekts tiek padots onselect funkcijai -->
      {show(bestTime)}
    </button>
  </div>
  <div>
    <span class="label">Count</span>
    <span class="value">{nonDNFCount}/{solveCount}</span>
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

  .solve-time {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    font: inherit;
    font-weight: bold;
  }

  .stats button.active:hover {
    text-decoration: underline;
    cursor: pointer;
  }
</style>
