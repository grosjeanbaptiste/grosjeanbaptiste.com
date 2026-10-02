// UI strings the React view adds on top of those the static generator already
// translates (scripts/lib/i18n, exported with the data). Data table — one row
// per language, same keys everywhere — so exempt from the 100-LoC file rule.
import type { Lang } from '../application/lang';

export interface Strings {
  readonly search: string;
  readonly searchPlaceholder: string;
  readonly noResults: string;
  readonly skills: string;
  readonly entries: string;
  readonly actions: string;
  readonly filterBySkill: string;
  readonly allSkills: string;
  readonly fewerSkills: string;
  readonly clearFilter: string;
  readonly matching: (count: number, skill: string) => string;
  readonly timeline: string;
  readonly related: string;
  readonly back: string;
  readonly ongoing: string;
  readonly switchTo: string;
  readonly loading: string;
  readonly loadFailed: string;
  readonly notFound: string;
  readonly showCourses: (count: number) => string;
  readonly lastYears: (count: number) => string;
  readonly wholeCareer: string;
}

export const STRINGS: Readonly<Record<Lang, Strings>> = {
  en: {
    search: 'Search',
    searchPlaceholder: 'Search experience, projects, skills…',
    noResults: 'Nothing matches.',
    skills: 'Skills',
    entries: 'CV',
    actions: 'Actions',
    filterBySkill: 'Filter by skill',
    allSkills: 'All skills',
    fewerSkills: 'Fewer skills',
    clearFilter: 'Clear filter',
    matching: (n, s) => `${n} ${n === 1 ? 'entry uses' : 'entries use'} ${s}`,
    timeline: 'Timeline',
    related: 'Related',
    back: 'Back to the CV',
    ongoing: 'present',
    switchTo: 'Read in',
    loading: 'Loading the CV…',
    loadFailed: 'The CV could not be loaded.',
    notFound: 'This page does not exist.',
    showCourses: (n) => `Show the ${n} course units`,
    lastYears: (n) => `${n} years`,
    wholeCareer: 'All',
  },
  fr: {
    search: 'Rechercher',
    searchPlaceholder: 'Rechercher une expérience, un projet, une compétence…',
    noResults: 'Aucun résultat.',
    skills: 'Compétences',
    entries: 'CV',
    actions: 'Actions',
    filterBySkill: 'Filtrer par compétence',
    allSkills: 'Toutes les compétences',
    fewerSkills: 'Moins de compétences',
    clearFilter: 'Retirer le filtre',
    matching: (n, s) => `${n} ${n === 1 ? 'élément utilise' : 'éléments utilisent'} ${s}`,
    timeline: 'Chronologie',
    related: 'Lié',
    back: 'Retour au CV',
    ongoing: 'aujourd’hui',
    switchTo: 'Lire en',
    loading: 'Chargement du CV…',
    loadFailed: 'Le CV n’a pas pu être chargé.',
    notFound: 'Cette page n’existe pas.',
    showCourses: (n) => `Afficher les ${n} unités d’enseignement`,
    lastYears: (n) => `${n} ans`,
    wholeCareer: 'Tout',
  },
  nl: {
    search: 'Zoeken',
    searchPlaceholder: 'Zoek ervaring, projecten, vaardigheden…',
    noResults: 'Geen resultaten.',
    skills: 'Vaardigheden',
    entries: 'CV',
    actions: 'Acties',
    filterBySkill: 'Filteren op vaardigheid',
    allSkills: 'Alle vaardigheden',
    fewerSkills: 'Minder vaardigheden',
    clearFilter: 'Filter wissen',
    matching: (n, s) => `${n} ${n === 1 ? 'item gebruikt' : 'items gebruiken'} ${s}`,
    timeline: 'Tijdlijn',
    related: 'Gerelateerd',
    back: 'Terug naar het CV',
    ongoing: 'heden',
    switchTo: 'Lezen in',
    loading: 'CV wordt geladen…',
    loadFailed: 'Het CV kon niet worden geladen.',
    notFound: 'Deze pagina bestaat niet.',
    showCourses: (n) => `Toon de ${n} opleidingsonderdelen`,
    lastYears: (n) => `${n} jaar`,
    wholeCareer: 'Alles',
  },
  es: {
    search: 'Buscar',
    searchPlaceholder: 'Buscar experiencia, proyectos, competencias…',
    noResults: 'Sin resultados.',
    skills: 'Competencias',
    entries: 'CV',
    actions: 'Acciones',
    filterBySkill: 'Filtrar por competencia',
    allSkills: 'Todas las competencias',
    fewerSkills: 'Menos competencias',
    clearFilter: 'Quitar filtro',
    matching: (n, s) => `${n} ${n === 1 ? 'elemento usa' : 'elementos usan'} ${s}`,
    timeline: 'Cronología',
    related: 'Relacionado',
    back: 'Volver al CV',
    ongoing: 'actualidad',
    switchTo: 'Leer en',
    loading: 'Cargando el CV…',
    loadFailed: 'No se pudo cargar el CV.',
    notFound: 'Esta página no existe.',
    showCourses: (n) => `Mostrar las ${n} asignaturas`,
    lastYears: (n) => `${n} años`,
    wholeCareer: 'Todo',
  },
  de: {
    search: 'Suchen',
    searchPlaceholder: 'Erfahrung, Projekte, Kompetenzen suchen…',
    noResults: 'Keine Treffer.',
    skills: 'Kompetenzen',
    entries: 'Lebenslauf',
    actions: 'Aktionen',
    filterBySkill: 'Nach Kompetenz filtern',
    allSkills: 'Alle Kompetenzen',
    fewerSkills: 'Weniger Kompetenzen',
    clearFilter: 'Filter entfernen',
    matching: (n, s) => `${n} ${n === 1 ? 'Eintrag nutzt' : 'Einträge nutzen'} ${s}`,
    timeline: 'Zeitleiste',
    related: 'Verknüpft',
    back: 'Zurück zum Lebenslauf',
    ongoing: 'heute',
    switchTo: 'Lesen auf',
    loading: 'Lebenslauf wird geladen…',
    loadFailed: 'Der Lebenslauf konnte nicht geladen werden.',
    notFound: 'Diese Seite existiert nicht.',
    showCourses: (n) => `Die ${n} Lehreinheiten anzeigen`,
    lastYears: (n) => `${n} Jahre`,
    wholeCareer: 'Alles',
  },
  zh: {
    search: '搜索',
    searchPlaceholder: '搜索经历、项目、技能…',
    noResults: '没有结果。',
    skills: '技能',
    entries: '简历',
    actions: '操作',
    filterBySkill: '按技能筛选',
    allSkills: '全部技能',
    fewerSkills: '收起技能',
    clearFilter: '清除筛选',
    matching: (n, s) => `${n} 项使用 ${s}`,
    timeline: '时间线',
    related: '相关',
    back: '返回简历',
    ongoing: '至今',
    switchTo: '阅读语言',
    loading: '正在加载简历…',
    loadFailed: '简历加载失败。',
    notFound: '页面不存在。',
    showCourses: (n) => `显示 ${n} 门课程`,
    lastYears: (n) => `近 ${n} 年`,
    wholeCareer: '全部',
  },
};
