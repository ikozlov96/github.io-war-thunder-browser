import React from 'react';
import { Card, Badge } from 'antd';
import { getCountryName, getTypeIcon } from '../utils';
import { getCountryFlag } from '../countryFlags';

import './VehicleCard.css';

const VehicleCard = ({ vehicle, onDetails }) => {
    const { name, country, br, hasImages, images, type } = vehicle;

    // Выбираем первое изображение или null, если изображений нет
    const thumbnailImage = images && images.length > 0 ? images[0].url : null;

    // Получаем иконку типа
    const typeIconSvg = getTypeIcon(type);
    const countryFlagSvg = getCountryFlag(country);

    // Получаем флаг страны
    const countryWithFlag = getCountryName(country);
    const flagOnly = countryWithFlag ? countryWithFlag.split(' ')[0] : '';

    return (
        <Card
            hoverable
            className="vehicle-card"
            onClick={() => onDetails && onDetails(vehicle)}
            bodyStyle={{ padding: 0 }}
        >
            {/* Изображение */}
            <div className="vehicle-image-container">
                {thumbnailImage ? (
                    <img
                        src={thumbnailImage}
                        alt={name}
                        className="vehicle-image"
                    />
                ) : (
                    <div className="vehicle-no-image">
                        <div className="vehicle-type-icon-large" dangerouslySetInnerHTML={{ __html: typeIconSvg }} />
                    </div>
                )}

                {/* Бейдж для количества изображений */}
                {hasImages && images && images.length > 1 && (
                    <Badge
                        count={images.length}
                        className="image-counter"
                    />
                )}
            </div>

            {/* Информационная панель внизу */}
            <div className="vehicle-info-panel">
        <span
            className="country-flag-svg"
            data-country={country.toLowerCase()}
            dangerouslySetInnerHTML={{ __html: countryFlagSvg }}
        />
                <span className="vehicle-name">{name}</span>
                <div className="vehicle-specs">
                    <span className="vehicle-br">{br}</span>
                    <span className="vehicle-type-icon" dangerouslySetInnerHTML={{ __html: typeIconSvg }} />
                </div>
            </div>
        </Card>
    );
};

export default VehicleCard;