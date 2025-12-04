import { ArrowLeft, ArrowRight, X } from 'lucide-react';

interface NeuralImprintPatternsInfoProps {
  onBack: () => void;
  onContinue: () => void;
}

export function NeuralImprintPatternsInfo({ onBack, onContinue }: NeuralImprintPatternsInfoProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative my-8">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={onBack}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
        >
          <X size={24} />
        </button>

        <div className="pt-4">
          <div className="max-h-[75vh] overflow-y-auto px-2">
            <div className="mb-6">
              <div className="flex items-start gap-4 mb-4">
                <img src="/brainworx-icon.png" alt="BrainWorx Logo" className="w-20 h-20" />
                <div>
                  <h2 className="text-3xl font-bold text-[#0A2A5E] mb-2">Neural Imprint Patterns</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Neural Imprint Patterns are deeply embedded psychological, behavioral, and cognitive configurations that form lasting imprints on brain structure and function through repeated experiences, trauma, environmental influences, or developmental conditioning. <span className="italic text-gray-600">These patterns act as mental and emotional templates that shape how individuals perceive, interpret, and respond to life circumstances.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* DIS */}
              <div className="border-2 border-blue-600 rounded-lg p-4 bg-blue-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">LIFE-CHANGING<br/>ILLNESS</span>
                </div>
                <h3 className="font-bold text-center mb-1">DIS</h3>
                <p className="text-xs text-center italic mb-2">Mind matters</p>
                <p className="text-xs leading-tight">Refers to unaddressed psychological or neurological conditions — such as depression, anxiety, chronic stress, obsessive tendencies, mood disorders, or trauma-related imbalances — that significantly impact daily functioning and have not yet received appropriate care or intervention.</p>
              </div>

              {/* ANG */}
              <div className="border-2 border-red-600 rounded-lg p-4 bg-red-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">😠</span>
                </div>
                <h3 className="font-bold text-center mb-1">ANG</h3>
                <p className="text-xs text-center italic mb-2">Anchored Anger</p>
                <p className="text-xs leading-tight">A persistent form of anger anchored in past experiences, marked by an inability to let go of resentment or grudges. It exists in two possible states:<br/><strong>*Expressed:</strong> openly felt and demonstrated or<br/><strong>*Latent:</strong> dormant but capable of re-emerging when triggered.</p>
              </div>

              {/* SHT */}
              <div className="border-2 border-red-600 rounded-lg p-4 bg-red-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">👨‍👦</span>
                </div>
                <h3 className="font-bold text-center mb-1">SHT</h3>
                <p className="text-xs text-center italic mb-2">Shattered Worth</p>
                <p className="text-xs leading-tight">An individual who has endured emotional damage caused by mistreatment — whether physical, verbal, or sexual — often carries a weakened sense of personal worth and dignity. Such experiences may stem from childhood, family settings, intimate relationships, workplaces, or broader social circles.</p>
              </div>

              {/* LACK */}
              <div className="border-2 border-gray-600 rounded-lg p-4 bg-gray-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">🧎</span>
                </div>
                <h3 className="font-bold text-center mb-1">LACK</h3>
                <p className="text-xs text-center italic mb-2">Lack state</p>
                <p className="text-xs leading-tight">A situation marked by limited access to key financial means or material support. The individual (or organization) experiences economic strain, dependency on others for essential needs, and restricted capacity to operate or sustain daily functions effectively.</p>
              </div>

              {/* NEG */}
              <div className="border-2 border-green-600 rounded-lg p-4 bg-green-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">✓</span>
                </div>
                <h3 className="font-bold text-center mb-1">NEG</h3>
                <p className="text-xs text-center italic mb-2">Unmet Needs</p>
                <p className="text-xs leading-tight">Refers to parenting styles that fail to nurture healthy emotional and cognitive growth. These parents may rely on punishment rather than guidance, neglect emotional connection, or lack awareness of how a child's brain and behavior develop — resulting in limited support and stimulation across key developmental areas.</p>
              </div>

              {/* BURN */}
              <div className="border-2 border-gray-600 rounded-lg p-4 bg-gray-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">🔥</span>
                </div>
                <h3 className="font-bold text-center mb-1">BURN</h3>
                <p className="text-xs text-center italic mb-2">Burned Out</p>
                <p className="text-xs leading-tight">When a person feels or behaves older than their years — mentally, emotionally, or physically — usually because of weariness, stress overload, or persistent health issues. It reflects a restricted view of life that drains energy and motivation.</p>
              </div>

              {/* DEC */}
              <div className="border-2 border-green-600 rounded-lg p-4 bg-green-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">🎭</span>
                </div>
                <h3 className="font-bold text-center mb-1">DEC</h3>
                <p className="text-xs text-center italic mb-2">Deceiver</p>
                <p className="text-xs leading-tight">An individual who masks self-serving motives with an appearance of goodness or innocence. Such people skillfully project sincerity but operate with hidden agendas, seeking to benefit at the expense of those who trust them.</p>
              </div>

              {/* INFLUENCE */}
              <div className="border-2 border-gray-600 rounded-lg p-4 bg-gray-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">🧠</span>
                </div>
                <h3 className="font-bold text-center mb-1">INFLUENCE</h3>
                <p className="text-xs text-center italic mb-2">Inside Out</p>
                <p className="text-xs leading-tight">Refers to where a person perceives the source of influence over their life decisions and outcomes to reside.<br/><strong>ELOC (External Locus of Control)</strong><br/>The conviction that life's direction is largely shaped by outside forces — people, circumstances, or systems rather than personal choice.<br/><strong>ILOC (Internal Locus of Control)</strong><br/>The belief that one's actions, discipline, and mindset are the main drivers of outcomes and success.</p>
              </div>

              {/* TRAP */}
              <div className="border-2 border-yellow-600 rounded-lg p-4 bg-yellow-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">🏢</span>
                </div>
                <h3 className="font-bold text-center mb-1">TRAP</h3>
                <p className="text-xs text-center italic mb-2">Home/Work</p>
                <p className="text-xs leading-tight">Spaces that ignore the need for conscious human growth, allowing people to simply "exist" instead of evolve.<br/>These settings — family, social, or professional — are not built around empowerment or personal progress, leaving individuals without meaningful encouragement or direction.</p>
              </div>

              {/* HOS */}
              <div className="border-2 border-red-600 rounded-lg p-4 bg-red-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">💔</span>
                </div>
                <h3 className="font-bold text-center mb-1">HOS</h3>
                <p className="text-xs text-center italic mb-2">Heartless</p>
                <p className="text-xs leading-tight">Describes an individual disconnected from compassion, conscience, and spiritual awareness.<br/>Such a person is self-centred, lacking empathy toward people, nature, or life itself — often capable of cruelty, deception, or harm without guilt or emotional concern. This mindset may align with traits associated with psychopathy.</p>
              </div>

              {/* BULLY */}
              <div className="border-2 border-purple-600 rounded-lg p-4 bg-purple-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">VICTIM</span>
                </div>
                <h3 className="font-bold text-center mb-1">BULLY</h3>
                <p className="text-xs text-center italic mb-2">X/I Victim</p>
                <p className="text-xs leading-tight"><strong>EVIC – External Victim</strong><br/>A recurring thought pattern in which someone sees themselves as powerless against outside forces or people who have caused them harm or disadvantage.<br/><strong>IVIC – Internal Victim</strong><br/>An inward-directed belief of self-blame — feeling unworthy, inferior, or never enough, and assuming personal failure lies within one's own identity.</p>
              </div>

              {/* LEFT/RIGHT */}
              <div className="border-2 border-blue-600 rounded-lg p-4 bg-blue-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">🔍</span>
                </div>
                <h3 className="font-bold text-center mb-1">LEFT / RIGHT</h3>
                <p className="text-xs text-center italic mb-2">Brain</p>
                <p className="text-xs leading-tight"><strong>Zi (Zoom In)</strong><br/>A thinking pattern that concentrates on specifics — analyzing details, structures, and step-by-step systems to understand how things function.<br/><strong>Zo (Zoom Out)</strong><br/>A broader reasoning style that views situations from a high-level perspective, connecting patterns and concepts to see the overall landscape.</p>
              </div>

              {/* CPL */}
              <div className="border-2 border-red-600 rounded-lg p-4 bg-red-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">ADICTION</span>
                </div>
                <h3 className="font-bold text-center mb-1">CPL</h3>
                <p className="text-xs text-center italic mb-2">Addictive Loops</p>
                <p className="text-xs leading-tight">A repeated drive toward actions that offer momentary comfort or enjoyment but carry damaging results. These behaviors usually serve as a way to avoid inner tension, emotional pain, or the emptiness of routine.</p>
              </div>

              {/* RES */}
              <div className="border-2 border-green-600 rounded-lg p-4 bg-green-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">😤</span>
                </div>
                <h3 className="font-bold text-center mb-1">RES</h3>
                <p className="text-xs text-center italic mb-2">Attitude</p>
                <p className="text-xs leading-tight">A consistent pattern of resistance or negativity expressed toward people, relationships, responsibilities, or life situations — shaping how one engages with the world around them.</p>
              </div>

              {/* NAR */}
              <div className="border-2 border-yellow-600 rounded-lg p-4 bg-yellow-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">♟️</span>
                </div>
                <h3 className="font-bold text-center mb-1">NAR</h3>
                <p className="text-xs text-center italic mb-2">Nar lens</p>
                <p className="text-xs leading-tight">An amplified belief in one's own importance that results in self-centred attitudes and choices, frequently disregarding the impact on those around them.</p>
              </div>

              {/* DOG */}
              <div className="border-2 border-blue-600 rounded-lg p-4 bg-blue-50">
                <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold text-center">INFLUENCE<br/>THE WORLD</span>
                </div>
                <h3 className="font-bold text-center mb-1">DOG</h3>
                <p className="text-xs text-center italic mb-2">Dogmatic Chains</p>
                <p className="text-xs leading-tight">A way of thinking rooted in old patterns and traditions that restrict how a person interprets or responds to everyday issues like relationships, lifestyle, or values. This outlook is shaped by deeply ingrained cultural or religious conditioning that limits openness to new perspectives.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onContinue}
              className="inline-flex items-center bg-[#0A2A5E] text-white px-8 py-4 rounded-lg hover:bg-[#3DB3E3] transition-all duration-300 font-medium text-lg"
            >
              Continue to Assessment
              <ArrowRight className="ml-2" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
