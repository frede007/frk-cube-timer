<script>
  // Tikai attēlošana: saņem tekstu un stāvokli.
  let { text, state } = $props();
</script>

<div class="time" class:holding={state === 'holding'} class:ready={state === 'ready'}>
  {text}
</div>

<style>
  .time {
    font-size: clamp(4rem, 20vw, 14rem);
    line-height: 1;
    /* Katrs cipars tiek zīmēts ar vienādu platumu, lai displejs neraustītos */
    font-variant-numeric: tabular-nums;
    user-select: none;
  }

  .time.holding {
    color: var(--hold);
  }

  .time.ready {
    color: var(--ready);
  }
</style>
