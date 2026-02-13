import React, { useState } from 'react';
import { User, Menu, MealAttendance, MenuItem, Request, WasteConfig } from '../types';
import { Check, Clock, AlertTriangle, Utensils, Users, Flame, CheckCircle, Calculator, Trash2, Plus, Minus, Save } from 'lucide-react';
import { MEAL_TIMINGS } from '../constants';

interface Props {
  menus: Menu[];
  crew: User[];
  mealAttendance: MealAttendance[];
  requests: Request[];
  wasteConfig: WasteConfig;
  onMarkServed: (menuId: string, userId: string) => void;
  onRequestAction: (requestId: string, status: 'approved' | 'denied') => void;
  onLogWaste: (count: number) => void;
}

const GalleyDashboard: React.FC<Props> = ({ menus, crew, mealAttendance, requests, wasteConfig, onMarkServed, onRequestAction, onLogWaste }) => {
  // Only show today's menus for the Galley dashboard
  const todayMenus = menus.filter(m => m.date === new Date().toISOString().split('T')[0]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>(todayMenus[0]?.menu_id || '');
  
  // Waste Logging State
  const [wasteCount, setWasteCount] = useState(0);

  const selectedMenu = todayMenus.find(m => m.menu_id === selectedMenuId);

  // Helper to check for dietary conflict logic (simplified)
  const getDietaryConflict = (user: User, menu: Menu | undefined) => {
    if (!menu) return null;
    const restrictedItems = menu.items.filter(item => {
      // Religious
      if (user.dietary_profile.religious_restrictions.avoid_items.includes('pork') && item.dietary_flags.contains_pork) return true;
      if (user.dietary_profile.religious_restrictions.avoid_items.includes('beef') && item.dietary_flags.contains_beef) return true;
      // Allergies (Mock match)
      if (user.dietary_profile.food_allergies.some(a => item.name.toLowerCase().includes(a.toLowerCase()))) return true;
      return false;
    });
    return restrictedItems.length > 0 ? restrictedItems : null;
  };

  const handleWasteSubmit = () => {
    if (wasteCount > 0) {
        onLogWaste(wasteCount);
        setWasteCount(0);
        alert("Waste logged successfully!");
    }
  };

  if (todayMenus.length === 0) {
    return <div className="p-6 text-center text-gray-500">No menus scheduled for today.</div>;
  }

  // Calculate stats for the selected menu
  const crewMembers = crew.filter(c => c.role === 'crew' || c.role === 'admin'); 
  const menuAttendance = mealAttendance.filter(a => a.menu_id === selectedMenuId);
  
  const servedCount = menuAttendance.filter(a => a.status === 'served').length;
  const latePlateCount = menuAttendance.filter(a => a.status === 'late_plate').length;
  const totalCount = crewMembers.length;
  const pendingCount = totalCount - servedCount;

  // Filter requests
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-navy">Galley Dashboard</h2>
        <div className="text-right">
             <p className="text-sm font-bold text-ocean">{new Date().toDateString()}</p>
             <p className="text-xs text-gray-500">Service Mode</p>
        </div>
      </div>

      {/* Menu Selector / Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {todayMenus.map(menu => {
            const isSelected = selectedMenuId === menu.menu_id;
            return (
                <button 
                    key={menu.menu_id}
                    onClick={() => setSelectedMenuId(menu.menu_id)}
                    className={`flex-shrink-0 px-4 py-3 rounded-xl border flex flex-col items-start min-w-[120px] transition-all ${
                        isSelected 
                        ? 'bg-navy text-white border-navy shadow-lg' 
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                >
                    <span className={`text-xs uppercase font-bold mb-1 ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                        {menu.meal_type}
                    </span>
                    <span className="font-bold text-sm">
                        {MEAL_TIMINGS[menu.meal_type] || 'Flexible'}
                    </span>
                </button>
            );
        })}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-500 font-bold uppercase flex items-center justify-center gap-1">
                  <Calculator className="w-3 h-3" /> Total Pax
              </p>
              <p className="text-2xl font-bold text-navy">{totalCount}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-500 font-bold uppercase">Served</p>
              <p className="text-2xl font-bold text-green-600">{servedCount}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-500 font-bold uppercase">Warmer</p>
              <p className="text-2xl font-bold text-orange-500">{latePlateCount}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-xs text-gray-500 font-bold uppercase">Pending</p>
              <p className="text-2xl font-bold text-gray-400">{pendingCount}</p>
          </div>
      </div>

      {/* Daily Waste Log */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <h3 className="font-bold text-red-900 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> Log Food Waste
              </h3>
              <div className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                  1 Bin = {wasteConfig.container_weight_kg} kg / {wasteConfig.container_volume_m3} m³
              </div>
          </div>
          <div className="p-4 flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-4">How many full containers were discharged?</p>
              <div className="flex items-center gap-6 mb-6">
                  <button 
                    onClick={() => setWasteCount(Math.max(0, wasteCount - 1))}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                      <Minus className="w-6 h-6" />
                  </button>
                  <span className="text-4xl font-bold text-navy w-12 text-center">{wasteCount}</span>
                  <button 
                    onClick={() => setWasteCount(wasteCount + 1)}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors"
                  >
                      <Plus className="w-6 h-6" />
                  </button>
              </div>
              <button 
                onClick={handleWasteSubmit}
                disabled={wasteCount === 0}
                className="w-full bg-red-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                  <Save className="w-5 h-5" /> Record Discharge
              </button>
          </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
            <div className="p-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
                <h3 className="font-bold text-orange-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Pending Dietary Requests
                </h3>
                <span className="text-xs font-bold bg-orange-200 text-orange-800 px-2 py-1 rounded-full">{pendingRequests.length}</span>
            </div>
            <div className="divide-y divide-orange-50">
                {pendingRequests.map(req => {
                    const requester = crew.find(c => c.user_id === req.user_id);
                    return (
                        <div key={req.request_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-navy">{requester?.name || 'Unknown User'}</span>
                                    <span className="text-xs text-gray-500">({requester?.rank})</span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{req.detail}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(req.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onRequestAction(req.request_id, 'denied')}
                                    className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                                >
                                    Deny
                                </button>
                                <button
                                    onClick={() => onRequestAction(req.request_id, 'approved')}
                                    className="px-3 py-1.5 text-xs font-bold text-green-600 border border-green-200 rounded-lg hover:bg-green-50 flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" /> Approve
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      )}

      {/* Crew List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-navy flex items-center gap-2">
                  <Users className="w-5 h-5" /> Service List
              </h3>
              <span className="text-xs font-medium text-gray-500">{crewMembers.length} on roster</span>
          </div>
          
          <div className="divide-y divide-gray-100">
              {crewMembers.map(member => {
                  const status = menuAttendance.find(a => a.user_id === member.user_id)?.status || 'standard';
                  const conflicts = getDietaryConflict(member, selectedMenu);
                  const isServed = status === 'served';
                  const isLate = status === 'late_plate';

                  return (
                      <div key={member.user_id} className={`p-4 flex items-center justify-between transition-colors ${isServed ? 'bg-green-50/30' : ''}`}>
                          <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isServed ? 'bg-green-100 text-green-700' : 'bg-ocean text-white'}`}>
                                  {member.name.charAt(0)}
                              </div>
                              <div>
                                  <p className={`font-bold text-sm ${isServed ? 'text-gray-500 line-through' : 'text-navy'}`}>
                                      {member.name}
                                  </p>
                                  <p className="text-xs text-gray-500">{member.rank}</p>
                                  
                                  {conflicts && !isServed && (
                                      <div className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium animate-pulse">
                                          <AlertTriangle className="w-3 h-3" />
                                          <span>Restricted Item: {conflicts[0].name}</span>
                                      </div>
                                  )}
                                  
                                  {isLate && !isServed && (
                                      <div className="flex items-center gap-1 mt-1 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full w-fit">
                                          <Flame className="w-3 h-3" />
                                          <span>Keep in Warmer</span>
                                      </div>
                                  )}
                              </div>
                          </div>

                          <button
                            onClick={() => onMarkServed(selectedMenuId, member.user_id)}
                            disabled={isServed}
                            className={`p-2 rounded-full transition-all ${
                                isServed 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-400 hover:bg-green-500 hover:text-white hover:shadow-lg'
                            }`}
                          >
                              {isServed ? <CheckCircle className="w-6 h-6" /> : <Utensils className="w-6 h-6" />}
                          </button>
                      </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};

export default GalleyDashboard;