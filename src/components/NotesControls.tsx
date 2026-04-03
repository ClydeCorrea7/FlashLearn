import React from 'react';
import { motion } from 'motion/react';
import { Download, Save, Loader2 } from 'lucide-react';

interface NotesControlsProps {
  onDownloadPDF: () => void;
  isDownloading?: boolean;
}

export const NotesControls: React.FC<NotesControlsProps> = ({
  onDownloadPDF,
  isDownloading = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center justify-center py-4">
      {/* Primary Button: Download PDF */}
      <motion.button
        onClick={onDownloadPDF}
        disabled={isDownloading}
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)",
          filter: "brightness(1.1)"
        }}
        whileTap={{ scale: 0.97 }}
        className="group relative flex-1 min-w-[200px] max-w-[240px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-[var(--neon-blue)] via-[#4f46e5] to-[var(--neon-purple)] text-white font-bold text-sm flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-200 disabled:opacity-50 overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        )}
        <span className="tracking-tight uppercase text-[11px] font-black">
          {isDownloading ? "Synthesizing..." : "Download PDF"}
        </span>
      </motion.button>
    </div>
  );
};
