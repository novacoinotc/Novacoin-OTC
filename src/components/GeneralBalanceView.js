// src/components/GeneralBalanceView.js
import React, { useMemo, useState } from 'react';

/**
 * Este dashboard usa los datos que ya recibe tu app:
 * - `clients`: arreglo de clientes con { id, name, balance, lastUpdated, transactions[] }
 * - Cada transaction suele ser: { id, type: 'deposit'|'withdraw', amount: number (+/-), concept, timestamp }
 *
 * No requiere librerías nuevas. Solo Tailwind (ya está).
 */

const GeneralBalanceView = ({ clients }) => {
  // ====== FILTROS ======
  const [range, setRange] = useState('30d'); // '7d' | '30d' | '90d' | 'ytd' | 'all'
  const [query, setQuery] = useState('');    // búsqueda por cliente o concepto

  const now = new Date();
  const { from, to } = useMemo(() => {
    let from = null;
    let to = new Date(now);
    to.setHours(23, 59, 59, 999);

    const startOfYear = new Date(now.getFullYear(), 0, 1);

    if (range === '7d') {
      from = new Date(now);
      from.setDate(now.getDate() - 6);
      from.setHours(0, 0, 0, 0);
    } else if (range === '30d') {
      from = new Date(now);
      from.setDate(now.getDate() - 29);
      from.setHours(0, 0, 0, 0);
    } else if (range === '90d') {
      from = new Date(now);
      from.setDate(now.getDate() - 89);
      from.setHours(0, 0, 0, 0);
    } else if (range === 'ytd') {
      from = new Date(startOfYear);
      from.setHours(0, 0, 0, 0);
    } else {
      // 'all'
      from = null;
    }
    return { from, to };
  }, [range]);

  // ====== TRANSACCIONES NORMALIZADAS ======
  const allTransactions = useMemo(() => {
    const list = clients.flatMap(c =>
      (c.transactions || []).map(t => ({
        ...t,
        clientId: c.id,
        clientName: c.name || '—',
        _date: toDate(t.timestamp) || toDate(c.lastUpdated) || new Date(0),
      }))
    );

    // filtros por fecha y búsqueda
    return list.filter(t => {
      const inRange =
        (!from || t._date >= from) &&
        (!to   || t._date <= to);
      const text = `${t.clientName} ${t.concept || ''}`.toLowerCase();
      const byQuery = query ? text.includes(query.toLowerCase()) : true;
      return inRange && byQuery;
    });
  }, [clients, from, to, query]);

  // ====== KPIs ======
  const saldoTotal = useMemo(() => {
    return clients.reduce((acc, c) => acc + Number(c.balance || 0), 0);
  }, [clients]);

  const { totalIngresos, totalEgresosAbs, clientesActivos } = useMemo(() => {
    const ingresos = allTransactions
      .filter(t => Number(t.amount) > 0)
      .reduce((s, t) => s + Number(t.amount), 0);

    const egresosAbs = allTransactions
      .filter(t => Number(t.amount) < 0)
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

    const activos = new Set(allTransactions.map(t => t.clientId)).size;

    return { totalIngresos: ingresos, totalEgresosAbs: egresosAbs, clientesActivos: activos };
  }, [allTransactions]);

  // ====== LISTA RECIENTES ======
  const recientes = useMemo(() => {
    return [...allTransactions]
      .sort((a, b) => b._date - a._date)
      .slice(0, 20);
  }, [allTransactions]);

  // ====== RENDER ======
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Dashboard de Flujos</h1>
          <p className="text-gray-500">Resumen rápido de ingresos, egresos y saldo por cliente.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Búsqueda */}
          <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              className="bg-transparent outline-none text-sm"
              placeholder="Buscar cliente o concepto…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Rangos */}
          {['7d','30d','90d','ytd','all'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-xl border px-3 py-1.5 text-sm ${range === r ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}
              title={labelRange(r)}
            >
              {labelChip(r)}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Saldo total"
          value={formatCurrency(saldoTotal)}
          hint={`${labelRange(range)} • ${clients.length} clientes`}
        />
        <KpiCard
          title="Ingresos"
          value={formatCurrency(totalIngresos)}
          hint="Suma de depósitos en el rango"
          tone="green"
        />
        <KpiCard
          title="Egresos"
          value={formatCurrency(totalEgresosAbs)}
          hint="Suma de retiros en el rango"
          tone="red"
        />
        <KpiCard
          title="Clientes activos"
          value={String(clientesActivos)}
          hint="Con movimientos en el rango"
        />
      </div>

      {/* Tarjetas por cliente (saldo) */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Saldos por cliente</h3>
          <span className="text-xs text-gray-500">Ordenado por último movimiento</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {clients
            .slice()
            .sort((a, b) => (toDate(b.lastUpdated) || new Date(0)) - (toDate(a.lastUpdated) || new Date(0)))
            .map(c => (
              <ClientCard key={c.id} client={c} />
            ))
          }
        </div>
      </div>

      {/* Movimientos recientes */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Movimientos recientes</h3>
          <span className="text-xs text-gray-500">Mostrando {recientes.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="py-2 text-left">Fecha</th>
                <th className="py-2 text-left">Cliente</th>
                <th className="py-2 text-left">Tipo</th>
                <th className="py-2 text-right">Monto</th>
                <th className="py-2 text-left">Concepto</th>
              </tr>
            </thead>
            <tbody>
              {recientes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-400">Sin movimientos en este rango</td>
                </tr>
              ) : (
                recientes.map(t => (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    <td className="py-2">{formatDate(t._date)}</td>
                    <td className="py-2">{t.clientName}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        Number(t.amount) >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {Number(t.amount) >= 0 ? 'ingreso' : 'egreso'}
                      </span>
                    </td>
                    <td className={`py-2 text-right font-medium ${
                      Number(t.amount) >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {formatCurrency(Math.abs(Number(t.amount) || 0))}
                    </td>
                    <td className="py-2 max-w-[360px] truncate" title={t.concept || ''}>
                      {t.concept || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="py-6 text-center text-xs text-gray-400">
        Actualizado en tiempo real • Sin necesidad de recargar
      </div>
    </div>
  );
};

/* ===================== Subcomponentes ===================== */

const KpiCard = ({ title, value, hint, tone }) => {
  const ring =
    tone === 'green' ? 'border-l-4 border-green-500' :
    tone === 'red'   ? 'border-l-4 border-red-500'   :
                       'border-l-4 border-gray-300';

  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 border ${ring}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

const ClientCard = ({ client }) => {
  const positive = Number(client.balance || 0) >= 0;
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 border
      ${positive ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-semibold">{client.name || '—'}</h4>
          <p className="text-xs text-gray-500">Último: {formatDate(toDate(client.lastUpdated))}</p>
        </div>
        <div className={`text-lg font-bold ${positive ? 'text-green-700' : 'text-red-700'}`}>
          {formatCurrency(Number(client.balance || 0))}
        </div>
      </div>
    </div>
  );
};

/* ===================== Utilidades ===================== */

function toDate(v) {
  try {
    if (!v) return null;
    if (typeof v?.toDate === 'function') return v.toDate(); // Firestore Timestamp
    if (typeof v === 'string') {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }
    if (v instanceof Date) return v;
    return null;
  } catch {
    return null;
  }
}

function formatCurrency(n) {
  const num = Number(n || 0);
  return num.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('es-MX', {
      year: '2-digit', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return '—';
  }
}

function labelRange(r) {
  switch (r) {
    case '7d':  return 'Últimos 7 días';
    case '30d': return 'Últimos 30 días';
    case '90d': return 'Últimos 90 días';
    case 'ytd': return 'Año en curso';
    default:    return 'Todo el histórico';
  }
}

function labelChip(r) {
  switch (r) {
    case '7d':  return '7d';
    case '30d': return '30d';
    case '90d': return '90d';
    case 'ytd': return 'YTD';
    default:    return 'Todo';
  }
}

export default GeneralBalanceView;
