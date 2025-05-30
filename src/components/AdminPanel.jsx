import React, {useState} from 'react';
import {
    Badge,
    Button,
    Divider,
    Drawer,
    Empty,
    Form,
    Input,
    InputNumber,
    Layout,
    Menu,
    message,
    Modal,
    Select,
    Space,
    Table,
    Tabs,
    Upload,
    Alert,
    Checkbox,
} from 'antd';
import {
    DashboardOutlined,
    EditOutlined,
    InboxOutlined,
    LogoutOutlined,
    PictureOutlined,
    PlusOutlined,
    SearchOutlined,
    SettingOutlined,
    DownloadOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import {formatBR, getCountryName, getTypeName} from '../utils';
import './AdminPanel.css';
import api from '../api'; // Импортируем API клиент
import ImageUploader from './ImageUploader';
import BatchImageUploader from './BatchImageUploader'; // Новый компонент

const {Header, Sider, Content} = Layout;
const {Option} = Select;
const {TabPane} = Tabs;
const {Dragger} = Upload;

const AdminPanel = ({vehicles, onSave, onClose}) => {
    const [activeTab, setActiveTab] = useState('vehicles');
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [imageUploadVisible, setImageUploadVisible] = useState(false);
    const [batchUploadVisible, setBatchUploadVisible] = useState(false); // Новое состояние
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();
    const [tempImages, setTempImages] = useState([]); // Состояние для временных изображений
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Состояние выбранных строк
    const [selectedVehicles, setSelectedVehicles] = useState([]); // Выбранные транспортные средства

    // Обработка поиска
    const handleSearch = value => {
        setSearchText(value);
    };

    // Фильтрация списка техники по поисковому запросу
    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // Настройка выбора строк
    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys, selectedRows) => {
            setSelectedRowKeys(selectedKeys);
            setSelectedVehicles(selectedRows);
        },
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
            {
                key: 'hasImages',
                text: 'Выбрать технику с изображениями',
                onSelect: () => {
                    const keys = vehicles
                        .filter(vehicle => vehicle.hasImages)
                        .map(vehicle => vehicle.name);
                    setSelectedRowKeys(keys);
                    setSelectedVehicles(vehicles.filter(vehicle => vehicle.hasImages));
                },
            },
            {
                key: 'noImages',
                text: 'Выбрать технику без изображений',
                onSelect: () => {
                    const keys = vehicles
                        .filter(vehicle => !vehicle.hasImages)
                        .map(vehicle => vehicle.name);
                    setSelectedRowKeys(keys);
                    setSelectedVehicles(vehicles.filter(vehicle => !vehicle.hasImages));
                },
            },
        ],
    };

    // Начать редактирование техники
    const handleEdit = vehicle => {
        setEditingVehicle(vehicle);
        form.setFieldsValue({
            name: vehicle.name,
            country: vehicle.country,
            type: vehicle.type,
            br: parseFloat(vehicle.br),
            rank: vehicle.rank
        });
    };

    // Отменить редактирование
    const handleCancelEdit = () => {
        setEditingVehicle(null);
        form.resetFields();
    };

    // Сохранить изменения
    const handleSave = async (values) => {
        try {
            console.log('Saving vehicle data:', values);

            // Вызываем API для обновления данных в dev режиме
            if (process.env.NODE_ENV !== 'production') {
                await api.updateVehicle(editingVehicle.name, {
                    ...values,
                    br: values.br.toString()
                });
            }

            // Обновить локальный список техники
            const updatedVehicles = vehicles.map(vehicle => {
                if (vehicle.name === editingVehicle.name) {
                    return {...vehicle, ...values, br: values.br.toString()};
                }
                return vehicle;
            });

            onSave(updatedVehicles);
            message.success('Vehicle data saved successfully');
            handleCancelEdit();
        } catch (error) {
            console.error('Error saving vehicle:', error);
            message.error('Failed to save vehicle data');
        }
    };

    // Обработка открытия модального окна для загрузки изображений
    const handleImageUpload = vehicle => {
        console.log("handleImageUpload вызван с vehicle:", vehicle);
        console.log("- country:", vehicle.country);
        setEditingVehicle(vehicle);
        setTempImages([]); // Очищаем временные изображения
        setImageUploadVisible(true);
    };

    // Функция экспорта JSON
    const handleExportJson = () => {
        // Create a blob with the JSON data
        const jsonString = JSON.stringify({vehicles: vehicles}, null, 2);
        const blob = new Blob([jsonString], {type: 'application/json'});

        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.json';

        // Trigger the download
        document.body.appendChild(a);
        a.click();

        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        message.success('JSON данные экспортированы. Замените этим файлом output.json в папке public вашего проекта.');
    };

    // Функция для обработки загрузки изображений
    const handleImageUploadRequest = async (options) => {
        const { file, onSuccess, onError, onProgress } = options;

        console.log("Начинаем загрузку файла:", file.name);
        console.log("Для техники:", editingVehicle?.name);
        console.log("Страна:", editingVehicle?.country);

        // Проверяем, что у нас есть необходимые данные
        if (!editingVehicle || !editingVehicle.country) {
            message.error("Не удалось определить страну техники");
            onError(new Error("Country not specified"));
            return;
        }

        try {
            // Эмулируем прогресс загрузки
            let percent = 0;
            const interval = setInterval(() => {
                percent += 20;
                onProgress({ percent: Math.min(percent, 99) });
                if (percent >= 99) {
                    clearInterval(interval);
                }
            }, 200);

            // Загружаем изображение через API
            const result = await api.uploadImage(
                editingVehicle.name,
                editingVehicle.country,
                file,
                file.name
            );

            clearInterval(interval);

            console.log("Результат загрузки:", result);

            if (result && result.success) {
                // Добавляем изображение во временное хранилище
                const newImage = result.image;

                setTempImages(prev => {
                    const newTempImages = [...prev, newImage];
                    console.log("tempImages обновлены:", newTempImages);
                    return newTempImages;
                });

                onSuccess(result);
                message.success(`${file.name} загружен. Нажмите "Save Images" для сохранения.`);
            } else {
                onError(new Error("Ошибка при загрузке изображения"));
                message.error(`${file.name} не удалось загрузить.`);
            }
        } catch (error) {
            console.error("Ошибка загрузки:", error);
            onError(error);
            message.error(`${file.name} не удалось загрузить: ${error.message}`);
        }
    };

    // Функция для сохранения изображений
    const handleSaveImages = () => {
        console.log("handleSaveImages вызван");
        console.log("tempImages:", tempImages);

        if (tempImages.length === 0) {
            message.warning("Нет новых изображений для сохранения");
            return;
        }

        // Обновляем список техники с новыми изображениями
        const updatedVehicles = vehicles.map(vehicle => {
            if (vehicle.name === editingVehicle.name) {
                const currentImages = vehicle.images || [];
                return {
                    ...vehicle,
                    images: [...currentImages, ...tempImages],
                    hasImages: true
                };
            }
            return vehicle;
        });

        // Сохраняем изменения через колбэк
        onSave(updatedVehicles);

        // Обновляем текущую редактируемую технику
        setEditingVehicle(prev => ({
            ...prev,
            images: [...(prev.images || []), ...tempImages],
            hasImages: true
        }));

        // Очищаем временные изображения
        setTempImages([]);

        message.success(`${tempImages.length} изображений сохранено`);
    };

    // Обработчик кнопки пакетной загрузки
    const handleBatchUploadOpen = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Выберите хотя бы одну единицу техники для загрузки изображений.');
            return;
        }
        setBatchUploadVisible(true);
    };

    // Функция сохранения изображений для нескольких транспортных средств
    const handleSaveBatchImages = (images) => {
        if (images.length === 0) {
            message.warning("Нет изображений для сохранения");
            return;
        }

        // Создаем уникальные копии изображений для каждого транспортного средства
        const updatedVehicles = vehicles.map(vehicle => {
            if (selectedRowKeys.includes(vehicle.name)) {
                const currentImages = vehicle.images || [];
                // Создаем уникальные копии изображений для каждого ТС
                const uniqueImages = images.map(image => ({
                    ...image,
                    id: Date.now() + Math.random(),  // Генерируем уникальный ID
                }));

                return {
                    ...vehicle,
                    images: [...currentImages, ...uniqueImages],
                    hasImages: true
                };
            }
            return vehicle;
        });

        // Сохраняем изменения через колбэк
        onSave(updatedVehicles);
        setBatchUploadVisible(false);
        message.success(`${images.length} изображений добавлено к ${selectedRowKeys.length} единицам техники`);
    };

    // Настройки загрузки файлов
    const uploadProps = {
        name: 'image',
        multiple: true,
        showUploadList: true,
        customRequest: handleImageUploadRequest,
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Можно загружать только изображения!');
                return Upload.LIST_IGNORE;
            }
            // Предотвращаем автоматическую отправку
            return false;
        },
        // Важно: предотвращаем перезагрузку страницы
        action: ''
    };

    // Функция для удаления временного изображения
    const removeTempImage = (index) => {
        setTempImages(prev => {
            const newArray = prev.filter((_, i) => i !== index);
            console.log("После удаления:", newArray);
            return newArray;
        });
    };

    // Функция для редактирования описания изображения
    const handleImageCaptionEdit = (vehicle, imageIndex, newCaption) => {
        const updatedVehicles = vehicles.map(v => {
            if (v.name === vehicle.name && v.images) {
                const updatedImages = [...v.images];
                updatedImages[imageIndex] = {
                    ...updatedImages[imageIndex],
                    caption: newCaption
                };
                return {
                    ...v,
                    images: updatedImages
                };
            }
            return v;
        });

        onSave(updatedVehicles);
        // Обновить текущую редактируемую технику если она открыта
        if (editingVehicle && editingVehicle.name === vehicle.name) {
            setEditingVehicle(updatedVehicles.find(v => v.name === vehicle.name));
        }

        message.success('Описание изображения обновлено');
    };

    // Функция для удаления изображения
    const handleImageDelete = (vehicle, imageIndex) => {
        // Получаем данные удаляемого изображения для лога
        const imageToDelete = vehicle.images[imageIndex];
        console.log("Удаление изображения:", imageToDelete);

        // Создаем обновленный массив всех машин
        const updatedVehicles = vehicles.map(v => {
            if (v.name === vehicle.name && v.images) {
                // Создаем новый массив изображений, исключая удаляемое
                const updatedImages = v.images.filter((_, i) => i !== imageIndex);
                return {
                    ...v,
                    images: updatedImages,
                    hasImages: updatedImages.length > 0
                };
            }
            return v;
        });

        // Сохраняем обновленные данные
        onSave(updatedVehicles);

        // Обновляем текущую редактируемую технику, если она открыта
        if (editingVehicle && editingVehicle.name === vehicle.name) {
            const updated = updatedVehicles.find(v => v.name === vehicle.name);
            setEditingVehicle(updated);
        }

        message.success('Изображение удалено');
    };

    // Функция для изменения порядка изображений
    const handleMoveImage = (vehicle, imageIndex, direction) => {
        if (!vehicle.images ||
            (direction === 'up' && imageIndex === 0) ||
            (direction === 'down' && imageIndex === vehicle.images.length - 1)) {
            return;
        }

        const updatedVehicles = vehicles.map(v => {
            if (v.name === vehicle.name && v.images) {
                const updatedImages = [...v.images];
                const newIndex = direction === 'up' ? imageIndex - 1 : imageIndex + 1;

                // Swap images
                [updatedImages[imageIndex], updatedImages[newIndex]] =
                    [updatedImages[newIndex], updatedImages[imageIndex]];

                return {
                    ...v,
                    images: updatedImages
                };
            }
            return v;
        });

        onSave(updatedVehicles);
        // Обновить текущую редактируемую технику если она открыта
        if (editingVehicle && editingVehicle.name === vehicle.name) {
            setEditingVehicle(updatedVehicles.find(v => v.name === vehicle.name));
        }

        message.success(`Изображение перемещено ${direction === 'up' ? 'вверх' : 'вниз'}`);
    };

    // Колонки для таблицы техники
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <div className="vehicle-name-cell">
                    <span>{text}</span>
                    {record.hasImages && <Badge status="success"/>}
                </div>
            )
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            render: country => getCountryName(country),
            filters: [
                ...new Set(vehicles.map(v => v.country))
            ].map(country => ({text: getCountryName(country), value: country})),
            onFilter: (value, record) => record.country === value,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: type => getTypeName(type),
            filters: [
                ...new Set(vehicles.map(v => v.type))
            ].map(type => ({text: getTypeName(type), value: type})),
            onFilter: (value, record) => record.type === value,
        },
        {
            title: 'BR',
            dataIndex: 'br',
            key: 'br',
            render: br => formatBR(br),
            sorter: (a, b) => parseFloat(a.br) - parseFloat(b.br),
        },
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            sorter: (a, b) => a.rank - b.rank,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined/>}
                        onClick={() => handleEdit(record)}
                        size="small"
                    />
                    <Button
                        icon={<PictureOutlined/>}
                        onClick={() => handleImageUpload(record)}
                        size="small"
                    />
                </Space>
            ),
        },
    ];

    return (
        <Layout className="admin-layout">
            <Header className="admin-header">
                <div className="admin-title">
                    <DashboardOutlined/> Admin Panel
                </div>
                <div className="admin-actions">
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExportJson}
                        style={{marginRight: 8}}
                    >
                        Export JSON
                    </Button>
                    <Button icon={<LogoutOutlined/>} onClick={onClose}>Exit</Button>
                </div>
            </Header>

            <Layout className="admin-content-layout">
                <Sider width={200} className="admin-sider">
                    <Menu
                        mode="inline"
                        selectedKeys={[activeTab]}
                        onClick={e => setActiveTab(e.key)}
                    >
                        <Menu.Item key="vehicles" icon={<DashboardOutlined/>}>
                            Vehicles
                        </Menu.Item>
                        <Menu.Item key="settings" icon={<SettingOutlined/>}>
                            Settings
                        </Menu.Item>
                    </Menu>
                </Sider>

                <Content className="admin-content">
                    {activeTab === 'vehicles' && (
                        <>
                            <div className="admin-toolbar">
                                <Input.Search
                                    placeholder="Search vehicles..."
                                    allowClear
                                    enterButton={<SearchOutlined/>}
                                    onSearch={handleSearch}
                                    style={{width: 300}}
                                />
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<PictureOutlined/>}
                                        onClick={handleBatchUploadOpen}
                                        disabled={selectedRowKeys.length === 0}
                                    >
                                        Upload Images to Selected
                                    </Button>
                                    <Button type="primary" icon={<PlusOutlined/>}>
                                        Add Vehicle
                                    </Button>
                                </Space>
                            </div>

                            <div className="selection-info">
                                {selectedRowKeys.length > 0 && (
                                    <Alert
                                        message={`Selected ${selectedRowKeys.length} vehicles`}
                                        type="info"
                                        showIcon
                                        action={
                                            <Button size="small" onClick={() => setSelectedRowKeys([])}>
                                                Clear
                                            </Button>
                                        }
                                        style={{ marginBottom: 16 }}
                                    />
                                )}
                            </div>

                            <Table
                                rowSelection={rowSelection}
                                columns={columns}
                                dataSource={filteredVehicles}
                                rowKey="name"
                                pagination={{pageSize: 10}}
                                className="admin-table"
                            />
                        </>
                    )}

                    {activeTab === 'settings' && (
                        <div className="admin-settings">
                            <h2>Settings</h2>
                            <p>Admin panel settings will be displayed here.</p>
                        </div>
                    )}
                </Content>
            </Layout>

            {/* Drawer for editing vehicle */}
            <Drawer
                title={editingVehicle ? `Edit ${editingVehicle.name}` : 'Add New Vehicle'}
                width={500}
                placement="right"
                onClose={handleCancelEdit}
                open={!!editingVehicle}
                extra={
                    <Space>
                        <Button onClick={handleCancelEdit}>Cancel</Button>
                        <Button type="primary" onClick={() => form.submit()}>Save</Button>
                    </Space>
                }
            >
                {editingVehicle && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSave}
                        initialValues={{
                            name: editingVehicle.name,
                            country: editingVehicle.country,
                            type: editingVehicle.type,
                            br: parseFloat(editingVehicle.br),
                            rank: editingVehicle.rank
                        }}
                    >
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[{required: true, message: 'Please enter vehicle name'}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            name="country"
                            label="Country"
                            rules={[{required: true, message: 'Please select a country'}]}
                        >
                            <Select>
                                <Option value="usa">USA</Option>
                                <Option value="germany">Germany</Option>
                                <Option value="ussr">USSR</Option>
                                <Option value="britain">Great Britain</Option>
                                <Option value="japan">Japan</Option>
                                <Option value="china">China</Option>
                                <Option value="italy">Italy</Option>
                                <Option value="france">France</Option>
                                <Option value="sweden">Sweden</Option>
                                <Option value="israel">Israel</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="type"
                            label="Vehicle Type"
                            rules={[{required: true, message: 'Please select a vehicle type'}]}
                        >
                            <Select>
                                <Option value="light_tank">Light Tank</Option>
                                <Option value="medium_tank">Medium Tank</Option>
                                <Option value="heavy_tank">Heavy Tank</Option>
                                <Option value="tank_destroyer">Tank Destroyer</Option>
                                <Option value="spaa">Anti-Air</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="br"
                            label="Battle Rating"
                            rules={[{required: true, message: 'Please enter BR'}]}
                        >
                            <InputNumber min={0} max={12} step={0.1} style={{width: '100%'}}/>
                        </Form.Item>

                        <Form.Item
                            name="rank"
                            label="Rank"
                            rules={[{required: true, message: 'Please enter rank'}]}
                        >
                            <InputNumber min={1} max={10} style={{width: '100%'}}/>
                        </Form.Item>

                        <Divider/>

                        <Form.Item
                            name="additionalInfo"
                            label="Additional Information"
                        >
                            <Input.TextArea rows={4}/>
                        </Form.Item>
                    </Form>
                )}
            </Drawer>

            {/* Modal for Single Vehicle Image Upload */}
            <Modal
                title={`Upload Images for ${editingVehicle?.name || ''}`}
                open={imageUploadVisible}
                onCancel={() => setImageUploadVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setImageUploadVisible(false)}>
                        Close
                    </Button>
                ]}
                width={800}
                maskClosable={false}
            >
                <Tabs defaultActiveKey="upload">
                    <TabPane tab="Upload" key="upload">
                        <div>
                            <Alert
                                message="Instructions"
                                description="Select images, then click 'Upload and Save' to add them to the vehicle."
                                type="info"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />

                            {/* Keep using your existing ImageUploader component */}
                            <ImageUploader
                                vehicle={editingVehicle}
                                onImagesAdded={(newImages) => {
                                    console.log("Received new images:", newImages);

                                    // Обновляем список техники с новыми изображениями
                                    const updatedVehicles = vehicles.map(vehicle => {
                                        if (vehicle.name === editingVehicle.name) {
                                            const currentImages = vehicle.images || [];
                                            return {
                                                ...vehicle,
                                                images: [...currentImages, ...newImages],
                                                hasImages: true
                                            };
                                        }
                                        return vehicle;
                                    });

                                    // Сохраняем изменения через колбэк
                                    onSave(updatedVehicles);

                                    // Обновляем текущую редактируемую технику
                                    setEditingVehicle(prev => ({
                                        ...prev,
                                        images: [...(prev.images || []), ...newImages],
                                        hasImages: true
                                    }));

                                    // Switch to "Current Images" tab to show the newly uploaded images
                                    setTimeout(() => {
                                        const tabElements = document.querySelectorAll('.ant-tabs-tab');
                                        for (let tab of tabElements) {
                                            if (tab.textContent.includes('Current Images')) {
                                                tab.click();
                                                break;
                                            }
                                        }
                                    }, 300);
                                }}
                            />
                        </div>
                    </TabPane>
                    <TabPane tab="Current Images" key="current">
                        <div className="image-grid">
                            {editingVehicle && editingVehicle.images && editingVehicle.images.length > 0 ? (
                                <div className="current-images">
                                    {editingVehicle.images.map((image, index) => (
                                        <div key={image.id} className="image-item">
                                            <img src={image.url} alt={image.caption || 'Vehicle image'}/>
                                            <div className="image-caption">
                                                <Input
                                                    defaultValue={image.caption}
                                                    size="small"
                                                    onBlur={(e) => handleImageCaptionEdit(editingVehicle, index, e.target.value)}
                                                    onPressEnter={(e) => {
                                                        e.target.blur();
                                                        handleImageCaptionEdit(editingVehicle, index, e.target.value);
                                                    }}
                                                />
                                                <div className="image-actions">
                                                    <Button
                                                        icon={<DeleteOutlined />}
                                                        danger
                                                        size="small"
                                                        onClick={() => handleImageDelete(editingVehicle, index)}
                                                    />
                                                    <Button
                                                        icon={<span>↑</span>}
                                                        size="small"
                                                        disabled={index === 0}
                                                        onClick={() => handleMoveImage(editingVehicle, index, 'up')}
                                                    />
                                                    <Button
                                                        icon={<span>↓</span>}
                                                        size="small"
                                                        disabled={index === editingVehicle.images.length - 1}
                                                        onClick={() => handleMoveImage(editingVehicle, index, 'down')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Empty description="No images uploaded yet"/>
                            )}
                        </div>
                    </TabPane>
                </Tabs>
            </Modal>

            {/* Modal for Batch Image Upload */}
            <Modal
                title="Upload Images to Selected Vehicles"
                open={batchUploadVisible}
                onCancel={() => setBatchUploadVisible(false)}
                footer={null}
                width={800}
                maskClosable={false}
            >
                <Alert
                    message="Batch Upload Information"
                    description={
                        <div>
                            <p>Selected vehicles: {selectedRowKeys.length}</p>
                            <p>Each image will be added to all selected vehicles separately. If you later delete an image from one vehicle, it won't affect other vehicles.</p>
                        </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <BatchImageUploader
                    vehicles={selectedVehicles}
                    onSave={handleSaveBatchImages}
                    onCancel={() => setBatchUploadVisible(false)}
                />
            </Modal>
        </Layout>
    );
};

export default AdminPanel;