const { tex, truncate, formatDate } = require('../tex');
const { topN } = require('../data');
const { appendItemTrailer } = require('./_trailer');

function renderWorkEntry(w, lang, resume, t, limits, { continuation } = {}) {
  const start = formatDate(w.startDate, lang);
  const end = formatDate(w.endDate, lang);
  // Consulting missions (e.g. Xtrada → VhAuctions / aXinco): the client
  // rides on the position label so "several missions via a consulting firm"
  // reads visually different from "several roles at the same employer".
  const positionLabel = w.client
    ? `${tex(w.position)} \\textbullet\\ ${tex(w.client)}`
    : tex(w.position);
  const parts = ['\\par\\needspace{5\\baselineskip}'];
  if (continuation) {
    parts.push(
      `\\noindent\\parbox[t]{0.62\\linewidth}{\\raggedright\\large\\color{emphasis}${positionLabel}}\\hfill\\parbox[t]{0.35\\linewidth}{\\raggedleft\\small\\color{accent}\\faCalendar\\color{emphasis}~${tex(start)} -- ${tex(end)}}\\par\\medskip`,
    );
  } else {
    parts.push(
      `\\noindent\\parbox[t]{0.62\\linewidth}{\\raggedright\\large\\color{emphasis}${positionLabel}}\\hfill\\parbox[t]{0.35\\linewidth}{\\raggedleft\\large\\color{accent}${tex(w.company)}}\\par`,
      `\\smallskip\\noindent{\\small\\color{accent}\\faCalendar\\color{emphasis}~${tex(start)} -- ${tex(end)}}\\hfill${
        w.location
          ? `{\\small\\color{accent}\\faMapMarker\\color{emphasis}~${tex(w.location)}}`
          : ''
      }\\par\\medskip`,
    );
  }
  if (w.summary) {
    parts.push(`\\begin{itemize}\\item ${tex(truncate(w.summary, limits.summary))}\\end{itemize}`);
  }
  appendItemTrailer(parts, w, resume, t, limits);
  return parts;
}

function buildWork(resume, t, lang, limits) {
  const selected = topN(resume.work, limits.work);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${tex(t.experience)}}`];
  selected.forEach((w, i, arr) => {
    const previous = i > 0 ? arr[i - 1] : null;
    const continuation = Boolean(previous && previous.company === w.company);
    parts.push(...renderWorkEntry(w, lang, resume, t, limits, { continuation }));
    if (i < arr.length - 1) {
      parts.push(arr[i + 1].company === w.company ? '\\smallskip' : '\\divider');
    }
  });
  return parts.join('\n');
}

module.exports = { buildWork };
