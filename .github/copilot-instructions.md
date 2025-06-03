<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Checkout Layout Game - Copilot Instructions

This project is an interactive web application that combines queueing theory, discrete-event simulation, and reinforcement learning to create an educational game about retail operations optimization.

## Project Architecture

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Visualization**: Recharts for charts and real-time dashboards
- **State Management**: XState for game state machines
- **Simulation**: Custom discrete-event simulation engine
- **AI/ML**: TensorFlow.js for reinforcement learning
- **Drag & Drop**: React DnD for layout editor

## Key Components

1. **Layout Editor**: Drag-and-drop interface for placing checkout counters, express lanes, and kiosks
2. **Simulation Engine**: M/M/c queueing model with discrete-event simulation
3. **AI Optimizer**: Q-learning agent that optimizes layouts
4. **Dashboard**: Real-time metrics visualization
5. **Parameter Controls**: Sliders for arrival rates, service times, etc.

## Code Style Guidelines

- Use functional components with TypeScript
- Implement proper error boundaries
- Use Tailwind utility classes for styling
- Follow React best practices for state management
- Use XState for complex state transitions
- Implement proper TypeScript interfaces for all data structures

## Domain-Specific Terms

- **M/M/c**: Markovian arrival/service with c servers
- **ρ (rho)**: Server utilization ratio
- **Wₛ**: Average waiting time in system
- **Lₛ**: Average number in system
- **MDP**: Markov Decision Process
- **Q-learning**: Reinforcement learning algorithm
- **Discrete-event simulation**: Event-driven simulation approach

## File Organization

- `/src/components`: Reusable UI components
- `/src/simulation`: Simulation engine and queueing theory logic
- `/src/ai`: Reinforcement learning and optimization
- `/src/types`: TypeScript type definitions
- `/src/hooks`: Custom React hooks
- `/src/utils`: Utility functions and helpers
- `/src/data`: Sample data and scenarios
