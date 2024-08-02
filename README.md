### Chatbot Dile con Venom-bot

**Con este chatbot, puedes construir flujos automatizados de conversación para servicios** 
configurar respuestas automatizadas para preguntas frecuentes, gestionar solicitudes y hacer un seguimiento de las interacciones con los usuarios. Además, puedes configurar fácilmente nuevos flujos que te ayudarán a expandir las funcionalidades sin límites.

## Características principales

- Verificación de identidad para socios y colaboradores
- Consulta de cuotas para socios activos
- Cálculo de perfil de riesgo crediticio
- Información sobre productos de crédito y ahorro
- Proceso para solicitar ser socio
- Asignación automática de analistas para nuevas solicitudes


```javascript
// Iniciar sesión y escuchar mensajes
venom.create({
    session: 'session-name',
    multidevice: true
}).then(client => start(client)).catch(console.error);
```
## Requisitos previos

- Node.js (versión 12 o superior)
- NPM (Node Package Manager)
- MongoDB

## Instalación
Para instalar todas las dependencias, ejecutar:
>npm install venom-bot axios mongoose
>npm i --save venom-bot
## Para ejecutar el proyecto 
>node index.js

Recursos
- [venom-bot](https://github.com/orkestral/venom): Una biblioteca para crear bots de WhatsApp.
- [axios](https://github.com/axios/axios): Un cliente HTTP basado en promesas para realizar solicitudes a APIs externas.
- [mongoose](https://mongoosejs.com/): Una biblioteca de modelado de objetos MongoDB para Node.js.