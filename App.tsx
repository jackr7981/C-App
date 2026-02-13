import React, { useState, useEffect } from 'react';
import { User, Menu, DietaryProfile, MenuItem, Rating, MealAttendance, Request, Notification, WasteConfig, WasteLog } from './types';
import { MOCK_USER, ADMIN_USER, GALLEY_USER, OFFICER_USER, TODAY_MENUS } from './constants';
import Onboarding from './components/Onboarding';
import MenuDisplay from './components/MenuDisplay';
import Dashboard from './components/Dashboard';
import GalleyDashboard from './components/GalleyDashboard';
import Layout from './components/Layout';
import DietaryAlert from './components/DietaryAlert';
import RatingModal from './components/RatingModal';
import MealCalendar from './components/MealCalendar';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';
import { analyzeMenuImage, analyzeCrewRoster } from './services/geminiService';
import { Settings, ShieldAlert, Check, Calendar as CalendarIcon, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // App view flow: 'login' (via modal) -> 'change_password' (if needed) -> 'onboarding' (if needed) -> 'app'
  const [viewState, setViewState] = useState<'app' | 'change_password' | 'onboarding'>('app');

  const [tab, setTab] = useState<'home' | 'menu' | 'profile'>('home');
  const [showDietaryAlert, setShowDietaryAlert] = useState(false);
  const [alertMenu, setAlertMenu] = useState<Menu | null>(null);
  const [ratingModalData, setRatingModalData] = useState<{item: MenuItem, menuId: string} | null>(null);
  
  // Simulated database
  const [menus, setMenus] = useState<Menu[]>(TODAY_MENUS);
  const [crewList, setCrewList] = useState<User[]>([MOCK_USER, OFFICER_USER]);
  const [userRatings, setUserRatings] = useState<Rating[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [mealAttendance, setMealAttendance] = useState<MealAttendance[]>([]);
  const [requests, setRequests] = useState<Request[]>([
    {
      request_id: 'req_init_1',
      user_id: 'u1',
      menu_id: 'm2',
      type: 'substitution',
      status: 'pending',
      detail: 'Dietary Restriction: Substitute Pork Afritada Stew for Pan Fried Fish',
      timestamp: new Date().toISOString()
    }
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n1',
      title: 'Welcome Aboard',
      message: 'Don\'t forget to complete your dietary profile.',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'info'
    }
  ]);

  // Waste Management State
  const [wasteConfig, setWasteConfig] = useState<WasteConfig>({
      container_volume_m3: 0.05, // Standard 50L bin approx
      container_weight_kg: 25 // Approx weight full
  });
  
  // Initial Mock Data for waste logs to populate chart
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([
      { log_id: 'w1', date: new Date(Date.now() - 86400000 * 3).toISOString(), container_count: 2, total_weight_kg: 50, total_volume_m3: 0.1, logged_by: 'u_galley' },
      { log_id: 'w2', date: new Date(Date.now() - 86400000 * 2).toISOString(), container_count: 3, total_weight_kg: 75, total_volume_m3: 0.15, logged_by: 'u_galley' },
      { log_id: 'w3', date: new Date(Date.now() - 86400000 * 1).toISOString(), container_count: 1, total_weight_kg: 25, total_volume_m3: 0.05, logged_by: 'u_galley' },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);

  // Calendar State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Alert Logic: Check for conflicts whenever user or menus change
  useEffect(() => {
    if (user && viewState === 'app' && user.onboarding_completed && user.role === 'crew') {
      const conflictMenu = menus.find(m => 
        m.items.some(i => {
             // Logic for Muslim Pork Restriction Demo
             if (user.dietary_profile.religious_restrictions.avoid_items.includes('pork') && i.dietary_flags.contains_pork) return true;
             return false;
        })
      );
      if (conflictMenu) {
        setAlertMenu(conflictMenu);
        setShowDietaryAlert(true);
      }
    }
  }, [user, menus, viewState]);

  // Handle Crew Authentication
  const handleCrewLogin = (passport: string, password: string) => {
      const foundUser = crewList.find(u => u.user_id.toLowerCase() === passport.toLowerCase());
      
      if (!foundUser) {
          setLoginError('Passport number not found.');
          return;
      }
      
      if (foundUser.password !== password) {
          setLoginError('Invalid password.');
          return;
      }

      // Login Successful
      setUser(foundUser);
      setShowLogin(false);
      setLoginError('');

      // Determine next flow
      if (!foundUser.password_changed) {
          setViewState('change_password');
      } else if (!foundUser.onboarding_completed) {
          setViewState('onboarding');
      } else {
          setViewState('app');
          setTab('home');
      }
  };

  const handlePasswordChange = (newPassword: string) => {
      if (user) {
          const updatedUser = { ...user, password: newPassword, password_changed: true };
          setUser(updatedUser);
          setCrewList(prev => prev.map(u => u.user_id === user.user_id ? updatedUser : u));
          
          if (!updatedUser.onboarding_completed) {
              setViewState('onboarding');
          } else {
              setViewState('app');
          }
      }
  };

  // Mock quick login for others
  const handleRoleLogin = (role: 'admin' | 'galley' | 'officer') => {
    let baseUser;
    if (role === 'admin') baseUser = ADMIN_USER;
    else if (role === 'galley') baseUser = GALLEY_USER;
    else baseUser = OFFICER_USER;

    setUser(baseUser);
    setViewState('app');
    setTab('home');
  };

  const completeOnboarding = (profile: DietaryProfile) => {
    if (user) {
      const updatedUser = { ...user, onboarding_completed: true, dietary_profile: profile };
      setUser(updatedUser);
      setCrewList(prev => prev.map(u => u.user_id === updatedUser.user_id ? updatedUser : u));
      setViewState('app');
    }
  };

  const addNotification = (title: string, message: string, type: 'info' | 'alert' | 'success' = 'info') => {
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleSubstitute = (original: MenuItem, sub: MenuItem) => {
     if (!user || !alertMenu) return;
     
     const newReq: Request = {
        request_id: `req_${Date.now()}`,
        user_id: user.user_id,
        menu_id: alertMenu.menu_id,
        type: 'substitution',
        status: 'pending',
        detail: `Dietary Conflict: Swap ${original.name} for ${sub.name}`,
        timestamp: new Date().toISOString()
     };
     
     setRequests(prev => [...prev, newReq]);
     setShowDietaryAlert(false);
     alert(`Substitution request sent to Galley: ${original.name} -> ${sub.name}`);
  };

  const handleRequestAction = (requestId: string, status: 'approved' | 'denied') => {
    setRequests(prev => prev.map(r => r.request_id === requestId ? { ...r, status } : r));
    
    // Notify the user who made the request (Simulated since we don't have real-time sockets)
    const req = requests.find(r => r.request_id === requestId);
    if (req) {
        addNotification(
            'Request Update', 
            `Your substitution request has been ${status}.`, 
            status === 'approved' ? 'success' : 'alert'
        );
    }
  };

  const handleRate = (item: MenuItem, menuId: string) => {
    setRatingModalData({ item, menuId });
  };

  const handleSubmitRating = (ratingData: Omit<Rating, 'rating_id'>) => {
    const newRating: Rating = {
      ...ratingData,
      rating_id: Math.random().toString(36).substr(2, 9)
    };
    setUserRatings(prev => [...prev, newRating]);
    setRatingModalData(null);
  };
  
  const handleLike = (item: MenuItem) => {
      setLikedItems(prev => 
          prev.includes(item.item_id) 
              ? prev.filter(id => id !== item.item_id) 
              : [...prev, item.item_id]
      );
  };

  const handleToggleLatePlate = (menuId: string) => {
      if (!user) return;
      setMealAttendance(prev => {
          const existing = prev.find(a => a.menu_id === menuId && a.user_id === user.user_id);
          if (existing) {
              if (existing.status === 'late_plate') {
                  // If unchecking late plate, return to standard (remove attendance record or set to standard)
                  // If it was skipped, switching to late plate overrides it
                  return prev.filter(a => a !== existing); 
              }
              // Switch to late plate
              return prev.map(a => a === existing ? { ...a, status: 'late_plate' as const } : a);
          }
          return [...prev, { menu_id: menuId, user_id: user.user_id, status: 'late_plate' }];
      });
  };

  const handleSkipMeal = (menuId: string) => {
      if (!user) return;
      setMealAttendance(prev => {
          const existing = prev.find(a => a.menu_id === menuId && a.user_id === user.user_id);
          if (existing) {
              if (existing.status === 'skipped') {
                  // Undo skip
                  return prev.filter(a => a !== existing);
              }
              return prev.map(a => a === existing ? { ...a, status: 'skipped' as const } : a);
          }
          return [...prev, { menu_id: menuId, user_id: user.user_id, status: 'skipped' }];
      });
  };

  const handleMarkServed = (menuId: string, userId: string) => {
      setMealAttendance(prev => {
          const existing = prev.find(a => a.menu_id === menuId && a.user_id === userId);
          if (existing) {
              return prev.map(a => a === existing ? { ...a, status: 'served' as const } : a);
          }
          return [...prev, { menu_id: menuId, user_id: userId, status: 'served' }];
      });
  };

  // Waste Management Handlers
  const handleUpdateWasteConfig = (newConfig: WasteConfig) => {
      setWasteConfig(newConfig);
  };

  const handleLogWaste = (count: number) => {
      if (!user) return;
      
      const newLog: WasteLog = {
          log_id: `wl_${Date.now()}`,
          date: new Date().toISOString(),
          container_count: count,
          total_weight_kg: count * wasteConfig.container_weight_kg,
          total_volume_m3: count * wasteConfig.container_volume_m3,
          logged_by: user.user_id
      };
      
      setWasteLogs(prev => [...prev, newLog]);
      addNotification("Waste Logged", `${count} containers recorded.`, 'success');
  };

  // Gemini Handlers
  const handleMenuUpload = async (file: File) => {
      setIsProcessing(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Data = reader.result as string;
            const base64Content = base64Data.split(',')[1]; 
            
            const result = await analyzeMenuImage(base64Content);
            
            if (result) {
                const newMenu: Menu = {
                    menu_id: `m_${Date.now()}`,
                    date: new Date().toISOString().split('T')[0], 
                    meal_type: result.meal_type || 'Lunch',
                    items: result.items.map((i: any, idx: number) => ({
                        ...i,
                        item_id: `gen_${Date.now()}_${idx}`,
                        image_url: `https://picsum.photos/100/100?random=${Date.now() + idx}` 
                    }))
                };
                
                setMenus(prev => [...prev, newMenu]);
                addNotification(
                    'New Menu Added', 
                    `The ${newMenu.meal_type} menu for ${newMenu.date} has been updated. Check it out!`,
                    'success'
                );
                alert("Menu Analyzed Successfully! Added to schedule.");
            } else {
                alert("Failed to analyze menu. Please try again.");
            }
            setIsProcessing(false);
        };
      } catch (e) {
          console.error(e);
          alert("Error uploading menu.");
          setIsProcessing(false);
      }
  };

  const handleCrewUpload = async (file: File) => {
    setIsProcessing(true);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Data = reader.result as string;
            const base64Content = base64Data.split(',')[1];

            const result = await analyzeCrewRoster(base64Content);

            if(result && result.crew_members && Array.isArray(result.crew_members)) {
                const newUsers: User[] = result.crew_members.map((m: any) => ({
                    user_id: m.crew_id || `U${Math.floor(100000 + Math.random() * 900000)}`, // Generate Passport-like ID if missing
                    password: '123456',
                    password_changed: false,
                    name: m.name,
                    rank: m.rank,
                    role: 'crew',
                    onboarding_completed: false,
                    dietary_profile: {
                        food_allergies: [],
                        religious_restrictions: {
                            religion: 'none',
                            avoid_items: [],
                            requires_halal: false,
                            requires_kosher: false,
                        },
                        medical_restrictions: [],
                        lifestyle_preferences: [],
                        dislikes: [],
                    }
                }));

                setCrewList(prev => {
                    const existingIds = new Set(prev.map(u => u.user_id));
                    const uniqueNewUsers = newUsers.filter(u => !existingIds.has(u.user_id));
                    return [...prev, ...uniqueNewUsers];
                });

                addNotification(
                    'Crew List Updated', 
                    `Imported ${newUsers.length} crew members from the roster document.`,
                    'success'
                );
                alert(`Successfully imported ${newUsers.length} crew members!`);
            } else {
                alert("Could not extract crew data from this image. Please ensure it is a clear roster.");
            }
            setIsProcessing(false);
        }
    } catch (e) {
        console.error(e);
        alert("Error analyzing crew roster.");
        setIsProcessing(false);
    }
  }

  // Filter menus for the selected date
  const selectedMenus = menus.filter(m => m.date === selectedDate);

  // --- RENDERING FLOW ---

  // 1. Landing Screen (If not logged in)
  if (!user) {
    return (
      <div className="min-h-screen bg-ocean flex items-center justify-center p-4">
        {showLogin && (
            <Login 
                onLogin={handleCrewLogin} 
                onCancel={() => setShowLogin(false)} 
                error={loginError}
            />
        )}
        
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⚓</div>
          <h1 className="text-2xl font-bold text-navy mb-2">CrewMeal</h1>
          <p className="text-gray-500 mb-8">Maritime Catering Management</p>
          
          <div className="space-y-3">
            <button 
              onClick={() => {
                  setLoginError('');
                  setShowLogin(true);
              }}
              className="w-full bg-fresh text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
            >
              Crew Login
            </button>
            <button 
              onClick={() => handleRoleLogin('officer')}
              className="w-full bg-navy text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors"
            >
              Officer Login
            </button>
            <div className="grid grid-cols-2 gap-3">
                <button 
                onClick={() => handleRoleLogin('galley')}
                className="w-full bg-white text-ocean border-2 border-ocean py-3 rounded-xl font-bold hover:bg-ocean hover:text-white transition-colors"
                >
                Galley
                </button>
                <button 
                onClick={() => handleRoleLogin('admin')}
                className="w-full bg-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                Admin
                </button>
            </div>
          </div>
          <p className="mt-6 text-xs text-gray-400">Powered by Google Gemini</p>
        </div>
      </div>
    );
  }

  // 2. Change Password Flow (First time login)
  if (viewState === 'change_password') {
      return <ChangePassword onConfirm={handlePasswordChange} />;
  }

  // 3. Onboarding Flow
  if (viewState === 'onboarding' || (!user.onboarding_completed && viewState !== 'change_password')) {
    return <Onboarding user={user} onComplete={completeOnboarding} />;
  }

  // 4. Main App
  return (
    <Layout 
      user={user} 
      notifications={notifications}
      onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))}
      onClearNotifications={() => setNotifications([])}
      onLogout={() => {
          setUser(null);
          setViewState('app');
          setShowLogin(false);
      }} 
      currentTab={tab} 
      setTab={setTab}
    >
      
      {/* Global Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-ocean animate-spin mb-3" />
                <p className="font-bold text-navy">Analyzing...</p>
                <p className="text-xs text-gray-500">Processing with Gemini AI</p>
            </div>
        </div>
      )}

      {showDietaryAlert && alertMenu && (
          <DietaryAlert 
            menu={alertMenu} 
            user={user} 
            onConfirmSub={handleSubstitute}
            onClose={() => setShowDietaryAlert(false)} 
          />
      )}

      {ratingModalData && (
        <RatingModal
          item={ratingModalData.item}
          menuId={ratingModalData.menuId}
          onClose={() => setRatingModalData(null)}
          onSubmit={handleSubmitRating}
        />
      )}

      {tab === 'home' && (
        <div className="p-4 space-y-6 pb-24">
            <div className="bg-gradient-to-br from-navy to-ocean rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-2xl font-bold">Good Day, {user.name.split(' ')[0]}!</h2>
                <p className="opacity-80">Next Meal: Lunch at 1200h</p>
                <div className="mt-4 flex gap-3">
                    <div className="bg-white/10 p-3 rounded-lg flex-1 text-center backdrop-blur-sm">
                        <span className="block text-xl font-bold">2400</span>
                        <span className="text-xs opacity-70">Target Kcal</span>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg flex-1 text-center backdrop-blur-sm">
                        <span className="block text-xl font-bold text-lime-400">Healthy</span>
                        <span className="text-xs opacity-70">Status</span>
                    </div>
                </div>
            </div>

            {user.role === 'admin' || user.role === 'officer' ? (
                <Dashboard 
                    menus={menus} 
                    crew={crewList} 
                    userRole={user.role}
                    wasteConfig={wasteConfig}
                    wasteLogs={wasteLogs}
                    onUploadMenu={handleMenuUpload}
                    onUploadCrew={handleCrewUpload}
                    onUpdateWasteConfig={handleUpdateWasteConfig}
                />
            ) : user.role === 'galley' ? (
                <GalleyDashboard 
                    menus={menus}
                    crew={crewList}
                    mealAttendance={mealAttendance}
                    requests={requests}
                    wasteConfig={wasteConfig}
                    onMarkServed={handleMarkServed}
                    onRequestAction={handleRequestAction}
                    onLogWaste={handleLogWaste}
                />
            ) : (
                <div>
                   <h3 className="font-bold text-navy text-lg mb-4">Today's Menus</h3>
                   {menus.filter(m => m.date === new Date().toISOString().split('T')[0]).map(menu => (
                       <MenuDisplay 
                            key={menu.menu_id} 
                            menu={menu} 
                            user={user}
                            userRatings={userRatings}
                            likedItems={likedItems}
                            attendance={mealAttendance.find(a => a.menu_id === menu.menu_id && a.user_id === user.user_id)}
                            onLike={handleLike}
                            onRate={(item) => handleRate(item, menu.menu_id)}
                            onRequest={() => {}}
                            onToggleLatePlate={handleToggleLatePlate}
                            onSkipMeal={handleSkipMeal}
                        />
                   ))}
                </div>
            )}
        </div>
      )}

      {tab === 'menu' && (
          <div className="p-4 pb-24 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-6 h-6 text-ocean" />
                <h3 className="font-bold text-navy text-xl">Meal Schedule</h3>
              </div>
              
              <MealCalendar 
                menus={menus}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />

              <div>
                  <h4 className="font-bold text-gray-500 uppercase text-xs mb-3 tracking-wider">
                      Menu for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h4>
                  
                  {selectedMenus.length > 0 ? (
                      selectedMenus.map(menu => (
                        <MenuDisplay 
                                key={menu.menu_id} 
                                menu={menu} 
                                user={user}
                                userRatings={userRatings}
                                likedItems={likedItems}
                                attendance={mealAttendance.find(a => a.menu_id === menu.menu_id && a.user_id === user.user_id)}
                                onLike={handleLike}
                                onRate={(item) => handleRate(item, menu.menu_id)}
                                onRequest={() => {}}
                                onToggleLatePlate={handleToggleLatePlate}
                                onSkipMeal={handleSkipMeal}
                            />
                      ))
                  ) : (
                      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                          <p className="text-gray-400">No meals scheduled for this date.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {tab === 'profile' && (
          <div className="p-4 pb-24 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-16 h-16 bg-ocean rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user.name.charAt(0)}
                  </div>
                  <div>
                      <h2 className="font-bold text-xl text-navy">{user.name}</h2>
                      <p className="text-gray-500">{user.rank} • {user.user_id}</p>
                  </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-bold text-navy flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-ocean" /> Dietary Restrictions
                      </h3>
                  </div>
                  <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                          <span className="text-gray-600">Religion</span>
                          <span className="font-medium text-navy capitalize">{user.dietary_profile.religious_restrictions.religion}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-gray-600">Allergies</span>
                          <span className="font-medium text-navy">
                              {user.dietary_profile.food_allergies.length ? user.dietary_profile.food_allergies.join(', ') : 'None'}
                          </span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-gray-600">Medical</span>
                          <span className="font-medium text-navy">
                              {user.dietary_profile.medical_restrictions.length ? user.dietary_profile.medical_restrictions.join(', ') : 'None'}
                          </span>
                      </div>
                  </div>
              </div>
              
              <button className="w-full p-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:bg-gray-50">
                  <span className="flex items-center gap-2 text-navy font-medium"><Settings className="w-5 h-5" /> App Settings</span>
              </button>
          </div>
      )}

    </Layout>
  );
};

export default App;