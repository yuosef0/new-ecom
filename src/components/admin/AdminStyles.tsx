"use client";

/**
 * Admin Panel Global Styles Component
 * Applies global CSS for better input visibility across all admin pages
 */
export function AdminStyles() {
  return (
    <style jsx global>{`
      /* Admin input field improvements */
      input[type="text"],
      input[type="email"],
      input[type="tel"],
      input[type="number"],
      input[type="password"],
      input[type="search"],
      input[type="url"],
      input[type="date"],
      input[type="time"],
      textarea,
      select {
        color: #111827 !important;
        font-weight: 600 !important;
      }

      input::placeholder,
      textarea::placeholder {
        color: #6B7280 !important;
        font-weight: 400 !important;
      }

      select option {
        color: #111827 !important;
        background: white !important;
      }

      label {
        color: #111827 !important;
        font-weight: 600 !important;
      }
    `}</style>
  );
}
