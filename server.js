require('dotenv').config(); // Cargar variables de entorno desde el archivo .env
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const path = require('path');

const app = express();

// Configuración de middlewares
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos (CSS, JS, imágenes)
app.use('/css', express.static(path.join(__dirname, 'Css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/', express.static(path.join(__dirname)));

// Servir index.html en la raíz "/"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Decodificar y cargar las credenciales desde Base64
const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;

if (!credentialsBase64) {
    console.error("Error: No se encontró la variable GOOGLE_CREDENTIALS_BASE64 en las variables de entorno.");
    process.exit(1);
}

let credentials;
try {
    credentials = JSON.parse(Buffer.from(credentialsBase64, 'base64').toString('utf-8'));
    console.log('Credenciales decodificadas correctamente.');
} catch (error) {
    console.error('Error al decodificar las credenciales en Base64:', error.message);
    process.exit(1);
}

// Configuración de autenticación para Google Sheets
const auth = new google.auth.GoogleAuth({
    credentials, // Usar las credenciales decodificadas directamente
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// ID de la hoja de cálculo
const spreadsheetId = '1oWUwSU0YZ_oisBAJWCeyIHKyBrBviVKIoAEpuQOqAVc'; // Reemplaza con tu ID de hoja de cálculo

// Función para formatear la fecha a la zona horaria de Perú (UTC-5)
function formatPeruTime(date) {
    const peruOffset = -5 * 60; // UTC-5 en minutos
    const peruTime = new Date(date.getTime() + peruOffset * 60000); // Ajuste de zona horaria
    const day = String(peruTime.getDate()).padStart(2, '0');
    const month = String(peruTime.getMonth() + 1).padStart(2, '0');
    const year = peruTime.getFullYear();
    const hours = String(peruTime.getHours()).padStart(2, '0');
    const minutes = String(peruTime.getMinutes()).padStart(2, '0');
    const seconds = String(peruTime.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// Ruta para manejar el envío del formulario
app.post('/send-form', async (req, res) => {
    console.log('Datos recibidos en el servidor:', req.body); // Confirmar datos recibidos
    try {
        const authClient = await auth.getClient();
        console.log('Autenticación con Google Sheets exitosa.');

        const sheets = google.sheets({ version: 'v4', auth: authClient });
        console.log('Cliente de Google Sheets inicializado.');

        const {
            'nombre-grupo': nombreGrupo,
            grupo,
            discord,
            correo,
            obras,
            generos,
            capitulos,
        } = req.body;

        // Validar que los datos esenciales estén presentes
        if (!grupo || !correo) {
            throw new Error('El campo "grupo" o "correo" está vacío.');
        }

        // Preparar datos para agregar a Google Sheets
        const values = [
            [
                formatPeruTime(new Date()), // Fecha y hora en formato de Perú
                nombreGrupo || 'No especificado', // Nombre del grupo
                grupo || 'No especificado', // Enlace al grupo
                discord || 'No especificado', // Usuario de Discord
                correo || 'No especificado', // Correo
                Array.isArray(obras) ? obras.join(', ') : obras || 'No especificado', // Obras
                Array.isArray(generos) ? generos.join(', ') : generos || 'No especificado', // Géneros
                capitulos || 'No especificado', // Capítulos promedio
            ],
        ];

        console.log('Datos preparados para Google Sheets:', values);

        // Agregar datos a la hoja
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Scans', // Nombre de la hoja
            valueInputOption: 'RAW',
            resource: { values },
        });

        console.log('Datos enviados correctamente a Google Sheets.');
        res.status(200).json({ status: 'success', message: 'Datos agregados correctamente.' });
    } catch (error) {
        console.error('Error al enviar datos a Google Sheets:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
