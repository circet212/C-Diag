import { DecisionNode, PrerequisMap } from './types';

export const DECISION_TREE: DecisionNode = {
  question: "Responsable d'échec :",
  choices: {
    "Client": {
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
                "MED": {
                  question: "Type de commande",
                  choices: {
                    "Acquisition": "CODE 90- TRAVAUX CLIENT",
                    "Modification/Déménagement": "CODE 90- TRAVAUX CLIENT*"
                  }
                },
                "Autres": "2",
              }
            }
          }
        },
        "Disponibilité": "3",
        "Refus / Abandon": "5",
        "Equipement": "6",
        "Droit de retrait": "7"
      }
    },
    "Installateur": {
      question: "Blocage :",
      choices: {
        "Technicien": "Code 100",
        "MANQUE MATERIEL": "Code 92"
      }
    },
    "OI": {
      question: "Blocage :",
      choices: {
        "Accès / exploitation": "31-ECHEC PRODUCTION : ACCES PM ACTION OI",
        "ROP": "Code 44"
      }
    }
  }
};

const GEM_IFRAME_URL = "https://forms.office.com/pages/responsepage.aspx?id=65RXePahdk2FMcNGl6Ja0lWiy2bKwMFOrXM4Vv3CEGxUQkJWV1RaRlRHS0ZXWUhJWFhINkpNWlNCUC4u&route=shorturl";

export const PREREQUIS_DATA: PrerequisMap = {
  "1": [
    { id: "desc_1", type: "textarea", label: "Description :", defaultValue: "1", disabled: true }
  ],
  "2": [
    { id: "desc_2", type: "textarea", label: "Description :", defaultValue: "2", disabled: true }
  ],
  "CODE 01 - PROBLEME ACCES PM": [
    { id: "code_cloture", type: "text", label: "Code de clôture :", defaultValue: "CODE 01 - PROBLEME ACCES PM", disabled: true },
    { id: "description", type: "textarea", label: "Description :", defaultValue: "PM - Défaut Accès PM (responsabilité Client)", disabled: true },
    { id: "parcours", type: "textarea", label: "Parcours :", defaultValue: "KO >> PM >> Acces PM >> Cause Technicien", disabled: true },
    {
      id: "client_joignable",
      type: "select",
      label: "Client joignable lors de contre appel :",
      required: true,
      options: [
        { value: "", text: "Sélectionner...", selected: true, disabled: true },
        { value: "OUI", text: "OUI" },
        { value: "NON", text: "NON" }
      ],
      warningTriggers: [
        {
          value: "NON",
          followUpField: {
            id: "prquoi_contre_appel_ko",
            type: "text",
            label: "Pourquoi (contre appel KO) :",
            required: true
          }
        }
      ]
    },
    {
      id: "gem_possible",
      type: "select",
      label: "Un GEM est possible sous 7 jours:",
      required: true,
      options: [
        { value: "", text: "Sélectionner...", selected: true, disabled: true },
        { value: "OUI", text: "OUI" },
        { value: "NON", text: "NON" }
      ],
      warningTriggers: [
        {
          value: "OUI",
          message: "Il faut prioriser le GEM dans le but de sauver l'intervention.",
          iframeUrl: GEM_IFRAME_URL,
          stopRendering: true
        }
      ]
    },
    {
      id: "moyen_acces",
      type: "select",
      label: "Moyen d'accès :",
      required: true,
      options: [
        { value: "", text: "Sélectionner...", selected: true, disabled: true },
        { value: "Clé", text: "Clé" },
        { value: "Syndic", text: "Syndic" },
        { value: "Autre", text: "Autre" }
      ],
      warningTriggers: [
        {
          value: "Autre",
          followUpField: {
            id: "explic_autre_moy_acces",
            type: "text",
            label: "Autre moyen d'accès est :",
            required: true
          }
        }
      ]
    },
    { id: "etage_pmi", type: "text", label: "Emplacement ou étage PMI :", required: true },
    {
      id: "photo_pmi",
      type: "select",
      label: "Photo du PMI inaccessible/fermé sur le journal :",
      required: true,
      options: [
        { value: "", text: "Sélectionner...", selected: true, disabled: true },
        { value: "OUI", text: "OUI" },
        { value: "NON", text: "NON" }
      ],
      warningTriggers: [
        { 
          value: "NON", 
          message: "Cette élément est impératif sur le dossier, sinon pas de code de décharge.",
          stopRendering: true,
          preservedFieldIds: ["commentaire"],
          allowSubmit: true
        }
      ]
    },
    {
      id: "parcours_expert",
      type: "select",
      label: "Le parcours Expert est déroulé par le technicien :",
      required: true,
      options: [
        { value: "", text: "Sélectionner...", selected: true, disabled: true },
        { value: "OUI", text: "OUI" },
        { value: "NON", text: "NON" }
      ],
      warningTriggers: [
        { value: "NON", message: "Le technicien doit impérativement dérouler le parcours Expert avec le code 01." }
      ]
    },
    { id: "commentaire", type: "textarea", label: "Commentaire de traitement :", required: true },
    {
      id: "code_decharge",
      type: "text",
      label: "Code de décharge :",
      required: true,
      maxLength: 4,
      datalist: [
        "Aucun, échec transformé en réussite",
        "Aucun, solution apporté (voir commentraire de traitement), tech fera le nécessaire",
        "Aucun, un GEM a été fait",
        "Aucun, ______ manque sur le journal",
        "Aucun, le tech n'a pas déroulé le parcours",
        "Aucun, appel coupé"
      ]
    }
  ],
  "CODE 13 - AUTORISATION SYNDIC OU PROPRIETAIRE": [
    { id: "desc_13", type: "textarea", label: "Description :", defaultValue: "CLIENT - Les travaux nécessitent une autorisation...", disabled: true },
    {
      id: "client_joignable",
      type: "select",
      label: "Client joignable lors de contre appel :",
      required: true,
      options: [
        { value: "", text: "Sélectionner...", selected: true, disabled: true },
        { value: "OUI", text: "OUI" },
        { value: "NON", text: "NON" }
      ],
      warningTriggers: [
        {
          value: "NON",
          followUpField: {
            id: "prquoi_contre_appel_ko",
            type: "text",
            label: "Pourquoi :",
            required: false
          }
        }
      ]
    },
    {
        id: "gem_possible",
        type: "select",
        label: "Un GEM est possible sous 7 jours:",
        required: true,
        options: [
          { value: "", text: "Sélectionner...", selected: true, disabled: true },
          { value: "OUI", text: "OUI" },
          { value: "NON", text: "NON" }
        ],
        warningTriggers: [
          {
            value: "OUI",
            message: "Il faut prioriser le GEM dans le but de sauver l'intervention.",
            iframeUrl: GEM_IFRAME_URL,
            stopRendering: true
          }
        ]
    },
    {
        id: "photo_demande",
        type: "select",
        label: "Photo de la demande d'autorisation présente :",
        required: true,
        options: [
            { value: "", text: "Sélectionner...", selected: true, disabled: true },
            { value: "OUI", text: "OUI" },
            { value: "NON", text: "NON" }
        ],
        warningTriggers: [
            {
                value: "NON",
                followUpField: {
                    id: "prquoi_abs_photo_aut",
                    type: "text",
                    label: "Pourquoi (Absence photo) :",
                    required: true
                }
            }
        ]
    },
    {
        id: "parcours_expert",
        type: "select",
        label: "Le parcours Expert est déroulé par le technicien :",
        required: false,
        options: [
            { value: "", text: "Sélectionner...", selected: true, disabled: true },
            { value: "OUI", text: "OUI" },
            { value: "NON", text: "NON" }
        ],
        warningTriggers: [
            {
                value: "NON",
                message: "Le technicien doit impérativement dérouler le parcours Expert."
            }
        ]
    },
    { id: "commentaire", type: "textarea", label: "Commentaire de traitement :" },
    { id: "code_decharge", type: "text", label: "Code de décharge :", maxLength: 4 }
  ],
  "CODE 90- TRAVAUX CLIENT": [
      { id: "nature_travaux", type: "textarea", label: "Nature des travaux à réaliser par le client :", required: true },
      {
          id: "domaine_travaux",
          type: "select",
          label: "Domaine des travaux :",
          options: [
              { value: "", text: "Sélectionner...", selected: true, disabled: true },
              { value: "Intérieur", text: "Intérieur" },
              { value: "Droit du terrain", text: "Droit du terrain" }
          ]
      },
      {
        id: "client_joignable",
        type: "select",
        label: "Client joignable lors de contre appel :",
        required: true,
        options: [
          { value: "", text: "Sélectionner...", selected: true, disabled: true },
          { value: "OUI", text: "OUI" },
          { value: "NON", text: "NON" }
        ],
        warningTriggers: [
          {
            value: "NON",
            followUpField: {
              id: "prquoi_contre_appel_ko",
              type: "text",
              label: "Pourquoi :",
              required: true
            }
          }
        ]
      },
      {
        id: "gem_possible",
        type: "select",
        label: "Un GEM est possible sous 7 jours:",
        required: true,
        options: [
          { value: "", text: "Sélectionner...", selected: true, disabled: true },
          { value: "OUI", text: "OUI" },
          { value: "NON", text: "NON" }
        ],
        warningTriggers: [
          {
            value: "OUI",
            message: "Il faut prioriser le GEM dans le but de sauver l'intervention.",
            iframeUrl: GEM_IFRAME_URL,
            stopRendering: true
          }
        ]
      },
      { id: "commentaire", type: "textarea", label: "Commentaire de traitement :" },
      { id: "code_decharge", type: "text", label: "Code de décharge :", maxLength: 4 }
  ]
};