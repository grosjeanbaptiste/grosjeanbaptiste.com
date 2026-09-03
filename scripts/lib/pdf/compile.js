const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { CLS_PATH, PROFILE_IMG, NEEDS_CJK, FIT_PLANS } = require('./config');
const { generateLatex } = require('./document');

function countPages(pdfPath, logFile) {
  try {
    const info = execFileSync('pdfinfo', [pdfPath], { stdio: 'pipe' }).toString();
    const m = /^Pages:\s*(\d+)/m.exec(info);
    if (m) return Number.parseInt(m[1], 10);
  } catch {
    // pdfinfo not available — fall through to log parsing.
  }
  if (fs.existsSync(logFile)) {
    const log = fs.readFileSync(logFile, 'latin1');
    const m = /Output written on .+?\.pdf \((\d+) pages?/i.exec(log);
    if (m) return Number.parseInt(m[1], 10);
  }
  const pdfBytes = fs.readFileSync(pdfPath, 'latin1');
  const matches = pdfBytes.match(/\/Type\s*\/Page\b/g);
  return matches ? matches.length : null;
}

function runLatex(engine, texFile, workDir) {
  for (let pass = 0; pass < 2; pass += 1) {
    try {
      execFileSync(
        engine,
        ['-interaction=nonstopmode', '-halt-on-error', '-output-directory', workDir, texFile],
        { cwd: workDir, stdio: 'pipe', timeout: 90_000 },
      );
    } catch (err) {
      const stdout = err.stdout ? err.stdout.toString().slice(-3000) : '';
      const stderr = err.stderr ? err.stderr.toString().slice(-1500) : '';
      console.error(`${engine} failed (pass ${pass + 1}):`);
      console.error(stdout);
      if (stderr) console.error(stderr);
      return false;
    }
  }
  return true;
}

function compileOnce(texContent, outPath, lang) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), `cv-${lang}-`));
  try {
    fs.copyFileSync(CLS_PATH, path.join(work, 'altacv.cls'));
    fs.copyFileSync(PROFILE_IMG, path.join(work, 'profil.jpeg'));
    const texFile = path.join(work, `cv_${lang}.tex`);
    fs.writeFileSync(texFile, texContent);
    // CJK requires xelatex + system fonts; other langs use pdflatex with
    // TeX Live's bundled roboto/lato (no system fonts needed).
    const engine = NEEDS_CJK(lang) ? 'xelatex' : 'pdflatex';
    if (!runLatex(engine, texFile, work)) return { ok: false };
    const produced = texFile.replace(/\.tex$/, '.pdf');
    if (!fs.existsSync(produced)) return { ok: false };
    const pages = countPages(produced, texFile.replace(/\.tex$/, '.log'));
    fs.copyFileSync(produced, outPath);
    return { ok: true, pages };
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

// Try every fit plan in turn; stop at the first that produces a compliant PDF
// (2 pages = recto + verso references, or 1 page when there are no references).
// The single-sheet rule (recto + verso, ≤ 2 pages) is a HARD constraint: if no
// plan fits, fail loudly rather than shipping an oversized CV.
function compileWithFit(resume, lang, outPath) {
  let last = 0;
  for (let i = 0; i < FIT_PLANS.length; i += 1) {
    const limits = FIT_PLANS[i];
    const tex = generateLatex(resume, lang, limits);
    const { ok, pages } = compileOnce(tex, outPath, lang);
    if (!ok) return { ok: false };
    last = pages;
    console.log(`  ${lang} plan ${i} → ${pages} pages`);
    if (pages === 2) return { ok: true, plan: i, pages };
    if (pages === 1 && !resume.references?.length) return { ok: true, plan: i, pages };
  }
  console.error(
    `  ${lang}: no fit plan produced a ≤2-page PDF (tightest plan → ${last} pages); the single-sheet rule was not met — refusing to ship an oversized CV.`,
  );
  return { ok: false };
}

module.exports = { compileWithFit };
