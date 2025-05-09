import React from 'react';
import { getImagePath, getCountryName, getTypeName, getCountryColor, formatBR, getTypeIcon } from '../utils';
import { Card, Tag, Tooltip } from 'antd';
import './VehicleCard.css';

const VehicleCard = ({ vehicle }) => {
    if (!vehicle.name) return null;

    const countryColor = getCountryColor(vehicle.country);
    const countryDisplayName = getCountryName(vehicle.country);

    // Split country name to separate emoji and text
    const countryParts = countryDisplayName.split(' ');
    const flagEmoji = countryParts[0];
    const countryText = countryParts.slice(1).join(' ');

    return (
        <Card
            className="vehicle-card"
            hoverable
        >
            <div className="vehicle-card-content">
                <div className="vehicle-image-container">
                    <img
                        src={getImagePath(vehicle.country, vehicle.type)}
                        alt={vehicle.name}
                        className="vehicle-image"
                    />
                </div>

                <div className="vehicle-details">
                    <Tooltip title={vehicle.name}>
                        <h3 className="vehicle-name">{vehicle.name}</h3>
                    </Tooltip>

                    <div className="vehicle-tags">
                        <Tag color={countryColor} className="country-tag">
                            <span className="flag-emoji">{flagEmoji}</span> {countryText}
                        </Tag>

                        <Tag color="blue" className="br-tag">
                            BR {formatBR(vehicle.br)}
                        </Tag>

                        <Tag color="gold" className="rank-tag">
                            Rank {vehicle.rank}
                        </Tag>
                    </div>

                    <div className="vehicle-type">
                        <span className="label">Type:</span>
                        <span className="value">
                            <span className="card-type-icon" dangerouslySetInnerHTML={{ __html: getTypeIcon(vehicle.type) }}></span>
                            {getTypeName(vehicle.type)}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default VehicleCard;