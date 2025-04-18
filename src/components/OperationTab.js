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
  const [depositRaw, setDepositRaw] = useState(() => localStorage.getItem('op_deposit') || '')
  const [tcRaw, setTcRaw]           = useState(() => localStorage.getItem('op_spot')    || '')
  const [operator, setOperator]     = useState(() => localStorage.getItem('op_operator')|| 'Issac')
  const [history, setHistory]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('op_history')) || [] }
    catch { return [] }
  })
  const [lastFolio, setLastFolio]   = useState('')

  // Filtros del historial
  const [filterMode, setFilterMode]       = useState('all')
  const [filterOperator, setFilterOperator] = useState('all')
  const [filterFolio, setFilterFolio]     = useState('')

  // Persistencia
  useEffect(() => { localStorage.setItem('op_deposit', depositRaw) },   [depositRaw])
  useEffect(() => { localStorage.setItem('op_spot',    tcRaw)     },   [tcRaw])
  useEffect(() => { localStorage.setItem('op_operator',operator)  },   [operator])
  useEffect(() => { localStorage.setItem('op_history', JSON.stringify(history)) }, [history])

  // Parseos numéricos
  const depNum = parseFloat(depositRaw.replace(/,/g, '')) || 0
  const tcNum  = parseFloat(tcRaw) || 1

  // Operador actual
  const op = OPERATORS.find(o => o.name === operator) || OPERATORS[0]
  const isSpecial = operator === 'Andres' || operator === 'German'
  const offsetDisplay = isSpecial ? 0.03 : 0.05

  // Cálculos separados
  const usdtCliente  = depNum / tcNum           - NETWORK_COST
  const usdtOperador = depNum / (tcNum + 0.03) - NETWORK_COST

  // Formato con comas
  const handleBlur  = () => {
    if (!depositRaw) return
    const n = parseFloat(depositRaw.replace(/,/g, '')) || 0
    setDepositRaw(n.toLocaleString())
  }
  const handleFocus = () => {
    setDepositRaw(depositRaw.replace(/,/g, ''))
  }

  // Firmar cotización
  const handleSign = () => {
    const folio = Date.now().toString(36).toUpperCase()
    const now   = new Date().toLocaleString()
    const records = [
      {
        folio, fecha: now, modo: 'cliente',  operador: '—',
        depositado: depNum.toLocaleString(),
        tc: tcNum.toFixed(3),
        costoFinal: tcNum.toFixed(3),
        resultadoUSDT: isNaN(usdtCliente)  ? '0.000' : usdtCliente.toFixed(3),
      },
      {
        folio, fecha: now, modo: 'operador', operador,
        depositado: depNum.toLocaleString(),
        tc: tcNum.toFixed(3),
        costoFinal: (tcNum + offsetDisplay).toFixed(3),
        resultadoUSDT: isNaN(usdtOperador) ? '0.000' : usdtOperador.toFixed(3),
      }
    ]
    setHistory(records.concat(history))
    setLastFolio(folio)
  }

  // Historial filtrado
  const filteredHistory = history.filter(h => {
    const okMode  = filterMode     === 'all' || h.modo     === filterMode
    const okOp    = filterOperator === 'all' || h.operador === filterOperator
    const okFolio = !filterFolio || h.folio.includes(filterFolio)
    return okMode && okOp && okFolio
  })

  return (
    <div className="space-y-8 px-4">

      {/* ─── Cliente ────────────────────────────────────────────────────── */}
      <div
        className="max-w-sm mx-auto p-6 rounded-xl shadow-lg bg-[#0f0d33] text-white text-center space-y-4"
      >
        <img
          src="https://i.ibb.co/nThZb3q/NOVACOIN-1.png"
          alt="NovaCoin"
          className="mx-auto mb-2 w-64"
        />
        <h2 className="text-2xl font-bold">NovaCoin · Cliente</h2>

        <div className="space-y-3">
          <div className="flex justify-center items-center gap-2">
            <label className="w-28 text-right">Depositado:</label>
            <input
              type="text"
              value={depositRaw}
              onChange={e => setDepositRaw(e.target.value)}
              onBlur={handleBlur}
              onFocus={handleFocus}
              className="w-28 px-2 py-1 rounded border border-gray-300 bg-white text-black text-center"
            />
          </div>
          <div className="flex justify-center items-center gap-2">
            <label className="w-28 text-right">TC Spot:</label>
            <input
              type="number"
              value={tcRaw}
              onChange={e => setTcRaw(e.target.value)}
              className="w-28 px-2 py-1 rounded border border-gray-300 bg-white text-black text-center"
            />
          </div>
        </div>

        <div className="text-2xl font-semibold">
          {isNaN(usdtCliente)
            ? '0.000 USDT'
            : `${usdtCliente.toFixed(3)} USDT`}
        </div>

        {lastFolio && (
          <div className="text-sm">
            Folio: <code>{lastFolio}</code>
          </div>
        )}
      </div>

      {/* ─── Operador ───────────────────────────────────────────────────── */}
      <div
        className="max-w-sm mx-auto p-6 rounded-xl shadow-lg text-white text-center space-y-4"
        style={{ background: op.color }}
      >
        <img
          src="https://i.ibb.co/nThZb3q/NOVACOIN-1.png"
          alt="NovaCoin"
          className="mx-auto mb-2 w-64"
        />
        <h2 className="text-2xl font-bold">NovaCoin · Operador</h2>

        <div className="flex justify-center items-center gap-2">
          <label className="w-28 text-right">Operador:</label>
          <select
            value={operator}
            onChange={e => setOperator(e.target.value)}
            className="w-32 px-2 py-1 rounded border border-white bg-white text-black text-center"
          >
            {OPERATORS.map(o =>
              <option key={o.name}>{o.name}</option>
            )}
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex justify-center items-center gap-2">
            <label className="w-28 text-right">Depositado:</label>
            <input
              type="text"
              value={depositRaw}
              onChange={e => setDepositRaw(e.target.value)}
              onBlur={handleBlur}
              onFocus={handleFocus}
              className="w-28 px-2 py-1 rounded border border-white bg-white text-black text-center"
            />
          </div>
          <div className="flex justify-center items-center gap-2">
            <label className="w-28 text-right">Precio Spot:</label>
            <input
              type="number"
              value={tcRaw}
              onChange={e => setTcRaw(e.target.value)}
              className="w-28 px-2 py-1 rounded border border-white bg-white text-black text-center"
            />
          </div>
        </div>

        <div className="text-sm bg-white bg-opacity-30 p-2 rounded space-y-1">
          <div>Precio spot: ${tcNum.toFixed(3)}</div>
          <div>Costo final: ${(tcNum + offsetDisplay).toFixed(3)}</div>
          <div>Costo de red: {NETWORK_COST} USDT</div>
        </div>

        <div className="text-2xl font-semibold">
          {isNaN(usdtOperador)
            ? '0.000 USDT'
            : `${usdtOperador.toFixed(3)} USDT`}
        </div>

        {lastFolio && (
          <div className="text-sm">
            Folio: <code>{lastFolio}</code>
          </div>
        )}
      </div>

      {/* ─── Firmar ─────────────────────────────────────────────────────── */}
      <div className="max-w-sm mx-auto text-center">
        <button
          onClick={handleSign}
          className="px-6 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-500"
        >
          Firmar
        </button>
      </div>

      {/* ─── Historial ──────────────────────────────────────────────────── */}
      <div className="max-w-xl mx-auto p-4 rounded-xl shadow-lg bg-[#0f0d33] text-white space-y-3">
        <h3 className="text-sm font-medium text-center">Historial de Cotizaciones</h3>

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
              <option key={o.name}>{o.name}</option>
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
                  <td colSpan={8} className="text-center py-2 text-gray-400">
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
