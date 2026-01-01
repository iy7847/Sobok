import React from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="flex bg-background min-h-screen">
            <Sidebar />
            <main className="main-content flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
