import React from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark">
      <Sidebar />
      <Dashboard />
    </div>
  );
}

export default App;
