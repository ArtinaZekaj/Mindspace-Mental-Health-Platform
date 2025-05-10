// config-overrides.js
module.exports = function override(config, env) {
  config.module.rules = config.module.rules.map(rule => {
    if (
      rule.use &&
      rule.use.some(u => typeof u.loader === 'string' && u.loader.includes('source-map-loader'))
    ) {
      rule.exclude = /react-datepicker/;
    }
    return rule;
  });

  return config;
};
