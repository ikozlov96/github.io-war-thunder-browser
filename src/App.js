import React, {useEffect, useMemo, useState} from 'react';
import {Badge, Button, ConfigProvider, Layout, message, theme, Tooltip} from 'antd';
import {FilterOutlined, GithubOutlined, LoginOutlined, SettingOutlined} from '@ant-design/icons';
import {orderBy} from 'lodash';
import FilterSidebar from './components/FilterSidebar';
import VehiclesList from './components/VehiclesList';
import MobileFilterDrawer from './components/MobileFilterDrawer';
import ScrollToTop from './components/ScrollToTop';
import VehicleDetailModal from './components/VehicleDetailModal';
import AdminPanel from './components/AdminPanel';
import {filterVehicle, getTypePriority} from './utils';
import './App.css';
import api from './api';

const {Header, Sider, Content, Footer} = Layout;

// Define Material Dark theme colors for Ant Design
const materialDarkTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
        colorPrimary: '#bb86fc',
        colorPrimaryHover: '#9d4edd',
        colorPrimaryActive: '#e0b1ff',
        colorSuccess: '#03dac6',
        colorWarning: '#ffd740',
        colorError: '#cf6679',
        colorInfo: '#03dac6',
        colorTextBase: 'rgba(255, 255, 255, 0.87)',
        colorBgBase: '#121212',
        fontSize: 14,
        borderRadius: 8,
        wireframe: false,
    },
    components: {
        Card: {
            colorBgContainer: '#242424',
            colorBorderSecondary: '#333333',
        },
        Layout: {
            colorBgHeader: '#1e1e1e',
            colorBgBody: '#121212',
            colorBgFooter: '#1e1e1e',
        },
        Menu: {
            colorItemBg: '#1e1e1e',
            colorItemText: 'rgba(255, 255, 255, 0.87)',
            colorItemTextHover: '#bb86fc',
            colorItemTextSelected: '#bb86fc',
            colorActiveBarBorderSize: 0,
            colorItemBgSelected: '#242424',
            colorItemBgHover: '#242424',
        },
        Button: {
            colorPrimaryHover: '#9d4edd',
        },
        Slider: {
            colorPrimary: '#bb86fc',
            trackBg: '#494949',
            railBg: '#333333',
        },
        Checkbox: {
            colorPrimary: '#bb86fc',
        },
        Radio: {
            colorPrimary: '#bb86fc',
        },
        Input: {
            colorBgContainer: '#2d2d2d',
            colorBorder: '#333333',
        },
        Select: {
            colorBgContainer: '#2d2d2d',
            colorBorder: '#333333',
            colorPrimaryHover: '#bb86fc',
            colorPrimary: '#bb86fc',
        },
        Table: {
            colorBgContainer: '#1e1e1e',
            colorBorderSecondary: '#333333',
        },
        Modal: {
            colorBgElevated: '#1e1e1e',
        },
        Drawer: {
            colorBgElevated: '#1e1e1e',
        },
        Pagination: {
            colorPrimary: '#bb86fc',
            colorBgContainer: '#2d2d2d',
        },
        Tag: {
            colorBorder: 'transparent',
        },
    },
};

// Константа для хранения данных в localStorage
const STORAGE_KEY = 'warThunderBrowserFilters';

function App() {
    // State for the vehicles data
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for available BR values and filter options
    const [availableFilters, setAvailableFilters] = useState({
        countries: [],
        types: [],
        brValues: [], // доступные значения BR из JSON
    });

    // Default filter values
    const defaultFilters = {
        nameFilter: '',
        countryFilter: [],
        typeFilter: [],
        brValue: 6.0,      // выбранное значение BR
        brFilterActive: false,  // флаг активации фильтра BR
    };

    // State for active filters с загрузкой из localStorage
    const [filters, setFilters] = useState(() => {
        const savedFilters = localStorage.getItem(STORAGE_KEY);
        return savedFilters ? JSON.parse(savedFilters) : defaultFilters;
    });

    // Временные фильтры для мобильной версии
    const [tempFilters, setTempFilters] = useState({...filters});

    // State for sorting (default: BR desc, then by type priority)
    const [sort, setSort] = useState(() => {
        const savedSort = localStorage.getItem(STORAGE_KEY + '_sort');
        return savedSort ? JSON.parse(savedSort) : {
            field: 'br',
            order: 'desc',
            customSort: true, // Флаг для кастомной сортировки
        };
    });

    // State for pagination
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 24,
        total: 0,
    });

    // State for mobile drawer (for filters on mobile)
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

    // State for vehicle detail modal
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // State for admin panel
    const [adminMode, setAdminMode] = useState(false);

    // Сохраняем фильтры в localStorage при их изменении
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }, [filters]);

    // Сохраняем сортировку в localStorage при её изменении
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY + '_sort', JSON.stringify(sort));
    }, [sort]);

    // Количество активных фильтров для мобильного интерфейса
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.nameFilter) count++;
        if (filters.countryFilter.length > 0) count++;
        if (filters.typeFilter.length > 0) count++;
        if (filters.brFilterActive) count++;
        return count;
    }, [filters]);

    // Load the JSON data on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Используем API для загрузки данных
                const data = await api.getVehicles();

                setVehicles(data);

                // Extract unique values for filters
                const brValues = [...new Set(data.map(v => parseFloat(v.br)))].sort((a, b) => a - b);

                setAvailableFilters({
                    countries: [...new Set(data.map(v => v.country))].sort(),
                    types: [...new Set(data.map(v => v.type))].sort(),
                    brValues: brValues,
                });

                setLoading(false);
            } catch (err) {
                console.error('Error loading data:', err);
                setError(err.message);
                setLoading(false);
                message.error('Failed to load vehicle data. Please check console for details.');
            }
        };

        loadData();
    }, []);

    // Apply filters and sorting to get filtered vehicles
    const filteredVehicles = useMemo(() => {
        if (!vehicles.length) return [];

        // Создаем объект с фильтрами, преобразуя одиночное значение BR в диапазон ±1
        const filterWithBrRange = {
            ...filters,
            brRange: filters.brFilterActive
                ? [
                    Math.max(0, filters.brValue - 1.0),  // Минимальное значение (но не меньше 0)
                    Math.min(12.0, filters.brValue + 1.0) // Максимальное значение (но не больше 12.0)
                ]
                : [0, 12] // Если фильтр не активен, показываем все значения
        };

        // First apply all filters
        const filtered = vehicles.filter(vehicle => filterVehicle(vehicle, filterWithBrRange));

        // Применяем сортировку в зависимости от настроек
        let sorted;

        if (sort.customSort) {
            // Первичная сортировка по BR (desc), затем по типу техники
            sorted = [...filtered].sort((a, b) => {
                // Сначала по BR (по убыванию)
                const brA = parseFloat(a.br);
                const brB = parseFloat(b.br);

                if (brA !== brB) {
                    return brB - brA; // По убыванию (desc)
                }

                // Если BR одинаковый, сортируем по типу техники в нужном порядке
                return getTypePriority(a.type) - getTypePriority(b.type);
            });
        } else {
            // Стандартная сортировка по выбранному полю
            sorted = orderBy(
                filtered,
                [(vehicle) => {
                    // Special handling for BR which is stored as string
                    if (sort.field === 'br') {
                        return parseFloat(vehicle.br);
                    }
                    // Special handling for name to make sort case-insensitive
                    if (sort.field === 'name') {
                        return vehicle.name ? vehicle.name.toLowerCase() : '';
                    }
                    return vehicle[sort.field];
                }],
                [sort.order]
            );
        }

        // Update pagination total count
        setPagination(prev => ({
            ...prev,
            total: sorted.length,
            // Reset to page 1 when filters change
            current: 1,
        }));

        return sorted;
    }, [vehicles, filters, sort]);

    // Function to handle filter changes
    const handleFilterChange = (filterName, value) => {
        // Специальная обработка для BR фильтра
        if (filterName === 'brValue') {
            const updateData = {
                brValue: value,
                brFilterActive: true // Активируем фильтр при изменении значения
            };

            // На мобильных изменяем временные фильтры
            if (mobileDrawerVisible) {
                setTempFilters(prev => ({
                    ...prev,
                    ...updateData
                }));
            } else {
                // На десктопе меняем основные фильтры
                setFilters(prev => ({
                    ...prev,
                    ...updateData
                }));
            }
            return;
        }

        // Обработка остальных фильтров
        // На мобильных изменяем временные фильтры
        if (mobileDrawerVisible) {
            setTempFilters(prev => ({
                ...prev,
                [filterName]: value,
            }));
        } else {
            // На десктопе меняем основные фильтры
            setFilters(prev => ({
                ...prev,
                [filterName]: value,
            }));
        }
    };

    // Function to handle sort changes
    const handleSortChange = (property, value) => {
        // Если пользователь выбирает поле или порядок сортировки,
        // отключаем кастомную сортировку
        setSort(prev => ({
            ...prev,
            [property]: value,
            customSort: property === 'customSort' ? value : false, // Отключаем кастомную сортировку при явном выборе
        }));
    };

    // Function to clear all filters
    const handleClearFilters = () => {
        const emptyFilters = {
            nameFilter: '',
            countryFilter: [],
            typeFilter: [],
            brValue: 6.0,
            brFilterActive: false, // Деактивируем фильтр BR при сбросе
        };

        // Очищаем основные или временные фильтры в зависимости от контекста
        if (mobileDrawerVisible) {
            setTempFilters(emptyFilters);
        } else {
            setFilters(emptyFilters);
        }

        // Возвращаем сортировку к значению по умолчанию
        setSort({
            field: 'br',
            order: 'desc',
            customSort: true,
        });

        message.success('All filters cleared');
    };

    // Function to handle pagination changes
    const handlePageChange = (page, pageSize) => {
        setPagination(prev => ({
            ...prev,
            current: page,
            pageSize: pageSize,
        }));

        // Scroll to top when changing pages
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    // Открытие мобильного фильтра
    const showMobileFilter = () => {
        // Копируем текущие фильтры во временные
        setTempFilters({...filters});
        setMobileDrawerVisible(true);
    };

    // Закрытие мобильного фильтра без применения изменений
    const closeMobileFilter = () => {
        setMobileDrawerVisible(false);
    };

    // Применение временных фильтров
    const applyMobileFilters = () => {
        setFilters({...tempFilters});
        setMobileDrawerVisible(false);
        message.success('Фильтры применены');
    };

    // Открытие модального окна с деталями техники
    const handleVehicleDetails = (vehicle) => {
        setSelectedVehicle(vehicle);
        setDetailModalVisible(true);
    };

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        setDetailModalVisible(true);
    };

    // Закрытие модального окна с деталями
    const handleDetailModalClose = () => {
        setDetailModalVisible(false);
        setSelectedVehicle(null);
    };

    // Обработка изменений данных в админке
    const handleSaveVehicleData = async (updatedVehicles) => {
        try {
            // Сохраняем данные через API только в режиме разработки
            if (process.env.NODE_ENV !== 'production') {
                await api.saveAllData(updatedVehicles);
            }
            setVehicles(updatedVehicles);
            message.success('Vehicle data saved successfully');
        } catch (error) {
            console.error('Error saving data:', error);
            message.error('Failed to save data');
        }
    };

    // Переключение между обычным режимом и админкой
    const toggleAdminMode = () => {
        setAdminMode(!adminMode);
    };

    // Определяем, является ли устройство планшетом
    const isTablet = useMemo(() => {
        // Базовая проверка размера экрана для планшетов
        return window.innerWidth >= 768 && window.innerWidth <= 1024;
    }, []);

    // Если открыт режим администратора, показываем admin panel
    if (adminMode) {
        return (
            <ConfigProvider theme={materialDarkTheme}>
                <AdminPanel
                    vehicles={vehicles}
                    onSave={handleSaveVehicleData}
                    onClose={toggleAdminMode}
                />
            </ConfigProvider>
        );
    }

    return (
        <ConfigProvider theme={materialDarkTheme}>
            <Layout className="app-layout">
                <Header className="app-header">
                    <div className="logo">
                        <h1>War Thunder Vehicles</h1>
                    </div>

                    <div className="header-actions">
                        <Tooltip title="Admin Mode">
                            <Button
                                type="text"
                                icon={adminMode ? <LoginOutlined/> : <SettingOutlined/>}
                                onClick={toggleAdminMode}
                                className="admin-button"
                            />
                        </Tooltip>

                        <Button
                            type="text"
                            icon={<GithubOutlined/>}
                            href="https://github.com/yourusername/war-thunder-browser"
                            target="_blank"
                            className="github-button"
                        />

                        {/* Мобильная кнопка фильтра с бейджем */}
                        <Badge count={activeFiltersCount} overflowCount={9} offset={[-2, 2]}>
                            <Button
                                className="mobile-filter-button"
                                type="primary"
                                icon={<FilterOutlined/>}
                                onClick={showMobileFilter}
                                size="large"
                            >
                                Фильтры
                            </Button>
                        </Badge>
                    </div>
                </Header>

                <Layout className="main-layout">
                    {/* Desktop Sidebar */}
                    <Sider
                        className={`filter-sider ${isTablet ? 'tablet-filter' : 'desktop-only'}`}
                        width={isTablet ? 300 : 300}
                        theme="dark"
                    >
                        <FilterSidebar
                            filters={filters}
                            availableFilters={availableFilters}
                            onFilterChange={handleFilterChange}
                            onSortChange={handleSortChange}
                            onClearFilters={handleClearFilters}
                            sort={sort}
                            isMobile={false}
                            isTablet={isTablet}
                        />
                    </Sider>

                    {/* Mobile Filter Drawer */}
                    <MobileFilterDrawer
                        visible={mobileDrawerVisible}
                        onClose={closeMobileFilter}
                        filters={tempFilters}
                        availableFilters={availableFilters}
                        onFilterChange={handleFilterChange}
                        onSortChange={handleSortChange}
                        onClearFilters={handleClearFilters}
                        sort={sort}
                        onApply={applyMobileFilters}
                    />

                    <Content className="main-content">
                        <VehiclesList
                            vehicles={filteredVehicles}
                            loading={loading}
                            error={error}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onVehicleSelect={handleVehicleSelect}
                            onVehicleDetails={handleVehicleDetails} // Убедитесь, что этот проп передается
                        />
                    </Content>
                </Layout>

                <Footer className="app-footer">
                    <p>War Thunder Vehicle Browser - Material Dark Theme</p>
                    <p className="copyright">Data from War Thunder game. This is an unofficial fan project.</p>
                </Footer>

                {/* Кнопка прокрутки наверх */}
                <ScrollToTop/>

                {/* Модальное окно с деталями техники */}
                <VehicleDetailModal
                    visible={detailModalVisible}
                    vehicle={selectedVehicle}
                    onClose={handleDetailModalClose}
                />
            </Layout>
        </ConfigProvider>
    );
}
export default App;