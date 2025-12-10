import { useState, useEffect } from 'react';
import { X, Calendar, User, Mail, Phone, FileText, Eye, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CustomerProfileModalProps {
  customerEmail: string;
  customerName: string;
  bookingDate: string;
  franchiseOwnerId: string;
  onClose: () => void;
}

interface TestResult {
  id: string;
  assessment_type: string;
  completed_at: string | null;
  status: string;
  share_token: string | null;
  analysis_results: any;
}

interface FranchiseHolder {
  id: string;
  name: string;
  email: string;
}

export function CustomerProfileModal({
  customerEmail,
  customerName,
  bookingDate,
  franchiseOwnerId,
  onClose
}: CustomerProfileModalProps) {
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [franchiseHolder, setFranchiseHolder] = useState<FranchiseHolder | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'tests'>('info');

  useEffect(() => {
    loadCustomerData();
  }, [customerEmail, franchiseOwnerId]);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const [responsesResult, selfAssessmentsResult, franchiseResult] = await Promise.all([
        supabase
          .from('responses')
          .select('id, completed_at, status, share_token, analysis_results')
          .eq('customer_email', customerEmail)
          .order('completed_at', { ascending: false }),
        supabase
          .from('self_assessment_responses')
          .select('id, assessment_type, completed_at, status, share_token, analysis_results')
          .eq('customer_email', customerEmail)
          .order('completed_at', { ascending: false }),
        supabase
          .from('franchise_owners')
          .select('id, name, email')
          .eq('id', franchiseOwnerId)
          .single()
      ]);

      if (franchiseResult.data) {
        setFranchiseHolder(franchiseResult.data);
      }

      const allTests: TestResult[] = [];

      if (responsesResult.data) {
        responsesResult.data.forEach(r => {
          allTests.push({
            id: r.id,
            assessment_type: 'NIP Assessment (Full)',
            completed_at: r.completed_at,
            status: r.status,
            share_token: r.share_token,
            analysis_results: r.analysis_results
          });
        });
      }

      if (selfAssessmentsResult.data) {
        selfAssessmentsResult.data.forEach(r => {
          allTests.push({
            id: r.id,
            assessment_type: r.assessment_type || 'Self Assessment',
            completed_at: r.completed_at,
            status: r.status,
            share_token: r.share_token,
            analysis_results: r.analysis_results
          });
        });
      }

      allTests.sort((a, b) => {
        const dateA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
        const dateB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
        return dateB - dateA;
      });

      setTestResults(allTests);
    } catch (error: any) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = (shareToken: string | null) => {
    if (shareToken) {
      window.open(`/results/${shareToken}`, '_blank');
    } else {
      alert('Results link not available for this test');
    }
  };

  const handleViewCoachReport = async (testId: string) => {
    try {
      const { data, error } = await supabase
        .from('coach_reports')
        .select('id')
        .eq('response_id', testId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        alert('Coach report available - Feature to view coach report will be implemented');
      } else {
        alert('No coach report has been created for this assessment yet');
      }
    } catch (error: any) {
      console.error('Error checking coach report:', error);
      alert('Failed to check coach report availability');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not completed';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    /* CRITICAL Z-INDEX: This modal uses z-[200] to ensure it displays ABOVE all other
       modals in the FranchiseDashboard (which use z-50 to z-110). This is necessary
       because it can be opened from within the Calendar view which itself may contain
       other overlays. DO NOT reduce this z-index value or the modal may be hidden. */
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#0A2A5E] to-[#3DB3E3] p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="text-white" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-white">{customerName}</h2>
              <p className="text-white/90 text-sm">{customerEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-6 py-4 font-semibold transition-all ${
              activeTab === 'info'
                ? 'bg-white text-[#0A2A5E] border-b-2 border-[#3DB3E3]'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User size={18} className="inline mr-2" />
            Customer Info
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex-1 px-6 py-4 font-semibold transition-all ${
              activeTab === 'tests'
                ? 'bg-white text-[#0A2A5E] border-b-2 border-[#3DB3E3]'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText size={18} className="inline mr-2" />
            Tests & Reports
            {testResults.length > 0 && (
              <span className="ml-2 bg-[#3DB3E3] text-white text-xs px-2 py-1 rounded-full">
                {testResults.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3DB3E3]"></div>
            </div>
          ) : activeTab === 'info' ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-[#0A2A5E] mb-4 flex items-center">
                  <Calendar size={20} className="mr-2" />
                  Booking Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Booking Date</label>
                    <div className="text-lg font-semibold text-gray-800">
                      {new Date(bookingDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-[#0A2A5E] mb-4 flex items-center">
                  <User size={20} className="mr-2" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail size={18} className="text-purple-600 mr-3" />
                    <div>
                      <label className="text-xs font-medium text-gray-600 block">Email</label>
                      <div className="text-gray-800 font-medium">{customerEmail}</div>
                    </div>
                  </div>
                </div>
              </div>

              {franchiseHolder && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-[#0A2A5E] mb-4 flex items-center">
                    <User size={20} className="mr-2" />
                    Franchise Holder
                  </h3>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-gray-800">{franchiseHolder.name}</div>
                    <div className="flex items-center text-gray-600">
                      <Mail size={16} className="mr-2" />
                      {franchiseHolder.email}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg">No test results found for this customer</p>
                  <p className="text-gray-500 text-sm mt-2">Tests will appear here once completed</p>
                </div>
              ) : (
                testResults.map((test) => (
                  <div
                    key={test.id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-[#3DB3E3] transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-[#0A2A5E] mb-1">
                          {test.assessment_type}
                        </h4>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock size={14} className="mr-1" />
                          {formatDate(test.completed_at)}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          test.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : test.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {test.status}
                      </span>
                    </div>

                    {test.status === 'completed' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewResults(test.share_token)}
                          className="flex-1 flex items-center justify-center space-x-2 bg-[#3DB3E3] text-white px-4 py-3 rounded-lg hover:bg-[#0A2A5E] transition-all font-semibold"
                        >
                          <Eye size={18} />
                          <span>View Results</span>
                        </button>
                        <button
                          onClick={() => handleViewCoachReport(test.id)}
                          className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-all font-semibold"
                        >
                          <FileText size={18} />
                          <span>FH Report</span>
                        </button>
                      </div>
                    )}

                    {test.status !== 'completed' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                        <AlertCircle size={16} className="inline mr-2" />
                        Test not yet completed
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
