export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-burgundy">DXLR</h1>
          <p className="text-brand-charcoal/70 mt-2 text-sm">
            Premium Fashion E-Commerce
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
