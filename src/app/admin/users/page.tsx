"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { 
  ArrowLeft, Users, Search, Ban, CheckCircle, 
  Loader2, ShieldAlert, Calendar 
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
      `⚠️ Are you sure?\n\nDo you want to ${action} this user?`
    );

    if (!confirmed) return;

    setProcessingId(id);
    try {
      await api.patch(`/users/${id}/ban`, {});
      setUsers(prev => prev.map(u => 
        u._id === id ? { ...u, isBanned: !u.isBanned } : u
      ));
      toast.success(`User ${currentStatus ? 'restored' : 'banned'} successfully`);
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
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 sm:py-12 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin/dashboard" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-2 transition-colors w-fit">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 flex items-center gap-3">
              <Users className="text-zinc-400" /> User Management
            </h1>
            <p className="text-sm sm:text-base text-zinc-500 mt-1">
              Manage student access and account status.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-sm shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
        <div className="hidden md:block bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="p-5">User Info</th>
                <th className="p-5">Joined Date</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-zinc-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900 text-base">{user.name}</span>
                        <span className="text-zinc-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-5 text-zinc-500 font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-5">
                      <StatusBadge isBanned={user.isBanned} />
                    </td>
                    <td className="p-5 text-right">
                      <ActionButton 
                        user={user} 
                        processingId={processingId} 
                        onClick={() => handleToggleBan(user._id, user.isBanned)} 
                      />
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
             <div className="p-8 text-center text-zinc-500 bg-white rounded-xl border border-zinc-200 border-dashed">
                No users found.
             </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user._id} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-zinc-900">{user.name}</h3>
                    <p className="text-sm text-zinc-500">{user.email}</p>
                  </div>
                  <StatusBadge isBanned={user.isBanned} />
                </div>
                
                <div className="flex items-center gap-2 text-xs text-zinc-400 border-t border-zinc-100 pt-3">
                  <Calendar size={12} />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="pt-1">
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
        
        <div className="mt-6 text-center text-xs text-zinc-400">
          Showing {filteredUsers.length} student accounts
        </div>

      </div>
    </div>
  );
}

// --- Helper Components ---

function StatusBadge({ isBanned }: { isBanned: boolean }) {
  return isBanned ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
      <Ban size={12} /> Banned
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <CheckCircle size={12} /> Active
    </span>
  );
}

function ActionButton({ user, processingId, onClick, fullWidth }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={processingId === user._id}
      className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
        fullWidth ? "w-full" : ""
      } ${
        user.isBanned
          ? "bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          : "bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
      }`}
    >
      {processingId === user._id ? (
        <Loader2 size={14} className="animate-spin" />
      ) : user.isBanned ? (
        <>
          <CheckCircle size={14} /> Restore Access
        </>
      ) : (
        <>
          <ShieldAlert size={14} /> Ban User
        </>
      )}
    </button>
  );
}