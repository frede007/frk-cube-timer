
<script>
  import Timer from './lib/timer/Timer.svelte';
 
  /**
  * @param {{ timeMs: number, startedAt?: number }} result
  */
  // Taimera dati (Salikšanas laika dati) nonāk šeit. Vēlāk šeit tiks izsaukta
  // liciena saglabāšana (LIC-01) no src/storage.
  function handleFinish({ timeMs, startedAt = Date.now() }) {
    console.log(timeMs, new Date(startedAt).toISOString());
  }
</script>
 
<main>
  <Timer onfinish={handleFinish} />
</main>
 
<style>
  main {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
 
