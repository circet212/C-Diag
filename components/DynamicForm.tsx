import React, { useState, useEffect } from 'react';
import { FormFieldConfig, WarningTrigger } from '../types';
import { AlertCircle } from 'lucide-react';

interface DynamicFormProps {
  fields: FormFieldConfig[];
  onSubmit: (formData: Record<string, string>) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ fields, onSubmit }) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [extraFields, setExtraFields] = useState<Record<string, FormFieldConfig | null>>({});

  // Initialize defaults
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    fields.forEach(f => {
      if (f.defaultValue) initialValues[f.id] = f.defaultValue;
    });
    setFormValues(prev => ({ ...prev, ...initialValues }));
  }, [fields]);

  const handleChange = (fieldId: string, value: string, config: FormFieldConfig) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));

    // Handle Warnings and Conditional Fields
    if (config.warningTriggers) {
      const trigger = config.warningTriggers.find(t => t.value === value);
      
      // Update Warning Message
      if (trigger && trigger.message) {
        setWarnings(prev => ({ ...prev, [fieldId]: trigger.message! }));
      } else {
        const newWarnings = { ...warnings };
        delete newWarnings[fieldId];
        setWarnings(newWarnings);
      }

      // Update Extra Field
      if (trigger && trigger.followUpField) {
        setExtraFields(prev => ({ ...prev, [fieldId]: trigger.followUpField! }));
      } else {
        const newExtras = { ...extraFields };
        delete newExtras[fieldId];
        setExtraFields(newExtras);
        // Also cleanup value of hidden extra field
        if (extraFields[fieldId]) {
            setFormValues(prev => {
                const next = {...prev};
                delete next[extraFields[fieldId]!.id];
                return next;
            });
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate extra fields
    const allRequiredFields = [...fields];
    Object.values(extraFields).forEach(ef => {
        if(ef) allRequiredFields.push(ef);
    });

    for (const f of allRequiredFields) {
        // Skip validation if the field is not rendered (e.g. stopped)
        // We check if the element exists in the DOM
        const el = document.getElementById(f.id);
        // Note: For radio buttons, the ID might not be on the input directly or there are multiple, 
        // but we mainly check value presence here for safety.
        // However, warning trigger logic relies on DOM presence to skip hidden fields.
        // We can check if the field container exists or if the input exists.
        
        // Specialized check for radio/inputs
        const inputEl = document.querySelector(`[name="${f.id}"]`) || document.getElementById(f.id);
        
        if (!inputEl) {
            continue;
        }

        if (f.required && !formValues[f.id]) {
            alert(`Le champ "${f.label}" est obligatoire.`);
            if (inputEl instanceof HTMLElement) inputEl.focus();
            return;
        }
    }

    onSubmit(formValues);
  };

  const renderFieldInput = (field: FormFieldConfig) => {
    // 1. TEXTAREA
    if (field.type === 'textarea') {
      return (
        <textarea
            id={field.id}
            name={field.id}
            value={formValues[field.id] || ''}
            disabled={field.disabled}
            onChange={(e) => handleChange(field.id, e.target.value, field)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
            rows={2}
        />
      );
    }

    // 2. SELECT TRANSFORMATIONS
    if (field.type === 'select' && field.options) {
        const validOptions = field.options.filter(o => !o.disabled);
        
        // Case A: 2 or fewer options -> Radio Buttons
        if (validOptions.length <= 2) {
            return (
                <div className="flex flex-col sm:flex-row gap-4 pt-1">
                    {validOptions.map(opt => (
                        <label key={opt.value} className="inline-flex items-center cursor-pointer group">
                            <input 
                                type="radio" 
                                name={field.id}
                                value={opt.value}
                                checked={formValues[field.id] === opt.value}
                                onChange={(e) => handleChange(field.id, e.target.value, field)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">{opt.text}</span>
                        </label>
                    ))}
                </div>
            );
        }

        // Case B: More than 2 options -> Input with Datalist
        return (
            <>
                <input
                    type="text"
                    id={field.id}
                    name={field.id}
                    list={`list-${field.id}`}
                    value={formValues[field.id] || ''}
                    disabled={field.disabled}
                    onChange={(e) => handleChange(field.id, e.target.value, field)}
                    placeholder="Sélectionner ou saisir..."
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-sm"
                />
                <datalist id={`list-${field.id}`}>
                    {validOptions.map((opt, idx) => (
                        <option key={idx} value={opt.value}>{opt.text !== opt.value ? opt.text : ''}</option>
                    ))}
                </datalist>
            </>
        );
    }

    // 3. STANDARD INPUT (Text)
    return (
        <>
            <input
                type={field.type}
                id={field.id}
                name={field.id}
                value={formValues[field.id] || ''}
                disabled={field.disabled}
                maxLength={field.maxLength}
                list={field.datalist ? `list-${field.id}` : undefined}
                onChange={(e) => handleChange(field.id, e.target.value, field)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-sm"
            />
            {field.datalist && (
                <datalist id={`list-${field.id}`}>
                    {field.datalist.map((item, idx) => (
                        <option key={idx} value={item} />
                    ))}
                </datalist>
            )}
        </>
    );
  };

  const renderField = (field: FormFieldConfig, isNested = false) => {
    return (
      <div key={field.id} className={`grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2 items-start ${!isNested ? 'border-b border-gray-100 pb-3 mb-3 last:border-0 last:pb-0' : ''}`}>
        <label htmlFor={field.id} className="md:col-span-4 block text-sm font-medium text-gray-700 pt-2">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="md:col-span-8">
            {renderFieldInput(field)}

            {/* Warnings */}
            {warnings[field.id] && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2 text-amber-800 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: warnings[field.id] }}></span>
                </div>
            )}

            {/* Extra Nested Field */}
            {extraFields[field.id] && (
                <div className="mt-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                    {renderField(extraFields[field.id]!, true)}
                </div>
            )}
        </div>
      </div>
    );
  };

  // Track the active stop trigger to decide which fields to skip and if we allow submit
  let stopTrigger: WarningTrigger | null = null;

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="bg-white rounded-lg">
          {fields.map(f => {
            // If rendering is stopped by a previous trigger
            if (stopTrigger) {
                // Check if this field is allowed to stay (preserved)
                const isPreserved = stopTrigger.preservedFieldIds?.includes(f.id);
                if (!isPreserved) {
                    return null;
                }
            }

            const currentValue = formValues[f.id];
            const trigger = f.warningTriggers?.find(t => t.value === currentValue);
            
            // Render the current field
            const fieldNode = renderField(f);

            // Check if we should stop rendering subsequent fields
            if (trigger?.stopRendering) {
              stopTrigger = trigger;
              return (
                <React.Fragment key={f.id}>
                  {fieldNode}
                  {trigger.iframeUrl && (
                    <div className="mt-6 mb-6 animate-fade-in border-t pt-4">
                      <iframe 
                        src={trigger.iframeUrl} 
                        className="w-full h-[800px] border border-gray-200 rounded-lg shadow-sm bg-white" 
                        title="Formulaire GEM" 
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            }

            return fieldNode;
          })}
      </div>
      
      {/* Show submit if rendering is NOT stopped OR if the stop trigger explicitly allows submission */}
      {(!stopTrigger || stopTrigger.allowSubmit) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
          >
            Générer la trame
          </button>
        </div>
      )}
    </form>
  );
};

export default DynamicForm;