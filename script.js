//Documentacion Javascript para validador de archivo en Marketing LAB
// Proyecto de grado Practia de servicios nutresa 1 abri de 2025
//Autor Alejandro Quintero

// Función para validar el archivo
document.getElementById('fileForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const result = document.getElementById('result');
    const file = fileInput.files[0];
    const preview = document.getElementById('preview');
// Limpiar el contenedor de vista previa
    
preview.innerHTML = '';
    if (!file) {
        result.textContent = 'Por favor, selecciona un archivo para la verificacion.';
        result.style.color = 'blue';
        preview.innerHTML = '';
        return;
    }
    const maxSizeMB = 100;//Se establece el tamaño maximo archivo validar cuanto es el maximo y el minimo Sebas!
    if (file.size > maxSizeMB * 1024 * 1024) {
        result.textContent = `El archivo supera el tamaño máximo permitido de ${maxSizeMB}MB.`;
        result.style.color = 'red';
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
        result.textContent = `El archivo "${file.name}" es una imagen valida.`;
        result.style.color = 'blue';

        //Desribe la resolucion
        const imageURL = URL.createObjectURL(file);
        const image = new Image();

        image.onload = function () {
            const width = image.width;
            const height = image.height;

            // Limpiar el contenedor de vista previa
preview.innerHTML = '';
        
 // Mostrar detalles de la imagen
 preview.innerHTML = `
 
 ${fileDetails}
 <img src="${imageURL}" alt="Vista previa de la imagen" style="max-width: 100%; height: auto; margin-top: 10px;">
 <p><strong>Resolución:</strong> ${width} x ${height} px</p>
`;
           // Leer colores dominantes con Color Thief
     
            const colorThief = new ColorThief();
            const dominantColor = colorThief.getColor(image);
            const palette = colorThief.getPalette(image, 10);
            const colorBox = (rgb) => `
            <div style="width: 30px; height: 30px; background-color: rgb(${rgb.join(',')}); display: inline-block; margin-right: 5px; border: 1px solid #ccc;"></div>
        `;
            const paletteHTML = `
            <h3>🎨 Colores:</h3>
            <p><strong>Dominante:</strong> rgb(${dominantColor.join(',')})</p>
            <div>${colorBox(dominantColor)}</div>

            <p><strong>Paleta:</strong></p>
            <div>${palette.map(colorBox).join('')}</div>
        `;
            preview.innerHTML += paletteHTML;  // Agrega la paleta de colores a la vista previa
            
            // Leer metadata EXIF
            EXIF.getData(file, function () {
                const make = EXIF.getTag(this, 'Make') || 'Desconocido';
                const model = EXIF.getTag(this, 'Model') || 'Desconocido';
                const date = EXIF.getTag(this, 'DateTime') || 'Sin información';

                const exifData = EXIF.getAllTags(this); // Obtener todos los metadatos EXIF
                console.log("📸 Metadatos EXIF:", exifData);

                let exifInfo = '<h3>📋 Metadatos EXIF:</h3>';
                if (Object.keys(exifData).length === 0) {
                    // Si no se encuentran metadatos EXIF
                    exifInfo += `
            <h2>No se encontraron metadatos EXIF en esta imagen.</h2>
            <p>Los metadatos EXIF (Exchangeable Image File Format) son datos que se almacenan dentro de un archivo de imagen, especialmente en archivos JPEG. Estos datos pueden incluir información como la marca y modelo de cámara, la resolución de la imagen, la fecha y hora de la captura, la configuración de la lente, la velocidad de obturación, el ISO y la apertura, entre otros.</p>
        `;
                } else {
                    // Si se encuentran metadatos EXIF
                    exifInfo += '<ul>';
                    for (const tag in exifData) {
                        exifInfo += `<li><strong>${tag}:</strong> ${exifData[tag]}</li>`;
                    }
                    exifInfo += '</ul>';
                }
                preview.innerHTML ='';
              preview.innerHTML += `
        <div style="background: #eef; padding: 10px; margin-top: 15px; border-radius: 6px; text-align: left;">
            ${exifInfo}
        </div>
    `;
            });

            //OCR: detección de textolectura de letras y palabras
            Tesseract.recognize(imageURL, 'spa', {
                logger: (m) => console.log(m), // Opcional: muestra el progreso en la consola
            }).then(({ data: { text } }) => {
                const ocrHTML = `
                    <div style="margin-top: 15px; background: #e0f7fa; padding: 10px; border-radius: 6px;">
                        <h3>📝 Texto Detectado:</h3>
                        <p style="white-space: pre-wrap; font-family: monospace;">${text || 'No se detectó texto'}</p>
                    </div>
                `;
                 preview.innerHTML ='';
                preview.innerHTML += ocrHTML; // Agrega el resultado de OCR al contenedor de vista previa
            }).catch((err) => {
                console.error('Error al detectar texto:', err);
                const errorHTML = `
                    <div style="margin-top: 15px; background: #ffcccc; padding: 10px; border-radius: 6px;">
                        <h3>⚠️ Error en la detección de texto:</h3>
                        <p>${err.message}</p>
                    </div>
                `;
              preview.innerHTML ='';
                preview.innerHTML += errorHTML;
                 // Muestra el error en la vista previa
            });
        };
        image.src = imageURL;
    } else if (validVideoFormats.includes(file.type)) {
        result.textContent = `El archivo "${file.name}" es un video válido.`;
        result.style.color = 'green';

        //inicio de validacion de video tiempo

        const videoURL = URL.createObjectURL(file);
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.src = videoURL;

        videoElement.onloadedmetadata = function () {
            const duration = videoElement.duration.toFixed(2); // Duración en segundos
            const width = videoElement.videoWidth;
            const height = videoElement.videoHeight;

            let validationMessages = [];
            let isValid = true;

            // Validación de duración máxima (por ejemplo, 30 segundos)
            const maxDuration = 30; // Duración máxima permitida en segundos
            if (duration > maxDuration) {
                validationMessages.push(`❌ Duración demasiado larga: ${duration}s (máximo ${maxDuration}s)`);
                isValid = false;
            } else {
                validationMessages.push(`✅ Duración aceptable: ${duration}s`);
            }
            // Validación de resolución mínima
            if (width < 1280 || height < 720) {
                validationMessages.push(`❌ Resolución baja: ${width}x${height} (mínimo 1280x720)`);
                isValid = false;
            } else {
                validationMessages.push(`✅ Resolución adecuada: ${width}x${height}`);
            }

            // Mostrar mensajes de validación
            requirements.innerHTML = validationMessages.map(msg => `<p>${msg}</p>`).join('');
            requirements.style.color = isValid ? 'green' : 'blue';

            // Mostrar detalles del video
            const extraInfo = `
<h3>📊 Datos técnicos del video:</h3>
<ul>
    <li><strong>Duración:</strong> ${duration} segundos</li>
    <li><strong>Resolución:</strong> ${width} x ${height} px</li>
</ul>
`;
            preview.innerHTML = `
              
               <video controls style="max-width: 100%; height: auto; margin-top: 10px;">
               <source src="${URL.createObjectURL(file)}" type="${file.type}">
                       Tu navegador no soporta la reproducción de este video.
               </video>

               <div style="text-align: left; background: #f0f0f0; padding: 10px; border-radius: 6px; margin-top: 15px;">
                ${extraInfo}
                 ${fileDetails}
            </div>

               `;
        }
    } else {
        result.textContent = `El archivo "${file.name}" no tiene un formato válido.`;
        result.style.color = 'blue';
        preview.innerHTML = '';
        return;
    }  // Habilitar botón "Nuevo Archivo" para que el uruario carga el nuevo archivo
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
    requirements.textContent = '';
    
    // Deshabilitar el botón
    reiniciarBtn.disabled = true;
}
