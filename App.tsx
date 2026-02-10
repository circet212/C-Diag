import React, { useState, useRef } from 'react';
import { RotateCcw, Copy, CheckCircle, Network, AlertTriangle, ArrowLeft } from 'lucide-react';
import { DECISION_TREE, PREREQUIS_DATA } from './constants';
import { DecisionNode, StepHistory } from './types';
import DynamicForm from './components/DynamicForm';

const App: React.FC = () => {
  // Application State
  const [history, setHistory] = useState<StepHistory[]>([]);
  const [currentNode, setCurrentNode] = useState<DecisionNode | null>(null);
  const [finalCode, setFinalCode] = useState<string | null>(null);
  const [generatedTrame, setGeneratedTrame] = useState<string>('');
  const [isAssistance, setIsAssistance] = useState<boolean>(false);
  
  // Ref for auto-scrolling
  const endOfRef = useRef<HTMLDivElement>(null);

  const startProcess = (type: 'assistance' | 'declaration') => {
    if (type === 'assistance') {
      setIsAssistance(true);
      setHistory([{ question: 'Demande', answer: 'Assistance' }]);
      setGeneratedTrame("DEMANDE D'ASSISTANCE"); // Or handle specific assistance logic
    } else {
      setIsAssistance(false);
      setHistory([{ question: 'Demande', answer: "Déclaration d'échec" }]);
      setCurrentNode(DECISION_TREE);
    }
  };

  // Allow jumping back to a specific step in history
  const handleHistoryClick = (index: number) => {
    // We want to return to the state where we make the choice for 'index'.
    // So we keep the history UP TO index (exclusive of the clicked item itself, 
    // because clicking it means "I want to change THIS answer").
    
    // Example:
    // 0: Demande
    // 1: Responsable
    // 2: Categorie
    // If I click 1 (Responsable), I want to re-answer Responsable. So I keep history [0].

    if (index === 0) {
        reset();
        return;
    }

    const newHistory = history.slice(0, index);
    
    // Reset end states
    setGeneratedTrame('');
    setFinalCode(null);
    setHistory(newHistory);

    // Re-traverse tree to find the correct node
    let pointer: DecisionNode | string = DECISION_TREE;
    
    // Iterate steps starting from index 1 (since index 0 is "Demande" setup)
    for (let i = 1; i < newHistory.length; i++) {
        const step = newHistory[i];
        if (typeof pointer !== 'string' && pointer.choices) {
            const next: DecisionNode | string | undefined = pointer.choices[step.answer];
            if (next) {
                pointer = next;
            }
        }
    }
    
    if (typeof pointer !== 'string') {
        setCurrentNode(pointer as DecisionNode);
    } else {
        // Should essentially not happen if logic is correct for "going back to a question", 
        // but safe fallback
        setFinalCode(pointer);
        setCurrentNode(null);
    }
  };

  const handleBack = () => {
    // 1. If viewing generated trame, go back to form
    // NOTE: With side-by-side view, "back" from result might just mean clear result
    if (generatedTrame) {
      setGeneratedTrame('');
      return;
    }

    // 2. If history is empty or just has the initial 'Demande' type, reset to home
    if (history.length <= 1) {
      reset();
      return;
    }

    // 3. Remove last step (standard back behavior)
    handleHistoryClick(history.length - 1);
  };

  const handleChoice = (answer: string, nextNode: DecisionNode | string) => {
    // Add to history
    setHistory(prev => [...prev, { question: currentNode!.question, answer }]);
    
    if (typeof nextNode === 'string') {
      // Reached a leaf (Final Code)
      setCurrentNode(null);
      setFinalCode(nextNode);
      // Add code to history for display
      setHistory(prev => [...prev, { question: "Code d'échec", answer: nextNode }]);
    } else {
      // Continue tree
      setCurrentNode(nextNode);
    }
    
    setTimeout(() => {
        endOfRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFormSubmit = (formData: Record<string, string>) => {
    let result = "";
    
    // Add History to trame
    history.forEach(step => {
        result += `- ${step.question} : ${step.answer}\n`;
    });
    result += "\n--- DÉTAILS ---\n";

    // Add form data
    const config = finalCode ? PREREQUIS_DATA[finalCode] : [];
    
    // Helper to find label
    const findLabel = (id: string): string => {
        const field = config.find(f => f.id === id);
        if (field) return field.label;
        // Check nested
        for(const f of config) {
            if(f.warningTriggers) {
                const trigger = f.warningTriggers.find(t => t.followUpField && t.followUpField.id === id);
                if(trigger) return trigger.followUpField!.label;
            }
        }
        return id;
    };

    Object.entries(formData).forEach(([key, value]) => {
      const label = findLabel(key);
      result += `- ${label} ${value}\n`;
    });

    setGeneratedTrame(result);
    setTimeout(() => {
        endOfRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedTrame);
    alert('Trame copiée dans le presse-papier !');
  };

  const reset = () => {
    setHistory([]);
    setCurrentNode(null);
    setFinalCode(null);
    setGeneratedTrame('');
    setIsAssistance(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Compact Header Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 px-4 py-3 mb-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
                <Network className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-none">C-Diag</h1>
              <p className="text-xs text-gray-500 mt-0.5">Assistant de diagnostic</p>
            </div>
          </div>
          
          {history.length > 0 && (
            <button 
              onClick={reset}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Recommencer"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Main Container - Dynamic Width */}
      <main className={`mx-auto px-4 transition-all duration-300 ${generatedTrame && !isAssistance ? 'max-w-7xl' : 'max-w-4xl'}`}>
        
        {/* Initial State */}
        {history.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center animate-slide-up mt-10">
            <h2 className="text-xl font-semibold mb-8 text-gray-700">Sélectionnez le type de demande</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => startProcess('assistance')}
                className="group relative px-6 py-5 bg-white border-2 border-blue-100 hover:border-blue-500 text-gray-700 hover:text-blue-600 rounded-xl font-medium transition-all shadow-sm hover:shadow-md flex flex-col items-center gap-3 w-full sm:w-48"
              >
                <div className="bg-blue-50 p-3 rounded-full group-hover:bg-blue-100 transition-colors">
                  <CheckCircle size={28} className="text-blue-500" />
                </div>
                <span>Demande d'Assistance</span>
              </button>
              
              <button
                onClick={() => startProcess('declaration')}
                className="group relative px-6 py-5 bg-white border-2 border-red-100 hover:border-red-500 text-gray-700 hover:text-red-600 rounded-xl font-medium transition-all shadow-sm hover:shadow-md flex flex-col items-center gap-3 w-full sm:w-48"
              >
                <div className="bg-red-50 p-3 rounded-full group-hover:bg-red-100 transition-colors">
                  <AlertTriangle size={28} className="text-red-500" />
                </div>
                <span>Déclaration d'échec</span>
              </button>
            </div>
          </div>
        )}

        {/* History Breadcrumbs */}
        {history.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 animate-fade-in">
            {history.map((step, idx) => (
              <div 
                key={idx} 
                onClick={() => handleHistoryClick(idx)}
                title="Modifier ce choix"
                className="flex items-center text-xs sm:text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200 cursor-pointer hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 transition-all"
              >
                <span className="font-semibold mr-1">{step.question}:</span>
                <span className="text-blue-700 font-medium truncate max-w-[150px] sm:max-w-xs">{step.answer}</span>
              </div>
            ))}
          </div>
        )}

        {/* Decision Tree Interaction */}
        {currentNode && (
          <div key={currentNode.question} className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100 animate-slide-in-right">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                {currentNode.question}
              </h3>
              <button 
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors font-medium px-2 py-1 rounded-md hover:bg-gray-50"
              >
                <ArrowLeft size={16} /> Retour
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {Object.entries(currentNode.choices).map(([choiceKey, nextNode]) => (
                <button
                  key={choiceKey}
                  onClick={() => handleChoice(choiceKey, nextNode as DecisionNode | string)}
                  className="px-5 py-3 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-300 rounded-lg transition-all font-medium text-left shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  {choiceKey}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Assistance Conclusion */}
        {isAssistance && generatedTrame === "DEMANDE D'ASSISTANCE" && (
           <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-slide-up">
              <h3 className="text-xl font-bold text-green-800 mb-2">Assistance Sélectionnée</h3>
              <p className="text-green-700">Vous avez sélectionné une demande d'assistance.</p>
              <button onClick={reset} className="mt-4 text-green-800 underline">Recommencer</button>
           </div>
        )}

        {/* FLEX CONTAINER for Side-by-Side View */}
        {/* Changed items-start to items-stretch to force equal height */}
        <div className={`flex flex-col lg:flex-row gap-6 items-stretch transition-all`}>
            
            {/* Prerequis Form */}
            {finalCode && (
            <div className={`transition-all duration-300 ${generatedTrame ? 'w-full lg:w-1/2' : 'w-full'}`}>
                {/* Added h-full and removed mb-6 to allow stretching */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-400 animate-slide-up h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-gray-800">Pré-requis</h3>
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">{finalCode}</span>
                        </div>
                        {/* Only show Back if we are not in side-by-side mode, or standard behavior */}
                        <button 
                            onClick={handleBack}
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors font-medium px-2 py-1 rounded-md hover:bg-gray-50"
                        >
                            <ArrowLeft size={16} /> Retour
                        </button>
                    </div>
                    
                    {PREREQUIS_DATA[finalCode] ? (
                        <DynamicForm fields={PREREQUIS_DATA[finalCode]} onSubmit={handleFormSubmit} />
                    ) : (
                    <div className="text-center p-8 text-gray-500">
                        <p>Aucun formulaire configuré pour ce code ({finalCode}).</p>
                        <button onClick={() => handleFormSubmit({})} className="mt-4 btn-primary">Générer la trame simple</button>
                    </div>
                    )}
                </div>
            </div>
            )}

            {/* Final Output */}
            {generatedTrame && generatedTrame !== "DEMANDE D'ASSISTANCE" && (
            <div className="w-full lg:w-1/2 animate-slide-in-right">
                {/* Added h-full, flex-col and removed sticky/fixed height to stretch with sibling */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 h-full flex flex-col">
                    <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2">
                            <CheckCircle className="text-green-400" />
                            Trame Générée
                        </h3>
                        {/* Close/Reset specific to Trame view */}
                        <button 
                            onClick={() => setGeneratedTrame('')}
                            className="text-white hover:text-gray-200 text-sm underline opacity-80"
                        >
                            Fermer
                        </button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <textarea
                            className="w-full flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            style={{ minHeight: '300px' }}
                            readOnly
                            value={generatedTrame}
                        />
                        <div className="mt-4 flex gap-3 flex-col sm:flex-row">
                            <button
                            onClick={copyToClipboard}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                            <Copy size={18} /> Copier
                            </button>
                            <button
                            onClick={reset}
                            className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                            <RotateCcw size={18} /> Recommencer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
      </main>

      <div ref={endOfRef} />
    </div>
  );
};

export default App;