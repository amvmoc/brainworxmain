import React, { useState } from 'react';
import { Download, ExternalLink, X } from 'lucide-react';

export default function NeuralImprintPatterns() {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');

  const handleImageClick = (imageSrc: string) => {
    setModalImage(imageSrc);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-gray-700">
              Zoom:
              <input
                type="range"
                min="50"
                max="200"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="w-32"
              />
              <span className="font-medium w-12">{zoomLevel}%</span>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/nip 3 copy.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#0A2A5E] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1E4D8B] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </a>
            <a
              href="/nip 3 copy.pdf"
              download
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          </div>
        </div>

        <div className="overflow-auto border-2 border-gray-200 rounded-lg">
          <iframe
            src="/nip 3 copy.pdf#toolbar=0&navpanes=0&scrollbar=1"
            className="border-0 origin-top-left transition-transform duration-300"
            style={{
              width: `${100 * (100 / zoomLevel)}%`,
              height: `calc((100vh - 120px) * ${100 / zoomLevel})`,
              transform: `scale(${zoomLevel / 100})`
            }}
            title="Neural Imprint Patterns PDF"
          />
        </div>

        <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="mb-2">
            <strong>💡 Tip:</strong> Use the zoom slider above to enlarge the content for better readability.
          </p>
          <p>
            For best viewing experience, use "Open in New Tab" to view the PDF in your browser's native PDF viewer,
            which supports better zooming and navigation controls.
          </p>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={modalImage}
            alt="Enlarged view"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
