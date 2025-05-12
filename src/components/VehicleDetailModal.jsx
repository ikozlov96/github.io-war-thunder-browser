import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import './VehicleDetailModal.css';

const VehicleDetailModal = ({ visible, vehicle, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [showControls, setShowControls] = useState(true);
    const [touchStartTime, setTouchStartTime] = useState(null);
    const [touchPosition, setTouchPosition] = useState({ startY: 0, currentY: 0 });
    const modalRef = useRef(null);
    const controlsTimerRef = useRef(null);

    // Слушатели клавиатуры
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!visible) return;

            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    handlePrev();
                    break;
                case 'ArrowRight':
                    handleNext();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [visible, images, currentIndex, onClose]);

    // Загружаем изображения техники, когда модальное окно становится видимым
    useEffect(() => {
        if (visible && vehicle) {
            setLoading(true);
            setCurrentIndex(0);

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

    // Автоматически скрывать элементы управления на мобильных устройствах
    useEffect(() => {
        if (visible && showControls) {
            controlsTimerRef.current = setTimeout(() => {
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    setShowControls(false);
                }
            }, 3000);
        }

        return () => {
            if (controlsTimerRef.current) {
                clearTimeout(controlsTimerRef.current);
            }
        };
    }, [visible, showControls]);

    // Переключение на предыдущее изображение
    const handlePrev = useCallback(() => {
        if (images.length <= 1) return;
        setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
        setShowControls(true);
    }, [images]);

    // Переключение на следующее изображение
    const handleNext = useCallback(() => {
        if (images.length <= 1) return;
        setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
        setShowControls(true);
    }, [images]);

    // Обработчики сенсорных жестов
    const handleTouchStart = (e) => {
        setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        setTouchStartTime(new Date().getTime());
        setTouchPosition({
            startY: e.touches[0].clientY,
            currentY: e.touches[0].clientY
        });
        setShowControls(true);
    };

    const handleTouchMove = (e) => {
        if (!touchStart) return;

        setTouchEnd({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        setTouchPosition(prev => ({
            ...prev,
            currentY: e.touches[0].clientY
        }));

        // Проверка свайпа вверх для закрытия
        const diffY = touchStart.y - e.touches[0].clientY;
        if (diffY > 100) {
            // Применяем визуальный эффект для закрытия
            if (modalRef.current) {
                modalRef.current.style.opacity = Math.max(0.3, 1 - (diffY / 300));
                modalRef.current.style.transform = `translateY(-${diffY/3}px)`;
            }
        }
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const touchTime = new Date().getTime() - touchStartTime;
        const isFastTouch = touchTime < 300;

        // Reset modal styles
        if (modalRef.current) {
            modalRef.current.style.opacity = '1';
            modalRef.current.style.transform = 'translateY(0)';
        }

        // Horizontal swipe for navigation
        const horizontalDistance = touchStart.x - touchEnd.x;
        const verticalDistance = touchStart.y - touchEnd.y;

        // Проверяем, что свайп был преимущественно горизонтальным
        if (Math.abs(horizontalDistance) > Math.abs(verticalDistance) && Math.abs(horizontalDistance) > 50) {
            if (horizontalDistance > 0) {
                handleNext();
            } else {
                handlePrev();
            }
        }
        // Свайп вверх для закрытия
        else if (verticalDistance > 100 || (verticalDistance > 50 && isFastTouch)) {
            onClose();
        }
        // Свайп вниз для закрытия (более короткий)
        else if (verticalDistance < -100 || (verticalDistance < -50 && isFastTouch)) {
            onClose();
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    // Обработчик клика для показа/скрытия элементов управления
    const handleImageClick = () => {
        setShowControls(!showControls);
    };

    // Если компонент невидим или нет данных о технике, ничего не рендерим
    if (!visible || !vehicle) {
        return null;
    }

    // Получаем текущее изображение
    const currentImage = images[currentIndex];

    // Определяем, является ли устройство мобильным
    const isMobile = window.innerWidth <= 768;

    return (
        <div
            className={`photo-gallery-modal ${visible ? 'visible' : ''}`}
            ref={modalRef}
        >
            <div
                className="photo-gallery-content"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleImageClick}
            >
                {/* Кнопка закрытия, видима только при наличии showControls */}
                {showControls && (
                    <button
                        className="close-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                    >
                        <CloseOutlined />
                    </button>
                )}

                {/* Кнопки навигации, видимы только при наличии showControls и если изображений больше 1 */}
                {showControls && images.length > 1 && (
                    <>
                        <button
                            className={`nav-button prev-button ${isMobile ? 'mobile' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrev();
                            }}
                        >
                            <LeftOutlined />
                        </button>
                        <button
                            className={`nav-button next-button ${isMobile ? 'mobile' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                        >
                            <RightOutlined />
                        </button>
                    </>
                )}

                {/* Индикаторы изображений для мобильных устройств */}
                {showControls && images.length > 1 && isMobile && (
                    <div className="image-indicators">
                        {images.map((_, index) => (
                            <div
                                key={index}
                                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                )}

                {/* Основное изображение */}
                {!loading && currentImage && (
                    <div className="image-container">
                        <img
                            src={currentImage.url}
                            alt={currentImage.caption || 'Vehicle image'}
                            className="main-image"
                        />
                        {/* Отображаем подпись только если она есть и только при showControls */}
                        {showControls && currentImage.caption && (
                            <div className="image-caption">
                                {currentImage.caption}
                            </div>
                        )}
                    </div>
                )}

                {/* Загрузка */}
                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleDetailModal;