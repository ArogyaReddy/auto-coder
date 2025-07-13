const { expect } = require('@playwright/test');

class JiraStory1Page {
  constructor(page) {
    this.page = page;
    this.baseUrl = process.env.BASE_URL || this.getDefaultUrl('jira');
    this.timeout = 30000;
    
    // Page selectors - dynamically generated based on domain
    this.selectors = {
      "mainContent": "#jira",
      "createButton": "#create_link",
      "issueDialog": ".jira-dialog",
      "watcherField": "#watchers",
      "submitButton": "#create-issue-submit"
};
    
    // Domain-specific configuration
    this.config = {
      "healthPath": "/status",
      "apiPath": "/rest/api/2",
      "timeout": 30000
};
  }

  getDefaultUrl(domain) {
    const urls = {
      jira: 'http://localhost:2990/jira',
      web: 'http://localhost:3000',
      api: 'http://localhost:8080/api',
      general: 'http://localhost:3000'
    };
    return urls[domain] || urls.general;
  }

  async navigate() {
    await this.page.goto(this.baseUrl);
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector(this.selectors.mainContent, { timeout: this.timeout });
  }


  // Jira-specific methods
  async enableFeatureFlag(flagName) {
    await this.page.goto(`${this.baseUrl}/secure/admin/ViewApplicationProperties.jspa`);
    await this.fillInput('#flagName', flagName);
    await this.clickElement('#enable-flag');
  }

  async configureWatcherField() {
    await this.page.goto(`${this.baseUrl}/secure/admin/ViewIssueFields.jspa`);
    await this.clickElement('[data-field="watcher"]');
    await this.clickElement('#configure-field');
  }

  async createIssue(issueData) {
    await this.clickElement(this.selectors.createButton);
    await this.waitForElement(this.selectors.issueDialog);
    
    if (issueData.watchers) {
      await this.fillInput(this.selectors.watcherField, issueData.watchers);
    }
    
    await this.clickElement(this.selectors.submitButton);
  }

  // System health and monitoring methods
  async checkSystemHealth() {
    const healthEndpoint = `${this.baseUrl}${this.config.healthPath}`;
    const response = await this.page.evaluate(async (url) => {
      try {
        const res = await fetch(url);
        return { status: res.status, ok: res.ok };
      } catch (error) {
        return { status: 0, ok: false, error: error.message };
      }
    }, healthEndpoint);
    
    return response;
  }

  async verifySystemHealth() {
    const health = await this.checkSystemHealth();
    return health.ok && health.status === 200;
  }

  async getCriticalErrors() {
    // Check browser console for critical errors
    const logs = await this.page.evaluate(() => {
      return window.console.errors || [];
    });
    
    return logs.filter(log => 
      log.level === 'error' && 
      (log.message.includes('critical') || log.message.includes('fatal'))
    );
  }

  async verifySystemStability() {
    // Check if page is still responsive
    try {
      await this.page.waitForSelector(this.selectors.mainContent, { timeout: 5000 });
      await this.page.evaluate(() => document.readyState);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAuditLogs() {
    // Retrieve audit logs (implementation depends on system)
    return await this.page.evaluate(() => {
      return window.auditLogs || [];
    });
  }

  // Helper methods
  async waitForElement(selector, timeout = this.timeout) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async clickElement(selector) {
    await this.waitForElement(selector);
    await this.page.click(selector);
  }

  async fillInput(selector, value) {
    await this.waitForElement(selector);
    await this.page.fill(selector, value);
  }

  async getText(selector) {
    await this.waitForElement(selector);
    return await this.page.textContent(selector);
  }

  async verifyText(selector, expectedText) {
    const actualText = await this.getText(selector);
    expect(actualText).toContain(expectedText);
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `reports/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }
}

module.exports = JiraStory1Page;

// Generated for domain: jira
// Based on step definitions analysis
// Selectors and methods are dynamically generated
