import React, { useState } from 'react';
import { Lock, Check } from 'lucide-react';

interface Props {
  onConfirm: (newPassword: string) => void;
}

const ChangePassword: React.FC<Props> = ({ onConfirm }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
    }
    if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    onConfirm(newPassword);
  };

  return (
    <div className="min-h-screen bg-soft flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-navy">Security Update</h2>
          <p className="text-gray-500 text-sm">Please set a new secure password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm Password</label>
             <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent outline-none"
                required
             />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-ocean text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex justify-center items-center gap-2"
          >
            Update Password <Check className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;