'use client';

import React from 'react';

interface Step {
  id: string;
  label: string;
}

interface TimelineProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export default function Timeline({ steps, currentStep, onStepClick }: TimelineProps) {
  return (
    <div className="relative py-3">
      {/* Horizontal line connecting steps */}
      <div className="hidden sm:block absolute top-1/2 left-0 w-full h-2 bg-gray-100 -translate-y-1/2 z-0 rounded-full"></div>
      
      {/* Progress line (fills in as steps are completed) */}
      <div 
        className="hidden sm:block absolute top-1/2 left-0 h-2 bg-gradient-to-r from-navy to-grass -translate-y-1/2 z-0 transition-all duration-500 rounded-full shadow-sm"
        style={{ 
          width: `${currentStep / (steps.length - 1) * 100}%`,
          maxWidth: currentStep === steps.length - 1 ? '100%' : `calc(${currentStep / (steps.length - 1) * 100}% + 1rem)`
        }}
      ></div>
      
      {/* Steps with fixed positioning */}
      <div className="relative flex flex-col sm:grid z-10" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((step, index) => {
          // Determine step status
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div 
              key={step.id} 
              className="flex flex-col items-center mb-4 sm:mb-0 cursor-pointer group"
              onClick={() => onStepClick(index)}
            >
              {/* Step circle */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-navy to-grass border-white text-white shadow-lg scale-105'
                    : isCurrent
                    ? 'bg-navy border-white text-white shadow-lg scale-110'
                    : 'bg-white border-gray-200 text-gray-900 group-hover:border-navy/30 group-hover:bg-gray-50'
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="font-bold text-lg">{index + 1}</span>
                )}
              </div>
              
              {/* Step label */}
              <div className="mt-3 text-center">
                <span
                  className={`text-sm font-bold transition-colors duration-300 ${
                    isCurrent
                      ? 'text-navy'
                      : isCompleted
                      ? 'text-grass'
                      : 'text-gray-700 group-hover:text-navy/70'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Mobile connector line (only between steps) */}
              {index < steps.length - 1 && (
                <div className={`sm:hidden w-1.5 h-8 my-1 rounded-full ${isCompleted ? 'bg-gradient-to-b from-navy to-grass' : 'bg-gray-200'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}