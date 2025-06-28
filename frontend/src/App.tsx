import './App.css'
import Network from './Network';
import LandingPage from './LandingPage';
import { useState } from 'react';

// Type definitions
interface Node {
  id: string;
  label: string;
  type: 'essay' | 'person';
  x?: number;
  y?: number;
  z?: number;
}

interface Edge {
  source: string;
  target: string;
  label: string;
}

interface NetworkData {
  nodes: Node[];
  edges: Edge[];
  metadata: {
    total_nodes: number;
    total_edges: number;
    files_processed: number;
  };
}

// Default data structure for the Network component
const defaultData: NetworkData = {
  nodes: [],
  edges: [],
  metadata: {
    total_nodes: 0,
    total_edges: 0,
    files_processed: 0
  }
};

function App() {
  const [data, setData] = useState<NetworkData>(defaultData);
  const [showVisualization, setShowVisualization] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataProcessed = (processedData: NetworkData) => {
    setData(processedData);
    setShowVisualization(true);
  };

  const handleBackToLanding = () => {
    setShowVisualization(false);
    setData(defaultData);
    setError(null);
  };

  // If we have data and should show visualization, render the network
  if (showVisualization && data.nodes.length > 0) {
    // Convert the processed data format to the format expected by Network component
    const networkData: Record<string, string[]> = {};
    
    // Group persons by their essay
    data.nodes.forEach((node: Node) => {
      if (node.type === 'person') {
        // Find the essay this person is connected to
        const connection = data.edges.find((edge: Edge) => edge.target === node.id);
        if (connection) {
          const essayNode = data.nodes.find((n: Node) => n.id === connection.source);
          const essayName = essayNode?.label || 'unknown';
          if (!networkData[essayName]) {
            networkData[essayName] = [];
          }
          networkData[essayName].push(node.label);
        }
      }
    });

    return (
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <Network data={networkData} metadata={data.metadata} />
        <button 
          onClick={handleBackToLanding}
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 1000,
            padding: '8px 16px',
            backgroundColor: 'rgba(52, 152, 219, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            maxWidth: '120px',
            margin: '0'
          }}
        >
          ← Back to Upload
        </button>
      </div>
    );
  }

  // Show error state if needed
  if (error) {
    return (
      <div style={{ 
        width: "100vw", 
        height: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        flexDirection: "column",
        fontSize: "18px",
        fontFamily: "Georgia, serif",
        color: "#2c3e50"
      }}>
        <div style={{ color: "#e74c3c", marginBottom: "10px" }}>
          Error: {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            padding: "10px 20px", 
            fontSize: "16px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontFamily: "Georgia, serif"
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Default: show the landing page
  return <LandingPage onDataProcessed={handleDataProcessed} />;
}

export default App
