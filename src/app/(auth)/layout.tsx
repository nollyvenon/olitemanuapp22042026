export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#232f3e]"
      style={{ backgroundImage: 'radial-gradient(ellipse at top, #37475a 0%, #232f3e 50%, #131921 100%)' }}
    >
      <div className="w-full max-w-sm px-4">{children}</div>
    </div>
  );
}
