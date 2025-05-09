import React from 'react';
import {Button, Checkbox, Collapse, Input, Radio, Slider} from 'antd';
import {ClearOutlined, FilterOutlined, SearchOutlined, SortAscendingOutlined} from '@ant-design/icons';
import {getCountryColor, getCountryName, getTypeName, formatBR} from '../utils';
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
    const {nameFilter, countryFilter, rankFilter, typeFilter, brValue, brFilterActive} = filters;
    const {countries, ranks, types, brValues} = availableFilters;

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

    // Handle rank selection
    const handleRankChange = (rank) => {
        const updatedFilter = rankFilter.includes(rank)
            ? rankFilter.filter(r => r !== rank)
            : [...rankFilter, rank];

        onFilterChange('rankFilter', updatedFilter);
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
                <p className="br-range-info">
                    {brFilterActive ?
                        `Showing vehicles from ${formatBR(minBR)} to ${formatBR(maxBR)}` :
                        'Filter inactive - showing all BR values'
                    }
                </p>
                <div className="slider-wrapper">
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
                        }}
                        tooltip={{
                            formatter: (value) => `${value.toFixed(1)}`
                        }}
                        marks={marks}
                        className={`br-slider ${isTablet || window.innerWidth <= 768 ? 'enlarged-slider' : ''}`}
                    />
                </div>
                <div className="slider-labels">
                    <span>0.0</span>
                    <span>12.0</span>
                </div>
            </div>

            <Collapse defaultActiveKey={['countries', 'ranks', 'types', 'sort']}>
                <Panel header="Nations" key="countries">
                    <div className="filter-options">
                        {countries.map(country => (
                            <div key={country} className={`filter-option ${isTablet ? 'tablet-option' : ''}`}>
                                <Checkbox
                                    checked={countryFilter.includes(country)}
                                    onChange={() => handleCountryChange(country)}
                                    size={isTablet ? "large" : "default"}
                                />
                                <span
                                    className="option-label"
                                    style={{color: getCountryColor(country)}}
                                >
                                    {getCountryName(country)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel header="Ranks" key="ranks">
                    <div className={`filter-options ranks-grid ${isTablet ? 'tablet-ranks-grid' : ''}`}>
                        {ranks.map(rank => (
                            <div key={rank} className={`filter-option ${isTablet ? 'tablet-option' : ''}`}>
                                <Checkbox
                                    checked={rankFilter.includes(rank)}
                                    onChange={() => handleRankChange(rank)}
                                    size={isTablet ? "large" : "default"}
                                />
                                <span className="option-label">{rank}</span>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel header="Vehicle Types" key="types">
                    <div className="filter-options">
                        {types.map(type => (
                            <div key={type} className={`filter-option ${isTablet ? 'tablet-option' : ''}`}>
                                <Checkbox
                                    checked={typeFilter.includes(type)}
                                    onChange={() => handleTypeChange(type)}
                                    size={isTablet ? "large" : "default"}
                                />
                                <span className="option-label">{getTypeName(type)}</span>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel header={<span><SortAscendingOutlined/> Sorting</span>} key="sort">
                    <div className="sort-section">
                        <div className="sort-by">
                            <label>Sort By:</label>
                            <Radio.Group
                                value={sort.field}
                                onChange={(e) => onSortChange('field', e.target.value)}
                                size={isTablet ? "large" : "default"}
                            >
                                <Radio.Button value="name">Name</Radio.Button>
                                <Radio.Button value="br">BR</Radio.Button>
                                <Radio.Button value="rank">Rank</Radio.Button>
                            </Radio.Group>
                        </div>

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
                    </div>
                </Panel>
            </Collapse>
        </div>
    );
};

export default FilterSidebar;