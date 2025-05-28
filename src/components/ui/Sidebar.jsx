import {useState} from "react";
import {Menu} from "antd";
import Sider from "antd/es/layout/Sider";

export const Sidebar = ({ onSelect, menuItems }) => {
    const [collapsed, setCollapsed] = useState(false);
    const siderStyle = {
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        scrollbarWidth: 'thin',
        scrollbarGutter: 'stable',
    };

    return (
        <Sider style={siderStyle} collapsible collapsed={collapsed} onCollapse={setCollapsed}>
            <div className="h-12 bg-gray-800 text-white flex items-center justify-center text-lg font-bold">
                {collapsed ? <a onClick={() => onSelect('1')}>S</a> : <a onClick={() => onSelect('1')}>Skipli AI</a>}
            </div>
            <Menu theme="dark" mode="inline" items={menuItems} onClick={(e) => onSelect(e.key)} />
        </Sider>
    );
};