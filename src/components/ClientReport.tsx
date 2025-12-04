import React, { useEffect, useState } from "react";

type PatternData = {
  score: number;
  code: string;
  description: string;
};

interface AssessmentResults {
  client: {
    name: string;
    date: string;
    totalQuestions: number;
  };
  patterns: Record<string, PatternData>;
}

const sampleAssessmentResults: AssessmentResults = {
  client: {
    name: "John Smith",
    date: "December 4, 2024",
    totalQuestions: 343,
  },
  patterns: {
    "Mind In Distress": {
      score: 87,
      code: "DIS",
      description:
        "Experiencing significant anxiety, worry, and emotional distress. This pattern indicates high levels of mental distress that may benefit from professional support.",
    },
    "High Gear": {
      score: 82,
      code: "HYP",
      description:
        "Operating in constant overdrive with difficulty relaxing. This pattern suggests chronic hyperactivity and challenges with rest and recovery.",
    },
    "Anchored Anger": {
      score: 76,
      code: "ANG",
      description:
        "Carrying persistent unresolved anger or resentment. This pattern indicates deep-seated emotional issues that may need processing.",
    },
    "Burned Out": {
      score: 71,
      code: "BURN",
      description:
        "Experiencing emotional and physical exhaustion. This pattern suggests depletion of personal resources and need for recovery.",
    },
    "Time & Order": {
      score: 68,
      code: "ORG",
      description:
        "Struggling with organization and time management. This pattern indicates challenges with structure and planning.",
    },
    "Scattered Focus": {
      score: 64,
      code: "FOC",
      description:
        "Difficulty maintaining attention and concentration. This pattern suggests challenges with focus and mental clarity.",
    },
    "Self-Harm Tendency": {
      score: 58,
      code: "SHT",
      description:
        "Presence of self-destructive thoughts or behaviors. This pattern requires careful attention and professional support.",
    },
    "Stuck State": {
      score: 52,
      code: "TRAP",
      description:
        "Feeling trapped or unable to move forward. This pattern indicates a sense of being stuck in current circumstances.",
    },
    "Impulse Driver": {
      score: 48,
      code: "IMP",
      description:
        "Acting on impulses without full consideration. This pattern suggests challenges with impulse control.",
    },
    Attitude: {
      score: 44,
      code: "RES",
      description:
        "Resistance to change or negative outlook. This pattern indicates oppositional tendencies.",
    },
    "Addictive Loops": {
      score: 41,
      code: "CPL",
      description:
        "Engaging in repetitive compulsive behaviors. This pattern suggests habitual patterns that may be difficult to break.",
    },
    "Negative Projection": {
      score: 38,
      code: "NEGP",
      description:
        "Tendency to project negative expectations onto situations. This pattern shows some pessimistic thinking.",
    },
    "Not Understanding": {
      score: 34,
      code: "NUH",
      description:
        "Difficulty comprehending situations or others' perspectives. Minimal presence of this pattern.",
    },
    Dogma: {
      score: 29,
      code: "DOG",
      description:
        "Rigid thinking or inflexible beliefs. Low presence of this pattern indicates flexibility.",
    },
    "Inside Out": {
      score: 26,
      code: "INFL",
      description:
        "Self-focused perspective with limited external awareness. Minimal presence of this pattern.",
    },
    "Victim Loops": {
      score: 23,
      code: "BULLY",
      description:
        "Victim mentality or blaming external factors. Low presence indicates personal accountability.",
    },
    "Lack State": {
      score: 21,
      code: "LACK",
      description:
        "Perception of scarcity or insufficiency. Minimal presence of this pattern.",
    },
    "Dim Reality": {
      score: 18,
      code: "DIM",
      description:
        "Distorted perception of reality. Very low presence of this pattern.",
    },
    "Inward Focus": {
      score: 15,
      code: "INWF",
      description:
        "Excessive self-absorption. Very minimal presence indicates healthy balance.",
    },
    Deceiver: {
      score: 12,
      code: "DEC",
      description:
        "Dishonesty or deceptive tendencies. Very low score indicates strong integrity.",
    },
  },
};

const getCategory = (score: number) => {
  if (score >= 60) return "high" as const;
  if (score >= 40) return "medium" as const;
  return "low" as const;
};

const ClientReport: React.FC<{
  results?: AssessmentResults;
}> = ({ results = sampleAssessmentResults }) => {
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateBars(true), 100);
    return () => clearTimeout(t);
  }, []);

  const patternsArray = Object.entries(results.patterns).sort(
    (a, b) => b[1].score - a[1].score
  );

  const highPatterns = patternsArray.filter(
    ([, data]) => data.score >= 60
  );
  const mediumPatterns = patternsArray.filter(
    ([, data]) => data.score >= 40 && data.score < 60
  );
  const lowPatterns = patternsArray.filter(
    ([, data]) => data.score < 40
  );

  const renderBarColor = (score: number) => {
    const category = getCategory(score);
    if (category === "high")
      return "bg-gradient-to-r from-red-500 to-red-700";
    if (category === "medium")
      return "bg-gradient-to-r from-amber-400 to-orange-500";
    return "bg-gradient-to-r from-sky-500 to-blue-600";
  };

  const renderPatternCard = (
    name: string,
    data: PatternData,
    priority: "high" | "medium" | "low"
  ) => {
    const borderColor =
      priority === "high"
        ? "border-red-500"
        : priority === "medium"
        ? "border-amber-400"
        : "border-sky-500";
    const badgeColor =
      priority === "high"
        ? "bg-red-500"
        : priority === "medium"
        ? "bg-amber-400"
        : "bg-sky-500";

    return (
      <div
        key={name}
        className={`bg-gradient-to-r from-slate-50 to-white p-5 mb-4 rounded-xl border-l-4 ${borderColor}`}
      >
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h4 className="text-lg font-bold text-gray-900">{name}</h4>
          <span
            className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold text-white ${badgeColor}`}
          >
            {data.score}%
          </span>
        </div>
        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
          {data.description}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-cyan-700 p-5 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        <header className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-center px-6 py-10">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
              🧠 BrainWorx
            </h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Your Neural Imprint Assessment Results
          </h2>
          <p className="text-base md:text-lg opacity-95">
            Comprehensive Personal Report
          </p>
        </header>

        <section className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-4 border-blue-500 px-6 md:px-8 py-6">
          <h3 className="text-xl md:text-2xl font-bold text-blue-600 mb-4">
            Assessment Information
          </h3>
          <div className="grid gap-4 md:grid-cols-3 text-sm md:text-base text-gray-800">
            <div>
              <strong className="text-blue-600">Name:</strong>{" "}
              <span>{results.client.name}</span>
            </div>
            <div>
              <strong className="text-blue-600">Assessment Date:</strong>{" "}
              <span>{results.client.date}</span>
            </div>
            <div>
              <strong className="text-blue-600">Total Questions:</strong>{" "}
              <span>{results.client.totalQuestions}</span>
            </div>
          </div>
        </section>

        <main className="px-6 md:px-8 py-8 md:py-10 space-y-10">
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-600 border-b-4 border-blue-500 pb-3">
              📋 Understanding Your Results
            </h2>

            <div className="bg-gradient-to-r from-cyan-50 to-sky-100 rounded-2xl border-l-4 border-blue-500 p-5 md:p-6">
              <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                Thank you for completing the Neural Imprint Patterns™
                assessment. This comprehensive evaluation measures 20 distinct
                psychological patterns that influence your thoughts, emotions,
                and behaviors. Your results provide valuable insights into areas
                of strength and opportunities for growth.
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-yellow-100 rounded-2xl border-l-4 border-amber-400 p-5 md:p-6">
              <p className="text-amber-900 leading-relaxed text-sm md:text-base">
                <strong>Important:</strong> This assessment is a
                self-evaluation tool designed to increase personal awareness. It
                is NOT a clinical diagnosis. These results should be reviewed
                with a qualified mental health professional or your BrainWorx
                coach for proper interpretation and guidance.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-600 border-b-4 border-blue-500 pb-3">
              📊 Your Complete Score Overview
            </h2>

            <div className="space-y-3">
              {patternsArray.map(([name, data]) => {
                const barClass = renderBarColor(data.score);
                return (
                  <div
                    key={name}
                    className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4"
                  >
                    <div className="md:w-60 font-semibold text-gray-800 text-sm md:text-base">
                      {data.code} - {name}
                    </div>
                    <div className="flex-1 h-9 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full flex items-center justify-end pr-4 text-white font-semibold text-sm ${barClass} transition-all duration-700 ease-out`}
                        style={{
                          width: animateBars ? `${data.score}%` : "0%",
                        }}
                      >
                        {data.score}%
                      </div>
                    </div>
                    <div className="w-16 text-right font-bold text-blue-600 text-sm md:text-base">
                      {data.score}%
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6 bg-slate-50 rounded-xl p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-500 to-red-700" />
                <span className="font-semibold text-gray-800 text-sm md:text-base">
                  High (60–100%): Requires attention
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500" />
                <span className="font-semibold text-gray-800 text-sm md:text-base">
                  Medium (40–59%): Monitor &amp; manage
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-sky-500 to-blue-600" />
                <span className="font-semibold text-gray-800 text-sm md:text-base">
                  Low (0–39%): Positive indicator
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-600 border-b-4 border-blue-500 pb-3">
              🔍 Your Pattern Analysis
            </h2>

            {highPatterns.length > 0 && (
              <div className="mb-6">
                <div className="rounded-t-2xl px-5 py-4 bg-gradient-to-r from-red-500 to-red-700 text-white text-lg md:text-xl font-semibold">
                  🔴 High Priority Patterns (60–100%)
                </div>
                <div className="border-2 border-red-500 border-t-0 rounded-b-2xl p-5 bg-white">
                  <p className="text-red-800 font-semibold mb-4 text-sm md:text-base">
                    These patterns scored above 60% and may require professional
                    attention and support.
                  </p>
                  <div>
                    {highPatterns.map(([name, data]) =>
                      renderPatternCard(name, data, "high")
                    )}
                  </div>
                </div>
              </div>
            )}

            {mediumPatterns.length > 0 && (
              <div className="mb-6">
                <div className="rounded-t-2xl px-5 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-lg md:text-xl font-semibold">
                  🟠 Medium Priority Patterns (40–59%)
                </div>
                <div className="border-2 border-amber-400 border-t-0 rounded-b-2xl p-5 bg-white">
                  <p className="text-amber-800 font-semibold mb-4 text-sm md:text-base">
                    These patterns are moderately present and would benefit from
                    awareness and management strategies.
                  </p>
                  <div>
                    {mediumPatterns.map(([name, data]) =>
                      renderPatternCard(name, data, "medium")
                    )}
                  </div>
                </div>
              </div>
            )}

            {lowPatterns.length > 0 && (
              <div className="mb-4">
                <div className="rounded-t-2xl px-5 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-lg md:text-xl font-semibold">
                  🔵 Low Priority Patterns (0–39%)
                </div>
                <div className="border-2 border-sky-500 border-t-0 rounded-b-2xl p-5 bg-white">
                  <p className="text-blue-900 font-semibold mb-4 text-sm md:text-base">
                    These patterns show minimal presence, indicating areas of
                    relative strength.
                  </p>
                  <div>
                    {lowPatterns.map(([name, data]) =>
                      renderPatternCard(name, data, "low")
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="bg-gradient-to-r from-amber-50 to-yellow-100 border-4 border-amber-400 rounded-2xl p-6 md:p-8 text-center space-y-4 print:hidden">
            <h3 className="text-2xl md:text-3xl font-bold text-amber-800">
              🎁 Congratulations!
            </h3>
            <p className="text-amber-800 text-base md:text-lg leading-relaxed">
              You&apos;ve completed the Neural Imprint Patterns™ assessment!
              <br />
              As a thank you, you&apos;re eligible for:
            </p>
            <div className="text-2xl md:text-3xl font-extrabold text-red-500">
              FREE 45-Minute Coaching Session
            </div>
            <p className="text-amber-800 text-sm md:text-base leading-relaxed">
              Work with a certified BrainWorx coach to:
              <br />
              ✓ Review your results in detail
              <br />
              ✓ Understand your patterns deeply
              <br />
              ✓ Create a personalized action plan
              <br />
              ✓ Get professional guidance and support
            </p>
            <a
              href="mailto:support@brainworx.com?subject=FREE 45-Minute Coaching Session"
              className="inline-block mt-2 px-8 py-3 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-teal-400 shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-transform"
            >
              Schedule Your FREE Session
            </a>
          </section>

          <section className="bg-gradient-to-r from-emerald-50 to-green-100 border-4 border-green-500 rounded-2xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
              🚀 Recommended Next Steps
            </h3>
            <ul className="space-y-3 list-none m-0 p-0 text-green-900 text-sm md:text-base">
              {[
                "Save or print this report for your records",
                "Schedule your FREE 45-minute coaching session",
                "Share results with your healthcare provider if appropriate",
                "Begin implementing small changes in high-priority areas",
                "Consider ongoing coaching for sustained growth and support",
              ].map((item) => (
                <li
                  key={item}
                  className="bg-white rounded-xl px-4 py-3 shadow-sm flex gap-3"
                >
                  <span className="text-green-600 text-xl font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <footer className="bg-slate-50 border-t-4 border-blue-500 px-6 md:px-8 py-8 space-y-4 text-center text-sm md:text-base text-gray-700">
          <div>
            <p className="font-semibold">Questions? Contact Us:</p>
            <p>
              📧 Email: support@brainworx.com
              <br />
              🌐 Website: www.brainworx.com
            </p>
          </div>

          <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 text-amber-800 text-xs md:text-sm text-left max-w-3xl mx-auto">
            <strong>Important Disclaimer:</strong>
            <br />
            This assessment is a self-evaluation tool for personal insight and
            is NOT a psychological evaluation or medical diagnosis. Results
            should be reviewed in conjunction with professional therapeutic
            support. This tool is not a substitute for professional medical or
            psychological diagnosis and treatment. If you are experiencing
            mental health concerns, please consult with a qualified healthcare
            provider.
            <br />
            <br />
            <strong>Crisis Support:</strong> If you are experiencing a mental
            health crisis, please contact your local emergency services or
            crisis hotline immediately.
          </div>

          <p className="text-xs text-gray-500 mt-2">
            © 2024 BrainWorx. All rights reserved. | Neural Imprint Patterns™
            is a trademark of BrainWorx.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ClientReport;
