import './App.css'
import Network from './Network';
import LandingPage from './LandingPage';
import { useState, useEffect } from 'react';

// Type definitions
interface Node {
  id: string;
  label: string;
  type: 'essay' | 'person';
  x?: number;
  y?: number;
  z?: number;
  metadata?: Record<string, any>;
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
    node_types?: {
      person: string;
      person_plural: string;
      essay: string;
      essay_plural: string;
    };
    person_counts_by_essay?: Record<string, Record<string, number>>;
    person_to_essay_map?: Record<string, string>;
    essay_id_to_name_map?: Record<string, string>;
    person_metadata?: Record<string, Record<string, any>>;
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

console.debug('[App] App component loaded');

function App() {
  console.debug('[App] App component rendering');
  const [data, setData] = useState<NetworkData>(defaultData);
  const [showVisualization, setShowVisualization] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useConfigData, setUseConfigData] = useState(false);
  const [showAdditionalMetadata, setShowAdditionalMetadata] = useState(true);

  // Load config.json data on component mount
  useEffect(() => {
    const loadConfigData = async () => {
      console.debug('[App] loadConfigData called');
      const paths = ['/dh_project/config.json', './config.json', '/config.json'];
      
      for (const path of paths) {
        try {
          console.log(`Trying to load config.json from: ${path}`);
          const response = await fetch(path);
          console.log(`Config.json response status for ${path}:`, response.status);
          if (response.ok) {
            const configData = await response.json();
            console.log('Config.json loaded successfully:', configData.data?.nodes?.length, 'nodes');
            const processedData = convertConfigToNetworkData(configData);
            console.log('Processed data:', processedData.nodes.length, 'nodes, useConfigData will be true');
            setData(processedData);
            setShowVisualization(true);
            setUseConfigData(true);
            return; // Success, exit the loop
          } else {
            console.log(`Config.json not found at ${path}, status:`, response.status);
          }
        } catch (error) {
          console.log(`Config.json not found or invalid at ${path}:`, error);
        }
      }
      
      console.log('Config.json not found at any path, using default landing page');
    };

    loadConfigData();
  }, []);

  const convertConfigToNetworkData = (configData: any): NetworkData => {
    console.debug('[App] convertConfigToNetworkData called');
    console.log('Converting config data...');
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const personCountsByEssay: Record<string, Record<string, number>> = {};
    const personToEssayMap: Record<string, string> = {};
    const essayIdToNameMap: Record<string, string> = {};

    // Helper function to format essay names
    const formatEssayName = (essayName: string): string => {
      // Convert "essays-01-03-persons-OR" to "Essay 3 (Book 1) - Persons"
      // Also handles "essays-01-01-events", "essays-01-01-apples", etc.
      const match = essayName.match(/essays-(\d{2})-(\d{2})-([^-]+)(?:-([^-]+))?/);
      if (match) {
        const bookNumber = parseInt(match[1]);
        const essayNumber = parseInt(match[2]);
        const thingType = match[3]; // persons, places, events, apples, horses, etc.
        const optionalSuffix = match[4]; // OR or other optional suffix
        
        let formattedName = `Essay ${essayNumber} (Book ${bookNumber}) - ${thingType.charAt(0).toUpperCase() + thingType.slice(1)}`;
        if (optionalSuffix) {
          formattedName += ` - ${optionalSuffix}`;
        }
        return formattedName;
      }
      
      // Fallback: try to parse the old format "essays 01_04 persons"
      const oldMatch = essayName.match(/essays (\d{2})_(\d{2})/);
      if (oldMatch) {
        const bookNumber = parseInt(oldMatch[1]);
        const essayNumber = parseInt(oldMatch[2]);
        return `Essay ${essayNumber} (Book ${bookNumber})`;
      }
      
      return essayName;
    };

    // First pass: create essay nodes and store their names
    configData.data.nodes.forEach((node: any) => {
      console.debug(`[App] Processing node:`, node);
      if (node.type === 'essay') {
        const essayName = node.properties?.essay_name || node.label;
        const formattedEssayName = formatEssayName(essayName);
        console.log(`Essay: "${essayName}" -> "${formattedEssayName}"`);
        
        // Create essay node
        nodes.push({
          id: node.id.toString(),
          label: formattedEssayName, // Use formatted essay name
          type: 'essay',
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
          z: (Math.random() - 0.5) * 20
        });
        
        // Store essay name mapping (use original name for person mapping)
        essayIdToNameMap[node.id.toString()] = essayName;
      }
    });

    // Second pass: create person nodes and map them to essays
    configData.data.nodes.forEach((node: any) => {
      if (node.type === 'person') {
        // Extract additional metadata properties (excluding basic ones)
        const additionalProperties: Record<string, any> = {};
        if (node.properties) {
          Object.entries(node.properties).forEach(([key, value]) => {
            if (key !== 'essay' && key !== 'row_index' && key !== 'source' && 
                value !== 'nan' && value !== null && value !== undefined && value !== '') {
              additionalProperties[key] = value;
            }
          });
        }

        // Create person node with additional metadata
        nodes.push({
          id: node.id.toString(),
          label: node.label, // Use actual person name from config
          type: 'person',
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
          z: (Math.random() - 0.5) * 10,
          metadata: additionalProperties // Store additional properties
        });

        // Store the mapping of person to essay (use formatted essay name)
        if (node.properties && node.properties.essay) {
          const formattedEssayName = formatEssayName(node.properties.essay);
          personToEssayMap[node.id.toString()] = formattedEssayName;
        }
      }
    });

    // Process edges from config
    configData.data.edges.forEach((edge: any) => {
      console.debug(`[App] Processing edge:`, edge);
      if (edge.label === 'contains' || edge.label === 'shares_persons') {
        edges.push({
          source: edge.source.toString(),
          target: edge.target.toString(),
          label: edge.label
        });
      }
    });

    // Build person counts by essay from the data
    nodes.forEach((node) => {
      console.debug(`[App] Building person counts for node:`, node);
      if (node.type === 'person') {
        const essayName = personToEssayMap[node.id];
        if (essayName) {
          if (!personCountsByEssay[essayName]) {
            personCountsByEssay[essayName] = {};
          }
          personCountsByEssay[essayName][node.label] = (personCountsByEssay[essayName][node.label] || 0) + 1;
        }
      }
    });

    // Build person metadata mapping
    const personMetadata: Record<string, Record<string, any>> = {};
    nodes.forEach((node) => {
      console.debug(`[App] Building person metadata for node:`, node);
      if (node.type === 'person' && node.metadata) {
        personMetadata[node.label] = node.metadata;
      }
    });

    return {
      nodes,
      edges,
      metadata: {
        total_nodes: nodes.length,
        total_edges: edges.length,
        files_processed: configData.data.metadata?.total_essays || 0,
        node_types: configData.data.metadata?.node_types || {
          person: 'Person',
          person_plural: 'Persons',
          essay: 'Essay',
          essay_plural: 'Essays'
        },
        person_counts_by_essay: personCountsByEssay,
        person_to_essay_map: personToEssayMap,
        essay_id_to_name_map: essayIdToNameMap,
        person_metadata: personMetadata
      }
    };
  };

  const handleDataProcessed = (processedData: NetworkData) => {
    console.debug('[App] handleDataProcessed called', processedData);
    setData(processedData);
    setShowVisualization(true);
    setUseConfigData(false);
  };

  const handleBackToLanding = () => {
    console.debug('[App] handleBackToLanding called');
    setShowVisualization(false);
    setData(defaultData);
    setError(null);
    setUseConfigData(false);
  };

  // If we have data and should show visualization, render the network
  if (showVisualization && data.nodes.length > 0) {
    console.debug('[App] Rendering Network component with data:', data);
    // Convert the processed data format to the format expected by Network component
    const networkData: Record<string, string[]> = {};
    
    if (useConfigData) {
      console.log('Using config data, useConfigData =', useConfigData);
      // For config data, group persons by their essay using the stored mapping
      data.nodes.forEach((node: Node) => {
        if (node.type === 'person') {
          const essayName = data.metadata.person_to_essay_map?.[node.id];
          if (essayName) {
            if (!networkData[essayName]) {
              networkData[essayName] = [];
            }
            networkData[essayName].push(node.label); // This is the actual person name
          }
        }
      });
      console.log('Network data from config:', Object.keys(networkData));
      console.log('Sample network data:', Object.entries(networkData).slice(0, 3));
      console.log('🔍 Config metadata being passed to Network:', data.metadata);
    } else {
      // For CSV data, use the original logic
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
      console.log('🔍 CSV metadata being passed to Network:', data.metadata);
    }

    return (
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <Network 
          data={networkData} 
          metadata={data.metadata} 
          showAdditionalMetadata={showAdditionalMetadata}
        />
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
    console.error('[App] Error state:', error);
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
  return (
    <LandingPage 
      onDataProcessed={handleDataProcessed} 
      showAdditionalMetadata={showAdditionalMetadata}
      onMetadataToggle={setShowAdditionalMetadata}
    />
  );
}

console.debug('[App] App component export');
export default App
