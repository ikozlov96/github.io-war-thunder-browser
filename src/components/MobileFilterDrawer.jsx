import React from 'react';
import { Drawer, Button } from 'antd';
import { FilterOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import FilterSidebar from './FilterSidebar';
import './MobileFilterDrawer.css';

const MobileFilterDrawer = ({
                                visible,
                                onClose,
                                filters,
                                availableFilters,
                                onFilterChange,
                                onSortChange,
                                onClearFilters,
                                sort,
                                onApply
                            }) => {
    // Определяем, является ли устройство планшетом
    const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;

    // Определяем количество активных фильтров для отображения в кнопке применения
    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.nameFilter) count++;
        if (filters.countryFilter && filters.countryFilter.length > 0) count++;
        if (filters.rankFilter && filters.rankFilter.length > 0) count++;
        if (filters.typeFilter && filters.typeFilter.length > 0) count++;
        if (filters.brFilterActive) count++;
        return count;
    };

    const activeCount = getActiveFilterCount();

    return (
        <Drawer
            title={
                <div className="mobile-drawer-title">
                    <FilterOutlined style={{ marginRight: 8 }} />
                    Фильтры техники
                </div>
            }
            placement="left"
            onClose={onClose}
            open={visible}
            width={isTablet ? "60%" : "85%"} // Меньшая ширина для планшетов
            className={`mobile-filter-drawer ${isTablet ? 'tablet-drawer' : ''}`}
            contentWrapperStyle={{ maxWidth: isTablet ? '500px' : '400px' }} // Ограничение максимальной ширины
            closeIcon={<CloseOutlined style={{ fontSize: '18px' }} />}
            // Убираем стандартную кнопку закрытия в пользу наших кнопок
            extra={null}
        >
            <div className="mobile-filter-content">
                <FilterSidebar
                    filters={filters}
                    availableFilters={availableFilters}
                    onFilterChange={onFilterChange}
                    onSortChange={onSortChange}
                    onClearFilters={onClearFilters}
                    sort={sort}
                    isMobile={true} // Добавляем флаг для мобильной версии
                    isTablet={isTablet} // Передаем флаг планшета
                />
            </div>

            <div className="mobile-filter-actions">
                <Button
                    size="large"
                    icon={<CloseOutlined />}
                    onClick={onClose}
                    className="cancel-button"
                >
                    Закрыть
                </Button>
                <Button
                    type="primary"
                    size="large"
                    icon={<CheckOutlined />}
                    onClick={() => {
                        onApply(); // Применение фильтров
                        onClose(); // Закрытие модального окна
                    }}
                    className="apply-button"
                >
                    {activeCount > 0 ?
                        `Применить (${activeCount})` :
                        'Применить'
                    }
                </Button>
            </div>
        </Drawer>
    );
};

export default MobileFilterDrawer;