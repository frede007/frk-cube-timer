<script>
  import { STAT_DEFINITIONS, bestSolve, sessionMean, nonDNFSolveCount, calcMean, calcCurrentAverage, calcBestMean, calcBestAverage } from '../../core/stats.js';
  import { fullSolveTime } from '../../core/solve.js';
  import { formatTime } from '../../core/formatTime.js';

  /** @typedef {import('../../storage/solves.js').SavedSolve} SavedSolve */
  /** @typedef {import('../../core/stats.js').StatDefinition} StatDefinition*/
 
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

  /** @param {StatDefinition} stat */
  function currentStat(stat) {
    if (solves.length < stat.count) return null;

    if (stat.kind === 'single') {
      return fullSolveTime(solves[solves.length - 1]);
    }

    if (stat.kind === 'mean') {
      return calcMean(solves.slice(-stat.count));
    }

    return calcCurrentAverage(solves, stat.count);
  }

  /** @param {StatDefinition} stat */
  function bestStat(stat) {
    if (stat.kind === 'single') {
      const best = bestSolve(solves);
      return best === null ? null : fullSolveTime(best);
    }

    if (stat.kind === 'mean') {
      return calcBestMean(solves, stat.count);
    }

    return calcBestAverage(solves, stat.count);
  }

  const statRows = $derived(
    STAT_DEFINITIONS.map((stat) => ({
      ...stat,
      available: solves.length >= stat.count,
      current: currentStat(stat),
      best: bestStat(stat)
    }))
  ); // TODO: add mapping to settings selection of stat definitions

</script>

<div class="overall-stats">
  <table>
    <thead>
      <tr>
        <th>Statistic</th>
        <th>Current</th>
        <th>Best</th>
      </tr>
    </thead>
    <tbody>
      {#each statRows as row (row.id)}
        {#if row.available || row.id === 'single'}
          <tr>
            <td>{row.label}</td>
            <td>
              {#if !row.available}
                -
              {:else if row.current === null}
                DNF
              {:else}
                {formatTime(row.current)}
              {/if}
            </td>
            <td>{show(row.best)}</td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>

<div class="simple-stats">
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
  .overall-stats {
    padding: 0.5rem;
  }

  .overall-stats table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  .overall-stats th,
  .overall-stats td {
    text-align: left;
    padding: 0.15rem 0;
  }

  .overall-stats th:nth-child(1) {
    width: 37%;
  }

  .overall-stats th:nth-child(2) {
    width: 40%;
  }

  .overall-stats th:nth-child(3) {
    width: 23%;
  }

  .simple-stats {
    display: grid;
    grid-template-columns: 37% 40% 23%;
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

  .simple-stats button.active:hover {
    text-decoration: underline;
    cursor: pointer;
  }
</style>
