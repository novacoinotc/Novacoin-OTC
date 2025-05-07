// src/components/Login.js
import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const MAIN_USER = 'direccion@novacoin.mx';
  const MAIN_PWD  = 'IssacVM98';

  const handleSubmit = e => {
    e.preventDefault();
    if (email === MAIN_USER && pass === MAIN_PWD) {
      onLogin({ email });
    } else {
      alert('Credenciales inválidas');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4">
      <h2 className="text-xl mb-4">Iniciar sesión</h2>
      <input
        type="email" placeholder="Email"
        value={email} onChange={e => setEmail(e.target.value)}
        className="block w-full mb-2 p-2 border"
      />
      <input
        type="password" placeholder="Contraseña"
        value={pass} onChange={e => setPass(e.target.value)}
        className="block w-full mb-4 p-2 border"
      />
      <button type="submit" className="w-full bg-blue-600 text-white py-2">
        Entrar
      </button>
    </form>
  );
}