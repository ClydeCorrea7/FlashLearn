import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NotesPage } from './NotesPage';
import { PageTransition } from './PageTransition';

// This is just a redirect to the main notes page component
export const NotesPageScreen = ({ onBack, isAuthenticated }: { onBack: () => void, isAuthenticated?: boolean }) => {
  return (
    <PageTransition>
      <NotesPage onBack={onBack} isAuthenticated={isAuthenticated} />
    </PageTransition>
  );
};
