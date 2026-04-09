/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  FileText, 
  Settings, 
  ChevronDown, 
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Plus,
  Trash2,
  Undo2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { INITIAL_MAINTENANCE_ITEMS, MONTHLY_DATA, MaintenanceItem } from '@/src/constants';

interface AppState {
  odometer: number;
  maintenanceItems: MaintenanceItem[];
  licenseDate: string;
  taxTokenDate: string;
}

export default function App() {
  const [odometer, setOdometer] = useState(22845);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(INITIAL_MAINTENANCE_ITEMS);
  const [selectedYear, setSelectedYear] = useState('2026');
  const years = Array.from({ length: 3000 - 2026 + 1 }, (_, i) => (2026 + i).toString());

  // Dynamic Chart Data
  const currentChartData = selectedYear === '2026' ? MONTHLY_DATA : MONTHLY_DATA.map(d => ({ ...d, km: 0 }));
  const totalKmForYear = currentChartData.reduce((acc, curr) => acc + curr.km, 0);

  // System Telemetry Count (Items at 100% or more)
  const criticalCount = maintenanceItems.filter(item => !item.isMaster && (item.current / item.interval) >= 1).length;

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configType, setConfigType] = useState<'odo' | 'compliance' | 'item' | 'add_item' | 'edit_name' | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string, name: string, value: number | string, type: 'interval' | 'current' | 'name' } | null>(null);
  
  const [newItemData, setNewItemData] = useState({ name: '', interval: 1000 });
  
  const [licenseDate, setLicenseDate] = useState('2035-05-21');
  const [taxTokenDate, setTaxTokenDate] = useState('2026-07-30');

  const [history, setHistory] = useState<AppState[]>([]);
  const MAX_HISTORY = 30;

  // Persistence
  useEffect(() => {
    const savedOdo = localStorage.getItem('racing_odo');
    const savedItems = localStorage.getItem('racing_maintenance');
    const savedLicense = localStorage.getItem('racing_license');
    const savedTax = localStorage.getItem('racing_tax');
    
    if (savedOdo) setOdometer(parseInt(savedOdo));
    if (savedItems) setMaintenanceItems(JSON.parse(savedItems));
    if (savedLicense) setLicenseDate(savedLicense);
    if (savedTax) setTaxTokenDate(savedTax);
  }, []);

  useEffect(() => {
    localStorage.setItem('racing_odo', odometer.toString());
    localStorage.setItem('racing_maintenance', JSON.stringify(maintenanceItems));
    localStorage.setItem('racing_license', licenseDate);
    localStorage.setItem('racing_tax', taxTokenDate);
  }, [odometer, maintenanceItems, licenseDate, taxTokenDate]);

  const saveToHistory = () => {
    const currentState: AppState = {
      odometer,
      maintenanceItems,
      licenseDate,
      taxTokenDate
    };
    setHistory(prev => [currentState, ...prev].slice(0, MAX_HISTORY));
  };

  const undo = () => {
    if (history.length === 0) return;
    const [previousState, ...remainingHistory] = history;
    
    setOdometer(previousState.odometer);
    setMaintenanceItems(previousState.maintenanceItems);
    setLicenseDate(previousState.licenseDate);
    setTaxTokenDate(previousState.taxTokenDate);
    setHistory(remainingHistory);
  };

  const calculateDaysLeft = (targetDate: string) => {
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB').replace(/\//g, '-');
  };

  const handleReset = (id: string) => {
    saveToHistory();
    const today = new Date().toISOString().split('T')[0];
    setMaintenanceItems(prev => prev.map(item => 
      item.id === id ? { ...item, current: 0, lastResetDate: today } : item
    ));
  };

  const handleUpdateResetDate = (id: string, date: string) => {
    saveToHistory();
    setMaintenanceItems(prev => prev.map(item => 
      item.id === id ? { ...item, lastResetDate: date } : item
    ));
  };

  const handleEditInterval = (id: string, name: string, currentVal: number) => {
    setEditingItem({ id, name, value: currentVal, type: 'interval' });
    setConfigType('item');
    setIsConfigModalOpen(true);
  };

  const handleEditCurrent = (id: string, name: string, currentVal: number) => {
    setEditingItem({ id, name, value: currentVal, type: 'current' });
    setConfigType('item');
    setIsConfigModalOpen(true);
  };

  const handleEditName = (id: string, name: string) => {
    setEditingItem({ id, name, value: name, type: 'name' });
    setConfigType('edit_name');
    setIsConfigModalOpen(true);
  };

  const handleAddComponent = () => {
    setNewItemData({ name: '', interval: 1000 });
    setConfigType('add_item');
    setIsConfigModalOpen(true);
  };

  const handleDeleteComponent = (id: string) => {
    saveToHistory();
    setMaintenanceItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateOdometer = () => {
    setConfigType('odo');
    setIsConfigModalOpen(true);
  };

  const handleConfigureCompliance = () => {
    setConfigType('compliance');
    setIsConfigModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-racing-black text-racing-text-white font-sans p-4 md:p-8 selection:bg-racing-red selection:text-racing-text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic leading-none">
              GIXXER <span className="text-racing-red">Airlines</span>
            </h1>
          </div>
          <p className="text-[11px] font-bold text-racing-text-gray mt-3 uppercase tracking-[0.3em]">
            Local Storage Mode
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-racing-dark border border-racing-border px-6 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] text-racing-text-gray flex items-center gap-2 hover:bg-racing-border transition-colors">
            Offline Secure
          </button>
          {history.length > 0 && (
            <button 
              onClick={undo}
              className="bg-racing-red/10 border border-racing-red/20 px-6 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] text-racing-red flex items-center gap-2 hover:bg-racing-red/20 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
              Undo ({history.length})
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {/* Global Odometer */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="racing-card relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-racing-text-gray">Global Odometer</h3>
              <MoreHorizontal className="w-5 h-5 text-racing-text-gray/50" />
            </div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-7xl font-mono font-bold tracking-tighter text-racing-text-white">
                {odometer.toLocaleString()}
              </span>
              <span className="text-2xl font-bold text-racing-text-gray italic">KM</span>
            </div>
            <button 
              onClick={handleUpdateOdometer}
              className="racing-button w-full md:w-auto"
            >
              Update Reading
            </button>
            <div className="mt-10 flex items-center gap-3">
              <div className="status-dot status-dot-online" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-racing-text-gray">Master Telemetry Online</span>
            </div>
          </motion.div>

          {/* System Telemetry */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="racing-card relative"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-racing-text-gray">System Telemetry</h3>
              <Activity className={cn("w-5 h-5 transition-colors", criticalCount > 0 ? "text-racing-red" : "text-racing-green")} />
            </div>
            <p className={cn(
              "text-[12px] font-bold uppercase tracking-widest mb-10 transition-colors",
              criticalCount > 0 ? "text-racing-red" : "text-racing-green"
            )}>
              {criticalCount > 0 ? "Attention Required" : "Nominal Status"}
            </p>
            
            <div className="flex items-center gap-10 mb-10">
              <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                    className="text-racing-border"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="1 10"
                    className={cn("transition-colors", criticalCount > 0 ? "text-racing-red" : "text-racing-green")}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  />
                </svg>
                <span className={cn(
                  "text-4xl font-mono font-bold transition-colors",
                  criticalCount > 0 ? "text-racing-red" : "text-racing-border"
                )}>
                  {criticalCount.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[13px] font-bold uppercase tracking-wider mb-2 text-racing-text-white">
                  {criticalCount > 0 ? `${criticalCount} Items Critical` : "All Systems Verified"}
                </h4>
                <p className="text-[11px] text-racing-text-gray leading-relaxed uppercase tracking-tighter">
                  {criticalCount > 0 
                    ? "Immediate maintenance required\nfor highlighted components."
                    : "Maintenance intervals within\nprojected safety envelopes."}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-racing-border">
              <div className="bg-racing-black/50 border border-racing-border rounded-xl px-5 py-3 flex items-center gap-3 w-fit">
                <CheckCircle2 className="w-4 h-4 text-racing-text-gray" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-racing-text-gray">Telemetry Secure</span>
              </div>
            </div>
          </motion.div>

          {/* Compliance Monitor */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="racing-card"
          >
            <div className="flex justify-between items-start mb-10">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-racing-text-gray">Compliance Monitor</h3>
              <button 
                onClick={handleConfigureCompliance}
                className="text-[11px] font-bold uppercase tracking-widest text-racing-text-gray/60 cursor-pointer hover:text-racing-text-white transition-colors"
              >
                Configure
              </button>
            </div>

            <div className="space-y-8 mb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-[12px] font-bold uppercase tracking-widest mb-2 text-racing-text-white/80">Driving License</h4>
                  <p className="text-[12px] font-mono text-racing-text-gray">{formatDate(licenseDate)}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-mono font-bold text-racing-green">{calculateDaysLeft(licenseDate)}</span>
                  <p className="text-[10px] font-bold text-racing-text-gray uppercase tracking-widest">Days Left</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-[12px] font-bold uppercase tracking-widest mb-2 text-racing-text-white/80">Tax Token</h4>
                  <p className="text-[12px] font-mono text-racing-text-gray">{formatDate(taxTokenDate)}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-mono font-bold text-racing-green">{calculateDaysLeft(taxTokenDate)}</span>
                  <p className="text-[10px] font-bold text-racing-text-gray uppercase tracking-widest">Days Left</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-racing-border flex items-center gap-3">
              <div className="status-dot bg-racing-green" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-racing-text-gray">Legal Status Secure</span>
            </div>
          </motion.div>
        </div>

        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="racing-card"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-4">
            <div>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none text-racing-text-white">
                Total KM in {selectedYear} - <span className="text-glow-red">{totalKmForYear} KM</span>
              </h2>
              <p className="text-[12px] font-bold text-racing-text-gray uppercase tracking-[0.2em] mt-4">Telemetry Archive: {selectedYear}</p>
            </div>
            <div className="relative">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-racing-black border border-racing-border px-6 py-3.5 pr-12 rounded-2xl text-[12px] font-bold uppercase tracking-[0.2em] hover:border-racing-text-gray transition-colors cursor-pointer focus:outline-none focus:border-racing-red text-racing-text-white"
              >
                {years.map(year => (
                  <option key={year} value={year} className="bg-racing-dark text-racing-text-white">
                    Year: {year}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-racing-text-gray absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={24}
                        textAnchor="middle"
                        fill={payload.value === 'APR' ? '#A1142B' : '#98A2B3'}
                        className={cn(
                          "text-[14px] font-black uppercase tracking-widest",
                          payload.value === 'APR' && "underline underline-offset-[12px] decoration-[3px]"
                        )}
                      >
                        {payload.value}
                      </text>
                    </g>
                  )}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#98A2B3', fontSize: 13, fontWeight: 900 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#12151A', border: '1px solid #2A313B', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#F5F7FA' }}
                  labelStyle={{ color: '#F5F7FA', marginBottom: '4px' }}
                />
                <Bar dataKey="km" radius={[4, 4, 0, 0]} barSize={60}>
                  {MONTHLY_DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.month === 'JAN' ? '#8B1026' : entry.month === 'APR' ? '#A1142B' : '#2A313B'} 
                      className={entry.month === 'APR' ? 'drop-shadow-[0_0_15px_rgba(161,20,43,0.5)]' : ''}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Maintenance Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="racing-card overflow-x-auto"
        >
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black italic uppercase tracking-tight text-racing-text-white">Maintenance Telemetry</h2>
            <button 
              onClick={handleAddComponent}
              className="racing-button flex items-center gap-3"
            >
              <Plus className="w-5 h-5" />
              Add Component
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-racing-red/30">
                <th className="pb-10 text-[11px] font-black uppercase tracking-[0.3em] text-racing-text-gray">Component</th>
                <th className="pb-10 text-[11px] font-black uppercase tracking-[0.3em] text-racing-text-gray">Last Reset</th>
                <th className="pb-10 text-[11px] font-black uppercase tracking-[0.3em] text-racing-text-gray">Interval (Edit)</th>
                <th className="pb-10 text-[11px] font-black uppercase tracking-[0.3em] text-racing-text-gray">Current (Edit)</th>
                <th className="pb-10 text-[11px] font-black uppercase tracking-[0.3em] text-racing-text-gray">Status</th>
                <th className="pb-10 text-[11px] font-black uppercase tracking-[0.3em] text-racing-text-gray text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-racing-border/20">
              {maintenanceItems.map((item) => {
                const percentage = item.isMaster ? 0 : Math.min(Math.round((item.current / item.interval) * 100), 100);
                const isWarning = percentage > 80;
                const isCritical = percentage >= 100;

                return (
                  <tr key={item.id} className="group transition-colors border-b border-racing-border/10 last:border-0">
                    <td className="py-10 pr-8">
                      <button 
                        onClick={() => !item.isMaster && handleEditName(item.id, item.name)}
                        className={cn(
                          "text-[15px] font-black uppercase tracking-tight text-left transition-colors text-racing-text-white",
                          !item.isMaster && "hover:text-racing-red cursor-pointer"
                        )}
                      >
                        {item.name}
                      </button>
                    </td>
                    <td className="py-10 pr-8 min-w-[200px]">
                      <input 
                        type="date"
                        value={item.lastResetDate}
                        onChange={(e) => handleUpdateResetDate(item.id, e.target.value)}
                        className="bg-racing-black border border-racing-border/50 rounded-xl px-4 py-3.5 text-[16px] font-mono font-bold text-racing-text-white focus:outline-none focus:border-racing-red transition-all [color-scheme:dark] w-full cursor-pointer hover:border-racing-red/50 shadow-inner"
                      />
                    </td>
                    <td className="py-10 pr-8">
                      <button 
                        onClick={() => !item.isMaster && handleEditInterval(item.id, item.name, item.interval)}
                        className={cn(
                          "text-[18px] font-mono font-black text-left",
                          item.isMaster ? "text-racing-border" : "text-racing-text-white/90 hover:text-racing-text-white cursor-pointer"
                        )}
                      >
                        {item.isMaster ? 'MASTER' : `${item.interval} km`}
                      </button>
                    </td>
                    <td className="py-10 pr-8">
                      <button 
                        onClick={() => handleEditCurrent(item.id, item.name, item.current)}
                        className={cn(
                          "text-[18px] font-mono font-black text-left",
                          isCritical ? "text-glow-red" : "text-glow-green",
                          "hover:underline cursor-pointer"
                        )}
                      >
                        {item.current} km
                      </button>
                    </td>
                    <td className="py-10 pr-8 min-w-[280px]">
                      {item.isMaster ? (
                        <div className="flex items-center gap-8">
                          <div className="flex-1 progress-bar-container max-w-[200px]">
                            <div className="progress-bar-fill bg-racing-border/20 w-full" />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-racing-border w-12 text-right">MASTER</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-8">
                          <div className="flex-1 progress-bar-container max-w-[200px]">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className={cn(
                                "progress-bar-fill",
                                isCritical ? "bg-racing-red shadow-[0_0_12px_rgba(161,20,43,0.8)]" : isWarning ? "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]" : "bg-racing-green shadow-[0_0_12px_rgba(45,235,219,0.8)]"
                              )}
                            />
                          </div>
                          <span className="text-[12px] font-mono font-black text-racing-text-gray w-12 text-right">{percentage}%</span>
                        </div>
                      )}
                    </td>
                    <td className="py-10 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleReset(item.id)}
                          className="racing-button-secondary"
                        >
                          Reset
                        </button>
                        {!item.isMaster && (
                          <button 
                            onClick={() => handleDeleteComponent(item.id)}
                            className="p-2 text-racing-text-gray hover:text-racing-red transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      </main>

      {/* Footer Decoration */}
      <footer className="mt-20 pb-10 text-center">
        <div className="inline-flex items-center gap-4 text-racing-border">
          <div className="h-px w-12 bg-racing-border" />
          <Settings className="w-4 h-4 animate-[spin_10s_linear_infinite]" />
          <div className="h-px w-12 bg-racing-border" />
        </div>
      </footer>
      {/* Config Modal */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfigModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-racing-dark border border-racing-border w-full max-w-lg rounded-[48px] p-12 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black italic uppercase tracking-tight text-racing-text-white">
                  {configType === 'odo' ? 'Update Odometer' : 
                   configType === 'compliance' ? 'Compliance Config' : 
                   configType === 'add_item' ? 'Add New Component' :
                   configType === 'edit_name' ? `Rename ${editingItem?.name}` :
                   `Edit ${editingItem?.name}`}
                </h2>
                <button 
                  onClick={() => setIsConfigModalOpen(false)}
                  className="p-3 hover:bg-racing-border rounded-full transition-colors text-racing-text-gray"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                {configType === 'odo' && (
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-widest text-racing-text-gray mb-3">New Reading (KM)</label>
                    <input 
                      type="number"
                      defaultValue={odometer}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseInt((e.target as HTMLInputElement).value);
                          if (!isNaN(val)) {
                            saveToHistory();
                            const diff = val - odometer;
                            setOdometer(val);
                            if (diff > 0) {
                              setMaintenanceItems(prev => prev.map(item => ({
                                ...item,
                                current: item.current + diff
                              })));
                            }
                            setIsConfigModalOpen(false);
                          }
                        }
                      }}
                      className="w-full bg-racing-black border border-racing-border rounded-2xl px-6 py-4 font-mono font-bold text-2xl focus:outline-none focus:border-racing-red transition-colors text-racing-text-white"
                    />
                    <p className="text-[11px] text-racing-text-gray mt-3 uppercase tracking-widest">Press Enter to Confirm</p>
                  </div>
                )}

                {configType === 'compliance' && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-widest text-racing-text-gray mb-3">Driving License Expiry</label>
                      <input 
                        type="date"
                        value={licenseDate}
                        onChange={(e) => {
                          saveToHistory();
                          setLicenseDate(e.target.value);
                        }}
                        className="w-full bg-racing-black border border-racing-border rounded-2xl px-6 py-4 font-mono font-bold text-lg focus:outline-none focus:border-racing-red transition-colors text-racing-text-white [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-widest text-racing-text-gray mb-3">Tax Token Expiry</label>
                      <input 
                        type="date"
                        value={taxTokenDate}
                        onChange={(e) => {
                          saveToHistory();
                          setTaxTokenDate(e.target.value);
                        }}
                        className="w-full bg-racing-black border border-racing-border rounded-2xl px-6 py-4 font-mono font-bold text-lg focus:outline-none focus:border-racing-red transition-colors text-racing-text-white [color-scheme:dark]"
                      />
                    </div>
                    <button 
                      onClick={() => setIsConfigModalOpen(false)}
                      className="racing-button w-full py-5 text-base"
                    >
                      Save Configuration
                    </button>
                  </div>
                )}

                {configType === 'item' && editingItem && (
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-widest text-racing-text-gray mb-3">
                      {editingItem.type === 'interval' ? 'Service Interval (KM)' : 'Current Distance (KM)'}
                    </label>
                    <input 
                      type="number"
                      defaultValue={editingItem.value as number}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseInt((e.target as HTMLInputElement).value);
                          if (!isNaN(val)) {
                            saveToHistory();
                            setMaintenanceItems(prev => prev.map(item => 
                              item.id === editingItem.id ? { 
                                ...item, 
                                [editingItem.type]: val 
                              } : item
                            ));
                            setIsConfigModalOpen(false);
                          }
                        }
                      }}
                      className="w-full bg-racing-black border border-racing-border rounded-2xl px-6 py-4 font-mono font-bold text-2xl focus:outline-none focus:border-racing-red transition-colors text-racing-text-white"
                    />
                    <p className="text-[11px] text-racing-text-gray mt-3 uppercase tracking-widest">Press Enter to Confirm</p>
                  </div>
                )}

                {configType === 'edit_name' && editingItem && (
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-widest text-racing-text-gray mb-3">Component Name</label>
                    <input 
                      type="text"
                      defaultValue={editingItem.value as string}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            saveToHistory();
                            setMaintenanceItems(prev => prev.map(item => 
                              item.id === editingItem.id ? { ...item, name: val } : item
                            ));
                            setIsConfigModalOpen(false);
                          }
                        }
                      }}
                      className="w-full bg-racing-black border border-racing-border rounded-2xl px-6 py-4 font-bold text-2xl focus:outline-none focus:border-racing-red transition-colors text-racing-text-white uppercase"
                    />
                    <p className="text-[11px] text-racing-text-gray mt-3 uppercase tracking-widest">Press Enter to Confirm</p>
                  </div>
                )}

                {configType === 'add_item' && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-widest text-racing-text-gray mb-3">Component Name</label>
                      <input 
                        type="text"
                        value={newItemData.name}
                        onChange={(e) => setNewItemData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-racing-black border border-racing-border rounded-2xl px-6 py-4 font-bold text-xl focus:outline-none focus:border-racing-red transition-colors text-racing-text-white uppercase"
                        placeholder="e.g. CHAIN LUBING"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-widest text-racing-text-gray mb-3">Service Interval (KM)</label>
                      <input 
                        type="number"
                        value={newItemData.interval}
                        onChange={(e) => setNewItemData(prev => ({ ...prev, interval: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-racing-black border border-racing-border rounded-2xl px-6 py-4 font-mono font-bold text-xl focus:outline-none focus:border-racing-red transition-colors text-racing-text-white"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (newItemData.name.trim()) {
                          saveToHistory();
                          const today = new Date().toISOString().split('T')[0];
                          const newItem: MaintenanceItem = {
                            id: Date.now().toString(),
                            name: newItemData.name.trim().toUpperCase(),
                            interval: newItemData.interval,
                            current: 0,
                            lastResetDate: today
                          };
                          setMaintenanceItems(prev => [newItem, ...prev]);
                          setIsConfigModalOpen(false);
                        }
                      }}
                      className="racing-button w-full py-5 text-base"
                    >
                      Add to Telemetry
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
