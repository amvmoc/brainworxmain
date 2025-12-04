interface HardwireScore {
  code: string;
  name: string;
  score: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

interface HardwiresHistogramProps {
  scores: HardwireScore[];
}

export function HardwiresHistogram({ scores }: HardwiresHistogramProps) {
  const maxScore = 100;
  const gridLines = [0, 20, 40, 60, 80, 100];

  const getBarColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'high': return '#F97316';
      case 'moderate': return '#EAB308';
      case 'low': return '#22C55E';
      default: return '#9CA3AF';
    }
  };

  const mean = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
  const sortedScores = [...scores].map(s => s.score).sort((a, b) => a - b);
  const median = sortedScores.length % 2 === 0
    ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
    : sortedScores[Math.floor(sortedScores.length / 2)];


  return (
    <div className="bg-white rounded-xl border-2 border-gray-300 p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-[#0A2A5E] mb-2">Strength & Development Scale</h3>
      </div>

      <div className="relative bg-white p-8">
        <div className="flex gap-4">
          <div className="flex flex-col justify-between text-xs font-semibold text-gray-600 pr-2 pb-8">
            <div>1.0</div>
            <div>0.8</div>
            <div>0.6</div>
            <div>0.4</div>
            <div>0.2</div>
            <div>0.0</div>
          </div>

          <div className="flex-1 relative pb-8">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((val) => (
                <div key={val} className="border-t border-gray-300"></div>
              ))}
            </div>

            <div className="relative h-full flex items-end justify-around gap-1 px-4">
              {scores.map((hw) => {
                const heightPercent = (hw.score / 100) * 100;
                return (
                  <div key={hw.code} className="flex flex-col items-center flex-1 max-w-[50px]">
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${heightPercent * 2}px`,
                        backgroundColor: getBarColor(hw.severity),
                      }}
                    ></div>
                    <div className="text-[10px] font-semibold text-gray-700 mt-2 -rotate-45 origin-top-left whitespace-nowrap">
                      {hw.code}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-300">
          <h4 className="font-bold text-[#0A2A5E] mb-4 text-lg">Individual NIP™ Scores</h4>
          <div className="grid grid-cols-2 gap-3">
            {scores.map((hw) => (
              <div key={hw.code} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border border-gray-600"
                  style={{ backgroundColor: getBarColor(hw.severity) }}
                ></div>
                <span className="text-sm font-medium">{hw.code}</span>
                <span className="text-sm text-gray-600">{hw.score}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-300">
          <h4 className="font-bold text-[#0A2A5E] mb-4 text-lg">Distribution Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Critical Level:</span>
              <span className="text-sm font-bold text-red-600">
                {scores.filter(s => s.severity === 'critical').length} patterns
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">High Level:</span>
              <span className="text-sm font-bold text-orange-600">
                {scores.filter(s => s.severity === 'high').length} patterns
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Moderate Level:</span>
              <span className="text-sm font-bold text-yellow-600">
                {scores.filter(s => s.severity === 'moderate').length} patterns
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Low Level:</span>
              <span className="text-sm font-bold text-green-600">
                {scores.filter(s => s.severity === 'low').length} patterns
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
