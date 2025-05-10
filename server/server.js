// server/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // URL вашего React приложения
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Путь к JSON файлу
const jsonFilePath = path.join(__dirname, '../public/output.json');

// Создаем папку images если она не существует
const imagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

function logToFile(message) {
    const logFile = path.join(__dirname, 'server.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${typeof message === 'string' ? message : JSON.stringify(message)}\n`;

    fs.appendFileSync(logFile, logMessage);
}

// Настройка хранилища для изображений
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Получаем параметр country из запроса
        const country = req.body.country || 'unknown';

        console.log('Uploading file for country:', country);
        console.log('Request body:', req.body);

        const dir = path.join(__dirname, `../public/images/${country}`);

        // Создаем папку для страны если она не существует
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Создаем уникальное имя файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.originalname.replace(ext, '') + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ dest: path.join(__dirname, '../temp-uploads') });

// API эндпоинты

// 1. Получить список техники
app.get('/api/vehicles', (req, res) => {
    try {
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
        res.json(jsonData.vehicles || []);
    } catch (error) {
        console.error('Error reading JSON file:', error);
        res.status(500).json({ error: 'Failed to read JSON file' });
    }
});

// 2. Обновить данные техники
app.put('/api/vehicles/:name', (req, res) => {
    try {
        const vehicleName = req.params.name;
        const updatedVehicle = req.body;

        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
        const vehicles = jsonData.vehicles || [];

        // Находим и обновляем данные техники
        const updatedVehicles = vehicles.map(vehicle => {
            if (vehicle.name === vehicleName) {
                return { ...vehicle, ...updatedVehicle };
            }
            return vehicle;
        });

        // Сохраняем обновленные данные
        jsonData.vehicles = updatedVehicles;
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

        res.json({ success: true, vehicle: updatedVehicle });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ error: 'Failed to update vehicle' });
    }
});

// 3. Загрузить изображение
app.post('/api/vehicles/:name/images', upload.single('image'), (req, res) => {
    try {
        logToFile("=== Загрузка изображения ===");
        logToFile(`Body: ${JSON.stringify(req.body)}`);
        logToFile(`Params: ${JSON.stringify(req.params)}`);
        logToFile(`File: ${req.file ? req.file.originalname : 'No file'}`);
        const vehicleName = req.params.name;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Теперь у нас есть доступ к req.body
        const country = req.body.country || 'unknown';
        console.log('Vehicle:', vehicleName);
        console.log('Country from body:', country);

        // Создаем директорию для страны, если она не существует
        const countryDir = path.join(__dirname, `../public/images/${country}`);
        if (!fs.existsSync(countryDir)) {
            fs.mkdirSync(countryDir, { recursive: true });
        }

        // Создаем новое имя файла с уникальным суффиксом
        const originalName = path.parse(file.originalname).name;
        const ext = path.parse(file.originalname).ext;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newFileName = `${originalName}-${uniqueSuffix}${ext}`;
        const finalPath = path.join(countryDir, newFileName);

        // Перемещаем файл из временной папки в окончательную директорию
        fs.copyFileSync(file.path, finalPath);
        fs.unlinkSync(file.path); // Удаляем временный файл

        // Создаем относительный путь для JSON
        const imagePath = `/images/${country}/${newFileName}`;

        // Обновляем данные в JSON
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
        const vehicles = jsonData.vehicles || [];

        // Находим технику и добавляем изображение
        const updatedVehicles = vehicles.map(vehicle => {
            if (vehicle.name === vehicleName) {
                const images = vehicle.images || [];
                const newImage = {
                    id: Date.now(),
                    url: imagePath,
                    caption: req.body.caption || file.originalname
                };

                return {
                    ...vehicle,
                    images: [...images, newImage],
                    hasImages: true
                };
            }
            return vehicle;
        });

        // Сохраняем обновленные данные
        jsonData.vehicles = updatedVehicles;
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

        res.json({
            success: true,
            image: {
                id: Date.now(),
                url: imagePath,
                caption: req.body.caption || file.originalname
            }
        });
    } catch (error) {
        logToFile(`Error: ${error.message}`);
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image', details: error.message });
    }
});

// 4. Сохранить все данные
app.post('/api/save', (req, res) => {
    try {
        const jsonData = { vehicles: req.body };
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Статический сервер для папки images
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Image storage path: ${imagesDir}`);
});