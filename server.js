const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');

const app = express();

// Configuración de middlewares
app.use(cors());
app.use(bodyParser.json());

// Configuración de autenticación para Google Sheets
const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json', // Asegúrate de tener este archivo JSON de la cuenta de servicio
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


// Servidor corriendo
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
