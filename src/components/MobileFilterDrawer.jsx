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
            width="85%" // Почти на весь экран
            className="mobile-filter-drawer"
            contentWrapperStyle={{ maxWidth: '400px' }} // Ограничение максимальной ширины
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
                    Применить
                </Button>
            </div>
        </Drawer>
    );
};

export default MobileFilterDrawer;