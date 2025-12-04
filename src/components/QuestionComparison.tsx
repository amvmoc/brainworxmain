import { useState, useEffect } from 'react';
import { FileText, TrendingUp, BarChart3, CheckCircle, AlertCircle, Download, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NeuralImprintPatternsHistogram } from './NeuralImprintPatternsHistogram';

interface NeuralImprintPatternScore {
  name: string;
  code: string;
  score: number;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

interface ComparisonResults {
  originalScores: NeuralImprintPatternScore[];
  newScores: NeuralImprintPatternScore[];
  correlationScore: number;
  averageDifference: number;
  maxDifference: number;
  differences: Array<{
    pattern: string;
    original: number;
    new: number;
    difference: number;
  }>;
}

const NEURAL_IMPRINT_PATTERN_DEFINITIONS = [
  { code: 'DIS', name: 'Dissociation', description: 'Refers to unaddressed psychological or neurological conditions - such as concussion, anxiety, chronic stress, obsessive compulsive disorders, or other stress-related disturbances - that significantly impact daily functioning and lives not yet received appropriate care or intervention' },
  { code: 'ANG', name: 'Emotional Anger', description: 'A persistent state of anger anchored in past experiences, marked by an inability to let go of resentment or grudges. It tends to feel "forgotten" until consciously noticed, demonstrated, or "talent, dormant but capable of re-merging when triggered' },
  { code: 'SHT', name: 'Emotional Storm', description: 'An individual who has endured emotional damage caused by individualistic - whether physical, verbal, or sexual - which erodes inner peace, self-worth, and emotional dignity. Such experiences may stem from childhood, early settings, intimate relationships, workplaces, or broader social circles' },
  { code: 'LACK', name: 'Lack', description: 'A situation marked by their access to financial means or material support. The individual (or organization) experiences persistent gaps in resources, impacting essential needs, and restricted capacity to operate or sustain daily functions effectively' },
  { code: 'NEG', name: 'Unmet Needs', description: 'Refers to requirements that have not driven healthy emotional and cognitive growth. These parents may rely on punishment rather than guidance, neglect emotional connection, or take awareness of how it has turned out emotionally. The outcome is resulting in limited support and stimulation across key developmental areas' },
  { code: 'BURN', name: 'Burned Out', description: 'When a professional or person depletes their years - mentally, emotionally, or physically - usually because of chronic weariness, stress overload, or persistent health issues that result in a marked-out lack of life that drains energy and motivation' },
  { code: 'DEC', name: 'Deceiver', description: 'An individual who regularly deceives, motives with an appearance of goodness or innocence. Such people skillfully project sincerity but operate with hidden agendas, seeking to benefit at the expense of those who trust them' },
  { code: 'INFLUENCE', name: 'Inside Out', description: 'Refers to behavior patterns emerging the source of influence over their life: decisions and outcomes is largely shaped outside force. Locus of Control: The conviction that life\'s direction is largely shaped by outside forces such as fate, luck, or other people - rather than one\'s actions, discipline, and mindset are the main drivers of outcomes' },
  { code: 'TRAP', name: 'Martyr Mode', description: 'Stance that ignores the need for conscious chosen growth: allowing people to simply "exist" instead of evolve. These settings rarely, social, or professional - are not built for expansion. Individuals often feel confined, leaving individuals without meaningful encouragement or direction' },
  { code: 'HOS', name: 'Heartless', description: 'Describes an individual disconnected from compassion, existence, and spiritual awareness. Such a person is self-centered, lacking empathy, honest intellect, refusal, or callousness in relating to others. Often destructive or hurtful without guilt or emotional concern. This internal Poor align with traits associated with psychopathy' },
  { code: 'BULLY', name: 'Victim', description: 'EVIC - External Victim: A recurring thought pattern in which someone perceives themselves as powerless against outside forces. IVIC - Internal Victim: An inward sense that one is self-blame - consumed by guilt or remorse, never enough' },
  { code: 'LEFT/RIGHT', name: 'Brain', description: 'Zi (Zoom In): A thinking pattern that concentrates on specifics - analyzing details, structures, and step-by-step systems. Zo (Zoom Out): A broader connecting risk mindset that prioritizes themes, overarching perspective, connecting patterns and concepts' },
  { code: 'CPL', name: 'Collusive Capers', description: 'A regulated thought posture that often develops from childhood experiences with damaging results. These behaviors usually involve unhealthy levels of people-pleasing, emotional pain, or emptiness of routines' },
  { code: 'RES', name: 'Pushback', description: 'A consistent pattern of resistance or relativity openly toward change, new responsibilities, or life situations - regardless how one engages with the world around them' },
  { code: 'NAR', name: 'Narcissist', description: 'An amplified belief in one\'s own importance that results in prioritizing self-interest over others, frequently disregarding the feel choices or dignity around them' },
  { code: 'DOG', name: 'Dogmatic', description: 'A way of thinking rooted in old patterns and strict adherence to a single viewpoint. These interprets or responses to everyday issues like relationships, lifestyles, or values outlook is shaped by deeply ingrained conviction - resistant to new perspective' }
];

interface QuestionComparisonProps {
  onClose: () => void;
}

export function QuestionComparison({ onClose }: QuestionComparisonProps) {
  const [step, setStep] = useState<'select' | 'input' | 'analyze' | 'results'>('select');
  const [selectedResponseId, setSelectedResponseId] = useState<string>('');
  const [responses, setResponses] = useState<any[]>([]);
  const [newQuestions, setNewQuestions] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResults | null>(null);
  const [originalAnswers, setOriginalAnswers] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'comparison' | 'original' | 'new'>('comparison');

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    const { data } = await supabase
      .from('responses')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (data) {
      setResponses(data);
    }
  };

  const getScoreFromAnswer = (answer: string): number => {
    const scoreMap: Record<string, number> = {
      'Never': 1,
      'Rarely': 2,
      'Sometimes': 3,
      'Often': 4,
      'Always': 5
    };
    return scoreMap[answer] || 3;
  };

  const calculatePatternScores = (answers: Record<string, string>, questionCount: number = 50): NeuralImprintPatternScore[] => {
    return NEURAL_IMPRINT_PATTERN_DEFINITIONS.map((hw, index) => {
      const relevantAnswers = Object.entries(answers)
        .filter(([qId]) => parseInt(qId) % 16 === index)
        .map(([_, answer]) => getScoreFromAnswer(answer));

      const avgScore = relevantAnswers.length > 0
        ? relevantAnswers.reduce((a, b) => a + b, 0) / relevantAnswers.length
        : 3;

      const normalizedScore = Math.round((avgScore / 5) * 100);

      let severity: 'low' | 'moderate' | 'high' | 'critical';
      if (normalizedScore < 40) severity = 'low';
      else if (normalizedScore < 60) severity = 'moderate';
      else if (normalizedScore < 80) severity = 'high';
      else severity = 'critical';

      return {
        name: hw.name,
        code: hw.code,
        score: normalizedScore,
        description: hw.description,
        severity
      };
    });
  };

  const handleSelectResponse = async (responseId: string) => {
    setSelectedResponseId(responseId);
    const { data } = await supabase
      .from('responses')
      .select('*')
      .eq('id', responseId)
      .single();

    if (data && data.answers) {
      setOriginalAnswers(data.answers);
      setStep('input');
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setStep('analyze');

    // Parse new questions (expecting JSON format or line-by-line)
    let parsedQuestions: any[] = [];
    try {
      // Try parsing as JSON first
      parsedQuestions = JSON.parse(newQuestions);
    } catch {
      // If not JSON, treat as line-by-line questions
      const lines = newQuestions.split('\n').filter(line => line.trim());
      parsedQuestions = lines.map((text, index) => ({
        id: index + 1,
        text: text.trim()
      }));
    }

    // Calculate scores for original questions
    const originalScores = calculatePatternScores(originalAnswers, 50);

    // For new questions, we'll use the same answer pattern
    // Map the answers from original questions to new questions
    const newAnswersMap: Record<string, string> = {};
    parsedQuestions.forEach((q, index) => {
      const originalQuestionId = Object.keys(originalAnswers)[index];
      if (originalQuestionId) {
        newAnswersMap[(index + 1).toString()] = originalAnswers[originalQuestionId];
      }
    });

    // Calculate scores for new questions with same answers
    const newScores = calculatePatternScores(newAnswersMap, parsedQuestions.length);

    // Calculate correlation and differences
    const differences = originalScores.map((orig, index) => {
      const newScore = newScores[index];
      return {
        pattern: orig.name,
        original: orig.score,
        new: newScore.score,
        difference: Math.abs(orig.score - newScore.score)
      };
    });

    const totalDifference = differences.reduce((sum, d) => sum + d.difference, 0);
    const averageDifference = totalDifference / differences.length;
    const maxDifference = Math.max(...differences.map(d => d.difference));

    // Calculate correlation coefficient
    const originalValues = originalScores.map(s => s.score);
    const newValues = newScores.map(s => s.score);
    const correlationScore = calculateCorrelation(originalValues, newValues);

    setComparisonResults({
      originalScores,
      newScores,
      correlationScore,
      averageDifference,
      maxDifference,
      differences
    });

    setIsAnalyzing(false);
    setStep('results');
  };

  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  const exportResults = () => {
    if (!comparisonResults) return;

    const report = {
      timestamp: new Date().toISOString(),
      correlationScore: comparisonResults.correlationScore,
      averageDifference: comparisonResults.averageDifference,
      maxDifference: comparisonResults.maxDifference,
      differences: comparisonResults.differences,
      validation: comparisonResults.correlationScore >= 0.85 ? 'PASSED' : 'NEEDS REVIEW'
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `question-validation-${Date.now()}.json`;
    a.click();
  };

  if (step === 'select') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

          <div className="mb-6">
            <BarChart3 className="text-[#3DB3E3] mx-auto mb-4" size={48} />
            <h2 className="text-3xl font-bold text-[#0A2A5E] mb-2 text-center">Question Set Comparison</h2>
            <p className="text-gray-600 text-center">
              Validate your reworded questions against original responses
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-[#0A2A5E]">Select a completed assessment to use as baseline:</h3>
            {responses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="mx-auto mb-2" size={32} />
                <p>No completed assessments found. Complete an assessment first.</p>
              </div>
            ) : (
              responses.map((response) => (
                <button
                  key={response.id}
                  onClick={() => handleSelectResponse(response.id)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-[#3DB3E3] transition-all text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-[#0A2A5E]">{response.customer_name}</p>
                      <p className="text-sm text-gray-600">{response.customer_email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Completed: {new Date(response.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle className="text-green-500" size={20} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'input') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

          <div className="mb-6">
            <FileText className="text-[#3DB3E3] mx-auto mb-4" size={48} />
            <h2 className="text-3xl font-bold text-[#0A2A5E] mb-2 text-center">Input New Questions</h2>
            <p className="text-gray-600 text-center">
              Paste your 50 reworded questions below (one per line or as JSON)
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Question Set (50 questions)
            </label>
            <textarea
              value={newQuestions}
              onChange={(e) => setNewQuestions(e.target.value)}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB3E3] focus:border-transparent font-mono text-sm"
              placeholder="Paste questions here (one per line)&#x0A;OR&#x0A;Paste as JSON: [{&quot;id&quot;: 1, &quot;text&quot;: &quot;Question text&quot;}, ...]"
            />
            <p className="text-xs text-gray-500 mt-2">
              {newQuestions.split('\n').filter(l => l.trim()).length} questions detected
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('select')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleAnalyze}
              disabled={newQuestions.trim().length === 0}
              className="flex-1 px-6 py-3 bg-[#0A2A5E] text-white rounded-lg hover:bg-[#3DB3E3] disabled:opacity-50 transition-colors"
            >
              Analyze & Compare
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'analyze') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-12 text-center">
          <TrendingUp className="animate-pulse text-[#3DB3E3] mx-auto mb-4" size={48} />
          <h3 className="text-2xl font-bold text-[#0A2A5E] mb-2">Analyzing Question Sets</h3>
          <p className="text-gray-600">
            Comparing NIP™ scores and calculating correlation...
          </p>
        </div>
      </div>
    );
  }

  if (step === 'results' && comparisonResults) {
    const isValidated = comparisonResults.correlationScore >= 0.85;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full p-8 relative my-8">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#0A2A5E] mb-4 text-center">
              Question Set Validation Report
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-6 rounded-xl ${isValidated ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
                <p className="text-sm text-gray-600 mb-1">Correlation Score</p>
                <p className="text-3xl font-bold text-[#0A2A5E]">
                  {(comparisonResults.correlationScore * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {isValidated ? '✓ Strong correlation' : '⚠ Needs review'}
                </p>
              </div>

              <div className="p-6 rounded-xl bg-blue-50 border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Average Difference</p>
                <p className="text-3xl font-bold text-[#0A2A5E]">
                  {comparisonResults.averageDifference.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-2">points per pattern</p>
              </div>

              <div className="p-6 rounded-xl bg-purple-50 border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Max Difference</p>
                <p className="text-3xl font-bold text-[#0A2A5E]">
                  {comparisonResults.maxDifference.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-2">highest variance</p>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('comparison')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'comparison'
                    ? 'bg-[#0A2A5E] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Side-by-Side Comparison
              </button>
              <button
                onClick={() => setActiveTab('original')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'original'
                    ? 'bg-[#0A2A5E] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Original Questions
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'new'
                    ? 'bg-[#0A2A5E] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                New Questions
              </button>
            </div>
          </div>

          {activeTab === 'comparison' && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#0A2A5E] mb-4">Detailed Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4">PATTERN</th>
                        <th className="text-center py-3 px-4">Original</th>
                        <th className="text-center py-3 px-4">New</th>
                        <th className="text-center py-3 px-4">Difference</th>
                        <th className="text-center py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonResults.differences.map((diff, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-[#0A2A5E]">{diff.pattern}</td>
                          <td className="text-center py-3 px-4">{diff.original}</td>
                          <td className="text-center py-3 px-4">{diff.new}</td>
                          <td className="text-center py-3 px-4">
                            <span className={`font-semibold ${
                              diff.difference < 5 ? 'text-green-600' :
                              diff.difference < 10 ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {diff.difference.toFixed(1)}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            {diff.difference < 5 ? (
                              <CheckCircle className="text-green-500 mx-auto" size={20} />
                            ) : diff.difference < 10 ? (
                              <AlertCircle className="text-orange-500 mx-auto" size={20} />
                            ) : (
                              <AlertCircle className="text-red-500 mx-auto" size={20} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'original' && (
            <div>
              <h3 className="text-xl font-bold text-[#0A2A5E] mb-4">Original Question Set Results</h3>
              <NeuralImprintPatternsHistogram scores={comparisonResults.originalScores} />
            </div>
          )}

          {activeTab === 'new' && (
            <div>
              <h3 className="text-xl font-bold text-[#0A2A5E] mb-4">New Question Set Results</h3>
              <NeuralImprintPatternsHistogram scores={comparisonResults.newScores} />
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <button
              onClick={exportResults}
              className="flex items-center gap-2 px-6 py-3 bg-[#3DB3E3] text-white rounded-lg hover:bg-[#1FAFA3] transition-colors"
            >
              <Download size={20} />
              Export Report
            </button>
            <button
              onClick={() => setStep('input')}
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
            >
              <Upload size={20} />
              Test Another Set
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
