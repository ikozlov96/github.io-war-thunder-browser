// Modified VehicleCard.jsx with better mobile UX
import React from 'react';
import { Card, Badge } from 'antd';
import { getCountryName, getTypeIcon } from '../utils';
import { getCountryFlag } from '../countryFlags';

import './VehicleCard.css';

const VehicleCard = ({ vehicle, onDetails }) => {
    const { name, country, br, hasImages, images, type } = vehicle;

    // Get the first image or null if there are none
    const thumbnailImage = images && images.length > 0 ? images[0].url : null;

    // Get type icon and country flag
    const typeIconSvg = getTypeIcon(type);
    const countryFlagSvg = getCountryFlag(country);

    // Get country name
    const countryWithFlag = getCountryName(country);

    // Handle tap/click on the card
    const handleCardClick = () => {
        if (onDetails) {
            onDetails(vehicle);
        }
    };

    return (
        <div className="vehicle-card-clickable" onClick={handleCardClick}>
            <Card
                className="vehicle-card"
                bodyStyle={{ padding: 0 }}
            >
                {/* Image container with aspect ratio */}
                <div className="vehicle-image-container">
                    {thumbnailImage ? (
                        <img
                            src={thumbnailImage}
                            alt={name}
                            className="vehicle-image"
                            loading="lazy" // Add lazy loading for better mobile performance
                        />
                    ) : (
                        <div className="vehicle-no-image">
                            <div className="vehicle-type-icon-large" dangerouslySetInnerHTML={{ __html: typeIconSvg }} />
                        </div>
                    )}

                    {/* Badge for number of images */}
                    {hasImages && images && images.length > 1 && (
                        <Badge
                            count={images.length}
                            className="image-counter"
                            size="large" // Larger badge for better visibility
                        />
                    )}
                </div>

                {/* Information panel with better spacing */}
                <div className="vehicle-info-panel">
                    <span
                        className="country-flag-svg"
                        data-country={country.toLowerCase()}
                        dangerouslySetInnerHTML={{ __html: countryFlagSvg }}
                        title={countryWithFlag} // Add title for accessibility
                    />
                    <span className="vehicle-name">{name}</span>
                    <div className="vehicle-specs">
                        <span className="vehicle-br" title="Battle Rating">{br}</span>
                        <span
                            className="vehicle-type-icon"
                            dangerouslySetInnerHTML={{ __html: typeIconSvg }}
                            title={type.replace('_', ' ')} // Add title for accessibility
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default VehicleCard;