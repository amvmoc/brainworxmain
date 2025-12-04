import React from 'react';
import type { ClientInfo } from '../types/coachReport';

interface CoverPageProps {
  client: ClientInfo;
  assessmentDate: string;
}

const CoverPage: React.FC<CoverPageProps> = ({ client, assessmentDate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-cyan-500 flex items-center justify-center p-8 print:page-break-after-always">
      <div className="text-center text-white space-y-8">
        <div className="mb-8">
          <img
            src="/brainworx png for website copy.png"
            alt="BrainWorx Logo"
            className="h-22 mx-auto"
          />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Coach Report
        </h1>

        <div className="text-2xl md:text-3xl font-semibold opacity-90">
          Neural Imprint Professional Analysis
        </div>

        <div className="mt-16 space-y-4 text-xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
            <p className="text-sm opacity-75 mb-2">Client</p>
            <p className="font-bold text-2xl">{client.name}</p>
            <p className="text-sm opacity-75 mt-2">Age: {client.age}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block mx-4">
            <p className="text-sm opacity-75 mb-2">Assessment Type</p>
            <p className="font-semibold">{client.assessmentType}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
            <p className="text-sm opacity-75 mb-2">Assessment Date</p>
            <p className="font-semibold">{assessmentDate}</p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/30">
          <p className="text-sm opacity-75">Prepared by</p>
          <p className="font-semibold text-lg mt-2">{client.practitionerName}</p>
          <p className="text-sm opacity-75">Practitioner ID: {client.practitionerId}</p>
        </div>

        <div className="mt-16 text-sm opacity-75 max-w-2xl mx-auto">
          <p className="italic">
            This comprehensive report provides detailed analysis of neural imprint patterns
            and professional recommendations for intervention and support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoverPage;
