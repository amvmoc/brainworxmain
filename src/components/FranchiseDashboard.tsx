import { useState, useEffect } from 'react';
import { LogOut, Users, TrendingUp, Copy, Share2, Eye, EyeOff, FileText, LayoutDashboard, Mail, FileCheck, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { InvoicesPage } from './InvoicesPage';
import { ClientReport } from './ClientReport';
import { SelfAssessmentReport } from './SelfAssessmentReport';
import CoachReport from './coach-report/CoachReport';
import { CalendarManagement } from './CalendarManagement';
import { BookingManagement } from './BookingManagement';
import { FranchiseBookingCalendar } from './FranchiseBookingCalendar';
import { generateClientReportData } from '../utils/clientReportScoring';
import { generateCoachReportData } from '../utils/coachReportGenerator';
import { selfAssessmentTypes } from '../data/selfAssessmentQuestions';

interface Response {
  id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  analysis_results: any;
  completed_at: string;
  entry_type: string;
  answers: Record<string, string>;
  assessment_type?: string;
  response_type: 'nipa' | 'self_assessment';
}

interface FranchiseDashboardProps {
  franchiseOwnerId: string;
  franchiseOwnerCode: string;
  franchiseOwnerName: string;
  franchiseOwnerEmail: string;
  isSuperAdmin: boolean;
  onLogout: () => void;
}

/**
 * FranchiseDashboard Component
 *
 * STRUCTURE OVERVIEW:
 * ===================
 * 1. Navigation tabs (Dashboard, Tests, Invoices, Calendar)
 * 2. Conditional view rendering based on currentView state
 * 3. GLOBAL MODALS section (MUST be outside view conditionals)
 *
 * IMPORTANT ARCHITECTURAL RULES:
 * ================================
 * - ALL modals MUST be placed AFTER the view conditionals (not inside them)
 * - This ensures modals work regardless of which tab the user is viewing
 * - Follow the documented z-index hierarchy to prevent overlap issues
 * - Never nest modals inside the currentView conditionals
 */
export function FranchiseDashboard({
  franchiseOwnerId,
  franchiseOwnerCode,
  franchiseOwnerName,
  franchiseOwnerEmail,
  isSuperAdmin,
  onLogout
}: FranchiseDashboardProps) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'invoices' | 'calendar'>('dashboard');
  const [calendarTab, setCalendarTab] = useState<'availability' | 'bookings'>('bookings');
  const [showClientReport, setShowClientReport] = useState(false);
  const [clientReportData, setClientReportData] = useState<any>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [viewingTestReport, setViewingTestReport] = useState<Response | null>(null);

  const coachLink = `${window.location.origin}?fh=${franchiseOwnerCode}`;

  useEffect(() => {
    loadProspects();
  }, [franchiseOwnerId, isSuperAdmin]);

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

  const loadProspects = async () => {
    setLoading(true);
    try {
      let nipaQuery = supabase
        .from('responses')
        .select('*')
        .in('status', ['analyzed', 'sent']);

      let selfAssessmentQuery = supabase
        .from('self_assessment_responses')
        .select('*')
        .in('status', ['analyzed', 'completed']);

      if (!isSuperAdmin) {
        nipaQuery = nipaQuery.eq('franchise_owner_id', franchiseOwnerId);
        selfAssessmentQuery = selfAssessmentQuery.eq('franchise_owner_id', franchiseOwnerId);
      }

      const [nipaResult, selfAssessmentResult] = await Promise.all([
        nipaQuery.order('completed_at', { ascending: false }),
        selfAssessmentQuery.order('completed_at', { ascending: false })
      ]);

      const nipaResponses = (nipaResult.data || []).map(r => ({
        ...r,
        response_type: 'nipa' as const
      }));

      const selfAssessmentResponses = (selfAssessmentResult.data || []).map(r => ({
        ...r,
        response_type: 'self_assessment' as const
      }));

      const allResponses = [...nipaResponses, ...selfAssessmentResponses].sort((a, b) =>
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );

      setResponses(allResponses);
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

  const viewClientReport = (response: Response) => {
    const reportData = generateClientReportData(
      response.customer_name,
      response.answers,
      new Date(response.completed_at),
      Object.keys(response.answers).length
    );
    setClientReportData(reportData);
    setShowClientReport(true);
    setSelectedResponse(null);
  };

  const sendClientReport = async (response: Response) => {
    setSendingEmail(true);
    setEmailSent(false);

    try {
      const { error } = await supabase.functions.invoke('send-analysis-email', {
        body: {
          responseId: response.id
        }
      });

      if (error) throw error;

      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (error) {
      console.error('Error sending client report:', error);
      alert('Failed to send report. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const stats = {
    total: responses.length,
    completed: responses.filter(r => r.status === 'analyzed' || r.status === 'sent').length,
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
              Assessments
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
            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'calendar'
                  ? 'bg-white text-[#0A2A5E] font-semibold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Calendar size={20} />
              Calendar & Bookings
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'invoices' ? (
          <InvoicesPage franchiseOwnerId={franchiseOwnerId} />
        ) : currentView === 'calendar' ? (
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
                Bookings
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
              <FranchiseBookingCalendar
                franchiseOwnerId={franchiseOwnerId}
                franchiseOwnerEmail={franchiseOwnerEmail}
                franchiseOwnerName={franchiseOwnerName}
              />
            ) : (
              <CalendarManagement
                franchiseOwnerId={franchiseOwnerId}
                franchiseOwnerCode={franchiseOwnerCode}
              />
            )}
          </div>
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
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Assessment Type</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Source</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Score</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Completed</th>
                    <th className="px-6 py-3 text-left font-semibold text-[#0A2A5E]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((response) => (
                    <tr key={`${response.response_type}-${response.id}`} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-[#0A2A5E]">{response.customer_name}</td>
                      <td className="px-6 py-4 text-gray-600">{response.customer_email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          response.response_type === 'nipa'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {response.response_type === 'nipa' ? 'NIPA Full' : response.assessment_type || 'Self Assessment'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          response.entry_type === 'coach_link'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {response.entry_type === 'coach_link' ? 'Coach Link' : 'Coupon'}
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
          </>
        )}

      {/* =================================================================
          GLOBAL MODALS SECTION - DO NOT MOVE INSIDE VIEW CONDITIONALS
          =================================================================

          CRITICAL: All modals below MUST remain OUTSIDE the view conditionals
          (dashboard, tests, calendar, invoices). They need to be accessible
          from ANY view/tab to function properly.

          Z-INDEX HIERARCHY (to prevent overlap issues):
          - Base dashboard content: z-0 to z-40
          - Standard modals (selectedResponse, showClientReport): z-50
          - Test report modals (viewingTestReport): z-100 to z-110
          - Customer profile modal (CustomerProfileModal): z-200

          If you need to add a new modal, place it here and assign an
          appropriate z-index based on the hierarchy above.
          ================================================================= */}

      {/* Modal: Customer Details Preview (from dashboard prospect list) */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedResponse(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-2">
              {selectedResponse.customer_name} - Assessment Results
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {selectedResponse.response_type === 'nipa' ? 'NIPA Full Assessment (343 Questions)' : `Self Assessment: ${selectedResponse.assessment_type || 'Unknown'}`}
            </p>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#E6E9EF] p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-[#0A2A5E]">{selectedResponse.customer_email}</p>
                </div>
                <div className="bg-[#E6E9EF] p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Entry Type</p>
                  <p className="font-semibold text-[#0A2A5E]">
                    {selectedResponse.entry_type === 'coach_link' ? 'Coach Link' : 'Coupon Redemption'}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#3DB3E3] to-[#1FAFA3] text-white p-6 rounded-lg">
                <p className="text-sm opacity-90">Overall Score</p>
                <p className="text-5xl font-bold">{selectedResponse.analysis_results?.overallScore || 'N/A'}%</p>
              </div>

              {selectedResponse.analysis_results && selectedResponse.response_type === 'self_assessment' && (
                <div className="space-y-4">
                  {selectedResponse.analysis_results.topImprints && (
                    <div>
                      <h3 className="font-semibold text-[#0A2A5E] mb-3">Top Neural Imprints</h3>
                      <div className="space-y-2">
                        {selectedResponse.analysis_results.topImprints.slice(0, 5).map((imprint: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-800">{imprint.code} - {imprint.name}</p>
                              <p className="text-xs text-gray-600">{imprint.itemCount} questions</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${
                              imprint.severity === 'high' ? 'bg-red-500' :
                              imprint.severity === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}>
                              {imprint.percentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedResponse.analysis_results.recommendations && (
                    <div>
                      <h3 className="font-semibold text-[#0A2A5E] mb-2">Recommendations</h3>
                      <ul className="space-y-1">
                        {selectedResponse.analysis_results.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {selectedResponse.analysis_results && selectedResponse.response_type === 'nipa' && (
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

              <div className="mt-6 flex gap-3">
                {selectedResponse.response_type === 'nipa' && (
                  <button
                    onClick={() => viewClientReport(selectedResponse)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#3DB3E3] to-[#1FAFA3] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    <FileCheck size={20} />
                    View Full Client Report
                  </button>
                )}
                {selectedResponse.response_type === 'nipa' && (
                  <button
                    onClick={() => sendClientReport(selectedResponse)}
                    disabled={sendingEmail}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0A2A5E] text-white px-6 py-3 rounded-lg hover:bg-[#3DB3E3] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail size={20} />
                    {sendingEmail ? 'Sending...' : emailSent ? 'Sent!' : 'Send Report via Email'}
                  </button>
                )}
                {selectedResponse.response_type === 'self_assessment' && (
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-800 font-medium">Results automatically emailed to client</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Full Client Report (NIPA assessments) */}
      {showClientReport && clientReportData && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
          <div className="relative">
            <button
              onClick={() => setShowClientReport(false)}
              className="fixed top-4 right-4 z-50 bg-white text-gray-900 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-300 hover:border-gray-500"
              title="Close report"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <ClientReport results={clientReportData} showActions={true} />
          </div>
        </div>
      )}

      {/* Modal: View Full Test Report (from Tests tab - Coach Report or Self Assessment)
          Higher z-index (z-100, z-110) to ensure it displays above other modals */}
      {viewingTestReport && (
        <>
          {viewingTestReport.response_type === 'nipa' ? (
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
                <CoachReport
                  data={generateCoachReportData(
                    viewingTestReport.customer_name,
                    viewingTestReport.answers,
                    new Date(viewingTestReport.completed_at),
                    Object.keys(viewingTestReport.answers).length
                  )}
                />
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

      {/* END OF GLOBAL MODALS SECTION */}

      </div>
    </div>
  );
}
