// src/components/OperationTab.js
import React, { useState, useEffect, useRef } from 'react'

// Lista de operadores y sus colores + reglas
const OPERATORS = [
  { name: 'Gael',      color: '#FACC15', purchaseOffset: 0.02, saleOffset: 0.05, usePurchaseForFinal: true },
  { name: 'Christian', color: '#F97316', purchaseOffset: 0.02, saleOffset: 0.05, usePurchaseForFinal: true },
  { name: 'Santy',     color: '#3B82F6', purchaseOffset: 0.02, saleOffset: 0.05, usePurchaseForFinal: true },
  { name: 'Flaco',     color: '#7F1D1D', purchaseOffset: 0.02, saleOffset: 0.05, usePurchaseForFinal: true },
  { name: 'Andy',      color: '#EC4899', purchaseOffset: 0.02, saleOffset: 0.05, usePurchaseForFinal: true },
  { name: 'Issac',     color: '#8B5CF6', purchaseOffset: 0.02, saleOffset: 0.05, usePurchaseForFinal: true },
  { name: 'Andres',    color: '#22C55E', purchaseOffset: 0.00, saleOffset: 0.03, usePurchaseForFinal: false },
  { name: 'German',    color: '#A5B4FC', purchaseOffset: 0.00, saleOffset: 0.03, usePurchaseForFinal: false },
]

// Comisión fija de red
const NETWORK_COST = 2 // USDT

export default function OperationTab() {
  const containerRef = useRef(null)

  // Estado y carga/guarda en localStorage
  const [mode, setMode]       = useState('cliente')  // 'cliente' o 'operador'
  const [deposited, setDeposited]   = useState(() => localStorage.getItem('op_deposit')   || '')
  const [tc, setTc]                 = useState(() => localStorage.getItem('op_tc')        || '')
  const [spot, setSpot]             = useState(() => localStorage.getItem('op_spot')      || '')
  const [networkFee, setNetworkFee] = useState(() => localStorage.getItem('op_fee')       || '')
  const [operator, setOperator]     = useState(() => localStorage.getItem('op_operator')  || 'Issac')

  useEffect(() => { localStorage.setItem('op_deposit', deposited) },   [deposited])
  useEffect(() => { localStorage.setItem('op_tc',      tc)       },   [tc])
  useEffect(() => { localStorage.setItem('op_spot',    spot)     },   [spot])
  useEffect(() => { localStorage.setItem('op_fee',     networkFee)  }, [networkFee])
  useEffect(() => { localStorage.setItem('op_operator',operator) },   [operator])

  // Números seguros
  const depNum  = parseFloat(deposited)   || 0
  const tcNum   = parseFloat(tc)          || 0
  const spotNum = parseFloat(spot)        || 0
  const fee     = parseFloat(networkFee)  || NETWORK_COST

  // Encuentra el operador actual
  const op = OPERATORS.find(o => o.name === operator) || OPERATORS[5]

  // Precios
  const buyPrice  = mode === 'cliente' ? tcNum          : spotNum + op.purchaseOffset
  const sellPrice = mode === 'cliente' ? tcNum          : spotNum + op.saleOffset

  // Cálculo
  const rawAmount = depNum / (buyPrice || 1)
  const finalAmount = mode === 'cliente'
    ? depNum / (buyPrice || 1) - fee
    : op.usePurchaseForFinal
      ? rawAmount - NETWORK_COST
      : depNum / (spotNum || 1) - NETWORK_COST

  // Copiar como imagen
  const copyAsImage = async () => {
    if (!containerRef.current || !window.html2canvas) return
    const canvas = await window.html2canvas(containerRef.current)
    canvas.toBlob(blob => {
      if (!blob) return
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    })
  }

  // Limpiar entradas
  const clearFields = () => {
    setDeposited('')
    setTc('')
    setSpot('')
    setNetworkFee('')
  }

  return (
    <div
      ref={containerRef}
      className="max-w-lg mx-auto p-6 rounded-3xl shadow-2xl"
      style={{ border: `4px solid ${op.color}` }}
    >
      {/* Título */}
      <h2
        className="text-2xl font-bold text-center mb-6"
        style={{ color: op.color }}
      >
        NovaCoin · {mode === 'cliente' ? 'Cliente' : 'Operador'}
      </h2>

      {/* Cambiar modo */}
      <div className="flex justify-center gap-4 mb-6">
        {['cliente','operador'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-6 py-2 rounded-full transition ${
              mode === m ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {m === 'cliente' ? 'Cliente' : 'Operador'}
          </button>
        ))}
      </div>

      {/* Selector operador (sólo operador) */}
      {mode === 'operador' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Operador</label>
          <select
            className="w-full border px-3 py-2 rounded-lg"
            value={operator}
            onChange={e => setOperator(e.target.value)}
          >
            {OPERATORS.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
          </select>
        </div>
      )}

      {/* Entradas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm">Depositado (MXN)</label>
          <input
            type="number"
            value={deposited}
            onChange={e => setDeposited(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="MXN"
          />
        </div>
        {mode === 'cliente' ? (
          <div>
            <label className="block text-sm">TC (USDT/MXN)</label>
            <input
              type="number"
              value={tc}
              onChange={e => setTc(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
              placeholder="TC"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm">Spot (MXN/USDT)</label>
            <input
              type="number"
              value={spot}
              onChange={e => setSpot(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
              placeholder="Spot"
            />
          </div>
        )}
        <div>
          <label className="block text-sm">C. RED (USDT)</label>
          <input
            type="number"
            value={networkFee}
            onChange={e => setNetworkFee(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Red"
          />
        </div>
      </div>

      {/* Cotización */}
      <div className="bg-gray-100 p-4 rounded-xl mb-6 space-y-2">
        <div className="flex justify-between">
          <span>TC Spot</span>
          <span>${(mode==='cliente' ? tcNum : spotNum).toFixed(3)}</span>
        </div>

        {mode==='operador' && (
          <>
            <div className="flex justify-between">
              <span>Precio compra</span>
              <span>${buyPrice.toFixed(3)}</span>
            </div>

            {/* Fila remarcada en color del operador */}
            <div className="flex justify-between">
              <span style={{ color: op.color, fontWeight: 'bold' }}>
                Precio venta
              </span>
              <span style={{ color: op.color, fontWeight: 'bold' }}>
                ${sellPrice.toFixed(3)}
              </span>
            </div>
          </>
        )}

        <div className="flex justify-between">
          <span>C. RED</span>
          <span>{NETWORK_COST} USDT</span>
        </div>
      </div>

      {/* Resultado */}
      <div className="text-center text-xl font-bold mb-6">
        {finalAmount.toLocaleString(undefined,{minimumFractionDigits:3})} USDT
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          onClick={copyAsImage}
          className="flex-1 bg-gray-800 text-white py-2 rounded-full hover:bg-gray-700"
        >
          📸 Copiar imagen
        </button>
        <button
          onClick={clearFields}
          className="flex-1 bg-red-600 text-white py-2 rounded-full hover:bg-red-500"
        >
          ❌ Limpiar
        </button>
      </div>
    </div>
  )
}
