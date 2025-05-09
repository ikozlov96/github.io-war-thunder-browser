// Utility functions for the War Thunder Browser app

// Function to get image path based on country and vehicle type
export const getImagePath = (country, type) => {
    // Replace with actual image path logic when you have images
    // For now using placeholder images with unique colors by country
    const countryCode = country.toLowerCase();
    const typeCode = type.toLowerCase().replace('_', '-');

    // In production, you would use actual images:
    // return `${process.env.PUBLIC_URL}/images/${countryCode}/${typeCode}.png`;

    // For now, use placeholders
    return `https://via.placeholder.com/80?text=${countryCode}-${typeCode}`;
};

// Get a readable country name with flag emoji
export const getCountryName = (code) => {
    const countries = {
        usa: "🇺🇸 USA",
        germany: "🇩🇪 Germany",
        ussr: "🇷🇺 USSR",
        britain: "🇬🇧 Great Britain",
        japan: "🇯🇵 Japan",
        china: "🇨🇳 China",
        italy: "🇮🇹 Italy",
        france: "🇫🇷 France",
        sweden: "🇸🇪 Sweden",
        israel: "🇮🇱 Israel"
    };
    return countries[code] || code;
};

// Get a readable vehicle type name
export const getTypeName = (code) => {
    const types = {
        light_tank: "Light Tank",
        medium_tank: "Medium Tank",
        heavy_tank: "Heavy Tank",
        tank_destroyer: "Tank Destroyer",
        spaa: "Anti-Air"
    };
    return types[code] || code;
};

// Get color based on country for UI accents
export const getCountryColor = (country) => {
    const colors = {
        usa: '#3b82f6',      // blue
        germany: '#84cc16',  // green
        ussr: '#ef4444',     // red
        britain: '#14b8a6',  // teal
        japan: '#d946ef',    // fuchsia
        china: '#f97316',    // orange
        italy: '#22c55e',    // green
        france: '#06b6d4',   // cyan
        sweden: '#facc15',   // yellow
        israel: '#a855f7'    // purple
    };
    return colors[country] || '#6b7280'; // Default gray
};

// Format BR to always show with one decimal place
export const formatBR = (br) => {
    const numBR = parseFloat(br);
    return numBR.toFixed(1);
};

// Получить приоритет типа техники для сортировки
// 1 - Тяжелые танки (наивысший приоритет)
// 2 - Средние танки
// 3 - ПТ (противотанковые)
// 4 - Легкие танки
// 5 - Зенитки (низший приоритет)
export const getTypePriority = (type) => {
    const priorities = {
        heavy_tank: 1,       // Тяжелые танки (наивысший приоритет)
        medium_tank: 2,      // Средние танки
        tank_destroyer: 3,   // ПТ (противотанковые)
        light_tank: 4,       // Легкие танки
        spaa: 5              // Зенитки (низший приоритет)
    };

    return priorities[type] || 99; // Если тип неизвестен, ставим его в конец
};

// Получить SVG иконку для типа техники
export const getTypeIcon = (type) => {
    const icons = {
        light_tank: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 0 1862 2048"><path fill="currentColor" d="M185 650h1482v477h-1482v-477z"/></svg>',
        medium_tank: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 0 1862 2048"><path fill="currentColor" d="M594 1319h-409v-618h1482v618h-411v-246h-662v246z"/></svg>',
        heavy_tank: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 0 1862 2048"><path fill="currentColor" d="M591 1466h-406v-617h406v-245l137 -126h392l137 126v245h410v617h-410v-249h-666v249z"/></svg>',
        tank_destroyer: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 0 1794 2048"><path fill="currentColor" d="M1599 1467h-1414v-368l946 -854h398l-929 854h999v368z"/></svg>',
        spaa: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 0 1862 2048"><path fill="currentColor" d="M1667 1467h-1482v-326h303v-811h221v811h437v-811h216v811h305v326z"/></svg>'
    };

    return icons[type] || '';
};

// Check if vehicle matches all active filters
export const filterVehicle = (vehicle, filters) => {
    const { nameFilter, countryFilter, typeFilter, brRange } = filters;

    // Проверяем, определено ли имя техники
    if (!vehicle.name) {
        return false;
    }

    // Filter by name
    if (nameFilter && !vehicle.name.toLowerCase().includes(nameFilter.toLowerCase())) {
        return false;
    }

    // Filter by selected countries
    if (countryFilter.length > 0 && !countryFilter.includes(vehicle.country)) {
        return false;
    }

    // Filter by selected types
    if (typeFilter.length > 0 && !typeFilter.includes(vehicle.type)) {
        return false;
    }

    // Filter by BR range только если задан диапазон
    if (brRange && brRange.length === 2) {
        const vehicleBR = parseFloat(vehicle.br);
        if (vehicleBR < brRange[0] || vehicleBR > brRange[1]) {
            return false;
        }
    }

    return true;
};

// Находит ближайшее значение BR из доступных в данных
export const findClosestBRValue = (value, availableBRs) => {
    if (!availableBRs || availableBRs.length === 0) return value;

    // Находим ближайшее значение BR из доступных
    return availableBRs.reduce((prev, curr) => {
        return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
    });
};