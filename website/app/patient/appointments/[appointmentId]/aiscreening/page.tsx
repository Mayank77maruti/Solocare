'use client';

import { useConversation } from '@11labs/react';
import { useCallback, useState, useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Activity } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export function Conversation() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;
  const [isAnimating, setIsAnimating] = useState(false);
  const [orbSize, setOrbSize] = useState(150);
  const [error, setError] = useState<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => {
      console.log('Disconnected');
      cleanupAudio();
    },
    onMessage: (message: any) => console.log('Message:', message),
    onError: (error: any) => {
      console.error('Error:', error);
      cleanupAudio();
    },
  });

  useEffect(() => {
    if (!isAnimating) return;

    const startAudioProcessing = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
        const analyser = audioContextRef.current.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateSize = () => {
          analyser.getByteFrequencyData(dataArray);
          const intensity = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setOrbSize(150 + intensity / 1.5);
          animationFrameRef.current = requestAnimationFrame(updateSize);
        };

        updateSize();
      } catch (error) {
        console.error('Error starting audio processing:', error);
        cleanupAudio();
      }
    };

    startAudioProcessing();

    return () => {
      cleanupAudio();
    };
  }, [isAnimating, cleanupAudio]);

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: "gov5FbZatBEOuAPlzyhF",
        dynamicVariables: { 
          prescreeningIdString: appointmentId
        },
      });
      setIsAnimating(true);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
      cleanupAudio();
    }
  }, [conversation, appointmentId, cleanupAudio]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      cleanupAudio();
      localStorage.setItem(`prescreening_done_${appointmentId}`, 'true');
      router.push(`/patient/appointments/${appointmentId}`);
    } catch (error) {
      console.error('Error stopping conversation:', error);
      cleanupAudio();
    }
  }, [conversation, cleanupAudio, router, appointmentId]);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Conversation ID Section */}
        <div className="mb-8 rounded-xl bg-white shadow p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" />
            AI-Conversation ID
          </h2>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="font-medium">{appointmentId}</p>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="mb-8 rounded-xl bg-white shadow p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" />
            Conversation Status
          </h2>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(conversation.status)}`}>
                {conversation.status}
              </span>
            </div>
          </div>
        </div>

        {/* Assistant Section */}
        <div className="mb-8 rounded-xl bg-white shadow p-6 text-center">
          <div className="relative w-[200px] h-[200px] mb-6 mx-auto">
            {isAnimating ? (
              <div
                style={{
                  width: `${orbSize}px`,
                  height: `${orbSize}px`,
                  transition: 'transform 0.1s ease-in-out',
                  transform: `scale(${orbSize / 150})`,
                }}
              >
                <DotLottieReact
                  src="https://lottie.host/a7b36d69-6632-4253-9dd4-2af58c428503/fVCwiZkYsj.lottie"
                  loop
                  autoplay
                />
              </div>
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                AI Assistant
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={startConversation}
              disabled={conversation.status === 'connected'}
              className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-full shadow-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              Start Conversation
            </button>
            <button
              onClick={stopConversation}
              disabled={conversation.status !== 'connected'}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full shadow-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              Stop Conversation
            </button>
          </div>

          <div className="flex gap-2 justify-center">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(conversation.status)}`}>
              {conversation.status}
            </span>
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800">
              {conversation.isSpeaking ? 'Speaking' : 'Listening'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Conversation;