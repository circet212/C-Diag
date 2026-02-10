export interface WarningTrigger {
  value: string; // The value that triggers this warning
  message?: string; // Just a text warning
  followUpField?: FormFieldConfig; // Or an additional input field required
  iframeUrl?: string; // URL to display in an iframe
  stopRendering?: boolean; // If true, hides subsequent form fields
  preservedFieldIds?: string[]; // IDs of fields to force render even if rendering is stopped
  allowSubmit?: boolean; // If true, shows the submit button even if rendering is stopped
}

export interface FormFieldConfig {
  id: string; // Unique key for state
  type: 'text' | 'textarea' | 'select';
  label: string;
  required?: boolean;
  disabled?: boolean; // For static info fields
  defaultValue?: string;
  options?: { value: string; text: string; disabled?: boolean; selected?: boolean }[];
  datalist?: string[]; // Autocomplete options
  maxLength?: number;
  warningTriggers?: WarningTrigger[]; // Logic for conditional warnings/inputs
}

export type PrerequisMap = Record<string, FormFieldConfig[]>;

// Decision Tree Types
export interface DecisionNode {
  question: string;
  choices: Record<string, DecisionNode | string>; // If string, it's a final Leaf Code
}

export interface StepHistory {
  question: string;
  answer: string;
}