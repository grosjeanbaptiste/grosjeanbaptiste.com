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

// Try every fit plan in turn; stop at the first that produces a 2-page PDF
// (recto + verso references). If none fit the 2-page target, fall back to
// plan 0 (most generous) so each page is filled — better balance than
// settling on plan 5 with sparse main column.
function compileWithFit(resume, lang, outPath) {
  for (let i = 0; i < FIT_PLANS.length; i += 1) {
    const limits = FIT_PLANS[i];
    const tex = generateLatex(resume, lang, limits);
    const { ok, pages } = compileOnce(tex, outPath, lang);
    if (!ok) return { ok: false };
    console.log(`  ${lang} plan ${i} → ${pages} pages`);
    if (pages === 2) return { ok: true, plan: i, pages };
    if (pages === 1 && !resume.references?.length) return { ok: true, plan: i, pages };
  }
  // No plan fits 2 pages: re-render with plan 0 (most content per page) so
  // the spread stays balanced rather than ending with a near-empty page.
  const tex = generateLatex(resume, lang, FIT_PLANS[0]);
  const { ok, pages } = compileOnce(tex, outPath, lang);
  if (!ok) return { ok: false };
  console.log(`  ${lang} plan 0 (fallback) → ${pages} pages`);
  return { ok: true, plan: 0, pages };
}

module.exports = { compileWithFit };
