"use client";

/**
 * Admin Panel Global Styles Component
 * Applies global CSS for better input visibility across all admin pages
 * Includes dark mode support
 */
export function AdminStyles() {
  return (
    <style jsx global>{`
      /* Admin input field improvements - Light Mode */
      #admin-wrapper input[type="text"],
      #admin-wrapper input[type="email"],
      #admin-wrapper input[type="tel"],
      #admin-wrapper input[type="number"],
      #admin-wrapper input[type="password"],
      #admin-wrapper input[type="search"],
      #admin-wrapper input[type="url"],
      #admin-wrapper input[type="date"],
      #admin-wrapper input[type="time"],
      #admin-wrapper textarea,
      #admin-wrapper select {
        color: #111827 !important;
        font-weight: 600 !important;
      }

      #admin-wrapper input::placeholder,
      #admin-wrapper textarea::placeholder {
        color: #6B7280 !important;
        font-weight: 400 !important;
      }

      #admin-wrapper select option {
        color: #111827 !important;
        background: white !important;
      }

      #admin-wrapper label {
        color: #111827 !important;
        font-weight: 600 !important;
      }

      /* Dark Mode Styles */
      #admin-wrapper.dark input[type="text"],
      #admin-wrapper.dark input[type="email"],
      #admin-wrapper.dark input[type="tel"],
      #admin-wrapper.dark input[type="number"],
      #admin-wrapper.dark input[type="password"],
      #admin-wrapper.dark input[type="search"],
      #admin-wrapper.dark input[type="url"],
      #admin-wrapper.dark input[type="date"],
      #admin-wrapper.dark input[type="time"],
      #admin-wrapper.dark textarea,
      #admin-wrapper.dark select {
        color: #f3f4f6 !important;
        background-color: #374151 !important;
        border-color: #4b5563 !important;
      }

      #admin-wrapper.dark input::placeholder,
      #admin-wrapper.dark textarea::placeholder {
        color: #9ca3af !important;
      }

      #admin-wrapper.dark select option {
        color: #f3f4f6 !important;
        background: #374151 !important;
      }

      #admin-wrapper.dark label {
        color: #f3f4f6 !important;
      }

      /* Dark mode for common elements */
      #admin-wrapper.dark .bg-white {
        background-color: #1f2937 !important;
      }

      #admin-wrapper.dark .bg-gray-50 {
        background-color: #111827 !important;
      }

      #admin-wrapper.dark .bg-gray-100 {
        background-color: #1f2937 !important;
      }

      #admin-wrapper.dark .border-gray-200 {
        border-color: #374151 !important;
      }

      #admin-wrapper.dark .border-gray-300 {
        border-color: #4b5563 !important;
      }

      #admin-wrapper.dark .text-gray-900 {
        color: #f9fafb !important;
      }

      #admin-wrapper.dark .text-gray-800 {
        color: #f3f4f6 !important;
      }

      #admin-wrapper.dark .text-gray-700 {
        color: #e5e7eb !important;
      }

      #admin-wrapper.dark .text-gray-600 {
        color: #d1d5db !important;
      }

      #admin-wrapper.dark .text-gray-500 {
        color: #9ca3af !important;
      }

      #admin-wrapper.dark .hover\\:bg-gray-100:hover {
        background-color: #374151 !important;
      }

      #admin-wrapper.dark .divide-gray-200 > * + * {
        border-color: #374151 !important;
      }

      /* Tailwind dark mode utilities */
      #admin-wrapper.dark .dark\\:bg-gray-800 {
        background-color: #1f2937 !important;
      }

      #admin-wrapper.dark .dark\\:bg-gray-900 {
        background-color: #111827 !important;
      }

      #admin-wrapper.dark .dark\\:text-white {
        color: #ffffff !important;
      }

      #admin-wrapper.dark .dark\\:text-gray-300 {
        color: #d1d5db !important;
      }

      #admin-wrapper.dark .dark\\:border-gray-700 {
        border-color: #374151 !important;
      }
    `}</style>
  );
}
