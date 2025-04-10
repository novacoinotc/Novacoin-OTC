import * as XLSX from 'xlsx';

const groupTransactionsByClient = (transactions) => {
  const grouped = {};
  transactions.forEach(tx => {
    if (!grouped[tx.clientName]) {
      grouped[tx.clientName] = [];
    }
    grouped[tx.clientName].push(tx);
  });
  return grouped;
};

// 📦 Exportar a Excel
export const exportToExcel = (transactions) => {
  const wb = XLSX.utils.book_new();
  const grouped = groupTransactionsByClient(transactions);

  // 📄 Hoja de resumen
  const resumenData = Object.entries(grouped).map(([clientName, txs]) => {
    const ingresos = txs.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const egresos = txs.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
    const saldo = ingresos + egresos;
    return {
      Cliente: clientName,
      Ingresos: ingresos,
      Egresos: Math.abs(egresos),
      'Saldo Disponible': saldo
    };
  });

  const resumenSheet = XLSX.utils.json_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(wb, resumenSheet, 'Resumen General');

  // 📄 Hojas por cliente
  Object.entries(grouped).forEach(([clientName, txs]) => {
    const sorted = [...txs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const rows = sorted.map(t => ({
      Fecha: new Date(t.timestamp).toLocaleString(),
      Concepto: t.concept || '',
      Ingreso: t.amount > 0 ? t.amount : '',
      Egreso: t.amount < 0 ? Math.abs(t.amount) : ''
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, sheet, clientName.substring(0, 31));
  });

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'novacoin_export.xlsx';
  link.click();
};

// 📄 Exportar a PDF (como HTML embebido)
export const exportToPDF = (transactions) => {
  const grouped = groupTransactionsByClient(transactions);

  const content = Object.entries(grouped).map(([clientName, txs]) => {
    const ingresos = txs.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const egresos = txs.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
    const saldo = ingresos + egresos;

    const rows = txs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(t => `
        <tr>
          <td>${new Date(t.timestamp).toLocaleString()}</td>
          <td>${t.concept || ''}</td>
          <td>${t.amount > 0 ? `$${t.amount.toLocaleString()}` : ''}</td>
          <td>${t.amount < 0 ? `$${Math.abs(t.amount).toLocaleString()}` : ''}</td>
        </tr>
      `).join('');

    return `
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <h2>${clientName}</h2>
        <p><strong>Ingresos:</strong> $${ingresos.toLocaleString()}</p>
        <p><strong>Egresos:</strong> $${Math.abs(egresos).toLocaleString()}</p>
        <p><strong>Saldo Disponible:</strong> $${saldo.toLocaleString()}</p>

        <table width="100%" border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th>Fecha</th>
              <th>Concepto</th>
              <th>Ingreso</th>
              <th>Egreso</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Reporte Novacoin OTC</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { text-align: center; margin-bottom: 40px; }
        </style>
      </head>
      <body>
        <h1>Reporte Novacoin OTC</h1>
        <p>Fecha de generación: ${new Date().toLocaleString()}</p>
        ${content}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'novacoin_reporte.html';
  link.click();
};
