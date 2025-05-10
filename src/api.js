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


    // ПРАВИЛЬНОЕ исправление для api.js
    uploadImage: async (name, country, file, caption) => {
        console.log("uploadImage вызван:");
        console.log("- name:", name);
        console.log("- country:", country);
        console.log("- file name:", file.name);

        try {
            // Создаем правильный FormData
            const formData = new FormData();

            // ПЕРВЫМ добавляем country, чтобы гарантировать его передачу
            formData.append('country', country);

            // Затем добавляем файл и подпись
            formData.append('image', file);
            formData.append('caption', caption || file.name);

            // Проверяем, что formData содержит все необходимые данные
            console.log("FormData содержит country:", formData.get('country'));
            console.log("FormData содержит image:", formData.get('image').name);

            const url = `${API_URL}/vehicles/${encodeURIComponent(name)}/images`;
            console.log("URL для загрузки:", url);

            // НИКАКИХ дополнительных заголовков - они могут мешать передаче multipart/form-data
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            // Обрабатываем ответ
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Ошибка сервера:", errorText);
                throw new Error(`Ошибка сервера ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("Результат загрузки:", result);

            return result;
        } catch (error) {
            console.error("Ошибка загрузки:", error.message);
            throw error;
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