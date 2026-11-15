<script>
  let { sessions, activeSessionId, oncreate, onupdate, onclose, ondelete } = $props();

  /** @type {HTMLDialogElement} */
  let dialog;
  let name = $state('');

  $effect(() => {
    dialog?.showModal();
  });

  let creating = $state(false);
  let createError = $state('');

  async function handleCreate() {
    const trimmedName = name.trim();
    createError = '';

    if (trimmedName.length > 30) {
      createError = 'Session name cannot be longer than 30 letters.';
      return;
    }

    if (!trimmedName || creating) return;

    creating = true;
    

    try {
      await oncreate(trimmedName);
      name = '';
      dialog.close();
    } catch (error) {
      createError = 'Failed to create session.';
    } finally {
      creating = false;
    }
  }

  let deleting = $state(false);
  let deleteError = $state('');

  /** @param {string} sessionId */
  async function handleDelete(sessionId) {
    if (deleting) return;

    if (sessions.length === 1) {
      alert('Cannot delete the last session.');
      return;
    }

    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    deleting = true;
    deleteError = '';

    try {
      await ondelete(sessionId);
    } catch (error) {
      deleteError = 'Failed to delete session.';
    } finally {
      deleting = false;
    }
  }

  /** @type {string | null}*/
  let editingSessionId = $state(null);
  let newName = $state('');

  /** @typedef {import('../../storage/sessions.js').Session} Session*/

  /** @param {Session} session*/
  function startEditing(session) {
    editingSessionId = session.id;
    newName = session.name;
  }

  function cancelEditing() {
    editingSessionId = null;
    newName = '';
  }

  let updating = $state(false);
  let updateError = $state('');

  /** @param {string} sessionId 
    * @param {string} name
    */
  async function handleUpdate(sessionId, name) {
    if (updating) return;

    updating = true;
    updateError = '';

    try {
      await onupdate(sessionId, { name: name.trim()});
      cancelEditing();
    } catch (error) {
      updateError = 'Failed to update session.';
    } finally {
      updating = false;
    }
  }
</script>

<dialog bind:this={dialog} onclose={onclose}
        onclick={(event) => {if (event.target === dialog) dialog.close();}}>
  <div class="manager">
    <h2 tabindex="-1" autofocus>Manage sessions</h2>

    <!-- Create session form -->
    <form onsubmit={(event) => {
        event.preventDefault();
        handleCreate();
      }}>
      <label for="session-name">Create a new session</label>
      <div class="input-group">
        <input
          id="session-name"
          type="text"
          bind:value={name}
          onkeydown={(event) => event.stopPropagation()}
          onkeyup={(event) => event.stopPropagation()}
          placeholder="Session name"
        />

        <button class="btn create-btn" type="submit" disabled={!name.trim() || creating} >
          {creating ? 'Creating...' : 'Create'}
        </button>
      </div>
      {#if createError}
        <p role="alert">{createError}</p>
      {/if}
    </form>

    <!-- Sesijas ieraksti -->
    {#each sessions as session (session.id)}
      <div class="session-item">
        {#if editingSessionId === session.id}
          <form
            class="edit-form"
            onsubmit={(event) => {
              event.preventDefault();
              handleUpdate(session.id, newName);
            }}
          >
            <input
              type="text"
              bind:value={newName}
              onkeydown={(event) => event.stopPropagation()}
              onkeyup={(event) => event.stopPropagation()}
            />

            <button class="btn save-btn" type="submit" disabled={!newName.trim()}>
              Save
            </button>

            <button class="btn cancel-btn" type="button" onclick={cancelEditing}>
              Cancel
            </button>
          </form>
        {:else}
          <span class="session-name">
            {session.name}
            {#if session.id === activeSessionId}
              <strong>(Active)</strong>
            {/if}
          </span>

          <button class="btn edit-btn" type="button" onclick={() => startEditing(session)}>
            Edit
          </button>

          <button
            class="btn delete-btn"
            type="button"
            onclick={() => handleDelete(session.id)}
            disabled={deleting || sessions.length <= 1}
          >
            Delete
          </button>
        {/if}
      </div>
      {#if deleteError}
        <p role="alert">{deleteError}</p>
      {/if}
    {/each}


    <button class="btn close-btn" type="button" onclick={() => dialog.close()}>
      Close
    </button>
  </div>
</dialog>

<style>
  dialog {
    width: min(90vw, 700px);
    padding: 0;
    border: 1px solid #888;
    border-radius: 12px;
    background: var(--bg);
    color: var(--fg);
  }

  dialog::backdrop {
    background: rgb(0 0 0 / 0.6);
  }

  .manager {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }

  h2 {
    margin: 0;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .input-group {
    display: grid;
    grid-template-columns: minmax(0, 6fr) minmax(0, 1fr) minmax(0, 1fr);
    gap: 0.5rem;
    align-items: stretch;
  }

  input {
    padding: 0.5rem;
    font: inherit;
  }

  .input-group input {
    grid-column: 1;
    min-width: 0;
  }

  .btn {
    background: #585858;
    border: 1px solid #ccc;
    padding: 0.25rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    width: 20%;
  }

  .create-btn {
    background-color: #1e1e1e;
    color: white;
    grid-column: 2 / 4;
    width: 100%;
  }

  .create-btn:hover {
    background-color: #4caf50;
    border-color: #4caf50;
  }

  .input-group .create-btn {
    flex: 1;
    width: auto;
    font-size: 1.0rem;
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

  .session-item, .edit-form {
    display: grid;
    grid-template-columns: minmax(0, 6fr) minmax(0, 1fr) minmax(0, 1fr);
    gap: 0.5rem;
    align-items: stretch;
  }

  .edit-form {
    grid-column: 1 / -1;
  }

  .session-name {
    align-self: center;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .edit-form input {
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
  }

  .session-item .btn {
    width: 100%;
    padding: 0.5rem 0.25rem;
  }
</style>