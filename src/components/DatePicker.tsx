import React from "react";

type DatePickerProps = {
  date: string | null;
  onDateChange: (date: string) => void;
};

const DatePicker: React.FC<DatePickerProps> = ({ date, onDateChange }) => {
  return (
    <div className="mb-4 w-full">
      <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
        Select Date
      </label>
      <input
        type="date"
        id="date"
        value={date || ""}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        required
      />
    </div>
  );
};

export default DatePicker;
