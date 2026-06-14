import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MedItem {
  medicineName: string;
  dosage: string;
  duration: string;
  instructions?: string | null;
}

interface PrescriptionReadbackProps {
  doctorName?: string;
  items: MedItem[];
}

export default function PrescriptionReadback({ doctorName, items }: PrescriptionReadbackProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSupported(true);
    }
  }, []);

  const speak = () => {
    if (!supported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Build the narrative text in Hindi/Bilingual format for patient understanding
    let text = `नमस्ते, यह आपका प्रिस्क्रिप्शन है। `;
    if (doctorName) {
      text += `डॉक्टर ${doctorName} द्वारा लिखी गई दवाएं इस प्रकार हैं। `;
    } else {
      text += `आपके द्वारा ली जाने वाली दवाएं इस प्रकार हैं। `;
    }

    items.forEach((item, index) => {
      text += `दवा नंबर ${index + 1}: ${item.medicineName}। `;
      text += `खुराक: ${item.dosage}। `;
      text += `अवधि: ${item.duration}। `;
      if (item.instructions) {
        text += `निर्देश: ${item.instructions}। `;
      }
      text += `। `;
    });

    text += `कृपया समय पर दवा लें और आराम करें। धन्यवाद।`;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to locate a Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(
      (v) => v.lang.startsWith('hi') || v.lang.includes('IN') || v.name.toLowerCase().includes('hindi')
    );

    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }
    
    utterance.lang = 'hi-IN';
    utterance.rate = 0.85; // Slightly slower for clear understanding by elders
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported || !items || items.length === 0) return null;

  return (
    <div className="mt-4 mb-6 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSpeaking ? 'bg-emerald-100 animate-pulse text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
          {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-800 leading-tight">प्रिस्क्रिप्शन सुनें (Listen Rx)</h4>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">Hindi Audio Guidance for Elders</p>
        </div>
      </div>
      <Button
        onClick={speak}
        size="sm"
        className={`h-10 px-4 rounded-xl font-black text-xs gap-2 transition-all active:scale-95 ${isSpeaking ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10'}`}
      >
        {isSpeaking ? (
          <>
            <Square className="w-3.5 h-3.5" /> बंद करें (Stop)
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" /> सुनें (Listen)
          </>
        )}
      </Button>
    </div>
  );
}
