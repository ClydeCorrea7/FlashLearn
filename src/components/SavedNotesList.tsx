import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Loader2, Calendar, FileDown, Trash2, ArrowLeft } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { NoteTopic, NotesPreview } from './NotesPreview';
import jsPDF from 'jspdf';

interface SavedNote {
  id: string;
  subject: string;
  topics: string;
  tone: string;
  include_examples: boolean;
  generated_content: NoteTopic[];
  created_at: string;
}

// Reusable PDF generator function
export const generatePDF = (subject: string, notes: NoteTopic[]) => {
  try {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - 2 * margin;
    let yOffset = 25;

    // Theme Colors
    const neonBlue = [59, 130, 246]; 
    const neonPurple = [139, 92, 246];
    const deepSlate = [15, 23, 42];
    const lightSlate = [100, 116, 139];

    // Design Helpers
    const drawSectionLabel = (label: string, y: number, color = neonBlue) => {
      // Label using Bold/Monospace to simulate Pixel font identity
      doc.setFont('courier', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(label.toUpperCase(), margin, y);
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(0.2);
      doc.line(margin, y + 2, margin + 40, y + 2);
      return 12;
    };

    const writeBodyText = (text: string, y: number, size = 13, font = 'helvetica', weight = 'normal', color = deepSlate) => {
      doc.setFont(font, weight);
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      const lines = doc.splitTextToSize(text, maxLineWidth);
      doc.text(lines, margin, y);
      return (lines.length * (size * 0.5)) + 8;
    };

    // 🧾 TITLE: FLASHLEARN NOTES
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
    doc.text("FLASHLEARN • NEURAL SYSTEM", pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 10;

    doc.setFontSize(24);
    doc.setTextColor(neonBlue[0], neonBlue[1], neonBlue[2]);
    doc.text("FLASHLEARN NOTES", pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 14;

    // Subject Context Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
    const subText = `SUBJECT: ${subject.toUpperCase()}`;
    const subLines = doc.splitTextToSize(subText, maxLineWidth);
    doc.text(subLines, pageWidth / 2, yOffset, { align: 'center' });
    yOffset += (subLines.length * 10) + 15;

    // 🧩 TOPIC PROCESSING
    notes.forEach((note, index) => {
      if (yOffset > 240) { doc.addPage(); yOffset = 25; }

      // Topic Block: [ Topic Header ]
      doc.setFont('courier', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(deepSlate[0], deepSlate[1], deepSlate[2]);
      
      const titleText = `[ ${note.title} ]`;
      const titleLines = doc.splitTextToSize(titleText, maxLineWidth);
      const titleHeight = (titleLines.length * 8) + 6;

      // Wrap check for title block
      if (yOffset + titleHeight > 275) { doc.addPage(); yOffset = 25; }

      doc.setDrawColor(241, 245, 249);
      doc.setFillColor(248, 250, 252);
      doc.rect(margin - 5, yOffset - 8, maxLineWidth + 10, titleHeight, 'F');
      
      doc.text(titleLines, margin, yOffset);
      yOffset += titleHeight + 4;

      // 1. Definition (Hybrid Styles)
      yOffset += drawSectionLabel('Definition', yOffset);
      yOffset += writeBodyText(note.definition, yOffset, 14, 'helvetica', 'normal', deepSlate);
      yOffset += 5;

      // 2. Description (Deep Point System)
      if (yOffset > 240) { doc.addPage(); yOffset = 25; }
      yOffset += drawSectionLabel('Description', yOffset);
      (note.description || []).forEach(desc => {
        if (typeof desc === 'string') {
          // Clean the text and ensure it starts with a single bullet
          const cleanText = desc.replace(/^[•◦\-\*\s]+/, '').trim();
          const itemText = `• ${cleanText}`;
          
          // Use writeBodyText but handle the return value to add extra rhythmic spacing
          const heightAdded = writeBodyText(itemText, yOffset, 12.5, 'helvetica', 'normal', deepSlate);
          yOffset += heightAdded + 3; // Extra padding between bullets for breathability
          
          if (yOffset > 275) { doc.addPage(); yOffset = 25; }
        }
      });
      yOffset += 4;

      // 3. Explanation (Intuition Block)
      if (yOffset > 240) { doc.addPage(); yOffset = 25; }
      yOffset += drawSectionLabel('Explanation', yOffset, neonPurple);
      yOffset += writeBodyText(note.explanation, yOffset, 13, 'helvetica', 'italic', lightSlate);
      yOffset += 8;

      // 4. Examples (Domain-Specific)
      if (note.examples && note.examples.length > 0) {
        if (yOffset > 240) { doc.addPage(); yOffset = 25; }
        yOffset += drawSectionLabel('Real-world Examples', yOffset);
        (note.examples || []).forEach(ex => {
          yOffset += writeBodyText(`• ${ex}`, yOffset, 12, 'helvetica', 'normal', deepSlate);
          if (yOffset > 275) { doc.addPage(); yOffset = 25; }
        });
        yOffset += 6;
      }

      // 5. Keywords
      if (note.keywords && note.keywords.length > 0) {
        if (yOffset > 260) { doc.addPage(); yOffset = 25; }
        drawSectionLabel('Technical Keywords', yOffset, lightSlate);
        yOffset += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const kwText = note.keywords.join('  |  ');
        yOffset += writeBodyText(kwText, yOffset, 11, 'helvetica', 'bold', lightSlate);
        yOffset += 12;
      }

      // Topic Separator Line
      if (index < notes.length - 1) {
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.1);
        doc.line(margin, yOffset, pageWidth - margin, yOffset);
        yOffset += 15;
      }
    });

    const fileName = `FlashLearn_Notes_${subject.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    doc.save(fileName);
  } catch (err) {
    console.error('PDF Generation failed:', err);
    alert('Failed to generate PDF. Check console for details.');
  }
};



export const SavedNotesList: React.FC = () => {
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setNotes(data || []);
    } catch (err: any) {
      console.error("Error fetching notes:", err);
      // Suppress missing table error cleanly
      if (err.code === '42P01') {
        setError("Saved notes table hasn't been set up yet. Try saving a note first to initialize.");
      } else {
        setError("Failed to load saved notes");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete note", err);
      alert("Failed to delete note");
    }
  };

  const handleDownload = (note: SavedNote, e: React.MouseEvent) => {
    e.stopPropagation();
    generatePDF(note.subject, note.generated_content);
  };

  if (selectedNote) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setSelectedNote(null)}
            className="flex items-center text-sm text-muted-foreground hover:text-[var(--neon-blue)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to saved list
          </button>
          <button 
            onClick={async (e) => {
              await handleDelete(selectedNote.id, e);
              setSelectedNote(null);
            }}
            className="flex items-center text-sm text-destructive hover:text-white hover:bg-destructive px-3 py-1.5 rounded-md transition-colors border border-destructive/30"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Note
          </button>
        </div>
        <NotesPreview 
          subject={selectedNote.subject} 
          notes={selectedNote.generated_content} 
          onDownloadPDF={() => generatePDF(selectedNote.subject, selectedNote.generated_content)}
          isDownloading={false} 
        />
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--neon-blue)]" />
        <p>Loading saved notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-destructive/10 mb-4 text-destructive">
          <FileText className="w-6 h-6" />
        </div>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-secondary mb-4 text-muted-foreground">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No saved notes yet</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Generated notes will appear here once you hit "Save Notes".
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnimatePresence>
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            className="bg-card p-5 rounded-xl border border-border hover:border-[var(--neon-blue)]/50 shadow-sm cursor-pointer transition-all group"
            onClick={() => setSelectedNote(note)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-lg text-foreground line-clamp-1 flex-1 pr-2 group-hover:text-[var(--neon-blue)] transition-colors">
                {note.subject}
              </h3>
              <div className="flex space-x-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleDownload(note, e)}
                  className="p-1.5 text-muted-foreground hover:text-white hover:bg-[var(--neon-blue)] rounded-md transition-colors"
                  title="Download PDF"
                >
                  <FileDown className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => handleDelete(note.id, e)}
                  className="p-1.5 text-muted-foreground hover:text-white hover:bg-destructive rounded-md transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {note.topics}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
              <span className="text-xs px-2 py-1 bg-secondary rounded-full text-foreground">
                {note.tone}
              </span>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(note.created_at).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
