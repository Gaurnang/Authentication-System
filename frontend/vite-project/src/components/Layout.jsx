import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
    </div>
  );
}
