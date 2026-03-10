// Assessment Engine - Business Logic Layer
// Handles state management, decision trees, and content generation

import { contentDatabase, questionsConfig } from 'assessment_data';

export class AssessmentEngine {
  constructor() {
    this.state = this.loadState() || this.getInitialState();
    this.listeners = [];
    this.sessionId = this.getOrCreateSessionId();
  }

  // State Management
  getInitialState() {
    return {
      currentStep: 1,
      totalSteps: questionsConfig.steps.length,
      answers: {
        riskProfile: null,
        treatmentLine: null,
        specialConsiderations: []
      },
      isComplete: false,
      completedAt: null,
      timeSpentSeconds: 0
    };
  }

  // Observer pattern for state changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(callback => callback(this.state));
  }

  // State mutations
  setStep(step) {
    if (step < 1 || step > this.state.totalSteps) {
      throw new Error(`Invalid step: ${step}`);
    }
    this.state.currentStep = step;
    this.saveState();
    this.notify();
  }

  nextStep() {
    if (this.state.currentStep < this.state.totalSteps) {
      this.state.currentStep++;
      this.saveState();
      this.notify();
      return true;
    }
    return false;
  }

  previousStep() {
    if (this.state.currentStep > 1) {
      this.state.currentStep--;
      this.saveState();
      this.notify();
      return true;
    }
    return false;
  }

  setAnswer(field, value) {
    this.state.answers[field] = value;
    this.saveState();
    this.notify();
  }

  toggleMultipleAnswer(field, value) {
    const current = this.state.answers[field] || [];
    
    // Handle "none" exclusivity
    if (value === 'none') {
      if (current.includes('none')) {
        this.state.answers[field] = [];
      } else {
        this.state.answers[field] = ['none'];
      }
    } else {
      // Remove "none" if selecting something else
      const filtered = current.filter(v => v !== 'none');
      
      if (filtered.includes(value)) {
        this.state.answers[field] = filtered.filter(v => v !== value);
      } else {
        this.state.answers[field] = [...filtered, value];
      }
    }
    
    this.saveState();
    this.notify();
  }

  // Validation
  canProceed() {
    const step = this.state.currentStep;
    const { answers } = this.state;
    
    switch (step) {
      case 1:
        return !!answers.riskProfile;
      case 2:
        return !!answers.treatmentLine;
      case 3:
        return answers.specialConsiderations.length > 0;
      default:
        return false;
    }
  }

  canGoBack() {
    return this.state.currentStep > 1;
  }

  isComplete() {
    return this.state.currentStep === this.state.totalSteps && this.canProceed();
  }

  // Persistence
  saveState() {
    try {
      localStorage.setItem('cognitheraAssessment', JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem('cognitheraAssessment');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
    return null;
  }

  clearState() {
    try {
      localStorage.removeItem('cognitheraAssessment');
    } catch (e) {
      console.warn('Failed to clear state:', e);
    }
    this.state = this.getInitialState();
    this.notify();
  }

  // Session management
  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('cognitheraSession');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('cognitheraSession', sessionId);
    }
    return sessionId;
  }

  // Content Generation
  generateResults() {
    const { answers } = this.state;
    
    return {
      profile: this.generateProfile(answers),
      primaryRecommendation: this.getPrimaryRecommendation(answers),
      alternatives: this.getAlternatives(answers),
      specialConsiderations: this.getSpecialConsiderations(answers),
      resources: this.getResources(answers)
    };
  }

  generateProfile(answers) {
    const riskLabels = {
      'favorable': 'Risco Favorável',
      'intermediate': 'Risco Intermédio', 
      'poor': 'Risco Desfavorável'
    };
    
    const lineLabels = {
      'firstline': '1ª Linha',
      'secondline': '2ª Linha/Superior',
      'maintenance': 'Manutenção'
    };
    
    return `${riskLabels[answers.riskProfile]} • ${lineLabels[answers.treatmentLine]}`;
  }

  getPrimaryRecommendation(answers) {
    let key = `${answers.riskProfile}-${answers.treatmentLine}`;
    
    // Simplify for second line and maintenance
    if (answers.treatmentLine === 'secondline' || answers.treatmentLine === 'maintenance') {
      key = 'secondline';
    }
    
    const rec = contentDatabase.primaryRecommendations[key];
    
    if (!rec) {
      console.warn(`No recommendation found for key: ${key}`);
      return contentDatabase.primaryRecommendations['intermediate-firstline'];
    }
    
    return rec;
  }

  getAlternatives(answers) {
    return contentDatabase.alternativeOptions[answers.riskProfile] || [];
  }

  getSpecialConsiderations(answers) {
    if (answers.specialConsiderations.length === 0 || 
        answers.specialConsiderations.includes('none')) {
      return [{
        warning: false,
        title: 'Sem Considerações Especiais',
        content: 'O doente não apresenta comorbilidades que requeiram ajustes específicos ao protocolo standard. Proceder conforme recomendação principal.'
      }];
    }
    
    return answers.specialConsiderations
      .filter(spec => contentDatabase.specialConsiderations[spec])
      .map(spec => contentDatabase.specialConsiderations[spec]);
  }

  getResources(answers) {
    let resources = [];
    
    // Add resources based on treatment line
    if (contentDatabase.resources[answers.treatmentLine]) {
      resources.push(...contentDatabase.resources[answers.treatmentLine]);
    }
    
    // Add resources for special considerations
    answers.specialConsiderations.forEach(spec => {
      if (contentDatabase.resources[spec]) {
        resources.push(...contentDatabase.resources[spec]);
      }
    });
    
    // Remove duplicates based on title
    return resources.filter((v, i, a) => 
      a.findIndex(t => t.title === v.title) === i
    ).slice(0, 6);
  }

  // Analytics
  logEvent(eventType, metadata = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      eventType,
      currentStep: this.state.currentStep,
      answers: this.state.answers,
      metadata,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Log to console in development
    console.log('[Assessment Analytics]', event);
    
    // In production, send to analytics endpoint
    // this.sendToAnalytics(event);
    
    return event;
  }

  async sendToAnalytics(event) {
    try {
      const response = await fetch('/api/analytics/assessment-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      
      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }
    } catch (e) {
      console.error('Failed to send analytics:', e);
    }
  }

  // Export results
  exportResults() {
    const results = {
      exportDate: new Date().toISOString(),
      sessionId: this.sessionId,
      profile: this.generateProfile(this.state.answers),
      answers: this.state.answers,
      recommendations: this.generateResults(),
      timeSpentSeconds: this.state.timeSpentSeconds,
      version: '1.0.0'
    };
    
    return results;
  }

  // Getters
  get currentStep() { return this.state.currentStep; }
  get totalSteps() { return this.state.totalSteps; }
  get answers() { return this.state.answers; }
  get isLastStep() { return this.state.currentStep === this.state.totalSteps; }
  
  get progress() {
    return ((this.state.currentStep - 1) / (this.state.totalSteps - 1)) * 100;
  }
}