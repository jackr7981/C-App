import React, { useState } from 'react';
import { MenuItem, Rating } from '../types';
import { Star, X, Smile, Meh, Frown } from 'lucide-react';

interface Props {
  item: MenuItem;
  menuId: string;
  onClose: () => void;
  onSubmit: (rating: Omit<Rating, 'rating_id'>) => void;
}

const RatingModal: React.FC<Props> = ({ item, menuId, onClose, onSubmit }) => {
  const [stars, setStars] = useState(0);
  const [emoji, setEmoji] = useState<Rating['emoji'] | null>(null);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (stars === 0 || !emoji) return;
    onSubmit({
      item_id: item.item_id,
      menu_id: menuId,
      stars,
      emoji,
      comment
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
        </button>

        <div className="p-6 text-center border-b border-gray-100">
            <h2 className="text-xl font-bold text-navy">Rate Meal</h2>
            <p className="text-gray-500 mt-1">How was the <span className="font-bold text-ocean">{item.name}</span>?</p>
        </div>

        <div className="p-6 space-y-6">
            {/* Stars */}
            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                        key={star}
                        onClick={() => setStars(star)}
                        className={`transition-transform hover:scale-110 focus:outline-none ${star <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    >
                        <Star className={`w-8 h-8 ${star <= stars ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>

            {/* Emojis */}
            <div className="grid grid-cols-3 gap-3">
                <button 
                    onClick={() => setEmoji('delicious')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${emoji === 'delicious' ? 'border-fresh bg-orange-50 text-fresh' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                    <Smile className="w-8 h-8" />
                    <span className="text-xs font-bold">Delicious</span>
                </button>
                <button 
                    onClick={() => setEmoji('average')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${emoji === 'average' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                    <Meh className="w-8 h-8" />
                    <span className="text-xs font-bold">Average</span>
                </button>
                <button 
                    onClick={() => setEmoji('bad')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${emoji === 'bad' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                    <Frown className="w-8 h-8" />
                    <span className="text-xs font-bold">Bad</span>
                </button>
            </div>

            {/* Comment */}
            <div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Any comments for the cook?"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent outline-none resize-none h-24 text-sm"
                />
            </div>

            <button 
                onClick={handleSubmit}
                disabled={stars === 0 || !emoji}
                className="w-full bg-ocean text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-ocean/30"
            >
                Submit Feedback
            </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;