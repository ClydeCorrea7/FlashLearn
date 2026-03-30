import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, 
  Trash2, 
  ArrowRight, 
  ShieldAlert, 
  ChevronLeft, 
  CheckCircle,
  Loader2,
  AlertTriangle,
  Fingerprint,
  Zap,
  Terminal
} from 'lucide-react';

interface DeleteAccountModuleProps {
  onConfirm: (purgeEverything: boolean) => Promise<void>;
  onAbort: () => void;
  isDeleting?: boolean;
}

type Step = 'choice' | 'warning' | 'verify' | 'success';

export const DeleteAccountModule: React.FC<DeleteAccountModuleProps> = ({
  onConfirm,
  onAbort,
  isDeleting: externalIsDeleting = false
}) => {
  const [step, setStep] = useState<Step>('choice');
  const [purgeEverything, setPurgeEverything] = useState<boolean>(false);
  const [verifyText, setVerifyText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [internalIsDeleting, setInternalIsDeleting] = useState(false);

  const isDeleting = externalIsDeleting || internalIsDeleting;

  const handleModeSelect = (purge: boolean) => {
    setPurgeEverything(purge);
    setStep('warning');
  };

  const handleVerify = async () => {
    const required = purgeEverything ? 'PURGE' : 'WIPE';
    if (verifyText !== required) {
      setError(`ERR: INCORRECT KEY`);
      return;
    }

    setInternalIsDeleting(true);
    setError(null);

    try {
      await onConfirm(purgeEverything);
      setStep('success');
    } catch (err: any) {
      setError('ERR: SYSTEM_FAIL');
      setInternalIsDeleting(false);
    }
  };

  const themeColor = purgeEverything ? '#ef4444' : '#3b82f6';
  const themeGlow = purgeEverything ? '0 0 25px rgba(239, 68, 68, 0.5)' : '0 0 25px rgba(59, 130, 246, 0.5)';

  return (
    <div className="fixed inset-0 z-[9999] bg-[#000] flex flex-col items-center justify-center p-4 font-['Press_Start_2P',_cursive] text-white overflow-hidden">
      {/* Retro Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.2) 2px, transparent 2px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 2px, transparent 2px)`,
          backgroundSize: '40px 40px'
        }} 
      />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl relative z-20"
      >
        {/* Module Border - Fully Opaque Black */}
        <div 
          className="bg-black border-[6px] p-2"
          style={{ borderColor: themeColor, boxShadow: themeGlow }}
        >
          {/* Header Bar - Fully Opaque */}
          <div className="flex items-center justify-between p-4 bg-[#111] border-b-[6px] border-white/10 mb-8 font-mono text-[10px]">
            <div className="flex items-center gap-4">
              <Terminal className="w-5 h-5 text-blue-400" />
              <span className="tracking-tighter uppercase whitespace-nowrap">
                {step === 'success' ? 'DATA_WIPED' : 'SYSTEM_OVERRIDE_MODE'}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 bg-red-600 animate-pulse" />
              <div className="w-2.5 h-2.5 bg-blue-600 animate-pulse delay-500" />
            </div>
          </div>

          <div className="p-4 md:p-8">
            <AnimatePresence mode="wait">
              {step === 'choice' && (
                <motion.div
                  key="choice"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12"
                >
                  <div className="space-y-6 text-center md:text-left">
                    <h1 className="text-lg md:text-xl font-bold leading-relaxed text-sky-400 uppercase tracking-tighter">Choose_Protocol</h1>
                    <p className="text-[9px] text-white/40 leading-loose uppercase">Eradicate target nodes from baseline database.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <button 
                      onClick={() => handleModeSelect(false)}
                      className="group p-6 border-4 border-white/10 bg-[#0c0c0c] hover:bg-blue-900/20 hover:border-blue-500 transition-all text-left flex items-start gap-4"
                    >
                      <div className="p-2 bg-blue-500/10 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-[12px] font-bold text-blue-400 uppercase">Wipe_History</h3>
                        <p className="text-[7px] text-white/30 leading-relaxed uppercase">Reset decks & progress. Identity remains.</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleModeSelect(true)}
                      className="group p-6 border-4 border-white/10 bg-[#0c0c0c] hover:bg-red-900/20 hover:border-red-500 transition-all text-left flex items-start gap-4"
                    >
                      <div className="p-2 bg-red-500/10 group-hover:scale-110 transition-transform">
                        <Skull className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-[12px] font-bold text-red-500 uppercase">Erase_Account</h3>
                        <p className="text-[7px] text-white/30 leading-relaxed uppercase">Full deletion of profile & associated data.</p>
                      </div>
                    </button>
                  </div>

                  <button 
                    onClick={onAbort}
                    className="block w-full py-4 text-[10px] text-white/10 hover:text-white uppercase transition-colors"
                  >
                    [ ABORT_SEQUENCE ]
                  </button>
                </motion.div>
              )}

              {step === 'warning' && (
                <motion.div
                  key="warning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12 text-center"
                >
                  <div className="flex justify-center">
                    <div className={`p-8 border-4 border-dashed animate-pulse ${purgeEverything ? 'border-red-600 text-red-600' : 'border-blue-600 text-blue-600'}`}>
                      <AlertTriangle className="w-12 h-12" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className={`text-base md:text-lg font-bold uppercase ${purgeEverything ? 'text-red-500' : 'text-blue-500'}`}>CRITICAL_VERDICT</h2>
                    <p className="text-[8px] md:text-[9px] leading-loose max-w-sm mx-auto uppercase">
                      NO DEPLOYMENT UNDO. HANDSHAKE WILL ZERO ALL ASSETS.
                    </p>
                  </div>

                  <div className="flex flex-col gap-6 pt-4">
                    <button 
                      onClick={() => setStep('verify')}
                      className={`w-full py-6 font-bold text-[10px] border-4 transition-all shadow-lg ${
                        purgeEverything 
                        ? 'bg-red-700 border-red-500 hover:bg-red-600 shadow-red-900/40' 
                        : 'bg-blue-700 border-blue-500 hover:bg-blue-600 shadow-blue-900/40'
                      }`}
                    >
                      [ AUTHORIZE_ZERO ]
                    </button>
                    <button 
                      onClick={() => setStep('choice')}
                      className="text-[9px] text-white/30 hover:text-white uppercase flex items-center justify-center gap-4"
                    >
                      <ChevronLeft className="w-4 h-4" /> RETREAT
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'verify' && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-10"
                >
                  <div className="text-center space-y-6">
                    <Fingerprint className={`w-12 h-12 mx-auto ${purgeEverything ? 'text-red-500' : 'text-blue-500'} animate-bounce`} />
                    <h2 className="text-[12px] font-bold uppercase">Manual_Handshake</h2>
                    <p className="text-[8px] text-white/40 uppercase">
                      Type <span className="text-white bg-[#222] px-2">{purgeEverything ? 'PURGE' : 'WIPE'}</span> to commit
                    </p>
                  </div>

                  <div className="space-y-6 text-center">
                    <input 
                      type="text"
                      value={verifyText}
                      onChange={(e) => {
                        setVerifyText(e.target.value.toUpperCase());
                        setError(null);
                      }}
                      disabled={isDeleting}
                      className="w-full bg-[#151515] border-4 border-white/20 p-6 text-xl text-center outline-none focus:border-white tracking-[0.5em] placeholder:text-white/5"
                      autoFocus
                    />
                    {error && (
                      <motion.p 
                        animate={{ opacity: [1, 0, 1] }}
                        className="text-red-500 text-[9px] font-bold"
                      >
                        {error}
                      </motion.p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 pt-6">
                    <button 
                      onClick={() => setStep('warning')}
                      disabled={isDeleting}
                      className="flex-1 py-4 border-2 bg-white/5 border-white/20 text-[8px] hover:bg-white/10 transition-all uppercase"
                    >
                      PREVENT
                    </button>
                    <button 
                      onClick={handleVerify}
                      disabled={isDeleting || verifyText !== (purgeEverything ? 'PURGE' : 'WIPE')}
                      className={`flex-[2] py-4 text-[9px] border-4 transition-all flex items-center justify-center gap-4 ${
                        verifyText === (purgeEverything ? 'PURGE' : 'WIPE') && !isDeleting
                        ? (purgeEverything ? 'bg-red-700 border-red-500 hover:bg-red-600' : 'bg-blue-700 border-blue-500 hover:bg-blue-600')
                        : 'bg-[#111] text-white/5 border-white/5'
                      }`}
                    >
                      {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'OVERRIDE'}
                    </button>
                  </div>

                  {isDeleting && (
                    <div className="space-y-6 pt-8">
                      <div className="h-8 w-full bg-[#111] border-4 border-white/10 overflow-hidden relative">
                        <motion.div 
                          className={`h-full ${purgeEverything ? 'bg-red-600' : 'bg-blue-600'}`}
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 3, ease: 'linear' }}
                        />
                      </div>
                      <p className="text-[7px] text-white/20 text-center animate-pulse uppercase">Cleansing_Segment_L4...</p>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-10 space-y-10"
                >
                  <div className="flex justify-center">
                    <div className="p-8 border-[6px] border-green-500 bg-green-500/10">
                      <CheckCircle className="w-20 h-20 text-green-500" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-base md:text-lg font-bold text-green-500 uppercase underline decoration-[4px]">Eradicated</h2>
                    <p className="text-[9px] md:text-[10px] leading-loose max-w-sm mx-auto uppercase">
                      Trace scrubbed from memory. System Nullified.
                    </p>
                  </div>

                  {!purgeEverything && (
                    <button 
                      onClick={onAbort}
                      className="px-8 py-5 bg-white text-black font-bold text-[10px] hover:bg-green-500 transition-all uppercase border-[4px] border-black"
                    >
                      COLD_REBOOT
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Decorative Corners */}
      <div className="fixed top-8 left-8 w-8 h-8 border-t-[6px] border-l-[6px] border-white/10" />
      <div className="fixed top-8 right-8 w-8 h-8 border-t-[6px] border-r-[6px] border-white/10" />
      <div className="fixed bottom-8 left-8 w-8 h-8 border-b-[6px] border-l-[6px] border-white/10" />
      <div className="fixed bottom-8 right-8 w-8 h-8 border-b-[6px] border-r-[6px] border-white/10" />
    </div>
  );
};
