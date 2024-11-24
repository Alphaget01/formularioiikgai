// Añadir evento para manejar el envío del formulario
document.getElementById('ikigai-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Evita el envío por defecto del formulario

    const form = e.target;
    let isValid = true;

    // Validar campos individuales (campos de texto, email, URL)
    const inputs = form.querySelectorAll('input:not([type="checkbox"])');
    inputs.forEach((input) => {
        const errorMessage = input.parentElement.querySelector('.error-message');
        if (!input.checkValidity()) {
            isValid = false;
            errorMessage.style.display = 'block';
        } else {
            errorMessage.style.display = 'none';
        }
    });

    // Validar grupos de checkboxes (asegurar que al menos uno esté seleccionado por grupo)
    const checkboxGroups = form.querySelectorAll('.checkbox-group');
    checkboxGroups.forEach((group) => {
        const checkboxes = group.querySelectorAll('input[type="checkbox"]');
        const errorMessage = group.querySelector('.error-message');
        const isChecked = Array.from(checkboxes).some((checkbox) => checkbox.checked);

        if (!isChecked) {
            isValid = false;
            errorMessage.style.display = 'block';
        } else {
            errorMessage.style.display = 'none';
        }
    });

    // Si alguna validación falla, no enviar el formulario
    if (!isValid) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }

    // Recopilar datos del formulario en un objeto
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        // Si la clave ya existe, convierte en un arreglo (para manejar múltiples valores como checkboxes)
        if (!data[key]) {
            data[key] = value;
        } else {
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        }
    });

    console.log("Datos enviados al servidor:", data); // Para verificar los datos recopilados en la consola

    // Determinar la URL del servidor (local o producción)
    const serverUrl = window.location.origin.includes('localhost')
        ? 'http://localhost:3000/send-form'
        : 'https://formularioikigai-5e081ec478ea.herokuapp.com/send-form';

    // Enviar datos al servidor Node.js
    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        // Manejar la respuesta del servidor
        const result = await response.json();
        if (result.status === 'success') {
            alert('Formulario enviado con éxito.');
            form.reset(); // Limpiar el formulario tras el envío exitoso
        } else {
            throw new Error(result.message || 'Error al enviar el formulario.');
        }
    } catch (error) {
        // Manejar errores en la conexión o respuesta del servidor
        alert('Hubo un problema al enviar el formulario. Inténtalo de nuevo.');
        console.error('Error:', error);
    }
});
