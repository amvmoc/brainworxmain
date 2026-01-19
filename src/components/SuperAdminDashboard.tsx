import { useState, useEffect } from 'react';
import { LogOut, Users, TrendingUp, FileText, DollarSign, LayoutDashboard, Eye, Search, UserPlus, Mail, Shield, Edit2, Loader, RefreshCw, Ticket, Trash2, Key, Calendar, Share2, Send, Download, Brain } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { InvoicesPage } from './InvoicesPage';
import { LibraryManagement } from './LibraryManagement';
import { CouponManagement } from './CouponManagement';
import { CalendarManagement } from './CalendarManagement';
import { BookingManagement } from './BookingManagement';
import { HomePage } from './HomePage';
import { ADHD1118AssessmentsManagement } from './ADHD1118AssessmentsManagement';
import { SelfAssessmentReport } from './SelfAssessmentReport';
import CoachReport from './coach-report/CoachReport';
import NIP3CoachReport from './nip3/CoachReport';
import { generateCoachReportData } from '../utils/coachReportGenerator';
import { selfAssessmentTypes } from '../data/selfAssessmentQuestions';

interface SuperAdminDashboardProps {
  franchiseOwnerId: string;
  franchiseOwnerName: string;
  onLogout: () => void;
}

interface SalesLog {
  id: string;
  franchise_owner_id: string;
  customer_name: string;
  customer_email: string;
  assessment_type: string;
  amount: number;
  status: string;
  created_at: string;
  franchise_owner?: {
    name: string;
    unique_link_code: string;
  };
}

export function SuperAdminDashboard({ franchiseOwnerId, franchiseOwnerName, onLogout }: SuperAdminDashboardProps) {
  const [currentView, setCurrentView] = useState<'overview' | 'sales' | 'test-results' | 'invoices' | 'calendar' | 'users' | 'library' | 'coupons' | 'visitor_view'>('overview');
  const [testResultsTab, setTestResultsTab] = useState<'nip3' | 'self-assessments' | 'adhd-710' | 'adhd-1118' | 'trauma-scan'>('nip3');
  const [calendarTab, setCalendarTab] = useState<'availability' | 'bookings'>('bookings');
  const [salesLogs, setSalesLogs] = useState<SalesLog[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [selfAssessments, setSelfAssessments] = useState<any[]>([]);
  const [adhd710Assessments, setAdhd710Assessments] = useState<any[]>([]);
  const [adhd1118Assessments, setAdhd1118Assessments] = useState<any[]>([]);
  const [franchiseUsers, setFranchiseUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingTestReport, setViewingTestReport] = useState<any>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState('');
  const [editUserError, setEditUserError] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    uniqueLinkCode: '',
    role: 'franchise_owner' as 'franchise_owner' | 'super_admin'
  });
  const [editUser, setEditUser] = useState({
    email: '',
    name: '',
    uniqueLinkCode: '',
    role: 'franchise_owner' as 'franchise_owner' | 'super_admin'
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTest, setShareTest] = useState<any>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [showDeleteTestModal, setShowDeleteTestModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (viewingTestReport) {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewingTestReport]);

  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleShareReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail || !shareTest) return;

    setShareLoading(true);
    try {
      // Check if this is a NIP3 assessment (344 questions)
      const isNIP3 = shareTest.analysis_results?.totalQuestions === 344;

      if (isNIP3) {
        // Use NIP3 email function
        const results = shareTest.analysis_results.neuralImprintPatternScores.map((nip: any) => ({
          code: nip.code,
          shortName: nip.name,
          percentage: nip.score,
          actualScore: nip.actualScore,
          maxScore: nip.maxScore,
          totalQuestions: nip.totalQuestions,
          level: nip.score >= 70 ? 'Strongly Present' : nip.score >= 50 ? 'Moderately Present' : nip.score >= 30 ? 'Mild Pattern' : 'Minimal Pattern'
        }));

        const { error } = await supabase.functions.invoke('send-nip3-results', {
          body: {
            recipients: [shareEmail],
            results: results,
            completedAt: shareTest.completed_at
          }
        });

        if (error) throw error;
      } else {
        // Use original email function for NIPA assessments
        const { error } = await supabase.functions.invoke('send-analysis-email', {
          body: {
            responseId: shareTest.id,
            recipientEmail: shareEmail
          }
        });

        if (error) throw error;
      }

      alert(`Report sent successfully to ${shareEmail}!`);
      setShowShareModal(false);
      setShareTest(null);
      setShareEmail('');
    } catch (error: any) {
      alert('Failed to send report: ' + error.message);
    } finally {
      setShareLoading(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!testToDelete) return;

    setDeleteLoading(true);
    try {
      const tableName = testToDelete.type === 'nipa' ? 'responses' : 'self_assessment_responses';

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', testToDelete.id);

      if (error) throw error;

      alert('Assessment deleted successfully!');
      setShowDeleteTestModal(false);
      setTestToDelete(null);
      loadAllData();
    } catch (error: any) {
      alert('Failed to delete assessment: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [salesData, responsesData, selfAssessmentsData, adhd710Data, adhd1118Data, usersData] = await Promise.all([
        supabase
          .from('sales_log')
          .select(`
            *,
            franchise_owner:franchise_owners(name, unique_link_code)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('responses')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('self_assessment_responses')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('adhd_assessments')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('adhd_1118_assessments')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('franchise_owners')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      setSalesLogs(salesData.data || []);
      setResponses(responsesData.data || []);
      setSelfAssessments(selfAssessmentsData.data || []);
      setAdhd710Assessments(adhd710Data.data || []);
      setAdhd1118Assessments(adhd1118Data.data || []);
      setFranchiseUsers(usersData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');
    setAddUserLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-franchise-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setShowAddUserModal(false);
      setNewUser({
        email: '',
        password: '',
        name: '',
        uniqueLinkCode: '',
        role: 'franchise_owner'
      });

      await loadAllData();
      alert('User created successfully!');
    } catch (error: any) {
      setAddUserError(error.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditUserError('');
    setEditUserLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('franchise_owners')
        .update({
          email: editUser.email,
          name: editUser.name,
          unique_link_code: editUser.uniqueLinkCode,
          is_super_admin: editUser.role === 'super_admin'
        })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      setShowEditUserModal(false);
      setSelectedUser(null);
      await loadAllData();
      alert('User updated successfully!');
    } catch (error: any) {
      setEditUserError(error.message);
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) {
      alert('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setAddUserLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user-password`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setShowEditPasswordModal(false);
      setSelectedUser(null);
      setNewPassword('');
      alert('Password updated successfully!');
    } catch (error: any) {
      console.error('Error updating password:', error);
      alert('Failed to update password: ' + error.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setAddUserLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-franchise-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: selectedUser.user_id,
            franchiseOwnerId: selectedUser.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setShowDeleteUserModal(false);
      setSelectedUser(null);
      await loadAllData();
      alert('User deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  const stats = {
    totalSales: salesLogs.length,
    totalRevenue: salesLogs
      .filter(log => log.status === 'paid')
      .reduce((sum, log) => sum + Number(log.amount), 0),
    completedAssessments: responses.filter(r => r.status === 'analyzed' || r.status === 'sent').length + selfAssessments.filter(s => s.status === 'completed' || s.status === 'analyzed').length,
    pendingAssessments: responses.filter(r => r.status === 'in_progress').length + selfAssessments.filter(s => s.status === 'in_progress').length
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSalesLogs = salesLogs.filter(log => {
    const matchesSearch = searchTerm === '' ||
      log.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.franchise_owner?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2A5E] to-[#3DB3E3]">
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">BrainWorx Super Admin</h1>
              <p className="text-[#E6E9EF]">{franchiseOwnerName} <span className="text-xs text-white/50 ml-2">v1.0.3</span></p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto">
            <button
              onClick={() => setCurrentView('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentView === 'overview'
                  ? 'bg-white text-[#0A2A5E] font-semibold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <LayoutDashboard size={20} />
              Overview
            </button>
            <button
              onClick={() => setCurrentView('sales')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentView === 'sales'
                  ? 'bg-white text-[#0A2A5E] font-semibold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <DollarSign size={20} />
              All Sales
            </button>
            <button
              onClick={() => setCurrentView('test-results')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentView === 'test-results'
                  ? 'bg-white text-[#0A2A5E] font-semibold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <FileText size={20} />
              Test Results
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentView === 'calendar'
                  ? 'bg-white text-[#0A2A5E] font-semibold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Calendar size={20} />
              Calendar
            </button>
            <button
              onClick={() => setCurrentView('invoices')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentView === 'invoices'
                  ? 'bg-white text-[#0A2A5E] font-semibold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <FileText size={20} />
              All Invoices
            </button>
            <button
              onClick={() => setCurrentView('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentView === 'users'
                  ? 'bg-white text-[#0A2A5E] font-semibold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <UserPlus size={20} />
              Manage Users
            </button>
            <button
              onClick={() => setCurrentView('library')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentView === 'library'
                  ? 'bg-white text-[#0A2A5E] font-semibold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <FileText size={20} />
              Library
            </button>
            <button
              onClick={() => setCurrentView('coupons')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentView === 'coupons'
                  ? 'bg-white text-[#0A2A5E] font-semibold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Ticket size={20} />
              Coupons
            </button>
            <button
              onClick={() => setCurrentView('visitor_view')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentView === 'visitor_view'
                  ? 'bg-white text-[#0A2A5E] font-semibold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Eye size={20} />
              Visitor View
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'overview' && (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 font-medium">Total Sales</h3>
                  <DollarSign className="text-[#3DB3E3]" size={24} />
                </div>
                <p className="text-3xl font-bold text-[#0A2A5E]">{stats.totalSales}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 font-medium">Total Revenue</h3>
                  <TrendingUp className="text-[#1FAFA3]" size={24} />
                </div>
                <p className="text-3xl font-bold text-[#0A2A5E]">{formatCurrency(stats.totalRevenue)}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 font-medium">Completed</h3>
                  <Users className="text-green-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-[#0A2A5E]">{stats.completedAssessments}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 font-medium">In Progress</h3>
                  <TrendingUp className="text-orange-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-[#0A2A5E]">{stats.pendingAssessments}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-[#0A2A5E] mb-6">Recent Sales Activity</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#E6E9EF] border-b-2 border-[#0A2A5E]">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Franchise Holder</th>
                      <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Customer</th>
                      <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Assessment Type</th>
                      <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesLogs.slice(0, 10).map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-[#0A2A5E]">
                          {log.franchise_owner?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-800">{log.customer_name}</p>
                            <p className="text-sm text-gray-500">{log.customer_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{log.assessment_type}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            log.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : log.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : log.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(log.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {currentView === 'sales' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">All Sales Logs</h2>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by customer, FH name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="lead">Lead</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#E6E9EF] border-b-2 border-[#0A2A5E]">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Franchise Holder</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Customer</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Assessment Type</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalesLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#0A2A5E]">{log.franchise_owner?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{log.franchise_owner?.unique_link_code}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{log.customer_name}</p>
                          <p className="text-sm text-gray-500">{log.customer_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{log.assessment_type}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {formatCurrency(log.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          log.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : log.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : log.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(log.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'invoices' && (
          <InvoicesPage franchiseOwnerId="super_admin_all" />
        )}

        {currentView === 'calendar' && (
          <div className="space-y-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setCalendarTab('bookings')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  calendarTab === 'bookings'
                    ? 'bg-[#0A2A5E] text-white'
                    : 'bg-white text-[#0A2A5E] hover:bg-gray-100'
                }`}
              >
                All Bookings
              </button>
              <button
                onClick={() => setCalendarTab('availability')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  calendarTab === 'availability'
                    ? 'bg-[#0A2A5E] text-white'
                    : 'bg-white text-[#0A2A5E] hover:bg-gray-100'
                }`}
              >
                Manage Availability
              </button>
            </div>
            {calendarTab === 'bookings' ? (
              <BookingManagement franchiseOwnerId="super_admin_all" />
            ) : (
              <CalendarManagement franchiseOwnerId={franchiseOwnerId} />
            )}
          </div>
        )}

        {currentView === 'users' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0A2A5E]">Manage Franchise Users</h2>
              <button
                onClick={() => {
                  setNewUser({
                    email: '',
                    password: '',
                    name: '',
                    uniqueLinkCode: generateUniqueCode(),
                    role: 'franchise_owner'
                  });
                  setShowAddUserModal(true);
                }}
                className="flex items-center gap-2 bg-[#0A2A5E] text-white px-4 py-2 rounded-lg hover:bg-[#3DB3E3] transition-all"
              >
                <UserPlus size={20} />
                Add New User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#E6E9EF] border-b-2 border-[#0A2A5E]">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Email</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Link Code</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Role</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Created</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {franchiseUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-800">{user.name}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{user.unique_link_code}</code>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_super_admin ? (
                          <span className="flex items-center gap-1 text-orange-600 font-semibold">
                            <Shield size={16} />
                            Super Admin
                          </span>
                        ) : (
                          <span className="text-gray-600">Franchise Holder</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setEditUser({
                                email: user.email,
                                name: user.name,
                                uniqueLinkCode: user.unique_link_code,
                                role: user.is_super_admin ? 'super_admin' : 'franchise_owner'
                              });
                              setEditUserError('');
                              setShowEditUserModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setNewPassword('');
                              setShowEditPasswordModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Change Password"
                          >
                            <Key size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteUserModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'library' && (
          <LibraryManagement />
        )}

        {currentView === 'coupons' && (
          <CouponManagement />
        )}

        {currentView === 'test-results' && (
          <div className="space-y-6">
            {/* Sub-navigation tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setTestResultsTab('nip3')}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  testResultsTab === 'nip3'
                    ? 'bg-[#0A2A5E] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                NIP3 (344Q)
              </button>
              <button
                onClick={() => setTestResultsTab('self-assessments')}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  testResultsTab === 'self-assessments'
                    ? 'bg-[#0A2A5E] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Self Assessments
              </button>
              <button
                onClick={() => setTestResultsTab('adhd-710')}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  testResultsTab === 'adhd-710'
                    ? 'bg-[#0A2A5E] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                ADHD 7-10
              </button>
              <button
                onClick={() => setTestResultsTab('adhd-1118')}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  testResultsTab === 'adhd-1118'
                    ? 'bg-[#0A2A5E] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                ADHD 11-18
              </button>
              <button
                onClick={() => setTestResultsTab('trauma-scan')}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  testResultsTab === 'trauma-scan'
                    ? 'bg-[#0A2A5E] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Trauma Scan
              </button>
            </div>

            {/* NIP3 Tab */}
            {testResultsTab === 'nip3' && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">NIP3 Assessments (344 Questions)</h2>
                {responses.filter(r => (r.status === 'completed' || r.status === 'analyzed' || r.status === 'sent') && (r.analysis_results?.totalQuestions === 344 || r.completed_at)).length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-600">No NIP3 assessments yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#E6E9EF] border-b-2 border-[#0A2A5E]">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Client Name</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Email</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Score</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Completed</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {responses
                          .filter(r => (r.status === 'completed' || r.status === 'analyzed' || r.status === 'sent') && (r.analysis_results?.totalQuestions === 344 || r.completed_at))
                          .map((test) => (
                            <tr key={test.id} className="border-b hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-[#0A2A5E]">{test.customer_name}</td>
                              <td className="px-6 py-4 text-gray-600">{test.customer_email}</td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-[#3DB3E3]">
                                  {test.analysis_results?.overallScore || 'N/A'}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(test.completed_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setViewingTestReport({ ...test, type: 'nipa' })}
                                    className="bg-[#3DB3E3] text-white px-4 py-2 rounded-lg hover:bg-[#1FAFA3] transition-colors font-medium flex items-center gap-2"
                                  >
                                    <Eye size={16} />
                                    View
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShareTest({ ...test, type: 'nipa' });
                                      setShareEmail(test.customer_email);
                                      setShowShareModal(true);
                                    }}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <Send size={16} />
                                    Send Email
                                  </button>
                                  <button
                                    onClick={() => {
                                      setTestToDelete({ ...test, type: 'nipa' });
                                      setShowDeleteTestModal(true);
                                    }}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Self Assessments Tab */}
            {testResultsTab === 'self-assessments' && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Self Assessments</h2>
                {selfAssessments.filter(s => s.status === 'completed' || s.status === 'analyzed').length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-600">No self assessments yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#E6E9EF] border-b-2 border-[#0A2A5E]">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Client Name</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Email</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Assessment Type</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Score</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Completed</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selfAssessments
                          .filter(s => s.status === 'completed' || s.status === 'analyzed')
                          .map((test) => (
                            <tr key={test.id} className="border-b hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-[#0A2A5E]">{test.customer_name}</td>
                              <td className="px-6 py-4 text-gray-600">{test.customer_email}</td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                                  {test.assessment_type || 'Self Assessment'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-[#3DB3E3]">
                                  {test.analysis_results?.overallScore || 'N/A'}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(test.completed_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setViewingTestReport({ ...test, type: 'self' })}
                                    className="bg-[#3DB3E3] text-white px-4 py-2 rounded-lg hover:bg-[#1FAFA3] transition-colors font-medium flex items-center gap-2"
                                  >
                                    <Eye size={16} />
                                    View
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const { error } = await supabase.functions.invoke('send-self-assessment-email', {
                                          body: { assessmentId: test.id }
                                        });
                                        if (error) throw error;
                                        alert('Report sent successfully!');
                                      } catch (error: any) {
                                        alert('Failed to send report: ' + error.message);
                                      }
                                    }}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <Send size={16} />
                                    Send Report
                                  </button>
                                  <button
                                    onClick={() => {
                                      setTestToDelete({ ...test, type: 'self' });
                                      setShowDeleteTestModal(true);
                                    }}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ADHD 7-10 Tab */}
            {testResultsTab === 'adhd-710' && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">ADHD 7-10 Assessments</h2>
                {adhd710Assessments.filter(a => a.status === 'both_completed').length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-600">No completed ADHD 7-10 assessments yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#E6E9EF] border-b-2 border-[#0A2A5E]">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Child Name</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Age</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Parent Email</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Status</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Created</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adhd710Assessments
                          .filter(a => a.status === 'both_completed')
                          .map((assessment) => (
                            <tr key={assessment.id} className="border-b hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-[#0A2A5E]">{assessment.child_name}</td>
                              <td className="px-6 py-4 text-gray-600">{assessment.child_age}</td>
                              <td className="px-6 py-4 text-gray-600">{assessment.created_by_email}</td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                  {assessment.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(assessment.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={async () => {
                                      try {
                                        const { error } = await supabase.functions.invoke('send-adhd710-reports', {
                                          body: { assessmentId: assessment.id }
                                        });
                                        if (error) throw error;
                                        alert('Reports sent successfully!');
                                      } catch (error: any) {
                                        alert('Failed to send reports: ' + error.message);
                                      }
                                    }}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <Send size={16} />
                                    Send Reports
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ADHD 11-18 Tab */}
            {testResultsTab === 'adhd-1118' && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">ADHD 11-18 Assessments</h2>
                {adhd1118Assessments.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-600">No ADHD 11-18 assessments yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#E6E9EF] border-b-2 border-[#0A2A5E]">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Teen Name</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Age</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Parent Email</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Status</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Created</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adhd1118Assessments
                          .map((assessment) => {
                            const isBothCompleted = assessment.status === 'both_completed';
                            const statusColors = {
                              'both_completed': 'bg-green-100 text-green-800',
                              'teen_completed': 'bg-yellow-100 text-yellow-800',
                              'parent_invited': 'bg-blue-100 text-blue-800',
                              'started': 'bg-gray-100 text-gray-800'
                            };

                            return (
                              <tr key={assessment.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-[#0A2A5E]">{assessment.teen_name}</td>
                                <td className="px-6 py-4 text-gray-600">{assessment.teen_age}</td>
                                <td className="px-6 py-4 text-gray-600">{assessment.created_by_email}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[assessment.status] || 'bg-gray-100 text-gray-800'}`}>
                                    {assessment.status.replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {new Date(assessment.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    {isBothCompleted ? (
                                      <button
                                        onClick={async () => {
                                          try {
                                            const { error } = await supabase.functions.invoke('send-adhd1118-reports', {
                                              body: { assessmentId: assessment.id }
                                            });
                                            if (error) throw error;
                                            alert('Reports sent successfully!');
                                          } catch (error: any) {
                                            alert('Failed to send reports: ' + error.message);
                                          }
                                        }}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                                      >
                                        <Send size={16} />
                                        Send Reports
                                      </button>
                                    ) : (
                                      <span className="text-sm text-gray-500 italic">
                                        Waiting for {assessment.status === 'teen_completed' ? 'parent' : 'teen'} response
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Trauma Scan Tab */}
            {testResultsTab === 'trauma-scan' && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Trauma Scan Assessments</h2>
                {selfAssessments.filter(s => s.assessment_type === 'trauma-scan' && (s.status === 'completed' || s.status === 'analyzed')).length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-600">No trauma scan assessments yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#E6E9EF] border-b-2 border-[#0A2A5E]">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Client Name</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Email</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Score</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Completed</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selfAssessments
                          .filter(s => s.assessment_type === 'trauma-scan' && (s.status === 'completed' || s.status === 'analyzed'))
                          .map((test) => (
                            <tr key={test.id} className="border-b hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-[#0A2A5E]">{test.customer_name}</td>
                              <td className="px-6 py-4 text-gray-600">{test.customer_email}</td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-[#3DB3E3]">
                                  {test.analysis_results?.overall?.pct || 'N/A'}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(test.completed_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setViewingTestReport({ ...test, type: 'self' })}
                                    className="bg-[#3DB3E3] text-white px-4 py-2 rounded-lg hover:bg-[#1FAFA3] transition-colors font-medium flex items-center gap-2"
                                  >
                                    <Eye size={16} />
                                    View
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const { error } = await supabase.functions.invoke('send-trauma-scan-reports', {
                                          body: { assessmentId: test.id }
                                        });
                                        if (error) throw error;
                                        alert('Report sent successfully!');
                                      } catch (error: any) {
                                        alert('Failed to send report: ' + error.message);
                                      }
                                    }}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <Send size={16} />
                                    Send Report
                                  </button>
                                  <button
                                    onClick={() => {
                                      setTestToDelete({ ...test, type: 'self' });
                                      setShowDeleteTestModal(true);
                                    }}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentView === 'visitor_view' && (
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
            <button
              onClick={() => setCurrentView('overview')}
              className="fixed top-4 right-4 z-[60] bg-[#0A2A5E] text-white hover:bg-[#3DB3E3] rounded-full px-6 py-3 shadow-lg font-medium"
            >
              Back to Admin
            </button>
            <HomePage />
          </div>
        )}
      </div>

      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Add New User</h2>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unique Link Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUser.uniqueLinkCode}
                    onChange={(e) => setNewUser({ ...newUser, uniqueLinkCode: e.target.value.toUpperCase() })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                    placeholder="AUTO-GENERATED"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setNewUser({ ...newUser, uniqueLinkCode: generateUniqueCode() })}
                    className="flex items-center gap-2 bg-[#3DB3E3] text-white px-4 py-3 rounded-lg hover:bg-[#0A2A5E] transition-all"
                    title="Generate new code"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">Auto-generated code (you can edit or regenerate)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'franchise_owner' | 'super_admin' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                >
                  <option value="franchise_owner">Franchise Owner</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {newUser.role === 'super_admin'
                    ? 'Full access to all data and settings'
                    : 'Access to own assessments and clients only'}
                </p>
              </div>

              {addUserError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {addUserError}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setAddUserError('');
                    setNewUser({
                      email: '',
                      password: '',
                      name: '',
                      uniqueLinkCode: '',
                      role: 'franchise_owner'
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addUserLoading}
                  className="flex-1 bg-[#0A2A5E] text-white px-4 py-3 rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
                >
                  {addUserLoading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Edit User</h2>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unique Link Code
                </label>
                <input
                  type="text"
                  value={editUser.uniqueLinkCode}
                  onChange={(e) => setEditUser({ ...editUser, uniqueLinkCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  placeholder="UNIQUE-CODE"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value as 'franchise_owner' | 'super_admin' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                >
                  <option value="franchise_owner">Franchise Owner</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {editUser.role === 'super_admin'
                    ? 'Full access to all data and settings'
                    : 'Access to own assessments and clients only'}
                </p>
              </div>

              {editUserError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {editUserError}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false);
                    setEditUserError('');
                    setSelectedUser(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editUserLoading}
                  className="flex-1 bg-[#0A2A5E] text-white px-4 py-3 rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
                >
                  {editUserLoading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Updating...
                    </>
                  ) : (
                    'Update User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-2">Change Password</h2>
            <p className="text-gray-600 mb-6">
              Update password for <span className="font-semibold">{selectedUser.name}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  placeholder="Enter new password"
                  minLength={6}
                  autoFocus
                />
                <p className="mt-1 text-sm text-gray-500">Minimum 6 characters</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPasswordModal(false);
                    setSelectedUser(null);
                    setNewPassword('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={addUserLoading || newPassword.length < 6}
                  className="flex-1 bg-[#0A2A5E] text-white px-4 py-3 rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
                >
                  {addUserLoading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key size={20} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-[#0A2A5E]">Delete User</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{selectedUser.name}</span>?
              This will permanently remove their account and all associated data. This action cannot be undone.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-medium">Warning: This action is irreversible</p>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                <li>User will be logged out immediately</li>
                <li>All their client data will remain but be unlinked</li>
                <li>Their unique link code will become available</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteUserModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={addUserLoading}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
              >
                {addUserLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={20} />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && shareTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#0A2A5E]">Share Report</h3>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareTest(null);
                  setShareEmail('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">Client:</span> {shareTest.customer_name}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Assessment Type:</span> {shareTest.type === 'nipa' ? 'Full NIP Assessment (344 Questions)' : shareTest.assessment_type}
                </p>
              </div>
            </div>

            <form onSubmit={handleShareReport}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  The comprehensive report will be sent to this email address
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShareTest(null);
                    setShareEmail('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={shareLoading || !shareEmail}
                  className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
                >
                  {shareLoading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteTestModal && testToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Delete Assessment</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this assessment for <strong>{testToDelete.customer_name}</strong>?
              This action cannot be undone.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    This will permanently delete all assessment data, including responses and analysis results.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteTestModal(false);
                  setTestToDelete(null);
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTest}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={20} />
                    Delete Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingTestReport && (
        <>
          {viewingTestReport.type === 'nipa' ? (
            <div className="fixed inset-0 bg-black/80 z-[100] overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setViewingTestReport(null)}>
              <div className="relative min-h-screen">
                <button
                  onClick={() => setViewingTestReport(null)}
                  className="fixed top-4 right-4 z-[110] bg-white text-gray-900 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-300 hover:border-gray-500"
                  title="Close report"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {viewingTestReport.analysis_results?.neuralImprintPatternScores ? (
                  <NIP3CoachReport
                    results={viewingTestReport.analysis_results.neuralImprintPatternScores.map((nip: any) => ({
                      nipGroup: nip.code,
                      score: nip.actualScore,
                      maxScore: nip.maxScore,
                      percentage: nip.score,
                      count: nip.totalQuestions
                    }))}
                    completionDate={new Date(viewingTestReport.completed_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  />
                ) : (
                  <CoachReport
                    data={generateCoachReportData(
                      viewingTestReport.customer_name,
                      viewingTestReport.answers,
                      new Date(viewingTestReport.completed_at),
                      Object.keys(viewingTestReport.answers).length
                    )}
                  />
                )}
              </div>
            </div>
          ) : (
            <SelfAssessmentReport
              responseId={viewingTestReport.id}
              assessmentType={selfAssessmentTypes.find(t => t.id === viewingTestReport.assessment_type) || selfAssessmentTypes[0]}
              customerEmail={viewingTestReport.customer_email}
              onClose={() => setViewingTestReport(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
