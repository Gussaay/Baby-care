import test from 'node:test';
import assert from 'node:assert/strict';
import { ageMonths, skillMinutes, favourite, ageFits, isBackup, makeToy, demoState, sessionsFor } from './logic.js';
import { domains, skills, toyTypes, skillById } from './catalogue.js';
import { dict } from './strings.js';

test('ageMonths counts whole months', () => {
  assert.equal(ageMonths('2024-01-15', new Date('2026-01-14')), 23);
  assert.equal(ageMonths('2024-01-15', new Date('2026-01-15')), 24);
  assert.equal(ageMonths(''), null);
});

test('play minutes count for every linked skill and each domain once', () => {
  const toy = { ...makeToy('blocks', 'B'), id: 't1' };
  const state = { toys: [toy], children: [], sessions: [] };
  const { bySkill, byDomain } = skillMinutes(state, [{ toyId: 't1', minutes: 10 }, { toyId: 'gone', minutes: 99 }]);
  assert.equal(bySkill.building, 10);
  assert.equal(bySkill.counting, 10);
  assert.equal(byDomain.numbers, 10); // counting + shapes, counted once
  assert.equal(byDomain.create, 10);
});

test('favourite prefers higher enjoyment', () => {
  const state = { toys: [{ id: 'a' }, { id: 'b' }] };
  assert.equal(favourite(state, [{ toyId: 'a', enjoyment: 1 }, { toyId: 'b', enjoyment: 3 }]).id, 'b');
  assert.equal(favourite(state, []), null);
});

test('ageFits uses the toy range, unknown age always fits', () => {
  const now = new Date('2026-06-01');
  const toy = { minAge: 12, maxAge: 36 };
  assert.equal(ageFits(toy, { birthDate: '2025-12-01' }, now), false);
  assert.equal(ageFits(toy, { birthDate: '2024-06-01' }, now), true);
  assert.equal(ageFits(toy, { birthDate: '' }, now), true);
});

test('demo data is a valid backup with sessions per child', () => {
  for (const lang of ['en', 'ar']) {
    const s = demoState(lang);
    assert.ok(isBackup(s));
    assert.ok(sessionsFor(s, s.children[1].id).length > 0);
  }
  assert.equal(isBackup({ toys: [] }), false);
});

test('catalogue is translated and consistent', () => {
  for (const x of [...domains, ...skills, ...toyTypes]) {
    assert.ok(x.name.en && x.name.ar, `${x.id} needs en + ar`);
  }
  for (const t of toyTypes) for (const s of t.skills) assert.ok(skillById[s], `${t.id} -> ${s}`);
});

test('every English string has an Arabic translation', () => {
  const missing = Object.keys(dict.en).filter((k) => !(k in dict.ar));
  assert.deepEqual(missing, []);
  const extra = Object.keys(dict.ar).filter((k) => !(k in dict.en));
  assert.deepEqual(extra, []);
});
