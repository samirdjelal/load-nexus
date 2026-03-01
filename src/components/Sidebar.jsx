import React from 'react';

const Sidebar = () => {
    return (
        <aside className="w-16 flex-shrink-0 border-r border-surface-border bg-surface-dark flex flex-col justify-between h-full z-20">
            <div className="flex flex-col items-center py-6 gap-8">
                <div className="bg-primary/20 flex items-center justify-center rounded-lg h-10 w-10 text-primary group relative cursor-pointer">
                    <span className="material-symbols-outlined">bolt</span>
                    <div className="tooltip absolute left-full ml-4 px-2 py-1 bg-surface-border text-white text-xs rounded opacity-0 invisible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none translate-x-[-10px]">
                        LoadTester v2.4
                    </div>
                </div>
                <nav className="flex flex-col gap-4">
                    <a className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-white group relative" href="#">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dashboard</span>
                        <div className="tooltip absolute left-full ml-4 px-2 py-1 bg-surface-border text-white text-xs rounded opacity-0 invisible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none translate-x-[-10px]">
                            Dashboard
                        </div>
                    </a>
                    <a className="flex items-center justify-center h-10 w-10 rounded-lg text-text-secondary hover:bg-white/5 transition-colors group relative" href="#">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>folder_open</span>
                        <div className="tooltip absolute left-full ml-4 px-2 py-1 bg-surface-border text-white text-xs rounded opacity-0 invisible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none translate-x-[-10px]">
                            Test Suites
                        </div>
                    </a>
                    <a className="flex items-center justify-center h-10 w-10 rounded-lg text-text-secondary hover:bg-white/5 transition-colors group relative" href="#">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_circle</span>
                        <div className="tooltip absolute left-full ml-4 px-2 py-1 bg-surface-border text-white text-xs rounded opacity-0 invisible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none translate-x-[-10px]">
                            Scenarios
                        </div>
                    </a>
                    <a className="flex items-center justify-center h-10 w-10 rounded-lg text-text-secondary hover:bg-white/5 transition-colors group relative" href="#">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bar_chart</span>
                        <div className="tooltip absolute left-full ml-4 px-2 py-1 bg-surface-border text-white text-xs rounded opacity-0 invisible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none translate-x-[-10px]">
                            Reports
                        </div>
                    </a>
                </nav>
            </div>
            <div className="flex flex-col items-center py-6 gap-6 border-t border-surface-border">
                <a className="flex items-center justify-center h-10 w-10 rounded-lg text-text-secondary hover:bg-white/5 transition-colors group relative" href="#">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
                    <div className="tooltip absolute left-full ml-4 px-2 py-1 bg-surface-border text-white text-xs rounded opacity-0 invisible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none translate-x-[-10px]">
                        Settings
                    </div>
                </a>
                <div className="group relative cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-cover bg-center border border-surface-border" style={{ backgroundImage: "url('https://api.dicebear.com/9.x/avataaars/svg')" }}></div>
                    <div className="tooltip absolute left-full bottom-0 ml-4 p-3 bg-surface-dark border border-surface-border text-white rounded-lg shadow-xl opacity-0 invisible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none translate-x-[-10px]">
                        <p className="text-sm font-bold">User</p>
                        <p className="text-[10px] text-text-secondary uppercase tracking-wider">Tester</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
