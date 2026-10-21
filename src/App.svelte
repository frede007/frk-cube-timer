<script>
  const HOLD_MS = 550; // TODO: vēlāk tiks iestatīts iestatījumos (IES-01)

  // Sāvokļi: idle, holding, ready, running, stopped
  // Notikumi: down, up, holdElapsed, cancel
  const transitions = {
    idle: { down: 'holding' },
    holding: { up: 'idle', holdElapsed: 'ready', cancel: 'idle' },
    ready: { up: 'running', cancel: 'idle' },
    running: { down: 'stopped' },
    stopped: { up: 'idle' },
  };

  let state = $state('idle');
  let elapsedMs = $state(0);

  let startTime = 0;
  let frameId = 0;
  let holdTimer = 0;

  function send(event) {
    const now = performance.now();
    const next = transitions[state]?.[event];
    if (!next) return; // ja notikums nav derīgs pašreizējā stāvoklī, tad atgriezt
    leave(state);
    state = next;
    enter(next, now);
  }

  function enter(newState, now) {
    if (newState === 'holding') {
      holdTimer = setTimeout(() => send('holdElapsed'), HOLD_MS);
    } else if (newState === 'ready') {
      elapsedMs = 0;
    } else if (newState === 'running') {
      startTime = now;
      frameId = requestAnimationFrame(tick);
    } else if (newState === 'stopped') {
      elapsedMs = now - startTime;
    }
  }

  function leave(oldState) {
    if (oldState === 'holding') {
      clearTimeout(holdTimer);
    } else if (oldState === 'running') {
      cancelAnimationFrame(frameId);
    }
  }

  function tick() {
    elapsedMs = performance.now() - startTime;
    frameId = requestAnimationFrame(tick);
  }

  function onKeydown(event) {
    if (event.code !== 'Space') return;
    event.preventDefault(); // neļauj lapai ritināties, kad nospiež Space
    if (event.repeat) return; // ignorē atkārtotus nospiešanas notikumus, kad poga tiek turēta nospiesta
    send('down');
  }

  function onKeyup(event) {
    if (event.code !== 'Space') return;
    event.preventDefault();
    send('up');
  }

  // Ja logs zaudē fokusu, pogas atlaišanas notikums nekad nenotiek.
  function onBlur() {
    send('cancel');
  }

  // Rāda 12.34 zem minūtes un 1:02.34 virs tās. Apgriež, nevis noapaļo, pēc WCA noteikumiem.
  function formatTime(ms) {
    const hundredths = Math.floor(ms / 10);
    const cs = String(hundredths % 100).padStart(2, '0');
    const totalSeconds = Math.floor(hundredths / 100);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    if (minutes > 0) {
      return `${minutes}:${String(seconds).padStart(2, '0')}.${cs}`;
    }
    return `${seconds}.${cs}`;
  }
</script>

<svelte:window onkeydown={onKeydown} onkeyup={onKeyup} onblur={onBlur} />

<main>
  <div
    class="time"
    class:holding={state === 'holding'}
    class:ready={state === 'ready'}
  >
    {formatTime(elapsedMs)}
  </div>
</main>

<style>
  main {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

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