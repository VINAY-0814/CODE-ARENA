import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, RotateCcw, Maximize2, Minimize2, Check } from 'lucide-react';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onReset: () => void;
  supportedLanguages?: string[];
  readOnly?: boolean;
}

export const MonacoCodeEditor: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  language,
  onLanguageChange,
  onReset,
  supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'c'],
  readOnly = false,
}) => {
  const [fontSize, setFontSize] = useState<number>(14);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMonacoLang = (lang: string) => {
    switch (lang) {
      case 'javascript':
        return 'javascript';
      case 'python':
        return 'python';
      case 'java':
        return 'java';
      case 'cpp':
        return 'cpp';
      case 'c':
        return 'c';
      default:
        return 'javascript';
    }
  };

  return (
    <div
      className={`flex flex-col border border-neutral-800 bg-neutral-950 rounded-xl overflow-hidden shadow-md ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full h-full min-h-[420px]'
      }`}
    >
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-neutral-900/90 border-b border-neutral-800 text-xs">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={readOnly}
            className="px-2.5 py-1 bg-neutral-950 border border-neutral-700/80 rounded-md text-neutral-200 text-xs font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang === 'cpp' ? 'C++' : lang.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Font Size Selector */}
          <div className="flex items-center gap-1 text-neutral-400 font-mono text-[11px] ml-2">
            <span>Size:</span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-neutral-950 border border-neutral-800 rounded px-1.5 py-0.5 text-neutral-300 text-[11px]"
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            title="Copy Code"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {!readOnly && (
            <button
              onClick={onReset}
              title="Reset to starter template"
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Reset</span>
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Monaco Editor Container with Fallback */}
      <div className="flex-1 relative min-h-[360px] bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={getMonacoLang(language)}
          value={value}
          theme="vs-dark"
          onChange={(newVal) => onChange(newVal || '')}
          options={{
            fontSize,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            readOnly,
            suggestOnTriggerCharacters: true,
            bracketPairColorization: { enabled: true },
          }}
          loading={
            <div className="h-full flex items-center justify-center text-neutral-500 font-mono text-xs">
              Loading Monaco Code Editor...
            </div>
          }
        />
      </div>
    </div>
  );
};
