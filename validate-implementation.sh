#!/bin/bash

# Validation Script for Simulation Speed Control Implementation
# This script checks that all key changes are properly implemented

echo "🔍 Validating Simulation Speed Control Implementation..."
echo "=================================================="

PROJECT_ROOT="/Users/lars/Downloads/improved_checkoutGame/checkoutGame/checkoutGame"
cd "$PROJECT_ROOT"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a string exists in a file
check_implementation() {
    local file="$1"
    local pattern="$2"
    local description="$3"
    
    if [ -f "$file" ]; then
        if grep -q "$pattern" "$file"; then
            echo -e "${GREEN}✅ $description${NC}"
            return 0
        else
            echo -e "${RED}❌ $description${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ File not found: $file${NC}"
        return 1
    fi
}

echo -e "\n${YELLOW}1. Checking Core Simulation Speed Logic...${NC}"
check_implementation "src/hooks/useGameState.ts" "const speed = state.context.simulationSpeed" "Speed variable extraction"
check_implementation "src/hooks/useGameState.ts" "baseStepInterval / speed" "Speed-based interval calculation"
check_implementation "src/hooks/useGameState.ts" "Math.random() < speed" "Probabilistic frame skipping for slow speeds"

echo -e "\n${YELLOW}2. Checking Speed Control UI...${NC}"
check_implementation "src/components/SimulationSpeedButton.tsx" "0.1" "Ultra slow speed option (0.1x)"
check_implementation "src/components/SimulationSpeedButton.tsx" "localStorage" "Speed persistence with localStorage"
check_implementation "src/components/CheckoutLayoutGame.tsx" "SimulationSpeedButton" "Speed button integration"

echo -e "\n${YELLOW}3. Checking Queue Positioning...${NC}"
check_implementation "src/components/MainQueueVisualizer.tsx" "bottom-8" "Queue positioned at bottom"
check_implementation "src/components/MainQueueVisualizer.tsx" "z-30" "Queue z-index for visibility"
check_implementation "src/components/EnhancedMainQueueVisualizer.tsx" "bottom-8" "Enhanced queue positioned at bottom"

echo -e "\n${YELLOW}4. Checking Animation Enhancements...${NC}"
check_implementation "src/index.css" "ultra-slow-motion" "Ultra slow animation class"
check_implementation "src/index.css" "customerMoveEnhanced" "Enhanced customer movement animation"
check_implementation "src/index.css" "15s" "15-second animation duration for ultra slow"
check_implementation "src/index.css" "var(--move-x)" "CSS custom properties for dynamic paths"

echo -e "\n${YELLOW}5. Checking Component Integration...${NC}"
check_implementation "src/components/LayoutEditor.tsx" "simulationSpeed" "Speed integration in layout editor"
check_implementation "src/components/EnhancedLayoutEditor.tsx" "animationTime" "Dynamic animation timing"

echo -e "\n${YELLOW}6. Checking Documentation...${NC}"
check_implementation "documentation/simulation-speed-implementation.md" "Algorithm Overview" "Technical documentation exists"
check_implementation "documentation/simulation-speed-controls.md" "Speed Control Options" "User documentation exists"
check_implementation "documentation/simulation-speed-testing.md" "Testing Checklist" "Testing guide exists"

echo -e "\n${YELLOW}7. Checking Build Configuration...${NC}"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json exists${NC}"
else
    echo -e "${RED}❌ package.json not found${NC}"
fi

if [ -f "vite.config.ts" ]; then
    echo -e "${GREEN}✅ Vite configuration exists${NC}"
else
    echo -e "${RED}❌ Vite configuration not found${NC}"
fi

echo -e "\n${YELLOW}8. Checking for Common Issues...${NC}"

# Check for potential import issues
if grep -r "import.*SimulationSpeedButton" src/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ SimulationSpeedButton is properly imported${NC}"
else
    echo -e "${YELLOW}⚠️  SimulationSpeedButton imports should be verified${NC}"
fi

# Check for CSS class usage
if grep -r "ultra-slow-motion\|slow-motion-queue" src/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Animation classes are being used${NC}"
else
    echo -e "${YELLOW}⚠️  Animation class usage should be verified${NC}"
fi

# Check TypeScript compilation
echo -e "\n${YELLOW}9. Checking TypeScript Compilation...${NC}"
if command -v npx > /dev/null 2>&1; then
    if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
        echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
    else
        echo -e "${RED}❌ TypeScript compilation errors detected${NC}"
        echo "Run 'npx tsc --noEmit' for details"
    fi
else
    echo -e "${YELLOW}⚠️  TypeScript compiler not available${NC}"
fi

echo -e "\n${YELLOW}10. Next Steps...${NC}"
echo "1. Start development server: npm run dev"
echo "2. Open http://localhost:5175 in browser"
echo "3. Test speed controls using the testing guide"
echo "4. Verify queue positioning and animations"
echo "5. Test performance across different speeds"

echo -e "\n🎯 ${GREEN}Validation Complete!${NC}"
echo "Review any ❌ items above and refer to the documentation for detailed testing procedures."
