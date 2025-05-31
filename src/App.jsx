// App.jsx
import { RiCustomerService2Fill } from "react-icons/ri";
import { ServiceSection } from "@fragments/ServiceSection.jsx";
import { ProfileSection } from "@fragments/ProfileSection.jsx";
import { LoginPage } from "@fragments/LoginPage.jsx";
import { FaUser } from "react-icons/fa";
import { useEffect, useState } from "react";
import {Breadcrumb, Layout, Spin, Tooltip} from "antd";
import { Sidebar } from "@ui/Sidebar.jsx";
import { Content, Footer, Header } from "antd/es/layout/layout.js";
import BreadcrumbItem from "antd/es/breadcrumb/BreadcrumbItem.js";

export const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUserPhone, setCurrentUserPhone] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(false); // New state to handle initial load

    const menuItems = [
        {
            label: 'Services',
            key: '1',
            icon: <RiCustomerService2Fill color={'yellow'} />,
            content: <ServiceSection currentUserPhone={currentUserPhone} />
        },
        {
            label: 'Profile',
            key: '2',
            icon: <FaUser color={'green'} />,
            content: <ProfileSection currentUserPhone={currentUserPhone} />
        }
    ];

    const [selectedContent, setSelectedContent] = useState(null); // Initialize as null
    const [selectedLabel, setSelectedLabel] = useState('Services');

    useEffect(() => {
        // Set initial content after currentUserPhone is updated
        if (isAuthenticated && currentUserPhone) {
            setSelectedContent(<ServiceSection currentUserPhone={currentUserPhone} />);
            setSelectedLabel(menuItems[0].label);
            setIsInitialLoad(false); // Reset initial load flag
        }
    }, [isAuthenticated, currentUserPhone]);

    const handleAuthSuccess = (phone) => {
        setIsAuthenticated(true);
        setCurrentUserPhone(phone);
        setIsInitialLoad(true); // Set initial load flag
    };

    const handleMenuSelect = (key) => {
        const selectedItem = menuItems.find((item) => item.key === key);
        if (selectedItem) {
            setSelectedContent(selectedItem.content);
            setSelectedLabel(selectedItem.label);
        } else {
            // Fallback for nested items if you add them later
            const nestedItem = menuItems.flatMap((item) => item.children || []).find(subItem => subItem.key === key);
            if (nestedItem) {
                setSelectedContent(nestedItem.content);
                setSelectedLabel(nestedItem.label);
            } else {
                setSelectedContent('Content not found');
                setSelectedLabel('Label not found');
            }
        }
    };

    const header = (
        <div className={"flex items-center justify-between p-4"}>
            <h2 className={"text-2xl font-bold text-black"}>Hello, Skipli AI</h2>
        </div>
    );

    const footer = (
        <Tooltip title={'Created and designed by TN1608'}>
            Skipli AI ©2025 Created by TuanNguyen
        </Tooltip>
    );

    return (
        <>
            {!isAuthenticated ? (
                <LoginPage onAuthSuccess={handleAuthSuccess} />
            ) : (
                <Layout className={"min-h-screen bg-gray-100"}>
                    <Sidebar onSelect={handleMenuSelect} menuItems={menuItems} />
                    <Layout className={"site-layout"}>
                        <div className={"bg-white flex items-center justify-between px-4"}>
                            {header}
                        </div>
                        <Content className={"p-4"}>
                            <Breadcrumb className={"mb-4"}>
                                <BreadcrumbItem>Home</BreadcrumbItem>
                                <BreadcrumbItem>{selectedLabel}</BreadcrumbItem>
                            </Breadcrumb>
                            <div className={"bg-white p-6 min-h-full"}>
                                {isInitialLoad ? (
                                    <div className={"flex items-center justify-center h-full"}>
                                        <Spin
                                            size="large"
                                            tip="Loading your content..."
                                            className={"text-gray-500"}
                                        />
                                    </div>
                                ) : (
                                    selectedContent
                                )}
                            </div>
                        </Content>
                        <Footer className={"text-center text-gray-600 bg-gray-200"}>
                            {footer}
                        </Footer>
                    </Layout>
                </Layout>
            )}
        </>
    );
};

export default App;