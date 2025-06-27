import React, { useState, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";

const distinctColors = [
  "#FF0000", "#00FF00", "#FFC0CB", "#FFFF00", "#FF00FF",
  "#00FFFF", "#FFA500", "#800080", "#808000", "#008080",
  "#000000", "#808080", "#C71585", "#4682B4", "#A52A2A",
];

const getDistinctColor = (index: number): string => distinctColors[index % distinctColors.length];
const getRandomPosition = (): [number, number, number] => [
  Math.random() * 60 - 30,
  Math.random() * 60 - 30,
  Math.random() * 60 - 30,
];

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
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [visibleAnimals, setVisibleAnimals] = useState<Record<string, boolean>>(
    () =>
      Object.keys(data).reduce((acc, animal) => {
        acc[animal] = true;
        return acc;
      }, {} as Record<string, boolean>)
  );
  const [intersectionMode, setIntersectionMode] = useState(false);
  const [layoutType, setLayoutType] = useState<'random' | 'radial' | 'betweenness' | 'community'>('random');
  const [isRotating, setIsRotating] = useState(true);

  // Use metadata for proper labels, fallback to defaults
  const itemTypeLabel = metadata?.node_types?.person || "Person";
  const totalNodeLabel = metadata?.statistics?.essays ? "Essays" : "Animals";
  const totalItemLabel = metadata?.statistics?.persons ? "Persons" : "Fables";

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

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <div
        style={{
          width: "250px",
          padding: "10px",
          background: "#f0f0f0",
          overflowY: "auto",
          borderRight: "1px solid #ddd",
        }}
      >
        <h3>Menu</h3>
        {Object.keys(data).map((animal) => (
          <div key={animal} style={{ marginBottom: "5px" }}>
            <label>
              <input
                type="checkbox"
                checked={visibleAnimals[animal]}
                onChange={() => toggleAnimalVisibility(animal)}
              />
              {animal} ({networkStats.nodeDegrees[animal]} {itemTypeLabel.toLowerCase()}s)
            </label>
          </div>
        ))}
        <hr />
        <h4>Network Statistics</h4>
        <p>Total {totalNodeLabel}: {networkStats.totalAnimals}</p>
        <p>Total {totalItemLabel}: {networkStats.totalFables}</p>
        <p>Total Links: {networkStats.totalLinks}</p>
        <p>Average Degree: {networkStats.averageDegree.toFixed(2)}</p>
        <p>Density: {networkStats.density.toFixed(4)}</p>
        <hr />
        <label>
          <input
            type="checkbox"
            checked={intersectionMode}
            onChange={() => setIntersectionMode(!intersectionMode)}
          />
          Intersection
        </label>
        <hr />
        <label>
          <input
            type="checkbox"
            checked={isRotating}
            onChange={() => setIsRotating(!isRotating)}
          />
          Auto-rotate Network
        </label>
        <hr />
        <h4>Layout Options</h4>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Layout Type:
            <select 
              value={layoutType} 
              onChange={(e) => setLayoutType(e.target.value as 'random' | 'radial' | 'betweenness' | 'community')}
              style={{ marginLeft: "10px", padding: "2px" }}
            >
              <option value="random">Random</option>
              <option value="radial">Radial (Degree-based)</option>
              <option value="betweenness">Betweenness Centrality</option>
              <option value="community">Community Detection</option>
            </select>
          </label>
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          <p><strong>Random:</strong> Each node is placed randomly in 3D space. No relationship is captured; use for playful exploration or as a baseline.</p>
          <p><strong>Radial (Degree-based):</strong> Nodes with more connections (essays with many persons, or persons mentioned in many essays) are closer to the center. Highlights hubs and popular nodes.</p>
          <p><strong>Betweenness Centrality:</strong> Nodes that act as bridges between groups (high betweenness) are placed at strategic points. Shows which essays or persons connect different parts of the network.</p>
          <p><strong>Community Detection:</strong> Essays and persons that are closely related (densely connected) are clustered together. Each cluster represents a community of essays and persons with strong mutual connections.</p>
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
            
            return (
              <mesh
                key={animal}
                position={nodePositions[animal]}
                onPointerOver={() => setHoveredNode(animal)}
                onPointerOut={() => setHoveredNode(null)}
              >
                <sphereGeometry args={[essayRadius, 32, 32]} />
                <meshStandardMaterial color={animalColors[animal]} />
                {hoveredNode === animal && (
                  <Html distanceFactor={10}>
                    <div
                      style={{
                        background: "white",
                        padding: "2px 4px",
                        borderRadius: "4px",
                      }}
                    >
                      {animal} ({essayDegree} persons)
                    </div>
                  </Html>
                )}
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
                onPointerOver={() => setHoveredNode(fable)}
                onPointerOut={() => setHoveredNode(null)}
              >
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color="blue" />
                {hoveredNode === fable && (
                  <Html distanceFactor={10}>
                    <div
                      style={{
                        background: "white",
                        padding: "2px 4px",
                        borderRadius: "4px",
                      }}
                    >
                      {fable}
                    </div>
                  </Html>
                )}
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
                .map((fable) => (
                  <Line
                    key={`${animal}-${fable}-${renderKey}`}
                    points={[nodePositions[animal], fablePositions[fable]]}
                    color={animalColors[animal]}
                    lineWidth={1.5}
                  />
                ));
            })}
        </RotatingGroup>
      </Canvas>
    </div>
  );
};

export default Network;