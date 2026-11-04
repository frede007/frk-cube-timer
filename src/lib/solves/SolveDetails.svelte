<script>
  import { onMount } from 'svelte';
  import { formatTime } from '../../core/formatTime.js';
  import { formatDateTime } from '../../core/formatDateTime.js';
  /** @typedef {import('../../storage/solves.js').SavedSolve} SavedSolve */

  /** @type {HTMLDialogElement} */
  let dialog;

  // $effect tiek izpildīts pēc komponenta attēlošanas, 
  // tāpēc dialog.showModal() tiek izsaukts tikai tad, kad logs jau ir pievienots DOM.
  $effect(() => {
    dialog?.showModal();
  });

  /** @type {{ solve: SavedSolve, onclose: () => void, ondelete: (number: number) => void, onupdate: (changes: any) => void }} */
  let { solve, onclose, ondelete, onupdate } = $props();

  let comment = $state('');
  onMount(() => {
    comment = solve.comment ?? '';
  });
</script>

<!-- logs tiek aizvērts, kad lietotājs ar peli spiež ārpus tā -->
<!-- Kad logs tiek aizvērts, tiek izsaukta onclose funkcija -->
<dialog bind:this={dialog} onclose={onclose} 
        onclick={(event) => {if (event.target === dialog) dialog.close();}}> <!-- logs tiek aizvērts, kad lietotājs ar peli spiež ārpus tā -->
  <div class="details">
    <h2>Solve details</h2>

    <p><strong>Time:</strong> {formatTime(solve.timeMs)}</p>
    <p><strong>Date:</strong> {formatDateTime(solve.startedAt)}</p>
    <p><strong>Scramble:</strong> {solve.scramble ?? 'Not available'}</p>

    <label for="comment"><strong>Comment:</strong></label>
    <!-- Bez stopPropagation atstarpes taustiņš nestrādā komentāra ievadē -->
    <textarea
      id="comment"
      bind:value={comment}
      onkeydown={(event) => event.stopPropagation()}
      onkeyup={(event) => event.stopPropagation()}
      onblur={() => {
        comment = comment.trim();

        if (comment !== (solve.comment ?? '')) {
          onupdate({ comment });
        }
      }}
      rows="3"
      placeholder="Add a comment..."
    ></textarea>

    <p><strong>Inspection penalty:</strong> {solve.inspectionPenalty}</p>

    <div class="penalties">
      <p><strong>Solve penalty:</strong></p>
      {#each ['OK', '+2', 'DNF'] as penalty}
        <button
          class="btn penalty-btn"
          type="button"
          class:active={solve.solvePenalty === penalty}
          onclick={() => {
            if (solve.solvePenalty !== penalty) {
              onupdate({ solvePenalty: penalty });
            }
          }}
        >
          {penalty}
        </button>
      {/each}
    </div>

    <div class="actions">
      <button class="btn close-btn" autofocus onclick={() => dialog.close()}>
        Close
      </button>
      <button class="btn delete-btn" onclick={() => ondelete?.(solve.number)}>
        Delete
      </button>
    </div>
  </div>
</dialog>

<style>
  dialog {
    width: min(90vw, 500px);
    padding: 0;
    border: 1px solid #888;
    border-radius: 12px;
    background: var(--bg);
    color: var(--fg);
  }

  dialog::backdrop {
    background: rgb(0 0 0 / 0.6);
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.5rem;
  }

  .details h2,
  .details p {
    margin: 0;
  }

  .btn {
    background: #585858;
    border: 1px solid #ccc;
    padding: 0.25rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
  }

  .close-btn {

    width: 20%;
  }

  .delete-btn {
    background-color: #1e1e1e;
    color: white;
  }

  .delete-btn:hover {
    background-color: #ff4d4d;
    border-color: #ff4d4d;
  }

  .close-btn:hover {
    background-color: #8f8f8f;
    border-color: none;
  }

  .penalties {
    display: flex;
    gap: 1rem;
  }

  .penalties button {
    flex: 1;
    cursor: pointer;
    background: #292929;
    border: 1px solid #ccc;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    border-radius: 4px;
  }

  .penalties button.active {
    background: #c9c9ca;
    color: black;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }
</style>