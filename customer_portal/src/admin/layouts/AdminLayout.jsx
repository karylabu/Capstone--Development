import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex bg-gray-100 min-h-screen">

      <AdminSidebar />

      <div className="flex-1">

        <AdminNavbar />

        <div className="p-6">
          {children}
        </div>

      </div>

    </div>
  );
}