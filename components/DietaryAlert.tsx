import React from 'react';
import { Menu, MenuItem, User } from '../types';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface Props {
  menu: Menu;
  user: User;
  onConfirmSub: (original: MenuItem, substitute: MenuItem) => void;
  onClose: () => void;
}

const DietaryAlert: React.FC<Props> = ({ menu, user, onConfirmSub, onClose }) => {
  // Find conflicting items
  const restrictedItems = menu.items.filter(item => {
    if (user.dietary_profile.religious_restrictions.avoid_items.includes('pork') && item.dietary_flags.contains_pork) return true;
    if (user.dietary_profile.religious_restrictions.avoid_items.includes('beef') && item.dietary_flags.contains_beef) return true;
    return false;
  });

  if (restrictedItems.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
        </button>

        <div className="bg-red-50 p-6 text-center border-b border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-navy">Dietary Alert</h2>
            <p className="text-gray-600 mt-2">
                The <span className="font-bold">{menu.meal_type}</span> menu contains items restricted by your profile.
            </p>
        </div>

        <div className="p-6">
            <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Restricted Items Detected</p>
                {restrictedItems.map(item => (
                    <div key={item.item_id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="text-xl">🚫</span>
                        <div>
                            <p className="font-bold text-navy">{item.name}</p>
                            <p className="text-xs text-red-500 font-medium">
                                Contains {item.dietary_flags.contains_pork ? 'Pork' : 'Beef'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Available Alternatives</p>
                <div className="space-y-3">
                    {menu.alternatives?.map(alt => (
                        <button
                            key={alt.item_id}
                            onClick={() => {
                                onConfirmSub(restrictedItems[0], alt);
                                onClose();
                            }}
                            className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-ocean/20 hover:border-ocean hover:bg-ocean/5 transition-all group"
                        >
                            <div className="text-left">
                                <p className="font-bold text-navy group-hover:text-ocean">{alt.name}</p>
                                <p className="text-xs text-gray-500">{alt.estimated_calories} kcal • {alt.dietary_flags.vegetarian ? 'Vegetarian' : 'Meat'}</p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-gray-300 group-hover:text-ocean" />
                        </button>
                    ))}
                    {!menu.alternatives?.length && (
                        <p className="text-center text-gray-500 italic">No alternatives listed. Please contact the cook.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DietaryAlert;