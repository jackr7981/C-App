import React, { useState } from 'react';
import { User, DietaryProfile } from '../types';
import { Check, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';

interface Props {
  user: User;
  onComplete: (profile: DietaryProfile) => void;
}

const STEPS = 4;

const Onboarding: React.FC<Props> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<DietaryProfile>(user.dietary_profile);

  const handleNext = () => {
    if (step < STEPS) {
      setStep(step + 1);
    } else {
      onComplete(profile);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleAllergy = (allergy: string) => {
    setProfile(prev => {
      const exists = prev.food_allergies.includes(allergy);
      return {
        ...prev,
        food_allergies: exists 
          ? prev.food_allergies.filter(a => a !== allergy)
          : [...prev.food_allergies, allergy]
      };
    });
  };

  const setReligion = (religion: DietaryProfile['religious_restrictions']['religion']) => {
    let avoid: string[] = [];
    let halal = false;
    let kosher = false;

    if (religion === 'muslim') {
      avoid = ['pork', 'alcohol'];
      halal = true;
    } else if (religion === 'hindu') {
      avoid = ['beef'];
    } else if (religion === 'jewish') {
      avoid = ['pork', 'shellfish'];
      kosher = true;
    }

    setProfile(prev => ({
      ...prev,
      religious_restrictions: {
        religion,
        avoid_items: avoid,
        requires_halal: halal,
        requires_kosher: kosher,
      }
    }));
  };

  const commonAllergies = ['Peanuts', 'Shellfish', 'Dairy', 'Eggs', 'Soy', 'Gluten', 'Fish'];

  return (
    <div className="min-h-screen bg-soft flex flex-col p-4 md:p-8">
      <div className="max-w-lg mx-auto w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[80vh] md:h-auto">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 w-full">
          <div 
            className="h-full bg-ocean transition-all duration-300 ease-out"
            style={{ width: `${(step / STEPS) * 100}%` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-navy mb-1">Welcome, {user.name}! 👋</h2>
          <p className="text-sm text-gray-500 mb-6">Step {step} of {STEPS}</p>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-ocean">Do you have any food allergies?</h3>
              <p className="text-sm text-gray-500">Select all that apply. This is critical for your safety.</p>
              
              <div className="grid grid-cols-1 gap-3">
                {commonAllergies.map(allergy => (
                  <button
                    key={allergy}
                    onClick={() => toggleAllergy(allergy)}
                    className={`p-4 rounded-lg border-2 flex items-center justify-between transition-colors ${
                      profile.food_allergies.includes(allergy)
                        ? 'border-fresh bg-fresh/10 text-navy'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <span className="font-medium">{allergy}</span>
                    {profile.food_allergies.includes(allergy) && <Check className="w-5 h-5 text-fresh" />}
                  </button>
                ))}
                <button
                   onClick={() => setProfile({...profile, food_allergies: []})}
                   className={`p-4 rounded-lg border-2 text-center ${profile.food_allergies.length === 0 ? 'border-lime bg-lime/10 text-navy' : 'border-gray-100'}`}
                >
                  No Allergies
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-ocean">Religious Dietary Preferences</h3>
              <p className="text-sm text-gray-500">We will alert you if menu items conflict with your beliefs.</p>

              <div className="space-y-3">
                {[
                  { id: 'muslim', label: 'Muslim (Halal / No Pork)', icon: '☪️' },
                  { id: 'hindu', label: 'Hindu (No Beef)', icon: '🕉️' },
                  { id: 'jewish', label: 'Jewish (Kosher)', icon: '✡️' },
                  { id: 'buddhist', label: 'Buddhist (Vegetarian)', icon: '☸️' },
                  { id: 'none', label: 'None', icon: '⚪' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setReligion(opt.id as any)}
                    className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 text-left transition-colors ${
                      profile.religious_restrictions.religion === opt.id
                        ? 'border-ocean bg-ocean/5'
                        : 'border-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="font-medium">{opt.label}</span>
                    {profile.religious_restrictions.religion === opt.id && (
                      <Check className="w-5 h-5 text-ocean ml-auto" />
                    )}
                  </button>
                ))}
              </div>

              {profile.religious_restrictions.religion !== 'none' && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>You will receive automatic alerts 24h before meals containing prohibited items.</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-ocean">Medical Restrictions</h3>
               <p className="text-sm text-gray-500">Doctor-prescribed diets.</p>
               <div className="grid grid-cols-1 gap-3">
                 {['Low Sodium', 'Low Sugar (Diabetic)', 'Low Fat', 'High Protein'].map(med => (
                    <button
                      key={med}
                      onClick={() => {
                        const exists = profile.medical_restrictions.includes(med);
                        setProfile(p => ({
                          ...p,
                          medical_restrictions: exists ? p.medical_restrictions.filter(x => x !== med) : [...p.medical_restrictions, med]
                        }));
                      }}
                      className={`p-4 rounded-lg border-2 text-left ${profile.medical_restrictions.includes(med) ? 'border-ocean bg-ocean/5' : 'border-gray-100'}`}
                    >
                      {med}
                    </button>
                 ))}
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-ocean">Lifestyle & Dislikes</h3>
              <p className="text-sm text-gray-500">Optional preferences.</p>
               <div className="grid grid-cols-2 gap-3">
                 {['Vegetarian', 'Vegan', 'Pescatarian', 'Gluten Free'].map(pref => (
                    <button
                      key={pref}
                      onClick={() => {
                        const exists = profile.lifestyle_preferences.includes(pref);
                        setProfile(p => ({
                          ...p,
                          lifestyle_preferences: exists ? p.lifestyle_preferences.filter(x => x !== pref) : [...p.lifestyle_preferences, pref]
                        }));
                      }}
                      className={`p-3 rounded-lg border-2 text-sm font-medium ${profile.lifestyle_preferences.includes(pref) ? 'border-lime bg-lime/10 text-navy' : 'border-gray-100'}`}
                    >
                      {pref}
                    </button>
                 ))}
               </div>
               
               <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                 <h4 className="font-semibold mb-2">Summary</h4>
                 <ul className="text-sm space-y-1 text-gray-600">
                    <li>🚫 Allergies: {profile.food_allergies.length > 0 ? profile.food_allergies.join(', ') : 'None'}</li>
                    <li>☪️ Religion: {profile.religious_restrictions.religion}</li>
                    <li>💊 Medical: {profile.medical_restrictions.length > 0 ? profile.medical_restrictions.join(', ') : 'None'}</li>
                 </ul>
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex justify-between bg-white">
          <button 
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-3 rounded-lg font-medium ${step === 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="bg-ocean text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-ocean/30 flex items-center gap-2 active:scale-95 transition-transform"
          >
            {step === STEPS ? 'Complete Profile' : 'Next'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;