<script>
  import { onMount } from 'svelte';
  import { formatDisplayTime } from '../../core/formatTime.js';
  import { formatDateTime } from '../../core/formatDateTime.js';
  /** @typedef {import('../../storage/solves.js').SavedSolve} SavedSolve */

  /** @type {HTMLDialogElement} */
  let dialog;

  // $effect tiek izpildīts pēc komponenta pievienošanas, 
  // tāpēc dialog.showModal() tiek izsaukts tikai tad, kad logs jau ir pievienots DOM.
  $effect(() => {
    dialog?.showModal();
  });

  /** @type {{ solve: SavedSolve, onclose: () => void, 
               ondelete: (number: number) => Promise<void>, 
               onupdate: (changes: any) => Promise<void> }} */
  let { solve, onclose, ondelete, onupdate } = $props();

  let comment = $state('');
  // Komentāra ievades lauka vērtība tiek iestatīta uz solve.comment, kad komponente tiek attēlota.
  onMount(() => {
    comment = solve.comment ?? '';
  });


  /** @typedef {import('../../core/solve.js').Penalty} Penalty */

  /** @type {Penalty[]} */
  const penalties = ['OK', '+2', 'DNF'];

  /*
  let saving = $state(false);
  let actionError = $state('');
  */

  /** @param {*} changes */
  /*
  async function handleUpdate(changes) {
    if (saving) return;

    saving = true;
    actionError = '';

    try {
      await onupdate(changes);
    } catch (error) {
      actionError = 'Failed to update solve.';
      console.error(error);
    } finally {
      saving = false;
    }
  }
  */

  /** @param {number} solveNumber*/
  /*
  async function handleDelete(solveNumber) {
    if (saving) return;

    saving = true;
    actionError = '';

    try {
      await ondelete(solveNumber);
    } catch (error) {
      actionError = 'Failed to delete solve.';
      console.error(error);
    } finally {
      saving = false;
    }
  }

  */

  let saving = $state(false);
  let actionError = $state('');

  let pendingOperation = Promise.resolve();
  let operationCount = 0;

  /**
   * Pievieno asinhronu darbību rindai, nodrošinot tās secīgu izpildi.
   * Apstrādā kļūdas un atjaunina saglabāšanas stāvokli.
   * @param {() => Promise<void>} action
   * @param {string} errorMessage
   * @returns {Promise<void>}
   */
  function queueOperation(action, errorMessage) {
    operationCount++;
    saving = true;

    pendingOperation = pendingOperation.then(async () => {
      actionError = '';

      try {
        await action();
      } catch (error) {
        actionError = errorMessage;
        console.error(error);
      } finally {
        operationCount--;
        saving = operationCount > 0;
      }
    });

    return pendingOperation;
  }

  /**
   * Pievieno liciena atjaunināšanas darbību rindai.
   * @param {Partial<Pick<SavedSolve, 'comment' | 'solvePenalty'>>} changes
   * @returns {Promise<void>}
   */
  function handleUpdate(changes) {
    return queueOperation(
      () => onupdate(changes),
      'Failed to update solve.'
    );
  }

  /**
   * Pievieno liciena dzēšanas darbību rindai.
   * @param {number} solveNumber
   * @returns {Promise<void>}
   */
  function handleDelete(solveNumber) {
    return queueOperation(
      () => ondelete(solveNumber),
      'Failed to delete solve.'
    );
  }
  
</script>

<!-- logs tiek aizvērts, kad lietotājs ar peli spiež ārpus tā -->
<!-- Kad logs tiek aizvērts, tiek izsaukta onclose funkcija -->
<dialog bind:this={dialog} onclose={onclose} 
        onclick={(event) => {if (event.target === dialog) dialog.close();}}> <!-- logs tiek aizvērts, kad lietotājs ar peli spiež ārpus tā -->
  <div class="details">
    <h2>Solve details</h2>

    <p><strong>Time:</strong> {formatDisplayTime(solve)}</p>
    <p><strong>Date:</strong> {formatDateTime(solve.startedAt)}</p>
    <label for="scramble"><strong>Scramble:</strong></label>
    <p id="scramble">{solve.scramble ?? 'Not available'}</p>

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
          handleUpdate({ comment });
        }
      }}
      rows="3"
      placeholder="Add a comment..."
    ></textarea>

    <p><strong>Inspection penalty:</strong> {solve.inspectionPenalty}</p>

    <div class="penalties">
      <p><strong>Solve penalty:</strong></p>
      {#each penalties as penalty}
        <button
          class="btn penalty-btn"
          type="button"
          class:active={solve.solvePenalty === penalty}
          onclick={() => {
            if (solve.solvePenalty !== penalty) {
              handleUpdate({ solvePenalty: penalty });
            }
          }}
        >
          {penalty}
        </button>
      {/each}
    </div>

    {#if actionError}
      <p role="alert">{actionError}</p>
    {/if}

    <div class="actions">
      <button class="btn close-btn" autofocus onclick={() => dialog.close()}>
        Close
      </button>
      <button class="btn delete-btn" onclick={() => handleDelete(solve.number)}>
        Delete
      </button>
    </div>
  </div>
</dialog>

<style>
  dialog {
    width: min(90vw, 600px);
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