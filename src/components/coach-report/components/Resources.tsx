import React from 'react';
import type { ResourceCategory } from '../types/coachReport';

interface ResourcesProps {
  resources: ResourceCategory[];
}

const Resources: React.FC<ResourcesProps> = ({ resources }) => {
  return (
    <div className="bg-white p-8 print:page-break-before-always">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="text-4xl">📚</span>
            Resources & Support
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-900 to-cyan-500 rounded"></div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-8 border-l-4 border-blue-900">
          <p className="text-gray-700 leading-relaxed">
            These carefully selected resources provide additional support, education, and tools to
            complement your neural imprint work. Each resource has been chosen for its evidence-based
            approach and relevance to your specific profile.
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-8">
          {resources.map((category, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all print:page-break-inside-avoid"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-cyan-500 rounded-full flex items-center justify-center text-3xl">
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{category.category}</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {category.resources.map((resource, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-4 border-l-4 border-cyan-500 hover:-translate-y-1 transition-transform"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 flex-1">{resource.title}</h4>
                      <span className="ml-2 px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full font-medium">
                        {resource.type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{resource.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-green-50 border-2 border-green-300 rounded-xl p-6">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <span>💡</span> Getting the Most from Your Resources
          </h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Start with 1-2 resources and gradually incorporate others as needed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Schedule specific times for resource engagement rather than waiting for motivation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Discuss insights and questions with your practitioner during sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Keep track of which resources are most helpful for your specific needs</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Resources;
