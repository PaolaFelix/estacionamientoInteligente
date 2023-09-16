const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

// Estado inicial del estacionamiento
let estadoEstacionamiento = [
  0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0
];

// Función para obtener una lista de lugares de estacionamiento disponibles
function obtenerEstacionamientosDisponibles() {
  const estacionamientosDisponibles = [];

  for (let i = 0; i < estadoEstacionamiento.length; i++) {
    if (estadoEstacionamiento[i] === 0) {
      estacionamientosDisponibles.push({
        numero: i + 1,
        tipo: i % 10 === 9 ? 'discapacitado' : i % 2 === 0 ? 'grande' : 'chico'
      });
    }
  }

  return estacionamientosDisponibles;
}

// Función para asignar un lugar de estacionamiento según el tipo de carro
function asignarEstacionamiento(carroTipo) {
  let startIndex = -1;

  if (carroTipo === 'grande') {
    startIndex = 0; 
  } else if (carroTipo === 'chico') {
    startIndex = 1; 
  } else if (carroTipo === 'discapacitado') {
    startIndex = 9; 
  }

  if (startIndex === -1) {
    return { mensaje: 'Tipo de carro no válido.' };
  }

  for (let i = startIndex; i < estadoEstacionamiento.length; i += 10) {
    if (estadoEstacionamiento[i] === 0) {
      estadoEstacionamiento[i] = 1; 
      return {
        mensaje: `Se asignó el lugar ${i + 1} para un carro ${carroTipo}.`,
        numeroLugar: i + 1
      };
    }
  }

  return { mensaje: 'No hay lugares disponibles para su tipo de carro en este momento.' };
}



// Función para liberar un lugar de estacionamiento y calcular el costo
function liberarEstacionamiento(numeroLugar, duration) {
  if (
    isNaN(numeroLugar) ||
    numeroLugar < 1 ||
    numeroLugar > estadoEstacionamiento.length ||
    estadoEstacionamiento[numeroLugar - 1] === 0
  ) {
    return { mensaje: 'Número de lugar de estacionamiento no válido o el lugar está vacío.' };
  }

  estadoEstacionamiento[numeroLugar - 1] = 0; 
  const total = Math.ceil(duration / 60) * 15;
  return {
    mensaje: `El lugar de estacionamiento ${numeroLugar} ha sido desocupado.`,
    montoAPagar: total
  };
}

// Rutas
app.get('/disponibilidad', (req, res) => {
  const estacionamientosDisponibles = obtenerEstacionamientosDisponibles();
  if (estacionamientosDisponibles.length > 0) {
    res.status(200).json(estacionamientosDisponibles);
  } else {
    res.status(404).json({ mensaje: 'No hay lugares de estacionamiento disponibles en este momento.' });
  }
});

app.put('/seleccionar-estacionamiento/:carroTipo', (req, res) => {
  const carroTipo = req.params.carroTipo;
  const asignacion = asignarEstacionamiento(carroTipo);
  if (asignacion.mensaje.startsWith('Se asignó el lugar')) {
    res.status(200).json(asignacion);
  } else {
    res.status(400).json(asignacion);
  }
});

app.put('/salir-y-calcular-pago/:numeroLugar', (req, res) => {
  const numeroLugar = parseInt(req.params.numeroLugar);
  const duration = parseInt(req.query.duration) || 0;
  const resultado = liberarEstacionamiento(numeroLugar, duration);
  if (resultado.mensaje.startsWith('El lugar de estacionamiento')) {
    res.status(200).json(resultado);
  } else {
    res.status(400).json(resultado);
  }
});





