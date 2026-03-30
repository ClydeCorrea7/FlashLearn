import React from 'react';
import { motion } from 'motion/react';
import { AnimatedCard } from './AnimatedCard';
import { ArrowLeft, TrendingUp, Clock, Target, Flame, Brain, Zap } from 'lucide-react';
import { cn } from './ui/utils';

interface Deck {
  id: string;
  title: string;
  cardCount: number;
  masteredCount: number;
  lastStudied: string;
}

interface UserProgress {
  user_id: string;
  total_cards: number;
  mastered_cards: number;
  current_streak: number;
  longest_streak: number;
  last_study_date?: string;
}

interface ProgressScreenProps {
  decks: Deck[];
  userProgress?: UserProgress | null;
  onBack: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ decks, userProgress, onBack }) => {
  const totalCards = userProgress?.total_cards || decks.reduce((sum, deck) => sum + deck.cardCount, 0);
  const totalMastered = userProgress?.mastered_cards || decks.reduce((sum, deck) => sum + deck.masteredCount, 0);
  const overallProgress = totalCards > 0 ? (totalMastered / totalCards) * 100 : 0;

  const currentStreak = userProgress?.current_streak || 0;
  const longestStreak = userProgress?.longest_streak || 0;

  // Calculate days learning (mock for now)
  const daysLearning = userProgress?.last_study_date
    ? Math.max(1, Math.floor((Date.now() - new Date(userProgress.last_study_date).getTime()) / (1000 * 60 * 60 * 24))) + currentStreak
    : currentStreak > 0 ? currentStreak : 0;

  // High-fidelity neural circular progress component
  const CircularProgress = ({
    percentage,
    size = 120,
    strokeWidth = 8,
    showPercentage = true,
    className = ""
  }: {
    percentage: number,
    size?: number,
    strokeWidth?: number,
    showPercentage?: boolean,
    className?: string
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <motion.div
        className={`relative inline-block ${className}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d2ff" />
              <stop offset="50%" stopColor="#3a7bd5" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Orbital path */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + 4}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1"
            fill="none"
          />

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
            fill="rgba(0,0,0,0.2)"
          />

          {/* Main progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#neural-gradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            filter="url(#glow)"
            animate={{
              strokeDashoffset: offset,
            }}
            transition={{ delay: 0.3, duration: 2, ease: "circOut" }}
          />

          {/* Inner pulsating node */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth - 4}
            fill="url(#neural-gradient)"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.05, 0.15, 0.05],
              scale: [0.95, 1.05, 0.95]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>

        {/* Dynamic percentage label */}
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <span className={cn(
                "text-white font-bold tracking-tight",
                size < 100 ? "text-sm" : "text-3xl"
              )}>
                {Math.round(percentage)}
                <span className="text-xs opacity-40 ml-0.5">%</span>
              </span>
              {size >= 120 && (
                <span className="text-[8px] text-[var(--neon-blue)] font-bold uppercase tracking-[0.2em] mt-1 opacity-60">
                  Mastery
                </span>
              )}
            </motion.div>
          </div>
        )}

        {/* Orbital Node Animation */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-full h-full pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ margin: `-${size / 2}px 0 0 -${size / 2}px` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_#fff]" />
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background overflow-auto">
      <div className="max-w-4xl mx-auto p-4 pb-24">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.button
            onClick={onBack}
            className="p-3 rounded-xl hover:bg-secondary/50 transition-colors touch-manipulation"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-lg sm:text-xl bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
            Your Progress
          </h1>
        </motion.div>

        {/* Mobile-optimized Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <AnimatedCard
            variant="cyber"
            className="p-4 sm:p-8 mb-6 text-center"
            glowing={true}
            delay={0.2}
          >
            {/* Mobile: Compact header */}
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <h2 className="text-sm sm:text-base text-white">Overall Mastery</h2>
            </div>

            {/* Mobile: Smaller circular progress */}
            <div className="mb-4 sm:mb-6">
              <CircularProgress
                percentage={overallProgress}
                size={window.innerWidth < 640 ? 100 : 150}
                strokeWidth={window.innerWidth < 640 ? 6 : 8}
              />
            </div>

            {/* Mobile-optimized stats layout */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="bg-white/10 rounded-lg p-3 sm:p-4"
              >
                <p className="text-lg sm:text-2xl text-white">{totalMastered}</p>
                <p className="text-white/80 text-xs sm:text-sm">
                  <span className="sm:hidden">Mastered</span>
                  <span className="hidden sm:inline">Cards Mastered</span>
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="bg-white/10 rounded-lg p-3 sm:p-4"
              >
                <p className="text-lg sm:text-2xl text-white">{totalCards}</p>
                <p className="text-white/80 text-xs sm:text-sm">
                  <span className="sm:hidden">Total</span>
                  <span className="hidden sm:inline">Total Cards</span>
                </p>
              </motion.div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Mobile-optimized Stats Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <AnimatedCard className="p-4 sm:p-6 cyber-surface neon-border-blue text-center" delay={0.1}>
            <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-2 sm:mb-3" />
            <p className="text-lg sm:text-2xl">{currentStreak}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              <span className="sm:hidden">Streak</span>
              <span className="hidden sm:inline">Current Streak</span>
            </p>
          </AnimatedCard>

          <AnimatedCard className="p-4 sm:p-6 cyber-surface neon-border-blue text-center" delay={0.2}>
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--neon-blue)] mx-auto mb-2 sm:mb-3" />
            <p className="text-lg sm:text-2xl">{longestStreak}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              <span className="sm:hidden">Best</span>
              <span className="hidden sm:inline">Longest Streak</span>
            </p>
          </AnimatedCard>

          <AnimatedCard className="p-4 sm:p-6 cyber-surface neon-border-blue text-center" delay={0.3}>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-2 sm:mb-3" />
            <p className="text-lg sm:text-2xl">{decks.length}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              <span className="sm:hidden">Decks</span>
              <span className="hidden sm:inline">Active Decks</span>
            </p>
          </AnimatedCard>

          <AnimatedCard className="p-4 sm:p-6 cyber-surface neon-border-blue text-center" delay={0.4}>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--neon-purple)] mx-auto mb-2 sm:mb-3" />
            <p className="text-lg sm:text-2xl">{daysLearning}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              <span className="sm:hidden">Days</span>
              <span className="hidden sm:inline">Days Learning</span>
            </p>
          </AnimatedCard>
        </motion.div>

        {/* Mobile-optimized Deck Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <AnimatedCard className="p-4 sm:p-6 cyber-surface neon-border-blue" delay={0.6}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--neon-blue)]" />
              <h3 className="text-sm sm:text-base">Deck Progress</h3>
            </div>

            {decks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center py-6 sm:py-8"
              >
                <Brain className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  No decks created yet. Create your first deck to start tracking progress!
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {decks.map((deck, index) => {
                  const progress = deck.cardCount > 0 ? (deck.masteredCount / deck.cardCount) * 100 : 0;

                  return (
                    <motion.div
                      key={deck.id}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-secondary/20 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base mb-1 truncate">{deck.title}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {deck.masteredCount}/{deck.cardCount}
                          </span>
                          {/* Mobile: Hide last studied to save space */}
                          <span className="hidden sm:block">•</span>
                          <span className="hidden sm:block truncate">
                            Last: {deck.lastStudied === 'Never' ? 'New' : deck.lastStudied}
                          </span>
                        </div>
                      </div>

                      {/* Mobile: Smaller progress circles */}
                      <div className="flex-shrink-0">
                        <CircularProgress
                          percentage={progress}
                          size={window.innerWidth < 640 ? 50 : 60}
                          strokeWidth={window.innerWidth < 640 ? 3 : 4}
                          showPercentage={window.innerWidth >= 640}
                        />
                        {/* Mobile: Show percentage below circle */}
                        {window.innerWidth < 640 && (
                          <div className="text-center mt-1">
                            <span className="text-xs text-[var(--neon-blue)]">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatedCard>
        </motion.div>

        {/* Mobile-optimized Spaced Repetition Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <AnimatedCard className="p-4 sm:p-6 mt-6 cyber-surface neon-border-blue" delay={0.8}>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--neon-blue)] mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="mb-2 text-sm sm:text-base">Spaced Repetition</h4>
                <p className="text-muted-foreground text-xs sm:text-sm mb-3 leading-relaxed">
                  Keep your knowledge fresh by reviewing cards at optimal intervals.
                </p>
                <div className="text-xs sm:text-sm space-y-1">
                  {userProgress?.last_study_date ? (
                    <>
                      <p className="text-[var(--neon-blue)] flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        Keep up your {currentStreak}-day streak!
                      </p>
                      <p className="text-muted-foreground">
                        • Come back tomorrow to continue learning
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[var(--neon-blue)] flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        Start your learning journey today
                      </p>
                      <p className="text-muted-foreground">
                        • Study daily to build a streak
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
};