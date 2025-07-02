import React, { useState, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
  // Remove .csv extension if present
  const cleanName = essayName.replace(/\.csv$/, '');
  
  // Look for pattern like "Essay 4 (Book 1)" - extract the book number
  const formattedMatch = cleanName.match(/Essay \d+ \(Book (\d+)\)/);
  if (formattedMatch) {
    const bookNum = parseInt(formattedMatch[1]);
    return bookNum;
  }
  
  // Look for pattern like "essays-01-03-persons-OR" - extract the first number after "essays-"
  const newMatch = cleanName.match(/essays-(\d{2})-/);
  if (newMatch) {
    const bookNum = parseInt(newMatch[1]);
    return bookNum;
  }
  
  // Fallback: try to parse the old format "essays 01_04 persons"
  const oldMatch = cleanName.match(/essays (\d{2})_/);
  if (oldMatch) {
    const bookNum = parseInt(oldMatch[1]);
    return bookNum;
  }
  
  return 0;
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

// Custom Navigation Controls Component
const NavigationControls: React.FC = () => {
  const { camera } = useThree();
  const zoomSpeed = 0.1;

  React.useEffect(() => {
    const handleMove = (event: CustomEvent) => {
      const { direction, speed = 2 } = event.detail;
      const vector = new THREE.Vector3();
      
      switch (direction) {
        case 'forward':
          vector.setFromMatrixColumn(camera.matrix, 0);
          vector.crossVectors(camera.up, vector);
          camera.position.addScaledVector(vector, speed);
          break;
        case 'backward':
          vector.setFromMatrixColumn(camera.matrix, 0);
          vector.crossVectors(camera.up, vector);
          camera.position.addScaledVector(vector, -speed);
          break;
        case 'left':
          vector.setFromMatrixColumn(camera.matrix, 0);
          camera.position.addScaledVector(vector, -speed);
          break;
        case 'right':
          vector.setFromMatrixColumn(camera.matrix, 0);
          camera.position.addScaledVector(vector, speed);
          break;
        case 'up':
          camera.position.y += speed;
          break;
        case 'down':
          camera.position.y -= speed;
          break;
      }
    };

    const handleZoom = (event: CustomEvent) => {
      const { direction } = event.detail;
      const vector = new THREE.Vector3();
      vector.subVectors(camera.position, new THREE.Vector3(0, 0, 0));
      vector.normalize();
      
      if (direction === 'in') {
        camera.position.addScaledVector(vector, -zoomSpeed);
      } else {
        camera.position.addScaledVector(vector, zoomSpeed);
      }
    };

    const handleReset = () => {
      camera.position.set(0, 0, 50);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    };

    const handleRotate = (event: CustomEvent) => {
      const { deltaX, deltaY } = event.detail;
      
      // Rotate around Y axis (horizontal movement)
      const yAxis = new THREE.Vector3(0, 1, 0);
      camera.position.applyAxisAngle(yAxis, deltaX);
      
      // Rotate around X axis (vertical movement)
      const xAxis = new THREE.Vector3(1, 0, 0);
      camera.position.applyAxisAngle(xAxis, deltaY);
      
      // Keep camera looking at center
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('camera-move', handleMove as EventListener);
      canvas.addEventListener('camera-zoom', handleZoom as EventListener);
      canvas.addEventListener('camera-reset', handleReset);
      canvas.addEventListener('camera-rotate', handleRotate as EventListener);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('camera-move', handleMove as EventListener);
        canvas.removeEventListener('camera-zoom', handleZoom as EventListener);
        canvas.removeEventListener('camera-reset', handleReset);
        canvas.removeEventListener('camera-rotate', handleRotate as EventListener);
      }
    };
  }, [camera, zoomSpeed]);

  return null;
};

interface NetworkProps {
  data: Record<string, string[]>;
  metadata?: any;
  showAdditionalMetadata?: boolean;
}

console.debug('[Network] Network component loaded');

const Network: React.FC<NetworkProps> = ({ data, metadata, showAdditionalMetadata = true }) => {
  console.debug('[Network] Network component rendering');
  // These must be first!
  const itemTypeLabel = metadata?.node_types?.person || metadata?.node_types?.item || "Person";
  const itemTypeLabelPlural = metadata?.node_types?.person_plural || metadata?.node_types?.item_plural || (itemTypeLabel.endsWith('s') ? itemTypeLabel : itemTypeLabel + "s");
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
  const [layoutType, setLayoutType] = useState<'random' | 'radial' | 'betweenness' | 'community' | 'importance'>('importance');
  const [isRotating, setIsRotating] = useState(false);
  // Node appearance controls
  const [essayShape, setEssayShape] = useState<'sphere' | 'box' | 'cone'>('box');
  const [personShape, setPersonShape] = useState<'sphere' | 'box' | 'cone'>('sphere');
  const [expandedEssay, setExpandedEssay] = useState<string | null>(null);
  const [lineColor, setLineColor] = useState<string>('#888888');
  const [personBaseColor, setPersonBaseColor] = useState<string>('#3498db'); // default blue
  const [linkColorSource, setLinkColorSource] = useState<'default' | 'person' | 'essay'>('default');
  
  // Navigation control functions
  const moveCamera = (direction: 'forward' | 'backward' | 'left' | 'right' | 'up' | 'down') => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const event = new CustomEvent('camera-move', { detail: { direction, speed: 2 } });
      canvas.dispatchEvent(event);
    }
  };

  const zoomCamera = (direction: 'in' | 'out') => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const event = new CustomEvent('camera-zoom', { detail: { direction } });
      canvas.dispatchEvent(event);
    }
  };

  const resetCamera = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const event = new CustomEvent('camera-reset');
      canvas.dispatchEvent(event);
    }
  };

  // Get the most common variable type from all essay names
  const getMostCommonVariableType = (): string => {
    const variableTypes = Object.keys(data).map(essayName => {
      const formattedName = metadata?.essay_raw_to_formatted?.[essayName] || essayName;
      return getVariableTypeFromEssayName(formattedName);
    });
    
    // Count occurrences
    const counts: Record<string, number> = {};
    variableTypes.forEach(type => {
      counts[type] = (counts[type] || 0) + 1;
    });
    
    // Find the most common type
    const mostCommon = Object.entries(counts).reduce((a, b) => 
      counts[a[0]] > counts[b[0]] ? a : b
    );
    
    return mostCommon[0] || itemTypeLabel.toLowerCase();
  };

  const commonVariableType = getMostCommonVariableType();

  // Use the detected variable type, properly capitalized
  const pluralVariableType = commonVariableType.charAt(0).toUpperCase() + commonVariableType.slice(1);

  // Add keyboard shortcuts with continuous movement
  const [keyStates, setKeyStates] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    let isSpacePressed = false;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return; // Prevent multiple triggers for held keys
      
      const key = event.key.toLowerCase();
      setKeyStates(prev => ({ ...prev, [key]: true }));
      
      // Handle spacebar for rotation mode
      if (event.code === 'Space') {
        isSpacePressed = true;
        event.preventDefault();
      }
      
      // Handle other keys for movement
      switch (event.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          moveCamera('forward');
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          moveCamera('backward');
          break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
          moveCamera('left');
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          moveCamera('right');
          break;
        case 'q':
        case 'Q':
          moveCamera('up');
          break;
        case 'e':
        case 'E':
          moveCamera('down');
          break;
        case 'r':
        case 'R':
          resetCamera();
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      setKeyStates(prev => ({ ...prev, [key]: false }));
      
      if (event.code === 'Space') {
        isSpacePressed = false;
        isDragging = false;
      }
    };

          // Trackpad zoom and movement functionality
      const handleWheel = (event: WheelEvent) => {
        // Check if the mouse is over any menu panel
        const target = event.target as HTMLElement;
        const isOverMenu = target.closest('.network-controls') || 
                          target.closest('.landing-page') ||
                          target.closest('[style*="position: absolute"]') ||
                          (target.closest('[style*="overflow"]') && !target.closest('canvas'));
        
        if (isOverMenu) {
          // Allow normal scrolling when over menu
          return;
        }
        
        // Prevent default behavior
        event.preventDefault();
        
        // If Ctrl/Cmd is pressed, handle movement
        if (event.ctrlKey || event.metaKey) {
          const deltaX = event.deltaX;
          const deltaY = event.deltaY;
          
          // Handle horizontal movement
          if (Math.abs(deltaX) > 0) {
            if (deltaX > 0) {
              moveCamera('right');
            } else {
              moveCamera('left');
            }
          }
          
          // Handle vertical movement
          if (Math.abs(deltaY) > 0) {
            if (deltaY > 0) {
              moveCamera('backward');
            } else {
              moveCamera('forward');
            }
          }
        } else {
          // Normal scroll - zoom
          const delta = event.deltaY;
          const zoomDirection = delta > 0 ? 'out' : 'in';
          zoomCamera(zoomDirection);
        }
      };

    // Trackpad rotation with spacebar
    const handleMouseDown = (event: MouseEvent) => {
      if (isSpacePressed) {
        isDragging = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        event.preventDefault();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging && isSpacePressed) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;
        
        // Rotate camera based on mouse movement
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const rotateEvent = new CustomEvent('camera-rotate', { 
            detail: { deltaX: deltaX * 0.01, deltaY: deltaY * 0.01 } 
          });
          canvas.dispatchEvent(rotateEvent);
        }
        
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        event.preventDefault();
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      // Cleanup function - remove all event listeners
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Reset key states
      setKeyStates({});
      
      // Clear any hover state
      setHoveredNodeDetails(null);
    };
  }, []);

  // Continuous movement effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      const activeKeys = Object.keys(keyStates).filter(key => keyStates[key]);
      
      activeKeys.forEach(key => {
        switch (key) {
          case 'w':
          case 'arrowup':
            moveCamera('forward');
            break;
          case 's':
          case 'arrowdown':
            moveCamera('backward');
            break;
          case 'a':
          case 'arrowleft':
            moveCamera('left');
            break;
          case 'd':
          case 'arrowright':
            moveCamera('right');
            break;
          case 'q':
            moveCamera('up');
            break;
          case 'e':
            moveCamera('down');
            break;
        }
      });
    }, 50); // Update every 50ms for smooth movement

    return () => {
      clearInterval(interval);
    };
  }, [keyStates, moveCamera]);

  // Use metadata for proper labels, fallback to defaults
  const totalNodeLabel = metadata?.node_types?.essay || "Essays";

  // Cleanup effect when component unmounts
  React.useEffect(() => {
    return () => {
      // Clear any remaining intervals or timeouts
      const intervals = window.setInterval(() => {}, 999999);
      for (let i = 1; i < intervals; i++) {
        window.clearInterval(i);
      }
    };
  }, []);

  // Calculate frequency for each person node (how many essays they appear in)
  const personFrequencies = useMemo(() => {
    const freq: Record<string, number> = {};
    Object.values(data).forEach(persons => {
      persons.forEach(person => {
        freq[person] = (freq[person] || 0) + 1;
      });
    });
    return freq;
  }, [data]);

  // Find max frequency for normalization
  const maxPersonFrequency = useMemo(() => {
    const values = Object.values(personFrequencies);
    return values.length > 0 ? Math.max(...values) : 1;
  }, [personFrequencies]);

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

  // Calculate absolute frequency for each person node (total mentions across all essays)
  const personAbsoluteFrequencies = useMemo(() => {
    const freq: Record<string, number> = {};
    if (metadata?.person_counts_by_essay) {
      Object.values(metadata.person_counts_by_essay).forEach((counts) => {
        const c = counts as Record<string, number>;
        Object.entries(c).forEach(([person, count]) => {
          freq[person] = (freq[person] || 0) + count;
        });
      });
    }
    return freq;
  }, [metadata]);

  // Helper to compute percentiles
  function getPercentile(arr: number[], p: number) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.floor(p * (sorted.length - 1));
    return sorted[idx];
  }

  const getPositionByLayout = (node: string, layoutType: string) => {
    switch (layoutType) {
      case 'radial':
        return getRadialPosition(node);
      case 'betweenness':
        return getBetweennessPosition(node);
      case 'community':
        return getCommunityPosition(node);
      case 'importance':
        return getImportancePosition(node);
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

  // Layout based on person importance (frequency)
  const getImportancePosition = (node: string): [number, number, number] => {
    // If person node, use frequency; if essay, use average frequency of its persons
    let importance = 0;
    if (personFrequencies[node] !== undefined) {
      importance = personFrequencies[node] / maxPersonFrequency;
    } else if (data[node]) {
      // Essay node: average frequency of its persons
      const persons = data[node];
      if (persons.length > 0) {
        importance = persons.reduce((sum, p) => sum + (personFrequencies[p] || 0), 0) / (persons.length * maxPersonFrequency);
      }
    }
    // High importance = closer to center, low = further out
    const minRadius = 10;
    const maxRadius = 60;
    const radius = maxRadius - importance * (maxRadius - minRadius);
    const angle = Math.random() * 2 * Math.PI;
    const height = (Math.random() - 0.5) * 30;
    return [
      radius * Math.cos(angle),
      height,
      radius * Math.sin(angle)
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
    const visibleHash = Object.keys(visibleAnimals)
      .filter(key => visibleAnimals[key])
      .sort()
      .join('-');
    return `${selectedCount}-${intersectionActive}-${layoutType}-${visibleHash}`;
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
    console.log(`🎯 handleNodeHover called with nodeName: "${nodeName}", nodeType: "${nodeType}"`);
    console.log(`📊 Available essay names:`, Object.keys(data));
    if (nodeType === 'essay') {
      const bookNumber = getBookNumber(nodeName);
      const personCount = data[nodeName]?.length || 0;
      setHoveredNodeDetails({
        name: nodeName,
        type: totalNodeLabel.endsWith('s') ? totalNodeLabel.slice(0, -1) : totalNodeLabel,
        book: `Book ${bookNumber}`,
        itemCount: personCount,
        items: data[nodeName] || []
      });
    } else {
      // Find which essays mention this variable
      const connectedEssays = Object.entries(data)
        .filter(([, persons]) => persons.includes(nodeName))
        .map(([essay]) => essay);
      // Get mention counts from metadata
      const mentionCounts = (metadata?.person_counts_by_essay || {});
      const essaysWithCounts = connectedEssays
        .map(essay => ({
          essay,
          count: mentionCounts[essay]?.[nodeName] || 1
        }))
        .filter(e => e.count > 1);
      // Use the first essay this variable appears in to get the type
      const firstEssay = connectedEssays[0] || '';
      setHoveredNodeDetails({
        name: nodeName,
        type: getVariableTypeFromEssayName(firstEssay),
        mentionedIn: connectedEssays.length,
        essays: connectedEssays,
        essaysWithCounts,
      });
    }
  };

  const handleNodeLeave = () => {
    setHoveredNodeDetails(null);
  };

  // Helper functions for color conversion
  function hexToHsl(hex: string) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }
  function hslToHex(h: number, s: number, l: number) {
    s /= 100; l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Restore getVariableTypeFromEssayName function:
  const getVariableTypeFromEssayName = (essayName: string): string => {
    // Extract variable type from essay name like "Essay 1 (Book 1) - Events"
    const match = essayName.match(/Essay \d+ \(Book \d+\) - ([^-]+)/);
    if (match) {
      return match[1].toLowerCase();
    }
    // Use the variable type from metadata
    return itemTypeLabel.toLowerCase();
  };

  console.debug('[Network] Network component rendering completed');
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
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
          {hoveredNodeDetails.type === (totalNodeLabel.endsWith('s') ? totalNodeLabel.slice(0, -1) : totalNodeLabel) && (
            <>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#bdc3c7' }}>
                Book: {hoveredNodeDetails.book}
              </p>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#bdc3c7' }}>
                {pluralVariableType.charAt(0).toUpperCase() + pluralVariableType.slice(1)}: {hoveredNodeDetails.itemCount}
              </p>
              {hoveredNodeDetails.items && hoveredNodeDetails.items.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#bdc3c7' }}>
                    {pluralVariableType.charAt(0).toUpperCase() + pluralVariableType.slice(1)}:
                  </p>
                  <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '11px' }}>
                    {hoveredNodeDetails.items.slice(0, 10).map((item: string, index: number) => (
                      <div key={index} style={{ margin: '2px 0' }}>• {item}</div>
                    ))}
                    {hoveredNodeDetails.items.length > 10 && (
                      <div style={{ color: '#95a5a6', fontStyle: 'italic' }}>
                        ... and {hoveredNodeDetails.items.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          {hoveredNodeDetails.type !== (totalNodeLabel.endsWith('s') ? totalNodeLabel.slice(0, -1) : totalNodeLabel) && (
            <>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#bdc3c7' }}>
                Mentioned in: {hoveredNodeDetails.mentionedIn} {totalNodeLabel.toLowerCase()}
              </p>
              {hoveredNodeDetails.essays && hoveredNodeDetails.essays.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#bdc3c7' }}>
                    {totalNodeLabel}:
                  </p>
                  <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '11px' }}>
                    {hoveredNodeDetails.essays.slice(0, 5).map((essay: string, index: number) => (
                      <div key={index} style={{ margin: '2px 0' }}>• {essay}</div>
                    ))}
                    {hoveredNodeDetails.essays.length > 5 && (
                      <div style={{ color: '#95a5a6', fontStyle: 'italic' }}>
                        ... and {hoveredNodeDetails.essays.length - 5} more
                      </div>
                    )}
                  </div>
                  {/* Show essays with multiple mentions */}
                  {hoveredNodeDetails.essaysWithCounts && hoveredNodeDetails.essaysWithCounts.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <p style={{ margin: '5px 0', fontSize: '12px', color: '#e67e22', fontWeight: 600 }}>
                        Multiple Mentions:
                      </p>
                      <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '11px' }}>
                        {hoveredNodeDetails.essaysWithCounts.map((e: any, idx: number) => (
                          <div key={idx} style={{ margin: '2px 0' }}>• {e.essay} (<b>{e.count} times</b>)</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div
        className="network-controls"
        style={{
          width: "280px",
          padding: "20px",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          overflowY: "auto",
          borderRight: "1px solid #dee2e6",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          marginLeft: "0",
          flexShrink: 0,
          position: "relative",
          left: "0"
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
              const formattedEssayName = metadata?.essay_raw_to_formatted?.[animal] || animal;
              const bookNumber = getBookNumber(animal);
              const bookColor = getBookColor(bookNumber);
              const individualColor = animalColors[animal];
              const displayColor = useBookColors ? bookColor : individualColor;
              // Get persons/places for this essay, ranked by frequency
              const persons = data[animal] || [];
              const counts = (metadata?.person_counts_by_essay?.[animal] || {});
              const rankedPersons = [...persons]
                .sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
              return (
                <div key={animal} style={{ 
                  marginBottom: "8px",
                  padding: "8px",
                  borderRadius: "6px",
                  background: visibleAnimals[animal] ? "rgba(52, 152, 219, 0.1)" : "rgba(108, 117, 125, 0.1)",
                  border: visibleAnimals[animal] ? "1px solid rgba(52, 152, 219, 0.3)" : "1px solid rgba(108, 117, 125, 0.2)"
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
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
                      fontWeight: visibleAnimals[animal] ? "500" : "400",
                      flex: 1
                    }}>
                      {formattedEssayName} ({networkStats.nodeDegrees[animal]} {getVariableTypeFromEssayName(formattedEssayName)})
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
                    <button
                      onClick={() => setExpandedEssay(expandedEssay === animal ? null : animal)}
                      style={{
                        marginLeft: '10px',
                        background: expandedEssay === animal ? '#3498db' : '#e9ecef',
                        color: expandedEssay === animal ? 'white' : '#2c3e50',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 10px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'background 0.2s',
                        boxShadow: expandedEssay === animal ? '0 2px 8px rgba(52,152,219,0.15)' : 'none'
                      }}
                    >
                      {expandedEssay === animal ? 'Hide' : 'Show'}
                    </button>
                  </label>
                  {expandedEssay === animal && (
                    <div style={{
                      marginTop: '10px',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      padding: '10px',
                      boxShadow: '0 2px 8px rgba(52,152,219,0.07)',
                      fontSize: '12px',
                      color: '#2c3e50',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      border: '1px solid #dee2e6'
                    }}>
                      <strong style={{ color: '#3498db', fontSize: '13px' }}>{itemTypeLabelPlural} (ranked):</strong>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {rankedPersons.map((p, idx) => (
                          <li key={p + idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0', borderBottom: '1px solid #e9ecef' }}>
                            <span>{p}</span>
                            <span style={{ color: '#e67e22', fontWeight: 600 }}>{counts[p] > 1 ? `${counts[p]}×` : ''}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Variable Section: Ranked by unique essay appearance (now directly under Essays) */}
        <div style={{ marginBottom: "25px" }}>
          <h4 style={{
            margin: "0 0 15px 0",
            fontSize: "18px",
            fontWeight: "600",
            color: "#2c3e50",
            borderBottom: "1px solid #dee2e6",
            paddingBottom: "5px"
          }}>
            {pluralVariableType.charAt(0).toUpperCase() + pluralVariableType.slice(1)} (Ranked by Unique Essay)
          </h4>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {(() => {
              // State for expanded entities
              const [expandedEntity, setExpandedEntity] = React.useState<string | null>(null);
              // Get all entities and their unique essay count
              const entities = Object.keys(personFrequencies);
              const ranked = entities.sort((a, b) => (personFrequencies[b] || 0) - (personFrequencies[a] || 0));
              return ranked.map((entity, idx) => {
                // Find essays this entity appears in with counts
                const essaysWithCounts = Object.entries(data)
                  .filter(([, arr]) => arr.includes(entity))
                  .map(([essay]) => {
                    const counts = metadata?.person_counts_by_essay?.[essay] || {};
                    const formattedEssayName = metadata?.essay_raw_to_formatted?.[essay] || essay;
                    return { essay: formattedEssayName, count: counts[entity] || 1 };
                  })
                  .sort((a, b) => b.count - a.count); // Sort by count descending
                const isExpanded = expandedEntity === entity;
                return (
                  <div key={entity + idx} style={{
                    marginBottom: '6px',
                    padding: '7px',
                    borderRadius: '5px',
                    background: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    fontSize: '13px',
                    color: '#2c3e50',
                    boxShadow: '0 1px 4px rgba(52,152,219,0.04)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{entity}</span>
                      <span style={{ color: '#e67e22', fontWeight: 600 }}>{personFrequencies[entity]}×</span>
                      <button
                        onClick={() => setExpandedEntity(isExpanded ? null : entity)}
                        style={{
                          marginLeft: '10px',
                          background: isExpanded ? '#3498db' : '#e9ecef',
                          color: isExpanded ? 'white' : '#2c3e50',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 10px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          transition: 'background 0.2s',
                          boxShadow: isExpanded ? '0 2px 8px rgba(52,152,219,0.15)' : 'none'
                        }}
                      >
                        {isExpanded ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                      <span>In: </span>
                      {isExpanded
                        ? essaysWithCounts.map((item, i) => (
                            <span key={item.essay} style={{ marginRight: 4 }}>
                              {item.essay} ({item.count}×){i < essaysWithCounts.length - 1 ? ',' : ''}
                            </span>
                          ))
                        : essaysWithCounts.slice(0, 3).map((item, i) => (
                            <span key={item.essay} style={{ marginRight: 4 }}>
                              {item.essay} ({item.count}×){i < essaysWithCounts.length - 1 && i < 2 ? ',' : ''}
                            </span>
                          ))}
                      {!isExpanded && essaysWithCounts.length > 3 && (
                        <span style={{ color: '#aaa' }}>+{essaysWithCounts.length - 3} more</span>
                      )}
                    </div>
                    {/* Additional metadata display when expanded */}
                    {isExpanded && showAdditionalMetadata && metadata?.person_metadata?.[entity] && (
                      <div style={{ 
                        marginTop: '8px', 
                        padding: '6px', 
                        background: '#e8f4fd', 
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#2c3e50'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px', color: '#3498db' }}>
                          Additional Information:
                        </div>
                        {Object.entries(metadata.person_metadata[entity]).map(([key, value]) => (
                          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontWeight: 500, color: '#7f8c8d' }}>
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </span>
                            <span style={{ color: '#2c3e50' }}>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Debug info when expanded */}
                    {isExpanded && (
                      <div style={{ 
                        marginTop: '4px', 
                        padding: '4px', 
                        background: '#fff3cd', 
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: '#856404'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                          Debug Info:
                        </div>
                        <div>Entity: {entity}</div>
                        <div>Has metadata: {metadata?.person_metadata?.[entity] ? 'Yes' : 'No'}</div>
                        <div>Show metadata: {showAdditionalMetadata ? 'Yes' : 'No'}</div>
                        <div>Available columns: {metadata?.available_metadata_columns?.join(', ') || 'None'}</div>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
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
                              <span>Total {pluralVariableType.charAt(0).toUpperCase() + pluralVariableType.slice(1)}:</span>
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
        
        {/* Aesthetic Controls */}
        <div style={{ marginBottom: "25px" }}>
          <h4 style={{ margin: "0 0 15px 0", fontSize: "18px", fontWeight: "600", color: "#2c3e50", borderBottom: "1px solid #dee2e6", paddingBottom: "5px" }}>
            Aesthetic Controls
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={useBookColors}
                onChange={() => setUseBookColors(!useBookColors)}
                style={{ marginRight: '10px', transform: 'scale(1.2)' }}
              />
              Color by Book
            </label>
            <label>Essay Shape:
              <select value={essayShape} onChange={e => setEssayShape(e.target.value as any)} style={{ marginLeft: 8 }}>
                <option value="sphere">Sphere</option>
                <option value="box">Box</option>
                <option value="cone">Cone</option>
              </select>
            </label>
            <label>{commonVariableType.charAt(0).toUpperCase() + commonVariableType.slice(1)} Shape:
              <select value={personShape} onChange={e => setPersonShape(e.target.value as any)} style={{ marginLeft: 8 }}>
                <option value="sphere">Sphere</option>
                <option value="box">Box</option>
                <option value="cone">Cone</option>
              </select>
            </label>
            <label>Line Color:
              <input type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} style={{ marginLeft: 8 }} />
            </label>
            <label>Link Color Source:
              <select value={linkColorSource} onChange={e => setLinkColorSource(e.target.value as any)} style={{ marginLeft: 8 }}>
                <option value="default">Default</option>
                <option value="person">{commonVariableType.charAt(0).toUpperCase() + commonVariableType.slice(1)} Node</option>
                <option value="essay">Essay Node</option>
              </select>
            </label>
            <label>{itemTypeLabel} Base Color:
              <input type="color" value={personBaseColor} onChange={e => setPersonBaseColor(e.target.value)} style={{ marginLeft: 8 }} />
            </label>
          </div>
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ margin: "0 0 15px 0", fontSize: "18px", fontWeight: "600", color: "#2c3e50", borderBottom: "1px solid #dee2e6", paddingBottom: "5px" }}>
              Layout Options
            </h4>
            <label style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "14px", color: "#495057", marginRight: "10px" }}>Layout Type:</span>
              <select 
                value={layoutType} 
                onChange={(e) => setLayoutType(e.target.value as 'random' | 'radial' | 'betweenness' | 'community' | 'importance')}
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
                <option value="importance">Dynamic (by variable frequency)</option>
              </select>
            </label>
            <div style={{ fontSize: "12px", color: "#6c757d", lineHeight: "1.4" }}>
              <p style={{ margin: "8px 0" }}><strong>Random:</strong> Each node is placed randomly in 3D space.</p>
              <p style={{ margin: "8px 0" }}><strong>Radial:</strong> Nodes with more connections are closer to the center.</p>
              <p style={{ margin: "8px 0" }}><strong>Betweenness:</strong> Nodes that act as bridges are placed strategically.</p>
              <p style={{ margin: "8px 0" }}><strong>Community:</strong> Related nodes are clustered together.</p>
              <p style={{ margin: "8px 0" }}><strong>Dynamic:</strong> High-frequency persons are larger and closer to the center.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trackpad Controls Indicator */}
      <div className="network-controls" style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        padding: '10px 12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        fontSize: '11px',
        color: '#2c3e50',
        fontFamily: 'monospace',
        maxWidth: '200px',
        width: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>🖱️ Trackpad:</div>
        <div>Scroll: Zoom in/out</div>
        <div>Space + drag: Rotate</div>
      </div>

      <Canvas camera={{ position: [0, 0, 50], fov: 60 }} style={{ flex: 1, minWidth: 0 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        <NavigationControls />

        <RotatingGroup isInteracting={!isRotating} key={renderKey}>
          {Object.keys(nodePositions).map((animal, index) => {
            // Calculate essay node size based on number of persons
            const essayDegree = networkMetrics.nodeDegrees[animal] || 1;
            const maxDegree = Math.max(...Object.values(networkMetrics.nodeDegrees));
            const normalizedDegree = essayDegree / maxDegree;
            const essayRadius = 0.5 + normalizedDegree * 1.5; // Increased range from 0.3-1.0 to 0.5-2.0
            
            // Choose color based on toggle
            const bookNumber = getBookNumber(animal);
            const bookColorVal = getBookColor(bookNumber);
            const individualColor = animalColors[animal];
            const displayColor = useBookColors ? bookColorVal : individualColor;
            
            // Choose shape
            let geometry = <sphereGeometry args={[essayRadius, 32, 32]} />;
            if (essayShape === 'box') geometry = <boxGeometry args={[essayRadius, essayRadius, essayRadius]} />;
            if (essayShape === 'cone') geometry = <coneGeometry args={[essayRadius, essayRadius * 2, 32]} />;
            
            return (
              <mesh
                key={`essay-${animal}-${index}`}
                position={nodePositions[animal]}
                onPointerOver={() => handleNodeHover(animal, 'essay')}
                onPointerOut={handleNodeLeave}
              >
                {geometry}
                <meshStandardMaterial color={displayColor} />
              </mesh>
            );
          })}

          {Object.keys(fablePositions).map((fable, index) => {
            // Only render person nodes if they are connected to visible essays
            if (!visibleFables.has(fable)) {
              return null;
            }
            // Color: absolute frequency (total mentions)
            const absFreq = personAbsoluteFrequencies[fable] || 1;
            const maxAbsFreq = Math.max(...Object.values(personAbsoluteFrequencies), 1);
            const absFreqNorm = absFreq / maxAbsFreq;
            // Color intensity: higher = deeper
            const [h, s] = hexToHsl(personBaseColor);
            const nodeLightness = 90 - 55 * absFreqNorm;
            const nodeColor = hslToHex(h, s, nodeLightness);
            // Size: number of unique essays (single appearance per essay)
            const uniqueEssayCount = personFrequencies[fable] || 1;
            // Nonlinear scaling for size
            const allUniqueCounts = Object.values(personFrequencies);
            const median = getPercentile(allUniqueCounts, 0.5);
            const p90 = getPercentile(allUniqueCounts, 0.9);
            let personRadius = 0.3;
            if (uniqueEssayCount <= median) {
              personRadius = 0.3 + 0.4 * (uniqueEssayCount / (median || 1));
            } else if (uniqueEssayCount <= p90) {
              personRadius = 0.7 + 0.5 * ((uniqueEssayCount - median) / ((p90 - median) || 1));
            } else {
              // Very high entities
              const maxUnique = Math.max(...allUniqueCounts, 1);
              personRadius = 1.2 + 0.3 * ((uniqueEssayCount - p90) / ((maxUnique - p90) || 1));
            }
            // Choose shape
            let geometry = <sphereGeometry args={[personRadius, 32, 32]} />;
            if (personShape === 'box') geometry = <boxGeometry args={[personRadius, personRadius, personRadius]} />;
            if (personShape === 'cone') geometry = <coneGeometry args={[personRadius, personRadius * 2, 32]} />;
            return (
              <mesh
                key={`person-${fable}-${index}`}
                position={fablePositions[fable]}
                onPointerOver={() => handleNodeHover(fable, 'person')}
                onPointerOut={handleNodeLeave}
              >
                {geometry}
                <meshStandardMaterial color={nodeColor} />
              </mesh>
            );
          })}

          {/* Render only the connections that should be visible */}
          {Object.entries(data)
            .filter(([animal]) => visibleAnimals[animal]) // Only process selected essays
            .flatMap(([animal, fables], animalIndex) => {
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
                .map((fable, fableIndex) => {
                  let displayColor = lineColor;
                  if (linkColorSource === 'essay') {
                    const bookNumber = getBookNumber(animal);
                    const bookColor = getBookColor(bookNumber);
                    displayColor = useBookColors ? bookColor : animalColors[animal];
                  } else if (linkColorSource === 'person') {
                    // Use the same color logic as person node
                    const freq = personFrequencies[fable] || 1;
                    const normalizedFreq = freq / maxPersonFrequency;
                    const [h, s] = hexToHsl(personBaseColor);
                    const nodeLightness = 90 - 55 * normalizedFreq;
                    displayColor = hslToHex(h, s, nodeLightness);
                  }
                  return (
                    <Line
                      key={`line-${animal}-${fable}-${animalIndex}-${fableIndex}`}
                      points={[nodePositions[animal], fablePositions[fable]]}
                      color={displayColor}
                      lineWidth={1.5}
                      derivatives={false}
                      format={undefined}
                    />
                  );
                });
            })}
        </RotatingGroup>
      </Canvas>
    </div>
  );
};

console.debug('[Network] Network component export');
export default Network;