import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-start">
      <Sidebar />
      <main className="flex-1 lg:ml-0 transition-all duration-300 overflow-x-hidden min-w-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}