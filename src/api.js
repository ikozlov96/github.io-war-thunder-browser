// src/api.js

// Определяем, в каком окружении запущено приложение
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction ? '' : 'http://localhost:3001/api';

// Функция для проверки доступности сервера
const checkServerAvailability = async () => {
    if (isProduction) return false;

    try {
        const response = await fetch(`${API_URL}/vehicles`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        const isAvailable = response.ok;
        console.log("API сервер доступен:", isAvailable);
        return isAvailable;
    } catch (error) {
        console.log("API сервер недоступен:", error);
        return false;
    }
};

// API клиент
const api = {
    // Получить список техники
    getVehicles: async () => {
        // Проверяем доступность сервера при первом запросе
        const serverAvailable = await checkServerAvailability();

        if (isProduction || !serverAvailable) {
            // В production или при недоступности сервера используем локальный JSON
            console.log("Загрузка данных из локального JSON");
            try {
                const response = await fetch(`${process.env.PUBLIC_URL}/output.json`);
                const data = await response.json();
                return data.vehicles || [];
            } catch (error) {
                console.error("Ошибка при загрузке JSON:", error);
                throw error;
            }
        } else {
            // В dev используем API
            console.log("Загрузка данных с сервера API");
            try {
                const response = await fetch(`${API_URL}/vehicles`);
                return await response.json();
            } catch (error) {
                console.error("Ошибка при обращении к API:", error);

                // При ошибке API пробуем локальный JSON как запасной вариант
                console.log("Откат к локальному JSON");
                const response = await fetch(`${process.env.PUBLIC_URL}/output.json`);
                const data = await response.json();
                return data.vehicles || [];
            }
        }
    },

    // Обновить данные техники
    updateVehicle: async (name, data) => {
        // Проверяем доступность сервера
        const serverAvailable = await checkServerAvailability();

        if (isProduction || !serverAvailable) {
            console.log("Режим без сервера: изменения только в памяти");
            return { success: true, message: 'Changes saved in memory only' };
        }

        try {
            const response = await fetch(`${API_URL}/vehicles/${encodeURIComponent(name)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            return await response.json();
        } catch (error) {
            console.error("Ошибка при обновлении данных:", error);
            return { success: false, message: 'Failed to update data' };
        }
    },

    // Загрузить изображение
    // В api.js
    uploadImage: async (name, country, file, caption) => {
        console.log("uploadImage вызван:");
        console.log("- name:", name);
        console.log("- country:", country);
        console.log("- file name:", file.name);

        // В режиме разработки без сервера или в production используем base64
        if (isProduction || !(await checkServerAvailability())) {
            console.log("Base64 режим активирован");

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const result = {
                        success: true,
                        image: {
                            id: Date.now(),
                            url: reader.result,
                            caption: caption || file.name
                        }
                    };
                    console.log("Изображение загружено как base64");
                    resolve(result);
                };
                reader.onerror = (error) => {
                    console.error("Ошибка чтения файла:", error);
                    reject({
                        success: false,
                        message: 'Не удалось прочитать файл'
                    });
                };
            });
        }

        // Используем сервер для загрузки
        try {
            console.log("Начинаем загрузку на сервер");
            const formData = new FormData();
            formData.append('image', file);
            formData.append('country', country || 'unknown');
            formData.append('caption', caption || file.name);

            const url = `${API_URL}/vehicles/${encodeURIComponent(name)}/images`;
            console.log("URL для загрузки:", url);

            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const responseText = await response.text();
            console.log("Ответ сервера (текст):", responseText);

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error("Ошибка парсинга JSON ответа:", e);
                throw new Error("Сервер вернул неверный JSON: " + responseText);
            }

            if (!result.success) {
                throw new Error(result.error || "Неизвестная ошибка сервера");
            }

            console.log("Успешно загружено на сервер!");
            return result;
        } catch (error) {
            console.error("Ошибка загрузки на сервер:", error);

            // При ошибке используем base64
            console.log("Используем base64 из-за ошибки сервера");
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const result = {
                        success: true,
                        image: {
                            id: Date.now(),
                            url: reader.result,
                            caption: caption || file.name
                        }
                    };
                    console.log("Изображение загружено как base64 после ошибки сервера");
                    resolve(result);
                };
                reader.onerror = (e) => {
                    reject({
                        success: false,
                        message: 'Не удалось прочитать файл после ошибки сервера: ' + e.message
                    });
                };
            });
        }
    },

    // Сохранить все данные
    saveAllData: async (vehicles) => {
        // Проверяем доступность сервера
        const serverAvailable = await checkServerAvailability();

        if (isProduction || !serverAvailable) {
            console.log("Режим без сервера: экспорт данных недоступен");
            return { success: false, message: 'Export function not available in this mode' };
        }

        try {
            const response = await fetch(`${API_URL}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehicles)
            });

            return await response.json();
        } catch (error) {
            console.error("Ошибка при сохранении данных:", error);
            return { success: false, message: 'Failed to save data' };
        }
    }
};

export default api;