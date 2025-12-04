import { useState, useEffect } from 'react';
import { LogOut, Users, TrendingUp, Copy, Share2, Eye, EyeOff, FileText, LayoutDashboard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { InvoicesPage } from './InvoicesPage';

interface Response {
  id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  analysis_results: any;
  completed_at: string;
  entry_type: string;
}

interface FranchiseDashboardProps {
  franchiseOwnerId: string;
  franchiseOwnerCode: string;
  franchiseOwnerName: string;
  isSuperAdmin: boolean;
  onLogout: () => void;
}

export function FranchiseDashboard({
  franchiseOwnerId,
  franchiseOwnerCode,
  franchiseOwnerName,
  isSuperAdmin,
  onLogout
}: FranchiseDashboardProps) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'invoices'>('dashboard');

  const coachLink = `${window.location.origin}?fh=${franchiseOwnerCode}`;

  useEffect(() => {
    loadProspects();
  }, [franchiseOwnerId, isSuperAdmin]);

  const loadProspects = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('responses')
        .select('*')
        .eq('status', 'analyzed');

      if (!isSuperAdmin) {
        query = query.eq('franchise_owner_id', franchiseOwnerId);
      }

      const { data } = await query.order('completed_at', { ascending: false });

      setResponses(data || []);
    } catch (error) {
      console.error('Error loading prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coachLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = {
    total: responses.length,
    completed: responses.filter(r => r.status === 'analyzed').length,
    viaCoach: responses.filter(r => r.entry_type === 'coach_link').length,
    viaEmail: responses.filter(r => r.entry_type === 'random_visitor').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2A5E] to-[#3DB3E3]">
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">BrainWorx Franchise</h1>
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

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'dashboard'
                  ? 'bg-white text-[#0A2A5E] font-semibold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('invoices')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'invoices'
                  ? 'bg-white text-[#0A2A5E] font-semibold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <FileText size={20} />
              Invoices
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'invoices' ? (
          <InvoicesPage franchiseOwnerId={franchiseOwnerId} />
        ) : (
          <>
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Total Prospects</h3>
              <Users className="text-[#3DB3E3]" size={24} />
            </div>
            <p className="text-3xl font-bold text-[#0A2A5E]">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Completed</h3>
              <TrendingUp className="text-[#1FAFA3]" size={24} />
            </div>
            <p className="text-3xl font-bold text-[#0A2A5E]">{stats.completed}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Via Coach Link</h3>
              <Share2 className="text-[#FFB84D]" size={24} />
            </div>
            <p className="text-3xl font-bold text-[#0A2A5E]">{stats.viaCoach}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Via Email</h3>
              <Eye className="text-[#3DB3E3]" size={24} />
            </div>
            <p className="text-3xl font-bold text-[#0A2A5E]">{stats.viaEmail}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#0A2A5E] mb-2">Your Franchise Referral Link</h2>
              <p className="text-gray-600">Share this link with customers to track all their assessments and sales under your franchise</p>
            </div>
            <Share2 className="text-[#3DB3E3]" size={32} />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={coachLink}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="bg-[#3DB3E3] text-white px-4 py-3 rounded-lg hover:bg-[#1FAFA3] transition-all flex items-center gap-2"
            >
              <Copy size={20} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-[#0A2A5E] mb-6">Prospect Results</h2>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading prospects...</p>
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto text-gray-300 mb-2" size={48} />
              <p className="text-gray-600">No completed assessments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#E6E9EF] border-b-2 border-[#0A2A5E]">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Email</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Source</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Score</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Completed</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((response) => (
                    <tr key={response.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-[#0A2A5E]">{response.customer_name}</td>
                      <td className="px-6 py-4 text-gray-600">{response.customer_email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          response.entry_type === 'coach_link'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {response.entry_type === 'coach_link' ? 'Coach Link' : 'Email'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#3DB3E3]">
                          {response.analysis_results?.overallScore || 'N/A'}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(response.completed_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedResponse(response)}
                          className="text-[#3DB3E3] hover:text-[#1FAFA3] font-medium transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {selectedResponse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedResponse(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">
              {selectedResponse.customer_name} - Assessment Results
            </h2>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#E6E9EF] p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-[#0A2A5E]">{selectedResponse.customer_email}</p>
                </div>
                <div className="bg-[#E6E9EF] p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Entry Type</p>
                  <p className="font-semibold text-[#0A2A5E]">
                    {selectedResponse.entry_type === 'coach_link' ? 'Coach Link' : 'Email Visitor'}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#3DB3E3] to-[#1FAFA3] text-white p-6 rounded-lg">
                <p className="text-sm opacity-90">Overall Score</p>
                <p className="text-5xl font-bold">{selectedResponse.analysis_results?.overallScore || 'N/A'}%</p>
              </div>

              {selectedResponse.analysis_results && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#0A2A5E] mb-2">Top Strengths</h3>
                    <ul className="space-y-1">
                      {selectedResponse.analysis_results.strengths?.map((strength: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700">• {strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#0A2A5E] mb-2">Growth Areas</h3>
                    <ul className="space-y-1">
                      {selectedResponse.analysis_results.areasForGrowth?.map((area: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700">• {area}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
          </>
        )}
      </div>
    </div>
  );
}
