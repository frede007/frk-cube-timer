<script>
  import { formatTime } from '../../core/formatTime.js';
  import { formatDateTime } from '../../core/formatDateTime.js';  

  /**
   * @type {{ solves: import('../../core/solve.js').Solve[], 
              ondelete?: (solveNumber: number) => void }}
   */
  let { solves, ondelete } = $props();
</script>

<!-- Saraksts ar visiem salikšanas rezultātiem. -->
<table class="solve-list">
  <thead>
    <tr>
      <th>#</th>
      <th>Time</th>
      <th>Date</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {#each [...solves].reverse() as solve, i (solve.number)} <!-- Licieniem jābūt kārtotiem no jaunākā līdz vecākajam -->
      <tr>
        <td>{solves.length - i}</td>
        <td>{formatTime(solve.timeMs)}</td>
        <td>{formatDateTime(solve.startedAt)}</td>
        <td>
          <button class="delete-btn" onclick={() => ondelete?.(solve.number)}>
            Delete
          </button>
        </td>
      </tr>
    {:else}
      <tr><td colspan="4">No solves found</td></tr>
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

  .delete-btn {
    background: transparent;
    border: 1px solid #ccc;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    border-radius: 4px;
  }

  .delete-btn:hover {
    background-color: #ff4d4d;
    color: white;
    border-color: #ff4d4d;
  }
</style>
