import React, { useState, useEffect, useRef } from 'react';
import { useIoT } from '../context/IoTContext';
import { Mic, Volume2, HelpCircle, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VoiceController: React.FC = () => {
  const { updateRelay, setAllRelays, setLightMode, addLog } = useIoT();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Siap menerima perintah');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lastRecognizedCommand, setLastRecognizedCommand] = useState<string>('');
  const [showCommandsHelp, setShowCommandsHelp] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Normalisasi transcript: huruf kecil, hapus tanda baca, hapus spasi berlebih
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'id-ID';

      rec.onstart = () => {
        setIsListening(true);
        setStatusText('Sedang mendengarkan...');
        setTranscript('');
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setStatusText('Izin mikrofon ditolak');
        } else {
          setStatusText('Perintah tidak dikenali');
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        // If we stopped listening and did not transit to "Memproses perintah...", "Perintah berhasil", "Perintah tidak dikenali", or "Izin mikrofon ditolak"
        setStatusText(prev => {
          if (prev === 'Sedang mendengarkan...') {
            return 'Siap menerima perintah';
          }
          return prev;
        });
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript || '';
        setTranscript(resultText);
        parseVoiceCommand(resultText);
      };

      recognitionRef.current = rec;
    } else {
      setStatusText('Browser tidak mendukung pengenalan suara');
    }
  }, [updateRelay, setAllRelays, setLightMode]);

  const startListening = () => {
    if (!recognitionRef.current) {
      setStatusText('Browser tidak mendukung pengenalan suara');
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
      recognitionRef.current.stop();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const parseVoiceCommand = async (text: string) => {
    const clean = normalizeText(text);
    setStatusText('Memproses perintah...');
    setIsProcessing(true);

    let commandFound = false;

    try {
      // Mapping commands to updateRelay, setAllRelays, setLightMode with source: "voice"
      // Relay 1
      if (clean === "nyalakan lampu satu" || clean === "nyalakan lampu 1") {
        await updateRelay("relay1", true, "voice");
        commandFound = true;
      } else if (clean === "matikan lampu satu" || clean === "matikan lampu 1") {
        await updateRelay("relay1", false, "voice");
        commandFound = true;
      }
      // Relay 2
      else if (clean === "nyalakan lampu dua" || clean === "nyalakan lampu 2") {
        await updateRelay("relay2", true, "voice");
        commandFound = true;
      } else if (clean === "matikan lampu dua" || clean === "matikan lampu 2") {
        await updateRelay("relay2", false, "voice");
        commandFound = true;
      }
      // Relay 3
      else if (clean === "nyalakan lampu tiga" || clean === "nyalakan lampu 3") {
        await updateRelay("relay3", true, "voice");
        commandFound = true;
      } else if (clean === "matikan lampu tiga" || clean === "matikan lampu 3") {
        await updateRelay("relay3", false, "voice");
        commandFound = true;
      }
      // Relay 4
      else if (clean === "nyalakan lampu empat" || clean === "nyalakan lampu 4") {
        await updateRelay("relay4", true, "voice");
        commandFound = true;
      } else if (clean === "matikan lampu empat" || clean === "matikan lampu 4") {
        await updateRelay("relay4", false, "voice");
        commandFound = true;
      }
      // All Lights
      else if (clean === "nyalakan semua lampu") {
        await setAllRelays(true, "voice");
        commandFound = true;
      } else if (clean === "matikan semua lampu") {
        await setAllRelays(false, "voice");
        commandFound = true;
      }
      // Variations / Mode
      else if (clean === "aktifkan variasi satu" || clean === "kiri kanan") {
        await setLightMode("KIRI_KANAN", "voice");
        commandFound = true;
      } else if (clean === "aktifkan variasi dua" || clean === "strobo") {
        await setLightMode("STROBO", "voice");
        commandFound = true;
      } else if (clean === "hentikan variasi" || clean === "mode normal" || clean === "stop") {
        await setLightMode("NORMAL", "voice");
        commandFound = true;
      }

      if (commandFound) {
        setStatusText('Perintah berhasil');
        setLastRecognizedCommand(clean);
        setTimeout(() => {
          setStatusText('Siap menerima perintah');
        }, 3000);
      } else {
        setStatusText('Perintah tidak dikenali');
        if (clean) {
          addLog(`Perintah suara tidak dikenali: "${clean}"`, 'voice');
        }
        setTimeout(() => {
          setStatusText('Siap menerima perintah');
        }, 3000);
      }
    } catch (e) {
      console.error(e);
      setStatusText('Perintah tidak dikenali');
      if (clean) {
        addLog(`Gagal memproses perintah: "${clean}"`, 'voice');
      }
      setTimeout(() => {
        setStatusText('Siap menerima perintah');
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const commandList = [
    { cmd: "nyalakan lampu satu / dua / tiga / empat", desc: "Mengaktifkan salah satu relay lampu" },
    { cmd: "matikan lampu satu / dua / tiga / empat", desc: "Mematikan salah satu relay lampu" },
    { cmd: "nyalakan semua lampu", desc: "Menyalakan relay 1 s/d 4 bersamaan" },
    { cmd: "matikan semua lampu", desc: "Mematikan seluruh relay" },
    { cmd: "aktifkan variasi satu / kiri kanan", desc: "Mengaktifkan variasi lampu KIRI_KANAN" },
    { cmd: "aktifkan variasi dua / strobo", desc: "Mengaktifkan variasi lampu STROBO" },
    { cmd: "hentikan variasi / mode normal / stop", desc: "Menghentikan variasi & kembali ke normal" }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden" id="voice-controller-widget">
      {/* Visual Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-emerald-500/10 text-emerald-400 ${isListening ? 'animate-bounce' : ''}`}>
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm md:text-base">Perintah Suara</h3>
            <p className="text-xs text-slate-400">Web Speech API • id-ID</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowCommandsHelp(true)}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 hover:bg-slate-800 rounded-lg"
          title="Panduan Perintah"
          id="btn-voice-commands-help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        {/* Animated Microphone Trigger */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            isProcessing
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50 animate-pulse'
              : isListening 
                ? 'bg-rose-500 text-white cursor-pointer ring-4 ring-rose-500/30 ring-offset-4 ring-offset-slate-900' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer hover:scale-105'
          }`}
          id="btn-trigger-microphone"
        >
          <Mic className={`h-9 w-9 ${isListening ? 'animate-pulse' : ''}`} />

          {/* Radar effect rings when listening */}
          {isListening && (
            <>
              <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-25 -z-10" />
              <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-10 -z-10 delay-300" />
            </>
          )}
        </button>

        <p className="text-xs md:text-sm mt-4 font-medium text-slate-200 animate-fade-in" id="voice-status-text">
          {statusText}
        </p>

        {/* Live Transcript / Feedback UI */}
        <div className="mt-4 w-full bg-slate-950/70 py-2.5 px-4 rounded-xl border border-slate-800 text-center min-h-[44px] flex items-center justify-center">
          {transcript ? (
            <p className="text-slate-300 text-xs italic font-mono max-w-xs break-all">
              "{transcript}"
            </p>
          ) : (
            <p className="text-slate-500 text-xs italic font-mono">
              Belum ada suara...
            </p>
          )}
        </div>

        {lastRecognizedCommand && !isListening && !isProcessing && (
          <div className="mt-3 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <Check className="h-3 w-3 text-emerald-400" />
            <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">
              Berhasil: "{lastRecognizedCommand}"
            </p>
          </div>
        )}
      </div>

      {/* Slide-Up Commands Dialog */}
      <AnimatePresence>
        {showCommandsHelp && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute inset-0 bg-slate-950 z-20 p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="font-semibold text-slate-200 text-sm">Panduan Perintah id-ID</span>
                <button 
                  onClick={() => setShowCommandsHelp(false)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800"
                  id="btn-close-help"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[160px] pr-1">
                {commandList.map((item, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                    <p className="text-xs font-mono font-bold text-emerald-400">"{item.cmd}"</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowCommandsHelp(false)}
              className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              id="btn-understand-help"
            >
              Saya Mengerti
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
