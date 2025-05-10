import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Modal, List, Card } from 'antd';
import { UploadOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import api from '../api';

const ImageUploader = ({ vehicle, onImagesAdded }) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    // Сброс списка файлов при смене техники
    useEffect(() => {
        setFileList([]);
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
                // Вызываем колбэк с новыми изображениями
                onImagesAdded(uploadedImages);
                message.success(`Сохранено ${uploadedImages.length} изображений`);
                setFileList([]); // Очищаем список файлов
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

    // Обработчик предпросмотра изображений
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }

        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
    };

    return (
        <div>
            <Upload
                listType="picture"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                beforeUpload={() => false} // Отключаем автоматическую загрузку
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
                icon={<SaveOutlined />}
            >
                {uploading ? 'Загрузка...' : 'Загрузить и сохранить'}
            </Button>

            <Modal
                open={previewVisible}
                title="Предпросмотр"
                footer={null}
                onCancel={() => setPreviewVisible(false)}
            >
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </div>
    );
};

export default ImageUploader;