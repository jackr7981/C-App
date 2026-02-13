import React, { useState } from 'react';
import { User } from '../types';
import { Anchor, Lock } from 'lucide-react';

interface Props {
  onLogin: (passport: string, password: string) => void;
  onCancel: () => void;
  error?: string;
}

const Login: React.FC<Props> = ({ onLogin, onCancel, error }) => {
  const [passport, setPassport] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(passport, password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-ocean/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Anchor className="w-8 h-8 text-ocean" />
          </div>
          <h2 className="text-2xl font-bold text-navy">Crew Login</h2>
          <p className="text-gray-500 text-sm">Please identify yourself</p>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Passport Number</label>
            <input 
              type="text" 
              value={passport}
              onChange={(e) => setPassport(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent outline-none uppercase"
              placeholder="e.g. A1234567"
              required
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
             <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent outline-none pr-10"
                  placeholder="••••••"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
             </div>
             <p className="text-[10px] text-gray-400 mt-1 text-right">Default: 123456</p>
          </div>

          <button 
            type="submit"
            className="w-full bg-ocean text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-ocean/30 mt-2"
          >
            Authenticate
          </button>
          
          <button 
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-sm text-gray-400 hover:text-navy"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;