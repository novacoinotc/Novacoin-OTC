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

  // Estados principales
  const [mode, setMode]             = useState('cliente')
  const [depositRaw, setDepositRaw] = useState(() => localStorage.getItem('op_deposit') || '')
  const [tcRaw, setTcRaw]           = useState(() => localStorage.getItem('op_spot') || '')
  const [operator, setOperator]     = useState(() => localStorage.getItem('op_operator') || 'Issac')
  const [history, setHistory]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('op_history')) || [] }
    catch { return [] }
  })
  const [lastFolio, setLastFolio]   = useState('')

  // Filtros del historial
  const [filterMode, setFilterMode]         = useState('all')
  const [filterOperator, setFilterOperator] = useState('all')
  const [filterFolio, setFilterFolio]       = useState('')

  // Persistencia
  useEffect(() => { localStorage.setItem('op_deposit', depositRaw) },   [depositRaw])
  useEffect(() => { localStorage.setItem('op_spot',    tcRaw)      },   [tcRaw])
  useEffect(() => { localStorage.setItem('op_operator',operator)   },   [operator])
  useEffect(() => { localStorage.setItem('op_history', JSON.stringify(history)) }, [history])

  // Parseos numéricos
  const depNum = parseFloat(depositRaw.replace(/,/g, '')) || 0
  const tcNum  = parseFloat(tcRaw) || 1

  // Operador actual
  const op = OPERATORS.find(o => o.name === operator) || OPERATORS[0]
  const isSpecial = operator === 'Andres' || operator === 'German'
  const offsetDisplay = isSpecial ? 0.03 : 0.05

  // Cálculo de USDT
  const denomCalc = mode === 'cliente'
    ? tcNum
    : tcNum + 0.03
  const usdtAmount = depNum / denomCalc - NETWORK_COST

  // Formato con comas
  const handleDepositBlur = () => {
    if (!depositRaw) return
    const num = parseFloat(depositRaw.replace(/,/g, '')) || 0
    setDepositRaw(num.toLocaleString())
  }
  const handleDepositFocus = () => {
    setDepositRaw(depositRaw.replace(/,/g, ''))
  }

  // Firmar cotización
  const handleSign = () => {
    const folio = Date.now().toString(36).toUpperCase()
    const now   = new Date().toLocaleString()
    const record = {
      folio,
      fecha: now,
      modo: mode,
      operador: mode === 'operador' ? operator : '—',
      depositado: depNum.toLocaleString(),
      tc: tcNum.toFixed(3),
      costoFinal: (tcNum + (mode==='cliente'?0:offsetDisplay)).toFixed(3),
      resultadoUSDT: isNaN(usdtAmount) ? '0.000' : usdtAmount.toFixed(3),
    }
    setHistory([record, ...history])
    setLastFolio(folio)
  }

  // Historial filtrado
  const filteredHistory = history.filter(h => {
    const okMode  = filterMode     === 'all'     || h.modo     === filterMode
    const okOp    = filterOperator === 'all'     || h.operador === filterOperator
    const okFolio = !filterFolio    || h.folio.includes(filterFolio)
    return okMode && okOp && okFolio
  })

  return (
    <div className="space-y-6 px-4">

      {/* ─── Caja de Cotización ───────────────────────────────────────────── */}
      <div
        ref={ref}
        className="max-w-sm mx-auto p-4 rounded-xl shadow-lg bg-[#0f0d33] text-white space-y-3"
        style={{ border: `3px solid ${op.color}` }}
      >
        {/* Logo (más grande) */}
        <img
          src="https://i.ibb.co/nThZb3q/NOVACOIN-1.png"
          alt="NovaCoin"
          className="mx-auto mb-2 w-32"
        />

        {/* Título */}
        <h2 className="text-lg font-bold text-center">
          NovaCoin · {mode === 'cliente' ? 'Cliente' : 'Operador'}
        </h2>

        {/* Modo */}
        <div className="flex justify-center gap-2">
          {['cliente','operador'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-sm rounded-full ${
                mode === m
                  ? 'bg-white text-[#0f0d33]'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {m === 'cliente' ? 'Cliente' : 'Operador'}
            </button>
          ))}
        </div>

        {/* Operador (solo operador, caja recortada) */}
        {mode === 'operador' && (
          <div className="flex items-center text-sm">
            <label className="w-20">Operador</label>
            <select
              className="w-32 text-sm rounded px-2 py-1 text-[#0f0d33]"
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
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <span className="w-20">Depositado:</span>
            <span className="px-2 bg-[#0f0d33] rounded-l">$</span>
            <input
              type="text"
              value={depositRaw}
              onChange={e => setDepositRaw(e.target.value)}
              onBlur={handleDepositBlur}
              onFocus={handleDepositFocus}
              className="w-24 text-sm px-2 py-1 rounded-r border-none bg-[#0f0d33] text-white"
            />
          </div>
          <div className="flex items-center text-sm">
            <span className="w-20">{mode==='cliente'?'TC Spot:':'Precio Spot:'}</span>
            <span className="px-2 bg-[#0f0d33] rounded-l">$</span>
            <input
              type="number"
              value={tcRaw}
              onChange={e => setTcRaw(e.target.value)}
              className="w-24 text-sm px-2 py-1 rounded-r border-none bg-[#0f0d33] text-white"
            />
          </div>
        </div>

        {/* Desglose para operador */}
        {mode === 'operador' && (
          <div className="text-sm bg-[#0f0d33] bg-opacity-80 p-2 rounded space-y-1">
            <div className="flex justify-between">
              <span>Precio spot</span>
              <span>${tcNum.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo final</span>
              <span className="font-bold">${(tcNum + offsetDisplay).toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo de red</span>
              <span>{NETWORK_COST} USDT</span>
            </div>
          </div>
        )}

        {/* Resultado */}
        <div className="text-center text-xl font-semibold">
          {isNaN(usdtAmount)
            ? '0.000 USDT'
            : `${usdtAmount.toFixed(3)} USDT`
          }
        </div>

        {/* Folio */}
        {lastFolio && (
          <div className="text-center text-sm">
            Folio: <span className="font-mono">{lastFolio}</span>
          </div>
        )}
      </div>

      {/* ─── Botón Firmar fuera del recuadro ───────────────────────────────── */}
      <div className="max-w-sm mx-auto text-center">
        <button
          onClick={handleSign}
          className="px-6 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-500"
        >
          Firmar
        </button>
      </div>

      {/* ─── Historial de Cotizaciones (más ancho) ──────────────────────────── */}
      <div className="max-w-xl mx-auto p-4 rounded-xl shadow-lg bg-[#0f0d33] text-white space-y-3">
        <h3 className="text-sm font-medium">Historial de Cotizaciones</h3>

        {/* Filtros */}
        <div className="flex gap-2 text-xs mb-2">
          <input
            type="text"
            placeholder="Folio..."
            value={filterFolio}
            onChange={e => setFilterFolio(e.target.value)}
            className="flex-1 border px-2 py-1 rounded bg-white text-black"
          />
          <select
            className="flex-1 border px-2 py-1 rounded bg-white text-black"
            value={filterMode}
            onChange={e => setFilterMode(e.target.value)}
          >
            <option value="all">Todos modos</option>
            <option value="cliente">Cliente</option>
            <option value="operador">Operador</option>
          </select>
          <select
            className="flex-1 border px-2 py-1 rounded bg-white text-black"
            value={filterOperator}
            onChange={e => setFilterOperator(e.target.value)}
          >
            <option value="all">Todos operadores</option>
            {OPERATORS.map(o => (
              <option key={o.name} value={o.name}>{o.name}</option>
            ))}
          </select>
        </div>

        {/* Tabla */}
        <div className="max-h-80 overflow-y-auto text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-1">Folio</th>
                <th className="border px-1">Fecha</th>
                <th className="border px-1">Modo</th>
                <th className="border px-1">Operador</th>
                <th className="border px-1">Dep MXN</th>
                <th className="border px-1">TC</th>
                <th className="border px-1">CFinal</th>
                <th className="border px-1">USDT</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(h => (
                <tr key={h.folio}>
                  <td className="border px-1">{h.folio}</td>
                  <td className="border px-1">{h.fecha}</td>
                  <td className="border px-1">{h.modo}</td>
                  <td className="border px-1">{h.operador}</td>
                  <td className="border px-1">{h.depositado}</td>
                  <td className="border px-1">{h.tc}</td>
                  <td className="border px-1">{h.costoFinal}</td>
                  <td className="border px-1">{h.resultadoUSDT}</td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-2 text-gray-500">
                    Sin cotizaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
