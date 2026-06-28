const { NEEDS_CJK } = require('./config');

const CJK_FONT_FALLBACKS = [
  '\\usepackage{xeCJK}',
  // Try the macOS font first, then common Linux/CI CJK fonts.
  '\\IfFontExistsTF{Songti SC}{\\setCJKmainfont{Songti SC}}{%',
  '  \\IfFontExistsTF{Noto Serif CJK SC}{\\setCJKmainfont{Noto Serif CJK SC}}{%',
  '    \\IfFontExistsTF{Noto Sans CJK SC}{\\setCJKmainfont{Noto Sans CJK SC}}{%',
  '      \\IfFontExistsTF{WenQuanYi Zen Hei}{\\setCJKmainfont{WenQuanYi Zen Hei}}{}%',
  '    }%',
  '  }%',
  '}',
];

const COLOURS = [
  '\\definecolor{PrimaryColor}{HTML}{001F5A}',
  '\\definecolor{SecondaryColor}{HTML}{FF0000}',
  '\\definecolor{ThirdColor}{HTML}{F3890B}',
  '\\definecolor{BodyColor}{HTML}{666666}',
  '\\definecolor{EmphasisColor}{HTML}{2E2E2E}',
  '\\definecolor{BackgroundColor}{HTML}{E2E2E2}',
  '\\colorlet{name}{PrimaryColor}',
  '\\colorlet{tagline}{SecondaryColor}',
  '\\colorlet{heading}{PrimaryColor}',
  '\\colorlet{headingrule}{ThirdColor}',
  '\\colorlet{subheading}{SecondaryColor}',
  '\\colorlet{accent}{SecondaryColor}',
  '\\colorlet{emphasis}{EmphasisColor}',
  '\\colorlet{body}{BodyColor}',
  '\\pagecolor{BackgroundColor}',
];

const SIDEBAR_HEADING_MACRO = [
  // Compact section heading for the narrow left column. Smaller font +
  // hard \raggedright + high hyphenation penalty so no word breaks AND no
  // line bleeds into the right column.
  '\\newcommand{\\cvsectionsidebar}[1]{%',
  '  \\bigskip\\bigskip%',
  '  {\\color{heading}\\Large\\rmfamily\\bfseries\\raggedright\\hyphenpenalty=10000\\exhyphenpenalty=10000\\MakeUppercase{#1}}\\\\[-1ex]%',
  '  {\\color{headingrule}\\rule{\\linewidth}{1.5pt}\\par}%',
  '  \\medskip%',
  '}',
];

function buildPreamble(lang) {
  return [
    '\\PassOptionsToPackage{dvipsnames}{xcolor}',
    '\\documentclass[8pt,a4paper,ragged2e,withhyper]{altacv}',
    '\\usepackage[T1]{fontenc}',
    '\\usepackage[utf8]{inputenc}',
    '\\usepackage[english,french,dutch,spanish,german]{babel}',
    '\\usepackage{paracol}',
    '\\usepackage{fontawesome5}',
    '\\usepackage{needspace}',
    '\\geometry{left=0.9cm,right=0.9cm,top=0.8cm,bottom=0.8cm,columnsep=0.6cm}',
    '\\ifxetexorluatex',
    // xelatex path (used for zh): try Roboto Slab + Lato if installed.
    '  \\IfFontExistsTF{Roboto Slab}{\\setmainfont{Roboto Slab}}{}',
    '  \\IfFontExistsTF{Lato}{\\setsansfont{Lato}}{}',
    '  \\renewcommand{\\familydefault}{\\sfdefault}',
    '\\else',
    '  \\usepackage[rm]{roboto}',
    '  \\usepackage[defaultsans]{lato}',
    '  \\renewcommand{\\familydefault}{\\sfdefault}',
    '\\fi',
    ...(NEEDS_CJK(lang) ? CJK_FONT_FALLBACKS : []),
    ...COLOURS,
    '\\renewcommand{\\namefont}{\\Huge\\rmfamily\\bfseries}',
    '\\renewcommand{\\personalinfofont}{\\small\\bfseries}',
    // Prevent section-title hyphenation in the narrow left column. \raggedright
    // also drops the last-resort hyphenation that justification triggers.
    '\\renewcommand{\\cvsectionfont}{\\LARGE\\rmfamily\\bfseries\\hyphenpenalty=10000\\exhyphenpenalty=10000\\raggedright}',
    '\\renewcommand{\\cvsubsectionfont}{\\large\\bfseries}',
    '\\renewcommand{\\itemmarker}{{\\small\\textbullet}}',
    '\\renewcommand{\\ratingmarker}{\\faCircle}',
    ...SIDEBAR_HEADING_MACRO,
  ].join('\n');
}

module.exports = { buildPreamble };
