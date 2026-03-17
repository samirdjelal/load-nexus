import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Rocket, Globe, Zap, CheckCircle2 } from 'lucide-react';

const OnboardingWizard = ({ isOpen, onClose, initialConfig, onSave }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState(initialConfig || {
    url: 'https://httpbin.org/get',
    method: 'GET',
    threads: 10,
    duration: 60,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onSave(config);
      onClose();
    }
  };

  const steps = [
    {
      title: "Welcome to Load Nexus",
      description: "A high-performance API load testing tool built for speed and precision. Let's get you started with your first test.",
      icon: <Rocket className="w-12 h-12 text-primary" />,
      content: null,
      actionLabel: "Get Started"
    },
    {
      title: "Step 1: Target URL",
      description: "Where should we send the traffic? Enter the URL of the API you want to test.",
      icon: <Globe className="w-12 h-12 text-primary" />,
      content: (
        <div className="w-full space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Target URL</label>
            <input
              type="text"
              name="url"
              value={config.url}
              onChange={handleChange}
              className="w-full bg-background-dark border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm font-mono"
              placeholder="https://api.example.com/v1/resource"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">HTTP Method</label>
            <select
              name="method"
              value={config.method}
              onChange={handleChange}
              className="w-full bg-background-dark border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm font-mono appearance-none cursor-pointer"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
        </div>
      ),
      actionLabel: "Next"
    },
    {
      title: "Step 2: Load Intensity",
      description: "How much load do you want to simulate? Set your concurrent users and test duration.",
      icon: <Zap className="w-12 h-12 text-primary" />,
      content: (
        <div className="w-full grid grid-cols-2 gap-4 text-left">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">V-Users (Threads)</label>
            <input
              type="number"
              name="threads"
              value={config.threads}
              onChange={handleChange}
              className="w-full bg-background-dark border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm font-mono"
              min="1"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Duration (Sec)</label>
            <input
              type="number"
              name="duration"
              value={config.duration}
              onChange={handleChange}
              className="w-full bg-background-dark border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm font-mono"
              min="1"
            />
          </div>
        </div>
      ),
      actionLabel: "Next"
    },
    {
      title: "Ready to Launch",
      description: "You're all set! Click finish to apply these settings. You can always customize more details later in the Scenarios tab.",
      icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
      content: (
        <div className="w-full bg-background-dark/50 border border-surface-border rounded-xl p-4 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary font-medium">URL:</span>
            <span className="text-white font-mono truncate max-w-[200px]">{config.url}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary font-medium">Method:</span>
            <span className="text-white font-mono">{config.method}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary font-medium">V-Users:</span>
            <span className="text-white font-mono">{config.threads}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary font-medium">Duration:</span>
            <span className="text-white font-mono">{config.duration}s</span>
          </div>
        </div>
      ),
      actionLabel: "Finish & Apply"
    }
  ];

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-surface-dark border border-surface-border rounded-2xl shadow-2xl overflow-hidden shadow-primary/10">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-surface-border">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/5 text-text-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-12 flex flex-col items-center text-center">
          <div className="mb-6 p-4 bg-primary/10 rounded-2xl ring-1 ring-primary/20">
            {step.icon}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            {step.title}
          </h2>
          
          <p className="text-text-secondary leading-relaxed mb-8 max-w-[85%]">
            {step.description}
          </p>

          {step.content && (
            <div className="w-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {step.content}
            </div>
          )}

          <div className="flex items-center justify-between w-full mt-auto pt-6 border-t border-surface-border">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-text-secondary hover:text-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'bg-primary w-4' : 'bg-surface-border'
                  }`} 
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-background-dark rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
            >
              {step.actionLabel}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
