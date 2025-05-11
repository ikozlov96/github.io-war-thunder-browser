import React, { useState, useEffect } from 'react';
import { Upload, Button, message, List, Card, Input, Space } from 'antd';
import { UploadOutlined, DeleteOutlined, SaveOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import api from '../api';

const ImageUploader = ({ vehicle, onImagesAdded }) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [tempImages, setTempImages] = useState([]);
    const [imageCaptions, setImageCaptions] = useState({});

    // Сброс списка файлов при смене техники
    useEffect(() => {
        setFileList([]);
        setTempImages([]);
        setImageCaptions({});
    }, [vehicle]);

    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning('Пожалуйста, сначала выберите файлы для загрузки');
            return;
        }

        setUploading(true);
        message.loading('Загрузка изображений...');

        try {
            const uploadedImages = [];

            // Загружаем каждый файл поочередно
            for (const file of fileList) {
                try {
                    console.log(`Загрузка файла ${file.name} для ${vehicle.name} (${vehicle.country})`);

                    const result = await api.uploadImage(
                        vehicle.name,
                        vehicle.country,
                        file.originFileObj,
                        file.name
                    );

                    if (result.success) {
                        uploadedImages.push(result.image);
                        message.success(`${file.name} успешно загружен`);
                    } else {
                        message.error(`Не удалось загрузить ${file.name}`);
                    }
                } catch (error) {
                    console.error(`Ошибка при загрузке ${file.name}:`, error);
                    message.error(`Ошибка при загрузке ${file.name}: ${error.message}`);
                }
            }

            if (uploadedImages.length > 0) {
                // Добавляем загруженные изображения во временное хранилище
                setTempImages(prev => [...prev, ...uploadedImages]);

                // Инициализируем подписи
                const newCaptions = {...imageCaptions};
                uploadedImages.forEach(img => {
                    newCaptions[img.id] = img.caption || '';
                });
                setImageCaptions(newCaptions);

                // Очищаем список файлов
                setFileList([]);
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
        setTempImages(prev => prev.filter(image => image.id !== imageId));
        // Удаляем и подпись
        setImageCaptions(prev => {
            const updated = { ...prev };
            delete updated[imageId];
            return updated;
        });
    };

    // Изменение порядка изображений
    const handleMoveImage = (index, direction) => {
        if ((direction === 'up' && index === 0) ||
            (direction === 'down' && index === tempImages.length - 1)) {
            return;
        }

        const newTempImages = [...tempImages];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap images
        [newTempImages[index], newTempImages[targetIndex]] =
            [newTempImages[targetIndex], newTempImages[index]];

        setTempImages(newTempImages);
    };

    // Сохранение всех изображений
    const handleSaveAllImages = () => {
        if (tempImages.length === 0) {
            message.warning('Нет изображений для сохранения');
            return;
        }

        // Применяем текущие подписи к изображениям
        const imagesWithCaptions = tempImages.map(image => ({
            ...image,
            caption: imageCaptions[image.id] || image.caption || ''
        }));

        onImagesAdded(imagesWithCaptions);

        // Очищаем временные данные
        setTempImages([]);
        setImageCaptions({});
        message.success(`${imagesWithCaptions.length} изображений сохранено`);
    };

    return (
        <div>
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
                    {uploading ? 'Загрузка...' : 'Загрузить'}
                </Button>
            </div>

            {tempImages.length > 0 && (
                <div className="images-preview" style={{ marginTop: 20 }}>
                    <h3>Предварительный просмотр</h3>
                    <List
                        grid={{ gutter: 16, column: 3 }}
                        dataSource={tempImages}
                        renderItem={(image, index) => (
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
                                        <ArrowUpOutlined
                                            key="up"
                                            onClick={() => handleMoveImage(index, 'up')}
                                            style={{ color: index === 0 ? '#ccc' : '#1890ff' }}
                                        />,
                                        <ArrowDownOutlined
                                            key="down"
                                            onClick={() => handleMoveImage(index, 'down')}
                                            style={{ color: index === tempImages.length - 1 ? '#ccc' : '#1890ff' }}
                                        />,
                                        <DeleteOutlined
                                            key="delete"
                                            onClick={() => handleImageRemove(image.id)}
                                        />
                                    ]}
                                >
                                    <Input
                                        placeholder="Описание изображения"
                                        value={imageCaptions[image.id] || image.caption || ''}
                                        onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                                    />
                                </Card>
                            </List.Item>
                        )}
                    />

                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSaveAllImages}
                        >
                            Сохранить все изображения
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;