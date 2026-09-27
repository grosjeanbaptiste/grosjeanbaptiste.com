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

// The EPHEC bachelor, from the school's own dossiers pédagogiques (the
// "4. PROGRAMME" section of each unité de formation). Those are inter-network
// reference documents written in competency terms, so most name concepts
// rather than products — only 8 of 26 name a technology at all, and two of
// those were false positives read in context: "Média Access Control" and
// "Data Access Layer" are not Microsoft Access.
//
// Three units are deliberately not modelled, as at UMONS: the stage, the
// activités professionnelles de formation and the épreuve intégrée are the
// internship and the final project, already on the CV.
const EPHEC_FROM_THE_DOSSIERS = {
  'Web : principes de base': ['HTML', 'CSS', 'DNS'],
  'Initiation aux bases de données': ['SQL', 'RelationalModel'],
  'Projet de développement web': ['JavaScript', 'AJAX', 'JSON', 'XML'],
  "Principes d'analyse informatique": ['UML', 'EntityRelationship'],
  'Programmation orientée objet': ['OOP', 'Inheritance', 'Polymorphism'],
};

test('the EPHEC bachelor references its course units', () => {
  const bachelor = resume.education.find((e) => /EPHEC/.test(e.institution || ''));
  assert.ok(bachelor, 'the EPHEC entry is gone');
  const units = resume.projects.filter((p) => p.entity === 'EPHEC');
  assert.equal(units.length, 24, `found ${units.length} EPHEC units`);
  const unreferenced = units.filter((u) => !(bachelor.projects || []).includes(u.name));
  assert.deepEqual(unreferenced, [], 'EPHEC units the bachelor does not reference');
});

test('each sampled EPHEC unit carries what its dossier names', () => {
  for (const [name, expected] of Object.entries(EPHEC_FROM_THE_DOSSIERS)) {
    const unit = project(name);
    assert.ok(unit, `no course unit named ${name}`);
    const missing = expected.filter((k) => !(unit.keywords || []).includes(k));
    assert.deepEqual(missing, [], `${name} omits: ${missing.join(', ')}`);
  }
});

// The 24 EPHEC units first landed on the RESTOMAX job, because it and the EPHEC
// degree both referenced WebMenu and the job came first in the file. A course
// unit belongs to a degree; no job may claim one.
//
// Keyed on type, not on entity: MyWay carries entity "Freelance" and is a web
// application, not a course — this test caught that on its first run.
test('no job references a course unit', () => {
  const units = new Set(resume.projects.filter((p) => p.type === 'Course unit').map((p) => p.name));
  for (const w of resume.work) {
    const wrong = (w.projects || []).filter((n) => units.has(n));
    assert.deepEqual(wrong, [], `${w.position} references course units: ${wrong.join(', ')}`);
  }
});
