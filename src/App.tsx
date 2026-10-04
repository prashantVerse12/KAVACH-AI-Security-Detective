import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Terminal, 
  Database, 
  Code, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Cpu, 
  Server, 
  ChevronRight, 
  ChevronLeft,
  Settings,
  Workflow,
  Microscope,
  FlaskConical,
  Wrench,
  Globe,
  GitBranch,
  Target,
  LayoutDashboard,
  Presentation as PresentationIcon,
  Loader2,
  Scan,
  Lock,
  Activity,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- SHARED UI COMPONENTS ---

const COLORS = {
  bg: 'bg-slate-950',
  card: 'bg-slate-900',
  accent: 'text-cyan-400',
  accentBorder: 'border-cyan-400/30',
  accentBg: 'bg-cyan-400/10',
  textMuted: 'text-slate-400',
  textMain: 'text-slate-100',
  blue: 'text-blue-400',
  blueBorder: 'border-blue-400/30',
};

const SlideContainer = ({ children, title, subtitle }: { children: React.ReactNode, title?: string, subtitle?: string }) => (
  <div className="flex flex-col h-full w-full p-8 md:p-12 overflow-y-auto">
    {title && (
      <div className="mb-6">
        <h2 className={`text-4xl font-bold tracking-tight ${COLORS.accent} mb-2`}>{title}</h2>
        {subtitle && <h3 className="text-xl text-slate-400 font-medium">{subtitle}</h3>}
        <div className="h-1 w-24 bg-cyan-500 mt-4"></div>
      </div>
    )}
    <div className="flex-1">
      {children}
    </div>
  </div>
);

// --- PRESENTATION SLIDES ---
// (Simplified from previous version to save space, keeping core content)

const Slide1 = () => (
  <div className="flex flex-col justify-center items-center h-full text-center p-8">
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8 p-6 rounded-full bg-cyan-500/10 border border-cyan-500/30">
      <Shield size={100} className="text-cyan-400" />
    </motion.div>
    <h1 className="text-6xl font-extrabold tracking-tighter text-white mb-2">KAVACH</h1>
    <h2 className="text-2xl font-light text-cyan-400 mb-8 tracking-widest uppercase">AI Security Detective</h2>
    <p className="max-w-2xl text-lg text-slate-400 italic mb-12 border-l-4 border-cyan-500 pl-6 text-left">
      “An agentic AI security system that investigates potential vulnerabilities, validates them in a controlled environment, identifies their root cause, and provides a verified remediation path.”
    </p>
    <div className="text-left w-full mt-auto border-t border-slate-800 pt-8 flex justify-between">
      <div>
        <p className="text-white font-semibold">Prashant Kumar</p>
        <p className="text-slate-400 text-sm">B.Tech CSE — Cyber Security | GBU</p>
      </div>
      <p className="text-cyan-500 font-bold uppercase tracking-tighter">Minor Project — 2026</p>
    </div>
  </div>
);

// ... (Other slides truncated for brevity, but I'll include the Workflow one as it's key)

const SlideWorkflow = () => (
  <SlideContainer title="COMPLETE WORKFLOW" subtitle="End-to-End Security Investigation">
    <div className="flex flex-col items-center justify-center h-full">
       <div className="grid grid-cols-5 gap-4 w-full">
          {[
            { label: 'TARGET', color: 'bg-cyan-500' },
            { label: 'RECON', color: 'bg-slate-800' },
            { label: 'ANALYZE', color: 'bg-slate-800' },
            { label: 'VERIFY', color: 'bg-red-500/50' },
            { label: 'FIX', color: 'bg-green-500/50' }
          ].map((item, i, arr) => (
            <React.Fragment key={i}>
              <div className={`p-4 rounded border border-slate-700 text-center font-bold text-xs ${item.color}`}>
                {item.label}
              </div>
              {i < arr.length - 1 && <div className="flex items-center justify-center"><ArrowRight className="text-slate-700" /></div>}
            </React.Fragment>
          ))}
       </div>
       <div className="mt-12 p-6 bg-slate-900 border border-slate-800 rounded-xl max-w-2xl text-slate-400 text-sm leading-relaxed">
          KAVACH moves beyond scanning. It creates a <strong>Vulnerability Hypothesis</strong>, designs a <strong>Reproduction Test</strong>, executes it in a <strong>Sandbox</strong>, and only then labels a finding as <strong>Verified</strong>.
       </div>
    </div>
  </SlideContainer>
);

// --- PROTOTYPE: PHASE 1 (RECON & DISCOVERY) ---

const Phase1Prototype = ({ onDeepAnalysis }: { onDeepAnalysis: (ctx: any) => void }) => {
  const [url, setUrl] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [mode, setMode] = useState<'url' | 'manual'>('url');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [content, setContent] = useState('');
  const [reconResult, setReconResult] = useState<any>(null);
  const [targetAccessStatus, setTargetAccessStatus] = useState<any>(null);
  const [error, setError] = useState('');
  const [scanStep, setScanStep] = useState('');
  const [investigationCases, setInvestigationCases] = useState<Record<string, string>>({});
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const runScan = async () => {
    if (mode === 'url' && (!url || !isAuthorized)) return;
    if (mode === 'manual' && !manualCode) return;
    
    setIsScanning(true);
    setError('');
    setReconResult(null);
    setTargetAccessStatus(null);
    setInvestigationCases({});
    setSelectedCaseId(null);
    
    try {
      let textToAnalyze = manualCode;
      
      if (mode === 'url') {
        setScanStep('Accessing target...');
        const proxyRes = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
        const proxyData = await proxyRes.json();
        
        setTargetAccessStatus(proxyData);

        if (!proxyData.success) {
          setIsScanning(false);
          setScanStep('');
          return;
        }
        
        textToAnalyze = proxyData.content;
        setContent(textToAnalyze);
      }

      setScanStep('Analyzing Attack Surface...');
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: textToAnalyze, 
          context: mode === 'url' ? `Target Website: ${url}` : 'Manual Source Code Upload',
          url: mode === 'url' ? url : 'manual_upload'
        })
      });
      
      const data = await analyzeRes.json();
      
      if (!analyzeRes.ok || !data.success) {
        throw new Error(data.message || 'KAVACH intelligence engine failed');
      }
      
      setReconResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const startInvestigation = (findingId: string) => {
    setInvestigationCases(prev => ({
      ...prev,
      [findingId]: 'INVESTIGATING'
    }));
    setSelectedCaseId(findingId);
  };

  const selectedFinding = reconResult?.findings?.find((f: any) => f.finding_id === selectedCaseId);

  const initiateDeepAnalysis = () => {
    if (selectedFinding?.evidence?.source) {
      onDeepAnalysis({
        source: selectedFinding.evidence.source,
        findingId: selectedFinding.finding_id
      });
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -z-10 rounded-full" />
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Target size={20} className="text-cyan-400" /> Phase 1: Recon & Discovery
          </h3>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setMode('url')}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${mode === 'url' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
            >
              URL AUDIT
            </button>
            <button 
              onClick={() => setMode('manual')}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${mode === 'manual' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
            >
              SOURCE CODE
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {mode === 'url' ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter authorized target URL (e.g., https://example.com)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-700"
                  />
                </div>
                <button 
                  onClick={runScan}
                  disabled={isScanning || !url || !isAuthorized}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-slate-950 px-8 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                >
                  {isScanning ? <Loader2 className="animate-spin" size={20} /> : <Scan size={20} />}
                  {isScanning ? 'Processing...' : 'Start Audit'}
                </button>
              </div>
              <div className="flex items-center gap-3 px-1">
                <input 
                  type="checkbox" 
                  id="auth-check"
                  checked={isAuthorized}
                  onChange={(e) => setIsAuthorized(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="auth-check" className="text-xs text-slate-400 cursor-pointer select-none">
                  I confirm that I am authorized to assess this target.
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea 
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Paste authorized source code, API responses, or documentation for security analysis..."
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-4 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors resize-none placeholder:text-slate-700"
              />
              <button 
                onClick={runScan}
                disabled={isScanning || !manualCode}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-slate-950 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              >
                {isScanning ? <Loader2 className="animate-spin" size={20} /> : <Cpu size={20} />}
                {isScanning ? 'Analyzing...' : 'Audit Source Code'}
              </button>
            </div>
          )}
        </div>

        {isScanning && (
          <div className="mt-4 flex items-center gap-3 text-cyan-400 animate-pulse bg-slate-950/50 p-2 rounded-lg border border-cyan-900/30">
            <Activity size={14} />
            <span className="text-xs font-mono tracking-tighter">{scanStep}</span>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
        {/* Left Panel: Access Status & Findings */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
           <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500" /> Potential Candidates
              </h4>
              {reconResult && <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold">{reconResult.findings?.length || 0} Found</span>}
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
              
              {/* Target Access Status Section */}
              {targetAccessStatus && (
                <div className={`p-4 rounded-lg border ${targetAccessStatus.success ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]'}`}>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Target Access</p>
                   <div className="grid grid-cols-2 gap-y-2 text-xs">
                      <span className="text-slate-500">Status:</span>
                      <span className={`font-bold uppercase ${targetAccessStatus.success ? 'text-green-500' : 'text-red-500'}`}>
                        {targetAccessStatus.success ? 'SUCCESS' : 'BLOCKED'}
                      </span>
                      
                      {targetAccessStatus.status && (
                        <>
                          <span className="text-slate-500">HTTP Status:</span>
                          <span className="text-slate-300 font-mono">{targetAccessStatus.status}</span>
                        </>
                      )}
                      
                      <span className="text-slate-500">Reason:</span>
                      <span className="text-slate-300 leading-tight">{targetAccessStatus.message}</span>
                   </div>
                   
                   {!targetAccessStatus.success && (
                     <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-500 italic">
                        KAVACH cannot perform reconnaissance until the target content is accessible.
                     </div>
                   )}
                </div>
              )}

              {!reconResult && !isScanning && !error && !targetAccessStatus && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-8">
                   <Shield size={48} className="mb-4 opacity-20" />
                   <p className="text-sm italic">Ready to investigate. Enter a target URL and start the audit.</p>
                </div>
              )}
              
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Application Error</p>
                    <p className="opacity-80">{error}</p>
                  </div>
                </div>
              )}

              {reconResult?.findings?.map((f: any, i: number) => {
                const isInvestigating = investigationCases[f.finding_id] === 'INVESTIGATING';
                const isSelected = selectedCaseId === f.finding_id;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    key={f.finding_id || i} 
                    onClick={() => isInvestigating && setSelectedCaseId(f.finding_id)}
                    className={`p-4 rounded-lg group transition-colors shadow-sm relative overflow-hidden cursor-pointer border ${
                      isSelected ? 'bg-slate-900 border-cyan-500' : 'bg-slate-950 border-slate-800 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-600 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{f.finding_id}</span>
                          <h5 className="text-cyan-400 font-bold text-sm">{f.title}</h5>
                       </div>
                       <div className="flex gap-1">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                            f.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 
                            f.severity === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                            f.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 
                            'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                          }`}>
                              {f.severity}
                          </span>
                       </div>
                    </div>
                    
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">{f.description}</p>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-slate-900">
                      <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                        <Terminal size={10} /> {f.endpoint}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); startInvestigation(f.finding_id); }}
                        disabled={isInvestigating && !isSelected}
                        className={`text-[10px] font-bold px-3 py-1 rounded transition-all flex items-center gap-1 ${
                          isInvestigating 
                            ? isSelected ? 'bg-cyan-500 text-slate-950 border border-cyan-500' : 'bg-slate-800 text-slate-500 border border-slate-700'
                            : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 active:scale-95 border border-cyan-500/30'
                        }`}
                      >
                        {isInvestigating ? isSelected ? 'ACTIVE CASE' : 'INVESTIGATING' : 'Investigate'}
                        {!isInvestigating && <ArrowRight size={10} />}
                      </button>
                    </div>
                    
                    {isInvestigating && !isSelected && (
                      <div className="absolute inset-0 bg-cyan-500/[0.02] pointer-events-none" />
                    )}
                  </motion.div>
                );
              })}
           </div>
        </div>

        {/* Right Panel: Intelligence Feed & Case Details */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
           <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                {selectedCaseId ? <FileText size={16} className="text-cyan-400" /> : <Cpu size={16} className="text-cyan-500" />}
                {selectedCaseId ? `Case: ${selectedCaseId}` : 'Intelligence Feed'}
              </h4>
              {selectedCaseId && <button onClick={() => setSelectedCaseId(null)} className="text-[10px] text-slate-500 hover:text-white uppercase font-bold">Close Case</button>}
           </div>
           <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-xs max-w-none font-sans">
              {selectedFinding ? (
                <div className="space-y-6">
                   <div className="pb-4 border-b border-slate-800">
                      <h3 className="text-xl font-bold text-white mt-0">{selectedFinding.title}</h3>
                      <div className="flex gap-4 mt-2">
                         <div>
                            <p className="text-[8px] text-slate-500 uppercase font-bold">Severity</p>
                            <p className={`text-[10px] font-bold ${selectedFinding.severity === 'HIGH' || selectedFinding.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>{selectedFinding.severity}</p>
                         </div>
                         <div>
                            <p className="text-[8px] text-slate-500 uppercase font-bold">Confidence</p>
                            <p className={`text-[10px] font-bold ${selectedFinding.confidence === 'HIGH' ? 'text-green-400' : 'text-slate-400'}`}>{selectedFinding.confidence}</p>
                         </div>
                         <div>
                            <p className="text-[8px] text-slate-500 uppercase font-bold">Status</p>
                            <p className="text-[10px] font-bold text-cyan-400">INVESTIGATING</p>
                         </div>
                      </div>
                   </div>

                   <div>
                      <h4 className="text-cyan-400 uppercase tracking-widest text-[10px] font-bold mb-2">Description</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">{selectedFinding.description}</p>
                   </div>

                   <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                      <h4 className="text-cyan-400 uppercase tracking-widest text-[10px] font-bold mb-3 flex items-center gap-2">
                         <Terminal size={12} /> Static Evidence
                      </h4>
                      <div className="space-y-3">
                         <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Source</p>
                            <p className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2 rounded">{selectedFinding.evidence?.source}</p>
                         </div>
                         <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Observation</p>
                            <p className="text-[11px] text-slate-300">{selectedFinding.evidence?.observation}</p>
                         </div>
                      </div>
                   </div>

                   <div>
                      <h4 className="text-cyan-400 uppercase tracking-widest text-[10px] font-bold mb-3">Why KAVACH flagged this</h4>
                      <div className="space-y-4">
                         <div className="flex gap-4">
                            <div className="w-1 bg-cyan-500/30 rounded-full" />
                            <div>
                               <p className="text-[10px] font-bold text-white uppercase mb-1">Reasoning</p>
                               <p className="text-[11px] text-slate-400">{selectedFinding.flagging_logic?.reasoning}</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <div className="w-1 bg-amber-500/30 rounded-full" />
                            <div>
                               <p className="text-[10px] font-bold text-white uppercase mb-1">Unknowns</p>
                               <p className="text-[11px] text-slate-400 italic">{selectedFinding.flagging_logic?.unknown}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="p-4 bg-blue-900/10 border border-blue-800/30 rounded-lg mt-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                             <Activity size={12} /> Deep Investigation
                          </p>
                          <p className="text-slate-400 text-[11px] leading-relaxed">
                             Initiate **Phase 2: Code Intelligence** to perform static taint analysis on this specific clue.
                          </p>
                        </div>
                        <button 
                          onClick={initiateDeepAnalysis}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-4 py-2 rounded flex items-center gap-2 transition-all shadow-lg"
                        >
                          Analyze Clues <ArrowRight size={12} />
                        </button>
                      </div>
                      <p className="text-slate-500 text-[9px] italic border-t border-blue-800/30 pt-2">
                         KAVACH will plan and execute a non-destructive Proof-of-Concept (PoC) in the isolated sandbox if clues are verified.
                      </p>
                   </div>
                </div>
              ) : reconResult ? (
                  <div className="space-y-8">
                    {reconResult.metadata && (
                      <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-[9px] text-slate-500 space-y-1">
                         <p><span className="text-slate-700">INVESTIGATION_ID:</span> {reconResult.metadata.scan_id}</p>
                         <p><span className="text-slate-700">TIMESTAMP:</span> {reconResult.metadata.timestamp}</p>
                         <p><span className="text-slate-700">MODEL:</span> {reconResult.metadata.model}</p>
                         <p><span className="text-slate-700">DURATION:</span> {reconResult.metadata.duration_ms}ms</p>
                      </div>
                    )}

                    {/* Technologies */}
                    <div>
                      <h4 className="text-cyan-400 mt-0 uppercase tracking-widest text-[10px] font-bold mb-4">Technology Stack Intelligence</h4>
                      <div className="flex flex-wrap gap-2">
                         {reconResult.intelligence_map?.technologies?.map((tech: any, i: number) => (
                           <div key={i} className="group relative">
                             <span className="bg-cyan-950/30 text-cyan-400 px-2 py-1 rounded text-[10px] font-bold border border-cyan-500/20 uppercase tracking-tighter cursor-help">
                               {tech.name}
                             </span>
                             <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 border border-slate-700 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 text-[9px]">
                               <p className="text-slate-500 uppercase font-bold mb-1">{tech.category}</p>
                               <p className="text-slate-300">{tech.evidence}</p>
                             </div>
                           </div>
                         ))}
                      </div>
                    </div>

                    {/* Endpoints */}
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <h4 className="text-cyan-400 mt-0 uppercase tracking-widest text-[10px] font-bold">Endpoint Discovery</h4>
                        <span className="text-[9px] text-slate-600 font-bold uppercase">{reconResult.intelligence_map?.endpoints?.length || 0} Identified</span>
                      </div>
                      <div className="space-y-2">
                        {reconResult.intelligence_map?.endpoints?.slice(0, 10).map((ep: any, i: number) => (
                          <div key={i} className="p-2 bg-slate-950 border border-slate-800 rounded flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono text-cyan-400 font-bold">{ep.method} {ep.path}</span>
                              <span className={`text-[8px] font-bold px-1 rounded ${ep.confidence === 'HIGH' ? 'text-green-500' : 'text-slate-500'}`}>{ep.confidence}</span>
                            </div>
                            <p className="text-[9px] text-slate-500 italic truncate">{ep.hypothesis}</p>
                          </div>
                        ))}
                        {(reconResult.intelligence_map?.endpoints?.length > 10) && (
                          <p className="text-[9px] text-slate-600 text-center italic">...and {reconResult.intelligence_map.endpoints.length - 10} more endpoints</p>
                        )}
                      </div>
                    </div>

                    {/* Client Side Clues */}
                    {reconResult.intelligence_map?.client_side_clues?.length > 0 && (
                      <div>
                        <h4 className="text-amber-500 mt-0 uppercase tracking-widest text-[10px] font-bold mb-4">Client-Side Security Clues</h4>
                        <div className="space-y-3">
                          {reconResult.intelligence_map.client_side_clues.map((clue: any, i: number) => (
                            <div key={i} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-amber-500 uppercase">{clue.type}</span>
                                <span className={`text-[8px] font-bold px-1 rounded border ${clue.status === 'Active' ? 'border-red-500 text-red-500' : 'border-slate-700 text-slate-500'}`}>{clue.status}</span>
                              </div>
                              <p className="text-[11px] text-slate-300 mb-2 font-mono break-all bg-slate-950 p-1.5 rounded">{clue.value}</p>
                              <p className="text-[10px] text-slate-500 leading-tight">{clue.relevance}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-cyan-950/20 border border-cyan-800/50 rounded-lg border-l-4 border-l-cyan-500 mt-8">
                       <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Lock size={12} /> Researcher Action
                       </p>
                       <p className="text-slate-400 text-[11px] leading-relaxed">
                          The **Investigation Pipeline** has automatically correlated these clues to generate the potential candidates seen in the left panel.
                       </p>
                    </div>
                  </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-700">
                  <Terminal size={40} className="mb-4 opacity-10" />
                  <p className="text-sm italic">Analysis telemetry and attack surface data will appear here.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const Phase2Prototype = ({ context, onClearContext }: { context: any, onClearContext: () => void }) => {
  const [code, setCode] = useState(context?.source || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intelResult, setIntelResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('');

  useEffect(() => {
    if (context?.source) {
      setCode(context.source);
    }
  }, [context]);

  const runAnalysis = async () => {
    if (!code) return;
    setIsAnalyzing(true);
    setError('');
    setIntelResult(null);
    setStep('Initializing Static Analysis Engine...');

    try {
      setStep('Extracting Code Patterns with Gemini-3.8-Flash...');
      const res = await fetch('/api/code-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: code, 
          context: context ? `Contextual Investigation for Finding ${context.findingId}` : 'Manual Source Code Review' 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || 'Analysis failed');
      setIntelResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
      setStep('');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {context && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl flex justify-between items-center"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Microscope size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Contextual Investigation Active</p>
              <p className="text-[10px] text-slate-400 font-mono">Analyzing evidence from finding {context.findingId}</p>
            </div>
          </div>
          <button 
            onClick={onClearContext}
            className="text-[10px] font-bold text-slate-500 hover:text-white uppercase transition-colors"
          >
            Switch to Manual Mode
          </button>
        </motion.div>
      )}

      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -z-10 rounded-full" />
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Microscope size={20} className="text-blue-400" /> Phase 2: Code Intelligence & Data Flow
          </h3>
          {intelResult && (
             <div className="flex gap-4">
                <div className="text-right">
                   <p className="text-[8px] text-slate-500 uppercase font-bold">Language</p>
                   <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">{intelResult.metadata?.primary_language || 'Detecting...'}</p>
                </div>
                <div className="text-right">
                   <p className="text-[8px] text-slate-500 uppercase font-bold">Architecture</p>
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{intelResult.metadata?.architecture_pattern || 'Analyzing...'}</p>
                </div>
             </div>
          )}
        </div>

        <div className="space-y-4">
           <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste source code (JS, TS, Python, Go, etc.) for deep technical indexing..."
            className="w-full h-40 bg-slate-950 border border-slate-700 rounded-lg p-4 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-slate-800"
          />
          <button 
            onClick={runAnalysis}
            disabled={isAnalyzing || !code}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-slate-950 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.2)] uppercase tracking-widest text-xs"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
            {isAnalyzing ? 'Mapping Codebase...' : 'Build Intelligence Index'}
          </button>
        </div>

        {isAnalyzing && (
          <div className="mt-4 flex items-center gap-3 text-blue-400 animate-pulse bg-slate-950/50 p-2 rounded-lg border border-blue-900/30">
            <Activity size={14} />
            <span className="text-xs font-mono tracking-tighter">{step}</span>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {/* Technical mapping */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
           <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h4 className="text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Settings size={14} className="text-slate-500" /> System Map
              </h4>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-[10px]">{error}</div>}
              
              {!intelResult && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center p-8 opacity-30">
                   <GitBranch size={40} className="mb-4" />
                   <p className="text-[10px]">Code index pending.</p>
                </div>
              )}

              {intelResult && (
                <>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                       <Code size={10} /> Entry Points
                    </p>
                    <div className="space-y-2">
                       {intelResult.intelligence?.entry_points?.map((item: string, i: number) => (
                         <div key={i} className="p-2 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-blue-400">{item}</div>
                       ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                       <Globe size={10} /> Routes & Endpoints
                    </p>
                    <div className="space-y-2">
                       {intelResult.intelligence?.endpoints?.map((item: string, i: number) => (
                         <div key={i} className="p-2 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-300">{item}</div>
                       ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                       <FlaskConical size={10} /> Sensitive Sinks
                    </p>
                    <div className="space-y-2">
                       {intelResult.intelligence?.sensitive_sinks?.map((item: string, i: number) => (
                         <div key={i} className="p-2 bg-red-950/20 border border-red-900/30 rounded text-[10px] font-mono text-red-400">{item}</div>
                       ))}
                    </div>
                  </div>
                </>
              )}
           </div>
        </div>

        {/* Data Flows */}
        <div className="md:col-span-2 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
           <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h4 className="text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Workflow size={14} className="text-blue-500" /> Probabilistic Data Flows
              </h4>
           </div>
           <div className="flex-1 overflow-y-auto p-0">
              {!intelResult && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-20">
                   <Workflow size={60} className="mb-4" />
                   <p className="text-xs italic uppercase tracking-widest">Awaiting static analysis input...</p>
                </div>
              )}

              {intelResult && (
                <table className="w-full border-collapse">
                   <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10">
                      <tr className="text-[8px] text-slate-500 uppercase font-bold">
                         <th className="p-4 text-left">Origin (Source)</th>
                         <th className="p-4 text-left">Destination (Sink)</th>
                         <th className="p-4 text-center">Risk</th>
                         <th className="p-4 text-left">Internal Logic</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                      {intelResult.data_flows?.map((flow: any, i: number) => (
                        <tr key={i} className="hover:bg-blue-500/5 transition-colors group">
                           <td className="p-4 text-[10px] font-mono text-blue-400">{flow.source}</td>
                           <td className="p-4 text-[10px] font-mono text-red-400">{flow.sink}</td>
                           <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                flow.risk === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                                flow.risk === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-slate-800 text-slate-500'
                              }`}>{flow.risk}</span>
                           </td>
                           <td className="p-4 text-[10px] text-slate-500 leading-relaxed max-w-xs">{flow.logic}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- ROADMAP VIEW ---

const Roadmap = () => (
  <SlideContainer title="INVESTIGATION PIPELINE" subtitle="From External Recon to Verified Case">
    <div className="space-y-8 mt-4">
       {[
         { phase: 1, title: 'External Reconnaissance', status: 'Operational', items: ['Technology Stack Intelligence', 'Endpoint Discovery & Mapping', 'Client-Side Security Hunt'], active: false },
         { phase: 2, title: 'Code Intelligence', status: 'Operational', items: ['Static Taint Analysis', 'System Architecture Mapping', 'Probabilistic Data Flows'], active: false },
         { phase: 3, title: 'Agentic Investigation', status: 'In Progress', items: ['Multi-agent Orchestration', 'Reasoning Engines', 'Vulnerability Hypothesis Generation'], active: true },
         { phase: 4, title: 'Sandbox Verification', status: 'Planned', items: ['Isolated Environment Execution', 'Proof-of-Concept Generation', 'Evidence Collection'], active: false },
         { phase: 5, title: 'Ethical Case Reporting', status: 'Planned', items: ['Automated Fix Generation', 'Institutional Reporting', 'Remediation Paths'], active: false }
       ].map((p, i) => (
         <div key={i} className={`p-6 rounded-xl border flex gap-6 items-start transition-all ${p.active ? 'bg-cyan-500/5 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl ${p.active ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
               {p.phase}
            </div>
            <div className="flex-1">
               <div className="flex justify-between items-center mb-2">
                  <h4 className={`text-xl font-bold ${p.active ? 'text-white' : 'text-slate-500'}`}>{p.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${p.active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-600'}`}>
                     {p.status}
                  </span>
               </div>
               <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {p.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-slate-400">
                       <div className={`w-1 h-1 rounded-full ${p.active ? 'bg-cyan-500' : 'bg-slate-700'}`} /> {item}
                    </div>
                  ))}
               </div>
            </div>
            {p.active && <Zap className="text-cyan-400 animate-pulse" size={20} />}
         </div>
       ))}
    </div>
  </SlideContainer>
);

// --- MAIN APPLICATION ---

export default function App() {
  const [view, setView] = useState<'presentation' | 'roadmap' | 'prototype' | 'code_intel'>('presentation');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [investigationContext, setInvestigationContext] = useState<{ source?: string, findingId?: string } | null>(null);
  const slides = [<Slide1 />, <SlideWorkflow />]; // Scaled down for demo

  return (
    <div className={`fixed inset-0 ${COLORS.bg} text-white flex flex-col font-sans overflow-hidden`}>
      {/* Sidebar Navigation */}
      <div className="flex h-full">
        <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col z-20">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <Shield className="text-cyan-500" size={28} />
            <div className="flex flex-col">
              <span className="font-bold tracking-tighter text-xl leading-none">KAVACH</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">AI Security Detective</span>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button 
              onClick={() => setView('presentation')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${view === 'presentation' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
            >
              <PresentationIcon size={18} /> Proposal Mode
            </button>
            <button 
              onClick={() => setView('roadmap')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${view === 'roadmap' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
            >
              <Workflow size={18} /> Phased Roadmap
            </button>
            
            <div className="pt-8 pb-2 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Prototype</div>
            <button 
              onClick={() => setView('prototype')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${view === 'prototype' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
            >
              <Scan size={18} /> Phase 1: Recon
            </button>
            <button 
              onClick={() => setView('code_intel')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${view === 'code_intel' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
            >
              <Microscope size={18} /> Phase 2: Code Intel
            </button>
            <button disabled className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-slate-700 cursor-not-allowed opacity-50">
              <Settings size={18} /> Phase 3: Agents
            </button>
          </nav>

          <div className="p-6 border-t border-slate-800">
             {investigationContext && (
               <div className="mb-4 bg-blue-500/10 p-3 rounded border border-blue-500/20">
                  <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Activity size={10} /> Active Pipeline
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">Evidence: {investigationContext.findingId}</p>
                  <button onClick={() => setInvestigationContext(null)} className="text-[8px] text-blue-600 hover:text-blue-400 uppercase font-bold mt-1">Clear Context</button>
               </div>
             )}
             <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">GBU Node Connected</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-tight">Institutional network authorized for security research.</p>
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative bg-slate-950">
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md z-10">
             <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {view === 'presentation' ? 'Proposal Presentation' : view === 'roadmap' ? 'Project Roadmap' : view === 'prototype' ? 'Live Prototype - Recon Mode' : 'Live Prototype - Code Intelligence'}
                </h2>
             </div>
             <div className="flex items-center gap-4">
                {view === 'presentation' && (
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      {slides.map((_, i) => (
                        <div key={i} className={`h-1 w-4 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-cyan-500 w-8' : 'bg-slate-800'}`} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} className="p-1.5 hover:bg-slate-800 rounded text-slate-400"><ChevronLeft size={18} /></button>
                      <button onClick={() => setCurrentSlide(s => Math.min(slides.length - 1, s + 1))} className="p-1.5 hover:bg-slate-800 rounded text-slate-400"><ChevronRight size={18} /></button>
                    </div>
                  </div>
                )}
             </div>
          </header>

          <div className="flex-1 p-8 overflow-hidden relative">
             <AnimatePresence mode="wait">
                <motion.div
                  key={view + (view === 'presentation' ? currentSlide : '')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full"
                >
                  {view === 'presentation' ? slides[currentSlide] : 
                   view === 'roadmap' ? <Roadmap /> : 
                   view === 'prototype' ? <Phase1Prototype onDeepAnalysis={(ctx: any) => { setInvestigationContext(ctx); setView('code_intel'); }} /> : 
                   <Phase2Prototype context={investigationContext} onClearContext={() => setInvestigationContext(null)} />}
                </motion.div>
             </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #22d3ee 1px, transparent 0)', backgroundSize: '40px 40px' }} />
    </div>
  );
}
