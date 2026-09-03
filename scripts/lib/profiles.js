const PROFILE_ICONS = {
  linkedin: 'linkedin',
  github: 'github',
  npm: 'npm',
  twitter: 'x-twitter',
  x: 'x-twitter',
  bluesky: 'cloud',
  mastodon: 'mastodon',
  stackoverflow: 'stack-overflow',
};

const profileIcon = (net) => PROFILE_ICONS[(net || '').toLowerCase()] || 'link';

module.exports = { profileIcon };
