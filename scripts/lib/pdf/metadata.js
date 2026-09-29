// Document properties — the Title / Author / Subject / Keywords a reader shows
// in its tab and its info panel, independent of the file name.
//
// altacv loads pdfx for PDF/A-1b, and pdfx takes these from a `\jobname.xmpdata`
// file next to the source, not from `\hypersetup{pdftitle=…}`: setting them by
// hand would fill the docinfo dictionary while leaving the XMP packet empty,
// which is the mismatch PDF/A exists to forbid.

// pdfx reads the .xmpdata file as LaTeX. Most specials travel through it
// verbatim — `&` and `#` in particular must stay raw, since `\&` and `\#` come
// out with the backslash still attached and "C#" would ship as "C\#". These
// four are the ones that derail the parse instead (an unescaped `%` comments
// out the closing brace and the compile dies, several hundred log lines in,
// on "File ended while scanning use of \xmp@doparse"). Each replacement below
// was verified against pdflatex + xelatex, not assumed.
const XMP_ESCAPES = { '%': '\\%', '^': '\\^{}', '{': '\\{', '}': '\\}' };

// A lone backslash has no working escape here: `\textbackslash{}` comes out as
// the literal "\{}". Rather than silently dropping it, refuse — a backslash in
// a name, a job title or a skill tag means the data is wrong, and a clear error
// beats a mangled property or an unreadable LaTeX log.
function xmpEscape(value) {
  const text = String(value ?? '');
  if (text.includes('\\')) {
    throw new Error(`PDF metadata cannot carry a backslash: ${JSON.stringify(text)}`);
  }
  return text.replace(/[%^{}]/g, (c) => XMP_ESCAPES[c]);
}

// RFC 3066 tags for dc:language. Belgium is the audience for the two national
// languages, hence the region subtags; zh is written in simplified script.
const XMP_LANGUAGE = {
  en: 'en',
  fr: 'fr-BE',
  nl: 'nl-BE',
  es: 'es',
  de: 'de',
  zh: 'zh-Hans',
};

// Keywords are what an applicant-tracking system indexes the file by, so they
// carry the technical skills: tool names a recruiter searches for, identical in
// every language. The soft skills are translated prose and index to nothing.
function keywords(resume) {
  const hard = (resume.skills || []).find((s) => s.name === 'HardSkills');
  return (hard?.keywords || []).map(xmpEscape).join('\\sep ');
}

function buildXmpData(resume, t, lang) {
  const b = resume.basics || {};
  const kw = keywords(resume);
  return [
    `\\Title{${xmpEscape(b.name)} — ${xmpEscape(t.curriculumVitae)}}`,
    `\\Author{${xmpEscape(b.name)}}`,
    `\\Subject{${xmpEscape(b.label)}}`,
    ...(kw ? [`\\Keywords{${kw}}`] : []),
    `\\Language{${XMP_LANGUAGE[lang]}}`,
    '',
  ].join('\n');
}

module.exports = { buildXmpData, xmpEscape, XMP_LANGUAGE };
