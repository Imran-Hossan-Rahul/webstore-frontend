// FolderSelector.jsx - Folder selection component
'use client';
import { useState, useEffect } from 'react';

export default function FolderSelector({ onFolderSelect }) {
  const [currentPath, setCurrentPath] = useState('');
  const [folderStructure, setFolderStructure] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/folder/drives`);
      const data = await response.json();
      setDrives(data.drives || []);
    } catch (error) {
      console.error('Failed to load drives:', error);
    }
  };

  const browsePath = async (path) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/folder/browse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: path })
      });
      
      const data = await response.json();
      if (data.structure) {
        setFolderStructure(data.structure);
        setCurrentPath(data.currentPath);
      }
    } catch (error) {
      console.error('Failed to browse path:', error);
    }
    setLoading(false);
  };

  const handleFolderClick = (item) => {
    if (item.isDirectory) {
      browsePath(item.path);
    }
  };

  const goUp = () => {
    const parentPath = currentPath.split('\\').slice(0, -1).join('\\');
    if (parentPath) {
      browsePath(parentPath);
    }
  };

  const selectCurrentFolder = () => {
    onFolderSelect(currentPath);
  };

  return (
    <div className="folder-selector">
      <div className="folder-header">
        <h2>Select Devlog Folder</h2>
        <p>Choose a folder from your computer to work with</p>
      </div>

      {/* Drives */}
      <div className="drives-section">
        <h3>Drives:</h3>
        <div className="drives-list">
          {drives.map(drive => (
            <button 
              key={drive} 
              onClick={() => browsePath(drive)}
              className="drive-btn"
            >
              📁 {drive}
            </button>
          ))}
        </div>
      </div>

      {/* Current Path */}
      {currentPath && (
        <div className="current-path">
          <div className="path-bar">
            <button onClick={goUp} disabled={!currentPath}>⬆️ Up</button>
            <span className="path-text">{currentPath}</span>
            <button onClick={selectCurrentFolder} className="select-btn">
              ✅ Open in Code
            </button>
          </div>
        </div>
      )}

      {/* Folder Contents */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="folder-contents">
          {folderStructure.map((item, index) => (
            <div 
              key={index}
              className={`folder-item ${item.isDirectory ? 'directory' : 'file'}`}
              onClick={() => handleFolderClick(item)}
            >
              <span className="icon">
                {item.isDirectory ? '📁' : '📄'}
              </span>
              <span className="name">{item.name}</span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .folder-selector {
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
          background: #1e1e1e;
          color: white;
          border-radius: 8px;
        }
        
        .folder-header h2 {
          margin: 0 0 10px 0;
          color: #4CAF50;
        }
        
        .drives-section {
          margin: 20px 0;
        }
        
        .drives-list {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .drive-btn {
          padding: 8px 16px;
          background: #333;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .drive-btn:hover {
          background: #555;
        }
        
        .path-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: #333;
          border-radius: 4px;
          margin: 10px 0;
        }
        
        .path-text {
          flex: 1;
          font-family: monospace;
          font-size: 14px;
        }
        
        .select-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .folder-contents {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #333;
          border-radius: 4px;
        }
        
        .folder-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #333;
        }
        
        .folder-item:hover {
          background: #333;
        }
        
        .folder-item.directory {
          font-weight: bold;
        }
        
        .loading {
          text-align: center;
          padding: 20px;
        }
      `}</style>
    </div>
  );
}

