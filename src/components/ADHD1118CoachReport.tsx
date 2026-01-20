import { X } from 'lucide-react';
import { PATTERN_INFO, getSeverityLabel1118, scoreToPercentage, PatternId } from '../data/adhd1118AssessmentQuestions';

interface PatternScore {
  code: string;
  name: string;
  category: string;
  teenScore: number;
  teenLabel: string;
  percentage: number;
}

interface ADHD1118CoachReportProps {
  teenInfo: {
    name: string;
    age: number;
  };
  teenEmail: string;
  coachInfo?: {
    name: string;
  };
  patterns: PatternScore[];
  date: string;
  onClose: () => void;
}

export default function ADHD1118CoachReport({
  teenInfo,
  teenEmail,
  coachInfo,
  patterns,
  date,
  onClose
}: ADHD1118CoachReportProps) {
  const corePatterns = patterns.filter(p => p.category === 'Core ADHD');
  const emotionalPatterns = patterns.filter(p => p.category === 'Impact / Emotional');

  const PatternCard = ({ pattern }: { pattern: PatternScore }) => {
    const info = PATTERN_INFO[pattern.code as PatternId];
    const percentage = scoreToPercentage(pattern.teenScore);
    const severity = getSeverityLabel1118(pattern.teenScore);

    let severityColor = 'text-green-600';
    let barColor = 'bg-green-500';
    if (percentage > 66) {
      severityColor = 'text-red-600';
      barColor = 'bg-red-500';
    } else if (percentage > 33) {
      severityColor = 'text-amber-600';
      barColor = 'bg-amber-500';
    }

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-[#0A2A5E]">{pattern.name}</h3>
            {info && <p className="text-sm text-gray-600">{info.shortDescription}</p>}
          </div>
          <span className={`text-sm font-bold ${severityColor}`}>{severity}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Score: {pattern.teenScore.toFixed(2)}</span>
          <span>{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative min-h-screen">
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[110] bg-white text-gray-900 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-300 hover:border-gray-500"
        >
          <X size={24} />
        </button>
        <div className="bg-white p-12">
          <h1 className="text-4xl font-bold text-[#0A2A5E] mb-2">ADHD 11-18 Assessment Coach Report</h1>
          <p className="text-gray-600 text-lg mb-8">For {teenInfo.name}, Age {teenInfo.age}</p>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Core ADHD Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {corePatterns.map(pattern => (
                <PatternCard key={pattern.code} pattern={pattern} />
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#0A2A5E] mb-6">Impact & Emotional Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emotionalPatterns.map(pattern => (
                <PatternCard key={pattern.code} pattern={pattern} />
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-[#0A2A5E] mb-3">Assessment Information</h3>
            <div className="text-gray-700 space-y-1">
              <p><strong>Teen Name:</strong> {teenInfo.name}</p>
              <p><strong>Age:</strong> {teenInfo.age}</p>
              <p><strong>Email:</strong> {teenEmail}</p>
              <p><strong>Assessment Date:</strong> {date}</p>
              {coachInfo && <p><strong>Coach:</strong> {coachInfo.name}</p>}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="font-semibold text-[#0A2A5E] mb-2">Coaching Notes</h3>
            <p className="text-gray-700">This assessment provides a comprehensive view of the teen's self-reported ADHD-style patterns across core domains and emotional impacts. Use these scores to inform coaching conversations, identify areas for support, and track progress over time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
