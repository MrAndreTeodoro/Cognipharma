import { Controller } from "@hotwired/stimulus"
import { AssessmentEngine } from "assessment_engine"
import { questionsConfig } from "assessment_data"

// Assessment Stimulus Controller
// Handles DOM interactions and UI updates for the assessment wizard

export default class extends Controller {
  static targets = [
    "step", "stepIndicator", "progressLine", 
    "questionStep", "optionCard",
    "prevButton", "nextButton", 
    "resultsContainer", "questionContainer", "progressContainer",
    "profileBadge", "primaryRecommendation", "alternativesGrid",
    "specialConsiderations", "resourcesGrid"
  ]

  static values = {
    totalSteps: Number
  }

  connect() {
    console.log("Assessment controller connected")
    
    // Initialize the business logic engine
    this.engine = new AssessmentEngine()
    
    // Subscribe to state changes
    this.unsubscribe = this.engine.subscribe(() => this.render())
    
    // Initial render
    this.render()
    
    // Log start event
    this.engine.logEvent('assessment_start')
    
    // Setup keyboard navigation
    this.setupKeyboardNavigation()
  }

  disconnect() {
    // Cleanup subscription
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }

  // Action handlers
  selectOption(event) {
    const card = event.currentTarget
    const step = parseInt(card.dataset.step)
    const value = card.dataset.value
    const type = card.dataset.type
    
    if (type === 'multiple') {
      this.handleMultipleSelect(card, step, value)
    } else {
      this.handleSingleSelect(card, step, value)
    }
  }

  handleSingleSelect(card, step, value) {
    // Clear all selections in this step
    this.getStepCards(step).forEach(c => c.classList.remove('selected'))
    
    // Select clicked card
    card.classList.add('selected')
    
    // Update engine state
    const stepConfig = questionsConfig.steps[step - 1]
    this.engine.setAnswer(stepConfig.field, value)
    
    // Log event
    this.engine.logEvent('option_selected', { 
      step, 
      field: stepConfig.field, 
      value 
    })
  }

  handleMultipleSelect(card, step, value) {
    const stepConfig = questionsConfig.steps[step - 1]
    
    // Handle "none" option exclusivity
    if (value === 'none') {
      if (card.classList.contains('selected')) {
        card.classList.remove('selected')
      } else {
        // Clear all other selections
        this.getStepCards(step).forEach(c => c.classList.remove('selected'))
        card.classList.add('selected')
      }
    } else {
      // Remove "none" if exists
      const noneCard = this.getStepCards(step).find(c => c.dataset.value === 'none')
      if (noneCard) noneCard.classList.remove('selected')
      
      // Toggle current
      card.classList.toggle('selected')
    }
    
    // Update engine state
    this.engine.toggleMultipleAnswer(stepConfig.field, value)
    
    // Log event
    this.engine.logEvent('option_toggled', { 
      step, 
      field: stepConfig.field, 
      value,
      selected: card.classList.contains('selected')
    })
  }

  nextStep() {
    if (!this.engine.canProceed()) {
      this.showValidationError()
      return
    }

    const wasLastStep = this.engine.isLastStep
    
    if (this.engine.nextStep()) {
      this.engine.logEvent('step_complete', { 
        step: this.engine.currentStep - 1,
        answers: this.engine.answers
      })
    } else if (wasLastStep) {
      // Show results
      this.showResults()
    }
  }

  previousStep() {
    this.engine.previousStep()
    this.engine.logEvent('step_back', { step: this.engine.currentStep })
  }

  showResults() {
    this.engine.logEvent('results_view')
    
    // Hide wizard
    this.questionContainerTarget.style.display = 'none'
    this.progressContainerTarget.style.display = 'none'
    
    // Show results
    this.resultsContainerTarget.classList.add('active')
    
    // Generate and render content
    const results = this.engine.generateResults()
    this.renderResults(results)
  }

  renderResults(results) {
    // Profile badge
    this.profileBadgeTarget.textContent = results.profile
    
    // Primary recommendation
    this.renderPrimaryRecommendation(results.primaryRecommendation)
    
    // Alternatives
    this.renderAlternatives(results.alternatives)
    
    // Special considerations
    this.renderSpecialConsiderations(results.specialConsiderations)
    
    // Resources
    this.renderResources(results.resources)
  }

  renderPrimaryRecommendation(rec) {
    const html = `
      <h4 style="color: var(--primary); margin-bottom: 0.75rem;">${rec.title}</h4>
      <p>${rec.content}</p>
      <ul style="margin-left: 1.5rem; margin-top: 0.75rem;">
        <li><strong>Dosagem:</strong> ${rec.dosing}</li>
        <li><strong>Monitorização:</strong> ${rec.monitoring}</li>
      </ul>
    `
    this.primaryRecommendationTarget.innerHTML = html
  }

  renderAlternatives(alternatives) {
    const html = alternatives.map(alt => `
      <div class="content-card">
        <span class="tag ${alt.tag === 'TKI' ? 'secondary' : alt.tag === 'Investigação' ? 'warning' : ''}">${alt.tag}</span>
        <h4 style="margin-top: 0.75rem;">${alt.title}</h4>
        <p>${alt.desc}</p>
      </div>
    `).join('')
    
    this.alternativesGridTarget.innerHTML = html || '<p>Sem alternativas adicionais para este perfil.</p>'
  }

  renderSpecialConsiderations(considerations) {
    const html = considerations.map(spec => `
      <div class="recommendation-box ${spec.warning ? 'warning' : 'info'}" style="margin-bottom: 1rem;">
        <h4 style="color: ${spec.warning ? 'var(--warning)' : 'var(--secondary)'}; margin-bottom: 0.75rem;">
          ${spec.warning ? '⚠️ ' : 'ℹ️ '}${spec.title}
        </h4>
        <p>${spec.content}</p>
      </div>
    `).join('')
    
    this.specialConsiderationsTarget.innerHTML = html
  }

  renderResources(resources) {
    const html = resources.map(res => `
      <div class="content-card">
        <span class="tag">${res.type}</span>
        <h4 style="margin-top: 0.75rem;">${res.title}</h4>
        <p>${res.desc}</p>
      </div>
    `).join('')
    
    this.resourcesGridTarget.innerHTML = html || '<p>Recursos adicionais disponíveis na biblioteca principal.</p>'
  }

  restart() {
    this.engine.logEvent('assessment_restart')
    this.engine.clearState()
    
    // Clear UI selections
    this.optionCardTargets.forEach(card => card.classList.remove('selected'))
    
    // Show wizard, hide results
    this.questionContainerTarget.style.display = 'block'
    this.progressContainerTarget.style.display = 'block'
    this.resultsContainerTarget.classList.remove('active')
    
    // Reset scroll
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  exportResults() {
    const results = this.engine.exportResults()
    const dataStr = JSON.stringify(results, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileName = `avaliacao-cognithera-${new Date().toISOString().split('T')[0]}.json`
    
    const link = document.createElement('a')
    link.setAttribute('href', dataUri)
    link.setAttribute('download', exportFileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    this.engine.logEvent('results_export', { filename: exportFileName })
    alert('Recomendações exportadas com sucesso!')
  }

  contactSupport() {
    this.engine.logEvent('contact_support_click')
    alert('Redirecionando para formulário de contacto Medical Information...\n\nDados da avaliação serão pré-preenchidos automaticamente.')
  }

  // Rendering
  render() {
    this.renderProgress()
    this.renderSteps()
    this.renderNavigation()
    this.syncUIWithState()
  }

  renderProgress() {
    const progress = this.engine.progress
    this.progressLineTarget.style.width = `${progress}%`
    
    // Update step indicators
    this.stepIndicatorTargets.forEach((indicator, index) => {
      const stepNum = index + 1
      indicator.classList.remove('active', 'completed')
      
      if (stepNum === this.engine.currentStep) {
        indicator.classList.add('active')
      } else if (stepNum < this.engine.currentStep) {
        indicator.classList.add('completed')
      }
    })
  }

  renderSteps() {
    this.questionStepTargets.forEach((step, index) => {
      const stepNum = index + 1
      step.classList.remove('active')
      
      if (stepNum === this.engine.currentStep) {
        step.classList.add('active')
      }
    })
  }

  renderNavigation() {
    // Previous button
    this.prevButtonTarget.disabled = !this.engine.canGoBack()
    
    // Next button
    const canProceed = this.engine.canProceed()
    this.nextButtonTarget.disabled = !canProceed
    
    // Update button text
    if (this.engine.isLastStep) {
      this.nextButtonTarget.innerHTML = 'Ver Recomendações <span>&#10004;</span>'
    } else {
      this.nextButtonTarget.innerHTML = 'Próximo <span>&#8594;</span>'
    }
  }

  syncUIWithState() {
    // Restore selections from state
    const { answers } = this.engine
    
    // Step 1
    if (answers.riskProfile) {
      this.selectCardInStep(1, answers.riskProfile)
    }
    
    // Step 2
    if (answers.treatmentLine) {
      this.selectCardInStep(2, answers.treatmentLine)
    }
    
    // Step 3
    if (answers.specialConsiderations.length > 0) {
      answers.specialConsiderations.forEach(value => {
        this.selectCardInStep(3, value)
      })
    }
  }

  // Helper methods
  getStepCards(step) {
    return this.optionCardTargets.filter(card => 
      parseInt(card.dataset.step) === step
    )
  }

  selectCardInStep(step, value) {
    const card = this.optionCardTargets.find(c => 
      parseInt(c.dataset.step) === step && c.dataset.value === value
    )
    if (card) {
      card.classList.add('selected')
    }
  }

  showValidationError() {
    // Shake animation on next button
    this.nextButtonTarget.style.animation = 'shake 0.5s'
    setTimeout(() => {
      this.nextButtonTarget.style.animation = ''
    }, 500)
    
    // Show toast or highlight required fields
    const currentStepEl = this.questionStepTargets[this.engine.currentStep - 1]
    currentStepEl.style.animation = 'pulse 0.5s'
    setTimeout(() => {
      currentStepEl.style.animation = ''
    }, 500)
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Only if results not showing
      if (this.resultsContainerTarget.classList.contains('active')) return
      
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (!this.nextButtonTarget.disabled) {
          this.nextStep()
        }
      } else if (e.key === 'ArrowLeft') {
        if (!this.prevButtonTarget.disabled) {
          this.previousStep()
        }
      }
    })
  }
}