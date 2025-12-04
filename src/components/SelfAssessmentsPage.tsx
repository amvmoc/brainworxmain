// Self-assessments with mandatory payment gateway
import { useState } from 'react';
import { Briefcase, Users, Brain, Heart, ArrowRight, X, CheckCircle, Clock } from 'lucide-react';
import { selfAssessmentTypes } from '../data/selfAssessmentQuestions';
import { SelfAssessmentQuestionnaire } from './SelfAssessmentQuestionnaire';

interface SelfAssessmentsPageProps {
  onClose: () => void;
  onStartPayment?: (paymentType: 'nipa' | 'tcf' | 'tadhd' | 'pcadhd') => void;
}

export function SelfAssessmentsPage({ onClose, onStartPayment }: SelfAssessmentsPageProps) {
  const [selectedAssessment, setSelectedAssessment] = useState<typeof selfAssessmentTypes[0] | null>(null);
  const [selectedNIPA, setSelectedNIPA] = useState(false);

  const nipaCard = {
    id: 'nipa',
    name: 'NIPA - Full Neural Imprint Assessment',
    description: 'The comprehensive 344-question Neural Imprint Patterns Assessment (NIPA) provides an in-depth analysis of your cognitive patterns, emotional responses, behavioral tendencies, and life experiences. This flagship assessment offers the most complete profile of your neural imprints.',
    icon: Brain,
    color: 'from-[#0A2A5E] to-[#3DB3E3]',
    iconColor: 'text-[#0A2A5E]',
    borderColor: 'border-[#0A2A5E]',
    bgColor: 'bg-[#0A2A5E]/10',
    targetAudience: 'Adults & Teens 16+',
    questionCount: 344,
    price: 'R950',
    features: [
      'Complete neural imprint profile',
      '45-minute debrief session included',
      'Comprehensive pattern analysis',
      'Detailed recommendations',
      'Cognitive & emotional insights',
      'Behavioral tendency mapping'
    ],
    instructions: 'Answer all questions honestly based on your current experiences and feelings. There are no right or wrong answers. The assessment typically takes 45-60 minutes to complete. You can save your progress and return at any time.',
    disclaimer: 'This is a self-reflection and coaching tool, not a clinical diagnostic instrument. It is designed to support personal growth and self-awareness.'
  };

  const assessmentCards = [
    {
      type: 'nipa',
      ...nipaCard
    },
    {
      type: selfAssessmentTypes[0],
      icon: Briefcase,
      color: 'from-[#3DB3E3] to-[#1FAFA3]',
      iconColor: 'text-[#3DB3E3]',
      borderColor: 'border-[#3DB3E3]',
      bgColor: 'bg-[#3DB3E3]/10',
      targetAudience: 'Ages 12-18',
      features: [
        'Discover your career interests',
        'Identify ideal work environments',
        'Understand your learning style',
        'Plan your future path'
      ]
    },
    {
      type: selfAssessmentTypes[1],
      icon: Brain,
      color: 'from-orange-500 to-red-500',
      iconColor: 'text-orange-500',
      borderColor: 'border-orange-500',
      bgColor: 'bg-orange-50',
      targetAudience: 'Teens (Ages 12-18)',
      features: [
        'Understand attention patterns',
        'Identify energy management challenges',
        'Recognize emotional responses',
        'Discover helpful strategies'
      ]
    },
    {
      type: selfAssessmentTypes[2],
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-50',
      targetAudience: 'Parents/Caregivers',
      features: [
        'Observe focus and attention patterns',
        'Track energy and engagement levels',
        'Understand emotional responses',
        'Identify areas needing support'
      ]
    }
  ];

  // Show detailed NIPA assessment info page
  if (selectedNIPA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] via-white to-[#E6E9EF]">
        <div className="container mx-auto px-6 py-12">
          <button
            onClick={() => setSelectedNIPA(false)}
            className="fixed top-4 right-4 z-50 bg-white text-gray-600 hover:text-gray-900 rounded-full p-3 shadow-lg"
          >
            <X size={24} />
          </button>

          <div className="max-w-4xl mx-auto">
            <div className={`bg-gradient-to-r ${nipaCard.color} rounded-3xl p-8 text-white mb-8`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <nipaCard.icon size={48} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{nipaCard.name}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-white/90">
                      <Clock size={16} />
                      {nipaCard.questionCount} questions
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {nipaCard.targetAudience}
                    </span>
                    <span className="px-3 py-1 bg-[#1FAFA3] rounded-full text-sm font-bold">
                      {nipaCard.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">About This Assessment</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {nipaCard.description}
              </p>

              <div className={`${nipaCard.bgColor} border ${nipaCard.borderColor} rounded-xl p-6 mb-6`}>
                <h3 className="font-bold text-[#0A2A5E] mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#1FAFA3]" />
                  What You'll Discover:
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {nipaCard.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-[#1FAFA3] mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-[#0A2A5E] mb-3">How to Answer</h3>
                <div className="text-gray-700 whitespace-pre-line">
                  {nipaCard.instructions}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-[#0A2A5E] mb-3">Important Disclaimer</h3>
                <p className="text-gray-700">
                  {nipaCard.disclaimer}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedNIPA(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-300 transition-all duration-300 font-bold text-lg"
                >
                  Back to Assessments
                </button>
                <button
                  onClick={() => {
                    if (onStartPayment) {
                      onStartPayment('nipa');
                    }
                  }}
                  className={`flex-1 bg-gradient-to-r ${nipaCard.color} text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group`}
                >
                  Proceed to Payment
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show detailed assessment info page
  if (selectedAssessment) {
    const card = assessmentCards.find(c => typeof c.type !== 'string' && c.type.id === selectedAssessment.id)!;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] via-white to-[#E6E9EF]">
        <div className="container mx-auto px-6 py-12">
          <button
            onClick={() => setSelectedAssessment(null)}
            className="fixed top-4 right-4 z-50 bg-white text-gray-600 hover:text-gray-900 rounded-full p-3 shadow-lg"
          >
            <X size={24} />
          </button>

          <div className="max-w-4xl mx-auto">
            <div className={`bg-gradient-to-r ${card.color} rounded-3xl p-8 text-white mb-8`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <card.icon size={48} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{selectedAssessment.name}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-white/90">
                      <Clock size={16} />
                      {selectedAssessment.questions.length} questions
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {card.targetAudience}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#0A2A5E] mb-4">About This Assessment</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {selectedAssessment.description}
              </p>

              <div className={`${card.bgColor} border ${card.borderColor} rounded-xl p-6 mb-6`}>
                <h3 className="font-bold text-[#0A2A5E] mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-[#1FAFA3]" />
                  What You'll Discover:
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {card.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-[#1FAFA3] mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-[#0A2A5E] mb-3">How to Answer</h3>
                <div className="text-gray-700 whitespace-pre-line">
                  {selectedAssessment.instructions}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-[#0A2A5E] mb-3">Important Disclaimer</h3>
                <p className="text-gray-700">
                  {selectedAssessment.disclaimer}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedAssessment(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-300 transition-all duration-300 font-bold text-lg"
                >
                  Back to Assessments
                </button>
                <button
                  onClick={() => {
                    const paymentTypeMap: Record<string, 'tcf' | 'tadhd' | 'pcadhd'> = {
                      'teen-career': 'tcf',
                      'teen-adhd': 'tadhd',
                      'parent-adhd': 'pcadhd'
                    };
                    const paymentType = paymentTypeMap[selectedAssessment.id];
                    if (onStartPayment) {
                      onStartPayment(paymentType);
                    }
                  }}
                  className={`flex-1 bg-gradient-to-r ${card.color} text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group`}
                >
                  Proceed to Payment
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6E9EF] via-white to-[#E6E9EF]">
      <div className="container mx-auto px-6 py-12">
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-50 bg-white text-gray-600 hover:text-gray-900 rounded-full p-3 shadow-lg"
        >
          <X size={24} />
        </button>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-[#0A2A5E] mb-4">
              Self-Assessments
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our specialized assessments designed to help you understand your neural imprint patterns,
              career preferences, and personal development opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {assessmentCards.map((card, index) => {
              const isNIPA = card.type === 'nipa';
              const cardData = isNIPA ? card : { ...card, type: card.type as typeof selfAssessmentTypes[0] };

              return (
                <div
                  key={index}
                  className={`bg-white rounded-3xl shadow-xl overflow-hidden border-2 ${card.borderColor} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className={`bg-gradient-to-r ${card.color} p-8 text-white`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                        <card.icon size={48} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">
                          {isNIPA ? card.name : cardData.type.name}
                        </h2>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-white/90">
                            <Clock size={16} />
                            {isNIPA ? card.questionCount : cardData.type.questions.length} questions
                          </span>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                            {card.targetAudience}
                          </span>
                          {isNIPA && (
                            <span className="px-3 py-1 bg-[#1FAFA3] rounded-full text-sm font-bold">
                              {card.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="mb-6">
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {isNIPA ? card.description : cardData.type.description}
                      </p>
                    </div>

                    <div className={`${card.bgColor} border ${card.borderColor} rounded-xl p-6 mb-6`}>
                      <h3 className="font-bold text-[#0A2A5E] mb-3 flex items-center gap-2">
                        <CheckCircle size={20} className="text-[#1FAFA3]" />
                        What You'll Discover:
                      </h3>
                      <ul className="grid md:grid-cols-2 gap-3">
                        {card.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-[#1FAFA3] mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                      <p className="text-sm text-gray-700">
                        <strong>Important:</strong> {isNIPA ? card.disclaimer : cardData.type.disclaimer}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (isNIPA) {
                          setSelectedNIPA(true);
                        } else {
                          setSelectedAssessment(cardData.type);
                        }
                      }}
                      className={`w-full bg-gradient-to-r ${card.color} text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 group`}
                    >
                      Learn More
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-[#0A2A5E] to-[#3DB3E3] rounded-3xl p-8 md:p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Need Help Choosing?</h3>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Each assessment provides unique insights into your neural imprint patterns. You can take multiple
              assessments to get a comprehensive understanding of your strengths and areas for growth.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-2">🎯</div>
                <h4 className="font-bold mb-2">Personalized</h4>
                <p className="text-sm text-white/80">Tailored insights based on your unique responses</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-2">📊</div>
                <h4 className="font-bold mb-2">Detailed Reports</h4>
                <p className="text-sm text-white/80">Comprehensive analysis with actionable recommendations</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-2">💾</div>
                <h4 className="font-bold mb-2">Save & Resume</h4>
                <p className="text-sm text-white/80">Complete at your own pace, anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
