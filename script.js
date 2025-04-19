//Documentacion prueba

// Función para validar el archivo
document.getElementById('fileForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const result = document.getElementById('result');
    const file = fileInput.files[0];
    const preview = document.getElementById('preview');

    if (!file) {
        result.textContent = 'Por favor, selecciona un archivo.';
        result.style.color = 'blue';
        preview.innerHTML = '';
        return;
    }

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
        result.textContent = `El archivo supera el tamaño máximo permitido de ${maxSizeMB}MB.`;
        result.style.color = 'yellow';
        preview.innerHTML = '';
        return;
    }

    const validImageFormats = ['image/jpeg', 'image/png', 'image/gif'];
    const validVideoFormats = ['video/mp4', 'video/webm', 'video/ogg'];

    const fileDetails = `
      <div style="margin-top: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
        <p><strong>Nombre:</strong> ${file.name}</p>
        <p><strong>Tamaño:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
        <p><strong>Tipo:</strong> ${file.type}</p>
      </div>
    `;

    if (validImageFormats.includes(file.type)) {
        result.textContent = `El archivo "${file.name}" es una imagen válida.`;
        result.style.color = 'green';
        preview.innerHTML = `
            ${fileDetails}
            <img src="${URL.createObjectURL(file)}" alt="Vista previa de la imagen" style="max-width: 100%; height: auto; margin-top: 10px;">
        `;
    } else if (validVideoFormats.includes(file.type)) {
        result.textContent = `El archivo "${file.name}" es un video válido.`;
        result.style.color = 'green';
        preview.innerHTML = `
            ${fileDetails}
            <video controls style="max-width: 100%; height: auto; margin-top: 10px;">
                <source src="${URL.createObjectURL(file)}" type="${file.type}">
                Tu navegador no soporta la reproducción de este video.
            </video>
        `;
    } else {
        result.textContent = `El archivo "${file.name}" no tiene un formato válido.`;
        result.style.color = 'red';
        preview.innerHTML = '';
        return;
    }

    // Habilitar botón "Nuevo Archivo"
    document.getElementById('reiniciar').disabled = false;
});

// Esta función ahora está fuera del submit y es global
function nuevo_archivo() {
    const fileInput = document.getElementById('fileInput');
    const result = document.getElementById('result');
    const preview = document.getElementById('preview');
    const valorUsuario = document.getElementById('valorUsuario');
    const reiniciarBtn = document.getElementById('reiniciar');

    // Limpiar input de archivo (creando un nuevo input para forzar reinicio del valor)
    const newFileInput = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(newFileInput, fileInput);

   // Revocar el ObjectURL si existe para liberar memoria
   const oldMedia = preview.querySelector('img, video');
   if (oldMedia && oldMedia.src.startsWith('blob:')) {
       URL.revokeObjectURL(oldMedia.src);
   }

    // Limpiar resultados y vista previa
    result.textContent = '';
    result.style.color = '';
    preview.innerHTML = '';

    // Limpiar campo numérico si existe
    if (valorUsuario) valorUsuario.value = '';

    // Deshabilitar el botón
    reiniciarBtn.disabled = true;
}
result.className = 'success'; // o 'error'

