import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Menu } from '../types';

interface Props {
  menus: Menu[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const MealCalendar: React.FC<Props> = ({ menus, selectedDate, onDateChange }) => {
  // Initialize view based on selectedDate or today
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(selectedDate);
    return isNaN(d.getTime()) ? new Date() : d;
  });

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const todayDate = today.getDate();

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Generate grid cells
  const renderDays = () => {
    const days = [];
    // Padding for empty start days
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 sm:h-14"></div>);
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = selectedDate === dateStr;
      const isToday = isCurrentMonth && d === todayDate;

      // Find meals for this day to show indicators
      const dayMenus = menus.filter(m => m.date === dateStr);
      const hasBreakfast = dayMenus.some(m => m.meal_type === 'Breakfast');
      const hasLunch = dayMenus.some(m => m.meal_type === 'Lunch');
      const hasDinner = dayMenus.some(m => m.meal_type === 'Dinner');

      days.push(
        <button
          key={d}
          onClick={() => onDateChange(dateStr)}
          className={`h-10 sm:h-14 w-full rounded-lg flex flex-col items-center justify-start pt-1 relative transition-all ${
            isSelected 
              ? 'bg-ocean text-white shadow-md' 
              : isToday 
                ? 'bg-blue-50 text-ocean font-bold border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className={`text-xs sm:text-sm ${isSelected ? 'font-bold' : ''}`}>{d}</span>
          
          <div className="flex gap-0.5 mt-1">
             {hasBreakfast && <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-orange-300' : 'bg-orange-400'}`} />}
             {hasLunch && <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-yellow-300' : 'bg-yellow-400'}`} />}
             {hasDinner && <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-blue-300' : 'bg-blue-900'}`} />}
          </div>
        </button>
      );
    }
    return days;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-bold text-navy text-lg">
          {monthNames[month]} {year}
        </h3>
        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-xs font-bold text-gray-400">{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4 text-[10px] text-gray-500 uppercase tracking-wide">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div> B-Fast</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Lunch</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-900"></div> Dinner</div>
      </div>
    </div>
  );
};

export default MealCalendar;