import './App.css'
import Network from './Network';
import { useState, useEffect } from 'react';

// Default data structure for the Network component
const defaultData = {
  nodes: [],
  edges: [],
  metadata: {}
};

function App() {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData = await response.json();
        setData(apiData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        width: "100vw", 
        height: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        fontSize: "18px"
      }}>
        Loading data from API...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width: "100vw", 
        height: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        flexDirection: "column",
        fontSize: "18px"
      }}>
        <div style={{ color: "red", marginBottom: "10px" }}>
          Error: {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Convert the API data format to the format expected by Network component
  // Essays should be the main nodes (animals), persons should be the items (fables)
  const networkData: Record<string, string[]> = {};
  
  // Group persons by their essay
  data.nodes.forEach((node: any) => {
    if (node.type === 'person') {
      const essayName = node.properties?.essay || 'unknown';
      if (!networkData[essayName]) {
        networkData[essayName] = [];
      }
      networkData[essayName].push(node.label);
    }
  });

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Network data={networkData} metadata={data.metadata} />
    </div>
  );
}

export default App
