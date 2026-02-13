import React, { useState, useRef } from 'react';
import { User, Menu, WasteConfig, WasteLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area, CartesianGrid } from 'recharts';
import { Camera, TrendingUp, DollarSign, PieChart as PieIcon, Trash2, Upload, Settings, Save, Scale } from 'lucide-react';

interface Props {
  menus: Menu[];
  crew: User[];
  userRole: 'admin' | 'officer';
  wasteConfig: WasteConfig;
  wasteLogs: WasteLog[];
  onUploadMenu: (file: File) => void;
  onUploadCrew: (file: File) => void;
  onUpdateWasteConfig: (config: WasteConfig) => void;
}

// Mock Data for Analytics
const satisfactionData = [
  { name: 'Mon', rating: 4.2 },
  { name: 'Tue', rating: 3.8 },
  { name: 'Wed', rating: 4.5 },
  { name: 'Thu', rating: 4.1 },
  { name: 'Fri', rating: 4.7 },
  { name: 'Sat', rating: 3.9 },
  { name: 'Sun', rating: 4.3 },
];

const dietaryComplianceData = [
  { name: 'Standard', value: 55, color: '#2C5F8D' },
  { name: 'Halal', value: 25, color: '#7CB342' },
  { name: 'Vegetarian', value: 10, color: '#FF8C42' },
  { name: 'Allergy Safe', value: 10, color: '#EF4444' },
];

const Dashboard: React.FC<Props> = ({ crew, userRole, wasteConfig, wasteLogs, onUploadMenu, onUploadCrew, onUpdateWasteConfig }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'crew' | 'waste_config'>('analytics');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const crewFileInputRef = useRef<HTMLInputElement>(null);

  // Waste Config State
  const [tempConfig, setTempConfig] = useState<WasteConfig>(wasteConfig);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadMenu(file);
    }
    if (event.target.value) event.target.value = '';
  };

  const handleCrewImportClick = () => {
    crewFileInputRef.current?.click();
  };

  const handleCrewFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadCrew(file);
    }
    if (event.target.value) event.target.value = '';
  };

  const handleSaveConfig = () => {
      onUpdateWasteConfig(tempConfig);
      alert("Waste calculation standards updated successfully.");
  };

  // Aggregate Waste Logs by Month for Admin Table
  const getMonthlyWasteData = () => {
      const grouped: {[key: string]: {count: number, weight: number, volume: number}} = {};
      
      wasteLogs.forEach(log => {
          const date = new Date(log.date);
          const monthKey = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
          
          if (!grouped[monthKey]) {
              grouped[monthKey] = { count: 0, weight: 0, volume: 0 };
          }
          grouped[monthKey].count += log.container_count;
          grouped[monthKey].weight += log.total_weight_kg;
          grouped[monthKey].volume += log.total_volume_m3;
      });

      return Object.entries(grouped).map(([month, data]) => ({
          month,
          ...data
      }));
  };

  // Prepare Chart Data for Waste (Last 7 entries or days)
  const wasteChartData = wasteLogs.slice(-7).map(log => ({
      day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
      weight: log.total_weight_kg
  }));

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-navy">
            {activeTab === 'crew' ? 'Crew Management' : userRole === 'officer' && activeTab === 'waste_config' ? 'Waste Settings' : 'Dashboard'}
        </h2>
        
        {activeTab === 'analytics' && (
            <div className="flex gap-2">
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <button 
                    onClick={handleCameraClick}
                    className="bg-fresh text-white p-2 rounded-lg shadow-lg shadow-fresh/30 hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                    <Camera className="w-5 h-5" />
                    <span className="hidden sm:inline text-xs font-bold">Scan Menu</span>
                </button>
            </div>
        )}
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-white text-navy shadow-sm' : 'text-gray-500'}`}
          >
              Analytics
          </button>
          <button 
            onClick={() => setActiveTab('crew')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === 'crew' ? 'bg-white text-navy shadow-sm' : 'text-gray-500'}`}
          >
              Crew List
          </button>
          {userRole === 'officer' && (
             <button 
                onClick={() => setActiveTab('waste_config')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === 'waste_config' ? 'bg-white text-navy shadow-sm' : 'text-gray-500'}`}
            >
                Waste Config
            </button>
          )}
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10"><TrendingUp className="w-8 h-8 text-navy" /></div>
                    <p className="text-gray-500 text-xs uppercase font-bold">Avg Rating</p>
                    <p className="text-3xl font-bold text-navy mt-1">4.2</p>
                    <span className="text-xs text-green-600 font-medium">↑ 12% vs last week</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-3 opacity-10"><Trash2 className="w-8 h-8 text-red-600" /></div>
                    <p className="text-gray-500 text-xs uppercase font-bold">Total Waste (Mo)</p>
                    <p className="text-3xl font-bold text-navy mt-1">
                        {wasteLogs.reduce((acc, curr) => acc + curr.total_weight_kg, 0)} <span className="text-sm text-gray-400">kg</span>
                    </p>
                    <span className="text-xs text-orange-400 font-medium">{(wasteLogs.length * wasteConfig.container_volume_m3).toFixed(2)} m³</span>
                </div>
            </div>

            {/* Admin Waste Report Table */}
            {userRole === 'admin' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-red-500" />
                        <h3 className="font-bold text-navy text-sm">Fleet Monthly Waste Report</h3>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="p-3 font-medium">Month</th>
                                <th className="p-3 font-medium text-right">Bins</th>
                                <th className="p-3 font-medium text-right">Volume (m³)</th>
                                <th className="p-3 font-medium text-right">Weight (kg)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {getMonthlyWasteData().map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium text-navy">{row.month}</td>
                                    <td className="p-3 text-right text-gray-600">{row.count}</td>
                                    <td className="p-3 text-right text-gray-600">{row.volume.toFixed(2)}</td>
                                    <td className="p-3 text-right font-bold text-navy">{row.weight}</td>
                                </tr>
                            ))}
                            {wasteLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-gray-400">No waste logs recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Satisfaction Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-ocean" /> Weekly Satisfaction
                </h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={satisfactionData}>
                            <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                                cursor={{fill: '#f3f4f6'}} 
                            />
                            <Bar dataKey="rating" radius={[4, 4, 0, 0]}>
                                {satisfactionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.rating > 4 ? '#7CB342' : entry.rating > 3 ? '#FF8C42' : '#EF4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Cost vs Waste Trend */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-ocean" /> Daily Waste (Kg)
                </h3>
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={wasteChartData.length > 0 ? wasteChartData : [{day:'-', weight:0}]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                            <CartesianGrid vertical={false} stroke="#f3f4f6" />
                            <Area type="monotone" dataKey="weight" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorWaste)" name="Waste (kg)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'waste_config' && userRole === 'officer' && (
          <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-ocean">
                          <Scale className="w-6 h-6" />
                      </div>
                      <div>
                          <h3 className="font-bold text-navy text-lg">Waste Container Standard</h3>
                          <p className="text-gray-500 text-sm">Define the size and weight of your food waste bins.</p>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Volume per Container (m³)</label>
                          <input 
                              type="number" 
                              step="0.01"
                              value={tempConfig.container_volume_m3}
                              onChange={(e) => setTempConfig({...tempConfig, container_volume_m3: parseFloat(e.target.value)})}
                              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean outline-none"
                              placeholder="e.g. 0.05"
                          />
                          <p className="text-xs text-gray-400 mt-1">Standard 50L bin ≈ 0.05 m³</p>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Estimated Weight when Full (kg)</label>
                          <input 
                              type="number" 
                              value={tempConfig.container_weight_kg}
                              onChange={(e) => setTempConfig({...tempConfig, container_weight_kg: parseFloat(e.target.value)})}
                              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean outline-none"
                              placeholder="e.g. 25"
                          />
                      </div>
                  </div>

                  <button 
                      onClick={handleSaveConfig}
                      className="w-full mt-6 bg-ocean text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors"
                  >
                      <Save className="w-4 h-4" /> Save Configuration
                  </button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                  <p className="font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Why is this important?</p>
                  <p className="mt-1 opacity-80">This data allows the Galley team to simply count bins, while the system automatically calculates total discharge for MARPOL logs and fleet analytics.</p>
              </div>
          </div>
      )}

      {activeTab === 'crew' && (
          <div className="space-y-4 animate-in fade-in duration-300">
               <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between border border-blue-100">
                   <div>
                       <h4 className="font-bold text-ocean">Upload Crew Roster</h4>
                       <p className="text-xs text-blue-600">Supports PDF (via Image), JPG, PNG</p>
                   </div>
                   <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={crewFileInputRef}
                      onChange={handleCrewFileChange}
                   />
                   <button 
                      onClick={handleCrewImportClick} 
                      className="bg-ocean text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                   >
                       <Upload className="w-4 h-4" /> Import
                   </button>
               </div>

               <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                   <table className="w-full text-left text-sm">
                       <thead className="bg-gray-50 text-gray-500">
                           <tr>
                               <th className="p-4 font-medium">Name</th>
                               <th className="p-4 font-medium">Rank</th>
                               <th className="p-4 font-medium">Dietary</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                           {crew.map(member => (
                               <tr key={member.user_id}>
                                   <td className="p-4 font-medium text-navy">{member.name}</td>
                                   <td className="p-4 text-gray-500">{member.rank}</td>
                                   <td className="p-4">
                                       <div className="flex gap-1 flex-wrap">
                                           {member.dietary_profile.religious_restrictions.religion === 'muslim' && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">Halal</span>}
                                           {member.dietary_profile.food_allergies.length > 0 && <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded border border-red-200">Allergy</span>}
                                           {!member.onboarding_completed && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">Pending</span>}
                                           {member.onboarding_completed && member.dietary_profile.food_allergies.length === 0 && member.dietary_profile.religious_restrictions.religion === 'none' && <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded border border-green-200">Standard</span>}
                                       </div>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;