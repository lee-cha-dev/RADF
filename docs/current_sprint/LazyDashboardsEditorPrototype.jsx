import { useState } from 'react';

const EditorPrototype = () => {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [leftActiveTool, setLeftActiveTool] = useState('widgets');
  const [rightActiveTool, setRightActiveTool] = useState('properties');
  const [hoveredTool, setHoveredTool] = useState(null);
  const [layoutEditorMode, setLayoutEditorMode] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(300);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);

  const leftTools = [
    { id: 'dataset', label: 'Dataset', icon: '📊' },
    { id: 'semantic', label: 'Semantic Layer', icon: '🧩' },
    { id: 'widgets', label: 'Widgets', icon: '📦' },
  ];

  const rightTools = [
    { id: 'properties', label: 'Properties', icon: '🎨' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleLeftToolClick = (toolId) => {
    if (!leftPanelOpen) {
      setLeftPanelOpen(true);
      setLeftActiveTool(toolId);
    } else if (leftActiveTool === toolId) {
      setLeftPanelOpen(false);
    } else {
      setLeftActiveTool(toolId);
    }
  };

  const handleRightToolClick = (toolId) => {
    if (!rightPanelOpen) {
      setRightPanelOpen(true);
      setRightActiveTool(toolId);
    } else if (rightActiveTool === toolId) {
      setRightPanelOpen(false);
    } else {
      setRightActiveTool(toolId);
    }
  };

  // Mock data
  const widgets = [
    { id: 'kpi-1', title: 'Total Revenue', type: 'kpi', layout: { x: 1, y: 1, w: 3, h: 1 } },
    { id: 'bar-1', title: 'Sales by Region', type: 'bar', layout: { x: 4, y: 1, w: 6, h: 3 } },
    { id: 'line-1', title: 'Trend Over Time', type: 'line', layout: { x: 1, y: 2, w: 3, h: 2 } },
  ];

  const [selectedWidget, setSelectedWidget] = useState(widgets[0].id);

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: '#1a1a1a',
      color: '#e0e0e0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Left Sidebar */}
      <div style={{
        display: 'flex',
        background: '#242424',
        borderRight: '1px solid #333',
      }}>
        {/* Icon Toolbar */}
        <div style={{
          width: '48px',
          background: '#2a2a2a',
          borderRight: '1px solid #333',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '8px'
        }}>
          {leftTools.map(tool => (
            <div
              key={tool.id}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => handleLeftToolClick(tool.id)}
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: leftActiveTool === tool.id && leftPanelOpen ? '#333' : 'transparent',
                borderLeft: leftActiveTool === tool.id && leftPanelOpen ? '3px solid #4CAF50' : '3px solid transparent',
                position: 'relative',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '20px' }}>{tool.icon}</span>
              {hoveredTool === tool.id && (
                <div style={{
                  position: 'absolute',
                  left: '56px',
                  background: '#1a1a1a',
                  border: '1px solid #444',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  fontSize: '12px',
                  color: '#e0e0e0',
                  zIndex: 1000,
                  pointerEvents: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}>
                  {tool.label}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content Panel */}
        {leftPanelOpen && (
          <div style={{
            width: `${leftPanelWidth}px`,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ 
              height: '40px',
              padding: '0 12px',
              borderBottom: '1px solid #333',
              background: '#2a2a2a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '12px', 
                fontWeight: 600,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {leftTools.find(t => t.id === leftActiveTool)?.label}
              </h2>
              <button
                onClick={() => setLeftPanelOpen(false)}
                style={{
                  width: '20px',
                  height: '20px',
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  lineHeight: 1
                }}
                title="Minimize"
              >
                −
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '12px'
            }}>
              {leftActiveTool === 'dataset' && (
                <div>
                  <div style={{
                    padding: '12px',
                    background: '#2a2a2a',
                    borderRadius: '6px',
                    border: '1px solid #333',
                    marginBottom: '12px'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                      Sales Data 2024
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>
                      1,234 rows • 8 columns
                    </div>
                  </div>
                  <button style={{
                    width: '100%',
                    padding: '8px',
                    background: '#3a3a3a',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    color: '#e0e0e0',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    Import Dataset
                  </button>
                </div>
              )}

              {leftActiveTool === 'semantic' && (
                <div>
                  <div style={{
                    padding: '12px',
                    background: '#2a2a2a',
                    borderRadius: '6px',
                    border: '1px solid #333',
                    fontSize: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#4CAF50' }}>●</span> 
                      <span style={{ fontWeight: 500 }}>Enabled</span>
                    </div>
                    <div style={{ color: '#888', fontSize: '11px' }}>
                      5 metrics • 3 dimensions
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Metrics
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                    {['sum_revenue', 'avg_order', 'count_orders'].map(m => (
                      <div key={m} style={{ 
                        padding: '6px 8px', 
                        background: '#2a2a2a', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        border: '1px solid #333'
                      }}>
                        {m}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Dimensions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {['region', 'category', 'date'].map(d => (
                      <div key={d} style={{ 
                        padding: '6px 8px', 
                        background: '#2a2a2a', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        border: '1px solid #333'
                      }}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {leftActiveTool === 'widgets' && (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#888',
                      letterSpacing: '0.5px'
                    }}>
                      {widgets.length} Widgets
                    </div>
                    <button style={{
                      background: '#3a3a3a',
                      border: '1px solid #444',
                      color: '#e0e0e0',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}>
                      + Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {widgets.map(widget => (
                      <div
                        key={widget.id}
                        onClick={() => setSelectedWidget(widget.id)}
                        style={{
                          padding: '10px',
                          background: selectedWidget === widget.id ? '#3a3a3a' : '#2a2a2a',
                          border: `1px solid ${selectedWidget === widget.id ? '#4CAF50' : '#333'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ 
                          fontSize: '13px', 
                          fontWeight: 500,
                          marginBottom: '4px',
                          color: selectedWidget === widget.id ? '#fff' : '#e0e0e0'
                        }}>
                          {widget.title}
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#888',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>{widget.type}</span>
                          <span>{widget.layout.w}×{widget.layout.h}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resize Handle */}
            <div
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startWidth = leftPanelWidth;
                const handleMouseMove = (e) => {
                  const delta = e.clientX - startX;
                  setLeftPanelWidth(Math.max(200, Math.min(500, startWidth + delta)));
                };
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                cursor: 'col-resize',
                background: 'transparent',
                zIndex: 5
              }}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        background: '#1a1a1a'
      }}>
        {/* Top Toolbar */}
        <div style={{
          height: '56px',
          background: '#242424',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: 600,
              color: '#fff'
            }}>
              Sales Dashboard 2024
            </h1>
            <div style={{
              fontSize: '12px',
              color: '#888',
              padding: '4px 8px',
              background: '#2a2a2a',
              borderRadius: '4px'
            }}>
              Auto-saved 2 min ago
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setLayoutEditorMode(!layoutEditorMode)}
              style={{
                padding: '8px 16px',
                background: layoutEditorMode ? '#4CAF50' : '#3a3a3a',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.15s ease'
              }}
            >
              {layoutEditorMode ? '✓ Layout Editor' : '✏️ Edit Layout'}
            </button>
            <button style={{
              padding: '8px 16px',
              background: '#3a3a3a',
              border: '1px solid #444',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '13px',
              cursor: 'pointer'
            }}>
              Export
            </button>
            <button style={{
              padding: '8px 16px',
              background: '#4CAF50',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 500
            }}>
              Save
            </button>
          </div>
        </div>

        {/* Preview/Editor Area */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto',
          padding: '20px',
          position: 'relative'
        }}>
          {layoutEditorMode ? (
            // Layout Editor Mode
            <div style={{
              background: '#242424',
              borderRadius: '8px',
              border: '1px solid #333',
              padding: '20px',
              minHeight: '600px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '6px 12px',
                background: '#4CAF50',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#fff'
              }}>
                LAYOUT EDITOR MODE
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '12px',
                minHeight: '500px',
                padding: '40px 0 0 0'
              }}>
                {/* Grid visualization */}
                {Array.from({ length: 12 * 8 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#2a2a2a',
                      border: '1px dashed #333',
                      borderRadius: '4px',
                      minHeight: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#444',
                      fontSize: '10px'
                    }}
                  >
                    {i % 12 === 0 ? Math.floor(i / 12) + 1 : ''}
                  </div>
                ))}
                
                {/* Widget placeholders */}
                {widgets.map(widget => (
                  <div
                    key={widget.id}
                    style={{
                      gridColumn: `${widget.layout.x} / span ${widget.layout.w}`,
                      gridRow: `${widget.layout.y} / span ${widget.layout.h}`,
                      background: selectedWidget === widget.id ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${selectedWidget === widget.id ? '#4CAF50' : '#444'}`,
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'move',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                    onClick={() => setSelectedWidget(widget.id)}
                  >
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#fff'
                    }}>
                      {widget.title}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#888'
                    }}>
                      {widget.type} • Position: ({widget.layout.x}, {widget.layout.y}) • Size: {widget.layout.w}×{widget.layout.h}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      width: '16px',
                      height: '16px',
                      background: '#4CAF50',
                      borderRadius: '2px',
                      cursor: 'nwse-resize'
                    }} />
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#2a2a2a',
                borderRadius: '6px',
                border: '1px solid #333',
                fontSize: '13px',
                color: '#888',
                textAlign: 'center'
              }}>
                💡 Drag widgets to reposition • Click and drag corner handles to resize • Click "Save" when done
              </div>
            </div>
          ) : (
            // Live Preview Mode
            <div style={{
              background: '#242424',
              borderRadius: '8px',
              border: '1px solid #333',
              padding: '24px',
              minHeight: '600px'
            }}>
              <div style={{
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #333'
              }}>
                <h2 style={{
                  margin: '0 0 8px 0',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#fff'
                }}>
                  Sales Dashboard 2024
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#888'
                }}>
                  Live preview of your dashboard with real RADF components
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '16px',
                minHeight: '500px'
              }}>
                {/* Mock widget renderings */}
                {widgets.map(widget => (
                  <div
                    key={widget.id}
                    onClick={() => setSelectedWidget(widget.id)}
                    style={{
                      gridColumn: `${widget.layout.x} / span ${widget.layout.w}`,
                      gridRow: `${widget.layout.y} / span ${widget.layout.h}`,
                      background: '#2a2a2a',
                      border: `2px solid ${selectedWidget === widget.id ? '#4CAF50' : '#333'}`,
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#888',
                      textTransform: 'uppercase',
                      marginBottom: '12px',
                      letterSpacing: '0.5px'
                    }}>
                      {widget.title}
                    </div>
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#1a1a1a',
                      borderRadius: '6px',
                      color: '#666',
                      fontSize: '13px'
                    }}>
                      {widget.type === 'kpi' && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '32px', fontWeight: 700, color: '#4CAF50', marginBottom: '8px' }}>
                            $1.2M
                          </div>
                          <div style={{ fontSize: '12px', color: '#888' }}>
                            ↑ 12% vs last month
                          </div>
                        </div>
                      )}
                      {widget.type === 'bar' && (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '20px' }}>
                          {[60, 80, 45, 90, 70].map((h, i) => (
                            <div key={i} style={{ flex: 1, height: `${h}%`, background: '#4CAF50', borderRadius: '4px 4px 0 0' }} />
                          ))}
                        </div>
                      )}
                      {widget.type === 'line' && (
                        <div style={{ fontSize: '48px' }}>📈</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{
        display: 'flex',
        background: '#242424',
        borderLeft: '1px solid #333',
      }}>
        {/* Content Panel */}
        {rightPanelOpen && (
          <div style={{
            width: `${rightPanelWidth}px`,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ 
              height: '40px',
              padding: '0 12px',
              borderBottom: '1px solid #333',
              background: '#2a2a2a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '12px', 
                fontWeight: 600,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {rightTools.find(t => t.id === rightActiveTool)?.label}
              </h2>
              <button
                onClick={() => setRightPanelOpen(false)}
                style={{
                  width: '20px',
                  height: '20px',
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  lineHeight: 1
                }}
                title="Minimize"
              >
                −
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '16px'
            }}>
              {rightActiveTool === 'properties' && selectedWidget && (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#888',
                      marginBottom: '8px',
                      letterSpacing: '0.5px'
                    }}>
                      Widget Info
                    </div>
                    <div style={{
                      padding: '12px',
                      background: '#2a2a2a',
                      borderRadius: '6px',
                      border: '1px solid #333',
                      fontSize: '13px'
                    }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Title:</strong> {widgets.find(w => w.id === selectedWidget)?.title}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Type:</strong> {widgets.find(w => w.id === selectedWidget)?.type}
                      </div>
                      <div>
                        <strong>Status:</strong> <span style={{ color: '#4CAF50' }}>Valid</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#888',
                      marginBottom: '8px',
                      letterSpacing: '0.5px'
                    }}>
                      Encodings
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '6px' }}>
                          Value
                        </label>
                        <input
                          type="text"
                          placeholder="metric_name"
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: '#2a2a2a',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            color: '#e0e0e0',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '6px' }}>
                          Category
                        </label>
                        <input
                          type="text"
                          placeholder="dimension_name"
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: '#2a2a2a',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            color: '#e0e0e0',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#888',
                      marginBottom: '8px',
                      letterSpacing: '0.5px'
                    }}>
                      Options
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                        <span>Show tooltip</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <input type="checkbox" style={{ cursor: 'pointer' }} />
                        <span>Show legend</span>
                      </label>
                      <div>
                        <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '6px' }}>
                          Format
                        </label>
                        <select style={{
                          width: '100%',
                          padding: '8px',
                          background: '#2a2a2a',
                          border: '1px solid #444',
                          borderRadius: '4px',
                          color: '#e0e0e0',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}>
                          <option>Number</option>
                          <option>Currency</option>
                          <option>Percent</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button style={{
                    width: '100%',
                    padding: '10px',
                    background: '#d32f2f',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}>
                    Remove Widget
                  </button>
                </>
              )}

              {rightActiveTool === 'settings' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#888',
                      marginBottom: '8px',
                      letterSpacing: '0.5px'
                    }}>
                      Editor Settings
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                        <span>Auto-save</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                        <span>Show grid in layout editor</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <input type="checkbox" style={{ cursor: 'pointer' }} />
                        <span>Snap to grid</span>
                      </label>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#888',
                      marginBottom: '8px',
                      letterSpacing: '0.5px'
                    }}>
                      Theme
                    </div>
                    <select style={{
                      width: '100%',
                      padding: '8px',
                      background: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      color: '#e0e0e0',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}>
                      <option>Dark</option>
                      <option>Light</option>
                      <option>System</option>
                    </select>
                  </div>
                </div>
              )}

              {rightActiveTool === 'properties' && !selectedWidget && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#888',
                  fontSize: '13px'
                }}>
                  Select a widget to view its properties
                </div>
              )}
            </div>

            {/* Resize Handle */}
            <div
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startWidth = rightPanelWidth;
                const handleMouseMove = (e) => {
                  const delta = startX - e.clientX;
                  setRightPanelWidth(Math.max(280, Math.min(500, startWidth + delta)));
                };
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                cursor: 'col-resize',
                background: 'transparent',
                zIndex: 5
              }}
            />
          </div>
        )}

        {/* Icon Toolbar */}
        <div style={{
          width: '48px',
          background: '#2a2a2a',
          borderLeft: '1px solid #333',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '8px'
        }}>
          {rightTools.map(tool => (
            <div
              key={tool.id}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => handleRightToolClick(tool.id)}
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: rightActiveTool === tool.id && rightPanelOpen ? '#333' : 'transparent',
                borderRight: rightActiveTool === tool.id && rightPanelOpen ? '3px solid #4CAF50' : '3px solid transparent',
                position: 'relative',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '20px' }}>{tool.icon}</span>
              {hoveredTool === tool.id && (
                <div style={{
                  position: 'absolute',
                  right: '56px',
                  background: '#1a1a1a',
                  border: '1px solid #444',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  fontSize: '12px',
                  color: '#e0e0e0',
                  zIndex: 1000,
                  pointerEvents: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}>
                  {tool.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorPrototype;
