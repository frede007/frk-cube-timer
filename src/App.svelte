
<script>
  import { onMount } from 'svelte';
  import { createSession, listSessions } from './storage/sessions.js';
  import { listSolves , saveSolve, deleteSolve } from './storage/solves.js';
  import Timer from './lib/timer/Timer.svelte';
  import { createSolve } from './core/solve.js';
  import SolveList from './lib/solves/SolveList.svelte';

  /** @type {import('./storage/solves.js').SavedSolve[]} */
  let solves = $state([]);
  let activeSessionId = $state(null);
  let loading = $state(true);
  let storageError = $state('');

  async function loadInitialData() {
    try { // TODO: vēlāk pievienot sesiju saraksta izvēli, ja ir vairākas sesijas.
      const sessions = await listSessions();

      let session;

      if (sessions.length === 0) {
        session = await createSession();
      } else {
        session = sessions[0];
      }

      activeSessionId = session.id;
      solves = await listSolves(session.id);
    } catch (error) {
      console.error('Failed to load data:', error);
      storageError = 'Failed to load saved data.';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadInitialData();
  });

  $inspect(solves);
 
  // Taimera dati (Salikšanas laika dati) tiek padoti liciena saglabāšanas funkcijai.
  /**
  * @param {{ timeMs: number, startedAt?: number }} result
  */
  async function handleFinish({ timeMs, startedAt = Date.now() }) {
    if (!activeSessionId || loading || storageError) {
      return;
    }

    try {
      const solve = createSolve({
        timeMs,
        startedAt
      });

      const savedSolve = await saveSolve(activeSessionId, solve);

      solves.push(savedSolve);
    } catch (error) {
      console.error('Failed to save solve:', error);
      storageError = 'Failed to save solve.';
    }
  }

  // Laika dzēšanas funkcija. Vēlāk šeit tiks izsaukta liciena dzēšana (LIC-04) no src/storage.
  /**
   * @param {number} solveNumber
  */
  async function handleDeleteSolve(solveNumber) {
    if (!activeSessionId || loading || storageError) {
      return;
    }

    try {
      await deleteSolve(activeSessionId, solveNumber);

      solves = solves.filter(solve => solve.number !== solveNumber)

    } catch (error) {
      console.error('Failed to delete solve:', error);
      storageError = 'Failed to delete solve.';
    }

  }
</script>
 
<main>
  <aside class="side">
    <div class="list-box">
      {#if loading}
        <p>Ielādē licienus...</p>
      {:else if storageError}
        <p role="alert">{storageError}</p>
      {:else}
        <SolveList {solves} ondelete={handleDeleteSolve} />
      {/if}
    </div>
  </aside>

  <section class="center">
    <Timer onfinish={handleFinish} />
  </section>
</main>
 
<style>
  main {
    height: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); /* 3 kolonnas: kreisā, centrālā, labā */
    align-items: center;
  }

  .side {
    align-self: stretch;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .list-box {
    width: 75%;
    height: 50%;
  }
</style>
 