import React, { useState, useRef } from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onDataProcessed: (data: any) => void;
  showAdditionalMetadata?: boolean;
  onMetadataToggle?: (show: boolean) => void;
}

console.debug('[LandingPage] LandingPage component loaded');

const LandingPage: React.FC<LandingPageProps> = ({ 
  onDataProcessed, 
  showAdditionalMetadata = true, 
  onMetadataToggle 
}) => {
  console.debug('[LandingPage] LandingPage component rendering');
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [includeNotes, setIncludeNotes] = useState(false);
  const [localShowMetadata, setLocalShowMetadata] = useState(showAdditionalMetadata);
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
    console.log(`📝 Include notes: ${includeNotes}`);
    
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
        'Extracting variable names...',
        'Filtering by notes...',
        'Removing duplicates...',
        'Building network structure...',
        'Preparing visualization data...'
      ];

      for (let i = 0; i < steps.length; i++) {
        console.log(`🔄 Processing step ${i + 1}: ${steps[i]}`);
        setStatus(steps[i]);
        setProgress(((i + 1) / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 600));
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

  // Helper function to format essay names
  const formatEssayName = (essayName: string): string => {
    console.log(`🔧 Formatting essay name: "${essayName}"`);
    
    // Convert "essays-01-03-persons-OR" to "Essay 3 (Book 1) - Persons"
    const match = essayName.match(/essays-(\d{2})-(\d{2})-([^-]+)(?:-([^-]+))?/);
    if (match) {
      const bookNumber = parseInt(match[1]);
      const essayNumber = parseInt(match[2]);
      const thingType = match[3]; // persons, places, etc.
      const optionalSuffix = match[4]; // OR or other optional suffix
      
      console.log(`✅ New format match: bookNumber=${bookNumber}, essayNumber=${essayNumber}, thingType=${thingType}, optionalSuffix=${optionalSuffix}`);
      
      let formattedName = `Essay ${essayNumber} (Book ${bookNumber}) - ${thingType.charAt(0).toUpperCase() + thingType.slice(1)}`;
      if (optionalSuffix && optionalSuffix.toLowerCase() !== 'nan' && optionalSuffix !== '') {
        formattedName += ` - ${optionalSuffix}`;
      }
      console.log(`📝 Formatted name: "${formattedName}"`);
      return formattedName;
    }
    
    // Fallback: try to parse the old format "essays 01_04 persons"
    const oldMatch = essayName.match(/essays (\d{2})_(\d{2})/);
    if (oldMatch) {
      const bookNumber = parseInt(oldMatch[1]);
      const essayNumber = parseInt(oldMatch[2]);
      console.log(`✅ Old format match: bookNumber=${bookNumber}, essayNumber=${essayNumber}`);
      const formattedName = `Essay ${essayNumber} (Book ${bookNumber})`;
      console.log(`📝 Formatted name: "${formattedName}"`);
      return formattedName;
    }
    
    console.log(`❌ No format match found, returning original: "${essayName}"`);
    return essayName;
  };

  const createNetworkData = async (filesToProcess = files) => {
    console.log('🏗️ createNetworkData called');
    console.log(`📁 Processing ${filesToProcess.length} files`);
    console.log(`📝 Include notes setting: ${includeNotes}`);
    
    const nodes: any[] = [];
    const edges: any[] = [];
    let nodeId = 1;

    // Detect node type from file names
    let detectedType = 'Person';
    let detectedTypePlural = 'Persons';
    if (filesToProcess.length > 0) {
      // Look for 'places' or 'persons' in any file name
      const lowerNames = filesToProcess.map(f => f.name.toLowerCase());
      if (lowerNames.some(name => name.includes('places'))) {
        detectedType = 'Place';
        detectedTypePlural = 'Places';
      } else if (lowerNames.some(name => name.includes('persons'))) {
        detectedType = 'Person';
        detectedTypePlural = 'Persons';
      }
    }

    // For counting occurrences
    const variableCounts: Record<string, number> = {};
    // Store all counts by essay
    const resultVariableCountsByEssay: Record<string, Record<string, number>> = {};
    // Store all metadata columns found
    const allMetadataColumns = new Set<string>();
    // Store metadata for each variable
    const variableMetadata: Record<string, Record<string, any>> = {};
    // Store mapping from formatted essay names to raw file names
    const essayNameMapping: Record<string, string> = {};

    for (const file of filesToProcess) {
      console.log(`📄 Processing file: ${file.name}`);
      
      try {
        // Read and parse the CSV file
        const fileContent = await file.text();
        console.log(`📖 File content length: ${fileContent.length} characters`);
        
        // Parse CSV content
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        console.log(`📊 CSV has ${lines.length} lines`);
        
        if (lines.length === 0) {
          console.log(`⚠️ Empty CSV file: ${file.name}`);
          continue;
        }

        // Get headers from first line
        const headerLine = lines[0];
        console.log(`📋 Header line: "${headerLine}"`);
        
        const headers = headerLine.split(',').map(h => h.trim());
          console.log(`🏷️ Headers found:`, headers);
          
        if (headers.length === 0) {
          console.log(`⚠️ No headers found in: ${file.name}`);
          continue;
        }

        // First column is always the main variable
        const mainVariableColumn = headers[0];
        console.log(`✅ Main variable column: "${mainVariableColumn}"`);
        
        // All other columns are metadata
        const metadataColumns = headers.slice(1);
        console.log(`📊 Metadata columns:`, metadataColumns);
        
        // Add metadata columns to global set
        metadataColumns.forEach(col => allMetadataColumns.add(col));
        
        // Extract data from rows (skip header)
        const dataRows = lines.slice(1);
        console.log(`📊 Processing ${dataRows.length} data rows`);
        
        const variables: string[] = [];
        const variableDataMap = new Map<string, Record<string, string>>();
        
                 dataRows.forEach((row, rowIndex) => {
           console.log(`📝 Processing row ${rowIndex + 1}: "${row}"`);
           
           const columns = row.split(',').map(col => col.trim());
           console.log(`📊 Row columns:`, columns);
           
           if (columns.length === 0) {
             console.log(`⚠️ Empty row ${rowIndex + 1}`);
             return;
           }
           
           const variableName = columns[0];
           console.log(`🎯 Variable name: "${variableName}"`);
           
           if (!variableName || variableName.toLowerCase() === 'nan' || variableName === '') {
             console.log(`⚠️ Skipping empty/invalid variable name`);
             return;
           }
           
           // Create metadata object from other columns
           const metadata: Record<string, string> = {};
           console.log(`🔍 Extracting metadata for "${variableName}":`);
           metadataColumns.forEach((header, index) => {
             const value = columns[index + 1] || '';
             console.log(`  📊 Column ${index + 1}: "${header}" = "${value}"`);
             if (value && value.toLowerCase() !== 'nan' && value !== '') {
               metadata[header] = value;
               console.log(`    ✅ Added metadata: ${header} = "${value}"`);
             } else {
               console.log(`    ⚠️ Skipping empty value for ${header}`);
             }
           });
           
           console.log(`📋 Final metadata for "${variableName}":`, metadata);
          
          // Store variable and its metadata
          if (!variableDataMap.has(variableName)) {
            variableDataMap.set(variableName, metadata);
            variables.push(variableName);
            variableCounts[variableName] = (variableCounts[variableName] || 0) + 1;
            console.log(`✅ Added variable: "${variableName}" with metadata:`, metadata);
          } else {
            // Variable already exists, merge metadata
            const existingMetadata = variableDataMap.get(variableName)!;
            Object.assign(existingMetadata, metadata);
            variableCounts[variableName]++;
            console.log(`🔄 Updated existing variable: "${variableName}"`);
          }
        });
        
        console.log(`👥 Found ${variables.length} unique variables in ${file.name}`);
        console.log(`📊 Variable counts:`, variableCounts);
        
        // Create essay node with formatted name
        const rawEssayName = file.name.replace('.csv', '');
        const formattedEssayName = formatEssayName(rawEssayName);
        
        const essayNode = {
          id: `essay_${file.name}`,
          label: formattedEssayName,
          type: 'essay',
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
          z: (Math.random() - 0.5) * 20
        };
        nodes.push(essayNode);
        console.log(`📝 Created essay node: ${essayNode.label}`);
        
        // Store mapping from formatted name to raw name
        essayNameMapping[formattedEssayName] = file.name;
        
        // Store counts for this essay using the raw essay name as key
        resultVariableCountsByEssay[file.name] = { ...variableCounts };
        
                 // Create variable nodes
         variables.forEach((variableName) => {
           const metadata = variableDataMap.get(variableName) || {};
           console.log(`🏗️ Creating node for "${variableName}" with metadata:`, metadata);
           
           const variableNode = {
             id: `variable_${nodeId}`,
             label: variableName,
             type: 'person', // Keep as 'person' for compatibility
              x: (Math.random() - 0.5) * 10,
              y: (Math.random() - 0.5) * 10,
             z: (Math.random() - 0.5) * 10,
             metadata: metadata
           };
           nodes.push(variableNode);
           
           // Store metadata globally
           variableMetadata[variableName] = metadata;
           console.log(`💾 Stored metadata for "${variableName}" in global map:`, variableMetadata[variableName]);

            // Create connection
            edges.push({
              source: essayNode.id,
             target: variableNode.id,
              label: 'mentions'
            });

            nodeId++;
           console.log(`👤 Created variable node: "${variableName}" with metadata:`, metadata);
         });
        
        console.log(`✅ Completed processing file: ${file.name} (${variables.length} variables)`);
        
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
        
        // Add some sample variable nodes
        const variableCount = 3;
        for (let i = 0; i < variableCount; i++) {
          const variableNode = {
            id: `variable_${nodeId}`,
            label: `Error Variable ${i + 1}`,
            type: 'person',
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10,
            z: (Math.random() - 0.5) * 10
          };
          nodes.push(variableNode);

          edges.push({
            source: essayNode.id,
            target: variableNode.id,
            label: 'mentions'
          });

          nodeId++;
        }
      }
    }

    // Update available columns
    const availableCols = Array.from(allMetadataColumns);
    console.log(`📊 Final available metadata columns:`, availableCols);

    const result = {
      nodes,
      edges,
      metadata: {
        total_nodes: nodes.length,
        total_edges: edges.length,
        files_processed: filesToProcess.length,
        include_notes: includeNotes,
        node_types: {
          person: detectedType,
          person_plural: detectedTypePlural,
          item: detectedType,
          item_plural: detectedTypePlural,
          essay: 'Essay',
          essay_plural: 'Essays'
        },
        person_counts_by_essay: resultVariableCountsByEssay,
        person_metadata: variableMetadata,
        available_metadata_columns: availableCols,
        essay_name_mapping: essayNameMapping
      }
    };

    console.log('📊 Final network data:', {
      total_nodes: result.nodes.length,
      total_edges: result.edges.length,
      files_processed: result.metadata.files_processed,
      essays: result.nodes.filter(n => n.type === 'essay').length,
      variables: result.nodes.filter(n => n.type === 'person').length,
      include_notes: result.metadata.include_notes,
      available_columns: availableCols
    });
    
    console.log('🔍 Final metadata structure:', {
      person_metadata: result.metadata.person_metadata,
      available_metadata_columns: result.metadata.available_metadata_columns,
      sample_metadata: Object.keys(result.metadata.person_metadata).slice(0, 3).map(key => ({
        variable: key,
        metadata: result.metadata.person_metadata[key]
      }))
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

  // Reset component state when it mounts (when returning from Network)
  React.useEffect(() => {
    // Use a single state update to prevent multiple re-renders
    setFiles([]);
    setIsProcessing(false);
    setProgress(0);
    setStatus('');
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clear any remaining intervals
    const intervals = window.setInterval(() => {}, 999999);
    for (let i = 1; i < intervals; i++) {
      window.clearInterval(i);
    }
  }, []);

  // Demo data loading implementation
  const loadDemoData = async () => {
    // List of demo CSVs to fetch
    const demoFiles = [
      'essays-01-01-persons-OR.csv',
      'essays-01-02-persons-OR.csv',
      'essays-01-03-persons-OR.csv',
      'essays-01-04-persons-OR.csv',
      'essays-01-05-persons-OR.csv',
      'essays-01-06-persons-OR.csv',
      'essays-01-07-persons-OR.csv',
      'essays-01-08-persons-OR.csv',
      'essays-01-09-persons-OR.csv',
      'essays-01-10-persons-OR.csv',
      'essays-02-01-persons-OR.csv',
      'essays-02-02-persons-Or.csv',
      'essays-02-03-persons-OR.csv',
      'essays-02-04-persons-OR.csv',
      'essays-02-05-persons-OR.csv',
      'essays-03-01-persons-OR.csv',
      'essays-03-02-persons-OR.csv',
      'essays-03-03-persons-OR.csv',
      'essays-03-04-persons-OR.csv',
      'essays-03-05-persons-OR.csv',
    ];
    // Use the correct public base URL for Vite
    const demoFolder = '/dh_project/demo/';
    console.debug('[loadDemoData] Starting demo data load');
    console.debug('[loadDemoData] Demo files to fetch:', demoFiles);
    try {
      // Fetch all demo CSVs
      const filePromises = demoFiles.map(async (fileName) => {
        const url = demoFolder + fileName;
        console.debug(`[loadDemoData] Fetching: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`[loadDemoData] Failed to fetch: ${url} (status: ${response.status})`);
          throw new Error('Failed to fetch ' + fileName);
        }
        const text = await response.text();
        console.debug(`[loadDemoData] Successfully fetched: ${url} (length: ${text.length})`);
        // Create a File-like object for compatibility with createNetworkData
        return new File([text], fileName, { type: 'text/csv' });
      });
      const fetchedFiles = await Promise.all(filePromises);
      console.debug('[loadDemoData] All files fetched:', fetchedFiles.map(f => f.name));
      setFiles(fetchedFiles); // for UI feedback if needed
      setIsProcessing(true);
      setProgress(0);
      setStatus('Processing demo data...');
      // Pass fetchedFiles directly to createNetworkData
      const networkData = await createNetworkData(fetchedFiles);
      setStatus('Demo data loaded!');
      setIsProcessing(false);
      console.debug('[loadDemoData] Demo data processed and sent to onDataProcessed');
      onDataProcessed(networkData);
    } catch (error) {
      setStatus('Error loading demo data');
      setIsProcessing(false);
      console.error('[loadDemoData] Error loading demo data:', error);
      alert('Failed to load demo data: ' + error);
    }
  };

  return (
    <div className="landing-page" style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="landing-container" style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <header className="landing-header" style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h1 className="landing-title" style={{
            fontSize: '36px',
            color: '#2c3e50',
            marginBottom: '10px',
            fontWeight: '600'
          }}>Network Visualization Tool</h1>
          <p className="landing-subtitle" style={{
            fontSize: '16px',
            color: '#7f8c8d',
            marginBottom: '20px',
            fontStyle: 'italic'
          }}>
            3D visualization of relationships between essays and referenced variables
          </p>
          <div style={{ 
            marginTop: '20px',
            marginBottom: '20px',
            padding: '15px', 
            background: 'rgba(52, 152, 219, 0.1)', 
            borderRadius: '8px',
            border: '1px solid rgba(52, 152, 219, 0.2)',
            fontSize: '14px',
            color: '#495057',
            lineHeight: '1.5',
            maxWidth: '600px',
            margin: '20px auto'
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
          <section className="upload-section" style={{
            marginBottom: '30px'
          }}>
            <h2 className="section-title" style={{
              fontSize: '24px',
              color: '#2c3e50',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: '500'
            }}>Upload CSV Files</h2>
            
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => {
                console.log('🖱️ Individual files upload area clicked');
                fileInputRef.current?.click();
              }}
              style={{
                border: '2px dashed #bdc3c7',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '10px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3498db';
                e.currentTarget.style.background = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#bdc3c7';
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              <div className="upload-icon" style={{
                fontSize: '48px',
                marginBottom: '10px'
              }}>📄</div>
              <h3 style={{
                fontSize: '20px',
                color: '#2c3e50',
                marginBottom: '8px',
                fontWeight: '500'
              }}>CSV Files</h3>
              <p style={{
                color: '#7f8c8d',
                fontSize: '14px'
              }}>Drag and drop CSV files here or click to browse</p>
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
            
            {/* Try Demo Data - Small text link */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button
                onClick={loadDemoData}
                disabled={isProcessing}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3498db',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '5px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2980b9'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#3498db'}
              >
                Try demo data
              </button>
            </div>
          </section>

          {files.length > 0 && (
            <section className="files-section" style={{
              marginBottom: '30px',
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 className="section-title" style={{
                fontSize: '20px',
                color: '#2c3e50',
                marginBottom: '15px',
                fontWeight: '500'
              }}>Selected Files ({files.length})</h2>
              <div className="file-list" style={{
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {files.map((file, index) => (
                  <div key={index} className="file-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <span className="file-name" style={{
                        color: '#2c3e50',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}>{file.name}</span>
                      <span className="file-size" style={{
                        color: '#7f8c8d',
                        fontSize: '12px',
                        marginLeft: '10px'
                      }}>({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFile(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e74c3c',
                        fontSize: '20px',
                        cursor: 'pointer',
                        padding: '0 5px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#c0392b'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#e74c3c'}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {files.length > 0 && (
            <section className="options-section" style={{
              marginBottom: '30px',
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 className="section-title" style={{
                fontSize: '20px',
                color: '#2c3e50',
                marginBottom: '15px',
                fontWeight: '500'
              }}>Processing Options</h2>
              <div className="option-item" style={{ marginBottom: '15px' }}>
                <label className="checkbox-label" style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={includeNotes}
                    onChange={(e) => setIncludeNotes(e.target.checked)}
                    style={{
                      marginRight: '10px',
                      marginTop: '2px'
                    }}
                  />
                  <div>
                    <span style={{
                      color: '#2c3e50',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>Include variables marked as notes/annotations</span>
                    <p className="option-description" style={{
                      color: '#7f8c8d',
                      fontSize: '12px',
                      marginTop: '4px',
                      margin: '4px 0 0 0'
                    }}>
                      When unchecked, variables with "note" or "annotation" in the comment column will be excluded
                    </p>
                  </div>
                </label>
              </div>
              <div className="option-item">
                <label className="checkbox-label" style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={localShowMetadata}
                    onChange={(e) => {
                      setLocalShowMetadata(e.target.checked);
                      onMetadataToggle?.(e.target.checked);
                    }}
                    style={{
                      marginRight: '10px',
                      marginTop: '2px'
                    }}
                  />
                  <div>
                    <span style={{
                      color: '#2c3e50',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>Show additional metadata in variable section</span>
                    <p className="option-description" style={{
                      color: '#7f8c8d',
                      fontSize: '12px',
                      marginTop: '4px',
                      margin: '4px 0 0 0'
                    }}>
                      When checked, additional columns from CSV files will be displayed when expanding variables
                    </p>
                  </div>
                </label>
              </div>
            </section>
          )}

          {isProcessing && (
            <section className="progress-section" style={{
              marginBottom: '30px',
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 className="section-title" style={{
                fontSize: '20px',
                color: '#2c3e50',
                marginBottom: '15px',
                fontWeight: '500'
              }}>Processing Data</h2>
              <div className="progress-container">
                <div className="progress-bar" style={{
                  width: '100%',
                  height: '8px',
                  background: '#ecf0f1',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '10px'
                }}>
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${progress}%`,
                      height: '100%',
                      background: '#3498db',
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                </div>
                <p className="progress-status" style={{
                  color: '#7f8c8d',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>{status}</p>
              </div>
            </section>
          )}

          <section className="actions-section" style={{
            textAlign: 'center'
          }}>
            <div className="action-buttons" style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <button
                className="btn btn-primary"
                onClick={processFiles}
                disabled={files.length === 0 || isProcessing}
                style={{
                  padding: '12px 30px',
                  background: files.length === 0 || isProcessing ? '#95a5a6' : '#3498db',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: files.length === 0 || isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (files.length > 0 && !isProcessing) {
                    e.currentTarget.style.background = '#2980b9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (files.length > 0 && !isProcessing) {
                    e.currentTarget.style.background = '#3498db';
                  }
                }}
              >
                {isProcessing ? 'Processing...' : 'Process & Visualize'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={clearFiles}
                disabled={files.length === 0 || isProcessing}
                style={{
                  padding: '12px 30px',
                  background: files.length === 0 || isProcessing ? '#ecf0f1' : '#ecf0f1',
                  color: files.length === 0 || isProcessing ? '#95a5a6' : '#2c3e50',
                  border: '1px solid #bdc3c7',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: files.length === 0 || isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (files.length > 0 && !isProcessing) {
                    e.currentTarget.style.background = '#bdc3c7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (files.length > 0 && !isProcessing) {
                    e.currentTarget.style.background = '#ecf0f1';
                  }
                }}
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

console.debug('[LandingPage] LandingPage component export');
export default LandingPage;