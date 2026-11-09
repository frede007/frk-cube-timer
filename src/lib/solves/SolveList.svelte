<script>
  import { formatDisplayTime, formatDisplayAverage } from '../../core/formatTime.js';
  import SessionsStats from '../stats/SessionStats.svelte';
  import { calcMean, calcAverage, calcCurrentAverage } from '../../core/stats.js';
  /** @typedef {import('../../storage/solves.js').SavedSolve} SavedSolve */

  /** @type {{ solves: SavedSolve[],
               onselect?: (solve: SavedSolve) => void
            }} */
  let { solves, onselect } = $props();


  /** 
   * @param {SavedSolve[]} solves
   * @param {number} index
   * @param {number} count
  */
  function runningAverage(solves, index, count) {
    if (index + 1 < count) return null;

    return calcAverage(solves.slice(index - count + 1, index + 1));
  }
</script>

<div class="panel">
  <SessionsStats {solves} onselect={onselect} />
  <div class="rows">
    <!-- Saraksts ar visiem salikšanas rezultātiem. -->
    <table class="solve-list">
      <thead>
        <tr>
          <th>#</th>
          <th>Time</th>
          <th>Ao5</th>
          <th>Ao12</th>
        </tr>
      </thead>
      <tbody>
        {#each [...solves].reverse() as solve, i (solve.number)} <!-- Licieniem jābūt kārtotiem no jaunākā līdz vecākajam -->
          <tr>
            <td>{solves.length - i}</td>
            <td>
              <button class="solve-time" onclick={() => onselect?.(solve)}> <!-- Nospiežot uz laika, solve objekts tiek padots onselect funkcijai -->
                {formatDisplayTime(solve)}
              </button>
            </td>
            <td>
              {#if solves.length - i >= 5}
                {formatDisplayAverage(runningAverage(solves, solves.length - 1 - i, 5))}
              {:else}
                -
              {/if}
            </td>
            <td>
              {#if solves.length - i >= 12}
                {formatDisplayAverage(runningAverage(solves, solves.length - 1 - i, 12))}
              {:else}
                -
              {/if}
            </td>
          </tr>
        {:else}
          <tr><td colspan="4">No solves found</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .panel {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .rows {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
  }

  .solve-list {
    width: 100%;
    height: max-content; /* lai tabula neaizņemtu visu doto horizontālo vietu */
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  .solve-list th {
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .solve-list th,
  .solve-list td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid #ccc;
  }

  .solve-list th {
    background-color: #a63aff;
    font-weight: bold;
  }

  .solve-time {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  .solve-time:hover {
    text-decoration: underline;
  }
</style>
