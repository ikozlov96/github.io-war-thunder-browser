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

// Check if vehicle matches all active filters
export const filterVehicle = (vehicle, filters) => {
    const { nameFilter, countryFilter, rankFilter, typeFilter, brRange } = filters;

    // Filter by name
    if (nameFilter && !vehicle.name.toLowerCase().includes(nameFilter.toLowerCase())) {
        return false;
    }

    // Filter by selected countries
    if (countryFilter.length > 0 && !countryFilter.includes(vehicle.country)) {
        return false;
    }

    // Filter by selected ranks
    if (rankFilter.length > 0 && !rankFilter.includes(vehicle.rank)) {
        return false;
    }

    // Filter by selected types
    if (typeFilter.length > 0 && !typeFilter.includes(vehicle.type)) {
        return false;
    }

    // Filter by BR range
    const vehicleBR = parseFloat(vehicle.br);
    if (vehicleBR < brRange[0] || vehicleBR > brRange[1]) {
        return false;
    }

    return true;
};