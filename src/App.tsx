import { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CheckoutLayoutGame from './components/CheckoutLayoutGame';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#1f2937', color: 'white', minHeight: '100vh' }}>
          <h1 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: '#fca5a5' }}>Error: {this.state.error?.message}</p>
          <pre style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#374151', borderRadius: '0.5rem', fontSize: '0.875rem', overflow: 'auto' }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // Set dark mode as default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: '#f9fafb' }}>
        <ErrorBoundary>
          <CheckoutLayoutGame />
        </ErrorBoundary>
      </div>
    </DndProvider>
  );
}

export default App
