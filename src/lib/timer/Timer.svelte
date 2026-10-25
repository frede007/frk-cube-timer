<script>
  import { createTimer } from './timer.svelte.js';
  import TimerDisplay from './TimerDisplay.svelte';
  import { formatTime } from '../../core/formatTime.js';

  // Funkcija, ko izsauc, kad taimeris apturēts: onfinish({ timeMs })
  let { onfinish } = $props();

  const timer = createTimer({ onStopped: (result) => onfinish?.(result) });
</script>

<svelte:window onkeydown={timer.onKeydown} onkeyup={timer.onKeyup} onblur={timer.onBlur} />

<TimerDisplay text={formatTime(timer.elapsedMs)} state={timer.state} />
