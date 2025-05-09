import React from 'react';
import {Button, Checkbox, Collapse, Input, Radio, Slider} from 'antd';
import {ClearOutlined, FilterOutlined, SearchOutlined, SortAscendingOutlined} from '@ant-design/icons';
import {getCountryColor, getCountryName, getTypeName} from '../utils';
import './FilterSidebar.css';

const {Panel} = Collapse;

const FilterSidebar = ({
                           filters,
                           availableFilters,
                           onFilterChange,
                           onSortChange,
                           onClearFilters,
                           sort
                       }) => {
    const {nameFilter, countryFilter, rankFilter, typeFilter, brRange} = filters;
    const {countries, ranks, types} = availableFilters;

    // Handle name filter change
    const handleNameChange = (e) => {
        onFilterChange('nameFilter', e.target.value);
    };

    // Handle BR slider change
    const handleBRChange = (value) => {
        onFilterChange('brRange', value);
    };

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

    return (
        <div className="filter-sidebar">
            <div className="filter-header">
                <h2><FilterOutlined/> Filters</h2>
                <Button
                    type="primary"
                    danger
                    icon={<ClearOutlined/>}
                    onClick={onClearFilters}
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
                />
            </div>

            <div className="br-filter">
                <label>Battle Rating (BR {brRange[0].toFixed(1)} - {brRange[1].toFixed(1)})</label>
                <Slider
                    range
                    min={0}
                    max={12}
                    step={0.1}
                    value={brRange}
                    onChange={handleBRChange}
                    tooltip={{
                        formatter: (value) => `${value.toFixed(1)}`
                    }}
                />
                <div className="slider-labels">
                    <span>0.0</span>
                    <span>12.0</span>
                </div>
            </div>

            <Collapse defaultActiveKey={['countries', 'ranks', 'types', 'sort']}>
                <Panel header="Nations" key="countries">
                    <div className="filter-options">
                        {countries.map(country => (
                            <div key={country} className="filter-option">
                                <Checkbox
                                    checked={countryFilter.includes(country)}
                                    onChange={() => handleCountryChange(country)}
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
                    <div className="filter-options ranks-grid">
                        {ranks.map(rank => (
                            <div key={rank} className="filter-option">
                                <Checkbox
                                    checked={rankFilter.includes(rank)}
                                    onChange={() => handleRankChange(rank)}
                                />
                                <span className="option-label">{rank}</span>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel header="Vehicle Types" key="types">
                    <div className="filter-options">
                        {types.map(type => (
                            <div key={type} className="filter-option">
                                <Checkbox
                                    checked={typeFilter.includes(type)}
                                    onChange={() => handleTypeChange(type)}
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
                            <Radio.Group value={sort.field} onChange={(e) => onSortChange('field', e.target.value)}>
                                <Radio.Button value="name">Name</Radio.Button>
                                <Radio.Button value="br">BR</Radio.Button>
                                <Radio.Button value="rank">Rank</Radio.Button>
                            </Radio.Group>
                        </div>

                        <div className="sort-order">
                            <label>Direction:</label>
                            <Radio.Group value={sort.order} onChange={(e) => onSortChange('order', e.target.value)}>
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