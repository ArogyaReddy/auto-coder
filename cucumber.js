module.exports = {
  default: {
    features: './generated/features/*.feature',
    require: ['./generated/steps/*.js'],
    format: [
      'progress',
      'html:./reports/cucumber-report.html',
      'json:./reports/cucumber-results.json'
    ],
    parallel: 1,
    retry: 1,
    timeout: 30000
  }
};
