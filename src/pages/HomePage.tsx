import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { UploadZone } from '../components/UploadZone';
import { SampleVoices } from '../components/SampleVoices';
import { AnalysisResult } from '../utils/audioEngine';
import { motion } from 'motion/react';

interface HomePageProps {
  onAnalyzeComplete: (result: AnalysisResult, fileName: string) => void;
  externalAudioTrigger?: {
    name: string;
    sampleType?: 'ceo' | 'family' | 'bank' | 'clone';
    size: number;
    type: string;
  } | null;
  onSelectSample: (sample: {
    name: string;
    sampleType: 'ceo' | 'family' | 'bank' | 'clone';
    size: number;
    type: string;
  }) => void;
  onClearTrigger?: () => void;
  onNavigateToFeatures: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onAnalyzeComplete,
  externalAudioTrigger,
  onSelectSample,
  onClearTrigger,
  onNavigateToFeatures,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-12 pb-16"
    >
      <HeroSection onExploreFeatures={onNavigateToFeatures} />

      <UploadZone
        onAnalyzeComplete={onAnalyzeComplete}
        externalAudioTrigger={externalAudioTrigger}
        onClearTrigger={onClearTrigger}
      />

      <SampleVoices onSelectSample={onSelectSample} />
    </motion.div>
  );
};
