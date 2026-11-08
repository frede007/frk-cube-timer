<script>
  import { onMount } from 'svelte';
  import { createSession, listSessions , deleteSession , updateSession } from './storage/sessions.js';
  import { listSolves , saveSolve, deleteSolve , updateSolve } from './storage/solves.js';
  import Timer from './lib/timer/Timer.svelte';
  import { createSolve } from './core/solve.js';
  import { generateScramble } from './core/scramble.js';
  import SolveList from './lib/solves/SolveList.svelte';
  import ScrambleDisplay from './lib/scramble/ScrambleDisplay.svelte';
  import SolveDetails from './lib/solves/SolveDetails.svelte';
  import SessionSelector from './lib/sessions/SessionSelector.svelte';
  import SessionManager from './lib/sessions/SessionManager.svelte';

  /** @typedef {import('./storage/solves.js').SavedSolve} SavedSolve */
  /** @typedef {import('./storage/sessions.js').Session} Session*/

  /** @type {SavedSolve[]} */
  let solves = $state([]);

  /** @type {Session[]}*/
  let sessions = $state([]);

  /** @type {string | null}*/
  let activeSessionId = $state(null);

  let loading = $state(true);
  let storageError = $state('');

  async function loadInitialData() {
    try {
      sessions = await listSessions();

      if (sessions.length === 0) {
        const session = await createSession();
        sessions = [session];
      }

      const savedSessionId = localStorage.getItem('activeSessionId');

      const session = sessions.find(s => s.id === savedSessionId) ?? sessions[0];

      activeSessionId = session.id;
      localStorage.setItem('activeSessionId', session.id);

      solves = await listSolves(activeSessionId);
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


  /**
   * @param {string} sessionId
   */
  async function handleSelectSession(sessionId) {
    if (sessionId === activeSessionId) return;

    activeSessionId = sessionId;
    localStorage.setItem('activeSessionId', sessionId);

    selectedSolve = null;
    loading = true;
    storageError = '';

    try {
      solves = await listSolves(sessionId);
    } catch (error) {
      console.error('Failed to load solves for the selected session:', error);
      storageError = 'Failed to load solves for the selected session.';
    } finally {
      loading = false;
    }
  }

  // $inspect(solves);
  $inspect(sessions);

  let currentScramble = $state(generateScramble());
 
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
        startedAt,
        scramble: currentScramble
      });

      const sessionId = activeSessionId;
      const savedSolve = await saveSolve(sessionId, solve);

      solves.push(savedSolve);
      currentScramble = generateScramble();
    } catch (error) {
      console.error('Failed to save solve:', error);
      storageError = 'Failed to save solve.';
    }
  }

  // Laika dzēšanas funkcija
  /**
   * @param {number} solveNumber
  */
  async function handleDeleteSolve(solveNumber) {
    if (!activeSessionId || !selectedSolve || selectedSolve.number !== solveNumber) {
      throw new Error('Cannot delete solve');
    }

    const sessionId = activeSessionId;

    await deleteSolve(sessionId, solveNumber);

    if (activeSessionId === sessionId) {
      solves = solves.filter(solve => solve.number !== solveNumber);
    }

    if (selectedSolve?.sessionId === sessionId &&
        selectedSolve.number === solveNumber) {
      handleCloseSolve(); // Aizver SolveDetails logu pēc dzēšanas
    }
  }

  /** @type {SavedSolve | null} */
  let selectedSolve = $state(null);

  /** 
   * @param {SavedSolve} solve
   * @returns {void}
  */
  function handleSelectSolve(solve) {
    selectedSolve = solve;
  }

  function handleCloseSolve() {
    selectedSolve = null;
  }


  /**
   * @param {any} changes
   * @returns {Promise<void>}
   */
  async function handleUpdateSolve(changes) {
    if (!selectedSolve || !activeSessionId) {
      throw new Error('Cannot update solve');
    };

    const sessionId = activeSessionId;

    const number = selectedSolve.number;

    await updateSolve(sessionId, number, changes);

    if (activeSessionId === sessionId) {
      solves = solves.map(solve =>
        solve.number === number ? { ...solve, ...changes } : solve
      );
    }

    if (selectedSolve?.number === number &&
        selectedSolve?.sessionId === sessionId
    ) {
      selectedSolve = { ...selectedSolve, ...changes };
    }
  }

  // Session management
  let sessionManagerOpen = $state(false);
  
  function openSessionManager() {
    sessionManagerOpen = true;
  }

  function closeSessionManager() {
    sessionManagerOpen = false;
  }

  /** @param {string} name */
  async function handleCreateSession(name) {
    const session = await createSession(name);

    sessions = [...sessions, session];

    // TODO: Add a specific error, when the session is created but the selection fails.
    await handleSelectSession(session.id);
  }

  /** @param {string} sessionId */
  async function handleDeleteSession(sessionId) {
    if (!sessionId) {
      throw new Error('Cannot delete session');
    };

    await deleteSession(sessionId);

    sessions = sessions.filter(session => session.id !== sessionId);

    if (activeSessionId === sessionId) {
      await handleSelectSession(sessions[0].id);
    }
    // TODO: add different error for failing to switch sessions
  }
  /** @param {string} sessionId 
    * @param {Partial<Pick<Session, 'name' | 'scrambleType' | 'cube'>>} changes
  */
  async function handleUpdateSession(sessionId, changes) {
    if (!sessionId) {
      throw new Error('Cannot update session');
    };

    await updateSession(sessionId, changes);

    sessions = sessions.map(session => 
      session.id === sessionId ? { ...session, ...changes } : session
    );
  }

  
</script>


<div class="app-layout">
  <header class="scramble-header">
    <ScrambleDisplay scramble={currentScramble} />
  </header>

  <main>
    <aside class="side">
      <div class="list-box">
        {#if loading}
          <p>Loading solves...</p>
        {:else if storageError}
          <p role="alert">{storageError}</p>
        {:else}
          <div class="session-controls">
            <div class="selector-wrapper">
              <SessionSelector
                {sessions}
                {activeSessionId}
                onselect={handleSelectSession}
              />
            </div>

            <button class="btn manage-btn" onclick={openSessionManager}>
              Manage
            </button>
          </div>
          <SolveList {solves} onselect={handleSelectSolve} />
        {/if}
      </div>
    </aside>

    <section class="center">
      <Timer onfinish={handleFinish} />
    </section>
  </main>
</div>

{#if selectedSolve}
  <SolveDetails solve={selectedSolve} onclose={handleCloseSolve} ondelete={handleDeleteSolve} onupdate={handleUpdateSolve} />
{/if}
{#if sessionManagerOpen}
  <SessionManager
    {sessions}
    {activeSessionId}
    oncreate={handleCreateSession}
    onclose={closeSessionManager}
    onupdate={handleUpdateSession}
    ondelete={handleDeleteSession}
  />
{/if}
 
<style>
  main {
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); /* 3 kolonnas: kreisā, centrālā, labā */
    align-items: center;
  }

  .side {
    align-self: stretch;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: left;
    padding-left: 2rem;
  }

  .list-box {
    width: 75%;
    height: 50%;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    border: 1px solid white;
    border-radius: 12px;
    padding: 1rem;
    margin: 1rem;
    box-sizing: border-box;
  }

  .center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .app-layout {
    height: 100vh;
    display: grid;
    grid-template-rows: 0 minmax(0, 1fr);
  }

  .scramble-header {
    width: 75%;
    justify-self: center;
    align-self: start;
    padding-top: 2rem;
    position: relative;
    z-index: 1;
  }

  .btn {
    background: #585858;
    border: 1px solid #ccc;
    padding: 0.25rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .session-controls {
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
  }

  .selector-wrapper {
    flex: 6;
    min-width: 0;
  }

  .manage-btn {
    background-color: #1e1e1e;
    color: white;
    flex: 1;
    min-width: 0;
  }

  .manage-btn:hover {
    background-color: #8f8f8f;
  }
</style>
 