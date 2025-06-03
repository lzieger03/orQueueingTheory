import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface TutorialStep {
	title: string;
	content: string;
	target?: string;
	action?: string;
}

interface TutorialOverlayProps {
	isVisible: boolean;
	onClose: () => void;
	onStartGame: () => void;
}

const tutorialSteps: TutorialStep[] = [
	{
		title: "Welcome to Checkout Layout Game!",
		content: "Learn queueing theory and operations optimization by designing efficient store layouts. This game combines real mathematical models with interactive gameplay.",
		action: "Let's get started!"
	},
	{
		title: "Step 1: Design Your Layout",
		content: "Use the station palette to add checkout counters and self-service kiosks. Drag and drop them to create your optimal layout for a clothing store.",
		target: "layout-editor"
	},
	{
		title: "Step 2: Choose Station Types",
		content: "🛒 Regular: Standard checkout with staff for all customers\n🖥️ Self-Service: Customer self-checkout kiosks (slower for clothing items but help during peak times)",
		target: "station-palette"
	},
	{
		title: "Step 3: Run Simulation",
		content: "Start the simulation to see customers arrive and form queues. Watch real-time metrics like wait times, throughput, and utilization.",
		target: "simulation-controls"
	},
	{
		title: "Step 4: Optimize with AI",
		content: "Enable the AI Advisor to get intelligent recommendations based on Q-learning algorithms. The AI learns from your simulation data.",
		target: "ai-advisor"
	},
	{
		title: "Step 5: Track Performance",
		content: "Monitor key metrics: average wait time, customer throughput, server utilization, and your overall efficiency score.",
		target: "metrics-panel"
	}
];

export function TutorialOverlay({ isVisible, onClose, onStartGame }: TutorialOverlayProps) {
	const [currentStep, setCurrentStep] = useState(0);

	if (!isVisible) return null;

	const handleNext = () => {
		if (currentStep < tutorialSteps.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			onStartGame();
			onClose();
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const currentTutorialStep = tutorialSteps[currentStep];

  const overlay = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-2xl w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-400' :
                  index < currentStep ? 'bg-green-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tutorial Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">
            {currentTutorialStep.title}
          </h2>
          <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
            {currentTutorialStep.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-gray-400 text-sm">
            {currentStep + 1} of {tutorialSteps.length}
          </span>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 text-white font-semibold shadow-lg hover:shadow-xl"
          >
            {currentStep === tutorialSteps.length - 1 ? (
              <>
                <Play className="w-4 h-4" />
                <span>Start Playing!</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Educational Note */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="text-center text-gray-400 text-sm">
            <div className="font-semibold mb-1">🎓 Educational Focus</div>
            <div>This game teaches M/M/c queueing theory, discrete-event simulation, and reinforcement learning concepts</div>
          </div>
        </div>
      </div>
    </div>
  );

  return overlay;
}
