// The UMONS course units, as the university publishes them.
//
// Each UE's real content lives two levels down: the UE sheet says "Voir la
// seule AA dans cette UE" and defers to its activité d'apprentissage. Scraped
// from webcontent.umons.ac.be/.../pde/2025-2026, 25 UEs, all with published
// content. The seven professional ones — Stage I/II, Veille I/II,
// Communication I/II, Mémoire — describe "apprentissage en entreprise", which
// is the work experience, not a course, so they are not modelled here.
//
// Keywords come from the official "Contenu de l'AA" verbatim. The one thing no
// fiche could say is what the dissertation actually used: MiniZinc,
// ConstraintProgramming, CombinatorialOptimization and Pareto were wrongly
// inferred from the Operations Research sheet, which names no tool at all.
// They belong to the thesis, hence to Acteble.
//
// Retro-fit: written after the DSL edit, not before it.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { ROOT } = require('./config');
const { loadResume } = require('./data');

const resume = loadResume('en');
const project = (name) => resume.projects.find((p) => p.name === name);
const msc = resume.education.find((e) => /Master of Science/.test(e.studyType || ''));

// Sampled from the official sheets, one per bloc.
const FROM_THE_SHEETS = {
  'Bases de données II': ['XML', 'XSLT', 'XQuery'],
  Réseaux: ['TCP/IP', 'HTTP', 'DNS', 'OSPF', 'BGP', 'Ethernet'],
  'Structures de données': ['AVLTrees', 'BTrees', 'HashTables'],
  'Modélisation logicielle': ['Java', 'UML', 'DesignPatterns'],
  'Cryptographie et sécurité des systèmes informatiques': ['Cryptography', 'Unix'],
};

test('the MSc references its course units', () => {
  assert.ok(msc, 'the MSc entry is gone');
  const units = resume.projects.filter((p) => p.entity === 'UMONS');
  assert.equal(units.length, 18, `found ${units.length} course units`);
  const unreferenced = units.filter((u) => !(msc.projects || []).includes(u.name));
  assert.deepEqual(unreferenced, [], 'course units the MSc does not reference');
});

test('each sampled unit carries what its official sheet names', () => {
  for (const [name, expected] of Object.entries(FROM_THE_SHEETS)) {
    const unit = project(name);
    assert.ok(unit, `no course unit named ${name}`);
    const missing = expected.filter((k) => !(unit.keywords || []).includes(k));
    assert.deepEqual(missing, [], `${name} omits: ${missing.join(', ')}`);
  }
});

test('the dissertation stack sits on Acteble, not on Operations Research', () => {
  const acteble = project('Acteble');
  for (const k of ['MiniZinc', 'ConstraintProgramming', 'CombinatorialOptimization', 'Pareto']) {
    assert.ok(acteble.keywords.includes(k), `Acteble does not claim ${k}`);
  }
  const or = project('Recherche opérationnelle et applications');
  assert.ok(!or.keywords.includes('MiniZinc'), 'the OR unit names a tool its sheet does not');
});

test('course units stay off the printed sheet', () => {
  const css = fs.readFileSync(path.join(ROOT, 'css/print-type.css'), 'utf8');
  assert.match(css, /#education \.education-item\s*\{[^}]*display:\s*none/);
});
