const express = require('express'); // import libreria express
const app = express(); //instancia 

app.use(express.json()); // interprete de html en formato json

// Ruta para registrar usuarios
app.post('/api/usuarios', (req, res) => {
  const usuario = req.body;
  console.log('Usuario recibido:', usuario);
  res.status(201).json({ mensaje: 'Usuario registrado con éxito', data: usuario });
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});

app.get('/', (req, res) => {
  res.send('Servidor activo y escuchando');
});
