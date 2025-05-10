import React, { useState, useEffect } from 'react';
import { Modal, Carousel, Button, Spin, Empty } from 'antd';
import {
    LeftOutlined,
    RightOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined
} from '@ant-design/icons';
import './VehicleDetailModal.css';

const VehicleDetailModal = ({ visible, vehicle, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);
    const [fullscreen, setFullscreen] = useState(false);

    // Загружаем изображения техники, когда модальное окно становится видимым
    useEffect(() => {
        if (visible && vehicle) {
            setLoading(true);

            // Используем изображения из объекта vehicle если они доступны, иначе плейсхолдеры
            const vehicleImages = vehicle.images && vehicle.images.length > 0
                ? vehicle.images
                : [
                    { id: 1, url: `https://via.placeholder.com/800x450?text=${vehicle.name}_1`, caption: 'Front view' },
                    { id: 2, url: `https://via.placeholder.com/800x450?text=${vehicle.name}_2`, caption: 'Side view' },
                    { id: 3, url: `https://via.placeholder.com/800x450?text=${vehicle.name}_3`, caption: 'Rear view' },
                ];

            setImages(vehicleImages);

            // Имитация задержки загрузки
            setTimeout(() => {
                setLoading(false);
            }, 300);
        }
    }, [visible, vehicle]);

    // Обработка закрытия модального окна
    const handleClose = () => {
        setFullscreen(false);
        onClose();
    };

    // Переключение полноэкранного режима
    const toggleFullscreen = () => {
        setFullscreen(!fullscreen);
    };

    // Если нет данных о технике
    if (!vehicle) {
        return null;
    }

    // Компонент карусели изображений
    const ImageCarousel = ({ images, loading }) => {
        if (loading) {
            return (
                <div className="carousel-loading">
                    <Spin size="large" tip="Loading images..." />
                </div>
            );
        }

        if (!images || images.length === 0) {
            return (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No images available"
                    className="empty-carousel"
                />
            );
        }

        return (
            <div className="carousel-container">
                <Button
                    className="fullscreen-button"
                    icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    onClick={toggleFullscreen}
                />
                <Carousel
                    arrows
                    prevArrow={<Button type="primary" shape="circle" icon={<LeftOutlined />} />}
                    nextArrow={<Button type="primary" shape="circle" icon={<RightOutlined />} />}
                    autoplay={false}
                    className="vehicle-carousel"
                >
                    {images.map(image => (
                        <div key={image.id} className="carousel-item">
                            <img src={image.url} alt={image.caption || 'Vehicle image'} />
                            {image.caption && (
                                <div className="image-caption">{image.caption}</div>
                            )}
                        </div>
                    ))}
                </Carousel>
            </div>
        );
    };

    return (
        <Modal
            visible={visible}
            title={vehicle.name}
            onCancel={handleClose}
            footer={null}
            width={fullscreen ? "90%" : 800}
            centered
            className={`vehicle-detail-modal ${fullscreen ? 'fullscreen-modal' : ''}`}
            destroyOnClose
        >
            <ImageCarousel images={images} loading={loading} />
        </Modal>
    );
};

export default VehicleDetailModal;