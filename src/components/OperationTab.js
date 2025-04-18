// src/components/OperationTab.js
import React, { useState, useEffect, useRef } from 'react'

// Operadores y sus colores
const OPERATORS = [
  { name: 'Gael',      color: '#FACC15' },
  { name: 'Christian', color: '#F97316' },
  { name: 'Santy',     color: '#3B82F6' },
  { name: 'Flaco',     color: '#7F1D1D' },
  { name: 'Andy',      color: '#EC4899' },
  { name: 'Issac',     color: '#8B5CF6' },
  { name: 'Andres',    color: '#22C55E' },
  { name: 'German',    color: '#A5B4FC' },
]

// Costo fijo de red (en USDT)
const NETWORK_COST = 2

export default function OperationTab() {
  const ref = useRef(null)

  // modo: 'cliente' o 'operador'
  const [mode, setMode] = useState('cliente')
  // depósito como texto para formatear
  const [depositRaw, setDepositRaw] = useState(() => localStorage.getItem('op_deposit') || '')
  // spot manual
  const [spotRaw, setSpotRaw] = useState(() => localStorage.getItem('op_spot') || '')
  // operador seleccionado
  const [operator, setOperator] = useState(() => localStorage.getItem('op_operator') || 'Issac')

  // persistencia
  useEffect(() => { localStorage.setItem('op_deposit', depositRaw) },   [depositRaw])
  useEffect(() => { localStorage.setItem('op_spot',    spotRaw)    },   [spotRaw])
  useEffect(() => { localStorage.setItem('op_operator',operator)   },   [operator])

  // parseos
  const depNum  = parseFloat(depositRaw.replace(/,/g, '')) || 0
  const spotNum = parseFloat(spotRaw) || 1

  // encuentra el operador actual
  const op = OPERATORS.find(o => o.name === operator) || OPERATORS[0]
  const isSpecial = operator === 'Andres' || operator === 'German'

  // offsets
  const offsetDisplay = isSpecial ? 0.03 : 0.05   // centavos para Costo Final
  const finalCost     = spotNum + offsetDisplay  // MXN por USDT

  // cálculo final de USDT
  // siempre sobre spot + 0.03
  const denomForCalc = spotNum + 0.03
  const usdtAmount = depNum / denomForCalc - NETWORK_COST

  // formatea con comas al perder foco
  const handleDepositBlur = () => {
    if (!depositRaw) return
    const num = parseFloat(depositRaw.replace(/,/g, '')) || 0
    setDepositRaw(num.toLocaleString())
  }
  // al enfocar, quita comas
  const handleDepositFocus = () => {
    setDepositRaw(depositRaw.replace(/,/g, ''))
  }

  // copiar como imagen
  const copyAsImage = async () => {
    if (!ref.current || !window.html2canvas) return
    const canvas = await window.html2canvas(ref.current)
    canvas.toBlob(blob => {
      if (!blob) return
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    })
  }

  // limpiar campos
  const clear = () => {
    setDepositRaw('')
    setSpotRaw('')
  }

  return (
    <div
      ref={ref}
      className="max-w-md mx-auto p-4 rounded-xl shadow-lg bg-white"
      style={{ border: `3px solid ${op.color}` }}
    >
      {/* Título */}
      <h2
        className="text-lg font-bold text-center mb-3"
        style={{ color: op.color }}
      >
        NovaCoin · {mode === 'cliente' ? 'Cliente' : 'Operador'}
      </h2>

      {/* Selector de modo */}
      <div className="flex justify-center gap-2 mb-4">
        {['cliente','operador'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 text-sm rounded-full ${
              mode === m ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {m === 'cliente' ? 'Cliente' : 'Operador'}
          </button>
        ))}
      </div>

      {/* Dropdown de operador (solo operador) */}
      {mode === 'operador' && (
        <div className="mb-3">
          <label className="text-xs font-medium">Operador</label>
          <select
            className="w-full text-sm border px-2 py-1 rounded"
            value={operator}
            onChange={e => setOperator(e.target.value)}
          >
            {OPERATORS.map(o =>
              <option key={o.name} value={o.name}>{o.name}</option>
            )}
          </select>
        </div>
      )}

      {/* Entradas compactas */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <span className="w-24">Depositado:</span>
          <span className="px-2 bg-gray-100 rounded-l">$</span>
          <input
            type="text"
            value={depositRaw}
            onChange={e => setDepositRaw(e.target.value)}
            onBlur={handleDepositBlur}
            onFocus={handleDepositFocus}
            className="flex-1 text-sm border-t border-b border-r px-2 py-1 rounded-r"
            placeholder="0"
          />
        </div>
        <div className="flex items-center text-sm">
          <span className="w-24">
            {mode==='cliente' ? 'TC Spot:' : 'Precio Spot:'}
          </span>
          <span className="px-2 bg-gray-100 rounded-l">$</span>
          <input
            type="number"
            value={spotRaw}
            onChange={e => setSpotRaw(e.target.value)}
            className="flex-1 text-sm border-t border-b border-r px-2 py-1 rounded-r"
            placeholder="0"
          />
        </div>
      </div>

      {/* Desglose para operador */}
      {mode === 'operador' && (
        <div className="text-sm bg-gray-50 p-2 rounded mb-4 space-y-1">
          <div className="flex justify-between">
            <span>Precio spot</span>
            <span>${spotNum.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span>Costo final</span>
            <span style={{ color: op.color, fontWeight: 'bold' }}>
              ${finalCost.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Costo de red</span>
            <span>{NETWORK_COST} USDT</span>
          </div>
        </div>
      )}

      {/* Resultado para ambos modos */}
      <div className="text-center text-lg font-semibold mb-4">
        {isNaN(usdtAmount)
          ? '0.000 USDT'
          : `${usdtAmount.toFixed(3)} USDT`
        }
      </div>

      {/* Botones */}
      <div className="flex gap-2">
        <button
          onClick={copyAsImage}
          className="flex-1 text-xs bg-gray-800 text-white py-1 rounded hover:bg-gray-700"
        >
          📸 Copiar imagen
        </button>
        <button
          onClick={clear}
          className="flex-1 text-xs bg-red-600 text-white py-1 rounded hover:bg-red-500"
        >
          ❌ Limpiar
        </button>
      </div>
    </div>
  )
}
