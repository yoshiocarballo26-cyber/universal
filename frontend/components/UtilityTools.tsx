import React, { useState } from 'react';
import { Calculator, Sparkles, ShieldCheck } from 'lucide-react';
import { COMPATIBILITY_MATRIX } from '../constants';
import { FormatConverter } from './FormatConverter';
import { WorkstationFile } from '../types';

interface UtilityToolsProps {
  files?: WorkstationFile[];
  onFileGenerated?: (newFile: WorkstationFile) => void;
}

export const UtilityTools: React.FC<UtilityToolsProps> = ({ files = [], onFileGenerated }) => {
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
    } else if (val === '=') {
      try {
        const sanitized = calcDisplay.replace(/[^0-9+\-*/.]/g, '');
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcHistory((prev) => [`${calcDisplay} = ${res}`, ...prev.slice(0, 4)]);
        setCalcDisplay(String(res));
      } catch (e) {
        setCalcDisplay('Error');
      }
    } else {
      setCalcDisplay((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
    }
  };

  const filteredMatrix = COMPATIBILITY_MATRIX.filter((item) =>
    item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.extension.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-obsidian-950 text-slate-100 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-obsidian-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Matriz de Compatibilidad & Centro de Herramientas
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-mono border border-gold-500/40">
              v2.5
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Conversor Local de Formatos, Calculadora Científica y Arquitectura de Compatibilidad
          </p>
        </div>
      </div>

      {/* 1. Universal Format Converter Module */}
      <FormatConverter files={files} onFileGenerated={onFileGenerated} />

      {/* 2. Grid with Matrix and Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compatibility Matrix (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-obsidian-900 border border-obsidian-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Matriz Oficial de Formatos y Motores
            </h3>
            <input
              type="text"
              placeholder="Buscar formato o extensión..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-obsidian-950 border border-obsidian-750 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="overflow-x-auto flex-1 border border-obsidian-800 rounded-xl max-h-[360px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-obsidian-850 text-slate-400 border-b border-obsidian-750 font-mono sticky top-0 z-10">
                  <th className="p-3">Extensión</th>
                  <th className="p-3">Formato</th>
                  <th className="p-3 text-center">Abrir</th>
                  <th className="p-3 text-center">Ver</th>
                  <th className="p-3 text-center">Editar</th>
                  <th className="p-3 text-center">Exportar</th>
                  <th className="p-3">Motor / Biblioteca</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-800 font-mono">
                {filteredMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-obsidian-850/50 transition">
                    <td className="p-3 text-gold-300 font-bold uppercase">.{item.extension}</td>
                    <td className="p-3 text-white font-sans font-medium">{item.name}</td>
                    <td className="p-3 text-center text-emerald-400">✓</td>
                    <td className="p-3 text-center text-emerald-400">✓</td>
                    <td className="p-3 text-center">
                      {item.canEdit ? <span className="text-emerald-400">✓</span> : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="p-3 text-center">
                      {item.canExport ? <span className="text-emerald-400">✓</span> : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">{item.engine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integrated Productivity Calculator */}
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Calculator className="w-4 h-4" /> Calculadora Universal
            </h3>

            {/* Display screen */}
            <div className="bg-obsidian-950 border border-obsidian-800 rounded-xl p-4 mb-4 text-right">
              <div className="text-[11px] text-slate-500 font-mono min-h-[18px]">
                {calcHistory[0] || ''}
              </div>
              <div className="text-2xl font-mono font-bold text-gold-300 overflow-x-auto">
                {calcDisplay}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2 font-mono text-sm">
              {['C', '(', ')', '/'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className="p-3 rounded-lg bg-obsidian-800 text-gold-400 font-bold hover:bg-obsidian-750 transition"
                >
                  {btn}
                </button>
              ))}
              {['7', '8', '9', '*'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className={`p-3 rounded-lg ${btn === '*' ? 'bg-obsidian-800 text-gold-400' : 'bg-obsidian-850 text-white'} hover:bg-obsidian-750 transition`}
                >
                  {btn}
                </button>
              ))}
              {['4', '5', '6', '-'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className={`p-3 rounded-lg ${btn === '-' ? 'bg-obsidian-800 text-gold-400' : 'bg-obsidian-850 text-white'} hover:bg-obsidian-750 transition`}
                >
                  {btn}
                </button>
              ))}
              {['1', '2', '3', '+'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className={`p-3 rounded-lg ${btn === '+' ? 'bg-obsidian-800 text-gold-400' : 'bg-obsidian-850 text-white'} hover:bg-obsidian-750 transition`}
                >
                  {btn}
                </button>
              ))}
              {['0', '.', '%', '='].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className={`p-3 rounded-lg ${btn === '=' ? 'bg-gold-500 text-obsidian-950 font-bold col-span-1 shadow-md' : 'bg-obsidian-850 text-white'} hover:opacity-90 transition`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-obsidian-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>Precisión: Coma flotante IEEE 754</span>
            <span className="text-gold-400 font-semibold">YC Core</span>
          </div>
        </div>
      </div>
    </div>
  );
};
