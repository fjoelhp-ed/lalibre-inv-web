import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, Tag, FileText, Quote, Trash2, MessageSquare, Download, Filter, 
  X, Upload, FileSpreadsheet, FileJson, Edit2, Check, Search, Zap, 
  ArrowLeft, LayoutGrid, FolderPlus, FolderOpen, Pencil, Clock, 
  Settings, ImagePlus, Briefcase, Book, PieChart, Target, Star, Heart,
  HelpCircle, ChevronRight, ChevronLeft, Sparkles, MonitorDown, Apple,
  ShieldAlert, AlertTriangle, HardDrive, Library, ExternalLink, Highlighter,
  Video, Image as ImageIcon, AudioLines, Network, Cloud, BookOpen, FolderTree,
  Info, FileDown, GripVertical, Table2, MousePointerClick, Folder, Link as LinkIcon, Copy, FilePlus
} from 'lucide-react';

const ipc = window.require ? window.require('electron').ipcRenderer : null;

const THEMES = {
  blue: { id: 'blue', name: 'Azul Océano', colorCode: '#2563eb', bg: 'bg-blue-600', gradient: 'bg-gradient-to-br from-blue-600 to-indigo-700', hoverBg: 'hover:bg-blue-700', text: 'text-blue-600', lightBg: 'bg-blue-50', border: 'border-blue-200', borderFocus: 'border-blue-400', ring: 'ring-blue-500', iconBg: 'bg-blue-50' },
  emerald: { id: 'emerald', name: 'Esmeralda', colorCode: '#059669', bg: 'bg-emerald-600', gradient: 'bg-gradient-to-br from-emerald-500 to-teal-700', hoverBg: 'hover:bg-emerald-700', text: 'text-emerald-600', lightBg: 'bg-emerald-50', border: 'border-emerald-200', borderFocus: 'border-emerald-400', ring: 'ring-emerald-500', iconBg: 'bg-emerald-50' },
  slate: { id: 'slate', name: 'Grafito', colorCode: '#475569', bg: 'bg-slate-700', gradient: 'bg-gradient-to-br from-slate-600 to-slate-800', hoverBg: 'hover:bg-slate-800', text: 'text-slate-700', lightBg: 'bg-slate-50', border: 'border-slate-200', borderFocus: 'border-slate-400', ring: 'ring-slate-500', iconBg: 'bg-slate-100' }
};

const PRESET_ICONS = { FolderOpen, Briefcase, Book, FileText, PieChart, Target, Star, Heart };
const CODE_COLORS = ['bg-red-100 text-red-800 border-red-200', 'bg-blue-100 text-blue-800 border-blue-200', 'bg-green-100 text-green-800 border-green-200', 'bg-yellow-100 text-yellow-800 border-yellow-200', 'bg-purple-100 text-purple-800 border-purple-200', 'bg-pink-100 text-pink-800 border-pink-200', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'bg-teal-100 text-teal-800 border-teal-200'];

const defaultDocuments = [{ id: 1, title: "Entrevista_01.txt", content: "Entrevistador: ¿Cómo describirías tu experiencia trabajando desde casa?\n\nEntrevistado: Fue un alivio, pero luego empecé a sentirme aislado. La línea entre mi vida personal y el trabajo desapareció por completo." }];
const defaultCodes = [{ id: 1, name: 'Aislamiento', color: CODE_COLORS[0] }, { id: 2, name: 'Límites trabajo-vida', color: CODE_COLORS[1] }];

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("LalibreINV Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-100 p-10 font-sans">
          <div className="bg-white p-8 rounded-3xl max-w-2xl text-slate-800 border border-slate-200 shadow-2xl">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3 text-red-600"><AlertTriangle className="w-8 h-8" /> Error de Compatibilidad</h2>
            <p className="mb-4 text-slate-600 leading-relaxed">Parece que hubo un problema al cargar los datos de este proyecto. Esto suele ocurrir cuando se abre un proyecto antiguo que no tiene las nuevas funciones de la versión PRO.</p>
            <pre className="bg-slate-50 p-4 rounded-xl text-xs overflow-auto border border-slate-200 text-slate-500 mb-6">{this.state.error?.toString()}</pre>
            <button onClick={() => window.location.reload()} className="w-full bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-md">
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProjectEditor({ project, onBack, onUpdateProject, theme, isElectron }) {
  if (!project) return <div className="flex h-screen items-center justify-center font-bold text-slate-500">Cargando proyecto...</div>;

  const [activeTab, setActiveTab] = useState('textos'); 
  
  const [documents, setDocuments] = useState(() => Array.isArray(project.documents) ? project.documents : []);
  const [libraryFiles, setLibraryFiles] = useState(() => Array.isArray(project.libraryFiles) ? project.libraryFiles : []);
  const [codes, setCodes] = useState(() => Array.isArray(project.codes) ? project.codes : []);
  const [quotes, setQuotes] = useState(() => Array.isArray(project.quotes) ? project.quotes : []);
  
  // NUEVOS ESTADOS DE REFERENCIAS (Estilo Zotero)
  const [references, setReferences] = useState(() => Array.isArray(project.references) ? project.references : []);
  const [referenceGroups, setReferenceGroups] = useState(() => Array.isArray(project.referenceGroups) ? project.referenceGroups : [{id: 'mt', name: 'Marco Teórico'}, {id: 'mm', name: 'Marco Metodológico'}]);
  const [activeRefGroupId, setActiveRefGroupId] = useState('all');
  const [activeRefId, setActiveRefId] = useState(null);
  const [citationStyle, setCitationStyle] = useState('APA7');
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const [activeDocId, setActiveDocId] = useState(documents[0]?.id || null);
  const [activeFile, setActiveFile] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  
  const [isCreatingCode, setIsCreatingCode] = useState(false);
  const [newCodeName, setNewCodeName] = useState('');
  const [pdfQuoteCatcher, setPdfQuoteCatcher] = useState('');
  const [quoteSearchQuery, setQuoteSearchQuery] = useState('');

  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(340);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const txtInputRef = useRef(null);

  // AUTO-GUARDADO
  useEffect(() => {
    const projectData = { documents, codes, quotes, libraryFiles, references, referenceGroups, lastModified: new Date().toISOString() };
    onUpdateProject(project.id, projectData);
    
    if (isElectron && ipc && project.rootPath) {
      ipc.send('auto-save-project', { rootPath: project.rootPath, data: { ...project, ...projectData } });
    }
  }, [documents, codes, quotes, libraryFiles, references, referenceGroups]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingLeft) setLeftWidth(Math.max(200, Math.min(e.clientX - 80, 600))); 
      if (isResizingRight) setRightWidth(Math.max(250, Math.min(window.innerWidth - e.clientX, 800)));
    };
    const handleMouseUp = () => { setIsResizingLeft(false); setIsResizingRight(false); };
    
    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight]);

  const handleAddCode = (e) => {
    e.preventDefault();
    if (!newCodeName.trim()) return;
    const newCode = { id: Date.now(), name: newCodeName.trim(), color: CODE_COLORS[codes.length % CODE_COLORS.length] };
    setCodes([...codes, newCode]);
    setNewCodeName('');
    setIsCreatingCode(false);
  };

  const handleDeleteCode = (e, codeId) => {
    e.stopPropagation();
    const count = quotes.filter(q => q.codeId === codeId).length;
    const msg = count > 0 ? `Este código tiene ${count} citas vinculadas. ¿Estás absolutamente seguro de eliminarlo? Las citas también perderán su categoría.` : `¿Eliminar este código vacío?`;
    if (window.confirm(msg)) {
      setCodes(codes.filter(c => c.id !== codeId));
      setQuotes(quotes.filter(q => q.codeId !== codeId)); 
    }
  };

  const handleCodeClick = (code) => {
    const textToCode = pdfQuoteCatcher.trim() || selectedText;
    if (textToCode) {
      const sourceName = activeTab === 'biblioteca' && activeFile ? activeFile.name : (documents.find(d => d.id === activeDocId)?.title || 'Documento Texto');
      const newQuote = { id: Date.now(), docId: activeTab === 'textos' ? activeDocId : (activeFile ? activeFile.id : 'desconocido'), text: textToCode, codeId: code.id, sourceName: sourceName, timestamp: new Date().toLocaleTimeString(), memo: '' };
      setQuotes([newQuote, ...quotes]);
      setSelectedText('');
      setPdfQuoteCatcher('');
      window.getSelection().removeAllRanges();
    }
  };

  const handleDeleteQuote = (id) => {
    if(window.confirm("¿Eliminar esta cita de tus resultados?")) setQuotes(quotes.filter(q => q.id !== id));
  };

  const handleImportTXT = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newDoc = { id: Date.now() + Math.random(), title: file.name, content: event.target.result };
        setDocuments(prev => [...prev, newDoc]);
        setActiveDocId(newDoc.id);
      };
      reader.readAsText(file);
    });
    e.target.value = null;
  };

  const handleImportMultimedia = async () => {
    if (!ipc) return alert("La importación multimedia local solo está disponible en la versión de Escritorio.");
    if (!project.rootPath) return alert("Este proyecto no tiene una carpeta raíz asignada.");
    const result = await ipc.invoke('import-file-to-lib', { rootPath: project.rootPath });
    if (result) {
      setLibraryFiles([...libraryFiles, { id: Date.now(), name: result.fileName, path: result.fullPath, type: result.type, folder: result.targetFolder, addedAt: new Date().toISOString() }]);
    }
  };

  const openInExplorer = () => {
    if (ipc && project.rootPath) ipc.invoke('open-path', project.rootPath);
  };

  const handleExportReport = () => {
    let reportContent = `====================================================\n  REPORTE DE INVESTIGACIÓN CUALITATIVA - LALIBREINV\n====================================================\nProyecto: ${project.name}\nGenerado el: ${new Date().toLocaleString()}\n\n--- RESUMEN DE CÓDIGOS Y CITAS ---\n\n`;
    let hasQuotes = false;
    codes.forEach(code => {
      const codeQuotes = quotes.filter(q => q.codeId === code.id);
      if (codeQuotes.length > 0) {
        hasQuotes = true;
        reportContent += `[CÓDIGO: ${code.name.toUpperCase()}] (${codeQuotes.length} citas vinculadas)\n----------------------------------------------------\n`;
        codeQuotes.forEach(q => {
          reportContent += `> "${q.text}"\n  Fuente: ${q.sourceName || 'Desconocido'}\n`;
          if (q.memo) reportContent += `  Memo Analítico: ${q.memo}\n`;
          reportContent += `\n`;
        });
      }
    });
    if (!hasQuotes) reportContent += `No se encontraron citas codificadas en este proyecto.\n`;

    if (references.length > 0) {
      reportContent += `\n====================================================\n  BIBLIOGRAFÍA Y REFERENCIAS\n====================================================\n\n`;
      references.forEach(ref => {
        reportContent += `- ${generateCitationText(ref, 'APA7')}\n`;
      });
    }

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `Reporte_${project.name.replace(/\s+/g, '_')}.txt`; link.click();
  };

  const handleExportCSV = () => {
    let csv = "ID_Cita,Código,Documento_Origen,Cita_Extraída,Memo_Analítico,Fecha\n";
    quotes.forEach(q => {
      const codeName = codes.find(c => c.id === q.codeId)?.name || 'Desconocido';
      const safeQuote = `"${(q.text || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const safeMemo = `"${(q.memo || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const safeSource = `"${(q.sourceName || 'Desconocido').replace(/"/g, '""')}"`;
      csv += `${q.id},"${codeName}",${safeSource},${safeQuote},${safeMemo},"${q.timestamp}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `Matriz_Datos_${project.name.replace(/\s+/g, '_')}.csv`; link.click();
  };

  const generateWordCloud = useMemo(() => {
    if (quotes.length === 0 && documents.length === 0) return [];
    const textData = documents.map(d => d.content || "").join(" ") + " " + quotes.map(q => q.text || "").join(" ");
    const words = textData.toLowerCase().replace(/[.,!?;:()"]/g, '').split(/\s+/).filter(w => w.length > 4);
    const counts = {};
    words.forEach(w => counts[w] = (counts[w] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 50);
  }, [documents, quotes]);

  const networkNodesAndLinks = useMemo(() => {
    const nodes = codes.map((c, i) => {
      const angle = codes.length > 0 ? (i / codes.length) * 2 * Math.PI : 0;
      const radius = 120;
      return { ...c, x: 200 + radius * Math.cos(angle) || 200, y: 150 + radius * Math.sin(angle) || 150, count: quotes.filter(q => q.codeId === c.id).length };
    });
    const links = [];
    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        const docsC1 = new Set(quotes.filter(q => q.codeId === codes[i].id).map(q => q.docId));
        const docsC2 = new Set(quotes.filter(q => q.codeId === codes[j].id).map(q => q.docId));
        const commonDocs = [...docsC1].filter(x => docsC2.has(x)).length;
        if (commonDocs > 0) links.push({ source: nodes[i], target: nodes[j], value: commonDocs });
      }
    }
    return { nodes, links };
  }, [codes, quotes]);

  // ============================================================================
  // LÓGICA DEL GESTOR DE REFERENCIAS ESTILO ZOTERO
  // ============================================================================
  
  const handleAddRefGroup = (e) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      setReferenceGroups([...referenceGroups, { id: `grp_${Date.now()}`, name: newGroupName.trim() }]);
      setNewGroupName('');
      setIsCreatingGroup(false);
    }
  };

  const handleCreateReference = () => {
    const newRef = {
      id: Date.now(),
      groupId: activeRefGroupId === 'all' ? null : activeRefGroupId,
      linkedFileId: null,
      type: 'Artículo',
      title: 'Nueva Referencia',
      authors: [{ firstName: '', lastName: '' }],
      year: '', journal: '', volume: '', issue: '', pages: '', publisher: '', doi: '', url: ''
    };
    setReferences([newRef, ...references]);
    setActiveRefId(newRef.id);
  };

  const updateActiveRef = (field, value) => {
    setReferences(refs => refs.map(r => r.id === activeRefId ? { ...r, [field]: value } : r));
  };

  const updateActiveRefAuthor = (index, field, value) => {
    setReferences(refs => refs.map(r => {
      if (r.id === activeRefId) {
        const newAuthors = [...r.authors];
        newAuthors[index] = { ...newAuthors[index], [field]: value };
        return { ...r, authors: newAuthors };
      }
      return r;
    }));
  };

  const addAuthorToActiveRef = () => {
    setReferences(refs => refs.map(r => r.id === activeRefId ? { ...r, authors: [...r.authors, { firstName: '', lastName: '' }] } : r));
  };

  const removeAuthorFromActiveRef = (index) => {
    setReferences(refs => refs.map(r => {
      if (r.id === activeRefId) {
        const newAuthors = [...r.authors];
        newAuthors.splice(index, 1);
        return { ...r, authors: newAuthors };
      }
      return r;
    }));
  };

  const deleteReference = (id) => {
    if (window.confirm("¿Eliminar esta referencia?")) {
      setReferences(references.filter(r => r.id !== id));
      if (activeRefId === id) setActiveRefId(null);
    }
  };

  // Generador inteligente de citas
  const generateCitationText = (ref, style) => {
    if (!ref || !ref.title) return "Referencia incompleta.";
    
    // Formatear Autores
    let authorsText = "";
    const validAuthors = ref.authors.filter(a => a.lastName);
    
    if (validAuthors.length === 0) authorsText = "Sin Autor.";
    else if (style === 'APA7' || style === 'APA6') {
      authorsText = validAuthors.map(a => `${a.lastName}, ${a.firstName ? a.firstName.charAt(0) + '.' : ''}`).join(' & ');
    } else if (style === 'MLA') {
      if (validAuthors.length === 1) authorsText = `${validAuthors[0].lastName}, ${validAuthors[0].firstName}.`;
      else if (validAuthors.length === 2) authorsText = `${validAuthors[0].lastName}, ${validAuthors[0].firstName}, and ${validAuthors[1].firstName} ${validAuthors[1].lastName}.`;
      else authorsText = `${validAuthors[0].lastName}, ${validAuthors[0].firstName}, et al.`;
    } else if (style === 'Chicago') {
      authorsText = validAuthors.map(a => `${a.lastName}, ${a.firstName}`).join(', ');
    }

    const year = ref.year ? `(${ref.year})` : '(s.f.)';
    const title = ref.title;
    
    if (style === 'APA7' || style === 'APA6') {
      if (ref.type === 'Libro') return `${authorsText} ${year}. *${title}*. ${ref.publisher || ''}.`;
      if (ref.type === 'Artículo') return `${authorsText} ${year}. ${title}. *${ref.journal || ''}*, ${ref.volume || ''}${ref.issue ? `(${ref.issue})` : ''}, ${ref.pages || ''}. ${ref.doi || ref.url || ''}`;
      if (ref.type === 'Web') return `${authorsText} ${year}. ${title}. Recuperado de ${ref.url}`;
      return `${authorsText} ${year}. ${title}.`;
    } 
    
    if (style === 'MLA') {
      if (ref.type === 'Libro') return `${authorsText} *${title}*. ${ref.publisher || ''}, ${ref.year || ''}.`;
      if (ref.type === 'Artículo') return `${authorsText} "${title}." *${ref.journal || ''}* ${ref.volume || ''}.${ref.issue || ''} (${ref.year || ''}): ${ref.pages || ''}.`;
      return `${authorsText} "${title}."`;
    }

    return `${authorsText}. ${title}. ${year}.`; // Fallback genérico
  };

  const activeRef = references.find(r => r.id === activeRefId);
  const filteredReferences = references.filter(r => activeRefGroupId === 'all' || r.groupId === activeRefGroupId);

  const renderFileViewer = () => {
    if (!activeFile) return <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4"><LayoutGrid className="w-16 h-16 opacity-20" /><p className="font-medium">Selecciona un archivo multimedia para visualizarlo</p></div>;
    switch(activeFile.type) {
      case 'pdf': return <iframe src={activeFile.path} className="w-full h-full border-none bg-white" title="Visor PDF" />;
      case 'image': return <div className="flex-1 flex items-center justify-center p-8 bg-slate-200 overflow-auto"><img src={activeFile.path} alt="Visor Imagen" className="max-w-full max-h-full object-contain shadow-lg rounded" /></div>;
      case 'video': return <div className="flex-1 flex items-center justify-center bg-black p-4"><video src={activeFile.path} controls className="max-w-full max-h-full rounded-lg shadow-2xl" /></div>;
      case 'audio': return <div className="flex-1 flex items-center justify-center bg-slate-100 p-8"><div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center"><AudioLines className="w-16 h-16 mx-auto mb-6 text-slate-300" /><h3 className="font-bold text-slate-700 mb-4 truncate">{activeFile.name}</h3><audio src={activeFile.path} controls className="w-full" /></div></div>;
      default: return <div className="flex-1 flex items-center justify-center p-8"><iframe src={activeFile.path} className="w-full h-full border-none bg-white rounded-xl shadow" /></div>;
    }
  };

  const displayedQuotes = quotes.filter(q => q.text.toLowerCase().includes(quoteSearchQuery.toLowerCase()) || (q.memo && q.memo.toLowerCase().includes(quoteSearchQuery.toLowerCase())));

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden select-none">
      
      {/* SIDEBAR DE NAVEGACIÓN */}
      <div className="w-20 bg-slate-900 flex flex-col items-center py-6 gap-6 shadow-xl z-30 shrink-0">
        <button onClick={onBack} className="p-3 text-slate-400 hover:text-white transition-colors" title="Volver al Dashboard"><ArrowLeft /></button>
        <div className="h-px w-8 bg-slate-700"></div>
        <button onClick={() => setActiveTab('textos')} className={`p-4 rounded-2xl transition-all ${activeTab === 'textos' ? `${theme.bg} text-white shadow-lg` : 'text-slate-500 hover:bg-slate-800'}`} title="Textos TXT"><FileText className="w-6 h-6" /></button>
        <button onClick={() => setActiveTab('biblioteca')} className={`p-4 rounded-2xl transition-all ${activeTab === 'biblioteca' ? `${theme.bg} text-white shadow-lg` : 'text-slate-500 hover:bg-slate-800'}`} title="Multimedia y PDF"><Library className="w-6 h-6" /></button>
        <button onClick={() => setActiveTab('visualizaciones')} className={`p-4 rounded-2xl transition-all ${activeTab === 'visualizaciones' ? `${theme.bg} text-white shadow-lg` : 'text-slate-500 hover:bg-slate-800'}`} title="Visualizaciones y Exportación"><Network className="w-6 h-6" /></button>
        <button onClick={() => setActiveTab('referencias')} className={`p-4 rounded-2xl transition-all ${activeTab === 'referencias' ? `${theme.bg} text-white shadow-lg` : 'text-slate-500 hover:bg-slate-800'}`} title="Gestor de Referencias"><BookOpen className="w-6 h-6" /></button>
      </div>

      {/* PANELES DE TEXTOS Y BIBLIOTECA (Se mantienen igual) */}
      {(activeTab === 'textos' || activeTab === 'biblioteca') && (
        <div style={{ width: leftWidth }} className="bg-white border-r border-gray-200 flex flex-col z-10 shrink-0 relative">
          <div className={`p-5 ${theme.gradient} text-white flex justify-between items-center`}>
            <h2 className="font-bold flex items-center gap-2"><Tag className="w-4 h-4" /> Códigos</h2>
          </div>
          
          <div className="p-3 border-b border-gray-100">
            {isCreatingCode ? (
              <form onSubmit={handleAddCode} className="flex gap-2 animate-fade-in">
                <input autoFocus type="text" value={newCodeName} onChange={e => setNewCodeName(e.target.value)} placeholder="Nombre..." className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500" />
                <button type="submit" className={`${theme.bg} text-white px-2 rounded`}><Check className="w-4 h-4"/></button>
                <button type="button" onClick={() => setIsCreatingCode(false)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4"/></button>
              </form>
            ) : (
              <button onClick={() => setIsCreatingCode(true)} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 text-xs font-bold hover:border-gray-500 hover:bg-gray-50 transition-all flex justify-center items-center gap-1">
                <Plus className="w-3 h-3" /> Crear Código
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 select-text">
            {codes.map(code => (
              <div key={code.id} onClick={() => handleCodeClick(code)} className={`p-2.5 rounded-xl border border-gray-100 ${code.color} cursor-pointer hover:shadow-md transition-all flex justify-between items-center group`}>
                <span className="text-sm font-semibold truncate pr-2">{code.name}</span>
                <div className="flex items-center gap-2">
                  <span className="bg-white/50 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{quotes.filter(q => q.codeId === code.id).length}</span>
                  <button onClick={(e) => handleDeleteCode(e, code.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
          <div onMouseDown={() => setIsResizingLeft(true)} className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-500/20 flex items-center justify-center group z-50">
            <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
          </div>
        </div>
      )}

      {/* ÁREA CENTRAL TEXTOS Y BIBLIOTECA */}
      {activeTab === 'textos' && (
        <div className="flex-1 flex flex-col bg-slate-50/50 min-w-0 z-0">
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><FileText className={theme.text} /> Editor de Textos</h3>
              <div className="flex items-center gap-3">
                <select value={activeDocId || ''} onChange={(e) => setActiveDocId(Number(e.target.value))} className="text-sm font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none max-w-[250px] truncate">
                  {documents.length === 0 && <option>Sin documentos</option>}
                  {documents.map(doc => <option key={doc.id} value={doc.id}>{doc.title}</option>)}
                </select>
                <input type="file" multiple accept=".txt" ref={txtInputRef} onChange={handleImportTXT} className="hidden" />
                <button onClick={() => txtInputRef.current.click()} className="text-xs font-bold bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1 shadow-sm">
                  <Upload className="w-3.5 h-3.5" /> Añadir .TXT
                </button>
              </div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto select-text">
              <div onMouseUp={() => {
                const sel = window.getSelection();
                if(sel && sel.toString().trim().length > 0) setSelectedText(sel.toString().trim());
                else setSelectedText('');
              }} className="max-w-4xl mx-auto bg-white p-12 rounded-2xl shadow-xl border border-gray-100 min-h-[70vh] text-lg leading-loose font-serif whitespace-pre-wrap">
                {documents.find(d => d.id === activeDocId)?.content || <div className="text-center text-gray-400 mt-10">Agrega un archivo .TXT para comenzar.</div>}
              </div>
            </div>
        </div>
      )}

      {activeTab === 'biblioteca' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 z-0">
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><FolderTree className={theme.text} /> Biblioteca Multimedia</h3>
              <div className="flex gap-3">
                <button onClick={openInExplorer} className="flex items-center gap-2 text-xs font-bold bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200"><ExternalLink className="w-3 h-3" /> Abrir Carpeta</button>
                <button onClick={handleImportMultimedia} className={`flex items-center gap-2 text-xs font-bold ${theme.bg} text-white px-4 py-2 rounded-lg shadow-md hover:opacity-90`}><Upload className="w-4 h-4" /> Importar Archivo</button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-64 bg-white border-r border-gray-100 overflow-y-auto p-4 space-y-4 shrink-0">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Documentos PDF</h4>
                  {libraryFiles.filter(f => f.folder === 'Documentos').map(file => (
                    <div key={file.id} onClick={() => setActiveFile(file)} className={`p-2.5 rounded-lg border mb-2 cursor-pointer transition-all ${activeFile?.id === file.id ? `${theme.lightBg} ${theme.border} shadow-sm` : 'border-transparent hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-2"><div className="text-red-500"><FileText className="w-4 h-4" /></div><span className="text-xs font-bold text-gray-700 truncate">{file.name}</span></div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Multimedia</h4>
                  {libraryFiles.filter(f => f.folder === 'Multimedia').map(file => (
                    <div key={file.id} onClick={() => setActiveFile(file)} className={`p-2.5 rounded-lg border mb-2 cursor-pointer transition-all ${activeFile?.id === file.id ? `${theme.lightBg} ${theme.border} shadow-sm` : 'border-transparent hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-2"><div className="text-purple-500">{file.type === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}</div><span className="text-xs font-bold text-gray-700 truncate">{file.name}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 bg-slate-200 flex flex-col relative overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden">{renderFileViewer()}</div>
                {activeFile && (activeFile.type === 'pdf' || activeFile.type === 'image') && (
                  <div className="h-32 bg-white border-t border-gray-300 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] flex flex-col shrink-0 p-3 select-text z-10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" /> Capturador de Citas (Pega aquí texto del PDF)</span>
                    </div>
                    <textarea value={pdfQuoteCatcher} onChange={(e) => setPdfQuoteCatcher(e.target.value)} className="flex-1 w-full border border-blue-100 bg-blue-50/30 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none shadow-inner" placeholder="Copia un texto del PDF y pégalo aquí (Ctrl+C y Ctrl+V). Luego selecciona un Código a la izquierda..." />
                  </div>
                )}
              </div>
            </div>
        </div>
      )}

      {/* PESTAÑA VISUALIZACIONES */}
      {activeTab === 'visualizaciones' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="p-4 border-b border-gray-200 shadow-sm flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><PieChart className={theme.text} /> Visualizaciones y Exportación</h3>
            <button onClick={handleExportCSV} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors"><Table2 className="w-4 h-4" /> Exportar a CSV (Excel/Gephi)</button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 xl:grid-cols-2 gap-8 select-text">
            <div className="bg-slate-50 rounded-3xl p-8 border border-gray-100 shadow-inner flex flex-col min-h-[400px]">
              <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Cloud className="w-5 h-5 text-blue-500" /> Nube de Palabras (Frecuencia)</h4>
              <div className="flex-1 flex flex-wrap justify-center items-center gap-4 content-center bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
                {generateWordCloud.map(([word, count], i) => (
                  <span key={i} className="text-slate-600 transition-all hover:text-blue-600 cursor-default" style={{ fontSize: `${Math.min(12 + count * 4, 48)}px`, fontWeight: count > 3 ? 'bold' : 'normal', opacity: Math.min(0.4 + (count/5), 1) }}>{word}</span>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 rounded-3xl p-8 border border-gray-100 shadow-inner flex flex-col min-h-[400px]">
              <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Network className="w-5 h-5 text-purple-500" /> Red Conceptual de Co-ocurrencia</h4>
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 400 300">
                  {networkNodesAndLinks.links.map((link, i) => (
                    <line key={i} x1={link.source.x} y1={link.source.y} x2={link.target.x} y2={link.target.y} stroke="#cbd5e1" strokeWidth={Math.max(1, link.value * 1.5)} opacity="0.6" />
                  ))}
                  {networkNodesAndLinks.nodes.map(node => (
                    <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                      <circle r={Math.max(10, node.count * 4)} fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" className="shadow-lg" />
                      <text textAnchor="middle" dy=".3em" fontSize="10" fontWeight="bold" fill="#334155" pointerEvents="none">{node.name}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA REFERENCIAS (ESTILO ZOTERO - 3 PANELES) */}
      {activeTab === 'referencias' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white select-text">
          <div className="p-4 border-b border-gray-200 shadow-sm flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><BookOpen className={theme.text} /> Mi Biblioteca de Referencias</h3>
            <button onClick={handleCreateReference} className={`flex items-center gap-2 text-xs font-bold ${theme.bg} text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90`}>
              <FilePlus className="w-4 h-4" /> Nueva Referencia
            </button>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            
            {/* Panel Izquierdo: Colecciones / Carpetas */}
            <div className="w-60 bg-slate-50 border-r border-gray-200 flex flex-col shrink-0">
              <div className="p-4 border-b border-gray-200">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Colecciones</h4>
                <div onClick={() => setActiveRefGroupId('all')} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${activeRefGroupId === 'all' ? `${theme.lightBg} ${theme.text} font-bold` : 'text-slate-600 hover:bg-slate-200'}`}>
                  <Library className="w-4 h-4" /> Todas las referencias
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {referenceGroups.map(group => (
                  <div key={group.id} onClick={() => setActiveRefGroupId(group.id)} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors group ${activeRefGroupId === group.id ? `${theme.lightBg} ${theme.text} font-bold` : 'text-slate-600 hover:bg-slate-200'}`}>
                    <div className="flex items-center gap-2 truncate"><Folder className="w-4 h-4 shrink-0" /> <span className="truncate">{group.name}</span></div>
                    <button onClick={(e) => { e.stopPropagation(); setReferenceGroups(referenceGroups.filter(g => g.id !== group.id)); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                {isCreatingGroup ? (
                  <form onSubmit={handleAddRefGroup} className="flex gap-2">
                    <input autoFocus value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Nombre..." className="w-full text-xs p-1.5 border border-gray-300 rounded" />
                    <button type="submit" className={`${theme.text}`}><Check className="w-4 h-4"/></button>
                  </form>
                ) : (
                  <button onClick={() => setIsCreatingGroup(true)} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"><Plus className="w-3 h-3" /> Nueva Colección</button>
                )}
              </div>
            </div>

            {/* Panel Central: Lista de Referencias */}
            <div className="flex-1 border-r border-gray-200 flex flex-col bg-white">
              <div className="grid grid-cols-12 gap-4 p-3 bg-slate-100 border-b border-gray-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-6">Título</div>
                <div className="col-span-4">Creador</div>
                <div className="col-span-2">Año</div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredReferences.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                    <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                    <p>No hay referencias en esta colección.</p>
                  </div>
                ) : (
                  filteredReferences.map(ref => (
                    <div key={ref.id} onClick={() => setActiveRefId(ref.id)} className={`grid grid-cols-12 gap-4 p-3 border-b border-gray-100 cursor-pointer transition-colors items-center ${activeRefId === ref.id ? `${theme.bg} text-white` : 'hover:bg-slate-50 text-slate-700'}`}>
                      <div className="col-span-6 font-semibold truncate pr-4">{ref.title || 'Sin Título'}</div>
                      <div className="col-span-4 truncate text-sm opacity-90">{ref.authors?.[0]?.lastName ? `${ref.authors[0].lastName}${ref.authors.length > 1 ? ' et al.' : ''}` : 'Sin Autor'}</div>
                      <div className="col-span-2 text-sm opacity-80">{ref.year || 's.f.'}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Panel Derecho: Detalles y Edición (Zotero Style) */}
            <div className="w-[400px] bg-slate-50 flex flex-col shrink-0 overflow-y-auto">
              {!activeRef ? (
                <div className="flex items-center justify-center h-full text-slate-400 p-8 text-center"><p>Selecciona una referencia para ver y editar sus metadatos.</p></div>
              ) : (
                <div className="p-6 space-y-5">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 text-lg">Detalles del Documento</h4>
                    <button onClick={() => deleteReference(activeRef.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  {/* Vinculación de Archivo y Colección */}
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><LinkIcon className="w-3 h-3"/> Archivo Vinculado (PDF/Media)</label>
                      <select value={activeRef.linkedFileId || ''} onChange={e => updateActiveRef('linkedFileId', e.target.value)} className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <option value="">Ninguno</option>
                        {libraryFiles.map(f => <option key={f.id} value={f.id}>📄 {f.name}</option>)}
                        {documents.map(d => <option key={d.id} value={d.id}>📝 {d.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><Folder className="w-3 h-3"/> Colección</label>
                      <select value={activeRef.groupId || ''} onChange={e => updateActiveRef('groupId', e.target.value)} className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <option value="">Sin Asignar</option>
                        {referenceGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Formulario de Metadatos */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Elemento</label>
                      <select value={activeRef.type} onChange={e => updateActiveRef('type', e.target.value)} className="w-full text-sm font-semibold p-2 border-b border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none">
                        <option>Artículo de Revista</option><option>Libro</option><option>Capítulo de Libro</option><option>Tesis</option><option>Página Web</option><option>Video/Multimedia</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Título</label>
                      <textarea value={activeRef.title} onChange={e => updateActiveRef('title', e.target.value)} className="w-full text-sm p-2 border border-gray-300 rounded bg-white focus:border-blue-500 focus:outline-none resize-none min-h-[60px]" placeholder="Título completo..." />
                    </div>

                    {/* Autores por celdas */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Autores / Creadores</label>
                      <div className="space-y-2">
                        {activeRef.authors.map((author, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input value={author.lastName} onChange={e => updateActiveRefAuthor(index, 'lastName', e.target.value)} placeholder="Apellidos" className="w-1/2 text-sm p-1.5 border border-gray-300 rounded bg-white focus:border-blue-500 focus:outline-none" />
                            <input value={author.firstName} onChange={e => updateActiveRefAuthor(index, 'firstName', e.target.value)} placeholder="Nombres" className="w-1/2 text-sm p-1.5 border border-gray-300 rounded bg-white focus:border-blue-500 focus:outline-none" />
                            <button onClick={() => removeAuthorFromActiveRef(index)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                          </div>
                        ))}
                      </div>
                      <button onClick={addAuthorToActiveRef} className="mt-2 text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3"/> Añadir creador</button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-[10px] font-bold text-slate-500 uppercase">Año</label><input value={activeRef.year} onChange={e => updateActiveRef('year', e.target.value)} className="w-full text-sm p-1.5 border border-gray-300 rounded bg-white focus:outline-none" /></div>
                      <div><label className="text-[10px] font-bold text-slate-500 uppercase">Páginas</label><input value={activeRef.pages} onChange={e => updateActiveRef('pages', e.target.value)} className="w-full text-sm p-1.5 border border-gray-300 rounded bg-white focus:outline-none" /></div>
                    </div>
                    
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase">Publicación / Revista / Editorial</label><input value={activeRef.journal || activeRef.publisher || ''} onChange={e => {updateActiveRef('journal', e.target.value); updateActiveRef('publisher', e.target.value)}} className="w-full text-sm p-1.5 border border-gray-300 rounded bg-white focus:outline-none" /></div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-[10px] font-bold text-slate-500 uppercase">Volumen</label><input value={activeRef.volume} onChange={e => updateActiveRef('volume', e.target.value)} className="w-full text-sm p-1.5 border border-gray-300 rounded bg-white focus:outline-none" /></div>
                      <div><label className="text-[10px] font-bold text-slate-500 uppercase">Ejemplar</label><input value={activeRef.issue} onChange={e => updateActiveRef('issue', e.target.value)} className="w-full text-sm p-1.5 border border-gray-300 rounded bg-white focus:outline-none" /></div>
                    </div>

                    <div><label className="text-[10px] font-bold text-slate-500 uppercase">URL / DOI</label><input value={activeRef.url || activeRef.doi || ''} onChange={e => {updateActiveRef('url', e.target.value); updateActiveRef('doi', e.target.value)}} className="w-full text-sm p-1.5 border border-gray-300 rounded bg-white focus:outline-none text-blue-600" /></div>
                  </div>

                  {/* Generador de Citas Visual */}
                  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
                    <div className="bg-blue-100 px-3 py-2 flex justify-between items-center border-b border-blue-200">
                      <span className="text-xs font-bold text-blue-800">Generar Cita</span>
                      <select value={citationStyle} onChange={e => setCitationStyle(e.target.value)} className="text-xs font-bold bg-white border border-blue-300 rounded px-2 py-1 outline-none text-blue-800">
                        <option value="APA7">APA 7ma</option><option value="APA6">APA 6ta</option><option value="MLA">MLA 8va</option><option value="Chicago">Chicago</option>
                      </select>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-slate-800 italic leading-relaxed break-words">{generateCitationText(activeRef, citationStyle)}</p>
                      <button onClick={() => navigator.clipboard.writeText(generateCitationText(activeRef, citationStyle))} className="mt-3 w-full flex items-center justify-center gap-2 bg-white border border-blue-300 text-blue-700 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors">
                        <Copy className="w-3.5 h-3.5" /> Copiar al Portapapeles
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* PANEL DERECHO: RESULTADOS Y MEMOS (Para textos y biblioteca multimedia) */}
      {(activeTab === 'textos' || activeTab === 'biblioteca') && (
        <div style={{ width: rightWidth }} className="bg-white border-l border-gray-200 flex flex-col z-20 shrink-0 relative">
          <div onMouseDown={() => setIsResizingRight(true)} className="absolute top-0 left-0 w-2 h-full cursor-col-resize hover:bg-blue-500/20 flex items-center justify-center group z-50">
            <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
          </div>
          
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center pl-6">
            <h2 className="font-bold text-gray-700 flex items-center gap-2"><QuoteIcon className="w-4 h-4" /> Resultados</h2>
            <button onClick={handleExportReport} className="bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors shadow-sm">
              <FileDown className="w-3.5 h-3.5" /> Reporte
            </button>
          </div>
          
          <div className="px-4 py-2 border-b border-gray-100 bg-white pl-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input type="text" placeholder="Buscar en citas y memos..." value={quoteSearchQuery} onChange={e => setQuoteSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 pl-6 select-text">
            {displayedQuotes.map(quote => (
              <div key={quote.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${codes.find(c => c.id === quote.codeId)?.color || 'bg-gray-200 text-gray-800'}`}>
                    {codes.find(c => c.id === quote.codeId)?.name || 'Sin Código'}
                  </span>
                  <button onClick={() => handleDeleteQuote(quote.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <p className="text-sm italic text-gray-600 border-l-2 border-gray-200 pl-3">"{quote.text}"</p>
                <span className="text-[9px] text-gray-400 font-bold uppercase truncate" title={quote.sourceName || 'Desconocido'}>📄 {quote.sourceName || 'Desconocido'}</span>
                
                <div className="mt-2 pt-2 border-t border-gray-50">
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-1"><Highlighter className="w-3 h-3"/> Memo de la cita:</div>
                  <textarea value={quote.memo || ''} onChange={(e) => updateQuoteMemo(quote.id, e.target.value)} placeholder="Escribe tu análisis cualitativo sobre este extracto..." className="w-full text-xs p-2 border border-amber-200 bg-amber-50/30 rounded focus:outline-none focus:ring-1 focus:ring-amber-400 resize-y min-h-[60px]" />
                </div>
              </div>
            ))}
            {quotes.length === 0 && <p className="text-xs text-center text-gray-400 italic mt-10">Tus citas analizadas aparecerán aquí.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// APP MAIN (Dashboard)
// ============================================================================
export default function App() {
  const [view, setView] = useState('dashboard');
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeThemeName, setActiveThemeName] = useState('blue');
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);

  const isElectron = typeof window !== 'undefined' && window.navigator && /electron/i.test(window.navigator.userAgent.toLowerCase());

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('lalibreinv_projects');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lalibreinv_projects', JSON.stringify(projects));
  }, [projects]);

  const handleCreateProject = async () => {
    let rootPath = null;
    if (isElectron && ipc) {
      const result = await ipc.invoke('select-project-dir');
      if (!result) return; 
      rootPath = result.rootPath;
    }
    const newProject = { 
      id: Date.now(), name: `Proyecto ${projects.length + 1}`, rootPath,
      lastModified: new Date().toISOString(), icon: { type: 'preset', value: 'FolderOpen' },
      documents: defaultDocuments, codes: defaultCodes, quotes: [], libraryFiles: [], 
      referenceGroups: [{id: 'mt', name: 'Marco Teórico'}, {id: 'mm', name: 'Marco Metodológico'}],
      references: []
    };
    setProjects([newProject, ...projects]);
  };

  const handleUpdateProjectData = (id, newData) => setProjects(prev => prev.map(p => p.id === id ? { ...p, ...newData } : p));
  const theme = THEMES[activeThemeName] || THEMES.blue;

  const confirmDeleteProject = (id, name) => {
    if(window.confirm(`¿Estás completamente seguro de borrar el proyecto "${name}"? Esta acción no se puede deshacer.`)) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans select-none">
        
        {/* MODAL: SOBRE EL AUTOR */}
        {isAuthorModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-[450px] overflow-hidden flex flex-col transform transition-all text-center">
              <div className={`${theme.gradient} p-8 relative flex flex-col items-center`}>
                <button onClick={() => setIsAuthorModalOpen(false)} className="absolute top-4 right-4 bg-black/10 p-2 rounded-full hover:bg-black/20 transition-colors text-white"><X className="w-4 h-4"/></button>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4"><Sparkles className={`w-10 h-10 ${theme.text}`} /></div>
                <h2 className="text-2xl font-black text-white tracking-tight">Sobre el Autor</h2>
              </div>
              <div className="p-8">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-1">Desarrollado por</p>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Francisco Joel Hernández Pacheco</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-8">LalibreINV fue creado como una alternativa accesible y poderosa para la investigación cualitativa, diseñada para facilitar el análisis documental y la gestión de la información.</p>
                <div className="flex justify-center border-t border-slate-100 pt-6">
                  <a href="https://www.instagram.com/byfjoel?igsh=djNxcmxreXp4YXh1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-pink-600 transition-colors font-medium text-sm group">
                    <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-pink-50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </div>
                    Conectar en Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <header className="bg-white border-b border-gray-200 px-10 py-6 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
             <img src="./LALIBRE.png" alt="Logo" className="w-12 h-12" />
             <div><h1 className="text-2xl font-black text-slate-900 tracking-tight">LalibreINV <span className="text-slate-400 font-normal">PRO</span></h1><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Workspace de Investigación</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200 text-xs font-bold mr-2" title="Tus datos se guardan automáticamente en tu carpeta local.">
              <Check className="w-3.5 h-3.5" /> Auto-guardado
            </div>
            <button onClick={() => setIsAuthorModalOpen(true)} className="flex items-center gap-2 px-4 py-3 text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl font-semibold transition-colors border border-slate-200 shadow-sm"><Info className="w-5 h-5" /> Autor</button>
            <button onClick={handleCreateProject} className={`flex items-center gap-2 px-6 py-3 ${theme.gradient} text-white rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all`}><FolderPlus className="w-5 h-5" /> Nuevo Proyecto</button>
          </div>
        </header>

        <main className="p-10 max-w-[1600px] mx-auto">
          {projects.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-200 border-dashed max-w-2xl mx-auto shadow-sm mt-10">
              <div className={`${theme.lightBg} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6`}><FolderOpen className={`w-12 h-12 ${theme.text}`} /></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu espacio de trabajo está vacío</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Crea un proyecto nuevo haciendo clic en el botón superior para comenzar a organizar tu investigación.</p>
              <button onClick={handleCreateProject} className={`px-6 py-3 ${theme.gradient} text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all`}>Comenzar mi primer proyecto</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {projects.map(p => (
                <div key={p.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-2xl transition-all cursor-default group transform hover:-translate-y-1 relative">
                  <button onClick={() => confirmDeleteProject(p.id, p.name)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"><Trash2 className="w-4 h-4" /></button>
                  <div className={`${theme.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}><FolderOpen className={theme.text} /></div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1 truncate pr-6">{p.name}</h3>
                  <p className="text-xs text-slate-400 font-medium mb-6">Modificado: {new Date(p.lastModified).toLocaleDateString()}</p>
                  {p.rootPath && <div className="bg-slate-50 p-3 rounded-xl mb-6 flex items-center gap-2"><HardDrive className="w-3 h-3 text-slate-400 shrink-0" /><span className="text-[10px] text-slate-500 font-mono truncate" title={p.rootPath}>{p.rootPath}</span></div>}
                  <button onClick={() => { setActiveProjectId(p.id); setView('editor'); }} className={`w-full py-3 ${theme.bg} text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-opacity`}>Abrir Espacio</button>
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
    <ErrorBoundary>
      <ProjectEditor project={activeProject} onBack={() => setView('dashboard')} onUpdateProject={handleUpdateProjectData} theme={theme} isElectron={isElectron} />
    </ErrorBoundary>
  );
}