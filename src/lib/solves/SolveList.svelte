<script>
  import { formatTime } from '../../core/formatTime.js';
  import { formatDateTime } from '../../core/formatDateTime.js';  

  // Solves tiek pad
  /**
   * @type {{ solves: import('../../core/solve.js').Solve[] }}
   */
  let { solves } = $props();
</script>

<!-- Saraksts ar visiem salikšanas rezultātiem. -->
<table class="solve-list">
  <thead>
    <tr><th>#</th><th>Time</th><th>Date</th></tr>
  </thead>
  <tbody>
    {#each [...solves].reverse() as solve, i (solve.number)} <!-- Licieniem jābūt kārtotiem no jaunākā līdz vecākajam -->
      <tr>
        <td>{solves.length - i}</td>
        <td>{formatTime(solve.timeMs)}</td>
        <td>{formatDateTime(solve.startedAt)}</td>
      </tr>
    {:else}
      <tr><td colspan="3">No solves found</td></tr>
    {/each}
  </tbody>
</table>

<style>
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
</style>
