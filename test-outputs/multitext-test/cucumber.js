module.exports = {
  default: {
    features: './features/*.feature',
    require: ['./steps/*.js'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    parallel: 1
  }
};