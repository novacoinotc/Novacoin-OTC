 // src/components/BitsoPanel.js
 import React, { useState, useEffect } from 'react';
+import CryptoJS from 'crypto-js';

 export default function BitsoPanel() {
   const [ticker, setTicker] = useState(null);
   const [error, setError] = useState('');
+
+  // Lee tus credenciales desde el .env
+  const API_KEY    = process.env.REACT_APP_BITSO_API_KEY;
+  const API_SECRET = process.env.REACT_APP_BITSO_API_SECRET;

   useEffect(() => {
-    // Ejemplo: public endpoint para BTC/MXN
-    fetch('https://api.bitso.com/v3/ticker/?book=btc_mxn')
+    // Ahora llamamos al endpoint protegido /v3/balance/
+    const fetchBalance = async () => {
+      try {
+        // Nonce (marca de tiempo en segundos)
+        const nonce = Math.floor(Date.now() / 1000).toString();
+        const method = 'GET';
+        const path   = '/v3/balance/';
+        // Firma HMAC SHA256 sobre string: nonce + método + ruta
+        const signature = CryptoJS.HmacSHA256(nonce + method + path, API_SECRET).toString();
+
+        const res = await fetch(`https://api.bitso.com${path}`, {
+          method,
+          headers: {
+            'Authorization': `Bitso ${API_KEY}:${signature}`,
+            'Bitso-Nonce':   nonce,
+            'Content-Type':  'application/json'
+          }
+        });
+        const data = await res.json();
+        if (!data.success) throw new Error(data.error.message || 'Bitso error');
+        setTicker(data.payload);
+      } catch (e) {
+        setError(e.message || 'Error de red');
+      }
+    };

+    fetchBalance();
   }, []);

   return (
     <div className="bg-white shadow-lg rounded-xl p-4">
       <h2 className="text-xl font-bold mb-4">Bitso · Tu Saldo</h2>
       {error && <p className="text-red-500">{error}</p>}
-      {!ticker && !error && <p>Cargando...</p>}
-      {ticker && (
-        <table className="w-full text-sm">
-          <tbody>
-            <tr>
-              <td>Ultimo precio</td>
-              <td className="text-right">${parseFloat(ticker.last).toLocaleString()}</td>
-            </tr>
-            <tr>
-              <td>Máximo 24h</td>
-              <td className="text-right">${parseFloat(ticker.high).toLocaleString()}</td>
-            </tr>
-            <tr>
-              <td>Mínimo 24h</td>
-              <td className="text-right">${parseFloat(ticker.low).toLocaleString()}</td>
-            </tr>
-            <tr>
-              <td>Volumen 24h</td>
-              <td className="text-right">{parseFloat(ticker.volume).toLocaleString()} BTC</td>
-            </tr>
-          </tbody>
-        </table>
-      )}
+      {!ticker && !error && <p>Cargando saldo privado…</p>}
+      {ticker && (
+        <table className="w-full text-sm">
+          <thead>
+            <tr>
+              <th>Moneda</th><th className="text-right">Disponible</th>
+            </tr>
+          </thead>
+          <tbody>
+            {ticker.map(linea => (
+              <tr key={linea.currency}>
+                <td>{linea.currency}</td>
+                <td className="text-right">{parseFloat(linea.available).toLocaleString()}</td>
+              </tr>
+            ))}
+          </tbody>
+        </table>
+      )}
     </div>
   );
 }