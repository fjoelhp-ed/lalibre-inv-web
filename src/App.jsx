import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Tag, FileText, Quote, Trash2, MessageSquare, Download, Filter, 
  X, Upload, FileSpreadsheet, FileJson, Edit2, Check, Search, Zap, 
  ArrowLeft, LayoutGrid, FolderPlus, FolderOpen, Pencil, Clock, 
  Settings, ImagePlus, Briefcase, Book, PieChart, Target, Star, Heart,
  HelpCircle, ChevronRight, ChevronLeft, Sparkles, MonitorDown, Apple,
  ShieldAlert, AlertTriangle, HardDrive, Github
} from 'lucide-react';

// --- PALETAS DE COLORES MODERNIZADAS (Con gradientes) ---
const THEMES = {
  blue: { id: 'blue', name: 'Azul Océano', colorCode: '#2563eb', bg: 'bg-blue-600', gradient: 'bg-gradient-to-br from-blue-600 to-indigo-700', hoverBg: 'hover:bg-blue-700', text: 'text-blue-600', lightBg: 'bg-blue-50', border: 'border-blue-200', borderFocus: 'border-blue-400', ring: 'ring-blue-500', iconBg: 'bg-blue-50' },
  emerald: { id: 'emerald', name: 'Esmeralda', colorCode: '#059669', bg: 'bg-emerald-600', gradient: 'bg-gradient-to-br from-emerald-500 to-teal-700', hoverBg: 'hover:bg-emerald-700', text: 'text-emerald-600', lightBg: 'bg-emerald-50', border: 'border-emerald-200', borderFocus: 'border-emerald-400', ring: 'ring-emerald-500', iconBg: 'bg-emerald-50' },
  violet: { id: 'violet', name: 'Violeta', colorCode: '#7c3aed', bg: 'bg-violet-600', gradient: 'bg-gradient-to-br from-violet-600 to-purple-800', hoverBg: 'hover:bg-violet-700', text: 'text-violet-600', lightBg: 'bg-violet-50', border: 'border-violet-200', borderFocus: 'border-violet-400', ring: 'ring-violet-500', iconBg: 'bg-violet-50' },
  rose: { id: 'rose', name: 'Rosa Coral', colorCode: '#e11d48', bg: 'bg-rose-600', gradient: 'bg-gradient-to-br from-rose-500 to-red-700', hoverBg: 'hover:bg-rose-700', text: 'text-rose-600', lightBg: 'bg-rose-50', border: 'border-rose-200', borderFocus: 'border-rose-400', ring: 'ring-rose-500', iconBg: 'bg-rose-50' },
  slate: { id: 'slate', name: 'Grafito', colorCode: '#475569', bg: 'bg-slate-700', gradient: 'bg-gradient-to-br from-slate-600 to-slate-800', hoverBg: 'hover:bg-slate-800', text: 'text-slate-700', lightBg: 'bg-slate-50', border: 'border-slate-200', borderFocus: 'border-slate-400', ring: 'ring-slate-500', iconBg: 'bg-slate-100' }
};

const PRESET_ICONS = { FolderOpen, Briefcase, Book, FileText, PieChart, Target, Star, Heart };

const defaultDocuments = [{
  id: 1,
  title: "Entrevista_01_Teletrabajo.txt",
  content: "Entrevistador: ¿Cómo describirías tu experiencia trabajando desde casa durante el último año?\n\nEntrevistado: Al principio fue un gran alivio. No tener que viajar en el tráfico me ahorró casi dos horas al día. Sin embargo, con el paso de los meses, empecé a sentirme muy aislado. La línea entre mi vida personal y el trabajo desapareció por completo. A veces me encontraba respondiendo correos a las 11 de la noche solo porque la computadora estaba ahí en la sala. Creo que la productividad aumentó, pero la salud mental definitivamente empeoró."
}];

const defaultCodes = [
  { id: 1, name: 'Aislamiento social', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 2, name: 'Ahorro de tiempo', color: 'bg-green-100 text-green-800 border-green-200' }
];

// ============================================================================
// COMPONENTE FLOTANTE: TUTORIAL (Onboarding)
// ============================================================================
const TutorialPopup = ({ step, totalSteps, title, content, onNext, onPrev, onClose, positionClass, theme }) => {
  return (
    <div className={`fixed z-50 ${positionClass} w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up`}>
      <div className={`${theme.gradient} p-4 text-white flex justify-between items-start`}>
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          {title}
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-5 text-gray-700 text-sm leading-relaxed">
        {content}
      </div>
      <div className="px-5 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-100">
        <span className="text-xs font-medium text-gray-400">Paso {step} de {totalSteps}</span>
        <div className="flex gap-2">
          {step > 1 && (
            <button onClick={onPrev} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <button onClick={onNext} className={`flex items-center gap-1 px-3 py-1.5 ${theme.bg} text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors`}>
            {step === totalSteps ? 'Finalizar' : 'Siguiente'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE SECUNDARIO: EL EDITOR DEL PROYECTO
// ============================================================================
function ProjectEditor({ project, onBack, onUpdateProject, theme }) {
  const [documents, setDocuments] = useState(project.documents || []);
  const [activeDocId, setActiveDocId] = useState(project.documents?.[0]?.id || null);
  const [codes, setCodes] = useState(project.codes || []);
  const [quotes, setQuotes] = useState(project.quotes || []);
  
  const [newCodeName, setNewCodeName] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [hoveredQuoteId, setHoveredQuoteId] = useState(null);
  const [editingCodeId, setEditingCodeId] = useState(null);
  const [editCodeName, setEditCodeName] = useState('');
  const [autoCodeSearch, setAutoCodeSearch] = useState('');
  const [autoCodeTargetId, setAutoCodeTargetId] = useState('');
  
  const [tutorialStep, setTutorialStep] = useState(0);

  const textContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200', 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    'bg-pink-100 text-pink-800 border-pink-200', 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-teal-100 text-teal-800 border-teal-200', 'bg-orange-100 text-orange-800 border-orange-200'
  ];

  const activeDocument = documents.find(d => d.id === activeDocId);

  useEffect(() => {
    onUpdateProject(project.id, { documents, codes, quotes, lastModified: new Date().toISOString() });
  }, [documents, codes, quotes]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
    } else {
      setSelectedText('');
    }
  };

  const handleAddCode = (e) => {
    e.preventDefault();
    if (!newCodeName.trim()) return;
    const newCode = { id: Date.now(), name: newCodeName.trim(), color: colors[codes.length % colors.length] };
    setCodes([...codes, newCode]);
    setNewCodeName('');
  };

  const handleSaveEditCode = (id) => {
    if (editCodeName.trim()) { setCodes(codes.map(c => c.id === id ? { ...c, name: editCodeName.trim() } : c)); }
    setEditingCodeId(null);
  };

  const handleCodeClick = (code) => {
    if (editingCodeId === code.id) return;
    if (selectedText) {
      const newQuote = { id: Date.now(), docId: activeDocId, text: selectedText, codeId: code.id, timestamp: new Date().toLocaleTimeString(), memo: '' };
      setQuotes([newQuote, ...quotes]);
      setSelectedText('');
      window.getSelection().removeAllRanges();
    } else {
      setActiveFilter(activeFilter === code.id ? null : code.id);
    }
  };

  const handleDeleteQuote = (id) => setQuotes(quotes.filter(q => q.id !== id));

  const handleAutoCode = (e) => {
    e.preventDefault();
    if (!autoCodeSearch.trim() || !autoCodeTargetId || !activeDocument) return;
    const regex = new RegExp(autoCodeSearch, 'gi');
    const matches = [...activeDocument.content.matchAll(regex)];
    if (matches.length === 0) return alert(`No se encontró "${autoCodeSearch}".`);
    const newQuotes = matches.map((match, index) => ({
      id: Date.now() + index, docId: activeDocId, text: match[0], codeId: Number(autoCodeTargetId), timestamp: new Date().toLocaleTimeString(), memo: 'Autocodificado'
    }));
    setQuotes([...newQuotes, ...quotes]);
    setAutoCodeSearch('');
    alert(`Se codificaron ${matches.length} coincidencias automáticamente.`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type === "text/plain" || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newDoc = { id: Date.now(), title: file.name, content: event.target.result };
        setDocuments([...documents, newDoc]);
        setActiveDocId(newDoc.id);
      };
      reader.readAsText(file);
    } else {
      alert("Por favor sube archivos .txt por ahora.");
    }
    e.target.value = null;
  };

  const renderDocumentContent = () => {
    if (!activeDocument) return "";
    let content = activeDocument.content;
    if (hoveredQuoteId) {
      const quoteToHighlight = quotes.find(q => q.id === hoveredQuoteId);
      if (quoteToHighlight && quoteToHighlight.docId === activeDocId) {
        const parts = content.split(quoteToHighlight.text);
        if (parts.length > 1) {
          const codeColorClass = codes.find(c => c.id === quoteToHighlight.codeId)?.color || 'bg-yellow-200';
          return (
            <>{parts.map((part, index) => (
              <React.Fragment key={index}>
                {part}
                {index < parts.length - 1 && <mark className={`${codeColorClass} bg-opacity-50 rounded shadow-sm px-1 transition-all duration-300`}>{quoteToHighlight.text}</mark>}
              </React.Fragment>
            ))}</>
          );
        }
      }
    }
    return content;
  };

  const filteredQuotes = activeFilter ? quotes.filter(q => q.codeId === activeFilter) : quotes;

  const editorTutorialSteps = [
    { title: "El Entorno de Trabajo", content: "Bienvenido al Editor. Aquí es donde analizarás tus textos. Vamos a dar un rápido recorrido.", pos: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" },
    { title: "Panel de Códigos", content: "A la izquierda tienes tus Códigos (o etiquetas). Úsalos para categorizar temas importantes en tu texto. Puedes crear nuevos o hacerles clic derecho para renombrarlos.", pos: "top-1/3 left-80" },
    { title: "Documento Principal", content: "En el centro está tu documento. Selecciona cualquier parte del texto con el ratón. Luego, haz clic en un código a la izquierda para extraer esa cita.", pos: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" },
    { title: "Autocodificación", content: "Arriba del documento está la herramienta 'Rayo'. Busca una palabra específica y LalibreINV la encontrará y codificará automáticamente en todo el texto.", pos: "top-40 left-1/2 transform -translate-x-1/2" },
    { title: "Citas y Análisis", content: "A la derecha se guardarán todas las citas que extraigas. Aquí puedes escribir 'Memos' o notas analíticas debajo de cada una para tu investigación.", pos: "top-1/3 right-80" }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {tutorialStep > 0 && tutorialStep <= editorTutorialSteps.length && (
        <TutorialPopup 
          step={tutorialStep} 
          totalSteps={editorTutorialSteps.length}
          title={editorTutorialSteps[tutorialStep-1].title}
          content={editorTutorialSteps[tutorialStep-1].content}
          positionClass={editorTutorialSteps[tutorialStep-1].pos}
          theme={theme}
          onNext={() => setTutorialStep(tutorialStep === editorTutorialSteps.length ? 0 : tutorialStep + 1)}
          onPrev={() => setTutorialStep(tutorialStep - 1)}
          onClose={() => setTutorialStep(0)}
        />
      )}

      {/* PANEL IZQUIERDO */}
      <div className="w-[300px] bg-white border-r border-gray-200 flex flex-col shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-10">
        <div className={`p-4 ${theme.gradient} text-white flex items-center justify-between`}>
          <button onClick={onBack} className="flex items-center gap-2 hover:bg-white/20 px-2 py-1 rounded transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <button onClick={() => setTutorialStep(1)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors" title="Ayuda y Tutorial">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Tag className={`w-5 h-5 ${theme.text}`} />
            <h2 className="font-semibold text-gray-800">Códigos</h2>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <form onSubmit={handleAddCode} className="flex gap-2">
            <input type="text" value={newCodeName} onChange={(e) => setNewCodeName(e.target.value)} placeholder="Añadir código..." className={`flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${theme.ring}`}/>
            <button type="submit" className={`${theme.bg} text-white p-2 rounded-lg ${theme.hoverBg} transition-colors shadow-sm`}><Plus className="w-5 h-5" /></button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {codes.map(code => {
            const count = quotes.filter(q => q.codeId === code.id).length;
            const isEditing = editingCodeId === code.id;
            return (
              <div key={code.id} className={`flex justify-between items-center p-2.5 rounded-xl border transition-all duration-200 ${activeFilter === code.id ? `ring-2 ${theme.ring} shadow-md` : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'} ${code.color} ${!isEditing ? 'cursor-pointer' : ''}`} onClick={() => !isEditing && handleCodeClick(code)}>
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2 mr-2">
                    <input autoFocus type="text" value={editCodeName} onChange={(e) => setEditCodeName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveEditCode(code.id)} className={`flex-1 px-2 py-1 text-sm border-b ${theme.borderFocus} bg-transparent focus:outline-none`}/>
                    <button onClick={(e) => { e.stopPropagation(); handleSaveEditCode(code.id); }} className={`${theme.text} hover:opacity-70`}><Check className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <span className="font-medium text-sm flex items-center gap-2 group">
                    {activeFilter === code.id && <Filter className="w-3 h-3" />} {code.name}
                    <button onClick={(e) => { e.stopPropagation(); setEditingCodeId(code.id); setEditCodeName(code.name); }} className="opacity-0 group-hover:opacity-100 ml-1 text-gray-500 hover:text-gray-800" title="Renombrar"><Edit2 className="w-3 h-3" /></button>
                  </span>
                )}
                {!isEditing && <span className="bg-white/60 px-2 py-0.5 rounded-full text-xs font-bold border border-white/40">{count}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL CENTRAL */}
      <div className="flex-1 flex flex-col relative">
        <div className="px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <FileText className={`w-6 h-6 ${theme.text}`} />
            <select value={activeDocId || ''} onChange={(e) => setActiveDocId(Number(e.target.value))} className="text-lg font-bold text-gray-800 bg-transparent border-none focus:outline-none cursor-pointer max-w-[300px] truncate hover:text-gray-600 transition-colors">
              {documents.length === 0 && <option value="">Sin documentos</option>}
              {documents.map(doc => <option key={doc.id} value={doc.id}>{doc.title}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="file" accept=".txt,.pdf,.doc,.docx,.epub" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-gray-200 shadow-sm">
              <Upload className="w-4 h-4" /> Cargar Texto
            </button>
          </div>
        </div>

        <div className={`${theme.lightBg} border-b ${theme.border} p-3 flex items-center justify-center gap-3 shadow-inner transition-colors duration-300`}>
          <Zap className={`w-4 h-4 ${theme.text}`} />
          <span className={`text-sm font-semibold ${theme.text}`}>Autocodificación rápida:</span>
          <form onSubmit={handleAutoCode} className="flex gap-2 items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2 text-gray-400" />
              <input type="text" placeholder="Buscar palabra..." value={autoCodeSearch} onChange={(e) => setAutoCodeSearch(e.target.value)} className={`pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent ${theme.ring} w-48 shadow-sm`}/>
            </div>
            <span className="text-gray-500 text-sm font-medium">asignar a ➔</span>
            <select value={autoCodeTargetId} onChange={(e) => setAutoCodeTargetId(e.target.value)} className={`px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 ${theme.ring} shadow-sm`}>
              <option value="">-- Seleccionar Código --</option>
              {codes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="submit" disabled={!autoCodeSearch || !autoCodeTargetId} className={`${theme.bg} text-white px-4 py-1.5 rounded-lg text-sm font-medium ${theme.hoverBg} disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-sm`}>Aplicar</button>
          </form>
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
          {selectedText && <div className="mb-6 text-sm bg-indigo-50 text-indigo-800 px-4 py-3 rounded-xl shadow-md flex items-center justify-center border border-indigo-100 max-w-4xl mx-auto transform hover:scale-[1.01] transition-transform">✨ Texto seleccionado. Haz clic en un código a la izquierda para asignarlo.</div>}
          <div ref={textContainerRef} onMouseUp={handleMouseUp} className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 max-w-4xl mx-auto text-gray-800 leading-loose text-lg whitespace-pre-wrap selection:bg-blue-200 selection:text-blue-900 font-serif min-h-[60vh]">
            {documents.length > 0 ? renderDocumentContent() : <div className="text-center text-gray-400 mt-20 font-sans flex flex-col items-center"><FileText className="w-16 h-16 mb-4 opacity-20" />Sube un archivo .txt para comenzar a investigar</div>}
          </div>
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="w-[350px] bg-white border-l border-gray-200 flex flex-col shadow-[-2px_0_10px_rgba(0,0,0,0.02)] z-10">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className={`w-5 h-5 ${theme.text}`} />
            <h2 className="font-semibold text-gray-800">Citas Extraídas <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-1">{filteredQuotes.length}</span></h2>
          </div>
          {activeFilter && <button onClick={() => setActiveFilter(null)} className={`text-xs font-medium ${theme.text} hover:underline bg-white px-2 py-1 rounded border ${theme.border}`}><X className="w-3 h-3 inline" /> Filtro</button>}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {filteredQuotes.length === 0 ? (
            <div className="text-center text-gray-400 text-sm mt-10 p-6 border-2 border-dashed border-gray-200 rounded-xl">No hay citas registradas aún.</div>
          ) : (
            filteredQuotes.map(quote => {
              const code = codes.find(c => c.id === quote.codeId);
              return (
                <div key={quote.id} onMouseEnter={() => setHoveredQuoteId(quote.id)} onMouseLeave={() => setHoveredQuoteId(null)} className={`bg-white p-4 rounded-xl shadow-sm border flex flex-col gap-3 transition-all duration-300 ${hoveredQuoteId === quote.id ? `${theme.borderFocus} shadow-md -translate-y-0.5` : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${code?.color}`}>{code?.name}</span>
                    <button onClick={() => handleDeleteQuote(quote.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <p className="text-sm text-gray-700 italic border-l-4 border-gray-200 pl-3 leading-relaxed">"{quote.text}"</p>
                  <div className="mt-1 pt-3 border-t border-gray-50">
                    {editingMemoId === quote.id ? (
                      <textarea autoFocus defaultValue={quote.memo} onBlur={(e) => { setQuotes(quotes.map(q => q.id === quote.id ? { ...q, memo: e.target.value } : q)); setEditingMemoId(null); }} className={`w-full text-sm p-3 border ${theme.borderFocus} rounded-lg ${theme.lightBg} focus:outline-none focus:ring-2 focus:ring-opacity-50 ${theme.ring} shadow-inner`} placeholder="Escribe tu análisis cualitativo..." rows={3}/>
                    ) : (
                      <div onClick={() => setEditingMemoId(quote.id)} className={`text-sm p-3 rounded-lg cursor-pointer flex gap-2 items-start transition-all ${quote.memo ? 'bg-amber-50/50 border border-amber-100 text-gray-800' : 'text-gray-400 border border-transparent hover:bg-gray-50 hover:border-gray-100'}`}>
                        <MessageSquare className={`w-4 h-4 mt-0.5 shrink-0 ${quote.memo ? 'text-amber-500' : ''}`} />
                        <span className={quote.memo ? '' : 'italic'}>{quote.memo || "Añadir memo analítico..."}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL: DASHBOARD DE PROYECTOS
// ============================================================================
export default function App() {
  const [view, setView] = useState('dashboard');
  const [activeProjectId, setActiveProjectId] = useState(null);
  
  // NUEVO: Detectar si estamos en Electron (Escritorio .exe) o en Navegador (Web/PWA)
  const isElectron = typeof window !== 'undefined' && window.navigator && /electron/i.test(window.navigator.userAgent.toLowerCase());
  
  // NUEVO: Autoguardado del Tema en localStorage
  const [activeThemeName, setActiveThemeName] = useState(() => {
    return localStorage.getItem('lalibreinv_theme') || 'blue';
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [iconModalProjectId, setIconModalProjectId] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // NUEVO: Estado para la advertencia de guardado de datos
  const [isDataWarningOpen, setIsDataWarningOpen] = useState(() => {
    return !localStorage.getItem('lalibreinv_data_warning_seen');
  });

  const handleCloseDataWarning = () => {
    localStorage.setItem('lalibreinv_data_warning_seen', 'true');
    setIsDataWarningOpen(false);
  };

  // NUEVO: Autoguardado de Proyectos en localStorage
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('lalibreinv_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error al cargar proyectos guardados:", e);
      }
    }
    // Si no hay nada guardado, carga el proyecto por defecto
    return [{
      id: 1,
      name: "Investigación_Teletrabajo_2026",
      lastModified: new Date().toISOString(),
      icon: { type: 'preset', value: 'Briefcase' },
      documents: defaultDocuments,
      codes: defaultCodes,
      quotes: []
    }];
  });

  // Guardar en localStorage cada vez que cambien los proyectos
  useEffect(() => {
    localStorage.setItem('lalibreinv_projects', JSON.stringify(projects));
  }, [projects]);

  // Guardar en localStorage el tema elegido
  useEffect(() => {
    localStorage.setItem('lalibreinv_theme', activeThemeName);
  }, [activeThemeName]);

  useEffect(() => {
    if (isElectron) return; // No escuchar eventos de PWA en la versión .exe

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); 
      setDeferredPrompt(e); 
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isElectron]);

  const handleInstallClick = async () => {
    if (isElectron) return; // Por seguridad

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };
  
  const [editingProjectNameId, setEditingProjectNameId] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [tutorialStep, setTutorialStep] = useState(0);

  const iconFileInputRef = useRef(null);
  const dashboardFileInputRef = useRef(null);

  const theme = THEMES[activeThemeName] || THEMES.blue;

  const handleCreateProject = () => {
    const newProject = { id: Date.now(), name: `Nuevo Proyecto ${projects.length + 1}`, lastModified: new Date().toISOString(), icon: { type: 'preset', value: 'FolderOpen' }, documents: [], codes: [], quotes: [] };
    setProjects([newProject, ...projects]);
  };

  const handleOpenProject = (id) => { setActiveProjectId(id); setView('editor'); };
  
  const handleDeleteProject = (id, name) => {
    if (window.confirm(`¿Eliminar el proyecto "${name}" permanentemente?`)) setProjects(projects.filter(p => p.id !== id));
  };

  const handleUpdateProjectName = (id) => {
    if (newProjectName.trim()) setProjects(projects.map(p => p.id === id ? { ...p, name: newProjectName.trim() } : p));
    setEditingProjectNameId(null);
  };

  const handleUpdateProjectIcon = (projectId, newIconConfig) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, icon: newIconConfig } : p));
    setIconModalProjectId(null);
  };

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'image/png') {
      const reader = new FileReader();
      reader.onload = (event) => handleUpdateProjectIcon(iconModalProjectId, { type: 'custom', value: event.target.result });
      reader.readAsDataURL(file);
    } else alert("Por favor sube un archivo con formato .PNG válido.");
    e.target.value = null;
  };

  const handleExportProject = async (project) => {
    try {
      // 1. Intentar usar la API moderna de acceso a archivos (Nativo en Chrome/Edge/Escritorio)
      if (window.showSaveFilePicker) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `${project.name.replace(/\s+/g, '_')}.json`,
          types: [{
            description: 'Archivo de Proyecto LalibreINV',
            accept: { 'application/json': ['.json'] },
          }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(project, null, 2));
        await writable.close();
        return; // El usuario eligió dónde guardar y se guardó exitosamente
      }
    } catch (error) {
      if (error.name === 'AbortError') return; // El usuario cerró la ventana de guardar
      console.error("Error al usar guardado nativo:", error);
    }

    // 2. Método de respaldo (Descarga clásica si usan Safari viejo o Firefox)
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const link = document.createElement('a'); link.setAttribute("href", dataStr); link.setAttribute("download", `${project.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(link); link.click(); link.remove();
  };

  const handleImportProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!importedData.documents || !importedData.codes) throw new Error("Inválido");
        const newProject = { ...importedData, id: Date.now(), name: `${importedData.name || 'Importado'} (Copia)`, lastModified: new Date().toISOString(), icon: importedData.icon || { type: 'preset', value: 'FolderOpen' } };
        setProjects([newProject, ...projects]);
      } catch (err) { alert("Error al importar: Archivo no compatible."); }
    };
    reader.readAsText(file); e.target.value = null; 
  };

  const handleUpdateProjectData = (id, newData) => setProjects(prev => prev.map(p => p.id === id ? { ...p, ...newData } : p));

  const renderProjectIcon = (project) => {
    if (project.icon?.type === 'custom') return <img src={project.icon.value} alt="Ícono" className="w-10 h-10 rounded-lg object-cover shadow-sm" />;
    const IconComponent = PRESET_ICONS[project.icon?.value] || FolderOpen;
    return <IconComponent className={`w-10 h-10 ${theme.text}`} />;
  };

  const dashboardTutorialSteps = [
    { title: "¡Bienvenido a LalibreINV!", content: "Esta es tu herramienta de análisis cualitativo de código abierto. Este tutorial te mostrará cómo moverte por el Panel de Control (Dashboard).", pos: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" },
    { title: "Crear e Importar", content: "Arriba a la derecha encontrarás botones para crear un 'Nuevo Proyecto' desde cero, o 'Importar' un archivo JSON que te haya compartido un colega.", pos: "top-20 right-8" },
    { title: "Personalización", content: "También puedes hacer clic en el ícono del Engranaje (⚙️) para cambiar el color de toda la aplicación.", pos: "top-20 right-80" },
    { title: "Gestión de Proyectos", content: "Aquí abajo aparecen tus proyectos. Si pasas el ratón sobre ellos, podrás cambiar su ícono, renombrarlos, exportarlos o abrirlos para comenzar a trabajar. ¡Abre un proyecto y haz clic en 'Ayuda' adentro para continuar!", pos: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" }
  ];

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans relative selection:bg-blue-200">
        
        {/* Modal de Tutorial de Instalación (Onboarding tipo App) */}
        {isInstallModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
             <div className="bg-white rounded-3xl shadow-2xl w-[850px] max-w-full overflow-hidden flex flex-col transform transition-all">
                
                {/* Banner Superior */}
                <div className={`${theme.gradient} text-white p-8 text-center relative`}>
                   <button onClick={() => setIsInstallModalOpen(false)} className="absolute top-4 right-4 bg-black/20 p-2 rounded-full hover:bg-black/40 transition-colors">
                      <X className="w-5 h-5"/>
                   </button>
                   <MonitorDown className="w-14 h-14 mx-auto mb-4 text-white/90 drop-shadow-md" />
                   <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Instala LalibreINV en tu Computadora</h2>
                   <p className="text-white/80 font-medium">No necesitas buscar en tiendas. Trabaja 100% offline siguiendo estos 3 pasos.</p>
                </div>
                
                {/* Columnas de Instrucciones */}
                <div className="grid md:grid-cols-2 gap-0 bg-white">
                   
                   {/* Columna Windows / Chrome */}
                   <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100">
                      <div className="flex items-center gap-3 mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                         <div className="bg-white p-2.5 rounded-xl shadow-sm text-blue-600">
                            <MonitorDown className="w-6 h-6"/>
                         </div>
                         <div>
                            <h3 className="font-bold text-gray-800 text-lg">Para Windows / Linux</h3>
                            <p className="text-sm text-gray-500">Usando Google Chrome o Edge</p>
                         </div>
                      </div>
                      <ul className="space-y-6">
                         <li className="flex gap-4 items-start">
                            <span className="w-7 h-7 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">1</span>
                            <div>
                               <h4 className="font-bold text-gray-800">Abre el navegador</h4>
                               <p className="text-sm text-gray-500 mt-1">Asegúrate de haber abierto este enlace desde Google Chrome o Microsoft Edge.</p>
                            </div>
                         </li>
                         <li className="flex gap-4 items-start">
                            <span className="w-7 h-7 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">2</span>
                            <div>
                               <h4 className="font-bold text-gray-800">Toca "Instalar" en la barra</h4>
                               <p className="text-sm text-gray-500 mt-1">En la barra de direcciones (arriba a la derecha, cerca de tus extensiones), busca un ícono de un <b>monitor con una flecha</b>.</p>
                            </div>
                         </li>
                         <li className="flex gap-4 items-start">
                            <span className="w-7 h-7 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">3</span>
                            <div>
                               <h4 className="font-bold text-gray-800">Confirmar Instalación</h4>
                               <p className="text-sm text-gray-500 mt-1">Haz clic en "Instalar". ¡Listo! La app se abrirá en su propia ventana y aparecerá en tu escritorio.</p>
                            </div>
                         </li>
                      </ul>
                   </div>

                   {/* Columna Mac / Safari */}
                   <div className="p-8">
                      <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                         <div className="bg-white p-2.5 rounded-xl shadow-sm text-slate-700">
                            <Apple className="w-6 h-6"/>
                         </div>
                         <div>
                            <h3 className="font-bold text-gray-800 text-lg">Para Mac</h3>
                            <p className="text-sm text-gray-500">Usando Safari (Nativo)</p>
                         </div>
                      </div>
                      <ul className="space-y-6">
                         <li className="flex gap-4 items-start">
                            <span className="w-7 h-7 shrink-0 bg-slate-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">1</span>
                            <div>
                               <h4 className="font-bold text-gray-800">Abre el enlace en Safari</h4>
                               <p className="text-sm text-gray-500 mt-1">Debes usar el navegador nativo Safari (la brújula). Si usas Chrome en Mac, sigue los pasos de Windows.</p>
                            </div>
                         </li>
                         <li className="flex gap-4 items-start">
                            <span className="w-7 h-7 shrink-0 bg-slate-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">2</span>
                            <div>
                               <h4 className="font-bold text-gray-800">Toca Compartir</h4>
                               <p className="text-sm text-gray-500 mt-1">Haz clic en el ícono de compartir (un cuadrito con una flecha hacia arriba) en la barra superior.</p>
                            </div>
                         </li>
                         <li className="flex gap-4 items-start">
                            <span className="w-7 h-7 shrink-0 bg-slate-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">3</span>
                            <div>
                               <h4 className="font-bold text-gray-800">Agregar al Dock</h4>
                               <p className="text-sm text-gray-500 mt-1">Desliza en el menú, selecciona "Agregar al Dock" y confirma. ¡La app aparecerá en tu Mac!</p>
                            </div>
                         </li>
                      </ul>
                   </div>
                </div>
                
                <div className="bg-slate-800 text-slate-300 text-sm font-medium text-center py-4 border-t border-slate-700">
                   Al instalarla, LalibreINV funcionará exactamente como un software descargable y sin internet.
                </div>
             </div>
          </div>
        )}

        {/* NUEVO: Modal de Advertencia de Datos (Onboarding de Privacidad) */}
        {isDataWarningOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-[600px] max-w-full overflow-hidden flex flex-col transform transition-all">
              <div className="bg-amber-500 text-white p-6 flex items-center gap-4 relative">
                <button onClick={handleCloseDataWarning} className="absolute top-4 right-4 bg-black/10 p-2 rounded-full hover:bg-black/20 transition-colors">
                  <X className="w-5 h-5"/>
                </button>
                <div className="bg-white/20 p-3 rounded-2xl">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">¡Atención con tus Datos!</h2>
                  <p className="text-amber-50 font-medium">Cómo funciona el guardado en la versión web</p>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600 shrink-0">
                      <LayoutGrid className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">Autoguardado en el Navegador (Local)</h4>
                      <p className="text-gray-600 mt-1 leading-relaxed">Tus proyectos se guardan automáticamente en la <b>memoria interna de este navegador</b>. Esto significa que tu investigación está segura, es privada, y no viaja a internet.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="bg-red-100 p-3 rounded-xl text-red-600 shrink-0">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-red-700">El Peligro de Pérdida</h4>
                      <p className="text-gray-600 mt-1 leading-relaxed">Si limpias el caché/historial de tu navegador, usas el "Modo Incógnito", o cambias de computadora, <b>perderás todos tus proyectos permanentemente</b>.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="bg-green-100 p-3 rounded-xl text-green-600 shrink-0">
                      <HardDrive className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-green-700">La Solución: Exportar</h4>
                      <p className="text-gray-600 mt-1 leading-relaxed">Al terminar tu día de trabajo, usa el botón de <b>Exportar</b> (<Download className="w-4 h-4 inline text-gray-500"/>) en tus proyectos. Esto te permitirá guardar un archivo <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-gray-600 font-mono">.json</code> en tu PC o Google Drive para nunca perder nada.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start border-t border-gray-100 pt-6 mt-2">
                    <div className="bg-slate-800 p-3 rounded-xl text-white shrink-0 shadow-md">
                      <Github className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">Recomendación: Versión de Escritorio</h4>
                      <p className="text-gray-600 mt-1 leading-relaxed">Para una experiencia 100% segura, con autoguardado en tus propias carpetas locales y mayor rendimiento, te recomendamos <b>descargar el instalador (.exe)</b> gratuito.</p>
                      <a href="https://github.com/tu-usuario/lalibre-inv-web/releases" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                        Descargar desde GitHub <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={handleCloseDataWarning} className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md">
                  Entendido, mantendré mis datos seguros
                </button>
              </div>
            </div>
          </div>
        )}

        {tutorialStep > 0 && tutorialStep <= dashboardTutorialSteps.length && (
          <TutorialPopup 
            step={tutorialStep} 
            totalSteps={dashboardTutorialSteps.length}
            title={dashboardTutorialSteps[tutorialStep-1].title}
            content={dashboardTutorialSteps[tutorialStep-1].content}
            positionClass={dashboardTutorialSteps[tutorialStep-1].pos}
            theme={theme}
            onNext={() => setTutorialStep(tutorialStep === dashboardTutorialSteps.length ? 0 : tutorialStep + 1)}
            onPrev={() => setTutorialStep(tutorialStep - 1)}
            onClose={() => setTutorialStep(0)}
          />
        )}

        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] max-w-full">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Settings className={`w-6 h-6 ${theme.text}`} /> Ajustes del Tema
                </h2>
                <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-800 bg-gray-100 p-1.5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-600 mb-4">Color de acento de la interfaz:</p>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(THEMES).map((t) => (
                    <button key={t.id} onClick={() => setActiveThemeName(t.id)} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${activeThemeName === t.id ? `border-gray-800 bg-gray-50 shadow-md transform scale-105` : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-full shadow-inner mb-2 bg-gradient-to-br from-white/20 to-black/20`} style={{ backgroundColor: t.colorCode }}></div>
                      <span className="text-xs font-semibold text-gray-700">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className={`w-full py-3 ${theme.bg} text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md`}>Guardar Cambios</button>
            </div>
          </div>
        )}

        {iconModalProjectId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[450px] max-w-full">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ImagePlus className={`w-6 h-6 ${theme.text}`} /> Cambiar Ícono
                </h2>
                <button onClick={() => setIconModalProjectId(null)} className="text-gray-400 hover:text-gray-800 bg-gray-100 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-600 mb-3">Galería integrada:</p>
                <div className="grid grid-cols-4 gap-3">
                  {Object.keys(PRESET_ICONS).map((iconKey) => {
                    const IconComp = PRESET_ICONS[iconKey];
                    return (
                      <button key={iconKey} onClick={() => handleUpdateProjectIcon(iconModalProjectId, { type: 'preset', value: iconKey })} className={`flex items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-xl hover:${theme.bg} hover:border-transparent group transition-all duration-200 hover:shadow-md`}>
                        <IconComp className={`w-7 h-7 text-gray-600 group-hover:text-white transition-colors`} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-gray-100 pt-5">
                <p className="text-sm font-medium text-gray-600 mb-3">Subir imagen personalizada:</p>
                <input type="file" accept="image/png" ref={iconFileInputRef} onChange={handleIconUpload} className="hidden" />
                <button onClick={() => iconFileInputRef.current.click()} className={`w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:${theme.borderFocus} hover:${theme.lightBg} hover:${theme.text} transition-all font-medium`}>
                  <Upload className="w-5 h-5" /> Seleccionar archivo .PNG
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER DASHBOARD */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/80 shadow-sm px-8 py-5 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <img 
              src="/LALIBRE.png" 
              alt="Logo LalibreINV" 
              className="w-14 h-14 object-contain drop-shadow-md transform transition-transform hover:scale-105" 
            />
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">LalibreINV <span className="text-gray-400 font-medium">Workspace</span></h1>
              <p className="text-sm font-medium text-gray-500">Gestor Avanzado de Investigación</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* NUEVO BOTÓN: Advertencia de Datos Permanente */}
            <button 
              onClick={() => setIsDataWarningOpen(true)} 
              className="p-2.5 text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200 shadow-sm" 
              title="Información importante sobre Guardado"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>

            {/* Mostrar botón de instalar SOLO si NO estamos en la versión .exe */}
            {!isElectron && (
              <button 
                onClick={handleInstallClick} 
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-md mr-2" 
                title="Instalar App en tu Computadora"
              >
                <MonitorDown className="w-5 h-5 text-green-400" /> Instalar App
              </button>
            )}
            
            <button onClick={() => setTutorialStep(1)} className="flex items-center gap-2 px-4 py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl font-semibold transition-colors" title="Iniciar Tutorial">
              <HelpCircle className="w-5 h-5" /> Tutorial
            </button>
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200" title="Ajustes">
              <Settings className="w-5 h-5" />
            </button>
            <input type="file" accept=".json" ref={dashboardFileInputRef} onChange={handleImportProject} className="hidden" />
            <button onClick={() => dashboardFileInputRef.current.click()} className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold border border-gray-200 shadow-sm hover:shadow">
              <Upload className="w-5 h-5" /> Importar
            </button>
            <button onClick={handleCreateProject} className={`flex items-center gap-2 px-5 py-2.5 ${theme.gradient} text-white rounded-xl hover:opacity-90 transition-opacity font-semibold shadow-md hover:shadow-lg`}>
              <FolderPlus className="w-5 h-5" /> Nuevo Proyecto
            </button>
          </div>
        </header>

        {/* MAIN DASHBOARD */}
        <main className="p-10 max-w-[1400px] mx-auto">
          {projects.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-200 border-dashed max-w-2xl mx-auto shadow-sm">
              <div className={`${theme.lightBg} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6`}>
                <FolderOpen className={`w-12 h-12 ${theme.text}`} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu espacio de trabajo está vacío</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Crea un proyecto nuevo o importa datos previos para comenzar a analizar tus documentos cualitativos.</p>
              <button onClick={handleCreateProject} className={`px-6 py-3 ${theme.gradient} text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all`}>Comenzar mi primer proyecto</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {projects.map(project => (
                <div key={project.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-5">
                      <button onClick={() => setIconModalProjectId(project.id)} className={`${theme.iconBg} p-3.5 rounded-xl relative overflow-hidden group-hover:shadow-md transition-all`}>
                        {renderProjectIcon(project)}
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                          <Pencil className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      </button>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleExportProject(project)} title="Exportar" className={`p-2 text-gray-400 hover:${theme.text} hover:${theme.lightBg} rounded-lg`}><Download className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteProject(project.id, project.name)} title="Eliminar" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    
                    {editingProjectNameId === project.id ? (
                      <div className="flex gap-2 mb-3">
                        <input autoFocus type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateProjectName(project.id)} className={`flex-1 px-3 py-1.5 text-sm font-semibold border-2 rounded-lg ${theme.borderFocus} focus:outline-none`}/>
                        <button onClick={() => handleUpdateProjectName(project.id)} className="bg-green-100 text-green-700 p-1.5 rounded-lg hover:bg-green-200"><Check className="w-5 h-5"/></button>
                      </div>
                    ) : (
                      <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-start gap-2 leading-tight">
                        <span className="truncate" title={project.name}>{project.name}</span>
                        <button onClick={() => { setEditingProjectNameId(project.id); setNewProjectName(project.name); }} className={`opacity-0 group-hover:opacity-100 shrink-0 text-gray-300 hover:${theme.text} transition-opacity pt-1`}><Pencil className="w-3.5 h-3.5" /></button>
                      </h3>
                    )}
                    
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mt-3">
                      <Clock className="w-3.5 h-3.5" /> Modificado: {new Date(project.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6">
                    <div className="flex gap-4 text-sm font-medium text-gray-600 bg-slate-50 px-4 py-3 rounded-xl border border-gray-100 mb-4">
                      <div className="flex items-center gap-1.5" title="Documentos"><FileText className="w-4 h-4 text-gray-400"/> {project.documents?.length || 0}</div>
                      <div className="flex items-center gap-1.5" title="Códigos"><Tag className="w-4 h-4 text-gray-400"/> {project.codes?.length || 0}</div>
                      <div className="flex items-center gap-1.5" title="Citas"><Quote className="w-4 h-4 text-gray-400"/> {project.quotes?.length || 0}</div>
                    </div>
                    <button onClick={() => handleOpenProject(project.id)} className={`w-full py-3 bg-white border border-gray-200 text-gray-800 font-bold rounded-xl hover:${theme.text} hover:border-transparent hover:shadow-md hover:${theme.lightBg} transition-all duration-300`}>
                      Abrir Proyecto
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  const activeProject = projects.find(p => p.id === activeProjectId);
  return (
    <ProjectEditor 
      key={activeProject.id}
      project={activeProject} 
      onBack={() => setView('dashboard')}
      onUpdateProject={handleUpdateProjectData}
      theme={theme}
    />
  );
}