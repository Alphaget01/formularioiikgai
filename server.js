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
app.use('/', express.static(path.join(__dirname))); // Sirve desde la raíz

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
    // Decodificar la credencial en formato JSON
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

// Ruta para manejar el envío del formulario
app.post('/send-form', async (req, res) => {
    console.log('Recibido en el servidor:', req.body); // Confirmar datos recibidos
    try {
        const authClient = await auth.getClient();
        console.log('Autenticación exitosa.');

        const sheets = google.sheets({ version: 'v4', auth: authClient });
        console.log('Cliente de Google Sheets inicializado.');

        const { nombreGrupo, grupo, discord, correo, obras, generos, capitulos } = req.body;

        const values = [
            [
                new Date().toISOString(),
                nombreGrupo || '',
                grupo || '',
                discord || '',
                correo || '',
                Array.isArray(obras) ? obras.join(', ') : obras || '',
                Array.isArray(generos) ? generos.join(', ') : generos || '',
                capitulos || '',
            ],
        ];

        console.log('Datos preparados para Google Sheets:', values);
        console.log('Nombre del grupo recibido:', req.body.nombreGrupo);

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
