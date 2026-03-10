// Assessment Content Database
// This can be loaded from server in production via API
export const contentDatabase = {
  primaryRecommendations: {
    'favorable-firstline': {
      title: 'CogniThera como Monoterapia de 1ª Linha',
      content: 'Perfil ideal para CogniThera monoterapia. Estudo THERA-001 demonstrou SG mediana de 28.3 meses vs. 21.1 com sunitinibe em doentes de risco favorável.',
      dosing: '200mg IV q3semanas até progressão',
      monitoring: 'TSH, LFTs, saturação O2 q3ciclos'
    },
    'intermediate-firstline': {
      title: 'CogniThera com Consideração de Combinação',
      content: 'Doentes de risco intermédio beneficiam de CogniThera. Considerar combinação com TKI (axitinibe) se múltiplas metástases viscerais.',
      dosing: '200mg IV q3semanas (opção: + axitinibe 5mg BID)',
      monitoring: 'Tensão arterial semanal se em combinação'
    },
    'poor-firstline': {
      title: 'CogniThera em Contexto de Risco Elevado',
      content: 'Evidência limitada em risco desfavorável. Considerar ensaio clínico ou combinação TKI+IO preferencial. Discussão em tumour board recomendada.',
      dosing: '200mg IV q3semanas - considerar dose reduzida se fragilidade',
      monitoring: 'Monitorização intensiva 2x/semana inicial'
    },
    'secondline': {
      title: 'CogniThera em 2ª Linha ou Superior',
      content: 'Aprovado após progressão em TKI. Taxa resposta 35% em doentes previamente expostos a TKIs.',
      dosing: '200mg IV q3semanas',
      monitoring: 'TC de reavaliação a 9 semanas (ritmo acelerado)'
    }
  },

  alternativeOptions: {
    'favorable': [
      { title: 'Pembrolizumabe + Axitinibe', tag: 'Combinação', desc: 'Opção validada em KEYNOTE-426' },
      { title: 'Nivolumabe + Cabozantinibe', tag: 'Combinação', desc: 'CheckMate-9ER' },
      { title: 'Sunitinibe Monoterapia', tag: 'TKI', desc: 'Opção histórica, menos preferida' }
    ],
    'intermediate': [
      { title: 'CaboMety + NivoMab', tag: 'Combinação', desc: 'Benefício PFS significativo' },
      { title: 'Lenvatinibe + Pembrolizumabe', tag: 'Combinação', desc: 'CLEAR trial' },
      { title: 'Tivozanibe', tag: 'TKI', desc: 'Se contraindicação a IO' }
    ],
    'poor': [
      { title: 'Ensaio Clínico', tag: 'Investigação', desc: 'Prioridade máxima em risco desfavorável' },
      { title: 'Cabozantinibe', tag: 'TKI', desc: 'METEOR trial - opção após progressão' },
      { title: 'Suporte paliativo', tag: 'Cuidados de suporte', desc: 'Integração precoce recomendada' }
    ]
  },

  specialConsiderations: {
    'autoimmune': {
      warning: true,
      title: 'Doença Autoimune',
      content: 'Avaliar atividade da doença autoimune. CogniThera contraindicado se ativa. Se controlada há >3 meses, risco-benefício favorável. Considerar dermatologia/reumatologia consulta prévia.'
    },
    'cns': {
      warning: true,
      title: 'Metástases CNS',
      content: 'CogniThera atravessa BBB em ~30%. Se lesões ativas não tratadas, considerar radiocirurgia primeiro. Monitorização neurológica intensiva.'
    },
    'hepatic': {
      warning: true,
      title: 'Função Hepática Comprometida',
      content: 'Reduzir dose em 50% se Child-Pugh B. Evitar se Child-Pugh C. Monitorização LFTs semanal inicialmente.'
    },
    'cardiac': {
      warning: true,
      title: 'Doença Cardíaca',
      content: 'ECG basal e ecocardiograma recomendados. IO pode precipitar miocardite (raro mas grave). Sinais de alarme: dispneia, dor torácica, palpitações.'
    },
    'elderly': {
      warning: false,
      title: 'Idade Avançada',
      content: 'Sem necessidade ajuste idade pura. Avaliar fragilidade (escala FRAIL). Dose standard se ECOG 0-1 e bom estado funcional.'
    }
  },

  resources: {
    'firstline': [
      { title: 'Guia Rápido 1ª Linha CCR', type: 'PDF', desc: 'Algoritmo decisão terapêutica completo' },
      { title: 'Webinar: Selecção Terapêutica', type: 'Vídeo', desc: '45 min - discussão de casos reais' },
      { title: 'Comparativo Eficácia 1ª Linha', type: 'Infografia', desc: 'Head-to-head all IO+TKI' }
    ],
    'secondline': [
      { title: 'Gestão da Progressão', type: 'PDF', desc: 'Quando e como mudar de linha' },
      { title: 'Resistência a IO', type: 'Artigo', desc: 'Mecanismos e estratégias' },
      { title: 'Caso Clínico 2ª Linha', type: 'Video', desc: 'Discussão com oncologista referente' }
    ],
    'autoimmune': [
      { title: 'IO em Doença Autoimune', type: 'Review', desc: 'Safety data pooled analysis' },
      { title: 'Protocolo Gestão IrAE', type: 'PDF', desc: 'Tratamento corticoides por grau' },
      { title: 'Consulta de Apoio', type: 'Serviço', desc: 'Contactar reumatologia/dermatologia' }
    ],
    'cns': [
      { title: 'IO e Metástases Cerebrais', type: 'Guia', desc: 'Sequenciação tratamentos' },
      { title: 'Monitorização Neurológica', type: 'Checklist', desc: 'Sinais de alarme e timing exames' }
    ]
  }
};

// Questions configuration
export const questionsConfig = {
  steps: [
    {
      id: 1,
      title: 'Qual é o perfil de risco do doente?',
      subtitle: 'Selecione a categoria de risco segundo critérios IMDC (International Metastatic RCC Database Consortium)',
      type: 'single',
      field: 'riskProfile',
      options: [
        { 
          value: 'favorable', 
          icon: '💪', 
          title: 'Risco Favorável',
          description: 'ECOG 0, tempo desde diagnóstico >1 ano, HB >LLN, CA corrigido <ULN, neutrófilos <ULN, plaquetas <ULN (0 fatores de risco)'
        },
        { 
          value: 'intermediate', 
          icon: '⚠️', 
          title: 'Risco Intermédio',
          description: '1-2 fatores de risco IMDC. Doentes com prognóstico moderado que podem beneficiar de diferentes abordagens terapêuticas.'
        },
        { 
          value: 'poor', 
          icon: '❗', 
          title: 'Risco Desfavorável',
          description: '3-6 fatores de risco IMDC. Doentes com doença agressiva que necessitam de estratégias terapêuticas mais intensivas.'
        }
      ]
    },
    {
      id: 2,
      title: 'Em que fase do tratamento se encontra?',
      subtitle: 'Selecione a linha de tratamento atual para apresentar recomendações adequadas',
      type: 'single',
      field: 'treatmentLine',
      options: [
        { 
          value: 'firstline', 
          icon: '🏆', 
          title: 'Primeira Linha',
          description: 'Doente a iniciar tratamento sistémico pela primeira vez ou nunca tratado previamente para CCR metastático.'
        },
        { 
          value: 'secondline', 
          icon: '🔄', 
          title: 'Segunda Linha ou Superior',
          description: 'Doente com progressão após tratamento prévio (TKI, IO monoterapia, ou combinação).'
        },
        { 
          value: 'maintenance', 
          icon: '🔧', 
          title: 'Manutenção / Ajuste',
          description: 'Doente em tratamento atual mas com necessidade de ajuste devido a eficácia subótima ou intolerância.'
        }
      ]
    },
    {
      id: 3,
      title: 'Existem considerações especiais relevantes?',
      subtitle: 'Selecione todas as opções aplicáveis ao caso clínico (múltipla seleção possível)',
      type: 'multiple',
      field: 'specialConsiderations',
      options: [
        { value: 'autoimmune', icon: '🤒', title: 'Doença Autoimune', description: 'História de doença autoimune (ex: tireoidite, psoriasis, lúpus) controlada ou ativa.' },
        { value: 'cns', icon: '🧠', title: 'Metástases CNS', description: 'Doente com metástases cerebrais ativas ou tratadas previamente (irradiação/cirurgia).' },
        { value: 'hepatic', icon: '🎨', title: 'Função Hepática Comprometida', description: 'Child-Pugh B ou C, ou elevção de transaminases/bilirrubina não explicável por outras causas.' },
        { value: 'cardiac', icon: '💙', title: 'Doença Cardíaca', description: 'História de insuficiência cardíaca, arritmias significativas ou cardiotoxicidade prévia.' },
        { value: 'elderly', icon: '👵', title: 'Idade Avançada', description: 'Doente com >75 anos, fragilidade ou polimedicação significativa.' },
        { value: 'none', icon: '✓', title: 'Sem Considerações Especiais', description: 'Doente sem comorbilidades relevantes que possam influenciar a decisão terapêutica.' }
      ]
    }
  ]
};