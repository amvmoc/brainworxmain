import { X, AlertCircle, FileText } from 'lucide-react';

interface DisclaimerPageProps {
  onClose: () => void;
}

export function DisclaimerPage({ onClose }: DisclaimerPageProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen">
        <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="text-[#0A2A5E]" size={32} />
                <h1 className="text-2xl font-bold text-[#0A2A5E]">Assessment Disclaimers & Information</h1>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={28} className="text-[#0A2A5E]" />
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-5xl">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-12 rounded-r-lg">
            <div className="flex items-start space-x-4">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={28} />
              <div>
                <h2 className="text-xl font-bold text-amber-900 mb-3">Important Information About These Assessments</h2>
                <div className="text-amber-900 space-y-3 leading-relaxed">
                  <p>The assessments on this website are developmental and educational tools. They are designed to help you better understand your patterns of thinking, feeling and behaving, and to support coaching, self-reflection and personal growth.</p>

                  <p className="font-semibold">These tools do not provide a medical, psychiatric or psychological diagnosis, and they do not replace a consultation with a registered health professional or therapist.</p>

                  <p>Do not use any result from these assessments to start, change or stop any medication or treatment.</p>

                  <p className="font-semibold">If you have serious concerns about your mental health, physical health, safety or risk of harm to yourself or others, please contact a qualified professional or emergency service immediately.</p>

                  <p>By using these assessments, you agree that you do so voluntarily and that the information provided is for informational and coaching purposes only, and not a substitute for professional medical, psychological or legal advice.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Neural Imprint Patterns – Adults (18+)</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#3DB3E3] mb-3">What this assessment is:</h3>
                  <ul className="space-y-2 text-gray-700 ml-5 list-disc leading-relaxed">
                    <li>A self-reflection and coaching tool to help you understand recurring patterns in your thoughts, emotions and behaviour.</li>
                    <li>A way to map your experience onto Neural Imprint Patterns (e.g. Mind Matters, Burned Out, Shattered Worth, etc.) to support coaching, mentoring, personal development or spiritual growth.</li>
                    <li>A starting point for conversations with a coach, mentor, counsellor or other helping professional.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">What this assessment is NOT:</h3>
                  <ul className="space-y-2 text-gray-700 ml-5 list-disc leading-relaxed">
                    <li>It is not a diagnostic tool for ADHD, depression, anxiety, personality disorders or any other mental health condition.</li>
                    <li>It is not a replacement for medical, psychological or psychiatric assessment or treatment.</li>
                    <li>It does not tell you what medication you should or should not use.</li>
                    <li className="font-semibold">Any decisions about diagnosis, medication or treatment must be made in consultation with a qualified health professional.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Neural Imprint Patterns – Teens (12–18)</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#3DB3E3] mb-3">What this assessment is:</h3>
                  <ul className="space-y-2 text-gray-700 ml-5 list-disc leading-relaxed">
                    <li>A developmental and coaching tool for teenagers and their parents/guardians.</li>
                    <li>A way to identify patterns in how a teen thinks, feels and acts in school, home, friendships and life.</li>
                    <li>Designed to support coaching conversations, youth work, mentoring, and family discussions.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">What this assessment is NOT:</h3>
                  <ul className="space-y-2 text-gray-700 ml-5 list-disc leading-relaxed">
                    <li>It is not a clinical diagnostic test for ADHD or any mental health disorder.</li>
                    <li>It is not designed to label a teen or give a permanent category or diagnosis.</li>
                    <li>It is not a substitute for professional advice from a paediatrician, psychologist, psychiatrist or other qualified professional.</li>
                    <li className="font-semibold">Parents/guardians are encouraged to use the results as one piece of information, and to seek professional support if there are serious concerns about the teen's wellbeing or safety.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Teen ADHD-Linked Neural Imprint Screener (Self-Report, 12–18)</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#3DB3E3] mb-3">What this screener is:</h3>
                  <ul className="space-y-2 text-gray-700 ml-5 list-disc leading-relaxed">
                    <li>A screening and self-reflection tool to highlight patterns that may be consistent with ADHD-style attention, energy and emotional challenges.</li>
                    <li>A way for teenagers to describe their everyday experience, linked to the Neural Imprint Patterns.</li>
                    <li>Intended to guide coaching, psycho-education and conversations between the teen, parents and professionals.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">What this screener is NOT:</h3>
                  <ul className="space-y-2 text-gray-700 ml-5 list-disc leading-relaxed">
                    <li>It is not a formal ADHD diagnosis.</li>
                    <li>It cannot confirm or exclude ADHD, learning disorders, mood disorders or any mental health condition.</li>
                    <li>It must not be used on its own to make decisions about medication, school placement or legal matters.</li>
                    <li className="font-semibold">A formal diagnosis of ADHD can only be made by a suitably qualified health professional (e.g. psychologist, psychiatrist, medical doctor). This screener can be shared with them as supporting information, not as a diagnostic tool.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Parent/Caregiver ADHD-Linked Neural Imprint Screener (Ages 12–18)</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#3DB3E3] mb-3">What this screener is:</h3>
                  <ul className="space-y-2 text-gray-700 ml-5 list-disc leading-relaxed">
                    <li>A parent-/caregiver-report tool that captures how you see your child's attention, energy, emotions and behaviour.</li>
                    <li>Designed to complement the teen's own self-report and to highlight similarities and differences in perception.</li>
                    <li>Useful for coaching, school discussions and professional consultations.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">What this screener is NOT:</h3>
                  <ul className="space-y-2 text-gray-700 ml-5 list-disc leading-relaxed">
                    <li>It is not a clinical diagnostic tool and does not provide a formal ADHD diagnosis.</li>
                    <li>It does not replace professional assessment by a psychologist, psychiatrist or medical doctor.</li>
                    <li>It should not be used alone to start or stop medication or to make high-impact decisions about the child's education or care.</li>
                    <li className="font-semibold">Results should always be interpreted together with a qualified professional and, where appropriate, with input from the child or teenager.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Adult ADHD-Linked Neural Imprint Screener</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#3DB3E3] mb-3">What this screener is:</h3>
                  <ul className="space-y-2 text-gray-700 ml-5 list-disc leading-relaxed">
                    <li>A self-report screening tool for adults who recognise ADHD-like patterns in their life (focus, organisation, impulse control, emotional regulation).</li>
                    <li>A way to understand how these patterns link to the Neural Imprint system and how they impact work, relationships and daily functioning.</li>
                    <li>Intended to support coaching, lifestyle adjustments and informed discussion with health professionals.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">What this screener is NOT:</h3>
                  <ul className="space-y-2 text-gray-700 ml-5 list-disc leading-relaxed">
                    <li>It is not a diagnostic test and cannot confirm or rule out ADHD or any other mental health condition.</li>
                    <li>It does not replace a full assessment by a psychologist, psychiatrist or medical doctor.</li>
                    <li>It should not be used on its own to decide about medication, disability status, employment, or legal matters.</li>
                    <li className="font-semibold">If your scores suggest strong ADHD-style patterns or if you are struggling in key life areas, you are encouraged to seek a formal clinical assessment.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Neural Imprint Patterns Assessment – Organisations (Leaders/Teams)</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#3DB3E3] mb-3">What this assessment is:</h3>
                  <ul className="space-y-2 text-gray-700 ml-5 list-disc leading-relaxed">
                    <li>A workplace/organisational reflection tool that shows patterns in culture, leadership and relational dynamics.</li>
                    <li>Designed to support leadership development, coaching, training and organisational growth, not to single out or shame individuals.</li>
                    <li>Intended for use by trained facilitators who understand the Neural Imprint framework.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">What this assessment is NOT:</h3>
                  <ul className="space-y-2 text-gray-700 ml-5 list-disc leading-relaxed">
                    <li>It is not a clinical diagnostic instrument for mental health or personality disorders.</li>
                    <li>It is not suitable for use as the sole basis for hiring, firing or disciplinary action.</li>
                    <li>It does not replace professional HR, legal or medical advice.</li>
                    <li className="font-semibold">Results should be used to guide healthy dialogue and development, not punishment or stigma.</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={onClose}
              className="bg-[#0A2A5E] text-white px-8 py-3 rounded-full hover:bg-[#3DB3E3] transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
