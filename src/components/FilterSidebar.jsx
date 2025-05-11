import React from 'react';
import {Button, Collapse, Input, Radio, Slider, Tooltip} from 'antd';
import {
    ClearOutlined,
    FilterOutlined,
    SearchOutlined,
    SortAscendingOutlined,
    InfoCircleOutlined,
    MinusOutlined,
    PlusOutlined
} from '@ant-design/icons';
import {getCountryColor, getTypeName, formatBR, getTypeIcon} from '../utils';
import {getCountryFlag} from '../countryFlags'; // Импортируем функцию для получения SVG флагов
import './FilterSidebar.css';

const {Panel} = Collapse;

const FilterSidebar = ({
                           filters,
                           availableFilters,
                           onFilterChange,
                           onSortChange,
                           onClearFilters,
                           sort,
                           isTablet = false
                       }) => {
    const {nameFilter, countryFilter, typeFilter, brValue, brFilterActive} = filters;
    const {countries, types, brValues} = availableFilters;

    // Handle name filter change
    const handleNameChange = (e) => {
        onFilterChange('nameFilter', e.target.value);
    };

    // Handle BR slider change
    const handleBRChange = (value) => {
        onFilterChange('brValue', value);
    };

    // Рассчитываем диапазон BR для отображения (±1.0)
    const minBR = Math.max(0, brValue - 1.0);
    const maxBR = Math.min(12.0, brValue + 1.0);

    // Handle country selection
    const handleCountryChange = (country) => {
        const updatedFilter = countryFilter.includes(country)
            ? countryFilter.filter(c => c !== country)
            : [...countryFilter, country];

        onFilterChange('countryFilter', updatedFilter);
    };

    // Handle type selection
    const handleTypeChange = (type) => {
        const updatedFilter = typeFilter.includes(type)
            ? typeFilter.filter(t => t !== type)
            : [...typeFilter, type];

        onFilterChange('typeFilter', updatedFilter);
    };

    // Дополнительные классы для планшета
    const tabletClass = isTablet ? 'tablet-friendly' : '';

    // Генерируем отметки для слайдера на основе доступных значений BR
    const marks = {};
    if (brValues && brValues.length > 0) {
        brValues.forEach(value => {
            // Добавляем только основные отметки (целые числа) для избежания перегруженности
            if (value % 1 === 0) {
                marks[value] = value.toFixed(1);
            }
        });
    }

    // Создаем уникальные значения для шагов слайдера
    const findClosestBR = (value) => {
        if (!brValues || brValues.length === 0) return value;

        // Находим ближайшее значение BR из доступных
        let closest = brValues.reduce((prev, curr) => {
            return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
        });

        return closest;
    };

    // Функция для получения следующего доступного значения BR
    const getNextBR = () => {
        if (!brValues || brValues.length === 0) {
            return Math.min(12, brValue + 0.3);
        }

        // Сортируем BR значения по возрастанию
        const sortedBRs = [...brValues].sort((a, b) => a - b);

        // Находим индекс текущего (или ближайшего) значения
        let currentIndex = 0;
        let closestDistance = Infinity;

        for (let i = 0; i < sortedBRs.length; i++) {
            const distance = Math.abs(sortedBRs[i] - brValue);
            if (distance < closestDistance) {
                closestDistance = distance;
                currentIndex = i;
            }
        }

        // Если текущее значение меньше существующего, но очень близко к нему - используем это значение
        if (brValue < sortedBRs[currentIndex] && closestDistance < 0.05) {
            return sortedBRs[currentIndex];
        }

        // Иначе берем следующее значение (если оно существует)
        if (currentIndex < sortedBRs.length - 1) {
            return sortedBRs[currentIndex + 1];
        }

        // Если мы уже на максимальном значении, возвращаем его
        return sortedBRs[currentIndex];
    };

    // Функция для получения предыдущего доступного значения BR
    const getPrevBR = () => {
        if (!brValues || brValues.length === 0) {
            return Math.max(0, brValue - 0.3);
        }

        // Сортируем BR значения по возрастанию
        const sortedBRs = [...brValues].sort((a, b) => a - b);

        // Находим индекс текущего (или ближайшего) значения
        let currentIndex = 0;
        let closestDistance = Infinity;

        for (let i = 0; i < sortedBRs.length; i++) {
            const distance = Math.abs(sortedBRs[i] - brValue);
            if (distance < closestDistance) {
                closestDistance = distance;
                currentIndex = i;
            }
        }

        // Если текущее значение больше существующего, но очень близко к нему - используем это значение
        if (brValue > sortedBRs[currentIndex] && closestDistance < 0.05) {
            return sortedBRs[currentIndex];
        }

        // Иначе берем предыдущее значение (если оно существует)
        if (currentIndex > 0) {
            return sortedBRs[currentIndex - 1];
        }

        // Если мы уже на минимальном значении, возвращаем его
        return sortedBRs[currentIndex];
    };

    return (
        <div className={`filter-sidebar ${tabletClass}`}>
            <div className="filter-header">
                <h2><FilterOutlined/> Filters</h2>
                <Button
                    type="primary"
                    danger
                    icon={<ClearOutlined/>}
                    onClick={onClearFilters}
                    size={isTablet ? "large" : "middle"}
                >
                    Clear All
                </Button>
            </div>

            <div className="search-filter">
                <label>Search by Name</label>
                <Input
                    placeholder="Search vehicles..."
                    value={nameFilter}
                    onChange={handleNameChange}
                    prefix={<SearchOutlined/>}
                    allowClear
                    size={isTablet ? "large" : "middle"}
                />
            </div>

            <div className="br-filter">
                <label>Battle Rating (±1.0 span):
                    <strong className="br-value">{formatBR(brValue)}</strong>
                    {brFilterActive ?
                        <span className="br-filter-status active">Active</span> :
                        <span className="br-filter-status">Inactive</span>
                    }
                </label>
                <p className="br-range-info no-select">
                    {brFilterActive ?
                        `Showing vehicles from ${formatBR(minBR)} to ${formatBR(maxBR)}` :
                        'Filter inactive - showing all BR values'
                    }
                </p>
                <div className="slider-wrapper touch-friendly">
                    <Slider
                        min={0}
                        max={12}
                        step={0.1}
                        value={brValue}
                        onChange={handleBRChange}
                        onAfterChange={(value) => {
                            // Снэпим к ближайшему реальному BR после завершения перетаскивания
                            const closestBR = findClosestBR(value);
                            onFilterChange('brValue', closestBR);
                            // Активируем фильтр при изменении значения
                            if (!brFilterActive) {
                                onFilterChange('brFilterActive', true);
                            }
                        }}
                        tooltip={{
                            formatter: (value) => `${value.toFixed(1)}`
                        }}
                        marks={marks}
                        className={`br-slider ${isTablet || window.innerWidth <= 768 ? 'enlarged-slider' : ''}`}
                    />

                    {/* Add tap buttons for incremental changes */}
                    <div className="br-touch-buttons">
                        <Button
                            onClick={() => {
                                const prevBR = getPrevBR();
                                handleBRChange(prevBR);
                                // Активируем фильтр при изменении значения
                                if (!brFilterActive) {
                                    onFilterChange('brFilterActive', true);
                                }
                            }}
                            size="large"
                            icon={<MinusOutlined />}
                        />
                        <span className="br-current-value">{formatBR(brValue)}</span>
                        <Button
                            onClick={() => {
                                const nextBR = getNextBR();
                                handleBRChange(nextBR);
                                // Активируем фильтр при изменении значения
                                if (!brFilterActive) {
                                    onFilterChange('brFilterActive', true);
                                }
                            }}
                            size="large"
                            icon={<PlusOutlined />}
                        />
                    </div>
                </div>
            </div>

            <Collapse defaultActiveKey={['countries', 'types', 'sort']}>
                {/* Секция стран с SVG-флагами вместо чекбоксов */}
                <Panel header="Nations" key="countries">
                    <div className="filter-flags-grid">
                        {countries.map(country => (
                            <div
                                key={country}
                                className={`filter-flag-item ${countryFilter.includes(country) ? 'active' : ''}`}
                                onClick={() => handleCountryChange(country)}
                            >
                                <div
                                    className="country-flag-filter"
                                    dangerouslySetInnerHTML={{ __html: getCountryFlag(country) }}
                                    title={country.toUpperCase()}
                                />
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Секция типов техники только с иконками */}
                <Panel header="Vehicle Types" key="types">
                    <div className="filter-types-grid">
                        {types.map(type => (
                            <div
                                key={type}
                                className={`filter-type-item ${typeFilter.includes(type) ? 'active' : ''}`}
                                onClick={() => handleTypeChange(type)}
                            >
                                <div
                                    className="vehicle-type-filter"
                                    dangerouslySetInnerHTML={{ __html: getTypeIcon(type) }}
                                    title={getTypeName(type)}
                                />
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel
                    header={
                        <span>
                            <SortAscendingOutlined/> Sorting
                            {sort.customSort && (
                                <Tooltip title="Using default sort: BR (descending), then by vehicle type (Heavy → Medium → TD → Light → AA)">
                                    <span className="custom-sort-indicator">
                                        <InfoCircleOutlined /> Custom
                                    </span>
                                </Tooltip>
                            )}
                        </span>
                    }
                    key="sort"
                >
                    <div className="sort-section">
                        <div className="sort-by">
                            <label>Sort By:</label>
                            <Radio.Group
                                value={sort.customSort ? 'custom' : sort.field}
                                onChange={(e) => {
                                    if (e.target.value === 'custom') {
                                        // Включаем кастомную сортировку
                                        onSortChange('customSort', true);
                                    } else {
                                        // Используем обычную сортировку
                                        onSortChange('field', e.target.value);
                                    }
                                }}
                                size={isTablet ? "large" : "default"}
                            >
                                <Radio.Button value="custom">Default</Radio.Button>
                                <Radio.Button value="name">Name</Radio.Button>
                                <Radio.Button value="br">BR</Radio.Button>
                            </Radio.Group>
                        </div>

                        {!sort.customSort && (
                            <div className="sort-order">
                                <label>Direction:</label>
                                <Radio.Group
                                    value={sort.order}
                                    onChange={(e) => onSortChange('order', e.target.value)}
                                    size={isTablet ? "large" : "default"}
                                >
                                    <Radio.Button value="asc">Ascending</Radio.Button>
                                    <Radio.Button value="desc">Descending</Radio.Button>
                                </Radio.Group>
                            </div>
                        )}
                    </div>
                </Panel>
            </Collapse>
        </div>
    );
};

export default FilterSidebar;