const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);


async function connectToDatabase() {
    try {
      await client.connect();
      console.log("Conectado a MongoDB en api.js");
      return true;
    } catch (error) {
      console.error("Error al conectar a MongoDB:");
      console.error("Mensaje:", error.message);
      console.error("Código:", error.code);
      console.error("Detalles completos:", error);
      return false;
    }
  }

// Ruta para verificar el DNI
app.post('/api-json-user/api/buscarPersonal', async (req, res) => {
    const { dni, ape_pat } = req.body;

    try {
        const database = client.db("dbRiesgo");
        const collection = database.collection("Usuarios");

        // Convertir dni a entero
        const dniInt = parseInt(dni, 10);

        const persona = await collection.findOne({
            ape_p: { $regex: new RegExp(ape_pat, 'i') },
            dni: dniInt // Usar dniInt como número entero
        });

        if (persona) {
            res.json({ success: true, data: persona });
        } else {
            res.json({ success: false, message: "Persona no encontrada" });
        }
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});
// Ruta para verificar el DNI po socio activo
app.post('/api-json-user/api/buscarSocio', async (req, res) => {
    const { dni} = req.body;

    try {
        const database = client.db("dbRiesgo");
        const collection = database.collection("Socio");

        // Convertir dni a entero
        const dniInt = parseInt(dni, 10);

        const persona = await collection.findOne({
            CUENTA: dniInt // Usar dniInt como número entero
        });

        if (persona) {
            res.json({ success: true, data: persona });
        } else {
            res.json({ success: false, message: "Persona no encontrada" });
        }
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

// Ruta para miPerfil
// Función de redondeo personalizada para TEA_INTERES
function roundUpToEven(num) {
    return Math.ceil(num / 2) * 2;
}

// Función para evaluar el riesgo
function evaluarRiesgo(riesgo) {
    if (riesgo >= 0 && riesgo < 0.25) {
        return 'Bueno';
    } else if (riesgo >= 0.25 && riesgo < 0.5) {
        return 'Regular';
    } else if (riesgo >= 0.5 && riesgo <= 1) {
        return 'Malo';
    } else {
        return 'Riesgo fuera de rango'; // Por si acaso el riesgo no está en el rango esperado
    }
}

app.post('/api-json-user/api/miPerfil', async (req, res) => {
    let { CUOTA_FIJA, TEA_INTERES, MONTO_PRESTAMO, EDAD } = req.body;

    // Convertir EDAD a número para asegurar la coincidencia
    EDAD = parseInt(EDAD, 10);

    // Redondear los valores
    const cuotaP = Math.ceil(CUOTA_FIJA / 50) * 50;
    const tea_pro = roundUpToEven(TEA_INTERES); // Redondear hacia el par más próximo
    const montoP = Math.ceil(MONTO_PRESTAMO / 200) * 200;
    const edad_p = EDAD; // EDAD debe ser un número

    console.log(`Datos redondeados - CUOTA_FIJA: ${cuotaP}, TEA_INTERES: ${tea_pro}, MONTO_PRESTAMO: ${montoP}, EDAD: ${edad_p}`);

    try {
        const database = client.db('db_bot');
        const collection = database.collection('miPerfil');

        const perfilRiesgo = await collection.findOne({
            CUOTA_FIJA: cuotaP,
            MONTO_PRESTAMO: montoP,
            TEA_INTERES: tea_pro,
            EDAD: edad_p
        });

        if (perfilRiesgo) {
            const evaluacionRiesgo = evaluarRiesgo(perfilRiesgo.riesgo);
            res.json({
                success: true,
                evaluacion: evaluacionRiesgo
            });
        } else {
            console.log("No se encontraron coincidencias en la base de datos.");
            res.json({
                success: false,
                message: "No se encontraron coincidencias"
            });
        }
    } catch (error) {
        console.error("Error al buscar el perfil de riesgo:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

app.post('/api-json-user/api/perfilsocios', async (req, res) => {
    let { EDAD, TIPO_VIVIENDA, ESTADO_CIVIL, GIROS } = req.body;

    // Convertir EDAD a número para asegurar la coincidencia
    EDAD = parseInt(EDAD, 10);

    console.log(`Datos recibidos - EDAD: ${EDAD}, TIPO_VIVIENDA ${TIPO_VIVIENDA}, ESTADO_CIVIL ${ESTADO_CIVIL}, GIROS ${GIROS}`);

    try {
        await client.connect();
        const database = client.db('db_bot');
        const collection = database.collection('perfilsocios');

        const perfilRiesgo = await collection.findOne({ 
            EDAD: EDAD,
            TIPO_VIVIENDA: TIPO_VIVIENDA,
            ESTADO_CIVIL: ESTADO_CIVIL,
            GIROS:GIROS
         });

        if (perfilRiesgo) {
            res.json({
                success: true,
                riesgo: perfilRiesgo.riesgo
            });
        } else {
            console.log("No se encontraron coincidencias en la base de datos.");
            res.json({
                success: false,
                message: "No se encontraron coincidencias"
            });
        }
    } catch (error) {
        console.error("Error al buscar el perfil de riesgo:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    } finally {
        await client.close();
    }
});
// app.post('/api/saveResponse', async (req, res) => {
//     const { numero } = req.body;

//     if (!numero) {
//         return res.status(400).json({ success: false, message: 'Falta el número de teléfono' });
//     }

//     try {
//         const database = client.db('dbRiesgo');
//         const collection = database.collection('messages');

//         const messageDocument = {
//             numero: numero,
//             timestamp: new Date()
//         };

//         const result = await collection.insertOne(messageDocument);

//         if (result.acknowledged) {
//             console.log('Número guardado correctamente', numero);
//         } else {
//             res.status(500).json({ success: false, message: 'Error al guardar el número' });
//         }
//     } catch (error) {
//         console.error('Error al guardar el número:', error);
//         res.status(500).json({ success: false, message: 'Error interno del servidor' });
//     }
// });

app.post('/api/saveMessage', async (req, res) => {
    const { numero, mensaje, tipo_dato } = req.body;

    console.log('Este es el tipo de datos: ', tipo_dato);
    if (!numero || !mensaje || !tipo_dato) {
        return res.status(400).json({ success: false, message: 'Falta el número de teléfono, el mensaje o el tipo de dato' });
    }

    try {
        const database = client.db('dbRiesgo');
        const collection = database.collection('messages');

        // Obtener la fecha y la hora actuales
        const now = new Date();
        const formattedDate = now.toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short',
        });

        // Verificar si el número ya está en la base de datos
        const existingEntry = await collection.findOne({ numero: numero});

        if (existingEntry) {
            // Si el número ya existe, actualizar el mensaje con la clave dinámica
            await collection.updateOne(
                { numero: numero },
                { $set: { [tipo_dato]: mensaje, timestamp: formattedDate } } // Guardar solo la fecha y hora formateadas
            );

            return res.json({ success: true, message: 'Número ya existente, mensaje actualizado', data: existingEntry });
        }

        // Si el número no existe, insertamos un nuevo documento con la clave dinámica
        const messageDocument = {
            numero: numero,
            [tipo_dato]: mensaje, // Usar el valor de tipo_dato como clave
            timestamp: formattedDate // Guardar solo la fecha y hora formateadas
        };

        const result = await collection.insertOne(messageDocument);

        if (result.acknowledged) {
            res.json({ success: true, message: 'Número y mensaje guardados correctamente', data: messageDocument });
        } else {
            res.status(500).json({ success: false, message: 'Error al guardar el mensaje y el número' });
        }
    } catch (error) {
        console.error('Error al guardar el número y mensaje:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

function findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
      const server = app.listen(startPort, () => {
        const { port } = server.address();
        server.close(() => {
          resolve(port);
        });
      });
  
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(findAvailablePort(startPort + 1));
        } else {
          reject(err);
        }
      });
    });
  }
app.post('/api/saveResponse', async (req, res) => {
    const { userId, response } = req.body;

    if (!userId || !response) {
        return res.status(400).json({ success: false, message: 'Falta el userId o response' });
    }

    try {
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const messageDocument = {
            userId: userId,
            response: response,
            timestamp: new Date()
        };

        const result = await collection.insertOne(messageDocument);

        if (result.acknowledged) {
            res.json({ success: true, message: 'Respuesta guardada correctamente' });
        } else {
            res.status(500).json({ success: false, message: 'Error al guardar la respuesta' });
        }
    } catch (error) {
        console.error('Error al guardar la respuesta:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});
  connectToDatabase().then((connected) => {
    if (connected) {
      findAvailablePort(3001).then((port) => {
        app.listen(port, () => {
          console.log(`API corriendo en http://localhost:${port}`);
        });
      });
    } else {
      console.error("No se pudo conectar a la base de datos. El servidor no se iniciará.");
      process.exit(1);
    }
  });

  

// connectToDatabase().then(() => {
//     app.listen(port, () => {
//         console.log(`API corriendo en http://localhost:${port}`);
//     });
// });


// const express = require('express');
// const { MongoClient } = require('mongodb');
// const cors = require('cors');
// const app = express();
// const port = 3001;

// app.use(cors());
// app.use(express.json());

// const uri = "mongodb://127.0.0.1:4040";
// const client = new MongoClient(uri);

// async function connectToDatabase() {
//   try {
//     await client.connect();
//     console.log("Conectado a MongoDB");
//   } catch (error) {
//     console.error("Error al conectar a MongoDB:", error);
//   }
// }
// // buscarSocio
// // Ruta para verificar el DNI
// // Define una ruta POST para la URL /api-json-user/api/buscarPersonal
// app.post('/api-json-user/api/buscarPersonal', async (req, res) => {
//     // Extrae los valores dni y ape_p del cuerpo de la solicitud
//     const { dni, ape_p } = req.body;

//     try {
//         // Obtiene la base de datos llamada "dbRiesgo"
//         const database = client.db("dbRiesgo");
//         // Obtiene la colección llamada "Usuarios" de la base de datos
//         const collection = database.collection("Usuarios");

//         // Convierte el valor del DNI a un entero
//         const dniInt = parseInt(dni,10);

//         // Muestra en consola el valor del DNI y el apellido paterno que se está buscando
//         console.log(`Buscando persona con DNI: ${dniInt} y Apellido Paterno: ${ape_p}`);

//         // Busca un documento en la colección "Usuarios" que coincida con los criterios
//         const persona = await collection.findOne({
//             ape_p: { $regex: new RegExp(ape_p, 'i') },
//             dni: dniInt // Usar dniInt como número entero
//         });

//         // Muestra en consola los detalles de la persona encontrada (o no encontrada)
//         if (persona) {
//             console.log(`Persona encontrada:`, persona);
//             res.json({ success: true, data: persona });
//         } else {
//             console.log(`No se encontró persona con DNI: ${dniInt} y Apellido Paterno: ${ape_p}`);
//             res.json({ success: false, data: "Usuario no encontrado" });
//         }
//     } catch (error) {
//         // Si ocurre un error durante la búsqueda, lo imprime en la consola
//         console.error("Error en la búsqueda:", error);
//         // Envía una respuesta JSON indicando un error interno del servidor
//         res.status(500).json({ success: false, message: "Error interno del servidor" });
//     }
// });

// app.post('/api-json-user/api/buscarSocio', async (req, res) => {
//     // Extrae los valores dni y ape_p del cuerpo de la solicitud
//     const { dni } = req.body;

//     try {
//         // Obtiene la base de datos llamada "dbRiesgo"
//         const database = client.db("dbRiesgo");
//         // Obtiene la colección llamada "Usuarios" de la base de datos
//         const collection = database.collection("Socio");

//         // Convierte el valor del DNI a un entero
//         const dniInt = parseInt(dni,10);

//         // Muestra en consola el valor del DNI y el apellido paterno que se está buscando
//         console.log(`Buscando persona con DNI: ${dniInt}`);

//         // Busca un documento en la colección "Usuarios" que coincida con los criterios
//         const socio = await collection.findOne({
//             CUENTA: dniInt // Usar dniInt como número entero
//         });

//         // Muestra en consola los detalles de la persona encontrada (o no encontrada)
//         if (socio) {
//             console.log(`Persona encontrada:`, socio);
//             res.json({ success: true, data: socio });
//         } else {
//             console.log(`No se encontró persona con DNI: ${dniInt}`);
//             res.json({ success: false, data: "Usuario no encontrado" });
//         }
//     } catch (error) {
//         // Si ocurre un error durante la búsqueda, lo imprime en la consola
//         console.error("Error en la búsqueda:", error);
//         // Envía una respuesta JSON indicando un error interno del servidor
//         res.status(500).json({ success: false, message: "Error interno del servidor" });
//     }
// });
// // Ruta para obtener el perfil de riesgo
// app.post('/api-json-user/api/miPerfil', async (req, res) => {
//     const { CUOTA_FIJA, TEA_INTERES, MONTO_PRESTAMO, EDAD} = req.body;
    


//     let CUOTA_FIJA_INT = parseInt(CUOTA_FIJA, 10);
//     const TEA_INTERES_INT = parseInt(TEA_INTERES, 10);
//     let MONTO_PRESTAMO_INT = parseInt(MONTO_PRESTAMO, 10);
//     const EDAD_INT = parseInt(EDAD, 10);

//     CUOTA_FIJA_INT = Math.ceil(CUOTA_FIJA_INT / 50) * 50;
//     MONTO_PRESTAMO_INT = Math.ceil(MONTO_PRESTAMO_INT / 200) * 200;

//     try {
//         const database = client.db("dbRiesgo");
//         const collection = database.collection("Riesgo");

//         console.log(`Consulta perfil de riesgo con los siguientes datos: CUOTA_FIJA=${CUOTA_FIJA}, TEA_INTERES=${TEA_INTERES}, MONTO_PRESTAMO=${MONTO_PRESTAMO}, EDAD=${EDAD}`);

//         const perfil = await collection.findOne({
//             CUOTA_FIJA:CUOTA_FIJA_INT,
//             TEA_INTERES:TEA_INTERES_INT,
//             MONTO_PRESTAMO:MONTO_PRESTAMO_INT,
//             EDAD:EDAD_INT
//         });

//         if (perfil) {
//             console.log('Perfil encontrado:', perfil);
//             res.json({ success: true, data: perfil.riesgo });
//         } else {
//             res.json({ success: false, data: "Perfil no encontrado" });
//         }
//     } catch (error) {
//         console.error("Error en la consulta del perfil de riesgo:", error);
//         res.status(500).json({ success: false, message: "Error interno del servidor" });
//     }
// });

// connectToDatabase().then(() => {
//     app.listen(port, () => {
//         console.log(`API corriendo en http://localhost:${port}`);
//     });
// });
// module.exports = app;