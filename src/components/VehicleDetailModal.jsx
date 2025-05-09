import React, { useState, useEffect } from 'react';
import { Modal, Carousel, Button, Tabs, Badge, Row, Col, Spin, Empty } from 'antd';
import {
    LeftOutlined,
    RightOutlined,
    InfoCircleOutlined,
    PictureOutlined,
    BulletOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined
} from '@ant-design/icons';
import { formatBR, getCountryName, getTypeName, getCountryColor } from '../utils';
import './VehicleDetailModal.css';

const { TabPane } = Tabs;

// Иконка для изображения снаряда/боеприпаса
const BulletIcon = props => <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}><path d="M7 19h10v-5h2v-2h-2V7H7v5H5v2h2v5zm2-12h6v12H9V7z" fill="currentColor"/></svg>;

const VehicleDetailModal = ({ visible, vehicle, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');
    const [images, setImages] = useState([]);
    const [armorImages, setArmorImages] = useState([]);
    const [fullscreen, setFullscreen] = useState(false);

    // Здесь будем загружать данные о танке, включая изображения
    useEffect(() => {
        if (visible && vehicle) {
            setLoading(true);

            // Временно используем моковые данные для демонстрации
            // В реальном приложении здесь будет API запрос для получения изображений
            const mockImages = [
                { id: 1, url: `https://via.placeholder.com/800x450?text=${vehicle.name}_1`, caption: 'Front view' },
                { id: 2, url: `https://via.placeholder.com/800x450?text=${vehicle.name}_2`, caption: 'Side view' },
                { id: 3, url: `https://via.placeholder.com/800x450?text=${vehicle.name}_3`, caption: 'Rear view' },
            ];

            const mockArmorImages = [
                { id: 1, url: `https://via.placeholder.com/800x450?text=${vehicle.name}_armor_front`, caption: 'Front armor' },
                { id: 2, url: `https://via.placeholder.com/800x450?text=${vehicle.name}_armor_side`, caption: 'Side armor' },
            ];

            setImages(mockImages);
            setArmorImages(mockArmorImages);

            // Имитация задержки загрузки
            setTimeout(() => {
                setLoading(false);
            }, 800);
        }
    }, [visible, vehicle]);

    // Обработчик закрытия модального окна
    const handleClose = () => {
        setActiveTab('info');
        setFullscreen(false);
        onClose();
    };

    // Переключение полноэкранного режима
    const toggleFullscreen = () => {
        setFullscreen(!fullscreen);
    };

    // Если нет данных о танке
    if (!vehicle) {
        return null;
    }

    // Компонент для отображения карусели изображений
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
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="vehicle-tabs"
            >
                <TabPane
                    tab={<span><InfoCircleOutlined /> Info</span>}
                    key="info"
                >
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <div className="vehicle-info-section">
                                <h3>Basic Information</h3>
                                <div className="vehicle-info-content">
                                    <div className="info-row">
                                        <span className="info-label">Country:</span>
                                        <span className="info-value" style={{ color: getCountryColor(vehicle.country) }}>
                      {getCountryName(vehicle.country)}
                    </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Type:</span>
                                        <span className="info-value">{getTypeName(vehicle.type)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Battle Rating:</span>
                                        <span className="info-value">
                      <Badge
                          count={formatBR(vehicle.br)}
                          style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              fontWeight: 'bold'
                          }}
                      />
                    </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Rank:</span>
                                        <span className="info-value">
                      <Badge
                          count={vehicle.rank}
                          style={{
                              backgroundColor: '#facc15',
                              color: 'black',
                              fontWeight: 'bold'
                          }}
                      />
                    </span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div className="vehicle-info-section">
                                <h3>Performance</h3>
                                <div className="vehicle-info-content">
                                    <div className="info-row">
                                        <span className="info-label">Top Speed:</span>
                                        <span className="info-value">-- km/h</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Weight:</span>
                                        <span className="info-value">-- tons</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Engine Power:</span>
                                        <span className="info-value">-- hp</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Power/Weight Ratio:</span>
                                        <span className="info-value">-- hp/ton</span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <div className="vehicle-description">
                        <h3>Description</h3>
                        <p>No vehicle description available. This would show the history and characteristics of the {vehicle.name}.</p>
                    </div>
                </TabPane>

                <TabPane
                    tab={<span><PictureOutlined /> Gallery</span>}
                    key="gallery"
                >
                    <ImageCarousel images={images} loading={loading} />
                </TabPane>

                <TabPane
                    tab={<span><BulletIcon /> Armor</span>}
                    key="armor"
                >
                    <ImageCarousel images={armorImages} loading={loading} />
                </TabPane>
            </Tabs>
        </Modal>
    );
};

export default VehicleDetailModal;