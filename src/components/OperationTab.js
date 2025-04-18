// src/components/OperationTab.js
import React, { useState, useEffect, useRef } from 'react'

// Operadores y colores
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

// Comisiones fijas
const BITSO_FEE    = 0.02  // MXN por USDT
const BANCA_FEE    = 0.01  // MXN por USDT
const BINANCE_FEE  = 0.02  // MXN por USDT
const NETWORK_COST = 2     // USDT

export default function OperationTab() {
  const ref = useRef(null)

  // Estados y localStorage
  const [mode, setMode]         = useState('cliente')
  const [deposited, setDeposited]   = useState(() => localStorage.getItem('op_deposit')   || '')
  const [spot, setSpot]             = useState(() => localStorage.getItem('op_spot')      || '')
  const [networkFee, setNetworkFee] = useState(() => localStorage.getItem('op_fee')       || '')
  const [operator, setOperator]     = useState(() => localStorage.getItem('op_operator')  || 'Issac')

  useEffect(() => { localStorage.setItem('op_deposit', deposited) },   [deposited])
  useEffect(() => { localStorage.setItem('op_spot',    spot)     },   [spot])
  useEffect(() => { localStorage.setItem('op_fee',     networkFee) }, [networkFee])
  useEffect(() => { localStorage.setItem('op_operator',operator)  },  [operator])

  // Parseos
  const depNum  = parseFloat(deposited)  || 0
  const spotNum = parseFloat(spot)       || 1
  const fee     = parseFloat(networkFee) || NETWORK_COST

  // Operador y sus comisiones
  const op = OPERATORS.find(o => o.name === operator) || OPERATORS[5]
  const isBroker = operator === 'Andres' || operator === 'German'
  const bitsoFee   = BITSO_FEE
  const bancaFee   = BANCA_FEE
  const binanceFee = (!isBroker && mode==='operador') ? BINANCE_FEE : null

  // Denominador para precio final
  const denom = spotNum + bitsoFee + bancaFee

  // Cálculo final
  const finalAmount = depNum / denom - NETWORK_COST

  // Copiar imagen
  const copyAsImage = async () => {
    if (!ref.current || !window.html2canvas) return
    const canvas = await window.html2canvas(ref.current)
    canvas.toBlob(blob => {
      if (!blob) return
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    })
  }

  // Limpiar
  const clear = () => {
    setDeposited('')
    setSpot('')
    setNetworkFee('')
  }

  return (
    <div
      ref={ref}
      className="max-w-md mx-auto p-4 rounded-xl shadow-lg bg-white"
      style={{ border: `3px solid ${op.color}` }}
    >
      {/* Título */}
      <h2 className="text-lg font-bold text-center mb-3" style={{ color: op.color }}>
        NovaCoin · {mode === 'cliente' ? 'Cliente' : 'Operador'}
      </h2>

      {/* Modo */}
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

      {/* Operador dropdown */}
      {mode === 'operador' && (
        <div className="mb-3">
          <label className="text-xs font-medium">Operador</label>
          <select
            className="w-full text-sm border px-2 py-1 rounded"
            value={operator}
            onChange={e => setOperator(e.target.value)}
          >
            {OPERATORS.map(o => <option key={o.name}>{o.name}</option>)}
          </select>
        </div>
      )}

      {/* Entradas */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <span className="w-24">Depositado:</span>
          <span className="px-2 bg-gray-100 rounded-l">$</span>
          <input
            type="number"
            value={deposited}
            onChange={e => setDeposited(e.target.value)}
            className="flex-1 text-sm border-t border-b border-r px-2 py-1 rounded-r"
          />
        </div>
        <div className="flex items-center text-sm">
          <span className="w-24">
            {mode==='cliente' ? 'TC Spot:' : 'Precio Spot:'}
          </span>
          <span className="px-2 bg-gray-100 rounded-l">$</span>
          <input
            type="number"
            value={spot}
            onChange={e => setSpot(e.target.value)}
            className="flex-1 text-sm border-t border-b border-r px-2 py-1 rounded-r"
          />
        </div>
        <div className="flex items-center text-sm">
          <span className="w-24">C. RED:</span>
          <span className="px-2 bg-gray-100 rounded-l">$</span>
          <input
            type="number"
            value={networkFee}
            onChange={e => setNetworkFee(e.target.value)}
            className="flex-1 text-sm border-t border-b border-r px-2 py-1 rounded-r"
          />
        </div>
      </div>

      {/* Desglose (solo operador) */}
      {mode === 'operador' && (
        <div className="text-sm bg-gray-50 p-2 rounded mb-4 space-y-1">
          <div className="flex justify-between">
            <span>Precio spot</span>
            <span>${spotNum.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span>Comisión Bitso</span>
            <span>${bitsoFee.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span>Comisión Banca</span>
            <span>${bancaFee.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span>Comisión Binance</span>
            <span style={{ color: op.color, fontWeight: 'bold' }}>
              {binanceFee!=null ? `$${binanceFee.toFixed(3)}` : 'NA'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Costo de red</span>
            <span>{NETWORK_COST} USDT</span>
          </div>
        </div>
      )}

      {/* Resultado */}
      <div className="text-center text-lg font-semibold mb-4">
        {finalAmount.toLocaleString(undefined,{minimumFractionDigits:3})} USDT
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
