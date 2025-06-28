import React, { useState, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";

const distinctColors = [
  "#FF0000", "#00FF00", "#FF1493", "#FFFF00", "#FF00FF",
  "#00FFFF", "#FFA500", "#800080", "#808000", "#008080",
  "#000000", "#808080", "#C71585", "#4682B4", "#A52A2A",
];

const getDistinctColor = (index: number): string => distinctColors[index % distinctColors.length];
const getRandomPosition = (): [number, number, number] => [
  Math.random() * 60 - 30,
  Math.random() * 60 - 30,
  Math.random() * 60 - 30,
];

// Function to extract book number from essay name
const getBookNumber = (essayName: string): number => {
  // Look for pattern like "essays 03_03 persons" - extract the first number after "essays "
  const match = essayName.match(/essays (\d{2})_/);
  return match ? parseInt(match[1]) : 0;
};

// Function to get book color
const getBookColor = (bookNumber: number): string => {
  return distinctColors[bookNumber % distinctColors.length];
};

interface RotatingGroupProps {
  isInteracting: boolean;
  children: React.ReactNode;
}

const RotatingGroup: React.FC<RotatingGroupProps> = ({ isInteracting, children }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!isInteracting && groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

interface NetworkProps {
  data: Record<string, string[]>;
  metadata?: any;
}

const Network: React.FC<NetworkProps> = ({ data, metadata }) => {
  const [hoveredNodeDetails, setHoveredNodeDetails] = useState<any>(null);
  const [useBookColors, setUseBookColors] = useState(false);
  const [visibleAnimals, setVisibleAnimals] = useState<Record<string, boolean>>(
    () =>
      Object.keys(data).reduce((acc, animal) => {
        acc[animal] = true;
        return acc;
      }, {} as Record<string, boolean>)
  );
  const [intersectionMode, setIntersectionMode] = useState(false);
  const [layoutType, setLayoutType] = useState<'random' | 'radial' | 'betweenness' | 'community'>('random');
  const [isRotating, setIsRotating] = useState(false);

  // Use metadata for proper labels, fallback to defaults
  const itemTypeLabel = metadata?.node_types?.person || "Person";
  const totalNodeLabel = "Essays";
  const totalItemLabel = "Persons";

  // Calculate network metrics for positioning
  const networkMetrics = useMemo(() => {
    const allNodes = [...Object.keys(data), ...Array.from(new Set(Object.values(data).flat()))];
    const nodeDegrees: Record<string, number> = {};
    const nodeBetweenness: Record<string, number> = {};
    
    // Calculate degrees
    Object.keys(data).forEach(essay => {
      nodeDegrees[essay] = data[essay].length;
    });
    
    Object.values(data).flat().forEach(person => {
      nodeDegrees[person] = (nodeDegrees[person] || 0) + 1;
    });
    
    // Calculate betweenness centrality (simplified)
    allNodes.forEach(node => {
      let betweenness = 0;
      allNodes.forEach(source => {
        allNodes.forEach(target => {
          if (source !== target && source !== node && target !== node) {
            // Count shortest paths through this node
            // This is a simplified version
            if (nodeDegrees[node] > nodeDegrees[source] && nodeDegrees[node] > nodeDegrees[target]) {
              betweenness += 1;
            }
          }
        });
      });
      nodeBetweenness[node] = betweenness;
    });
    
    return { nodeDegrees, nodeBetweenness };
  }, [data]);

  // Community detection (simplified using connected components)
  const communities = useMemo(() => {
    const visited = new Set<string>();
    const communities: string[][] = [];
    
    const dfs = (node: string, community: string[]) => {
      if (visited.has(node)) return;
      visited.add(node);
      community.push(node);
      
      // Find connected nodes
      if (Object.keys(data).includes(node)) {
        // This is an essay, find connected persons
        data[node].forEach(person => {
          if (!visited.has(person)) {
            dfs(person, community);
          }
        });
      } else {
        // This is a person, find connected essays
        Object.entries(data).forEach(([essay, persons]) => {
          if (persons.includes(node) && !visited.has(essay)) {
            dfs(essay, community);
          }
        });
      }
    };
    
    const allNodes = [...Object.keys(data), ...Array.from(new Set(Object.values(data).flat()))];
    allNodes.forEach(node => {
      if (!visited.has(node)) {
        const community: string[] = [];
        dfs(node, community);
        if (community.length > 0) {
          communities.push(community);
        }
      }
    });
    
    return communities;
  }, [data]);

  const getPositionByLayout = (node: string, layoutType: string) => {
    switch (layoutType) {
      case 'radial':
        return getRadialPosition(node);
      case 'betweenness':
        return getBetweennessPosition(node);
      case 'community':
        return getCommunityPosition(node);
      default:
        return getRandomPosition();
    }
  };

  const getRadialPosition = (node: string): [number, number, number] => {
    const degree = networkMetrics.nodeDegrees[node] || 1;
    const maxDegree = Math.max(...Object.values(networkMetrics.nodeDegrees));
    const radius = (1 - degree / maxDegree) * 40;
    const angle = Math.random() * 2 * Math.PI;
    const height = (Math.random() - 0.5) * 30;
    
    return [
      radius * Math.cos(angle),
      height,
      radius * Math.sin(angle)
    ];
  };

  const getBetweennessPosition = (node: string): [number, number, number] => {
    const betweenness = networkMetrics.nodeBetweenness[node] || 0;
    const maxBetweenness = Math.max(...Object.values(networkMetrics.nodeBetweenness));
    const normalizedBetweenness = betweenness / maxBetweenness;
    
    // Position high-betweenness nodes at strategic points
    const angle = normalizedBetweenness * 2 * Math.PI;
    const radius = 40 + normalizedBetweenness * 40;
    const height = (Math.random() - 0.5) * 50;
    
    return [
      radius * Math.cos(angle),
      height,
      radius * Math.sin(angle)
    ];
  };

  const getCommunityPosition = (node: string): [number, number, number] => {
    // Find which community this node belongs to
    const communityIndex = communities.findIndex(community => community.includes(node));
    if (communityIndex === -1) return getRandomPosition();
    
    const community = communities[communityIndex];
    const nodeIndex = community.indexOf(node);
    
    // Position communities in different regions
    const communityAngle = (communityIndex / communities.length) * 2 * Math.PI;
    const communityRadius = 60;
    
    // Position within community
    const localAngle = (nodeIndex / community.length) * 2 * Math.PI;
    const localRadius = 20;
    
    return [
      communityRadius * Math.cos(communityAngle) + localRadius * Math.cos(localAngle),
      (Math.random() - 0.5) * 40,
      communityRadius * Math.sin(communityAngle) + localRadius * Math.sin(localAngle)
    ];
  };

  const { nodePositions, fablePositions, animalColors } = useMemo(() => {
    const nodePositions: Record<string, [number, number, number]> = {};
    const fablePositions: Record<string, [number, number, number]> = {};
    const animalColors: Record<string, string> = {};

    Object.keys(data).forEach((animal, index) => {
      nodePositions[animal] = getPositionByLayout(animal, layoutType);
      animalColors[animal] = getDistinctColor(index);
    });

    const allFables = Array.from(new Set(Object.values(data).flat()));
    allFables.forEach((fable) => {
      fablePositions[fable] = getPositionByLayout(fable, layoutType);
    });

    return { nodePositions, fablePositions, animalColors };
  }, [data, layoutType, networkMetrics, communities]);

  // Create a unique key for re-rendering based on visibility state
  const renderKey = useMemo(() => {
    const selectedCount = Object.values(visibleAnimals).filter(v => v).length;
    const intersectionActive = intersectionMode ? 1 : 0;
    return `${selectedCount}-${intersectionActive}-${layoutType}-${JSON.stringify(visibleAnimals)}`;
  }, [visibleAnimals, intersectionMode, layoutType]);

  const toggleAnimalVisibility = (animal: string) => {
    setVisibleAnimals((prev) => {
      const newState = {
        ...prev,
        [animal]: !prev[animal],
      };
      return newState;
    });
  };

  const intersectingFables = useMemo(() => {
    const selectedAnimals = Object.keys(visibleAnimals).filter(
      (animal) => visibleAnimals[animal]
    );

    if (selectedAnimals.length === 0 || !intersectionMode) {
      return null;
    }

    // Get the list of fables for each selected animal
    const fablesLists = selectedAnimals.map((animal) => data[animal]);
    
    // Filter out NaN values before intersection
    const cleanFablesLists = fablesLists.map(fables => 
      fables.filter(fable => fable !== 'nan' && fable !== 'NaN' && fable !== null && fable !== undefined && fable !== '')
    );

    // Compute the intersection of all fable lists
    const intersection = cleanFablesLists.reduce((commonFables, currentFables) => {
      return commonFables.filter((fable) => currentFables.includes(fable));
    }, cleanFablesLists[0] || []);

    return intersection;
  }, [visibleAnimals, intersectionMode, data]);

  // Get visible fables (persons) based on selected essays
  const visibleFables = useMemo(() => {
    const selectedAnimals = Object.keys(visibleAnimals).filter(
      (animal) => visibleAnimals[animal]
    );

    if (selectedAnimals.length === 0) {
      return new Set<string>();
    }

    const allFables = new Set<string>();
    selectedAnimals.forEach((animal) => {
      data[animal].forEach((fable) => allFables.add(fable));
    });

    return allFables;
  }, [visibleAnimals, data]);

  const networkStats = useMemo(() => {
    const totalAnimals = Object.keys(data).length;
    const totalFables = new Set(Object.values(data).flat()).size;

    const totalLinks = Object.values(data).reduce(
      (sum, fables) => sum + fables.length,
      0
    );

    const nodeDegrees = Object.keys(data).reduce((acc, animal) => {
      acc[animal] = data[animal].length;
      return acc;
    }, {} as Record<string, number>);

    const averageDegree = totalLinks / totalAnimals;

    const density = totalLinks / (totalAnimals * totalFables);

    return {
      totalAnimals,
      totalFables,
      totalLinks,
      nodeDegrees,
      averageDegree,
      density,
    };
  }, [data]);

  // Handle hover events with detailed information
  const handleNodeHover = (nodeName: string, nodeType: 'essay' | 'person') => {
    setHoveredNodeDetails({
      name: nodeName,
      type: nodeType,
    });
  };

  const handleNodeLeave = () => {
    setHoveredNodeDetails(null);
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", position: "relative" }}>
      {/* Hover Overlay - Responsive positioning */}
      {hoveredNodeDetails && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          maxWidth: '300px',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          fontFamily: 'Georgia, serif',
          fontSize: '14px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#3498db' }}>
            {hoveredNodeDetails.name}
          </h3>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#bdc3c7' }}>
            Type: {hoveredNodeDetails.type}
          </p>
        </div>
      )}

      <div
        style={{
          width: "280px",
          padding: "20px",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          overflowY: "auto",
          borderRight: "1px solid #dee2e6",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)"
        }}
      >
        <h3 style={{ 
          margin: "0 0 20px 0", 
          fontSize: "24px", 
          fontWeight: "600", 
          color: "#2c3e50",
          borderBottom: "2px solid #3498db",
          paddingBottom: "10px"
        }}>
          Network Controls
        </h3>
        
        {/* Book Color Toggle */}
        <div style={{ 
          marginBottom: "25px", 
          padding: "15px", 
          background: "rgba(52, 152, 219, 0.1)", 
          borderRadius: "8px",
          border: "1px solid rgba(52, 152, 219, 0.2)"
        }}>
          <label style={{ display: 'flex', alignItems: 'center', fontWeight: '600', color: '#2c3e50' }}>
            <input
              type="checkbox"
              checked={useBookColors}
              onChange={() => setUseBookColors(!useBookColors)}
              style={{ marginRight: '10px', transform: 'scale(1.2)' }}
            />
            Color by Book
          </label>
          <p style={{ fontSize: "12px", color: "#6c757d", margin: "8px 0 0 0", fontStyle: "italic" }}>
            {useBookColors ? "Essays are colored by their book number" : "Each essay has its own unique color"}
          </p>
        </div>

        {/* Essay Selection */}
        <div style={{ marginBottom: "25px" }}>
          <h4 style={{ 
            margin: "0 0 15px 0", 
            fontSize: "18px", 
            fontWeight: "600", 
            color: "#2c3e50",
            borderBottom: "1px solid #dee2e6",
            paddingBottom: "5px"
          }}>
            Essays
          </h4>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {Object.keys(data).map((animal) => {
              const bookNumber = getBookNumber(animal);
              const bookColor = getBookColor(bookNumber);
              const individualColor = animalColors[animal];
              const displayColor = useBookColors ? bookColor : individualColor;
              
              return (
                <div key={animal} style={{ 
                  marginBottom: "8px",
                  padding: "8px",
                  borderRadius: "6px",
                  background: visibleAnimals[animal] ? "rgba(52, 152, 219, 0.1)" : "rgba(108, 117, 125, 0.1)",
                  border: visibleAnimals[animal] ? "1px solid rgba(52, 152, 219, 0.3)" : "1px solid rgba(108, 117, 125, 0.2)"
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={visibleAnimals[animal]}
                      onChange={() => toggleAnimalVisibility(animal)}
                      style={{ marginRight: '10px', transform: 'scale(1.1)' }}
                    />
                    <span style={{ 
                      display: 'inline-block', 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: displayColor, 
                      marginRight: '10px',
                      borderRadius: '3px',
                      border: '1px solid rgba(0,0,0,0.2)'
                    }}></span>
                    <span style={{ 
                      fontSize: "13px", 
                      color: visibleAnimals[animal] ? "#2c3e50" : "#6c757d",
                      fontWeight: visibleAnimals[animal] ? "500" : "400"
                    }}>
                      {animal} ({networkStats.nodeDegrees[animal]} {itemTypeLabel.toLowerCase()}s)
                    </span>
                    {useBookColors && (
                      <span style={{ 
                        fontSize: '10px', 
                        color: '#6c757d', 
                        marginLeft: '8px',
                        fontStyle: 'italic'
                      }}>
                        (Book {bookNumber})
                      </span>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #dee2e6", margin: "20px 0" }} />
        
        {/* Network Statistics */}
        <div style={{ marginBottom: "25px" }}>
          <h4 style={{ 
            margin: "0 0 15px 0", 
            fontSize: "18px", 
            fontWeight: "600", 
            color: "#2c3e50",
            borderBottom: "1px solid #dee2e6",
            paddingBottom: "5px"
          }}>
            Network Statistics
          </h4>
          <div style={{ fontSize: "14px", color: "#495057" }}>
            <p style={{ margin: "8px 0", display: "flex", justifyContent: "space-between" }}>
              <span>Total {totalNodeLabel}:</span>
              <span style={{ fontWeight: "600" }}>{networkStats.totalAnimals}</span>
            </p>
            <p style={{ margin: "8px 0", display: "flex", justifyContent: "space-between" }}>
              <span>Total {totalItemLabel}:</span>
              <span style={{ fontWeight: "600" }}>{networkStats.totalFables}</span>
            </p>
            <p style={{ margin: "8px 0", display: "flex", justifyContent: "space-between" }}>
              <span>Total Links:</span>
              <span style={{ fontWeight: "600" }}>{networkStats.totalLinks}</span>
            </p>
            <p style={{ margin: "8px 0", display: "flex", justifyContent: "space-between" }}>
              <span>Average Degree:</span>
              <span style={{ fontWeight: "600" }}>{networkStats.averageDegree.toFixed(2)}</span>
            </p>
            <p style={{ margin: "8px 0", display: "flex", justifyContent: "space-between" }}>
              <span>Density:</span>
              <span style={{ fontWeight: "600" }}>{networkStats.density.toFixed(4)}</span>
            </p>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #dee2e6", margin: "20px 0" }} />
        
        {/* Controls */}
        <div style={{ marginBottom: "25px" }}>
          <h4 style={{ 
            margin: "0 0 15px 0", 
            fontSize: "18px", 
            fontWeight: "600", 
            color: "#2c3e50",
            borderBottom: "1px solid #dee2e6",
            paddingBottom: "5px"
          }}>
            Controls
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={intersectionMode}
                onChange={() => setIntersectionMode(!intersectionMode)}
                style={{ marginRight: '10px', transform: 'scale(1.1)' }}
              />
              <span style={{ fontSize: "14px", color: "#495057" }}>Intersection Mode</span>
            </label>
            <p style={{ fontSize: "11px", color: "#6c757d", margin: "0 0 0 20px", fontStyle: "italic" }}>
              Show only persons that appear in ALL selected essays
            </p>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isRotating}
                onChange={() => setIsRotating(!isRotating)}
                style={{ marginRight: '10px', transform: 'scale(1.1)' }}
              />
              <span style={{ fontSize: "14px", color: "#495057" }}>Auto-rotate Network</span>
            </label>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #dee2e6", margin: "20px 0" }} />
        
        {/* Layout Options */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ 
            margin: "0 0 15px 0", 
            fontSize: "18px", 
            fontWeight: "600", 
            color: "#2c3e50",
            borderBottom: "1px solid #dee2e6",
            paddingBottom: "5px"
          }}>
            Layout Options
          </h4>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "14px", color: "#495057", marginRight: "10px" }}>Layout Type:</span>
              <select 
                value={layoutType} 
                onChange={(e) => setLayoutType(e.target.value as 'random' | 'radial' | 'betweenness' | 'community')}
                style={{ 
                  padding: "6px 10px", 
                  borderRadius: "4px", 
                  border: "1px solid #ced4da",
                  fontSize: "13px",
                  backgroundColor: "white",
                  color: "#495057"
                }}
              >
                <option value="random">Random</option>
                <option value="radial">Radial (Degree-based)</option>
                <option value="betweenness">Betweenness Centrality</option>
                <option value="community">Community Detection</option>
              </select>
            </label>
          </div>
          <div style={{ fontSize: "12px", color: "#6c757d", lineHeight: "1.4" }}>
            <p style={{ margin: "8px 0" }}><strong>Random:</strong> Each node is placed randomly in 3D space.</p>
            <p style={{ margin: "8px 0" }}><strong>Radial:</strong> Nodes with more connections are closer to the center.</p>
            <p style={{ margin: "8px 0" }}><strong>Betweenness:</strong> Nodes that act as bridges are placed strategically.</p>
            <p style={{ margin: "8px 0" }}><strong>Community:</strong> Related nodes are clustered together.</p>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 50], fov: 60 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />

        <RotatingGroup isInteracting={!isRotating} key={renderKey}>
          {Object.keys(nodePositions).map((animal) => {
            // Calculate essay node size based on number of persons
            const essayDegree = networkMetrics.nodeDegrees[animal] || 1;
            const maxDegree = Math.max(...Object.values(networkMetrics.nodeDegrees));
            const normalizedDegree = essayDegree / maxDegree;
            const essayRadius = 0.5 + normalizedDegree * 1.5; // Increased range from 0.3-1.0 to 0.5-2.0
            
            // Choose color based on toggle
            const bookNumber = getBookNumber(animal);
            const bookColor = getBookColor(bookNumber);
            const individualColor = animalColors[animal];
            const displayColor = useBookColors ? bookColor : individualColor;
            
            return (
              <mesh
                key={animal}
                position={nodePositions[animal]}
                onPointerOver={() => handleNodeHover(animal, 'essay')}
                onPointerOut={handleNodeLeave}
              >
                <sphereGeometry args={[essayRadius, 32, 32]} />
                <meshStandardMaterial color={displayColor} />
              </mesh>
            );
          })}

          {Object.keys(fablePositions).map((fable) => {
            // Only render person nodes if they are connected to visible essays
            if (!visibleFables.has(fable)) {
              return null;
            }
            
            return (
              <mesh
                key={fable}
                position={fablePositions[fable]}
                onPointerOver={() => handleNodeHover(fable, 'person')}
                onPointerOut={handleNodeLeave}
              >
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color="blue" />
              </mesh>
            );
          })}

          {/* Render only the connections that should be visible */}
          {Object.entries(data)
            .filter(([animal]) => visibleAnimals[animal]) // Only process selected essays
            .flatMap(([animal, fables]) => {
              
              return fables
                .filter((fable) => {
                  // Check if person is visible
                  if (!visibleFables.has(fable)) {
                    return false;
                  }
                  
                  // Check intersection mode
                  if (intersectionMode && intersectingFables && !intersectingFables.includes(fable)) {
                    return false;
                  }
                  
                  return true;
                })
                .map((fable) => {
                  // Choose connection color based on toggle
                  const bookNumber = getBookNumber(animal);
                  const bookColor = getBookColor(bookNumber);
                  const individualColor = animalColors[animal];
                  const displayColor = useBookColors ? bookColor : individualColor;
                  
                  return (
                    <Line
                      key={`${animal}-${fable}-${renderKey}`}
                      points={[nodePositions[animal], fablePositions[fable]]}
                      color={displayColor}
                      lineWidth={1.5}
                    />
                  );
                });
            })}
        </RotatingGroup>
      </Canvas>
    </div>
  );
};

export default Network;