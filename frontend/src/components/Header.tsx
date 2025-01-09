import React from 'react';
import { Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../hooks/useAuth'; // Import useAuth hook

export function Header() {
  const { logout } = useAuth(); // Access the logout function

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Guardian Mesh
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button
            onClick={logout} // Logout when button is clicked
            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
