import React from 'react';
import { Row, Col, Empty, Spin, Pagination } from 'antd';
import VehicleCard from './VehicleCard';
import './VehiclesList.css';

const VehiclesList = ({ vehicles, loading, error, pagination, onPageChange, onVehicleSelect, onVehicleDetails }) => {
    const { current, pageSize, total } = pagination;

    // Calculate current page of vehicles
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedVehicles = vehicles.slice(startIndex, endIndex);

    // Handle loading state
    if (loading) {
        return (
            <div className="vehicles-loading">
                <Spin size="large" />
                <p>Loading vehicles data...</p>
            </div>
        );
    }

    // Handle error state
    if (error) {
        return (
            <div className="vehicles-error">
                <h2>Error Loading Data</h2>
                <p>{error}</p>
                <p>Make sure the output.json file is in the public directory.</p>
            </div>
        );
    }

    // Handle empty results
    if (vehicles.length === 0) {
        return (
            <div className="vehicles-empty">
                <Empty
                    description="No vehicles match your filters"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <p>Try adjusting your filter criteria.</p>
            </div>
        );
    }

    return (
        <div className="vehicles-list-container">
            <div className="vehicles-count">
                Found <strong>{total}</strong> vehicles matching your filters
            </div>

            <Row gutter={[16, 16]} className="vehicles-list">
                {paginatedVehicles.map((vehicle, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={`${vehicle.name}-${index}`}>
                        <div onClick={() => onVehicleSelect && onVehicleSelect(vehicle)}>
                            <VehicleCard
                                vehicle={vehicle}
                                onDetails={onVehicleDetails || onVehicleSelect}
                            />
                        </div>
                    </Col>
                ))}
            </Row>

            <div className="vehicles-pagination">
                <Pagination
                    current={current}
                    pageSize={pageSize}
                    total={total}
                    onChange={onPageChange}
                    showSizeChanger
                    pageSizeOptions={[12, 24, 48, 96]}
                    showTotal={(total) => `Total ${total} vehicles`}
                />
            </div>
        </div>
    );
};

export default VehiclesList;