// Taimera kontrolieris: savieno stāvokļu automātu (core) ar pārlūku (laiks, taustiņi).
import { transition } from '../../core/timerMachine.js';

const DEFAULT_HOLD_MS = 0; // TODO: vēlāk no iestatījumiem (IES-01)

/**
 * @param {{ getHoldMs?: () => number, onStopped?: (result: { timeMs: number, startedAt: number }) => void }} options
 */
export function createTimer({ getHoldMs = () => DEFAULT_HOLD_MS, onStopped = () => {} } = {}) {
  let state = $state('idle');
  let elapsedMs = $state(0);

  let startTime = 0;
  let frameId = 0;
  let holdTimer = 0;
  let startedAt = 0;

  /**
  * @param {string} event
  */
  function send(event) {
    const now = performance.now(); // nolasa pirms jebkādas citas darbības
    const next = transition(state, event);
    if (!next) return; // notikums šajā stāvoklī nav atļauts
    leave(state);
    state = next;
    enter(next, now);
  }

  /**
  * @param {string} newState
  * @param {number} now
  */
  function enter(newState, now) {
    if (newState === 'holding') {
      holdTimer = setTimeout(() => send('holdElapsed'), getHoldMs());
    } else if (newState === 'ready') {
      elapsedMs = 0;
    } else if (newState === 'running') {
      startedAt = Date.now();
      startTime = now;
      frameId = requestAnimationFrame(tick);
    } else if (newState === 'stopped') {
      elapsedMs = now - startTime;
      onStopped({ timeMs: elapsedMs, startedAt }); // nodod rezultātu tālāk (uz LIC-01)
    }
  }

  /**
  * @param {string} oldState
  */
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
  
  /**
  * @param {KeyboardEvent} event
  */
  function onKeydown(event) {
    if (event.code !== 'Space') return;
    event.preventDefault(); // neļauj lapai ritināties
    if (event.repeat) return; // ignorē atkārtotus notikumus, kad taustiņš ir turēts
    send('down');
  }

  /**
  * @param {KeyboardEvent} event
  */
  function onKeyup(event) {
    if (event.code !== 'Space') return;
    event.preventDefault();
    send('up');
  }

  // Ja logs zaudē fokusu, taustiņa atlaišanas notikums nekad nenotiek.
  function onBlur() {
    send('cancel');
  }

  return {
    get state() {
      return state;
    },
    get elapsedMs() {
      return elapsedMs;
    },
    onKeydown,
    onKeyup,
    onBlur,
  };
}
