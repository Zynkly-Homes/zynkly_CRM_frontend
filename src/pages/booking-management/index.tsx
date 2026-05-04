import React from "react";
import { BookOpen } from "lucide-react";
import BookingManagement from "./BookingManagement";

const BookingPage: React.FC = () => (
  <div className="globalPadding">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
        <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Booking Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View, filter and create bookings
        </p>
      </div>
    </div>
    <BookingManagement />
  </div>
);

export default BookingPage;
