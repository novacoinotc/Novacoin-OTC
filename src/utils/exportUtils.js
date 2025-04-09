const generateExcelData = (clients) => {
  const headers = [
    'Nombre', 
    'Saldo Actual', 
    'Fecha Registro', 
    'Total Transacciones'
  ];

  const data = clients.map(client => [
    client.name,
    client.balance,
    new Date(client.createdAt).toLocaleDateString(),
    client.transactions.length
  ]);

  return { headers, data };
};

const generatePDFContent = (clients) => {
  const generateTransactionTable = (transactions) => {
    return transactions.map(t => `
      <tr>
        <td>${new Date(t.timestamp).toLocaleString()}</td>
        <td>${t.type}</td>
        <td>$${Math.abs(t.amount).toLocaleString()}</td>
      </tr>
    `).join('');
  };

  const clientsHTML = clients.map(client => `
    <div style="margin-bottom: 20px; border: 1px solid #e0e0e0; padding: 15px; border-radius: 8px;">
      <h2>${client.name}</h2>
      <p>Saldo Actual: $${client.balance.toLocaleString()}</p>
      <p>Fecha Registro: ${new Date(client.createdAt).toLocaleDateString()}</p>
      
      <h3>Historial de Transacciones</h3>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          ${generateTransactionTable(client.transactions)}
        </tbody>
      </table>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reporte Financiero Novacoin OTC</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; }
          table { margin-top: 10px; }
          th, td { padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Reporte Financiero Novacoin OTC</h1>
        <p>Fecha de Generación: ${new Date().toLocaleString()}</p>
        ${clientsHTML}
      </body>
    </html>
  `;
};

export const exportToExcel = (clients) => {
  const { headers, data } = generateExcelData(clients);
  
  const worksheet = [headers, ...data];
  const csvContent = worksheet.map(e => e.join(",")).join("\n");
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "novacoin_report.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToPDF = (clients) => {
  const pdfContent = generatePDFContent(clients);
  const blob = new Blob([pdfContent], { type: 'text/html' });
  const link = document.createElement('a');
  
  link.href = URL.createObjectURL(blob);
  link.download = 'novacoin_report.html';
  link.click();
};

// Resto de los archivos permanecen igual que en la versión anterior, 
// solo cambiando referencias de "FinTrack Pro" a "Novacoin OTC"

// DONE