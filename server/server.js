// Optimized server.js image upload logic
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Path to JSON file
const jsonFilePath = path.join(__dirname, '../public/output.json');

// Create base images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, {recursive: true});
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Получаем параметр country из запроса
        console.log("Тело запроса при определении папки:", req.body);

        // ВАЖНО: Multer может не распарсить body до вызова destination
        // Получаем country из query параметров, если body еще не доступен
        const country = (req.body && req.body.country) || req.query.country || 'unknown';

        console.log('Сохраняем файл в директорию для страны:', country);

        const dir = path.join(__dirname, `../public/images/${country}`);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext)
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');

        cb(null, `${baseName}-${timestamp}${ext}`);
    }
});


const upload = multer({
    storage: storage,
    // Add limits if needed
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Simple logging function
function logToFile(message) {
    const logFile = path.join(__dirname, 'server.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${typeof message === 'string' ? message : JSON.stringify(message)}\n`;
    fs.appendFileSync(logFile, logMessage);
}

// API ENDPOINTS

// 1. Get vehicles list
app.get('/api/vehicles', (req, res) => {
    try {
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
        res.json(jsonData.vehicles || []);
    } catch (error) {
        console.error('Error reading JSON file:', error);
        res.status(500).json({success: false, error: 'Failed to read JSON file'});
    }
});

// 2. Update vehicle data
app.put('/api/vehicles/:name', (req, res) => {
    try {
        const vehicleName = req.params.name;
        const updatedVehicle = req.body;

        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
        const vehicles = jsonData.vehicles || [];

        // Find and update the vehicle
        const updatedVehicles = vehicles.map(vehicle => {
            if (vehicle.name === vehicleName) {
                return {...vehicle, ...updatedVehicle};
            }
            return vehicle;
        });

        // Save updated data
        jsonData.vehicles = updatedVehicles;
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

        res.json({success: true, vehicle: updatedVehicle});
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({success: false, error: 'Failed to update vehicle', details: error.message});
    }
});

// 3. Upload image
app.post('/api/vehicles/:name/images', (req, res) => {
    // Добавляем country в query parameters для multer
    const country = req.query.country || 'unknown';

    // Используем одноразовый upload для этого запроса
    const singleUpload = upload.single('image');

    singleUpload(req, res, function(err) {
        if (err) {
            console.error('Ошибка загрузки файла:', err);
            return res.status(500).json({ success: false, error: 'Ошибка загрузки файла' });
        }

        try {
            console.log("Body после загрузки:", req.body);
            console.log("Query параметры:", req.query);

            const vehicleName = req.params.name;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ success: false, error: 'Файл не загружен' });
            }

            // Используем country из req.body или из query параметров
            const country = req.body.country || req.query.country || 'unknown';
            console.log('Техника:', vehicleName);
            console.log('Страна:', country);
            console.log('Файл сохранен в:', file.path);

            // Создаем путь для JSON
            const imagePath = `/images/${country}/${file.filename}`;
            console.log('Путь изображения для JSON:', imagePath);

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
            console.error('Ошибка при обработке загрузки:', error);
            res.status(500).json({
                success: false,
                error: 'Ошибка при обработке загрузки',
                details: error.message
            });
        }
    });
});

app.post('/api/save', (req, res) => {
    try {
        const jsonData = {vehicles: req.body};
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
        res.json({success: true});
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({success: false, error: 'Failed to save data'});
    }
});

// Static server for images folder
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Image storage path: ${imagesDir}`);
});