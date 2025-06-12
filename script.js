// Получаем ссылки на элементы DOM
const fileInput = document.getElementById('audio-file-input');
const transcribeButton = document.getElementById('transcribe-button');
const statusElement = document.getElementById('status');
const resultTextElement = document.getElementById('result-text');

let recognizer; // Переменная для хранения экземпляра распознавателя

// Функция для обновления статуса на странице
function updateStatus(text) {
    statusElement.textContent = text;
    console.log(text);
}

// Инициализация модели при загрузке страницы
async function initializeRecognizer() {
    try {
        updateStatus('Загрузка модели... (может занять несколько минут при первом запуске)');
        // Используем модель 'Xenova/whisper-base' для хорошего баланса качества и скорости.
        // Для максимальной скорости можно использовать 'Xenova/whisper-tiny'.
        recognizer = await Transformers.pipeline('automatic-speech-recognition', 'Xenova/whisper-base');
        updateStatus('Модель загружена. Выберите аудиофайл.');
        transcribeButton.disabled = false; // Активируем кнопку после загрузки
    } catch (error) {
        updateStatus('Ошибка при загрузке модели.');
        console.error(error);
    }
}

// Функция для распознавания речи из файла
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
    const audioUrl = URL.createObjectURL(file); // Создаем URL для файла

    try {
        transcribeButton.disabled = true;
        resultTextElement.textContent = ''; // Очищаем предыдущий результат
        updateStatus(`Обработка файла: ${file.name}...`);
        
        // Запускаем распознавание
        const output = await recognizer(audioUrl, {
            chunk_length_s: 30, // Делим аудио на 30-секундные отрезки
            stride_length_s: 5, // С перекрытием в 5 секунд для точности
            language: 'russian', // Указываем язык (можно убрать для автоопределения)
            task: 'transcribe',
        });

        updateStatus('Обработка завершена.');
        resultTextElement.textContent = output.text;
    } catch (error) {
        updateStatus('Произошла ошибка во время распознавания.');
        console.error(error);
    } finally {
        transcribeButton.disabled = false;
        URL.revokeObjectURL(audioUrl); // Освобождаем память
    }
}

// Привязываем события
transcribeButton.addEventListener('click', transcribeAudio);
transcribeButton.disabled = true; // Кнопка неактивна до загрузки модели

// Начинаем загрузку модели сразу после загрузки скрипта
initializeRecognizer();
