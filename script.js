//Documentacion Javascript para validador de archivo en Marketing LAB
// Proyecto de grado Practia de servicios nutresa 1 abri de 2025
//Autor Alejandro Quintero

// Función para validar el archivo
document.getElementById('fileForm').addEventListener('submit', function (e) {
    e.preventDefault();
    console.log("¡El botón Validar fue presionado y el evento submit se disparó!"); // <-- Añade esta línea


    const fileInput = document.getElementById('fileInput');
    const result = document.getElementById('result');
    const file = fileInput.files[0];
console.log("Archivo seleccionado:", file);
    const preview = document.getElementById('preview');

    const requirements = document.getElementById('requirements');

    const validImageFormats = ['image/jpeg', 'image/png', 'image/gif'];
    const validVideoFormats = ['video/mp4', 'video/webm', 'video/ogg'];
    const validTextFormats = ['text/plain'];
    const validPDFFormats = ['application/pdf'];

    preview.innerHTML = '';

    if (!file) {
        result.textContent = 'Por favor, selecciona un archivo para la verificación.';
        result.style.color = 'blue';
        return;
    }

    const maxSizeMB = 100;
    if (file.size > maxSizeMB * 1024 * 1024) {
        result.textContent = `El archivo supera el tamaño máximo permitido de ${maxSizeMB}MB.`;
        result.style.color = 'red';
        return;
    }

    const fileDetails = `
        <div style="margin-top: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
            <p><strong>Nombre:</strong> ${file.name}</p>
            <p><strong>Tamaño:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
            <p><strong>Tipo:</strong> ${file.type}</p>
        </div>
    `;

    if (validImageFormats.includes(file.type)) {
        result.textContent = `El archivo "${file.name}" es una imagen válida.`;
        result.style.color = 'blue';

        const imageURL = URL.createObjectURL(file);
        const image = new Image();

        image.onload = function () {
            const width = image.width;
            const height = image.height;

            preview.innerHTML = `
                ${fileDetails}
                <img src="${imageURL}" alt="Vista previa de la imagen" style="max-width: 100%; height: auto; margin-top: 10px;">
                <p><strong>Resolución:</strong> ${width} x ${height} px</p>
            `;

            const colorThief = new ColorThief();
            const dominantColor = colorThief.getColor(image);
            const palette = colorThief.getPalette(image, 5);

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

            preview.innerHTML += paletteHTML;

            Tesseract.recognize(imageURL, 'spa', {
                logger: (m) => console.log(m),
            }).then(({ data: { text } }) => {
                if (!document.querySelector('#ocrResult')) {
                    preview.innerHTML += `
                        <div id="ocrResult" style="margin-top: 15px; background: #e0f7fa; padding: 10px; border-radius: 6px;">
                            <h3>📝 Texto Detectado:</h3>
                            <p style="white-space: pre-wrap; font-family: monospace;">${text || 'No se detectó texto'}</p>
                        </div>
                    `;
                }
            }).catch((err) => {
                preview.innerHTML += `
                    <div style="margin-top: 15px; background: #ffcccc; padding: 10px; border-radius: 6px;">
                        <h3>⚠️ Error en la detección de texto:</h3>
                        <p>${err.message}</p>
                    </div>
                `;
            });

            EXIF.getData(file, function () {
                const exifData = EXIF.getAllTags(this);
                let exifInfo = '<h3>📋 Metadatos EXIF:</h3>';

                if (Object.keys(exifData).length === 0) {
                    exifInfo += `
                        <h2>No se encontraron metadatos EXIF en esta imagen.</h2>
                        <p>Los metadatos EXIF son datos que se almacenan dentro de un archivo de imagen.</p>
                    `;
                } else {
                    exifInfo += '<ul>';
                    for (const tag in exifData) {
                        exifInfo += `<li><strong>${tag}:</strong> ${exifData[tag]}</li>`;
                    }
                    exifInfo += '</ul>';
                }

                if (!document.querySelector('#exifInfo')) {
                    preview.innerHTML += `
                        <div id="exifInfo" style="background: #eef; padding: 10px; margin-top: 15px; border-radius: 6px;">
                            ${exifInfo}
                        </div>
                    `;
                }
            });
        };

        image.src = imageURL;

    } else if (validVideoFormats.includes(file.type)) {
        result.textContent = `El archivo "${file.name}" es un video válido.`;
        result.style.color = 'green';

        const videoURL = URL.createObjectURL(file);
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.src = videoURL;

        videoElement.onloadedmetadata = function () {
            const duration = videoElement.duration.toFixed(2);
            const width = videoElement.videoWidth;
            const height = videoElement.videoHeight;

            let validationMessages = [];
            let isValid = true;

            const maxDuration = 30;
            if (duration > maxDuration) {
                validationMessages.push(`❌ Duración demasiado larga: ${duration}s (máximo ${maxDuration}s)`);
                isValid = false;
            } else {
                validationMessages.push(`✅ Duración aceptable: ${duration}s`);
            }

            if (width < 1280 || height < 720) {
                validationMessages.push(`❌ Resolución baja: ${width}x${height} (mínimo 1280x720)`);
                isValid = false;
            } else {
                validationMessages.push(`✅ Resolución adecuada: ${width}x${height}`);
            }

            requirements.innerHTML = validationMessages.map(msg => `<p>${msg}</p>`).join('');
            requirements.style.color = isValid ? 'green' : 'blue';

            preview.innerHTML = `
                <video controls style="max-width: 100%; height: auto; margin-top: 10px;">
                    <source src="${videoURL}" type="${file.type}">
                    Tu navegador no soporta la reproducción de este video.
                </video>
                <div style="background: #f0f0f0; padding: 10px; border-radius: 6px; margin-top: 15px;">
                    <h3>📊 Datos técnicos del video:</h3>
                    <ul>
                        <li><strong>Duración:</strong> ${duration} segundos</li>
                        <li><strong>Resolución:</strong> ${width} x ${height} px</li>
                    </ul>
                    ${fileDetails}
                </div>
            `;
        };

    } else if (validTextFormats.includes(file.type)) {
        result.textContent = `El archivo "${file.name}" es un archivo de texto válido.`;
        result.style.color = 'green';

        const reader = new FileReader();
        reader.onload = function (event) {
            const textContent = event.target.result;

            preview.innerHTML = `
                ${fileDetails}
                <h3>📄 Contenido del archivo TXT:</h3>
                <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${textContent}</pre>
            `;
        };
        reader.readAsText(file);

    } else if (validPDFFormats.includes(file.type)) {
        result.textContent = `El archivo "${file.name}" es un PDF válido.`;
        result.style.color = 'purple';

        const fileReader = new FileReader();
        fileReader.onload = function () {
            const typedArray = new Uint8Array(this.result);

            pdfjsLib.getDocument(typedArray).promise.then(function (pdf) {
                let textPromises = [];

                for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 5); pageNum++) {
                    textPromises.push(
                        pdf.getPage(pageNum).then(page => page.getTextContent())
                            .then(content => content.items.map(i => i.str).join(' '))
                    );
                }

                Promise.all(textPromises).then(pagesText => {
                    const fullText = pagesText.join('\n\n');

                    preview.innerHTML = `
                        ${fileDetails}
                        <h3>📘 Contenido extraído del PDF (hasta 5 páginas):</h3>
                        <div style="background: #f9f9f9; padding: 10px; border-radius: 5px; max-height: 300px; overflow-y: auto;">
                            <pre style="white-space: pre-wrap;">${fullText}</pre>
                        </div>
                    `;
                });
            }).catch(err => {
                console.error('Error al leer PDF:', err);
                preview.innerHTML = `<p style="color:red;">Error al leer el PDF: ${err.message}</p>`;
            });
        };

        fileReader.readAsArrayBuffer(file);
    } else {
        result.textContent = `El archivo "${file.name}" no tiene un formato válido.`;
        result.style.color = 'blue';
        preview.innerHTML = '';
        return;
    }

    document.getElementById('reiniciar').disabled = false;
});



// Esta función ahora está fuera del submit y es global
function nuevo_archivo() {
    const fileInput = document.getElementById('fileInput');
    const result = document.getElementById('result');
    const preview = document.getElementById('preview');
    const requirements = document.getElementById('requirements');
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
