const PROFILE_ICONS = {
  linkedin: 'fab fa-linkedin',
  github: 'fab fa-github',
  npm: 'fab fa-npm',
  twitter: 'fab fa-x-twitter',
  x: 'fab fa-x-twitter',
  bluesky: 'fas fa-cloud',
  mastodon: 'fab fa-mastodon',
  stackoverflow: 'fab fa-stack-overflow',
};

const profileIcon = (net) => PROFILE_ICONS[(net || '').toLowerCase()] || 'fas fa-link';

module.exports = { profileIcon };
