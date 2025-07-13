const { logger } = require('../utils/logger');

class RequirementAnalyzer {
  constructor() {
    this.patterns = {
      userStory: /(?:as\s+(?:a|an|\w+),?\s*)(.+?),?\s*(?:i\s+want(?:\s+to)?\s+)(.+?)(?:,?\s*so\s+(?:that\s+)?(.+?))?[.\n]/gi,
      given: /given\s+(.+?)(?:\s*when|\s*$)/gi,
      when: /when\s+(.+?)(?:\s*then|\s*$)/gi,
      then: /then\s+(.+?)(?:\s*and|\s*$)/gi,
      feature: /(?:feature|functionality|capability|requirement)[:]\s*(.+?)[\n.]/gi,
      businessRule: /(?:rule|must|should|shall|will)[:]\s*(.+?)[\n.]/gi,
      acceptance: /(?:acceptance\s+criteria?|criteria?)[:]\s*(.+?)[\n]/gi
    };
  }

  async analyzeContent(content) {
    logger.info('🧠 Analyzing requirement content...');
    
    const analysis = {
      mainFeature: this.extractMainFeature(content),
      description: this.extractDescription(content),
      features: this.extractFeatures(content),
      userStories: this.extractUserStories(content),
      scenarios: this.generateScenarios(content),
      businessRules: this.extractBusinessRules(content),
      acceptanceCriteria: this.extractAcceptanceCriteria(content),
      keywords: this.extractKeywords(content),
      complexity: this.assessComplexity(content),
      domain: this.identifyDomain(content)
    };

    logger.success(`✅ Analysis complete: Found ${analysis.features.length} features, ${analysis.userStories.length} user stories`);
    return analysis;
  }

  extractMainFeature(content) {
    // Try to find explicit feature mentions
    const featureMatches = [...content.matchAll(this.patterns.feature)];
    if (featureMatches.length > 0) {
      return featureMatches[0][1].trim();
    }

    // Extract from first sentence or paragraph
    const firstSentence = content.split(/[.\n]/)[0];
    if (firstSentence.length > 10 && firstSentence.length < 100) {
      return firstSentence.trim();
    }

    // Extract key action verbs and nouns
    const words = content.toLowerCase().split(/\s+/);
    const actionWords = words.filter(word => 
      ['enable', 'disable', 'create', 'update', 'delete', 'manage', 'configure', 'setup', 'implement'].includes(word)
    );
    
    const importantWords = words.filter(word => 
      word.length > 4 && !['should', 'would', 'could', 'might', 'that', 'this', 'with', 'from', 'they'].includes(word)
    );

    if (actionWords.length > 0 && importantWords.length > 0) {
      return `${actionWords[0]} ${importantWords.slice(0, 3).join(' ')}`.replace(/[^\w\s]/g, '');
    }

    return 'Feature Implementation';
  }

  extractDescription(content) {
    // Take first 2-3 sentences as description
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 2).join('. ').trim() + '.';
  }

  extractFeatures(content) {
    const features = new Set();
    
    // Explicit feature mentions
    const featureMatches = [...content.matchAll(this.patterns.feature)];
    featureMatches.forEach(match => features.add(match[1].trim()));

    // Extract from action verbs + objects
    const actionPatterns = [
      /(?:enable|disable|turn\s+on|turn\s+off)\s+(.+?)(?:\s+by|\s+in|\s+for|[.\n])/gi,
      /(?:create|add|implement|build)\s+(.+?)(?:\s+to|\s+in|\s+for|[.\n])/gi,
      /(?:configure|setup|manage)\s+(.+?)(?:\s+to|\s+in|\s+for|[.\n])/gi,
      /(?:support|allow|permit)\s+(.+?)(?:\s+to|\s+in|\s+for|[.\n])/gi
    ];

    actionPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        const feature = match[1].trim().replace(/\s+/g, ' ');
        if (feature.length > 5 && feature.length < 50) {
          features.add(feature);
        }
      });
    });

    // Domain-specific feature extraction
    if (this.identifyDomain(content) === 'jira') {
      const jiraFeatures = this.extractJiraFeatures(content);
      jiraFeatures.forEach(f => features.add(f));
    }

    return Array.from(features).slice(0, 8);
  }

  extractJiraFeatures(content) {
    const jiraKeywords = [
      'watcher field', 'feature flag', 'create screens', 'admin control', 
      'screen fields', 'dark feature', 'user directory', 'secret storage',
      'issue creation', 'project configuration'
    ];

    return jiraKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  extractUserStories(content) {
    const userStories = [];
    
    // Look for explicit user story patterns
    const storyMatches = [...content.matchAll(this.patterns.userStory)];
    storyMatches.forEach((match, index) => {
      const actor = match[1]?.trim() || 'user';
      const goal = match[2]?.trim() || 'achieve functionality';
      const benefit = match[3]?.trim() || goal; // Use goal as benefit if "so that" not found
      
      // Extract explicit acceptance criteria if they exist
      const explicitCriteria = this.extractAcceptanceCriteriaFromContent(content);
      const criteria = explicitCriteria.length > 0 ? explicitCriteria : this.generateMeaningfulAcceptanceCriteria(goal, benefit);
      
      userStories.push({
        title: `User Story ${index + 1}`,
        actor: actor,
        goal: goal,
        benefit: benefit,
        criteria: criteria
      });
    });

    // If no user stories found with regex, try line-by-line parsing
    if (userStories.length === 0) {
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      
      lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase().trim();
        if (lowerLine.startsWith('as ') && lowerLine.includes('want')) {
          const parts = this.parseUserStoryLine(line);
          if (parts) {
            // Extract explicit acceptance criteria if they exist
            const explicitCriteria = this.extractAcceptanceCriteriaFromContent(content);
            const criteria = explicitCriteria.length > 0 ? explicitCriteria : this.generateMeaningfulAcceptanceCriteria(parts.goal, parts.benefit);
            
            userStories.push({
              title: `User Story ${index + 1}`,
              actor: parts.actor,
              goal: parts.goal,
              benefit: parts.benefit,
              criteria: criteria
            });
          }
        }
      });
    }

    return userStories.slice(0, 5);
  }

  extractAcceptanceCriteriaFromContent(content) {
    const criteria = [];
    const lines = content.split('\n');
    let inAcceptanceCriteria = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      
      // Check if we're entering acceptance criteria section
      if (line.includes('acceptance criteria') || line.includes('acceptance criterion')) {
        inAcceptanceCriteria = true;
        continue;
      }
      
      // If we're in acceptance criteria section and hit another section, stop
      if (inAcceptanceCriteria && (line.startsWith('scenario') || line.startsWith('feature') || line.startsWith('user story'))) {
        break;
      }
      
      // Extract criteria items
      if (inAcceptanceCriteria && lines[i].trim().length > 0) {
        const criteriaLine = lines[i].trim();
        // Remove common prefixes like "- ", "* ", "Should ", etc.
        const cleanCriteria = criteriaLine
          .replace(/^[-*•]\s*/, '')
          .replace(/^should\s+/i, '')
          .replace(/^must\s+/i, '')
          .replace(/^\d+\.\s*/, '');
        
        if (cleanCriteria.length > 5 && !cleanCriteria.toLowerCase().includes('acceptance criteria')) {
          criteria.push(cleanCriteria.charAt(0).toUpperCase() + cleanCriteria.slice(1));
        }
      }
    }
    
    return criteria;
  }

  parseUserStoryLine(line) {
    // More flexible parsing for user stories
    const asMatch = line.match(/as\s+(.+?),?\s*i\s+want\s+(?:to\s+)?(.+?)(?:,?\s*so\s+(?:that\s+)?(.+?))?$/i);
    if (asMatch) {
      return {
        actor: asMatch[1]?.trim() || 'user',
        goal: asMatch[2]?.trim() || 'achieve functionality',
        benefit: asMatch[3]?.trim() || asMatch[2]?.trim() || 'achieve the goal'
      };
    }
    return null;
  }

  generateMeaningfulAcceptanceCriteria(goal, benefit) {
    // Generate relevant acceptance criteria based on the actual goal and benefit
    const criteria = [];
    
    if (goal) {
      if (goal.includes('invite') && goal.includes('friend')) {
        criteria.push('User can send invitations to friends');
        criteria.push('Friends receive invitation notifications');
        criteria.push('Service supports collaborative features');
      } else if (goal.includes('organize') && goal.includes('work')) {
        criteria.push('User can organize work items effectively');
        criteria.push('Work organization features are available');
        criteria.push('User feels in control of their work');
      } else if (goal.includes('understand') && goal.includes('progress')) {
        criteria.push('Progress information is accessible to managers');
        criteria.push('Progress data is accurate and up-to-date');
        criteria.push('Reporting features are available');
      } else {
        // Generic criteria based on goal
        criteria.push(`The system allows users to ${goal}`);
        if (benefit && benefit !== goal) {
          criteria.push(`Users can ${benefit}`);
        }
      }
    }
    
    return criteria.length > 0 ? criteria : ['The feature is implemented correctly'];
  }

  inferActor(content, domain) {
    const actors = {
      jira: 'Jira administrator',
      admin: 'system administrator',
      user: 'user',
      developer: 'developer'
    };

    if (content.toLowerCase().includes('admin')) return actors.admin;
    if (domain === 'jira') return actors.jira;
    if (content.toLowerCase().includes('developer')) return actors.developer;
    return actors.user;
  }

  inferBenefit(feature, domain) {
    const benefits = {
      jira: 'users can work more efficiently with Jira features',
      enable: 'functionality is available by default',
      configure: 'the system can be customized as needed',
      manage: 'resources can be controlled effectively',
      create: 'new items can be added to the system'
    };

    for (const [key, benefit] of Object.entries(benefits)) {
      if (feature.toLowerCase().includes(key) || domain === key) {
        return benefit;
      }
    }
    return 'the user experience is improved';
  }

  generateAcceptanceCriteria(content) {
    const criteria = [];
    
    // Extract existing Given/When/Then patterns
    const givenMatches = [...content.matchAll(this.patterns.given)];
    const whenMatches = [...content.matchAll(this.patterns.when)];
    const thenMatches = [...content.matchAll(this.patterns.then)];

    if (givenMatches.length > 0 || whenMatches.length > 0 || thenMatches.length > 0) {
      givenMatches.forEach(match => criteria.push(`Given ${match[1].trim()}`));
      whenMatches.forEach(match => criteria.push(`When ${match[1].trim()}`));
      thenMatches.forEach(match => criteria.push(`Then ${match[1].trim()}`));
    } else {
      // Generate criteria from content analysis
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      sentences.slice(0, 3).forEach((sentence, index) => {
        const clean = sentence.trim().toLowerCase();
        if (clean.includes('should') || clean.includes('must') || clean.includes('will')) {
          criteria.push(`The system ${clean.replace(/^.*?(should|must|will)/, '$1')}`);
        } else if (index === 0) {
          criteria.push(`The feature is implemented correctly`);
        } else if (index === 1) {
          criteria.push(`All functionality works as expected`);
        } else {
          criteria.push(`No errors or issues occur`);
        }
      });
    }

    return criteria.slice(0, 5);
  }

  generateScenarios(content) {
    const scenarios = [];
    const userStories = this.extractUserStories(content);
    
    userStories.forEach((story, index) => {
      // Generate meaningful scenarios from each user story
      const scenarioName = `${story.actor} ${story.goal}`.replace(/^(.)/, (match) => match.toUpperCase());
      
      scenarios.push({
        name: scenarioName,
        given: this.generateGivenFromStory(story),
        when: this.generateWhenFromStory(story),
        then: this.generateThenFromStory(story),
        type: 'positive'
      });
      
      // Add edge case scenario for important stories
      if (index < 2) {
        scenarios.push({
          name: `${scenarioName} - Error Handling`,
          given: this.generateGivenFromStory(story),
          when: this.generateWhenNegativeFromStory(story),
          then: this.generateThenNegativeFromStory(story),
          type: 'negative'
        });
      }
    });

    return scenarios.slice(0, 6);
  }

  generateGivenFromStory(story) {
    if (story.goal.includes('invite') && story.goal.includes('friend')) {
      return 'the user is logged in and has access to the invitation feature';
    } else if (story.goal.includes('organize') && story.goal.includes('work')) {
      return 'the user is logged in and has work items to organize';
    } else if (story.goal.includes('understand') && story.goal.includes('progress')) {
      return 'the manager is logged in and has team members with progress data';
    }
    return 'the application is running and the user is authenticated';
  }

  generateWhenFromStory(story) {
    if (story.goal.includes('invite') && story.goal.includes('friend')) {
      return 'the user sends invitations to friends';
    } else if (story.goal.includes('organize') && story.goal.includes('work')) {
      return 'the user organizes their work items';
    } else if (story.goal.includes('understand') && story.goal.includes('progress')) {
      return 'the manager views team progress information';
    }
    return `the user performs ${story.goal}`;
  }

  generateThenFromStory(story) {
    if (story.benefit && story.benefit !== story.goal) {
      return `${story.benefit}`;
    } else if (story.goal.includes('invite') && story.goal.includes('friend')) {
      return 'friends receive invitations and can join the service';
    } else if (story.goal.includes('organize') && story.goal.includes('work')) {
      return 'the user feels in control of their organized work';
    } else if (story.goal.includes('understand') && story.goal.includes('progress')) {
      return 'the manager can report on team success and failures';
    }
    return `the user successfully completes ${story.goal}`;
  }

  generateWhenNegativeFromStory(story) {
    if (story.goal.includes('invite')) {
      return 'the user attempts to invite friends but the service is unavailable';
    } else if (story.goal.includes('organize')) {
      return 'the user attempts to organize work but encounters system errors';
    } else if (story.goal.includes('understand')) {
      return 'the manager attempts to view progress but data is unavailable';
    }
    return `the user attempts ${story.goal} but encounters an error`;
  }

  generateThenNegativeFromStory(story) {
    return 'the system handles the error gracefully and provides helpful feedback';
  }

  generateGiven(feature, domain) {
    if (domain === 'jira') {
      return 'the Jira instance is running and the user has appropriate permissions';
    }
    return 'the application is running and the user is authenticated';
  }

  generateWhen(feature, domain) {
    const action = feature.split(' ')[0].toLowerCase();
    const object = feature.split(' ').slice(1).join(' ');
    
    const actionMap = {
      enable: `the user enables ${object}`,
      disable: `the user disables ${object}`,
      create: `the user creates ${object}`,
      configure: `the user configures ${object}`,
      manage: `the user manages ${object}`,
      setup: `the user sets up ${object}`
    };

    return actionMap[action] || `the user interacts with ${feature}`;
  }

  generateThen(feature, domain) {
    const action = feature.split(' ')[0].toLowerCase();
    
    const resultMap = {
      enable: 'the feature should be enabled and available for use',
      disable: 'the feature should be disabled and unavailable',
      create: 'the item should be created successfully',
      configure: 'the configuration should be saved and applied',
      manage: 'the management operation should complete successfully',
      setup: 'the setup should be completed and functional'
    };

    return resultMap[action] || 'the operation should complete successfully';
  }

  generateWhenNegative(feature, domain) {
    return `the user attempts to ${feature.split(' ')[0]} ${feature.split(' ').slice(1).join(' ')} with invalid parameters`;
  }

  generateThenNegative(feature, domain) {
    return 'an appropriate error message should be displayed and the system should remain stable';
  }

  extractBusinessRules(content) {
    const rules = [];
    const ruleMatches = [...content.matchAll(this.patterns.businessRule)];
    
    ruleMatches.forEach(match => {
      rules.push(match[1].trim());
    });

    // Extract implied rules from content
    const sentences = content.split(/[.!?]+/);
    sentences.forEach(sentence => {
      const clean = sentence.trim().toLowerCase();
      if (clean.includes('only') || clean.includes('minimum') || clean.includes('maximum') || 
          clean.includes('required') || clean.includes('mandatory')) {
        rules.push(sentence.trim());
      }
    });

    return rules.slice(0, 5);
  }

  extractAcceptanceCriteria(content) {
    const criteria = [];
    const criteriaMatches = [...content.matchAll(this.patterns.acceptance)];
    
    criteriaMatches.forEach(match => {
      criteria.push(match[1].trim());
    });

    return criteria;
  }

  extractKeywords(content) {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  assessComplexity(content) {
    const factors = {
      length: content.length,
      sentences: content.split(/[.!?]+/).length,
      technicalTerms: (content.match(/\b(?:API|REST|JSON|database|configuration|implementation|integration)\b/gi) || []).length,
      conditionals: (content.match(/\b(?:if|when|unless|provided|given|depending)\b/gi) || []).length
    };

    const score = (factors.length / 100) + factors.sentences + (factors.technicalTerms * 2) + factors.conditionals;
    
    if (score > 50) return 'high';
    if (score > 20) return 'medium';
    return 'low';
  }

  identifyDomain(content) {
    const domains = {
      jira: ['jira', 'atlassian', 'issue', 'project', 'watcher', 'screen', 'field'],
      web: ['website', 'browser', 'page', 'form', 'button', 'link'],
      api: ['api', 'endpoint', 'rest', 'json', 'request', 'response'],
      database: ['database', 'table', 'query', 'record', 'data'],
      security: ['security', 'authentication', 'authorization', 'permission', 'access']
    };

    const contentLower = content.toLowerCase();
    
    for (const [domain, keywords] of Object.entries(domains)) {
      const matches = keywords.filter(keyword => contentLower.includes(keyword)).length;
      if (matches >= 2) {
        return domain;
      }
    }

    return 'general';
  }
}

module.exports = RequirementAnalyzer;
