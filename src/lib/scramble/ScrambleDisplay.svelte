<script>

  let { scramble, timerState, newscramble } = $props();

  /** @param {(*)} scramble */
  function copyScramble(scramble) {
    navigator.clipboard.writeText(scramble)
  }


</script>

<div class="scramble">
  <button type="button" class="btn-scr" onclick={() => copyScramble(scramble)}>
    {scramble}
  </button>
  <button type="button" class="btn-gen" disabled={timerState !== 'idle' } onclick={() => newscramble()}>
    ↻
  </button>
</div>

<style>
  .scramble {
    font-size: clamp(1.25rem, 3vw, 2rem);
    line-height: 1.2;
    user-select: none;
    text-align: center;

    display: flex;
    gap: 2rem;

    border: 1px solid white;
    border-radius: 12px;
    padding: 1rem;
  }

  .btn-scr {
    font-size: clamp(1.25rem, 3vw, 2rem);
    line-height: 1.2;
    user-select: none;
    text-align: center;

    background-color: transparent;
    border: none;
    margin: 0;
    padding: 0;
    text-align: inherit;
    font: inherit;
    border-radius: 0;
    cursor: pointer;
    appearance: none;
  }

  .btn-gen {
    background: #2c2c2c;
    border: 1px solid #ccc;
    padding: 0.25rem 0.6rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    cursor: pointer;

    font-weight: bold;
    font-size: 1.2rem;
  }

  .btn-gen:disabled {
    cursor: default;
  }
</style>