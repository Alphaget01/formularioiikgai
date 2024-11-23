import base64
import os

def convert_to_base64(image_path, output_file):
    """
    Convierte una imagen a una cadena Base64 y guarda el resultado en un archivo.
    :param image_path: Ruta de la imagen a convertir.
    :param output_file: Nombre del archivo donde se guardará la salida Base64.
    """
    if not os.path.exists(image_path):
        print(f"Error: El archivo '{image_path}' no existe.")
        return None

    try:
        with open(image_path, "rb") as image_file:
            base64_string = base64.b64encode(image_file.read()).decode("utf-8")
            with open(output_file, "w") as file:
                file.write(base64_string)
            print(f"Imagen convertida exitosamente a Base64. Resultado guardado en '{output_file}'.")
    except Exception as e:
        print(f"Error al convertir '{image_path}' a Base64: {e}")


if __name__ == "__main__":
    # Rutas de las imágenes
    image_paths = {
        "D:\\ZApng ENEDEA\\DADA\\Formulario\\fondoformuikigai.png": "fondoformuikigai_base64.txt",
        "D:\\ZApng ENEDEA\\DADA\\Formulario\\logoikigai.png": "logoikigai_base64.txt",
    }

    # Convertir cada imagen
    for image_path, output_file in image_paths.items():
        print(f"Procesando: {image_path}")
        convert_to_base64(image_path, output_file)
