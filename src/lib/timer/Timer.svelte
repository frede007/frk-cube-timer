<script>
  import { createTimer } from './timer.svelte.js';
  import TimerDisplay from './TimerDisplay.svelte';
  import { formatTime } from '../../core/formatTime.js';

  /** @typedef {import('../../core/timerMachine.js').TimerState} TimerState*/
/** @typedef {{ timeMs: number, startedAt: number }} TimerResult */

  /**
   * @type {{
   *   onfinish?: (result: TimerResult) => void,
   *   onstatechange?: (state: TimerState) => void
   * }}
   */

  let { onfinish, onstatechange } = $props();

  const timer = createTimer({ onStopped: (result) => onfinish?.(result) });

  $effect(() => {
    onstatechange?.(timer.state)
  })
</script>

<svelte:window onkeydown={timer.onKeydown} onkeyup={timer.onKeyup} onblur={timer.onBlur} />

<TimerDisplay text={formatTime(timer.elapsedMs)} state={timer.state} />
