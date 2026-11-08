<script>
  let { sessions, activeSessionId, onselect } = $props();

  /** @param {*} event*/
  function handleChange(event) {
    onselect(event.currentTarget.value);
  }
</script>

<div class="session-selector">
  <label for="session-select">Session</label>

  <select
    id="session-select"
    value={activeSessionId ?? ''}
    onchange={handleChange}
  >
    <option value="" disabled>Select a session</option>
    {#each sessions as session (session.id)}
      <option value={session.id}>
        {session.name}
      </option>
    {/each}
  </select>
</div>

<style>
  .session-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }

  select {
    flex: 1;
    min-width: 0;
    padding: 0.4rem 0.6rem;
    font: inherit;
    color: inherit;
    background: var(--bg);
    border: 1px solid #888;
    border-radius: 6px;
    cursor: pointer;
  }
</style>