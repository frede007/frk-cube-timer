// Taimera stāvokļu automāts (TMR-01, TMR-02).
// Stāvokļi: idle, holding, ready, running, stopped
// Notikumi: down, up, holdElapsed, cancel

/** @typedef {'idle' | 'holding' | 'ready' | 'running' | 'stopped'} TimerState */

/** @type {Record<TimerState, Record<string, TimerState>>} */
export const transitions = {
  idle: { down: 'holding' },
  holding: { up: 'idle', holdElapsed: 'ready', cancel: 'idle' },
  ready: { up: 'running', cancel: 'idle' },
  running: { down: 'stopped' },
  stopped: { up: 'idle' },
};

/**
 * Atgriež nākamo stāvokli vai null, ja notikums šajā stāvoklī nav atļauts.
 * @param {TimerState} state
 * @param {string} event
 * @returns {TimerState | null}
 */
export function transition(state, event) {
  return transitions[state]?.[event] ?? null;
}
