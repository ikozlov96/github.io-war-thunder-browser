import React, {useState} from 'react';
import {
    Badge,
    Button,
    Divider,
    Drawer, Empty,
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
    Upload
} from 'antd';
import {
    DashboardOutlined,
    EditOutlined,
    InboxOutlined,
    LogoutOutlined,
    PictureOutlined,
    PlusOutlined,
    SearchOutlined,
    SettingOutlined
} from '@ant-design/icons';
import {formatBR, getCountryName, getTypeName} from '../utils';
import './AdminPanel.css';

const {Header, Sider, Content} = Layout;
const {Option} = Select;
const {TabPane} = Tabs;
const {Dragger} = Upload;

// Иконка для брони
const ArmorIcon = props => <svg viewBox="0 0 24 24" width="1em" height="1em" {...props}>
    <path
        d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 8.96-7 10.15-3.87-1.2-7-5.48-7-10.15V6.3l7-3.12z"
        fill="currentColor"/>
</svg>;

const AdminPanel = ({vehicles, onSave, onClose}) => {
    const [activeTab, setActiveTab] = useState('vehicles');
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [imageUploadVisible, setImageUploadVisible] = useState(false);
    const [armorUploadVisible, setArmorUploadVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    // Обработка поиска
    const handleSearch = value => {
        setSearchText(value);
    };

    // Фильтрация списка техники по поисковому запросу
    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.name.toLowerCase().includes(searchText.toLowerCase())
    );

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
    const handleSave = values => {
        // Здесь будет вызов API для сохранения данных
        console.log('Saving vehicle data:', values);

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
    };

    // Обработка открытия модального окна для загрузки изображений
    const handleImageUpload = vehicle => {
        setEditingVehicle(vehicle);
        setImageUploadVisible(true);
    };

    // Обработка открытия модального окна для загрузки схем брони
    const handleArmorUpload = vehicle => {
        setEditingVehicle(vehicle);
        setArmorUploadVisible(true);
    };

    // Настройки загрузки файлов
    const uploadProps = {
        name: 'file',
        multiple: true,
        action: '//jsonplaceholder.typicode.com/posts/', // Mock API endpoint
        onChange(info) {
            const {status} = info.file;
            if (status === 'done') {
                message.success(`${info.file.name} uploaded successfully.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} upload failed.`);
            }
        },
        beforeUpload(file) {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
            }
            return isImage || Upload.LIST_IGNORE;
        },
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
                    <Button
                        icon={<ArmorIcon/>}
                        onClick={() => handleArmorUpload(record)}
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
                                <Button type="primary" icon={<PlusOutlined/>}>
                                    Add Vehicle
                                </Button>
                            </div>

                            <Table
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
                visible={!!editingVehicle}
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

            {/* Modal for image upload */}
            <Modal
                title="Upload Vehicle Images"
                visible={imageUploadVisible}
                onCancel={() => setImageUploadVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setImageUploadVisible(false)}>
                        Close
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => {
                        message.success('Images uploaded successfully');
                        setImageUploadVisible(false);
                    }}>
                        Submit
                    </Button>,
                ]}
            >
                <Tabs defaultActiveKey="upload">
                    <TabPane tab="Upload" key="upload">
                        <Dragger {...uploadProps}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined/>
                            </p>
                            <p className="ant-upload-text">Click or drag files to this area to upload</p>
                            <p className="ant-upload-hint">
                                Support for multiple file upload. Only image files are allowed.
                            </p>
                        </Dragger>
                    </TabPane>
                    <TabPane tab="Current Images" key="current">
                        <div className="image-grid">
                            <Empty description="No images uploaded yet"/>
                        </div>
                    </TabPane>
                </Tabs>
            </Modal>

            {/* Modal for armor diagram upload */}
            <Modal
                title="Upload Armor Diagrams"
                visible={armorUploadVisible}
                onCancel={() => setArmorUploadVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setArmorUploadVisible(false)}>
                        Close
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => {
                        message.success('Armor diagrams uploaded successfully');
                        setArmorUploadVisible(false);
                    }}>
                        Submit
                    </Button>,
                ]}
            >
                <Tabs defaultActiveKey="upload">
                    <TabPane tab="Upload" key="upload">
                        <Dragger {...uploadProps}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined/>
                            </p>
                            <p className="ant-upload-text">Click or drag armor diagram images to this area</p>
                            <p className="ant-upload-hint">
                                Please upload images showing armor penetration zones.
                            </p>
                        </Dragger>
                    </TabPane>
                    <TabPane tab="Current Diagrams" key="current">
                        <div className="image-grid">
                            <Empty description="No armor diagrams uploaded yet"/>
                        </div>
                    </TabPane>
                </Tabs>
            </Modal>
        </Layout>
    );
};

export default AdminPanel;