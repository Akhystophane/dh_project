import React, { useState, useRef } from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onDataProcessed: (data: any) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onDataProcessed }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    console.log('🔍 handleFileSelect called with:', selectedFiles);
    
    if (!selectedFiles) {
      console.log('❌ No files selected');
      return;
    }
    
    console.log(`📁 Total files received: ${selectedFiles.length}`);
    
    // Log all file names for debugging
    Array.from(selectedFiles).forEach((file, index) => {
      console.log(`📄 File ${index + 1}: ${file.name} (${file.size} bytes)`);
    });
    
    const csvFiles = Array.from(selectedFiles).filter(file => 
      file.name.toLowerCase().endsWith('.csv')
    );
    
    console.log(`✅ CSV files found: ${csvFiles.length}`);
    csvFiles.forEach((file, index) => {
      console.log(`📊 CSV File ${index + 1}: ${file.name}`);
    });
    
    if (csvFiles.length === 0) {
      console.log('❌ No CSV files found in selection');
      alert('No CSV files found. Please select CSV files only.');
      return;
    }
    
    console.log(`➕ Adding ${csvFiles.length} CSV files to existing ${files.length} files`);
    setFiles(prev => {
      const newFiles = [...prev, ...csvFiles];
      console.log(`📋 Total files after addition: ${newFiles.length}`);
      return newFiles;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    console.log('🔄 Drag over event');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    console.log('📥 Drop event triggered');
    const droppedFiles = e.dataTransfer.files;
    console.log(`📦 Dropped ${droppedFiles.length} files`);
    handleFileSelect(droppedFiles);
  };

  const processFiles = async () => {
    console.log('🚀 Starting file processing...');
    console.log(`📊 Total files to process: ${files.length}`);
    
    if (files.length === 0) {
      console.log('❌ No files to process');
      alert('Please select files first.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStatus('Initializing...');

    try {
      // Log all files being processed
      console.log('📋 Files being processed:');
      files.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name} (${file.size} bytes)`);
      });

      // Simulate processing steps
      const steps = [
        'Reading CSV files...',
        'Extracting person names...',
        'Building network structure...',
        'Preparing visualization data...'
      ];

      for (let i = 0; i < steps.length; i++) {
        console.log(`🔄 Processing step ${i + 1}: ${steps[i]}`);
        setStatus(steps[i]);
        setProgress(((i + 1) / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Create sample network data
      console.log('🏗️ Creating network data...');
      const networkData = await createNetworkData();
      
      console.log('✅ Network data created successfully');
      console.log('📊 Final data summary:', {
        nodes: networkData.nodes.length,
        edges: networkData.edges.length,
        files_processed: networkData.metadata.files_processed
      });
      
      setStatus('Processing complete!');
      setTimeout(() => {
        console.log('🎯 Calling onDataProcessed with network data');
        onDataProcessed(networkData);
      }, 1000);

    } catch (error) {
      console.error('❌ Error processing files:', error);
      setStatus('Error processing files');
      setIsProcessing(false);
    }
  };

  const createNetworkData = async () => {
    console.log('🏗️ createNetworkData called');
    console.log(`📁 Processing ${files.length} files`);
    
    const nodes: any[] = [];
    const edges: any[] = [];
    let nodeId = 1;

    for (const file of files) {
      console.log(`📄 Processing file: ${file.name}`);
      
      try {
        // Read and parse the CSV file
        const fileContent = await file.text();
        console.log(`📖 File content length: ${fileContent.length} characters`);
        
        // Parse CSV content
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        console.log(`📊 CSV has ${lines.length} lines`);
        
        // Find the header line and determine which column contains person names
        let personNames: string[] = [];
        let headerLine = '';
        
        if (lines.length > 0) {
          headerLine = lines[0];
          console.log(`📋 Header line: ${headerLine}`);
          
          // Try to find person name column
          const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
          console.log(`🏷️ Headers found:`, headers);
          
          let personColumnIndex = -1;
          
          // Look for common person name column headers
          const possibleHeaders = ['person name', 'name', 'person', 'personname', 'person_name'];
          for (const possibleHeader of possibleHeaders) {
            const index = headers.findIndex(h => h.includes(possibleHeader));
            if (index !== -1) {
              personColumnIndex = index;
              console.log(`✅ Found person column at index ${index}: "${headers[index]}"`);
              break;
            }
          }
          
          if (personColumnIndex === -1) {
            // If no specific header found, use the first column
            personColumnIndex = 0;
            console.log(`⚠️ No person name header found, using first column (index 0)`);
          }
          
          // Extract person names from the data rows (skip header)
          personNames = lines.slice(1)
            .map(line => {
              const columns = line.split(',').map(col => col.trim());
              return columns[personColumnIndex] || '';
            })
            .filter(name => name && name.toLowerCase() !== 'nan' && name !== '');
          
          console.log(`👥 Found ${personNames.length} person names:`, personNames);
        }
        
        // Create essay node
        const essayNode = {
          id: `essay_${file.name}`,
          label: file.name.replace('.csv', ''),
          type: 'essay',
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
          z: (Math.random() - 0.5) * 20
        };
        nodes.push(essayNode);
        console.log(`📝 Created essay node: ${essayNode.label}`);
        
        // Create person nodes from actual CSV data
        if (personNames.length > 0) {
          console.log(`👥 Creating ${personNames.length} person nodes for essay: ${essayNode.label}`);
          
          personNames.forEach((personName) => {
            const personNode = {
              id: `person_${nodeId}`,
              label: personName, // Use actual person name
              type: 'person',
              x: (Math.random() - 0.5) * 10,
              y: (Math.random() - 0.5) * 10,
              z: (Math.random() - 0.5) * 10
            };
            nodes.push(personNode);

            // Create connection
            edges.push({
              source: essayNode.id,
              target: personNode.id,
              label: 'mentions'
            });

            nodeId++;
            console.log(`👤 Created person node: ${personName}`);
          });
        } else {
          // Fallback: create some sample person nodes if no data found
          console.log(`⚠️ No person names found in CSV, creating sample data`);
          const personCount = Math.floor(Math.random() * 5) + 2;
          
          for (let i = 0; i < personCount; i++) {
            const personNode = {
              id: `person_${nodeId}`,
              label: `Sample Person ${i + 1}`,
              type: 'person',
              x: (Math.random() - 0.5) * 10,
              y: (Math.random() - 0.5) * 10,
              z: (Math.random() - 0.5) * 10
            };
            nodes.push(personNode);

            edges.push({
              source: essayNode.id,
              target: personNode.id,
              label: 'mentions'
            });

            nodeId++;
          }
        }
        
        console.log(`✅ Completed processing file: ${file.name} (${personNames.length} persons)`);
        
      } catch (error) {
        console.error(`❌ Error processing file ${file.name}:`, error);
        
        // Create a basic essay node even if parsing fails
        const essayNode = {
          id: `essay_${file.name}`,
          label: file.name.replace('.csv', ''),
          type: 'essay',
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
          z: (Math.random() - 0.5) * 20
        };
        nodes.push(essayNode);
        
        // Add some sample person nodes
        const personCount = 3;
        for (let i = 0; i < personCount; i++) {
          const personNode = {
            id: `person_${nodeId}`,
            label: `Error Person ${i + 1}`,
            type: 'person',
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10,
            z: (Math.random() - 0.5) * 10
          };
          nodes.push(personNode);

          edges.push({
            source: essayNode.id,
            target: personNode.id,
            label: 'mentions'
          });

          nodeId++;
        }
      }
    }

    const result = {
      nodes,
      edges,
      metadata: {
        total_nodes: nodes.length,
        total_edges: edges.length,
        files_processed: files.length
      }
    };

    console.log('📊 Final network data:', {
      total_nodes: result.nodes.length,
      total_edges: result.edges.length,
      files_processed: result.metadata.files_processed,
      essays: result.nodes.filter(n => n.type === 'essay').length,
      persons: result.nodes.filter(n => n.type === 'person').length
    });

    return result;
  };

  const clearFiles = () => {
    console.log('🗑️ Clearing all files');
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    console.log(`🗑️ Removing file at index ${index}: ${files[index]?.name}`);
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      console.log(`📋 Files after removal: ${newFiles.length}`);
      return newFiles;
    });
  };

  // Debug: Log current files state whenever it changes
  React.useEffect(() => {
    console.log(`📋 Current files state updated: ${files.length} files`);
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name}`);
    });
  }, [files]);

  return (
    <div className="landing-page">
      <div className="landing-container">
        <header className="landing-header">
          <h1 className="landing-title">Network Visualization Tool</h1>
          <p className="landing-subtitle">
            3D visualization of relationships between essays and referenced persons
          </p>
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: 'rgba(52, 152, 219, 0.1)', 
            borderRadius: '8px',
            border: '1px solid rgba(52, 152, 219, 0.2)',
            fontSize: '14px',
            color: '#495057',
            lineHeight: '1.5'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '16px' }}>
              Navigation Controls
            </h4>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Mouse:</strong> Click and drag to rotate the view • Scroll to zoom in/out
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Keyboard:</strong> Hold <kbd style={{ 
                background: '#f8f9fa', 
                border: '1px solid #dee2e6', 
                borderRadius: '3px', 
                padding: '2px 6px', 
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>Ctrl</kbd> (Windows) or <kbd style={{ 
                background: '#f8f9fa', 
                border: '1px solid #dee2e6', 
                borderRadius: '3px', 
                padding: '2px 6px', 
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>Cmd</kbd> (Mac) + drag to pan the view
            </p>
            <p style={{ margin: '0', fontSize: '12px', color: '#6c757d', fontStyle: 'italic' }}>
              Hover over nodes to see detailed information
            </p>
          </div>
        </header>

        <main className="landing-main">
          <section className="upload-section">
            <h2 className="section-title">Upload CSV Files</h2>
            
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => {
                console.log('🖱️ Individual files upload area clicked');
                fileInputRef.current?.click();
              }}
            >
              <div className="upload-icon">📄</div>
              <h3>CSV Files</h3>
              <p>Drag and drop CSV files here or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv"
                onChange={(e) => {
                  console.log('📁 Individual files input changed');
                  handleFileSelect(e.target.files);
                }}
                style={{ display: 'none' }}
              />
            </div>
          </section>

          {files.length > 0 && (
            <section className="files-section">
              <h2 className="section-title">Selected Files ({files.length})</h2>
              <div className="file-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {isProcessing && (
            <section className="progress-section">
              <h2 className="section-title">Processing Data</h2>
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="progress-status">{status}</p>
              </div>
            </section>
          )}

          <section className="actions-section">
            <div className="action-buttons">
              <button
                className="btn btn-primary"
                onClick={processFiles}
                disabled={files.length === 0 || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Process & Visualize'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={clearFiles}
                disabled={files.length === 0 || isProcessing}
              >
                Clear All
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LandingPage; 