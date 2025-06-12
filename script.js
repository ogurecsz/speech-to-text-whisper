// ИЗМЕНЕНИЕ 1: Импортируем нужную нам функцию 'pipeline' напрямую из библиотеки.
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// Получаем ссылки на элементы DOM
const fileInput = document.getElementById('audio-file-input');
const transcribeButton = document.getElementById('transcribe-button');
const statusElement = document.getElementById('status');
const resultTextElement = document.getElementById('result-text');

let recognizer;

function updateStatus(text) {
    statusElement.textContent = text;
    console.log(text);
}

async function initializeRecognizer() {
    try {
        updateStatus('Загрузка модели... (может занять несколько минут при первом запуске)');
        
        // ИЗМЕНЕНИЕ 2: Теперь мы используем напрямую функцию 'pipeline', а не 'Transformers.pipeline'.
        recognizer = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');
        
        updateStatus('Модель загружена. Выберите аудиофайл.');
        transcribeButton.disabled = false;
    } catch (error) {
        updateStatus('Ошибка при загрузке модели.');
        console.error(error);
    }
}

async function transcribeAudio() {
    if (!fileInput.files.length) {
        updateStatus('Ошибка: файл не выбран.');
        return;
    }
    if (!recognizer) {
        updateStatus('Ошибка: распознаватель не инициализирован.');
        return;
    }

    const file = fileInput.files[0];
    const audioUrl = URL.createObjectURL(file);

    try {
        transcribeButton.disabled = true;
        resultTextElement.textContent = '';
        updateStatus(`Обработка файла: ${file.name}...`);
        
        const output = await recognizer(audioUrl, {
            chunk_length_s: 30,
            stride_length_s: 5,
            language: 'russian',
            task: 'transcribe',
        });

        updateStatus('Обработка завершена.');
        resultTextElement.textContent = output.text;
    } catch (error) {
        updateStatus('Произошла ошибка во время распознавания.');
        console.error(error);
    } finally {
        transcribeButton.disabled = false;
        URL.revokeObjectURL(audioUrl);
    }
}

transcribeButton.addEventListener('click', transcribeAudio);
transcribeButton.disabled = true;

initializeRecognizer();
