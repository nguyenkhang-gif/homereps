// Validates the built-in training programme against the app's design rules.
// Run: node tests/check-program.mjs  (exit code 1 on any violation)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const rig = html.match(/<script id="rig">([\s\S]*?)<\/script>/)[1];
const program = html.slice(html.indexOf('/* program:begin'), html.indexOf('/* program:end */'));
const schedule = JSON.parse(html.match(/const DEFAULT_SCHEDULE = (\{[^}]*\})/)[1].replace(/(\d+):/g, '"$1":'));
const lib = readFileSync(join(root, 'exercises.js'), 'utf8');
const { LEVELS, EXERCISES, setOrder, planSec } = (0, eval)(`${rig}\n${lib}\n${program}\n;({ LEVELS, EXERCISES, setOrder, planSec })`);

const MAIN_MIN = [26, 33], OPT_MAX = 30;
const NEEDS = ['legs', 'push', 'back', 'core'];
const FINISHERS = new Set(['burpee', 'mountain', 'squatthrust']);
const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const group = id => EXERCISES[id]?.group;

// Weekdays in order Monday..Sunday that have a session, mapped to session index.
const week = [1, 2, 3, 4, 5, 6, 0].map(d => ({ d, s: schedule[d] }));

for (const lv of LEVELS) {
  lv.days.forEach((day, di) => {
    const where = `${lv.key} / ${day.n}`, fmt = day.fmt || lv.fmt;
    day.x.forEach(([id, sets, amt, u]) => {
      if (!EXERCISES[id]) return fail(where, `unknown exercise "${id}"`);
      if (!EXERCISES[id].anim) fail(where, `"${id}" has no animation`);
      if (!(sets >= 1 && sets <= 6) || !(amt > 0) || !['r', 'b', 's', 'sb'].includes(u)) fail(where, `bad dose for "${id}"`);
    });
    if (!day.opt) {
      const have = new Set(day.x.map(([id]) => group(id)));
      NEEDS.filter(g => !have.has(g)).forEach(g => fail(where, `missing muscle group "${g}"`));
    }
    // Consecutive sets in execution order must work different muscle groups.
    const order = setOrder(day.x, fmt, lv.rest);
    for (let i = 1; i < order.length; i++) {
      const a = day.x[order[i - 1].i][0], b = day.x[order[i].i][0];
      if (a !== b && group(a) === group(b)) fail(where, `"${a}" then "${b}" both train "${group(a)}"`);
    }
    // High-intensity cardio goes last in its round or pair so it does not pre-fatigue strength work.
    if (fmt === 'circuit') day.x.slice(0, -1).forEach(([id]) => FINISHERS.has(id) && fail(where, `"${id}" should be last in the circuit`));
    if (fmt === 'pairs') day.x.forEach(([id], i) => FINISHERS.has(id) && i % 2 === 0 && i + 1 < day.x.length && fail(where, `"${id}" should be second in its pair`));
    const min = planSec(day.x, fmt, lv.rest) / 60;
    if (day.opt ? min > OPT_MAX : (min < MAIN_MIN[0] || min > MAIN_MIN[1])) fail(where, `${min.toFixed(1)} min is outside the target`);
  });

  // No exercise on two training days in a row; at most twice a week.
  for (let i = 1; i < week.length; i++) {
    const a = week[i - 1].s, b = week[i].s;
    if (a === undefined || b === undefined) continue;
    const shared = lv.days[a].x.map(x => x[0]).filter(id => lv.days[b].x.some(y => y[0] === id));
    shared.forEach(id => fail(lv.key, `"${id}" on consecutive days (${lv.days[a].n} → ${lv.days[b].n})`));
  }
  const count = {};
  lv.days.forEach(d => d.x.forEach(([id]) => { count[id] = (count[id] || 0) + 1; }));
  Object.entries(count).filter(([, n]) => n > 2).forEach(([id, n]) => fail(lv.key, `"${id}" appears ${n} times a week`));
}

if (errors.length) { console.error(`Programme check failed (${errors.length}):\n- ` + errors.join('\n- ')); process.exit(1); }
console.log(`Programme check passed: ${LEVELS.length} levels, ${LEVELS.reduce((n, l) => n + l.days.length, 0)} sessions.`);
