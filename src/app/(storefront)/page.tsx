export default function HomePage() {
  return (
    <div className="px-4 pt-6">
      {/* Hero/Category Scroll Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-cream mb-4">
          Winter Collection
        </h1>
        <p className="text-brand-cream/80">
          Welcome to DXLR - Your premium fashion destination
        </p>
      </div>

      {/* Placeholder for products */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
          >
            <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                Product {i}
              </h3>
              <p className="text-green-500 font-bold text-sm mt-1">
                LE 899.00
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
