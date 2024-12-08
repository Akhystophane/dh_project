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
  Math.random() * 20 - 10,
  Math.random() * 20 - 10,
  Math.random() * 20 - 10,
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
}

const Network: React.FC<NetworkProps> = ({ data }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [visibleAnimals, setVisibleAnimals] = useState<Record<string, boolean>>(
    () =>
      Object.keys(data).reduce((acc, animal) => {
        acc[animal] = true;
        return acc;
      }, {} as Record<string, boolean>)
  );
  const [intersectionMode, setIntersectionMode] = useState(false);

  const { nodePositions, fablePositions, animalColors } = useMemo(() => {
    const nodePositions: Record<string, [number, number, number]> = {};
    const fablePositions: Record<string, [number, number, number]> = {};
    const animalColors: Record<string, string> = {};

    Object.keys(data).forEach((animal, index) => {
      nodePositions[animal] = getRandomPosition();
      animalColors[animal] = getDistinctColor(index);
    });

    const allFables = Array.from(new Set(Object.values(data).flat()));
    allFables.forEach((fable) => {
      fablePositions[fable] = getRandomPosition();
    });

    return { nodePositions, fablePositions, animalColors };
  }, [data]);

  const toggleAnimalVisibility = (animal: string) => {
    setVisibleAnimals((prev) => ({
      ...prev,
      [animal]: !prev[animal],
    }));
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

    // Compute the intersection of all fable lists
    const intersection = fablesLists.reduce((commonFables, currentFables) => {
      return commonFables.filter((fable) => currentFables.includes(fable));
    }, fablesLists[0] || []);

    return intersection;
  }, [visibleAnimals, intersectionMode, data]);

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
              {animal} ({networkStats.nodeDegrees[animal]} fables)
            </label>
          </div>
        ))}
        <hr />
        <h4>Network Statistics</h4>
        <p>Total Animals: {networkStats.totalAnimals}</p>
        <p>Total Fables: {networkStats.totalFables}</p>
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
      </div>

      <Canvas camera={{ position: [0, 0, 50], fov: 60 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />

        <RotatingGroup isInteracting={false}>
          {Object.keys(nodePositions).map((animal) => (
            <mesh
              key={animal}
              position={nodePositions[animal]}
              onPointerOver={() => setHoveredNode(animal)}
              onPointerOut={() => setHoveredNode(null)}
            >
              <sphereGeometry args={[0.5, 32, 32]} />
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
                    {animal}
                  </div>
                </Html>
              )}
            </mesh>
          ))}

          {Object.keys(fablePositions).map((fable) => (
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
          ))}

          {Object.entries(data).map(([animal, fables]) =>
            visibleAnimals[animal]
              ? fables.map((fable) => {
                  if (
                    intersectionMode &&
                    intersectingFables &&
                    !intersectingFables.includes(fable)
                  ) {
                    return null;
                  }
                  return (
                    <Line
                      key={`${animal}-${fable}`}
                      points={[nodePositions[animal], fablePositions[fable]]}
                      color={animalColors[animal]}
                      lineWidth={1.5}
                    />
                  );
                })
              : null
          )}
        </RotatingGroup>
      </Canvas>
    </div>
  );
};

export default Network;