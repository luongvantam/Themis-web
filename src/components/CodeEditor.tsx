import React, { useRef } from 'react';
import { Upload, RotateCcw, Code2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../services/judge0Service';
import { Judge0Language } from '../types';

interface CodeEditorProps {
  code: string;
  onChangeCode: (code: string) => void;
  languageId: number;
  onChangeLanguageId: (id: number) => void;
  taskCode?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChangeCode,
  languageId,
  onChangeLanguageId,
  taskCode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentLang: Judge0Language =
    SUPPORTED_LANGUAGES.find((l) => l.id === languageId) || SUPPORTED_LANGUAGES[0];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      onChangeCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect language from extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const matchedLang = SUPPORTED_LANGUAGES.find((l) => l.extension.toLowerCase() === ext);
    if (matchedLang) {
      onChangeLanguageId(matchedLang.id);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content !== undefined) {
        onChangeCode(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetTemplate = () => {
    let tpl = currentLang.defaultTemplate;
    if (taskCode) {
      tpl = tpl.replace(/TASK/g, taskCode);
    }
    onChangeCode(tpl);
  };

  const lineCount = (code.match(/\n/g) || []).length + 1;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <select
            value={languageId}
            onChange={(e) => {
              const newId = Number(e.target.value);
              onChangeLanguageId(newId);
              const lang = SUPPORTED_LANGUAGES.find((l) => l.id === newId);
              if (lang && (!code || code.trim().length === 0)) {
                let tpl = lang.defaultTemplate;
                if (taskCode) tpl = tpl.replace(/TASK/g, taskCode);
                onChangeCode(tpl);
              }
            }}
            className="bg-slate-800 text-xs text-slate-200 font-medium border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.extension})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".cpp,.c,.pas,.py,.java,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải file mã nguồn</span>
          </button>
          <button
            onClick={handleResetTemplate}
            title="Khôi phục mẫu code chuẩn"
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 min-h-[380px] font-mono text-sm relative bg-[#0D1117]">
        {/* Line Numbers */}
        <div className="py-3 px-2 bg-[#090D13] text-slate-600 text-right select-none text-xs border-r border-slate-800/80 min-w-[3rem]">
          {Array.from({ length: Math.max(lineCount, 15) }, (_, i) => (
            <div key={i + 1} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          placeholder="// Nhập hoặc kéo thả mã nguồn bài làm của bạn tại đây..."
          className="flex-1 p-3 bg-transparent text-slate-100 resize-none focus:outline-none leading-6 font-mono text-sm overflow-auto"
        />
      </div>
    </div>
  );
};

