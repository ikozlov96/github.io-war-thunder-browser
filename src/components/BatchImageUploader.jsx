import React, { useState } from 'react';
import { Upload, Button, message, Space, List, Card, Input } from 'antd';
import { UploadOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api';

const BatchImageUploader = ({ vehicles, onSave, onCancel }) => {
    const [fileList, setFileList] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [imageCaptions, setImageCaptions] = useState({});

    // Выбираем первую страну из списка для загрузки изображений
    // Ideally this would be more sophisticated if vehicles can have different countries
    const getDefaultCountry = () => {
        if (vehicles && vehicles.length > 0) {
            return vehicles[0].country;
        }
        return 'unknown';
    };

    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning('Пожалуйста, сначала выберите файлы для загрузки');
            return;
        }

        setUploading(true);
        message.loading('Загрузка изображений...');

        try {
            const country = getDefaultCountry();
            const uploadResults = [];

            // Загружаем каждый файл поочередно
            for (const file of fileList) {
                try {
                    console.log(`Загрузка файла ${file.name}`);
                    console.log("Страна:", country);

                    // Используем API для загрузки файлов
                    // Мы используем особый путь для пакетной загрузки
                    const result = await api.uploadImage(
                        'batch', // Используем специальное имя для пакетной загрузки
                        country,
                        file.originFileObj,
                        file.name
                    );

                    if (result.success) {
                        // Добавляем результат загрузки
                        uploadResults.push({
                            ...result.image,
                            captionEditMode: false
                        });
                        message.success(`${file.name} успешно загружен`);
                    } else {
                        message.error(`Не удалось загрузить ${file.name}`);
                    }
                } catch (error) {
                    console.error(`Ошибка при загрузке ${file.name}:`, error);
                    message.error(`Ошибка при загрузке ${file.name}: ${error.message}`);
                }
            }

            if (uploadResults.length > 0) {
                setUploadedImages(uploadResults);
                setFileList([]);

                // Инициализируем подписи для каждого изображения
                const captions = {};
                uploadResults.forEach(img => {
                    captions[img.id] = img.caption || '';
                });
                setImageCaptions(captions);
            }
        } catch (error) {
            console.error('Общая ошибка загрузки:', error);
            message.error(`Ошибка загрузки: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    // Обработчик изменения списка файлов
    const handleChange = ({ fileList }) => {
        setFileList(fileList);
    };

    // Изменение подписи к изображению
    const handleCaptionChange = (id, value) => {
        setImageCaptions(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // Удаление загруженного изображения
    const handleImageRemove = (imageId) => {
        setUploadedImages(prev => prev.filter(image => image.id !== imageId));
        // Удаляем и подпись
        setImageCaptions(prev => {
            const updated = { ...prev };
            delete updated[imageId];
            return updated;
        });
    };

    // Сохранение всех изображений для выбранных транспортных средств
    const handleSaveAllImages = () => {
        // Применяем текущие подписи к изображениям
        const imagesWithCaptions = uploadedImages.map(image => ({
            ...image,
            caption: imageCaptions[image.id] || image.caption || ''
        }));

        onSave(imagesWithCaptions);
    };

    return (
        <div className="batch-uploader">
            <div className="upload-section">
                <Upload
                    listType="picture"
                    fileList={fileList}
                    onChange={handleChange}
                    beforeUpload={(file) => {
                        const isImage = file.type.startsWith('image/');
                        if (!isImage) {
                            message.error('Можно загружать только изображения!');
                            return Upload.LIST_IGNORE;
                        }
                        return false; // Отключаем автоматическую загрузку
                    }}
                    multiple
                >
                    <Button icon={<UploadOutlined />}>Выбрать изображения</Button>
                </Upload>

                <Button
                    type="primary"
                    onClick={handleUpload}
                    disabled={fileList.length === 0}
                    loading={uploading}
                    style={{ marginTop: 16 }}
                    icon={<UploadOutlined />}
                >
                    {uploading ? 'Загрузка...' : 'Загрузить изображения'}
                </Button>
            </div>

            {uploadedImages.length > 0 && (
                <div className="images-preview">
                    <h3>Загруженные изображения</h3>
                    <List
                        grid={{ gutter: 16, column: 3 }}
                        dataSource={uploadedImages}
                        renderItem={image => (
                            <List.Item>
                                <Card
                                    cover={
                                        <div style={{ height: 150, overflow: 'hidden' }}>
                                            <img
                                                alt={image.caption}
                                                src={image.url}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    }
                                    actions={[
                                        <DeleteOutlined key="delete" onClick={() => handleImageRemove(image.id)} />
                                    ]}
                                >
                                    <Input
                                        placeholder="Описание изображения"
                                        value={imageCaptions[image.id] || ''}
                                        onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                                    />
                                </Card>
                            </List.Item>
                        )}
                    />

                    <div className="batch-actions" style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                        <Space>
                            <Button onClick={onCancel}>Отмена</Button>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={handleSaveAllImages}
                                disabled={uploadedImages.length === 0}
                            >
                                Сохранить изображения для выбранной техники ({vehicles.length})
                            </Button>
                        </Space>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchImageUploader;