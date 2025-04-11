const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Asegúrate de tener esta dependencia

const app = express();
app.use(cors());
app.use(express.json());

app.post('/proxy-binance', async (req, res) => {
  const { url, method = 'GET', headers = {}, body } = req.body;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: method === 'GET' ? undefined : JSON.stringify(body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al conectar con Binance', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy escuchando en el puerto ${PORT}`);
});
