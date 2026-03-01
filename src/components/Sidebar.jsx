import React from 'react';

const Sidebar = ({ activePage, setActivePage }) => {
    return (
        <aside className="w-16 flex-shrink-0 border-r border-surface-border bg-surface-dark flex flex-col justify-between h-full z-20">
            <div className="flex flex-col items-center py-6 gap-8">
                <nav className="flex flex-col gap-4">
                    <button
                        onClick={() => setActivePage('dashboard')}
                        className={`flex items-center justify-center h-10 w-10 rounded-lg group relative transition-colors ${activePage === 'dashboard' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dashboard</span>
                        <div className="tooltip absolute left-full ml-4 px-2 py-1 bg-surface-border text-white text-xs rounded opacity-0 invisible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none translate-x-[-10px]">
                            Dashboard
                        </div>
                    </button>
                    <button
                        onClick={() => setActivePage('scenarios')}
                        className={`flex items-center justify-center h-10 w-10 rounded-lg group relative transition-colors ${activePage === 'scenarios' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_circle</span>
                        <div className="tooltip absolute left-full ml-4 px-2 py-1 bg-surface-border text-white text-xs rounded opacity-0 invisible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none translate-x-[-10px]">
                            Scenarios
                        </div>
                    </button>
                    <button className="flex items-center justify-center h-10 w-10 rounded-lg text-text-secondary hover:bg-white/5 transition-colors group relative">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bar_chart</span>
                        <div className="tooltip absolute left-full ml-4 px-2 py-1 bg-surface-border text-white text-xs rounded opacity-0 invisible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none translate-x-[-10px]">
                            Reports
                        </div>
                    </button>
                </nav>
            </div>
            <div className="flex flex-col items-center py-6 gap-6 border-t border-surface-border">
                <button className="flex items-center justify-center h-10 w-10 rounded-lg text-text-secondary hover:bg-white/5 transition-colors group relative">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
                    <div className="tooltip absolute left-full ml-4 px-2 py-1 bg-surface-border text-white text-xs rounded opacity-0 invisible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none translate-x-[-10px]">
                        Settings
                    </div>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
