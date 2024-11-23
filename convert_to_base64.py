# Archivo: convert_to_base64.py
import base64

def convert_to_base64(input_file, output_file):
    try:
        # Lee el contenido del archivo JSON
        with open(input_file, "rb") as f:
            json_data = f.read()

        # Convierte el contenido a base64
        base64_data = base64.b64encode(json_data).decode("utf-8")

        # Guarda la cadena base64 en el archivo de salida
        with open(output_file, "w") as f:
            f.write(base64_data)

        print(f"Archivo convertido exitosamente a Base64 y guardado en {output_file}.")
    except Exception as e:
        print(f"Error al convertir el archivo: {e}")

if __name__ == "__main__":
    # Especifica el archivo de entrada (credentials.json) y el de salida
    input_file = "credentials.json"
    output_file = "credentials_base64.txt"

    convert_to_base64(input_file, output_file)
