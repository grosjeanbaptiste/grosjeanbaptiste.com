// The classic page's skill filter, under its timeline: every skill the shown
// entries use, with the number of entries using it — the interactive view's
// filter (react/src/ui/home/SkillFilter.tsx), built at generation time. Each
// skill names the entries that use it and the sentence said once it is chosen,
// so js/skill-filter.js only has to dim the other bars. Hidden until that
// script runs: without it a chip would do nothing.
const { escapeHtml } = require('../format');
const { skillUsage } = require('../cv-index');

// Shown at first; the rest wait behind "All skills".
const SHORTLIST = 18;

function chipHtml({ skill, uses }, entries, t) {
  const users = entries.filter((e) => e.skills.includes(skill)).map((e) => e.id);
  const data = `data-skill="${escapeHtml(skill)}" data-entries="${escapeHtml(users.join(' '))}" data-status="${escapeHtml(t.matching(uses, skill))}"`;
  return `<button type="button" class="tl-chip" aria-pressed="false" ${data}>${escapeHtml(skill)} <span class="tl-chip-count">${uses}</span></button>`;
}

function moreHtml(count, t) {
  const more = escapeHtml(`${t.allSkills} (${count})`);
  return `      <li><button type="button" class="tl-chip-more" aria-expanded="false" data-more="${more}" data-fewer="${escapeHtml(t.fewerSkills)}">${more}</button></li>`;
}

// Lines to set inside the timeline's section; none when no entry names a skill.
function renderSkillFilter(entries, t) {
  const usage = skillUsage(entries);
  if (usage.length === 0) return [];
  const chips = usage.map((used, i) => {
    const extra = i < SHORTLIST ? '' : ' class="tl-chip-extra"';
    return `      <li${extra}>${chipHtml(used, entries, t)}</li>`;
  });
  return [
    '  <div class="tl-skills" hidden>',
    `    <h3 id="tl-skills-title">${escapeHtml(t.filterBySkill)}</h3>`,
    '    <ul class="tl-chips" aria-labelledby="tl-skills-title">',
    ...chips,
    ...(usage.length > SHORTLIST ? [moreHtml(usage.length, t)] : []),
    '    </ul>',
    `    <p class="tl-skill-status" hidden><output></output> <button type="button" class="tl-skill-clear">${escapeHtml(t.clearFilter)}</button></p>`,
    '  </div>',
  ];
}

module.exports = { renderSkillFilter };
