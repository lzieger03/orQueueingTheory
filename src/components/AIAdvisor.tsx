// Improved AIAdvisor component with better UI integration and Q-Learning visualization
import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, AlertTriangle, CheckCircle, Play, PauseCircle, Info, Database, Settings } from 'lucide-react';
import { QLearningAgent } from '../ai/qlearning';
import type { CheckoutStation, AIRecommendation } from '../types';

interface AIAdvisorProps {
  stations: CheckoutStation[];
  currentMetrics: {
    averageWaitTime: number;
    throughput: number;
    utilization: number;
    customersInSystem: number;
    score: number;
  };
  onApplyRecommendation: (recommendation: AIRecommendation) => void;
  isLearning: boolean;
  onStartLearning: () => void; // Required prop for starting the learning process
  onStopLearning?: () => void; // Optional prop for stopping the learning process
  aiAgent: QLearningAgent | null;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({
  stations,
  currentMetrics,
  onApplyRecommendation,
  isLearning,
  onStartLearning,
  onStopLearning,
  aiAgent,
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'learning' | 'theory'>('recommendations');
  const [learningProgress, setLearningProgress] = useState(0);
  const [qTableStats, setQTableStats] = useState({ stateCount: 0, actionCount: 0, maxQValue: 0, minQValue: 0 });
  const [learningParams, setLearningParams] = useState({ 
    learningRate: 0.1, 
    discountFactor: 0.9, 
    explorationRate: 0.3,
    explorationDecay: 0.995,
    minExplorationRate: 0.01
  });
  const [actionHistory, setActionHistory] = useState<Array<{state: string, action: string, reward: number}>>([]);
  const [cumulativeReward, setCumulativeReward] = useState(0);

  useEffect(() => {
    // Generate recommendations based on current state
    generateRecommendations();
    
    // Update AI stats when learning or when aiAgent changes
    if (aiAgent) {
      const progress = aiAgent.getLearningProgress();
      setLearningProgress(progress);
      
      if (progress > 0 || isLearning) {
        setQTableStats(aiAgent.getQTableStats());
        setLearningParams(aiAgent.getLearningParameters());
        setActionHistory(aiAgent.getActionHistory());
        setCumulativeReward(aiAgent.getCumulativeReward());
      }
      
      // Poll for updates during learning
      const interval = isLearning ? setInterval(() => {
        setLearningProgress(aiAgent.getLearningProgress());
        setQTableStats(aiAgent.getQTableStats());
        setLearningParams(aiAgent.getLearningParameters());
        setActionHistory(aiAgent.getActionHistory());
        setCumulativeReward(aiAgent.getCumulativeReward());
      }, 500) : null;
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [stations, currentMetrics, isLearning, aiAgent]);

  const generateRecommendations = () => {
    if (!aiAgent) {
      // Fallback recommendations if AI agent is not available
      const newRecommendations: AIRecommendation[] = [];

      // Analyze current performance
      const { averageWaitTime, utilization } = currentMetrics;

      // High wait time recommendations
      if (averageWaitTime > 5) {
        if (utilization > 0.8) {
          newRecommendations.push({
            id: `add-station-${Date.now()}`,
            type: 'add_station',
            description: 'Add additional checkout station',
            impact: `Reduce wait time by ~${(averageWaitTime * 0.3).toFixed(1)} minutes`,
            confidence: 0.85,
            priority: 'high',
            expectedImprovement: 15,
          });
        }

        if (stations.filter(s => s.type === 'kiosk').length < 1) {
          newRecommendations.push({
            id: `add-kiosk-${Date.now()}`,
            type: 'change_type',
            description: 'Add self-service kiosk for faster checkout',
            impact: 'Reduce wait time for customers comfortable with technology',
            confidence: 0.75,
            priority: 'medium',
            expectedImprovement: 10,
          });
        }
      }

      // Low utilization recommendations
      if (utilization < 0.4 && stations.length > 2) {
        newRecommendations.push({
          id: `remove-station-${Date.now()}`,
          type: 'remove_station',
          description: 'Remove underutilized station',
          impact: `Save ~$25/hour in staffing costs`,
          confidence: 0.9,
          priority: 'medium',
          expectedImprovement: 8,
        });
      }

      setRecommendations(newRecommendations);
    } else {
      // Use AI agent for recommendations
      const state = {
        queueLengths: stations.map(s => s.queue.length),
        activeStations: stations.filter(s => s.isActive).length,
        dayType: 'weekday', // Default to weekday
        timeOfDay: 12, // Default to noon
      };
      
      const aiRecommendations = aiAgent.generateRecommendations(state, stations);
      setRecommendations(aiRecommendations);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-100 bg-gradient-to-r from-red-500/30 to-pink-500/30 border-red-400/50';
      case 'medium': return 'text-yellow-100 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border-yellow-400/50';
      case 'low': return 'text-emerald-100 bg-gradient-to-r from-emerald-500/30 to-green-500/30 border-emerald-400/50';
      default: return 'text-white/80 bg-white/20 border-white/30';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Lightbulb className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getScoreAssessment = () => {
    if (currentMetrics.score >= 90) return { text: 'Excellent', color: 'text-emerald-100', icon: '🏆' };
    if (currentMetrics.score >= 80) return { text: 'Good', color: 'text-blue-100', icon: '👍' };
    if (currentMetrics.score >= 70) return { text: 'Fair', color: 'text-yellow-100', icon: '⚠️' };
    return { text: 'Needs Improvement', color: 'text-red-100', icon: '🔧' };
  };

  const assessment = getScoreAssessment();

  // Render the recommendations tab
  const renderRecommendationsTab = () => (
    <div className="space-y-6">
      {/* Current Assessment */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-white">Current Assessment</h4>
          <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <span className="text-3xl">{assessment.icon}</span>
            <span className={`font-semibold ${assessment.color}`}>{assessment.text}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-lg">
            <span className="text-white/70 text-sm">Score:</span>
            <div className="text-xl font-bold text-white">{currentMetrics.score.toFixed(0)}/100</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <span className="text-white/70 text-sm">Stations:</span>
            <div className="text-xl font-bold text-white">{stations.length}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <span className="text-white/70 text-sm">Utilization:</span>
            <div className="text-xl font-bold text-white">{(currentMetrics.utilization * 100).toFixed(0)}%</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <span className="text-white/70 text-sm">Throughput:</span>
            <div className="text-xl font-bold text-white">{currentMetrics.throughput.toFixed(0)}/hr</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-md font-medium text-white mb-4 flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-yellow-300" />
          <span>AI Recommendations ({recommendations.length})</span>
        </h4>

        {recommendations.length === 0 ? (
          <div className="text-center py-8 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <CheckCircle className="w-16 h-16 mx-auto mb-3 text-emerald-400" />
            <p className="text-white font-medium">Your layout looks optimized! 🎉</p>
            <p className="text-white/70 text-sm mt-1">No immediate improvements suggested.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-5 hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-1 bg-white/20 rounded">
                        {getPriorityIcon(rec.priority)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </span>
                      <span className="text-sm text-white/60 px-2 py-1 bg-white/10 rounded-full">
                        {(rec.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className="font-medium text-white mb-2">{rec.description}</p>
                    <p className="text-sm text-white/80 mb-3">{rec.impact}</p>

                    {showAdvanced && (
                      <div className="text-xs text-white/60 space-y-1 p-3 bg-white/5 rounded-lg">
                        <div>Type: <span className="text-white/80 font-mono">{rec.type}</span></div>
                        {rec.newType && <div>Suggested Type: <span className="text-white/80 font-mono">{rec.newType}</span></div>}
                        {rec.newPosition && (
                          <div>Position: <span className="text-white/80 font-mono">({rec.newPosition.x}, {rec.newPosition.y})</span></div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onApplyRecommendation(rec)}
                    className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm group-hover:scale-105"
                  >
                    ✨ Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render the learning tab
  const renderLearningTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 p-6 rounded-lg">
        <h4 className="text-md font-medium text-white mb-4 flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-300" />
          <span>Q-Learning Progress</span>
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-sm text-white/70">Episodes</div>
              <div className="text-xl font-bold text-white">{aiAgent ? aiAgent.getEpisodeCount() : 0}</div>
            </div>
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-sm text-white/70">Exploration Rate</div>
              <div className="text-xl font-bold text-white">{aiAgent ? (aiAgent.getExplorationRate() * 100).toFixed(1) : 0}%</div>
            </div>
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-sm text-white/70">States Learned</div>
              <div className="text-xl font-bold text-white">{qTableStats.stateCount}</div>
            </div>
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-sm text-white/70">Actions Evaluated</div>
              <div className="text-xl font-bold text-white">{qTableStats.actionCount}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/80">
              <span>Learning Progress</span>
              <span>{learningProgress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${learningProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            {!isLearning ? (
              <button
                onClick={onStartLearning}
                disabled={isLearning}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>Start Learning</span>
              </button>
            ) : (
              <button
                onClick={onStopLearning}
                disabled={!isLearning}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                <PauseCircle className="w-4 h-4" />
                <span>Stop Learning</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Q-Learning Parameters */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
        <h4 className="text-md font-medium text-white mb-4 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-300" />
          <span>Learning Parameters</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-white/70">Learning Rate (α)</div>
            <div className="text-lg font-medium text-white">{learningParams.learningRate.toFixed(2)}</div>
            <div className="text-xs text-white/50 mt-1">How quickly new information overrides old</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-white/70">Discount Factor (γ)</div>
            <div className="text-lg font-medium text-white">{learningParams.discountFactor.toFixed(2)}</div>
            <div className="text-xs text-white/50 mt-1">Importance of future rewards</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-white/70">Exploration Rate (ε)</div>
            <div className="text-lg font-medium text-white">{learningParams.explorationRate.toFixed(3)}</div>
            <div className="text-xs text-white/50 mt-1">Probability of trying new actions</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-white/70">Exploration Decay</div>
            <div className="text-lg font-medium text-white">{learningParams.explorationDecay.toFixed(3)}</div>
            <div className="text-xs text-white/50 mt-1">Rate at which exploration decreases</div>
          </div>
        </div>
      </div>
      
      {/* Recent Actions and Rewards */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
        <h4 className="text-md font-medium text-white mb-4 flex items-center space-x-2">
          <Database className="w-5 h-5 text-green-300" />
          <span>Recent Actions & Rewards</span>
        </h4>
        
        <div className="space-y-4">
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-white/70 text-sm">Cumulative Reward</div>
            <div className="text-xl font-bold text-white">{cumulativeReward.toFixed(1)}</div>
          </div>
          
          <div className="max-h-40 overflow-y-auto bg-white/5 rounded-lg p-2">
            <table className="w-full text-xs text-white/80">
              <thead className="text-white/60">
                <tr>
                  <th className="p-2 text-left">Action</th>
                  <th className="p-2 text-right">Reward</th>
                </tr>
              </thead>
              <tbody>
                {actionHistory.slice(-5).reverse().map((item, idx) => (
                  <tr key={idx} className="border-t border-white/10">
                    <td className="p-2">{item.action}</td>
                    <td className={`p-2 text-right ${item.reward > 0 ? 'text-green-400' : item.reward < 0 ? 'text-red-400' : ''}`}>
                      {item.reward > 0 ? '+' : ''}{item.reward.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Render the theory tab
  const renderTheoryTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
        <h4 className="text-md font-medium text-white mb-4 flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-300" />
          <span>Q-Learning in Operations Research</span>
        </h4>
        
        <div className="space-y-4 text-sm text-white/80">
          <p>
            Q-Learning is a reinforcement learning algorithm that learns the value of actions in states by experiencing the rewards of taking those actions. It's particularly useful for optimizing complex systems like checkout layouts.
          </p>
          
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-medium text-white mb-2">The Q-Learning Formula:</h5>
            <div className="font-mono bg-white/10 p-3 rounded text-white">
              Q(s,a) ← Q(s,a) + α[r + γ·max<sub>a'</sub>Q(s',a') - Q(s,a)]
            </div>
            <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
              <li><strong>Q(s,a)</strong>: Expected future reward of action a in state s</li>
              <li><strong>α</strong>: Learning rate (how quickly new information overrides old)</li>
              <li><strong>r</strong>: Immediate reward after taking action a in state s</li>
              <li><strong>γ</strong>: Discount factor (importance of future rewards)</li>
              <li><strong>max<sub>a'</sub>Q(s',a')</strong>: Maximum expected future reward in the next state</li>
            </ul>
          </div>
          
          <p>
            In the checkout optimization context, the AI learns to recommend actions (adding/removing stations, changing types) based on the current state (queue lengths, utilization) to maximize efficiency and customer satisfaction.
          </p>
          
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-medium text-white mb-2">Key Concepts:</h5>
            <ul className="space-y-2">
              <li><strong>States</strong>: Different configurations of the checkout system (queue lengths, station types, time of day)</li>
              <li><strong>Actions</strong>: Changes that can be made to the system (add/remove stations, change types)</li>
              <li><strong>Rewards</strong>: Feedback on how good an action was (based on wait times, throughput, utilization)</li>
              <li><strong>Exploration vs. Exploitation</strong>: Balance between trying new actions and using known good actions</li>
            </ul>
          </div>
          
          <p>
            The AI advisor becomes more accurate as it learns from more episodes, gradually reducing exploration in favor of exploitation of known good strategies.
          </p>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
        <h4 className="text-md font-medium text-white mb-4">Application to Checkout Optimization</h4>
        
        <div className="space-y-4 text-sm text-white/80">
          <p>
            Checkout optimization is a classic operations research problem that balances:
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="font-medium text-white">Customer Satisfaction</div>
              <div className="text-xs mt-1">Minimizing wait times and improving flow</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="font-medium text-white">Resource Efficiency</div>
              <div className="text-xs mt-1">Maximizing utilization of checkout stations</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="font-medium text-white">Operational Costs</div>
              <div className="text-xs mt-1">Minimizing the number of stations needed</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="font-medium text-white">Throughput</div>
              <div className="text-xs mt-1">Maximizing customers served per hour</div>
            </div>
          </div>
          
          <p>
            The Q-Learning algorithm helps find the optimal balance between these competing objectives by learning from simulated experiences and real-world data.
          </p>
          
          <div className="p-4 bg-white/5 rounded-lg">
            <h5 className="font-medium text-white mb-2">Benefits of AI in Checkout Optimization:</h5>
            <ul className="space-y-1 list-disc list-inside">
              <li>Adapts to changing conditions (time of day, day of week)</li>
              <li>Considers complex interactions between variables</li>
              <li>Improves over time with more data</li>
              <li>Can discover non-intuitive optimization strategies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg backdrop-blur-sm">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">AI Advisor</h3>
          {isLearning && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-purple-200">Learning...</span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-purple-200 hover:text-white transition-colors duration-300 px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 backdrop-blur-sm"
          >
            {showAdvanced ? '📊 Simple View' : '🔬 Advanced View'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/20">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === 'recommendations'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white/80 hover:bg-white/10'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === 'learning'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white/80 hover:bg-white/10'
            }`}
          >
            Learning Progress
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === 'theory'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white/80 hover:bg-white/10'
            }`}
          >
            Q-Learning Theory
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'recommendations' && renderRecommendationsTab()}
        {activeTab === 'learning' && renderLearningTab()}
        {activeTab === 'theory' && renderTheoryTab()}
      </div>
    </div>
  );
};

// Provide default export for compatibility with React.lazy
export default AIAdvisor;
