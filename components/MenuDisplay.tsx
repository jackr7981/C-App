import React, { useState } from 'react';
import { Menu, MenuItem, User, Rating, MealAttendance } from '../types';
import { Star, Clock, AlertTriangle, Utensils, Heart, CalendarClock, Ban, Flame } from 'lucide-react';
import { MEAL_TIMINGS } from '../constants';

interface Props {
  menu: Menu;
  user: User;
  userRatings?: Rating[];
  likedItems: string[];
  attendance?: MealAttendance; // Current status for this user/menu
  onLike: (item: MenuItem) => void;
  onRate: (item: MenuItem) => void;
  onRequest: (menu: Menu) => void;
  onToggleLatePlate: (menuId: string) => void;
  onSkipMeal: (menuId: string) => void;
}

const MenuDisplay: React.FC<Props> = ({ 
  menu, user, userRatings = [], likedItems = [], attendance, 
  onLike, onRate, onRequest, onToggleLatePlate, onSkipMeal 
}) => {
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const isPast = new Date() > new Date(menu.date + 'T20:00:00'); // Rough simplified check
  
  // Get specific timing string
  const timing = MEAL_TIMINGS[menu.meal_type] || 'Flexible';

  // Calculate Total Calories
  const totalCalories = menu.items.reduce((sum, item) => sum + item.estimated_calories, 0);
  const isHighCalorie = totalCalories > 1000;

  // Quick check for dietary conflicts to show icon on card
  const hasConflict = (item: MenuItem) => {
    const { dietary_profile } = user;
    if (dietary_profile.religious_restrictions.avoid_items.includes('pork') && item.dietary_flags.contains_pork) return true;
    if (dietary_profile.religious_restrictions.avoid_items.includes('beef') && item.dietary_flags.contains_beef) return true;
    // Simple check for allergens would go here
    return false;
  };

  const isLatePlate = attendance?.status === 'late_plate';
  const isSkipped = attendance?.status === 'skipped';

  const handleSkipAction = () => {
    if (isSkipped) {
      onSkipMeal(menu.menu_id);
    } else {
      setShowSkipConfirm(true);
    }
  };

  return (
    <>
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-opacity ${isSkipped ? 'opacity-60 grayscale-[0.8]' : ''}`}>
        <div className={`p-4 flex justify-between items-center text-white ${isSkipped ? 'bg-gray-500' : 'bg-gradient-to-r from-ocean to-blue-800'}`}>
          <div className="flex items-center gap-2">
              {menu.meal_type === 'Breakfast' ? '🌅' : menu.meal_type === 'Lunch' ? '🌞' : '🌙'}
              <h3 className="font-bold text-lg">{menu.meal_type}</h3>
              {isSkipped && <span className="text-xs bg-white text-gray-500 px-2 py-0.5 rounded-full font-bold ml-2">SKIPPED</span>}
          </div>
          <div className="text-blue-100 text-sm flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{timing}</span>
          </div>
        </div>

        {/* Action Buttons for Crew */}
        {user.role === 'crew' && (
           <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between gap-2">
               <div className="flex items-center gap-1.5 text-sm text-blue-900 overflow-hidden">
                   <CalendarClock className="w-4 h-4 flex-shrink-0" />
                   <span className="truncate">Status: {isLatePlate ? 'Late Plate Requested' : isSkipped ? 'Meal Skipped' : 'Standard'}</span>
               </div>
               
               <div className="flex gap-2 shrink-0">
                 <button 
                    onClick={handleSkipAction}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${
                        isSkipped
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-red-400 hover:text-red-500'
                    }`}
                 >
                     <Ban className="w-3 h-3" />
                     {isSkipped ? 'Skipped' : 'Skip'}
                 </button>

                 <button 
                    onClick={() => onToggleLatePlate(menu.menu_id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${
                        isLatePlate 
                        ? 'bg-fresh text-white border-fresh shadow-sm' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-fresh hover:text-fresh'
                    }`}
                 >
                     <Flame className="w-3 h-3" />
                     {isLatePlate ? 'Warmer' : 'Late Plate'}
                 </button>
               </div>
           </div>
        )}

        <div className="p-4 space-y-4">
          {menu.items.map((item) => {
              const conflict = hasConflict(item);
              const userRating = userRatings.find(r => r.item_id === item.item_id && r.menu_id === menu.menu_id);
              const isLiked = likedItems.includes(item.item_id);

              return (
                  <div key={item.item_id} className="flex gap-4 items-start relative">
                      <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover bg-gray-200 flex-shrink-0"
                      />
                      <div className="flex-1">
                          <div className="flex justify-between items-start">
                              <h4 className="font-bold text-navy">{item.name}</h4>
                              <div className="flex items-center gap-2">
                                  <button
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          onLike(item);
                                      }}
                                      className="p-1 rounded-full hover:bg-red-50 transition-colors group"
                                      title={isLiked ? "Unlike" : "Like"}
                                  >
                                      <Heart 
                                          className={`w-5 h-5 transition-all ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-300 group-hover:text-red-400'}`} 
                                      />
                                  </button>
                                  {conflict && (
                                      <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                                  )}
                              </div>
                          </div>
                          <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs font-medium text-gray-400">
                               <span>🔥 {item.estimated_calories} kcal</span>
                               {item.dietary_flags.vegetarian && <span className="text-green-600 bg-green-50 px-1 rounded">Veg</span>}
                               {item.dietary_flags.halal_compliant && <span className="text-ocean bg-blue-50 px-1 rounded">Halal</span>}
                          </div>
                      </div>
                      
                      {userRating ? (
                          <div className="absolute bottom-1 right-0 flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100 shadow-sm animate-in fade-in zoom-in duration-300">
                              <span className="text-sm">{userRating.emoji === 'delicious' ? '😋' : userRating.emoji === 'average' ? '😐' : '🤢'}</span>
                              <div className="flex items-center text-yellow-600 font-bold text-xs">
                                  <span>{userRating.stars}</span>
                                  <Star className="w-3 h-3 fill-current ml-0.5" />
                              </div>
                          </div>
                      ) : (
                          <button 
                              onClick={() => onRate(item)}
                              className="absolute bottom-0 right-0 p-2 text-gray-300 hover:text-fresh transition-colors"
                              title="Rate this item"
                          >
                              <Star className="w-5 h-5" />
                          </button>
                      )}
                  </div>
              );
          })}
        </div>

        <div className="bg-gray-50 border-t border-gray-100">
            <div className="px-4 py-2 flex justify-between items-center border-b border-gray-100 bg-white">
                <span className="text-xs font-bold text-gray-500 uppercase">Total Calories</span>
                <span className={`font-bold ${isHighCalorie ? 'text-orange-600' : 'text-gray-700'}`}>
                    {totalCalories} kcal
                    {isHighCalorie && <span className="ml-1 text-xs text-orange-500 font-normal">(High)</span>}
                </span>
            </div>

            <div className="p-3 flex justify-between">
              <button 
                  onClick={() => onRate(menu.items[0])}
                  className="text-sm text-gray-600 font-medium hover:text-ocean flex items-center gap-1"
              >
                  <Star className="w-4 h-4" /> Rate Meal
              </button>
              <button 
                  onClick={() => onRequest(menu)}
                  className="text-sm text-ocean font-medium hover:text-blue-800 flex items-center gap-1"
              >
                  <Utensils className="w-4 h-4" /> Substitutions
              </button>
            </div>
        </div>
      </div>

      {showSkipConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ban className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-navy mb-2">Skip this Meal?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to skip <strong>{menu.meal_type}</strong>? This helps the galley reduce food waste, but ensure you have enough food.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSkipConfirm(false)}
                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onSkipMeal(menu.menu_id);
                  setShowSkipConfirm(false);
                }}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
              >
                Yes, Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuDisplay;