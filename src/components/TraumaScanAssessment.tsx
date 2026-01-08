import React, { useMemo, useState, useEffect } from "react";
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type NipCode =
  | "TRAP" | "SHT" | "ORG" | "NEGP" | "HYP"
  | "DOG"  | "IMP" | "NUH" | "DIS"  | "ANG"
  | "INFL" | "BULLY" | "LACK" | "DIM" | "FOC"
  | "RES"  | "INWF" | "CPL" | "BURN" | "DEC";

type AnswerValue = 0 | 1 | 2 | 3 | 4;

type Question = { id: string; nip: NipCode; text: string };
type PatternInfo = { code: NipCode; name: string; short: string };
type ReportMode = "intro" | "form" | "submitting" | "complete";

interface TraumaScanAssessmentProps {
  couponCode?: string;
  prefillData?: {
    name: string;
    email: string;
  };
}

const SCALE: { value: AnswerValue; label: string }[] = [
  { value: 0, label: "Never" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Almost always" },
];

function zoneFromAvg(avg: number): "Green" | "Amber" | "Red" {
  if (avg <= 1.4) return "Green";
  if (avg <= 2.7) return "Amber";
  return "Red";
}
function pctFromAvg(avg: number): number {
  return Math.round((Math.max(0, Math.min(4, avg)) / 4) * 100);
}
function fmtDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const PATTERNS: PatternInfo[] = [
  { code: "TRAP", name: "Stuck Mode", short: "Survival mode; low direction." },
  { code: "SHT", name: "Shame Load", short: "Self-blame; worth hit." },
  { code: "ORG", name: "Order Pressure", short: "Planning/admin overwhelm." },
  { code: "NEGP", name: "Support Gap", short: "Avoid help-seeking; feeling unsupported." },
  { code: "HYP", name: "High Alert", short: "Jumpy; restless; always 'on'." },
  { code: "DOG", name: "Rigid Thinking", short: "Locked beliefs; low adaptability." },
  { code: "IMP", name: "Impulse Relief", short: "Fast reactions to reduce stress." },
  { code: "NUH", name: "Numb/Freeze", short: "Shutdown; emotional distance." },
  { code: "DIS", name: "High Distress", short: "Panic; hopelessness; intrusive thoughts." },
  { code: "ANG", name: "Anger Charge", short: "Snapping; resentment loops." },
  { code: "INFL", name: "Helpless Story", short: "Low agency interpretations." },
  { code: "BULLY", name: "Victim Loop", short: "Replay/blame; stuckness." },
  { code: "LACK", name: "Scarcity Stress", short: "Resource insecurity pressure." },
  { code: "DIM", name: "Detail Trap", short: "Stuck in details; low priority clarity." },
  { code: "FOC", name: "Scattered Focus", short: "Attention jumps; finishing is hard." },
  { code: "RES", name: "Resistance Mode", short: "Irritable; pessimistic; pushing support away." },
  { code: "INWF", name: "Inward Pull", short: "Withdrawal; narrowed capacity." },
  { code: "CPL", name: "Coping Loop", short: "Hard-to-stop coping habits." },
  { code: "BURN", name: "Burnout", short: "Depleted energy; shutdown." },
  { code: "DEC", name: "Masking", short: "Guarded; hiding needs/feelings." },
];

const QUESTIONS: Question[] = [
  // Core patterns (10×3=30)
  { id: "Q01", nip: "TRAP", text: "I feel like I'm just surviving day-to-day with little sense of direction." },
  { id: "Q02", nip: "TRAP", text: "It's hard for me to imagine a future that feels stable or hopeful." },
  { id: "Q03", nip: "TRAP", text: "I avoid making plans because it feels pointless or unsafe." },
  { id: "Q04", nip: "SHT", text: "I blame myself for what happened, even when I logically know I shouldn't." },
  { id: "Q05", nip: "SHT", text: "I feel 'broken' or less worthy than other people." },
  { id: "Q06", nip: "SHT", text: "I struggle to accept support or kindness without feeling guilty or uncomfortable." },
  { id: "Q07", nip: "NEGP", text: "I feel emotionally unsupported by people who should care." },
  { id: "Q08", nip: "NEGP", text: "I avoid asking for help because I expect criticism, rejection, or disappointment." },
  { id: "Q09", nip: "NEGP", text: "I feel I must handle everything alone, even when it's too much." },
  { id: "Q10", nip: "HYP", text: "My body feels tense or on edge most of the time." },
  { id: "Q11", nip: "HYP", text: "I startle easily (noises, sudden movements, unexpected messages)." },
  { id: "Q12", nip: "HYP", text: "I struggle to relax—my mind or body won't 'switch off'." },
  { id: "Q13", nip: "NUH", text: "I feel emotionally numb, disconnected, or 'flat'." },
  { id: "Q14", nip: "NUH", text: "I avoid feelings by zoning out, staying busy, or distracting myself." },
  { id: "Q15", nip: "NUH", text: "I feel distant from people, even those I trust." },
  { id: "Q16", nip: "DIS", text: "I feel overwhelmed by anxiety, sadness, panic, or inner chaos." },
  { id: "Q17", nip: "DIS", text: "My thoughts can feel intrusive, frightening, or hard to control." },
  { id: "Q18", nip: "DIS", text: "I have moments where I wish I could disappear or not wake up." },
  { id: "Q19", nip: "ANG", text: "Anger rises quickly in me since the event." },
  { id: "Q20", nip: "ANG", text: "I replay what happened with strong anger or resentment." },
  { id: "Q21", nip: "ANG", text: "I snap, shout, or act harshly when I'm under stress." },
  { id: "Q22", nip: "INFL", text: "I interpret setbacks as proof that life is against me." },
  { id: "Q23", nip: "INFL", text: "I often think, 'Bad things always happen to me.'" },
  { id: "Q24", nip: "INFL", text: "I feel powerless to change anything, so I stop trying." },
  { id: "Q25", nip: "LACK", text: "I worry constantly about money, housing, or basic resources." },
  { id: "Q26", nip: "LACK", text: "I feel dependent on others in a way that makes me anxious or ashamed." },
  { id: "Q27", nip: "LACK", text: "I feel restricted or trapped by practical circumstances." },
  { id: "Q28", nip: "BURN", text: "I feel exhausted most days, even after rest." },
  { id: "Q29", nip: "BURN", text: "Small tasks feel heavy or difficult to start." },
  { id: "Q30", nip: "BURN", text: "I feel emotionally drained and low on motivation." },
  // Support patterns (10×2=20)
  { id: "Q31", nip: "DOG", text: "I get stuck in rigid 'this is how it must be' thinking, even when it hurts me." },
  { id: "Q32", nip: "DOG", text: "I reject new ideas or support because it doesn't fit what feels 'right' to me." },
  { id: "Q33", nip: "ORG", text: "My routines and planning have fallen apart since the event." },
  { id: "Q34", nip: "ORG", text: "Paperwork, admin, and organizing details overwhelm me." },
  { id: "Q35", nip: "IMP", text: "I react quickly (words/actions) to reduce stress, and later regret it." },
  { id: "Q36", nip: "IMP", text: "I make fast decisions when anxious, rather than thinking things through." },
  { id: "Q37", nip: "BULLY", text: "I often feel like a victim of circumstances and can't see a way forward." },
  { id: "Q38", nip: "BULLY", text: "I get stuck replaying blame more than taking small steps to rebuild." },
  { id: "Q39", nip: "DIM", text: "My mind gets stuck on details of what went wrong." },
  { id: "Q40", nip: "DIM", text: "I struggle to prioritize what matters most right now." },
  { id: "Q41", nip: "FOC", text: "I struggle to concentrate for long periods." },
  { id: "Q42", nip: "FOC", text: "I jump between tasks and struggle to finish what I start." },
  { id: "Q43", nip: "RES", text: "I expect the worst outcomes, even when there's no clear evidence." },
  { id: "Q44", nip: "RES", text: "I feel irritable or resistant toward people trying to help me." },
  { id: "Q45", nip: "INWF", text: "My stress is so consuming that I struggle to consider other people's needs." },
  { id: "Q46", nip: "INWF", text: "I withdraw and focus mainly on my own survival and feelings." },
  { id: "Q47", nip: "CPL", text: "I rely on a coping habit (food, alcohol/substances, gambling, porn, scrolling, etc.) more than I want to." },
  { id: "Q48", nip: "CPL", text: "I struggle to stop a coping habit even when I know it's harming me." },
  { id: "Q49", nip: "DEC", text: "I tell people I'm fine when I'm not, to avoid judgment or pressure." },
  { id: "Q50", nip: "DEC", text: "I hide my true needs or feelings because I don't feel safe being fully honest." },
];

const SAFETY_FLAG_QUESTION_IDS = new Set<string>(["Q18"]);

export default function TraumaScanAssessment({ couponCode, prefillData }: TraumaScanAssessmentProps) {
  const [mode, setMode] = useState<ReportMode>("intro");
  const [answers, setAnswers] = useState<Record<string, AnswerValue | undefined>>({});
  const [participant, setParticipant] = useState({
    name: prefillData?.name || "",
    age: "",
    email: prefillData?.email || "",
    context: "Since the incident" as "Last 2 weeks" | "Since the incident",
    incidentLabel: "the incident",
    incidentDate: "",
  });
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string>("");

  const totalAnswered = useMemo(
    () => QUESTIONS.filter((q) => answers[q.id] !== undefined).length,
    [answers]
  );
  const allAnswered = totalAnswered === QUESTIONS.length;

  const byPattern = useMemo(() => {
    const map: Record<NipCode, { sum: number; count: number }> = {} as any;
    for (const p of PATTERNS) map[p.code] = { sum: 0, count: 0 };
    for (const q of QUESTIONS) {
      const v = answers[q.id];
      if (v === undefined) continue;
      map[q.nip].sum += v;
      map[q.nip].count += 1;
    }
    return map;
  }, [answers]);

  const overall = useMemo(() => {
    const vals = QUESTIONS.map((q) => answers[q.id]).filter((v): v is AnswerValue => v !== undefined);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { avg, zone: zoneFromAvg(avg), pct: pctFromAvg(avg) };
  }, [answers]);

  const patternScores = useMemo(() => {
    return PATTERNS.map((p) => {
      const row = byPattern[p.code];
      const avg = row.count ? row.sum / row.count : 0;
      return { ...p, avg, pct: pctFromAvg(avg), zone: zoneFromAvg(avg), count: row.count };
    }).sort((a, b) => b.avg - a.avg);
  }, [byPattern]);

  const top5 = useMemo(() => patternScores.slice(0, 5), [patternScores]);

  const safetyFlag = useMemo(() => {
    for (const qid of SAFETY_FLAG_QUESTION_IDS) {
      const v = answers[qid];
      if (v !== undefined && v >= 3) return true;
    }
    return false;
  }, [answers]);

  function setAnswer(qid: string, v: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [qid]: v }));
  }

  async function handleSubmit() {
    if (!allAnswered) return;

    setMode("submitting");
    setSubmitError("");

    try {
      // Get coupon details if provided
      let franchiseOwnerId = null;
      if (couponCode) {
        const { data: couponData } = await supabase
          .from('coupon_codes')
          .select('franchise_owner_id')
          .eq('code', couponCode)
          .maybeSingle();

        if (couponData) {
          franchiseOwnerId = couponData.franchise_owner_id;
        }
      }

      // Save assessment
      const { data: assessment, error: saveError } = await supabase
        .from('self_assessment_responses')
        .insert({
          assessment_type: 'trauma-scan',
          customer_name: participant.name,
          customer_email: participant.email,
          answers: {
            participantInfo: participant,
            responses: answers,
            completedAt: new Date().toISOString()
          },
          analysis_results: {
            overall,
            patternScores,
            top5,
            safetyFlag,
            totalQuestions: QUESTIONS.length
          },
          status: 'completed',
          completed_at: new Date().toISOString(),
          franchise_owner_id: franchiseOwnerId,
          coupon_id: couponCode
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setAssessmentId(assessment.id);

      // Send email reports
      const { error: emailError } = await supabase.functions.invoke('send-trauma-scan-reports', {
        body: {
          assessmentId: assessment.id
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail - assessment is saved
      }

      setMode("complete");
    } catch (error: any) {
      console.error('Submit error:', error);
      setSubmitError(error.message || 'Failed to submit assessment. Please try again.');
      setMode("form");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2A5E] via-[#1a3a6e] to-[#0A2A5E] text-white p-6">
      <div className="max-width-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Trauma & Loss Impact Assessment</h1>
            <p className="text-white/80">Self-reflection for coaching & support planning (Adult 15+)</p>
            <p className="text-sm text-white/60 mt-2">Non-diagnostic assessment</p>
          </div>

          {mode === "intro" && (
            <div className="space-y-6">
              <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl p-4">
                <p className="text-sm">
                  <strong>Instructions:</strong> Answer based on <strong>{participant.context === "Last 2 weeks" ? "the last 2 weeks" : "since the incident"}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <input
                    type="text"
                    value={participant.name}
                    onChange={(e) => setParticipant(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#3DB3E3] outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Age</label>
                  <input
                    type="number"
                    value={participant.age}
                    onChange={(e) => setParticipant(p => ({ ...p, age: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#3DB3E3] outline-none"
                    placeholder="Your age"
                    min="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={participant.email}
                    onChange={(e) => setParticipant(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#3DB3E3] outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time anchor</label>
                  <select
                    value={participant.context}
                    onChange={(e) => setParticipant(p => ({ ...p, context: e.target.value as any }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#3DB3E3] outline-none"
                  >
                    <option value="Since the incident">Since the incident</option>
                    <option value="Last 2 weeks">Last 2 weeks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Event label (optional)</label>
                  <input
                    type="text"
                    value={participant.incidentLabel}
                    onChange={(e) => setParticipant(p => ({ ...p, incidentLabel: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#3DB3E3] outline-none"
                    placeholder="e.g., the fire / the loss"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Event date (optional)</label>
                  <input
                    type="date"
                    value={participant.incidentDate}
                    onChange={(e) => setParticipant(p => ({ ...p, incidentDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-[#3DB3E3] outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => setMode("form")}
                disabled={!participant.name || !participant.email || !participant.age}
                className="w-full bg-gradient-to-r from-[#3DB3E3] to-[#1FAFA3] text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Assessment
              </button>
            </div>
          )}

          {mode === "form" && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-bold">{totalAnswered} / {QUESTIONS.length}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#3DB3E3] to-[#1FAFA3] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(totalAnswered / QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-sm flex-1"><strong>{idx + 1}.</strong> {q.text}</p>
                      <span className="ml-3 px-2 py-1 bg-white/10 rounded text-xs font-mono">{q.nip}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {SCALE.map((opt) => (
                        <label key={opt.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            checked={answers[q.id] === opt.value}
                            onChange={() => setAnswer(q.id, opt.value)}
                            className="sr-only"
                          />
                          <div className={`text-center p-2 rounded-lg border transition-all ${
                            answers[q.id] === opt.value
                              ? 'bg-[#3DB3E3] border-[#3DB3E3] text-white'
                              : 'bg-white/5 border-white/20 hover:bg-white/10'
                          }`}>
                            <div className="text-xs">{opt.label}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {submitError && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm">{submitError}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="w-full bg-gradient-to-r from-[#3DB3E3] to-[#1FAFA3] text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {allAnswered ? 'Submit Assessment' : `Answer all questions (${totalAnswered}/${QUESTIONS.length})`}
              </button>
            </div>
          )}

          {mode === "submitting" && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-[#3DB3E3]" />
              <h2 className="text-2xl font-bold mb-2">Processing Your Assessment...</h2>
              <p className="text-white/70">Analyzing patterns and preparing your reports</p>
            </div>
          )}

          {mode === "complete" && (
            <div className="text-center py-12">
              <div className="inline-block bg-green-500/20 rounded-full p-6 mb-6">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Assessment Complete!</h2>
              <p className="text-xl mb-6">Thank you, {participant.name}</p>

              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-6 text-left max-w-2xl mx-auto">
                <h3 className="font-bold mb-3 text-lg">What happens next:</h3>
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Your detailed client report has been sent to <strong>{participant.email}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>A comprehensive coach report has been sent to your support team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Check your email (including spam folder) for your reports</span>
                  </li>
                </ul>
              </div>

              {safetyFlag && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-6 mb-6 max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="flex-shrink-0 text-red-400" size={24} />
                    <div className="text-left">
                      <p className="font-bold mb-2">Important Support Message</p>
                      <p className="text-sm text-white/90">
                        Your responses suggest a high level of distress. Please reach out <strong>today</strong> to a trusted person or qualified professional.
                        If you feel at immediate risk, please contact your local emergency services.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => window.location.href = '/'}
                className="bg-white/10 border border-white/20 text-white py-3 px-8 rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
