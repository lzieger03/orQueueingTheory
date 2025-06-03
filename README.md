# Checkout Layout Game

An interactive web application that teaches operations research concepts through a browser-based game. Players design store checkout layouts and see real-time effects on customer wait times, throughput, and staff utilization.

## 🎯 Features

### Core Game Components
- **Layout Editor**: Drag-and-drop interface for placing checkout counters, express lanes, and kiosks
- **Simulation Engine**: M/M/c queueing model with discrete-event simulation
- **AI Optimizer**: Q-learning agent that optimizes layouts
- **Real-time Dashboard**: Charts and metrics visualization
- **Parameter Controls**: Sliders for arrival rates, service times, etc.

### Educational Concepts
- **Queueing Theory**: M/M/c models, server utilization, Little's Law
- **Discrete-Event Simulation**: Event-driven simulation approach
- **Reinforcement Learning**: Q-learning algorithm for layout optimization
- **Operations Research**: Optimization, performance metrics, trade-offs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone and install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Usage
1. **Design Layout**: Use the palette to add checkout stations (regular, express, self-service)
2. **Configure Parameters**: Adjust arrival rates, service times, and customer behavior
3. **Run Simulation**: Start the simulation to see real-time performance
4. **Get AI Advice**: Enable AI advisor for optimization recommendations
5. **Analyze Results**: Review metrics and historical performance data

## 🏗️ Architecture

### Frontend Stack
- **React + TypeScript**: Component-based UI with type safety
- **Tailwind CSS**: Utility-first styling framework
- **Vite**: Fast development build tool
- **Recharts**: Chart library for data visualization
- **React DnD**: Drag-and-drop functionality

### Core Systems
- **State Management**: XState for game state machines
- **Simulation**: Custom discrete-event simulation engine
- **AI/ML**: TensorFlow.js for reinforcement learning
- **Validation**: Real-time layout and parameter validation

## 🎮 Game Mechanics

### Station Types
- **Regular**: Standard checkout counter for all customers
- **Express**: Fast lane for customers with ≤10 items
- **Self-Service**: Customer-operated kiosks

### Performance Metrics
- **Wait Time**: Average time customers spend waiting
- **Throughput**: Customers served per hour
- **Utilization**: Percentage of time servers are busy
- **Customer Satisfaction**: Based on wait time experience
- **Overall Score**: Weighted performance indicator

### AI Recommendations
The Q-learning agent analyzes current performance and suggests:
- Adding/removing stations
- Changing station types
- Repositioning for better flow
- Optimizing staffing levels

## 🔧 Technical Details

### Queueing Theory Implementation
- **M/M/c Model**: Markovian arrivals and service with c servers
- **Little's Law**: L = λW relationships
- **Server Utilization**: ρ = λ/(μc) calculations
- **Wait Time Analysis**: Wq and Ws distributions

### Simulation Engine
- **Event-Driven**: Processes arrival, service start/end events
- **Real-time Updates**: Continuous metric calculation
- **Customer Behavior**: Abandonment, priority queues
- **Validation**: Layout and parameter constraints

### AI Learning System
- **State Representation**: Layout configuration and metrics
- **Action Space**: Add, remove, move, change station types
- **Reward Function**: Based on wait time, utilization, satisfaction
- **Exploration**: ε-greedy policy with decay

## 🎯 Learning Objectives

Students will understand:
- How queueing theory applies to real-world systems
- Trade-offs between service capacity and costs
- Impact of customer behavior on system performance
- Role of layout design in operational efficiency
- Basics of reinforcement learning optimization

## Status

✅ **COMPLETED**: Core application architecture and components
✅ **COMPLETED**: TypeScript type system and imports
✅ **COMPLETED**: React DnD drag-and-drop functionality
✅ **COMPLETED**: Simulation dashboard with real-time charts
✅ **COMPLETED**: AI advisor with recommendation system
✅ **COMPLETED**: XState game state management
✅ **COMPLETED**: Queueing theory calculations (M/M/c)
✅ **COMPLETED**: Discrete-event simulation engine
✅ **COMPLETED**: Development server running successfully

🔄 **IN PROGRESS**: Final testing and polishing
📋 **TODO**: Performance optimization and documentation

---

Built with ❤️ for operations research education
