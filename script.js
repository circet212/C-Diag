const DECISION_TREE = {
  question: "Responsable d'échec :",
  choices: {
    Client: {
      question: "Catégorie :",
      choices: {
        "Partie Commune": {
          question: "Blocage :",
          choices: {
            "Accès PM": "CODE 01 - PROBLEME ACCES PM",
            "Autorisation syndic ou propriétaire": "CODE 13 - AUTORISATION SYNDIC OU PROPRIETAIRE"
          }
        },
        "Partie Privée": {
          question: "Blocage :",
          choices: {
            "Autorisation syndic ou propriétaire": "CODE 13 - AUTORISATION SYNDIC OU PROPRIETAIRE",
            "Travaux client": {
              question: "Région :",
              choices: {
                MED: {
                  question: "Type de commande",
                  choices: {
                    Acquisition: "CODE 90- TRAVAUX CLIENT",
                    "Modification/Déménagement": "CODE 90- TRAVAUX CLIENT"
                  }
                },
                Autres: "CODE 90- TRAVAUX CLIENT"
              }
            }
          }
        },
        Disponibilité: "3",
        "Refus / Abandon": "5",
        Equipement: "6",
        "Droit de retrait": "7"
      }
    },
    Installateur: {
      question: "Blocage :",
      choices: {
        Technicien: "Code 100",
        "MANQUE MATERIEL": "Code 92"
      }
    },
    OI: {
      question: "Blocage :",
      choices: {
        "Accès / exploitation": "31-ECHEC PRODUCTION : ACCES PM ACTION OI",
        ROP: "Code 44"
      }
    }
  }
};

const GEM_IFRAME_URL = "https://forms.office.com/pages/responsepage.aspx?id=65RXePahdk2FMcNGl6Ja0lWiy2bKwMFOrXM4Vv3CEGxUQkJWV1RaRlRHS0ZXWUhJWFhINkpNWlNCUC4u&route=shorturl";

const PREREQUIS_DATA = {
  "CODE 01 - PROBLEME ACCES PM": [
    { id: "code_cloture", type: "text", label: "Code de clôture :", defaultValue: "CODE 01 - PROBLEME ACCES PM", disabled: true },
    { id: "description", type: "textarea", label: "Description :", defaultValue: "PM - Défaut Accès PM (responsabilité Client)", disabled: true },
    { id: "parcours", type: "textarea", label: "Parcours :", defaultValue: "KO >> PM >> Acces PM >> Cause Technicien", disabled: true },
    {
      id: "client_joignable", type: "select", label: "Client joignable lors de contre appel :", required: true,
      options: [{ value: "", text: "Sélectionner...", disabled: true }, { value: "OUI", text: "OUI" }, { value: "NON", text: "NON" }],
      warningTriggers: [{ value: "NON", followUpField: { id: "prquoi_contre_appel_ko", type: "text", label: "Pourquoi (contre appel KO) :", required: true } }]
    },
    {
      id: "gem_possible", type: "select", label: "Un GEM est possible sous 7 jours:", required: true,
      options: [{ value: "", text: "Sélectionner...", disabled: true }, { value: "OUI", text: "OUI" }, { value: "NON", text: "NON" }],
      warningTriggers: [{ value: "OUI", message: "Il faut prioriser le GEM dans le but de sauver l'intervention.", iframeUrl: GEM_IFRAME_URL, stopRendering: true }]
    },
    {
      id: "moyen_acces", type: "select", label: "Moyen d'accès :", required: true,
      options: [{ value: "", text: "Sélectionner...", disabled: true }, { value: "Clé", text: "Clé" }, { value: "Syndic", text: "Syndic" }, { value: "Autre", text: "Autre" }],
      warningTriggers: [{ value: "Autre", followUpField: { id: "explic_autre_moy_acces", type: "text", label: "Autre moyen d'accès est :", required: true } }]
    },
    { id: "etage_pmi", type: "text", label: "Emplacement ou étage PMI :", required: true },
    {
      id: "photo_pmi", type: "select", label: "Photo du PMI inaccessible/fermé sur le journal :", required: true,
      options: [{ value: "", text: "Sélectionner...", disabled: true }, { value: "OUI", text: "OUI" }, { value: "NON", text: "NON" }],
      warningTriggers: [{ value: "NON", message: "Cette élément est impératif sur le dossier, sinon pas de code de décharge.", stopRendering: true, preservedFieldIds: ["commentaire"], allowSubmit: true }]
    },
    {
      id: "parcours_expert", type: "select", label: "Le parcours Expert est déroulé par le technicien :", required: true,
      options: [{ value: "", text: "Sélectionner...", disabled: true }, { value: "OUI", text: "OUI" }, { value: "NON", text: "NON" }],
      warningTriggers: [{ value: "NON", message: "Le technicien doit impérativement dérouler le parcours Expert avec le code 01." }]
    },
    { id: "commentaire", type: "textarea", label: "Commentaire de traitement :", required: true },
    { id: "code_decharge", type: "text", label: "Code de décharge :", required: true, maxLength: 4 }
  ],
  "CODE 13 - AUTORISATION SYNDIC OU PROPRIETAIRE": [
    { id: "desc_13", type: "textarea", label: "Description :", defaultValue: "CLIENT - Les travaux nécessitent une autorisation...", disabled: true },
    {
      id: "client_joignable", type: "select", label: "Client joignable lors de contre appel :", required: true,
      options: [{ value: "", text: "Sélectionner...", disabled: true }, { value: "OUI", text: "OUI" }, { value: "NON", text: "NON" }],
      warningTriggers: [{ value: "NON", followUpField: { id: "prquoi_contre_appel_ko", type: "text", label: "Pourquoi :" } }]
    },
    {
      id: "gem_possible", type: "select", label: "Un GEM est possible sous 7 jours:", required: true,
      options: [{ value: "", text: "Sélectionner...", disabled: true }, { value: "OUI", text: "OUI" }, { value: "NON", text: "NON" }],
      warningTriggers: [{ value: "OUI", message: "Il faut prioriser le GEM dans le but de sauver l'intervention.", iframeUrl: GEM_IFRAME_URL, stopRendering: true }]
    },
    {
      id: "photo_demande", type: "select", label: "Photo de la demande d'autorisation présente :", required: true,
      options: [{ value: "", text: "Sélectionner...", disabled: true }, { value: "OUI", text: "OUI" }, { value: "NON", text: "NON" }],
      warningTriggers: [{ value: "NON", followUpField: { id: "prquoi_abs_photo_aut", type: "text", label: "Pourquoi (Absence photo) :", required: true } }]
    },
    { id: "commentaire", type: "textarea", label: "Commentaire de traitement :" },
    { id: "code_decharge", type: "text", label: "Code de décharge :", maxLength: 4 }
  ],
  "CODE 90- TRAVAUX CLIENT": [
    { id: "nature_travaux", type: "textarea", label: "Nature des travaux à réaliser par le client :", required: true },
    {
      id: "domaine_travaux", type: "select", label: "Domaine des travaux :",
      options: [{ value: "", text: "Sélectionner...", disabled: true }, { value: "Intérieur", text: "Intérieur" }, { value: "Droit du terrain", text: "Droit du terrain" }]
    },
    {
      id: "client_joignable", type: "select", label: "Client joignable lors de contre appel :", required: true,
      options: [{ value: "", text: "Sélectionner...", disabled: true }, { value: "OUI", text: "OUI" }, { value: "NON", text: "NON" }],
      warningTriggers: [{ value: "NON", followUpField: { id: "prquoi_contre_appel_ko", type: "text", label: "Pourquoi :", required: true } }]
    },
    {
      id: "gem_possible", type: "select", label: "Un GEM est possible sous 7 jours:", required: true,
      options: [{ value: "", text: "Sélectionner...", disabled: true }, { value: "OUI", text: "OUI" }, { value: "NON", text: "NON" }],
      warningTriggers: [{ value: "OUI", message: "Il faut prioriser le GEM dans le but de sauver l'intervention.", iframeUrl: GEM_IFRAME_URL, stopRendering: true }]
    },
    { id: "commentaire", type: "textarea", label: "Commentaire de traitement :" },
    { id: "code_decharge", type: "text", label: "Code de décharge :", maxLength: 4 }
  ]
};

const state = { history: [], currentNode: null, finalCode: null, formData: {} };

const historyList = document.getElementById('historyList');
const questionTitle = document.getElementById('questionTitle');
const choicesBox = document.getElementById('choices');
const form = document.getElementById('dynamicForm');
const resultText = document.getElementById('resultText');
const resultPanel = document.getElementById('resultPanel');

function resetAll() {
  state.history = [];
  state.currentNode = null;
  state.finalCode = null;
  state.formData = {};
  resultText.value = '';
  render();
}

function start(type) {
  if (type === 'assistance') {
    state.history = [{ question: 'Demande', answer: 'Assistance' }];
    state.currentNode = null;
    state.finalCode = null;
    resultText.value = "DEMANDE D'ASSISTANCE";
    render();
    return;
  }
  state.history = [{ question: 'Demande', answer: "Déclaration d'échec" }];
  state.currentNode = DECISION_TREE;
  state.finalCode = null;
  state.formData = {};
  resultText.value = '';
  render();
}

function applyChoice(answer, next) {
  state.history.push({ question: state.currentNode.question, answer });
  if (typeof next === 'string') {
    state.finalCode = next;
    state.currentNode = null;
    state.history.push({ question: "Code d'échec", answer: next });
  } else {
    state.currentNode = next;
  }
  render();
}

function createField(field, value = '') {
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const label = document.createElement('label');
  label.textContent = field.label;
  label.htmlFor = field.id;
  wrapper.appendChild(label);

  let input;
  if (field.type === 'textarea') {
    input = document.createElement('textarea');
  } else if (field.type === 'select') {
    input = document.createElement('select');
    (field.options || []).forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.text;
      if (opt.disabled) o.disabled = true;
      input.appendChild(o);
    });
  } else {
    input = document.createElement('input');
    input.type = 'text';
  }

  input.id = field.id;
  input.name = field.id;
  if (field.required) input.required = true;
  if (field.maxLength) input.maxLength = field.maxLength;
  if (field.disabled) input.disabled = true;
  input.value = value || field.defaultValue || '';

  input.addEventListener('input', () => {
    state.formData[field.id] = input.value;
    renderForm();
  });
  input.addEventListener('change', () => {
    state.formData[field.id] = input.value;
    renderForm();
  });

  wrapper.appendChild(input);
  return wrapper;
}

function renderForm() {
  form.innerHTML = '';
  const config = PREREQUIS_DATA[state.finalCode] || [];
  if (!config.length) {
    const p = document.createElement('p');
    p.textContent = "Aucun prérequis configuré pour ce code. Vous pouvez copier l'historique.";
    form.appendChild(p);
  }

  let stopRendering = false;
  let allowSubmit = true;
  const preserved = new Set();

  config.forEach((field) => {
    if (stopRendering && !preserved.has(field.id)) return;

    const value = state.formData[field.id] ?? field.defaultValue ?? '';
    form.appendChild(createField(field, value));

    const trigger = (field.warningTriggers || []).find((t) => (state.formData[field.id] || '') === t.value);
    if (trigger) {
      if (trigger.message) {
        const warn = document.createElement('div');
        warn.className = 'warning';
        warn.textContent = trigger.message;
        form.appendChild(warn);
      }
      if (trigger.followUpField) {
        const sub = trigger.followUpField;
        const subValue = state.formData[sub.id] || '';
        form.appendChild(createField(sub, subValue));
      }
      if (trigger.iframeUrl) {
        const iframe = document.createElement('iframe');
        iframe.src = trigger.iframeUrl;
        iframe.loading = 'lazy';
        form.appendChild(iframe);
      }
      if (trigger.stopRendering) {
        stopRendering = true;
        allowSubmit = !!trigger.allowSubmit;
        (trigger.preservedFieldIds || []).forEach((id) => preserved.add(id));
      }
    }
  });

  if (config.length && allowSubmit) {
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'btn';
    submit.textContent = 'Générer la trame';
    form.appendChild(submit);
  }
}

function generateTrame() {
  let txt = '';
  state.history.forEach((s) => {
    txt += `- ${s.question} : ${s.answer}\n`;
  });
  txt += '\n--- DÉTAILS ---\n';
  Object.entries(state.formData).forEach(([k, v]) => {
    if (v) txt += `- ${k} : ${v}\n`;
  });
  resultText.value = txt;
}

function render() {
  historyList.innerHTML = '';
  state.history.forEach((step) => {
    const li = document.createElement('li');
    li.textContent = `${step.question} → ${step.answer}`;
    historyList.appendChild(li);
  });

  choicesBox.innerHTML = '';
  if (state.currentNode) {
    questionTitle.textContent = state.currentNode.question;
    Object.entries(state.currentNode.choices).forEach(([answer, next]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn choice';
      btn.textContent = answer;
      btn.addEventListener('click', () => applyChoice(answer, next));
      choicesBox.appendChild(btn);
    });
  } else {
    questionTitle.textContent = 'Aucune question active';
  }

  if (state.finalCode) {
    renderForm();
  } else {
    form.innerHTML = '<p>Sélectionnez un code d\'échec pour afficher les prérequis.</p>';
  }

  resultPanel.classList.toggle('hidden', !resultText.value);
}

document.querySelectorAll('[data-start]').forEach((btn) => {
  btn.addEventListener('click', () => start(btn.dataset.start));
});

document.getElementById('resetBtn').addEventListener('click', resetAll);

document.getElementById('copyBtn').addEventListener('click', async () => {
  if (!resultText.value) return;
  await navigator.clipboard.writeText(resultText.value);
  alert('Trame copiée.');
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  generateTrame();
  render();
});

resetAll();
