// Modified VehicleDetailModal.jsx with proper ref handling
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Carousel, Button, Spin, Empty } from 'antd';
import {
    LeftOutlined,
    RightOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
    CloseOutlined
} from '@ant-design/icons';
import './VehicleDetailModal.css';

const VehicleDetailModal = ({ visible, vehicle, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);
    const [fullscreen, setFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Use useRef instead of useState for the carousel reference
    const carouselRef = useRef(null);

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Load vehicle images when modal becomes visible
    useEffect(() => {
        if (visible && vehicle) {
            setLoading(true);

            // Use images from vehicle object if available, otherwise use placeholders
            const vehicleImages = vehicle.images && vehicle.images.length > 0
                ? vehicle.images
                : [
                    { id: 1, url: `https://via.placeholder.com/800x450?text=${vehicle.name}_1`, caption: 'Front view' },
                    { id: 2, url: `https://via.placeholder.com/800x450?text=${vehicle.name}_2`, caption: 'Side view' },
                    { id: 3, url: `https://via.placeholder.com/800x450?text=${vehicle.name}_3`, caption: 'Rear view' },
                ];

            setImages(vehicleImages);

            // Simulate loading delay
            setTimeout(() => {
                setLoading(false);
            }, 300);
        }
    }, [visible, vehicle]);

    // Handle modal close
    const handleClose = () => {
        setFullscreen(false);
        onClose();
    };

    // Toggle fullscreen mode
    const toggleFullscreen = () => {
        setFullscreen(!fullscreen);
    };

    // Handle swipe navigation for mobile
    const handleSwipeStart = (e) => {
        const startX = e.touches[0].clientX;
        const swipeArea = e.currentTarget;

        const handleSwipeMove = (moveEvent) => {
            moveEvent.preventDefault();
        };

        const handleSwipeEnd = (endEvent) => {
            const endX = endEvent.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    // Swipe left, go to next
                    if (carouselRef.current) {
                        carouselRef.current.next();
                    }
                } else {
                    // Swipe right, go to previous
                    if (carouselRef.current) {
                        carouselRef.current.prev();
                    }
                }
            }

            swipeArea.removeEventListener('touchmove', handleSwipeMove);
            swipeArea.removeEventListener('touchend', handleSwipeEnd);
        };

        swipeArea.addEventListener('touchmove', handleSwipeMove, { passive: false });
        swipeArea.addEventListener('touchend', handleSwipeEnd);
    };

    // Navigate to previous image
    const handlePrev = () => {
        if (carouselRef.current) {
            carouselRef.current.prev();
        }
    };

    // Navigate to next image
    const handleNext = () => {
        if (carouselRef.current) {
            carouselRef.current.next();
        }
    };

    // If no vehicle data
    if (!vehicle) {
        return null;
    }

    // Image carousel component
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
                    size={isMobile ? "large" : "middle"}
                />

                <Carousel
                    arrows={!isMobile} // Hide default arrows on mobile
                    prevArrow={<Button type="primary" shape="circle" icon={<LeftOutlined />} />}
                    nextArrow={<Button type="primary" shape="circle" icon={<RightOutlined />} />}
                    autoplay={false}
                    className="vehicle-carousel"
                    ref={carouselRef} // Use the ref directly
                >
                    {images.map(image => (
                        <div key={image.id} className="carousel-item">
                            <img
                                src={image.url}
                                alt={image.caption || 'Vehicle image'}
                                loading="lazy" // Add lazy loading
                            />
                            {image.caption && (
                                <div className="image-caption">{image.caption}</div>
                            )}

                            {isMobile && (
                                <div
                                    className="carousel-swipe-area"
                                    onTouchStart={handleSwipeStart}
                                />
                            )}
                        </div>
                    ))}
                </Carousel>

                {/* Add large touch-friendly navigation buttons for mobile */}
                {isMobile && (
                    <div className="carousel-controls">
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<LeftOutlined />}
                            onClick={handlePrev}
                            size="large"
                        />
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<RightOutlined />}
                            onClick={handleNext}
                            size="large"
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal
            visible={visible}
            title={vehicle.name}
            onCancel={handleClose}
            footer={null}
            width={isMobile ? "100%" : (fullscreen ? "90%" : 800)}
            centered
            className={`vehicle-detail-modal ${fullscreen || isMobile ? 'fullscreen-modal' : ''}`}
            destroyOnClose
            closeIcon={<CloseOutlined />}
            bodyStyle={{ padding: 0 }}
        >
            <ImageCarousel images={images} loading={loading} />
        </Modal>
    );
};

export default VehicleDetailModal;