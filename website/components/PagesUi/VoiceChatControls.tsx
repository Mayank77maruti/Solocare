'use client';

import { useState } from 'react';

export default function VoiceChatControls() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(true);
    // Mock ElevenLabs connection
    console.log('Connecting to ElevenLabs...');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    // Mock processing
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleStartRecording}
          disabled={isRecording || isProcessing}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isRecording || isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Start Conversation
        </button>
        <button
          onClick={handleStopRecording}
          disabled={!isRecording || isProcessing}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            !isRecording || isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Stop Conversation
        </button>
      </div>
      
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center space-x-2">
          {isRecording && (
            <div className="flex space-x-1">
              <div className="w-2 h-4 bg-blue-600 rounded animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-4 bg-blue-600 rounded animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-4 bg-blue-600 rounded animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          {isProcessing && (
            <div className="text-gray-600">
              Processing voice input...
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        {isRecording
          ? 'Recording in progress...'
          : isProcessing
          ? 'Processing voice input...'
          : 'Click "Start Conversation" to begin'}
      </div>
    </div>
  );
} 