# Proposta Técnica: Sistema de Recomendações Personalizadas

## Parte 3 – Implementação de Funcionalidade Interativa

---

## 📋 Resumo Executivo

Esta documentação apresenta a proposta técnica para implementação de uma funcionalidade interativa na página do CogniThera. O sistema permite que profissionais de saúde respondam a perguntas estruturadas sobre o perfil do doente e, com base nas respostas, recebam recomendações terapêuticas personalizadas.

---

## 🎯 Objectivos da Funcionalidade

1. **Personalização**: Adaptar conteúdo ao perfil específico do doente
2. **Educação**: Orientar decisões terapêuticas com base em evidências
3. **Eficiência**: Reduzir tempo de procura de informação relevante
4. **Compliance**: Garantir que considerações especiais são abordadas

---

## 🏗️ Arquitetura da Solução

### 1. Fluxo da Aplicação

```
┌─────────────────┐
│  Página Entry   │─── Link para Assessment
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│              Assessment Wizard               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ Passo 1 │─▶│ Passo 2 │─▶│ Passo 3 │   │
│  │ Perfil  │  │ Tratam. │  │ Espec.  │   │
│  │  Risco  │  │  Linha  │  │  Cons.  │   │
│  └────┬────┘  └────┬────┘  └────┬────┘   │
│       └────────────┴────────────┘         │
│                   │                        │
└───────────────────┼────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Motor de Regras (JavaScript)        │
│                                             │
│  • Decision Tree Mapping                    │
│  • Content Database (JSON)                 │
│  • Logic Engine                            │
│  • State Management                        │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           Results View                       │
│                                              │
│  • Recomendação Principal                   │
│  • Alternativas Terapêuticas               │
│  • Considerações Especiais                 │
│  • Recursos Educativos                      │
└─────────────────────────────────────────────┘
```

---

## 💻 Implementação Frontend

### 1. Estrutura de Dados (State Management)

```javascript
const assessmentState = {
    currentStep: 1,              // Step atual do wizard
    totalSteps: 3,               // Total de passos
    answers: {
        riskProfile: null,       // 'favorable' | 'intermediate' | 'poor'
        treatmentLine: null,     // 'firstline' | 'secondline' | 'maintenance'
        specialConsiderations: [] // Array de considerações especiais
    }
};
```

**Justificação técnica:**
- Separação clara entre estado da UI (currentStep) e dados do negócio (answers)
- Estrutura permite extensão fácil para novas perguntas
- Compatible com localStorage para persistência

### 2. Decision Tree (Content Database)

```javascript
const contentDatabase = {
    primaryRecommendations: {
        'favorable-firstline': { /* ... */ },
        'intermediate-firstline': { /* ... */ },
        'poor-firstline': { /* ... */ },
        'secondline': { /* ... */ }
    },
    alternativeOptions: { /* ... */ },
    specialConsiderations: { /* ... */ },
    resources: { /* ... */ }
};
```

**Regras de Mapeamento:**
```
IF riskProfile = 'favorable' AND treatmentLine = 'firstline'
   THEN primaryRecommendation = 'favorable-firstline'
   
IF specialConsiderations CONTAINS 'autoimmune'
   THEN show warning + specific monitoring protocol
   
IF treatmentLine = 'secondline' 
   THEN include resistance-to-IO resources
```

### 3. Componentes UI

#### Progress Bar
```css
.progress-bar {
    display: flex;
    justify-content: space-between;
    position: relative;
}

.progress-line {
    position: absolute;
    background: var(--primary);
    transition: width 0.4s ease;
}

.step {
    &.active { /* estilos ativos */ }
    &.completed { /* estilos completados */ }
}
```

#### Option Cards
```javascript
// Seleção única (passos 1 e 2)
function selectOption(step, value) {
    // Limpa seleções anteriores
    // Adiciona classe 'selected' ao card clicado
    // Atualiza estado
    // Habilita botão próximo
}

// Seleção múltipla (passo 3)
function toggleMultiSelect(element, value) {
    // Lógica de toggle
    // Tratamento especial para opção 'none' (exclusiva)
    // Atualiza array no estado
}
```

### 4. Animações e UX

```css
/* Fade in para transições suaves */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.question-step.active {
    animation: fadeIn 0.4s ease;
}

/* Hover effects nos cards */
.option-card {
    transition: all 0.3s ease;
}

.option-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
}
```

---

## 🔧 Lógica JavaScript Detalhada

### 1. Fluxo do Wizard

```javascript
function nextStep() {
    if (assessmentState.currentStep < assessmentState.totalSteps) {
        assessmentState.currentStep++;
        updateUI();
        
        // Persistência
        localStorage.setItem('cognitheraAssessment', 
            JSON.stringify(assessmentState));
    } else {
        showResults();
    }
}

function updateUI() {
    // Atualiza progress bar
    // Atualiza indicadores de passo
    // Mostra/esconde questions
    // Atualiza botões de navegação
    // Valida se pode avançar
}
```

### 2. Renderização Condicional

```javascript
function showResults() {
    const { answers } = assessmentState;
    
    // 1. Gera chave para lookup
    let recKey = `${answers.riskProfile}-${answers.treatmentLine}`;
    
    // 2. Busca recomendação principal
    const primaryRec = contentDatabase.primaryRecommendations[recKey];
    
    // 3. Renderiza com base no perfil
    renderPrimaryRecommendation(primaryRec);
    renderAlternatives(answers.riskProfile);
    renderSpecialConsiderations(answers.specialConsiderations);
    renderResources(answers);
}
```

### 3. Persistência de Estado

```javascript
// Salvar no localStorage (sessão do browser)
localStorage.setItem('cognitheraAssessment', JSON.stringify(assessmentState));

// Restaurar no carregamento
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('cognitheraAssessment');
    if (saved) {
        assessmentState = JSON.parse(saved);
        restoreUIState();
    }
});
```

---

## 🔌 Integração Backend/CMS

### Opção A: Client-Side Only (Implementada)

**Quando usar:**
- Conteúdo relativamente estável
- Baixa frequência de atualizações
- Performance crítica

**Arquitetura:**
```
Client Browser
     │
     ├── JavaScript Bundle (contentDatabase.js)
     ├── State Management (localStorage)
     └── Analytics (fetch API para logging)
```

**Vantagens:**
- ✅ Rápida (sem round-trip ao servidor)
- ✅ Funciona offline
- ✅ Simples de implementar
- ✅ Sem dependência de backend

**Desvantagens:**
- ❌ Conteúdo hardcoded
- ❌ Requer deploy para atualizações
- ❌ Sem personalização por utilizador

---

### Opção B: Headless CMS Integration

**Quando usar:**
- Conteúdo atualizado frequentemente
- Equipa de marketing gere conteúdo
- Multi-idioma necessário

**Arquitetura:**
```
Client Browser           CMS (Contentful/Drupal/Strapi)
     │                           │
     ├── GET /api/content ─────▶│
     │◀── JSON content ─────────│
     │                           │
     └── Local processing
```

**Implementação:**
```javascript
// Carrega conteúdo dinâmico do CMS
async function loadContentFromCMS() {
    const response = await fetch('/api/cms/assessment-content');
    const contentDatabase = await response.json();
    
    // Mesma lógica, dados externos
    initializeAssessment(contentDatabase);
}
```

**Vantagens:**
- ✅ Conteúdo gerido via CMS
- ✅ Atualizações instantâneas
- ✅ Suporte multi-idioma
- ✅ Versioning de conteúdo

**Desvantagens:**
- ❌ Latência adicional
- ❌ Dependency do CMS
- ❌ Mais complexidade

---

### Opção C: Server-Side Rendering (Rails)

**Quando usar:**
- SEO importante para a página
- Lógica complexa de autorização
- Dados sensíveis nos resultados

**Arquitetura:**
```
Browser
   │
   └── GET /assessment
         │
         Rails Controller
              │
              ├── Business Logic
              ├── Database Queries
              └── User Authentication
                   │
                   ERB Template
                        │
                        HTML + Embedded JS
```

**Implementação Rails:**
```ruby
# config/routes.rb
get 'avaliacao', to: 'assessments#show'
post 'avaliacao/resultados', to: 'assessments#results'

# app/controllers/assessments_controller.rb
class AssessmentsController < ApplicationController
  def show
    # Carrega conteúdo da BD/CMS
    @content = AssessmentContent.for_locale(current_locale)
  end
  
  def results
    # Processa respostas
    @recommendations = RecommendationEngine.calculate(
      risk_profile: params[:risk_profile],
      treatment_line: params[:treatment_line],
      special_considerations: params[:special_considerations]
    )
    
    render json: @recommendations
  end
end
```

**Vantagens:**
- ✅ Conteúdo dinâmico por utilizador
- ✅ Analytics server-side
- ✅ Autenticação/Autorização
- ✅ SEO optimizado

**Desvantagens:**
- ❌ Requer server round-trip
- ❌ Maior complexidade
- ❌ Necessita de caching

---

### Opção D: Hybrid Approach (Recomendada para Produção)

**Arquitetura Híbrida:**
```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   UI Layer   │  │  Logic Layer │  │ Cache Layer  │ │
│  │  (HTML/CSS)  │  │  (JavaScript)│  │(localStorage)│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│           │               │               │           │
└───────────┼───────────────┼───────────────┼───────────┘
            │               │               │
            └───────────────┼───────────────┘
                            │
                   ┌────────┴────────┐
                   │                 │
          ┌────────▼────────┐ ┌──────▼──────┐
          │  API Gateway    │ │   CMS API   │
          │  /assessment    │ │  (content)  │
          │  /analytics     │ │             │
          └────────┬────────┘ └──────┬──────┘
                   │                 │
          ┌────────▼─────────────────▼────────┐
          │           Backend Layer           │
          │  ┌────────────┐  ┌────────────┐  │
          │  │  Rails API │  │   Database │  │
          │  │  (business)│  │  (PostgreSQL)│ │
          │  └────────────┘  └────────────┘  │
          └────────────────────────────────────┘
```

**Fluxo de Dados:**

1. **Initial Load**: 
   - Cliente faz GET /api/assessment-config
   - Recebe JSON com configuração e conteúdo
   - Guarda em localStorage (cache 1 hora)

2. **User Interaction**:
   - Toda a lógica roda client-side
   - Navegação instantânea entre passos
   - Estado persistido em localStorage

3. **Results Generation**:
   - Cálculo local baseado em regras
   - Display imediato de resultados
   - POST /api/analytics para logging (async)

4. **Content Updates**:
   - CMS publica nova versão
   - API atualizada automaticamente
   - Cliente invalida cache em próximo load

---

## 🎯 Alternativas Técnicas Comparadas

| Abordagem | Complexidade | Performance | Flexibilidade | Manutenção | Custo |
|-----------|---------------|-------------|---------------|------------|--------|
| **Client-Side Only** | ⭐⭐ Baixa | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐ Limitada | ⭐⭐ Baixa | ⭐⭐⭐⭐⭐ Mínimo |
| **Headless CMS** | ⭐⭐⭐ Média | ⭐⭐⭐⭐ Boa | ⭐⭐⭐⭐ Alta | ⭐⭐⭐ Média | ⭐⭐⭐ Custo CMS |
| **Server-Side Rails** | ⭐⭐⭐⭐ Alta | ⭐⭐⭐ Média | ⭐⭐⭐⭐⭐ Máxima | ⭐⭐⭐⭐ Alta | ⭐⭐⭐⭐ Alto |
| **Hybrid** | ⭐⭐⭐⭐ Alta | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐⭐⭐ Máxima | ⭐⭐⭐ Média | ⭐⭐⭐⭐ Alto |

---

## 📊 Analytics e Tracking

### Dados Coletados

```javascript
const interactionData = {
    timestamp: '2026-03-07T15:30:00Z',
    sessionId: 'sess_abc123',
    userProfile: {
        hcp_id: null, // anonimizado
        specialty: null,
        country: 'PT'
    },
    assessment: {
        risk_profile: 'intermediate',
        treatment_line: 'firstline',
        special_considerations: ['autoimmune'],
        completion_time_seconds: 145,
        steps_accessed: [1, 2, 3]
    },
    results_viewed: {
        primary_recommendation: true,
        alternatives: true,
        resources_downloaded: ['guia-rapido-1a-linha.pdf']
    },
    device: {
        type: 'desktop',
        browser: 'Chrome',
        os: 'macOS'
    }
};
```

### API Endpoints

```ruby
# POST /api/analytics/assessment-events
class AnalyticsController < ApplicationController
  def log_assessment_event
    event = AssessmentEvent.create!(
      session_id: params[:session_id],
      event_type: params[:event_type], # 'start', 'step_complete', 'results_view', 'export'
      metadata: params[:metadata],
      created_at: Time.current
    )
    
    # Process async para dashboards
    AnalyticsWorker.perform_async(event.id)
    
    head :ok
  end
end
```

---

## 🔒 Considerações de Segurança

1. **Validação de Inputs**:
   ```javascript
   function sanitizeInput(input) {
       // Sanitização básica
       return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
   }
   ```

2. **Rate Limiting** (se backend):
   ```ruby
   # config/initializers/rack_attack.rb
   Rack::Attack.throttle('assessment/ip', limit: 10, period: 60) do |req|
     req.ip if req.path == '/api/assessment'
   end
   ```

3. **No PHI Storage**: Não armazenar dados do doente, apenas padrões de utilização

---

## 🚀 Roadmap de Implementação

### Fase 1: MVP (Semanas 1-2) ✅ IMPLEMENTADO
- [x] Wizard client-side com 3 passos
- [x] Decision tree básica (9 combinações)
- [x] Content database em JavaScript
- [x] localStorage para persistência
- [x] Export JSON dos resultados

### Fase 2: Enhancements (Semanas 3-4)
- [ ] Integração com CMS para conteúdo
- [ ] Analytics dashboard
- [ ] A/B testing framework
- [ ] Mobile app integration

### Fase 3: Advanced (Semanas 5-8)
- [ ] ML para personalização avançada
- [ ] Integração com EMR/EHR
- [ ] Chatbot conversacional (LLM)
- [ ] Multi-idioma completo

---

## 📚 Referências Técnicas

- **State Management Pattern**: Redux-inspired local state
- **Decision Tree Algorithm**: Rule-based engine with JSON mapping
- **UI Pattern**: Progressive Disclosure Wizard
- **Performance**: First Contentful Paint < 1.5s
- **Accessibility**: WCAG 2.1 AA compliance

---

## ✅ Checklist de Implementação

- [x] Estrutura de estado definida
- [x] Decision tree implementada
- [x] UI/UX wizard criada
- [x] Animações e transições
- [x] Persistência localStorage
- [x] Export de resultados
- [x] Responsividade mobile
- [x] Documentação técnica
- [ ] Testes unitários JavaScript
- [ ] Integração CMS (opcional)
- [ ] Analytics backend
- [ ] CI/CD pipeline

---

## 🎓 Lições Aprendidas

1. **Separação de concerns**: Manter UI, state e lógica de negócio separados facilita manutenção
2. **Content mapping**: Usar keys consistentes (`perfil-linha`) simplifica lookups
3. **Progressive enhancement**: Funcionalidade base deve trabalhar sem JavaScript (acessibilidade)
4. **Performance**: Lazy loading de conteúdo pesado (vídeos, PDFs) no passo 4

---

## 📞 Contacto Técnico

Para questões técnicas ou propostas de melhoria:
- **Arquiteto**: Cognipharma DevTeam
- **Repositório**: `/assessment` endpoint
- **Documentação**: Este ficheiro + README.md

---

**Nota**: Esta implementação representa a Abordagem A (Client-Side Only), que foi escolhida para o MVP devido à sua simplicidade e velocidade de implementação. Para produção a escala, recomenda-se migrar para a Abordagem Híbrida (Opção D).