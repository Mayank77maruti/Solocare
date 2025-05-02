'use client';

import Navbar from '@/components/PagesUi/Navbar';
import VoiceChatControls from '@/components/PagesUi/VoiceChatControls';

export default function VoiceChat() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="patient" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Voice Assistant</h1>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              Use the voice assistant to describe your symptoms and get immediate guidance.
              The AI will analyze your input and provide relevant medical advice.
            </p>
          </div>

          <VoiceChatControls />

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4">How it works:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Click "Start Conversation" to begin recording</li>
              <li>Describe your symptoms clearly</li>
              <li>Click "Stop Conversation" when finished</li>
              <li>Wait for the AI to process your input</li>
              <li>Receive immediate guidance and next steps</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
} 