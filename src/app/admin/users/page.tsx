"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { 
  ArrowLeft, Users, Search, Ban, CheckCircle, 
  Loader2, ShieldAlert, Calendar, GraduationCap
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { confirmToast } from "@/components/ConfirmToast"; 

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- Fetch Users ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get<User[]>("/users");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  // --- Handle Ban/Unban ---
  const handleToggleBan = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "restore access for" : "suspend";
    const confirmed = await confirmToast(
      `⚠️ Confirm Action\n\nDo you wish to ${action} this student account?`
    );

    if (!confirmed) return;

    setProcessingId(id);
    try {
      await api.patch(`/users/${id}/ban`, {});
      setUsers(prev => prev.map(u => 
        u._id === id ? { ...u, isBanned: !u.isBanned } : u
      ));
      toast.success(`User access ${currentStatus ? 'restored' : 'suspended'} successfully`);
    } catch (err) {
      toast.error("Failed to update user status");
    } finally {
      setProcessingId(null);
    }
  };

  // --- Filtering ---
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-stone-600">
        <Loader2 className="animate-spin text-orange-700" size={32} />
        <p className="mt-4 font-serif text-lg">Loading Student Directory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8 sm:py-12 sm:px-6 font-sans text-stone-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- Header Section --- */}
        <div>
          <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-bold text-stone-500 hover:text-orange-700 transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-6">
            <div>
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <Users size={20} />
                <span className="text-xs font-bold tracking-widest uppercase">Directory</span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">Student Management</h1>
              <p className="text-stone-500 mt-2 text-lg font-light">
                Monitor student access, account status, and registration details.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-stone-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search name or email..." 
                className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-md leading-5 bg-white placeholder-stone-400 focus:outline-none focus:border-orange-700 focus:ring-1 focus:ring-orange-700 sm:text-sm shadow-sm transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
        <div className="hidden md:block bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden ring-1 ring-black/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100/80 border-b border-stone-200 text-stone-600 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Student Profile</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                     <div className="flex flex-col items-center justify-center">
                        <div className="bg-stone-50 p-4 rounded-full mb-3">
                            <Search className="text-stone-300" size={24} />
                        </div>
                        <p className="text-stone-900 font-serif font-medium text-lg">No users found</p>
                        <p className="text-stone-500 text-sm">Try adjusting your search criteria.</p>
                     </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-orange-50/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 border border-stone-200">
                            <GraduationCap size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-serif font-bold text-stone-900 text-base group-hover:text-orange-800 transition-colors">{user.name}</span>
                          <span className="text-stone-500 text-xs font-mono">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-stone-500 font-medium tabular-nums">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge isBanned={user.isBanned} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end">
                        <ActionButton 
                          user={user} 
                          processingId={processingId} 
                          onClick={() => handleToggleBan(user._id, user.isBanned)} 
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE CARD VIEW (Hidden on Desktop) --- */}
        <div className="md:hidden space-y-4">
          {filteredUsers.length === 0 ? (
             <div className="py-16 text-center text-stone-500 bg-white rounded-lg border border-stone-200 border-dashed">
                <p className="font-serif text-lg text-stone-900">No users found</p>
             </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user._id} className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm space-y-4 relative overflow-hidden">
                {/* Accent Line */}
                <div className={`absolute top-0 left-0 w-1 h-full ${user.isBanned ? 'bg-red-500' : 'bg-emerald-500'}`} />
                
                <div className="flex justify-between items-start pl-2">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-lg">{user.name}</h3>
                    <p className="text-sm text-stone-500 font-mono">{user.email}</p>
                  </div>
                  <StatusBadge isBanned={user.isBanned} />
                </div>
                
                <div className="flex items-center gap-2 text-xs text-stone-400 border-t border-stone-100 pt-3 pl-2">
                  <Calendar size={12} />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="pt-1 pl-2">
                  <ActionButton 
                    user={user} 
                    processingId={processingId} 
                    onClick={() => handleToggleBan(user._id, user.isBanned)} 
                    fullWidth 
                  />
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-6 text-center text-xs text-stone-400 uppercase tracking-widest font-bold">
          Total Students: {filteredUsers.length}
        </div>

      </div>
    </div>
  );
}

// --- Helper Components ---

function StatusBadge({ isBanned }: { isBanned: boolean }) {
  return isBanned ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
      <Ban size={12} /> Suspended
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle size={12} /> Active
    </span>
  );
}

function ActionButton({ user, processingId, onClick, fullWidth }: any) {
  const isProcessing = processingId === user._id;
  
  return (
    <button 
      onClick={onClick}
      disabled={isProcessing}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all border shadow-sm ${
        fullWidth ? "w-full" : ""
      } ${
        user.isBanned
          ? "bg-white border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-stone-900"
          : "bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
      } ${isProcessing ? "opacity-70 cursor-wait" : ""}`}
    >
      {isProcessing ? (
        <Loader2 size={14} className="animate-spin" />
      ) : user.isBanned ? (
        <>
          <CheckCircle size={14} /> Restore Access
        </>
      ) : (
        <>
          <ShieldAlert size={14} /> Suspend User
        </>
      )}
    </button>
  );
}