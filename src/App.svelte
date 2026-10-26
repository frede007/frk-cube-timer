
<script>
  import Timer from './lib/timer/Timer.svelte';
  import { createSolve } from './core/solve.js';
  import SolveList from './lib/solves/SolveList.svelte';


  let solves = $state([]);
  let nextNumber = 1;

  $inspect(solves);
 
  // Taimera dati (Salikšanas laika dati) nonāk šeit. Vēlāk šeit tiks izsaukta
  // liciena saglabāšana (LIC-01) no src/storage.
  /**
  * @param {{ timeMs: number, startedAt?: number }} result
  */
  function handleFinish({ timeMs, startedAt = Date.now() }) {
    const solve = createSolve({ number: nextNumber, startedAt, timeMs });
    solves.push(solve);
    nextNumber++;
  }
</script>
 
<main>
  <aside class="side">
    <div class="list-box">
      <SolveList {solves} />
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
    overflow-y: auto;
    display: flex;
  }
</style>
 