import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Search, X, Loader2, Volume2, Sparkles } from 'lucide-react';

interface VoiceSearchProps {
  onResult: (text: string) => void;
}

const VoiceSearch = ({ onResult }: VoiceSearchProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'zh-CN';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognitionRef.current.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      if (transcript) onResult(transcript);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-12 left-12 z-50">
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleListening}
        className={`w-18 h-18 rounded-[28px] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 transition-all duration-500 relative overflow-hidden group ${
          isListening ? 'bg-gradient-to-br from-[#D4AF37] to-[#8B0000]' : 'bg-gradient-to-br from-[#8B0000] to-[#722F37] backdrop-blur-xl'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
        {isListening ? (
          <div className="relative z-10">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-150 opacity-50" />
          </div>
        ) : (
          <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
        )}
      </motion.button>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.8 }}
            className="absolute left-24 bottom-0 bg-[#1A0707]/80 backdrop-blur-[40px] border border-white/10 p-8 rounded-[32px] w-[320px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#8B0000]" />
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-1.5 h-6 items-center">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 20, 4], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 bg-[#D4AF37] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                  />
                ))}
              </div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Voice Analyzing...</span>
            </div>
            <p className="text-base font-bold text-white leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              {transcript || '请说出您的需求，如“我想找环保类活动”...'}
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/20">
                <Search className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Web Speech AI Powered</span>
              </div>
              <X className="w-4 h-4 text-white/20 hover:text-white cursor-pointer" onClick={() => setIsListening(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceSearch;
