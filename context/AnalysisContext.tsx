import React, { createContext, useContext, useState, ReactNode } from "react";

interface AnalysisResult {
  gender: string;
  fitRating: number;
  colorAnalysis: string;
  styleRecommendations: string;
}

interface AnalysisContextType {
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult) => void;
  clearAnalysisResult: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | null>(null);

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [analysisResult, setAnalysisResultState] =
    useState<AnalysisResult | null>(null);

  const setAnalysisResult = (result: AnalysisResult) =>
    setAnalysisResultState(result);
  const clearAnalysisResult = () => setAnalysisResultState(null);

  return (
    <AnalysisContext.Provider
      value={{ analysisResult, setAnalysisResult, clearAnalysisResult }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = (): AnalysisContextType => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
};
