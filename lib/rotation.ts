// Pure fair-rotation logic for the shift tracker, kept separate from the UI
// so it's easy to reason about (and test) on its own.

export type RotationState = {
  shiftSize: number;
  queue: string[]; // rotation order, skaters not currently sitting out
  onIce: string[];
  sitting: Record<string, true>;
  shiftNumber: number;
  shiftCount: Record<string, number>;
  history: { n: number; players: string[] }[];
};

export function createRotation(presentNames: string[], shiftSize: number): RotationState {
  const shiftCount: Record<string, number> = {};
  presentNames.forEach((n) => (shiftCount[n] = 0));
  return {
    shiftSize,
    queue: presentNames.slice(),
    onIce: [],
    sitting: {},
    shiftNumber: 0,
    shiftCount,
    history: [],
  };
}

function rotationPool(state: RotationState): string[] {
  return state.queue.filter((n) => !state.sitting[n]);
}

// The skaters who will go out the moment "Next Shift" is tapped — lets the
// UI show this before the tap happens, so the coach can give the bench a
// heads-up.
export function upNextPlayers(state: RotationState): string[] {
  return rotationPool(state).slice(0, state.shiftSize);
}

// Takes the next `shiftSize` skaters off the front of the pool and sends the
// ones who just played to the back of the queue, so whoever has sat longest
// is always first in line next time.
export function nextShift(state: RotationState): RotationState {
  const going = upNextPlayers(state);
  if (going.length === 0) return state;
  const stayingInQueue = state.queue.filter((name) => !going.includes(name));
  const queue = stayingInQueue.concat(going);
  const shiftNumber = state.shiftNumber + 1;
  const shiftCount = { ...state.shiftCount };
  going.forEach((p) => (shiftCount[p] = (shiftCount[p] || 0) + 1));
  const history = [{ n: shiftNumber, players: going.slice() }, ...state.history];
  return { ...state, queue, onIce: going, shiftNumber, shiftCount, history };
}

export function toggleSitting(state: RotationState, name: string): RotationState {
  const sitting = { ...state.sitting };
  if (sitting[name]) delete sitting[name];
  else sitting[name] = true;
  return { ...state, sitting };
}

export function benchOrder(state: RotationState): string[] {
  const onIceSet = new Set(state.onIce);
  return state.queue.filter((n) => !onIceSet.has(n));
}
