const venom = require('venom-bot');
const axios = require('axios');
const mongoose = require('mongoose');
const apiRoutes = require('./api');
// Configuración de MongoDB
const MONGO_DB_URI = 'mongodb://127.0.0.1:27017';
const MONGO_DB_NAME = 'dbRiesgo';

mongoose.connect(`${MONGO_DB_URI}/${MONGO_DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión:'));
db.once('open', () => console.log('Conectado a MongoDB'));

// Funciones de API 
const verificarDNI = async (dni, ape_pat) => {
    try {
        const response = await axios.post('http://localhost:3001/api-json-user/api/buscarPersonal', { dni, ape_pat });
        return response.data;
    } catch (error) {
        console.error('Error al verificar el DNI:', error);
        return false;
    }
};

const GetPerfilRiesgo = async (CUOTA_FIJA, TEA_INTERES, MONTO_PRESTAMO, EDAD) => {
    try {
        const response = await axios.post('http://localhost:3001/api-json-user/api/miPerfil', {
            CUOTA_FIJA, TEA_INTERES, MONTO_PRESTAMO, EDAD
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener el perfil de riesgo:', error);
        return false;
    }
};

// Funciones de API 
const verificarDNISocio = async (dni) => {
    try {
        const response = await axios.post('https://f8aa-38-252-219-16.ngrok-free.app/api-sql/api/verifi-socio', { dni });
        return response.data;
    } catch (error) {
        console.error('Error al verificar el DNI:', error);
        return false;
    }
};

const GetPerfilRiesgoSocio = async (EDAD, TIPO_VIVIENDA, ESTADO_CIVIL, GIROS ) =>{
    try{
        const response =await axios.post('hdhjvd',{
            EDAD, 
            TIPO_VIVIENDA,
            ESTADO_CIVIL,
            GIROS
            
        });
        return response.data;
    } catch (error) {
        console.error('error al obtener el perfil de riesgo', error);
        return false;
    }
}

// Funciones de API 
const verCuotasSocio = async (dni) => {
    try {
        const response = await axios.post('htthdhdhs', { dni });
        return response.data;
    } catch (error) {
        console.error('Error al verificar el DNI:', error);
        return false;
    }
};


//  devolver cuotas pendientes de un socio 
// devolver cuotas de un socio 
const verCuotasSocioPendientes = async (dni) => {
    try{
        const response = await axios.post('hdhhs',{dni});
        return response.data;

    }catch (error){
        console.error('error al obtener sus cuotas', error)
        return false;
    }
}
// calcaular khs
// const agregar = async (id, response) => {
//     try {
//         const response = await axios.post('http://localhost:3001/api/saveResponse', { id, response });
//         return response.data;
//     } catch (error) {
//         console.error('Error al verificar el DNI:', error);
//         return false;
//     }
// };


// nombre: "Ana García", producto: "Pago Diario", agencia: "1", celular:"51918671801@c.us" 
const verInformacionDeColaboradores = async (producto, agencia) => {
    try {
        const response = await axios.post('dfdsfads', { producto, agencia });
        return response.data;  
    } catch (error) {
        console.error('Error al obtener información de colaboradores: ', error);
        return false;
    }
};



//devolver inforamcion de usuarios que pedieron  una solicitud para ser socio 
const verSolicitudesParaSerSocio = async (dni)=>{
    try{
        const response = await axios.post('hdshahjd', {dni});
        return response.data;
    }catch(error){
        console.error('error al verifcar la solicitud de un usurio');
        return false;
    }

};

/* ****************************************************************************************** */
// Gestión de estados de usuarip
let userStates = {};

// Flujo principal
const mainFlow = {
    mainMenu: async (client, message) => {
        await client.sendText(message.from, `Bienvenido soy ✨ *ESTRELLA* ✨ un bot que te ayudará a resolver tus dudas\n\n¿Escriba qué tipo de persona eres?\n👉 *1* Para *Socio activo*.   🤝\n👉 *2* Para *Aún no soy socio*.  👤\n👉 *3* Para *Colaborador*.    👨‍💼`);
    }
};

// *************************************** OPCION 1 SOCIO ACTIVO ****************************************
// Flujo para la opción 1: Socio activo
const socioActivoFlow = {
    
    handleSocio: async (client, message) => {
        await client.sendText(message.from, 'Bienvenido a la sección socios \nIngrese su DNI para verificar que usted es un socio de la cooperativa 🏦🔒');
        userStates[message.from] = { ...userStates[message.from], step: 'esperando_dni_socio' };
    },

    handleVerificacionSocio: async (client, message, userState) => {
        const dni = message.body.trim();
        const response = await verificarDNISocio(dni);

        if (response && response.length > 0 && response[0].status === true) {
            const socio = response[0];
            await client.sendText(message.from, `✅ DNI verificado. Bienvenido/a, ${socio.NOMBRE} ${socio.APE_PAT} ${socio.APE_MAT}`);
            await client.sendText(message.from, `Datos del socio:\nNúmero de documento: ${socio.NRO_DI.trim()}\nRazón social: ${socio.RAZON_SOCIAL}`);
            await client.sendText(message.from, '¿Qué deseas hacer ahora?\n\n👉Escribe *cal* para ver tu score crediticio 📈\nEscribe *ver* para ver tus cuotas 👀\n👉Escribe *riesgo* para obtener tu perfil de riesgo 📊\n👉Escribe *menu* para volver al menú principal\n👉Escribe *salir* para terminar');
            userState.step = 'socio_verificado';
            userState.dni = dni;
        } else {
            await client.sendText(message.from, 'No se pudo verificar el DNI o no es un socio activo. ❌');
            await client.sendText(message.from, 'Por favor, intente nuevamente o escriba *salir* para volver al menú principal.');
            userState.step = 'esperando_dni_socio';
        }
    },

    handleSocioOptions: async (client, message, userState) => {
        switch (message.body.toLowerCase()) {
            case 'cal':
                await client.sendText(message.from, 'Para obtener tu perfil de riesgo, necesito algunos datos adicionales.');
                await client.sendText(message.from, 'Por favor, ingresa tu edad:');
                userState.step = 'esperando_edad';
                break;
            case 'ver':
                await client.sendText(message.from, 'Seleccione una opción:\n1️⃣ Ver cuota a la fecha de hoy\n2️⃣ Ver cuotas pendientes');
                userState.step = 'seleccion_cuotas';
                break;
            case 'menu':
                userState.flow = 'main';
                await mainFlow.mainMenu(client, message);
                break;
            case 'salir':
                await client.sendText(message.from, 'Gracias por usar nuestro servicio. ¡Hasta pronto!');
                delete userStates[message.from];
                break;
            default:
                await client.sendText(message.from, 'Opción no válida. Por favor, escribe *cal*, *ver*, *menu* o *salir*.');
        }
    },

    handleSeleccionCuotas: async (client, message, userState) => {
        switch (message.body) {
            case '1':
                await client.sendText(message.from, 'Consultando tu cuota actual... 📅');
                await client.sendText(message.from, 'Nuemro de cuotas 2 ⚠️');
                await client.sendText(message.from, 'Tu cuota a la fecha de hoy \n(08/07/2024) es: s/250');
                break;
            case '2':
                await client.sendText(message.from, 'Consultando tus cuotas pendientes... 📊');
                await client.sendText(message.from, 'Tus cuotas pendientes son:\n1. 15/08/2024 - s/250\n2. 15/09/2024 - s/250\n3. 15/10/2024 - s/250');
                break;
            default:
                await client.sendText(message.from, 'Opción no válida. Por favor, seleccione 1 o 2.');
                return;
        }
        await client.sendText(message.from, '¿Qué más deseas hacer?\n\nEscribe *cal* para ver tu score crediticio 📈\nEscribe *ver* para ver tus cuotas 👀\nEscribe *menu* para volver al menú principal\nEscribe *salir* para terminar');
        userState.step = 'socio_verificado';
    },


    handlePerfilRiesgo: async (client, message, userState) => {
        const step = userState.step;
        switch (step) {
            case 'esperando_edad':
                if (!isNaN(message.body.trim())) {
                    userState.edad = message.body.trim();
                    await client.sendText(message.from, 'Por favor, selecciona tu tipo de vivienda:\n1. ALQUILADA\n2. FAMILIAR\n3. PROPIA');
                    userState.step = 'esperando_tipo_vivienda';
                } else {
                    await client.sendText(message.from, 'Por favor, ingresa una edad válida.');
                }
                break;
            case 'esperando_tipo_vivienda':
                if (['1', '2', '3'].includes(message.body.trim())) {
                    userState.tipo_vivienda = message.body.trim();
                    await client.sendText(message.from, 'Por favor, selecciona tu estado civil:\n1. Casado (a)\n2. Conviviente\n3. Divorciado (a)\n4. Separado (a)\n5. Soltero (a)\n6. Viudo (a)');
                    userState.step = 'esperando_estado_civil';
                } else {
                    await client.sendText(message.from, 'Por favor, selecciona una opción válida:\n1. ALQUILADA\n2. FAMILIAR\n3. PROPIA');
                }
                break;
            case 'esperando_estado_civil':
                if (['1', '2', '3', '4', '5', '6'].includes(message.body.trim())) {
                    userState.estado_civil = message.body.trim();
                    await client.sendText(message.from, 'Por favor, selecciona tu giro:\n1. ABARROTES\n2. AUTOS\n3. BOTICA\n4. CARPINTERIA\n5. COMERC. AL\n6. COMERC. ANI\n7. COMERC. BEBI\n8. COMERC. FER CONS\n9. COMERC. NO AL\n10. COMERC. ROPA\n11. OFICIO\n12. OFICIO. CONS\n13. OTROS\n14. PROFESIONAL\n15. RESTAURANTE\n16. SERVICIOS');
                    userState.step = 'esperando_giro';
                } else {
                    await client.sendText(message.from, 'Por favor, selecciona una opción válida:\n1. Casado (a)\n2. Conviviente\n3. Divorciado (a)\n4. Separado (a)\n5. Soltero (a)\n6. Viudo (a)');
                }
                break;
            case 'esperando_giro':
                if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'].includes(message.body.trim())) {
                    userState.giro = message.body.trim();
                    const { edad, tipo_vivienda, estado_civil, giro } = userState;
                    const perfilRiesgo = await GetPerfilRiesgoSocio(edad, tipo_vivienda, estado_civil, giro);
                    if (perfilRiesgo) {
                        await client.sendText(message.from, `Tu perfil de riesgo es: ${perfilRiesgo}`);
                    } else {
                        await client.sendText(message.from, 'Error al obtener el perfil de riesgo. Por favor, inténtalo más tarde.');
                    }
                    await client.sendText(message.from, '¿Qué más deseas hacer?\n\nEscribe *cal* para ver tu score crediticio 📈\nEscribe *ver* para ver tus cuotas 👀\nEscribe *menu* para volver al menú principal\nEscribe *salir* para terminar');
                    userState.step = 'socio_verificado';
                } else {
                    await client.sendText(message.from, 'Por favor, selecciona una opción válida:\n1. ABARROTES\n2. AUTOS\n3. BOTICA\n4. CARPINTERIA\n5. COMERC. AL\n6. COMERC. ANI\n7. COMERC. BEBI\n8. COMERC. FER CONS\n9. COMERC. NO AL\n10. COMERC. ROPA\n11. OFICIO\n12. OFICIO. CONS\n13. OTROS\n14. PROFESIONAL\n15. RESTAURANTE\n16. SERVICIOS');
                }
                break;
            default:
                await client.sendText(message.from, 'Opción no válida.');
        }
    },

    handleCuotasSocio: async () =>{
        await client.sendText(message.from, 'aun no esta disponible')
    }
};



// *************************************** OPCION 2 SOCIO NUEVO ****************************************
// Flujo para la opción 2: Aún no soy socio
const noSocioFlow = {
    handleFlow: async function(client, message, userState) {
        if (!userState.active) {
            await client.sendText(message.from, '✨ *ESTRELLA* ✨ está inactiva. Actívalo con un "hola" o "menu" para volver a empezar.');
            return;
        }
        switch (userState.step) {
            case 'inicio':
                await this.handleNoSocio(client, message, userState);
                break;
            case 'esperando_opcion':
                await this.handleOpcionSeleccionada(client, message, userState);
                break;
            /*case 'viendo_creditos':
                await this.handleVerCreditos(client, message, userState);
                break;
            case 'viendo_ahorros':
                await this.handleVerAhorros(client, message, userState);
                break;*/
            case 'viendo_como_ser_socio':
                await this.handleComoSerSocio(client, message, userState);
                break;
            default:
                userState.flow = 'main';
                await mainFlow.mainMenu(client, message);
        }
    },
  
    handleNoSocio: async function(client, message, userState) {
        await client.sendText(message.from, '¿Qué consulta desea conocer?\n*1.* Ver créditos.  💳\n*2.* Cuentas de ahorro.💰\n*3.* Nuestros beneficios.🎁💎\n*4.* Cómo ser socio. 📝');
        userState.step = 'esperando_opcion';
    },

    handleOpcionSeleccionada: async function(client, message, userState) {
        switch (message.body) {
            case '1':
                /*await client.sendText(message.from, 'Nuestros productos de crédito son:\n*1.* Pago Diario.   💵📅\n*2.* Más Inclusivo. 🤝🌍\n*3.* Rapidin.    🕒💨\n*4.* Crédito Digital. 🌐💻');
                userState.step = 'viendo_creditos';*/
                await client.sendText(message.from, '🎉 *¡Bienvenido!*\n\nPara ver nuestros productos de credito, presiona los sigueintes enlaces:\n*CRÉDITO PAGO DIARIO:*📅\n🔗https://www.dile.com.pe/credito-pago-diario \n*CRÉDITO MÁS INCLUSIVO:*🌍\nhttps://www.dile.com.pe/credito-mas-inclusivo \n*CRÉDITO RAPIDIN:*⚡\n🔗https://www.dile.com.pe/credito-rapidin \n*CRÉDITO DIGITAL:*📲\n🔗https://www.dile.com.pe/credito-digital');
                await this.mostrarOpcionesDespuesDeVerProducto(client, message, userState);
                break;
            case '2':
                /*await client.sendText(message.from, 'Nuestros productos de ahorro son:\n*1.*🌟 Cuenta Estrella. \n*2.*🔒Plazo Fijo.');
                userState.step = 'viendo_ahorros';*/
                await client.sendText(message.from, '🎉 *¡Bienvenido!*\n\nPara ver nuestros productos de ahorro, presiona los siguientes enlaces:\n🌟✨ *CUENTA ESTRELLA:* 🌟✨\n🔗https://www.dile.com.pe/cuenta-estrella \n⏳📅🔒 *PLAZO FIJO:* \n🔗https://www.dile.com.pe/cuenta-especial \n');
                await this.mostrarOpcionesDespuesDeVerProducto(client, message, userState);
                break;
            case '3':
            // Mostrar directamente los beneficios sin cambiar el estado
                await client.sendText(message.from, '🎉 *¡Bienvenido!*\n🔗Para ver nuestros beneficios, presiona los enlaces:\n👨‍👩‍👧‍👦 *FAMILIA DILE*:\nhttps://www.clubfamiliadile.com/ \n\n🤝 *MI CUMPA*:\nhttps://www.dile.com.pe/beneficio/micumpa \n\n💻 *APRENDE DIGITAL*:\nhttps://aprendedigital.pe/');
                await this.mostrarOpcionesDespuesDeVerProducto(client, message, userState);
                break;
            case '4':
                await client.sendText(message.from, 'Para ser socio, necesitas considera lo siguiente:');
                userState.step = 'viendo_como_ser_socio';
                await this.handleComoSerSocio(client, message, userState);
                break;
            default:
                await client.sendText(message.from, '❌ Opción no válida. Por favor, \nselecciona *1*, *2* o *3*, \nEscribe *salir* para terminar.');
        }
    },

    handleVerCreditos: async function(client, message, userState) {
        switch (message.body) {
            case '1':
                await client.sendText(message.from, '📅Para ver detalles del *CRÉDITO PAGO DIARIO*, presione el siguiente enlace:\n🔗https://www.dile.com.pe/credito-pago-diario');
                break;
            case '2':
                await client.sendText(message.from, '🌍Para ver detalles del *CRÉDITO MÁS INCLUSIVO*, presione el siguiente enlace:\n🔗https://www.dile.com.pe/credito-pago-diario');
                break;
            case '3':
                await client.sendText(message.from, '⚡Para ver detalles del *CRÉDITO RAPIDIN*, presione el siguiente enlace:\n🔗https://www.dile.com.pe/credito-rapidin');
                break;
            case '4':
                await client.sendText(message.from, '📲Para ver detalles del *CRÉDITO DIGITAL*, presione el siguiente enlace:\n🔗https://www.dile.com.pe/credito-digital');
                break;
            default:
                await client.sendText(message.from, '❌ Opción no válida. Por favor, selecciona *1*, *2*, *3* o *4*.\nEscribe *salir* para terminar.');
                return;
        }
        await this.mostrarOpcionesDespuesDeVerProducto(client, message, userState);
    },

    asignarAnalista: async function(producto, agencia) {
        const analistaAsignado = await verInformacionDeColaboradores(producto, agencia);
        if (analistaAsignado) {
            let numero = analistaAsignado.celular.replace(/\D/g, '');

            if (!numero.startsWith('51')) {
                numero = '51' + numero;
            }

            analistaAsignado.celular = numero + '@c.us';

            return analistaAsignado;
        }
        return null; // Manejar caso donde no se encontró ningún analista
    },
    
    handleComoSerSocio: async function(client, message, userState) {
        if (!userState.serSocioStep) {
            await client.sendText(message.from, 'Antes de solicitar ser socio, le recomendamos revisar nuestros productos de crédito y ahorro. Además, le informamos que, si usted califica para algún crédito, deberá presentarse en nuestra oficina para verificar que cumple con todos los requisitos del producto seleccionado.\nSi desea continuar, escriba *Continuar*. Si desea ver los productos primero, escriba *Productos*.');
            userState.serSocioStep = 'inicio';
        } else {
            switch (userState.serSocioStep) {
                case 'inicio':
                    if (message.body.toLowerCase() === 'continuar') {
                        userState.serSocioStep = 'tipoProducto';
                        await client.sendText(message.from, 'Para ser socio, por favor seleccione el tipo de producto:\n1. Crédito\n2. Ahorro');
                    } else if (message.body.toLowerCase() === 'productos') {
                        await this.handleNoSocio(client, message, userState);
                        userState.serSocioStep = null;
                    } else {
                        await client.sendText(message.from, 'Opción no válida. Por favor, escriba "Continuar" o "Productos".');
                    }
                    break;
                case 'tipoProducto':
                    userState.tipoProducto = message.body;
                    if (userState.tipoProducto === '1') {
                        userState.serSocioStep = 'productoCredito';
                        await client.sendText(message.from, 'Por favor, seleccione el producto de crédito:\n1. Pago Diario📅\n2. Más Inclusivo🌍\n3. Rapidin⚡\n4. Crédito Digital📲');
                    } else if (userState.tipoProducto === '2') {
                        userState.serSocioStep = 'productoAhorro';
                        await client.sendText(message.from, 'Por favor, seleccione el producto de ahorro:\n1. Cuenta Estrella🌟✨\n2. Plazo Fijo⏳📅🔒');
                    } else {
                        await client.sendText(message.from, 'Opción no válida. Por favor, seleccione 1 para Crédito💳 o 2 para Ahorro.💰');
                    }
                    break;
                case 'productoCredito':
                case 'productoAhorro':
                    userState.producto = message.body;
                    userState.serSocioStep = 'nombres';
                    await client.sendText(message.from, 'Por favor, ingrese su nombre completo:');
                    break;
                case 'nombres':
                    userState.nombres = message.body;
                    userState.serSocioStep = 'dni';
                    await client.sendText(message.from, 'Por favor, ingrese su DNI:');
                    break;
                case 'dni':
                    userState.dni = message.body;
                    userState.serSocioStep = 'celular';
                    await client.sendText(message.from, 'Por favor, ingrese su número de celular:');
                    break;
                case 'celular':
                    userState.celular = message.body;
                    userState.serSocioStep = 'agencia';
                    /*AGENCIAS
                        Wanchaq: Av. Garcilazo N° 415
                        San Jerónimo: Av. Llocllapata A-4, Urb. Retamales
                        Molino: PP.JJ. Manco Capac H-25 (Costado del CC EL MOLINO)
                        Tica tica: APV Tica Tica Mz F-1 Lote 8 (Mercadillo de Tica Tica)
                        Sicuani: Jr. Tacna N° 106
                        Quillabamba: Jr. Martín Pio Concha N° 120 
                    */
                    await client.sendText(message.from, 'Por favor, seleccione la agencia más cercana a usted :\n1. Wanchaq\n2. San Jerónimo\n3. Molino\n4. Tica tica\n5. Sicuani\n6. Quillabamba\n7. credito digital');
                    break;
                case 'agencia':
                    userState.agencia = message.body;
                    userState.serSocioStep = 'confirmacion';
                    const resumen = `Por favor, verifique si sus datos son correctos:\n
                    Tipo de Producto: ${userState.tipoProducto === '1' ? 'Crédito' : 'Ahorro'}
                    Producto: ${userState.producto}
                    Nombres: ${userState.nombres}
                    DNI: ${userState.dni}
                    Celular: ${userState.celular}
                    Agencia: Agencia ${userState.agencia}
    
                    ¿Son estos datos correctos? Responda SI o NO.`;
                    await client.sendText(message.from, resumen);
                    break;
                case 'confirmacion':
                    if (message.body.toLowerCase() === 'si') {
                        userState.serSocioStep = 'autorizacion';
                        await client.sendText(message.from, '¿Autoriza el uso de su información para procesar su solicitud? Responda con SI o NO.');
                    } else if (message.body.toLowerCase() === 'no') {
                        userState.serSocioStep = 'tipoProducto';
                        await client.sendText(message.from, 'Entendido. Vamos a ingresar sus datos nuevamente.');
                        await client.sendText(message.from, 'Por favor, seleccione el tipo de producto:\n1. Crédito\n2. Ahorro');
                    } else {
                        await client.sendText(message.from, 'Respuesta no válida. Por favor, responda SI o NO.');
                    }
                    break;
                case 'autorizacion':
                    if (message.body.toLowerCase() === 'si') {
                        // Procesar la solicitud y asignar analista
                        const producto = userState.tipoProducto === '1' ? `Crédito ${userState.producto}` : `Ahorro ${userState.producto}`;
                        const agencia = `Agencia ${userState.agencia}`;
                        const analistaAsignado = await this.asignarAnalista(producto, agencia);
                        
                        if (analistaAsignado) {
                            await client.sendText(message.from, `Gracias por su autorización. Su solicitud será atendida por: ${analistaAsignado.nombre}, número de celular: ${analistaAsignado.celular}`);
                        } else {
                            await client.sendText(message.from, 'Lo siento, no pudimos encontrar un analista para su solicitud en este momento. Un representante se pondrá en contacto con usted pronto.');
                        }
                        
                        userState.step = 'inicio';
                        userState.serSocioStep = null;
                        await this.mostrarOpcionesDespuesDeVerProducto(client, message, userState);
                    } else if (message.body.toLowerCase() === 'no') {
                        await client.sendText(message.from, 'Entendido. No podemos procesar su solicitud sin su autorización. Si cambia de opinión, puede iniciar el proceso nuevamente.');
                        userState.step = 'inicio';
                        userState.serSocioStep = null;
                        await this.mostrarOpcionesDespuesDeVerProducto(client, message, userState);
                    } else {
                        await client.sendText(message.from, 'Respuesta no válida. Por favor, responda SI o NO.');
                    }
                    break;
                default:
                    await client.sendText(message.from, 'Ha ocurrido un error. Por favor, intente nuevamente.');
                    userState.step = 'inicio';
                    userState.serSocioStep = null;
            }
        }
    },
    
    mostrarOpcionesDespuesDeVerProducto: async function(client, message, userState) {
        await client.sendText(message.from, '¿Qué más deseas hacer?\n\nDigite una opcion.\n*1* para crédito. 💳\n*2* Para cuentas de ahorro. 💰\n*3* Para ver beneficios. 🎁💎\n*4* Cómo ser socio. 📝\n\nEscribe *salir* para terminar.');
        userState.step = 'esperando_opcion';
    } ,


    
};

// *************************************** OPCION 3 COLABORADOR ****************************************
// Flujo para la opción 3: Colaborador
const colaboradorFlow = {
    handleFlow: async function(client, message, userState) {
        if (!userState.active) {
            await client.sendText(message.from, '✨ *ESTRELLA* ✨ está inactiva. Activalo con un "hola" o "menu" para volver a empezar.');
            return;
        }
        switch (userState.step) {
            case 'inicio':
                await this.handleColaborador(client, message, userState);
                break;
            case 'apellido_paterno':
            case 'dni':
                await this.handleVerification(client, message, userState);
                break;
            case 'post_verification':
                await this.handlePostVerification(client, message, userState);
                break;
            case 'cal':
                await this.handleCal(client, message, userState);
                break;
            case 'ingresar_dni_socio':
            case 'seleccionar_tipo_cuota':
                await this.handleVerCuotas(client. message, userState);
                break;
            default:
                userState.flow = 'main';
                await mainFlow.mainMenu(client, message);
        }
    },

    handleColaborador: async function(client, message, userState) {
        await client.sendText(message.from, '🤖 Es necesario que comprobemos tu identidad 🤖\n\n¿Cuál es tu apellido paterno? \n\n(O escribe "salir" para terminar)');
        userState.step = 'apellido_paterno';
    },

    handleVerification: async function(client, message, userState) {
        console.log('handleVerification - Mensaje recibido:', message.body);
        console.log('handleVerification - Estado actual:', userState);

        if (message.body.toLowerCase() === 'salir') {
            await client.sendText(message.from, 'Has decidido salir. \nEscribe "hola" o "menu" cuando quieras volver a empezar.🔑');
            userState.active = false;
            userState.flow = 'main';
            return;
        }

        if (userState.step === 'apellido_paterno') {
            if (message.body.toLowerCase() === 'volver') {
                await client.sendText(message.from, '🔐Es necesario que comprobemos tu identidad:\n\n¿Cuál es tu apellido paterno?');
                return;
            }
            userState.ape_pat = message.body;
            userState.step = 'dni';
            await client.sendText(message.from, '¿Cuál es tu DNI? \n\n(O escribe "volver" para reingresar tus datos, o "salir" para terminar)');
        } else if (userState.step === 'dni') {
            if (message.body.toLowerCase() === 'volver') {
                userState.step = 'apellido_paterno';
                await client.sendText(message.from, '🔐Es necesario que comprobemos tu identidad:\n\n¿Cuál es tu apellido paterno?');
                return;
            }
            userState.dni = message.body;
            const response = await verificarDNI(userState.dni, userState.ape_pat);
            //await agregar(userState.dni, userState.ape_pat);
            console.log('Respuesta de la API:', JSON.stringify(response, null, 2));
            // if (response && response.length > 0 && response[0].status === true && response[0].message === 'correcto')
            if (response && response.success === true) {
                await client.sendText(message.from, 'Datos correctos ✅');
                await client.sendText(message.from, `✅ DNI verificado 👨`);
                await client.sendText(message.from, '*Bienvenido/a, colaborador👨‍💼👩‍💼\n ¿Qué deseas hacer ahora?\n\nEscribe *cal* para la calculadora de riesgos 📈\nEscribe *ver* para ver cuotas de un socio 👀');
                userState.step = 'post_verification';
            } else {
                await client.sendText(message.from, 'Datos incorrectos o no se pudo verificar ❌.');
                await client.sendText(message.from, 'Escribe *volver* para ingresar nuevamente o *salir* para terminar.');
                userState.step = 'apellido_paterno';
            }
        }
    },
    // opciones de pos verificaion 
    handlePostVerification: async function(client, message, userState) {
        if (message.body.toLowerCase() === 'cal') {
            await client.sendText(message.from, '🤖🤖 Es necesario conocer alguna información\n\nTEA_INTERES: rango de 12 a 98%\nCUOTA_FIJA: rango de 50 a 500\nEDAD: rango de 18 a 78 años\nMONTO PRESTAMO: rango de 500 a 4000\n\n¿Desea continuar? Responda *Si* o *No*');
            userState.step = 'cal';
        } else if (message.body.toLowerCase() === 'ver') {
            await client.sendText(message.from, 'Para ver las cuotas de un socio, por favor ingrese el DNI del socio:');
            userState.step = 'ingresar_dni_socio';
        }
    },

    handleCal: async function(client, message, userState) {
        if (!userState.calStep) {
            if (message.body.toLowerCase() === 'no') {
                await client.sendText(message.from, 'Has decidido no continuar. \n\nEscribe "hola" o "menu" cuando quieras volver a empezar.');
                delete userStates[message.from];
                return;
            }
            if (message.body.toLowerCase() === 'si') {
                userState.calStep = 'tea_interes';
                await client.sendText(message.from, 'Ingrese *TEA_INTERES* entre 12 y 98%');
            } else {
                await client.sendText(message.from, 'Por favor, responda *Si* o *No*');
            }
            return;
        }

        const validateInput = (value, min, max) => {
            const num = parseFloat(value);
            return !isNaN(num) && num >= min && max;
        };

        switch (userState.calStep) {
            case 'tea_interes':
                if (validateInput(message.body, 12, 98)) {
                    userState.tea_interes = message.body;
                    userState.calStep = 'cuota_fija';
                    await client.sendText(message.from, 'Ingrese *CUOTA_FIJA* entre 50 y 500');
                } else {
                    await client.sendText(message.from, 'TEA_INTERES debe estar entre 12 y 98%. Por favor, ingrese un valor válido.');
                }
                break;
            case 'cuota_fija':
                if (validateInput(message.body, 50, 500)) {
                    userState.cuo_fija = message.body;
                    userState.calStep = 'monto_prestamo';
                    await client.sendText(message.from, 'Ingrese *MONTO_PRESTAMO* entre 500 y 4000');
                } else {
                    await client.sendText(message.from, 'CUOTA_FIJA debe estar entre 50 y 500. Por favor, ingrese un valor válido.');
                }
                break;
            case 'monto_prestamo':
                if (validateInput(message.body, 500, 4000)) {
                    userState.monto_p = message.body;
                    userState.calStep = 'edad';
                    await client.sendText(message.from, 'Ingrese *EDAD* entre 18 y 78');
                } else {
                    await client.sendText(message.from, 'MONTO_PRESTAMO debe estar entre 500 y 4000. Por favor, ingrese un valor válido.');
                }
                break;
            case 'edad':
                if (validateInput(message.body, 18, 78)) {
                    userState.edad = message.body;
                    //score devuelto
                    const data = await GetPerfilRiesgo(userState.cuo_fija, userState.tea_interes, userState.monto_p, userState.edad);
                    const riesgo = data[0]['riesgo'];
                    await client.sendText(message.from, `TU SCORE CRÉDITICIO ES: ${riesgo} 📈`);
                    delete userStates[message.from];
                    await client.sendText(message.from, 'Escribe *volver* para ingresar nuevamente o *salir* para terminar.');
                } else {
                    await client.sendText(message.from, 'EDAD debe estar entre 18 y 78 años. Por favor, ingrese un valor válido.');
                }
                break;
        }
        console.log('handleCal - Estado final:', userState);
    },
    // verificación de cuotas
    handleVerCuotas: async function(client, message, userState) {
        if (userState.step === 'ingresar_dni_socio') {
            const dni = message.body;
            const cuotas = await verCuotasSocio(dni);
            
            if (cuotas) {
                await client.sendText(message.from, `Cuotas del socio con DNI ${dni}:`);
                await client.sendText(message.from, '1. Ver cuotas vencidas\n2. Ver cuotas pendientes');
                userState.step = 'seleccionar_tipo_cuota';
                userState.cuotasSocio = cuotas;
            } else {
                await client.sendText(message.from, 'No se pudo obtener la información de las cuotas. Por favor, intente nuevamente.');
                userState.step = 'post_verification';
            }
        } else if (userState.step === 'seleccionar_tipo_cuota') {
            const opcion = message.body;
            if (opcion === '1') {
                const cuotasVencidas = userState.cuotasSocio.filter(cuota => cuota.estado === 'vencido');
                await client.sendText(message.from, 'Cuotas vencidas:');
                cuotasVencidas.forEach(cuota => {
                    client.sendText(message.from, `Cuota ${cuota.numero}: ${cuota.monto} - Vencimiento: ${cuota.fecha_vencimiento}`);
                });
            } else if (opcion === '2') {
                const cuotasPendientes = userState.cuotasSocio.filter(cuota => cuota.estado === 'pendiente');
                await client.sendText(message.from, 'Cuotas pendientes:');
                cuotasPendientes.forEach(cuota => {
                    client.sendText(message.from, `Cuota ${cuota.numero}: ${cuota.monto} - Vencimiento: ${cuota.fecha_vencimiento}`);
                });
            } else {
                await client.sendText(message.from, 'Opción no válida. Por favor, seleccione 1 para cuotas vencidas o 2 para cuotas pendientes.');
                return;
            }
            
            await client.sendText(message.from, 'Escribe *volver* para consultar otro socio o *salir* para terminar.');
            userState.step = 'post_verification';
        }
    },


};


// Iniciar sesión y escuchar mensajes
venom.create({
    session: 'session-name',
    multidevice: true
}).then(client => start(client)).catch(console.error);


// flujo principal
function start(client) {
    client.onMessage(async message => {
        console.log('Mensaje recibido:', message.body);
        let userState = userStates[message.from] || { flow: 'main', active: true };
        userStates[message.from] = userState;
        console.log('Estado del usuario:', userState);

        if (!message.body) {
            await client.sendText(message.from, 'Mensaje no válido. Por favor, escribe "hola" o "menu" para ver las opciones disponibles, o "salir" para terminar.');
            return;
        }

        const lowerCaseBody = message.body.toLowerCase();

        if (lowerCaseBody === 'salir') {
            await client.sendText(message.from, 'Has decidido salir. Escribe "hola" o "menu" cuando quieras volver a empezar.');
            userState.active = false;
            userState.flow = 'main';
            return;
        }

        if (!userState.active) {
            if (['hola', 'ole', 'menu'].includes(lowerCaseBody)) {
                userState.active = true;
                userState.flow = 'main';
            } else {
                await client.sendText(message.from, '✨*Estrella*✨ está inactivo.  Activalo con un  "hola" o "menu" para volver a empezar.');
                return;
            }
        }

        switch (userState.flow) {
            case 'main':
                if (['hola', 'ole', 'menu'].includes(lowerCaseBody)) {
                    await mainFlow.mainMenu(client, message);
                } else if (message.body === '1') {
                    userState.flow = 'socioActivo';
                    await socioActivoFlow.handleSocio(client, message);
                } else if (message.body === '2') {
                    userState.flow = 'noSocio';
                    await noSocioFlow.handleNoSocio(client, message, userState);
                } else if (message.body === '3') {
                    userState.flow = 'colaborador';
                    userState.step = 'inicio';
                    await colaboradorFlow.handleColaborador(client, message, userState);
                } else {
                    await client.sendText(message.from, 'No entiendo tu mensaje. \nPor favor digite 1, 2, o 3.\n \nEscribe "hola" o "menu" para ver las opciones disponibles.\n  *salir* para terminar.');
                }
                break;
            case 'socioActivo':
                if (userState.step === 'esperando_dni_socio') {
                    await socioActivoFlow.handleVerificacionSocio(client, message, userState);
                } else if (userState.step === 'socio_verificado') {
                    await socioActivoFlow.handleSocioOptions(client, message, userState);
                } else if (userState.step === 'seleccion_cuotas') {
                    await socioActivoFlow.handleSeleccionCuotas(client, message, userState);
                } else if (userState.step === 'esperando_edad' || 
                        userState.step === 'esperando_tipo_vivienda' || 
                        userState.step === 'esperando_estado_civil' || 
                        userState.step === 'esperando_giro') {
                    await socioActivoFlow.handlePerfilRiesgo(client, message, userState);
                } else {
                    await client.sendText(message.from, 'No entiendo tu mensaje. Por favor, sigue las instrucciones o escribe "menu" para volver al menú principal.');
                }
                break;
            case 'colaborador':
                await colaboradorFlow.handleFlow(client, message, userState); 
                break;
            case 'noSocio':
                await noSocioFlow.handleFlow(client, message, userState)
                break;
            default:
                userState.flow = 'main';
                await mainFlow.mainMenu(client, message);
        }

        console.log('Estado final del usuario:', userStates[message.from]);
    });
}     



