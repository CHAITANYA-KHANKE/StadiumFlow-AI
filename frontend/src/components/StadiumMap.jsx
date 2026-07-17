import React, { useState, useMemo } from 'react';
import { Layers } from 'lucide-react';
import { translate } from '../services/translator';

const WIDTH = 560;
const HEIGHT = 560;
const CX = WIDTH / 2;
const CY = HEIGHT / 2 + 30; // slightly shift down to accommodate floating high Z layers
const SCALE = 5.2;

export default function StadiumMap({
  nodes = {},
  edges = [],
  liveState = {},
  pathNodes = [],
  selectedStart = '',
  selectedEnd = '',
  onSelectNode = null,
  role = 'fan',
  language = 'en',
}) {
  // 3.0 Interactive Z-Axis Layer Separation state (for custom 3D depth)
  const [zSeparation, setZSeparation] = useState(15); // default 15px height per z-unit

  // Parse closures
  const closures = useMemo(() => {
    return new Set([
      ...(liveState.gate_closures || []),
      ...(liveState.facility_closures || []),
    ]);
  }, [liveState]);

  const gateWaits = liveState.gate_security_wait || {};
  const concourseCongestion = liveState.concourse_congestion || {};

  // Calculate coordinates mapping with Z-axis offset (3D Isometric projection)
  const getCoords = (node) => {
    if (!node) return { cx: CX, cy: CY };
    const zOffset = (node.z || 0.0) * zSeparation;
    return {
      cx: CX + node.y * SCALE,
      cy: CY - node.x * SCALE - zOffset, // higher z values float upwards
    };
  };

  const getNodeColor = (nodeId, nodeType) => {
    if (closures.has(nodeId)) {
      return 'var(--status-disabled)';
    }

    if (nodeType === 'gate') {
      const wait = gateWaits[nodeId] || 0;
      if (wait >= 15) return 'var(--status-closed)';
      if (wait >= 10) return 'var(--status-warning)';
      return 'var(--status-open)';
    }

    if (nodeType === 'concourse') {
      const cong = concourseCongestion[nodeId] || 1.0;
      if (cong >= 2.5) return 'var(--status-closed)';
      if (cong >= 1.5) return 'var(--status-warning)';
      return 'var(--status-open)';
    }

    return 'var(--status-open)'; // rest open
  };

  const pathEdges = useMemo(() => {
    const edgeSet = new Set();
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const u = pathNodes[i];
      const v = pathNodes[i + 1];
      edgeSet.add(`${u}-${v}`);
      edgeSet.add(`${v}-${u}`);
    }
    return edgeSet;
  }, [pathNodes]);

  return (
    <div className="flex-column" style={{ width: '100%' }}>
      {/* 3D Map Settings Header */}
      <div className="flex-between animate-fade-in" style={{ marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ margin: 0 }}>{translate('smart_stadium_map', language)}</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
            {role === 'fan' 
              ? translate('map_sub_fan', language)
              : translate('map_sub_op', language)}
          </p>
        </div>

        {/* 3D Layer separation slider */}
        <div className="flex-row" style={{ gap: '10px', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
          <Layers size={13} style={{ color: 'var(--primary)' }} />
          <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>3D DEPTH</label>
          <input 
            type="range" 
            min="0" 
            max="30" 
            value={zSeparation} 
            onChange={(e) => setZSeparation(parseInt(e.target.value))}
            style={{ width: '80px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            aria-label="3D Layer height separation slider"
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#05070a', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border-light)' }}>
        <svg 
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`} 
          style={{ width: '100%', maxHeight: '430px', display: 'block' }}
          aria-label="Layered 3D Stadium map layout"
        >
          <defs>
            <radialGradient id="mapGlow3D" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#121829" stopOpacity="1" />
              <stop offset="100%" stopColor="#04060b" stopOpacity="1" />
            </radialGradient>
            
            <filter id="glow3D" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Map canvas background */}
          <rect width={WIDTH} height={HEIGHT} fill="url(#mapGlow3D)" rx="12" />

          {/* Layer plane guides (concourse rings projected in 3D) */}
          {zSeparation > 0 && (
            <g opacity="0.1" stroke="#00f2fe" strokeWidth="1" fill="none">
              {/* Level 0 guide ring */}
              <ellipse cx={CX} cy={CY} rx={40 * SCALE} ry={40 * SCALE * 0.7} />
              
              {/* Level 4.5 floating guide ring */}
              <ellipse cx={CX} cy={CY - 4.5 * zSeparation} rx={40 * SCALE} ry={40 * SCALE * 0.7} />
            </g>
          )}

          {/* Central Pitch (Z = 0) */}
          <g transform={`translate(${CX}, ${CY})`} opacity="0.15">
            <rect x="-35" y="-50" width="70" height="100" fill="transparent" stroke="#00f2fe" strokeWidth="1.5" />
            <line x1="-35" y1="0" x2="35" y2="0" stroke="#00f2fe" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="12" fill="transparent" stroke="#00f2fe" strokeWidth="1.5" />
          </g>

          {/* Draw Graph Edges */}
          <g opacity="0.5">
            {edges.map((edge, index) => {
              const uNode = nodes[edge.source];
              const vNode = nodes[edge.destination];
              if (!uNode || !vNode) return null;

              const cU = getCoords(uNode);
              const cV = getCoords(vNode);
              
              const isPath = pathEdges.has(`${edge.source}-${edge.destination}`);
              const isEdgeClosed = edge.status === 'closed' || closures.has(edge.source) || closures.has(edge.destination);
              
              // Vertical connecting lines (elevators / stairs)
              const isVerticalConnector = Math.abs(uNode.z - vNode.z) > 0.5;

              return (
                <line
                  key={`edge-${index}`}
                  x1={cU.cx}
                  y1={cU.cy}
                  x2={cV.cx}
                  y2={cV.cy}
                  stroke={isPath 
                    ? '#00f2fe' 
                    : isVerticalConnector
                      ? 'rgba(0, 242, 254, 0.25)'
                      : isEdgeClosed 
                        ? 'rgba(75, 85, 99, 0.25)' 
                        : 'rgba(255,255,255,0.07)'}
                  strokeWidth={isPath ? (isVerticalConnector ? 4.5 : 4) : isVerticalConnector ? 1.5 : 1.2}
                  strokeDasharray={isVerticalConnector ? '3,3' : edge.accessible === false ? '4,4' : 'none'}
                  style={isPath ? { filter: 'url(#glow3D)' } : {}}
                />
              );
            })}
          </g>

          {/* Draw Nodes */}
          <g>
            {Object.values(nodes).map((node) => {
              const { cx, cy } = getCoords(node);
              const color = getNodeColor(node.id, node.category);
              
              const isStart = selectedStart === node.id;
              const isEnd = selectedEnd === node.id;
              const isPathNode = pathNodes.includes(node.id);
              
              let radius = 6;
              let borderStroke = 'none';
              let borderStrokeWidth = 0;

              if (node.category === 'gate') {
                radius = 8.5;
              } else if (node.category === 'restroom' || node.category === 'food') {
                radius = 7;
              }

              if (isStart) {
                borderStroke = '#00f2fe';
                borderStrokeWidth = 3;
              } else if (isEnd) {
                borderStroke = '#f02fc2';
                borderStrokeWidth = 3;
              } else if (isPathNode) {
                borderStroke = '#ffffff';
                borderStrokeWidth = 1.5;
              }

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${cx}, ${cy})`}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.name || node.id} (${node.category}). ${
                    node.category === 'gate' ? `Wait time: ${gateWaits[node.id] || 0} minutes.` : ''
                  } Press enter to select.`}
                  onClick={() => {
                    if (onSelectNode) onSelectNode(node);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (onSelectNode) onSelectNode(node);
                    }
                  }}
                >
                  {/* Outer selection ring */}
                  {(isStart || isEnd) && (
                    <circle
                      cx="0"
                      cy="0"
                      r={radius + 4}
                      fill="transparent"
                      stroke={borderStroke}
                      strokeWidth={borderStrokeWidth}
                      style={{ filter: 'url(#glow3D)', animation: 'pulseGlow 2s infinite' }}
                    />
                  )}

                  {/* Core 3D Node sphere/dot */}
                  <circle
                    cx="0"
                    cy="0"
                    r={radius}
                    fill={color}
                    stroke={borderStrokeWidth > 0 && !isStart && !isEnd ? borderStroke : 'rgba(0,0,0,0.5)'}
                    strokeWidth={borderStrokeWidth > 0 && !isStart && !isEnd ? borderStrokeWidth : 1}
                  />

                  {/* Floating height reference line if Z > 0 and separation enabled */}
                  {zSeparation > 0 && node.z > 0 && (
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2={node.z * zSeparation}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                      style={{ pointerEvents: 'none' }}
                    />
                  )}

                  {/* Label */}
                  {(node.category === 'gate' || isStart || isEnd || ['food', 'restroom'].includes(node.category)) && (
                    <text
                      y={node.category === 'gate' ? -14 : -12}
                      textAnchor="middle"
                      fill={isStart || isEnd ? '#ffffff' : 'var(--text-muted)'}
                      fontSize="9px"
                      fontWeight={isStart || isEnd ? '700' : '400'}
                      style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'var(--font-heading)' }}
                    >
                      {(() => {
                        const baseName = node.name.split(' (')[0];
                        if (closures.has(node.id)) {
                          return `${baseName} (Closed)`;
                        }
                        if (node.category === 'gate') {
                          const wait = gateWaits[node.id];
                          return `${baseName} (${wait !== undefined ? wait : 5}m)`;
                        }
                        return baseName;
                      })()}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Compass labels */}
          <text x={CX} y={25} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="11px" fontWeight="700">N</text>
          <text x={WIDTH - 25} y={CY - 20} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="11px" fontWeight="700">E</text>
          <text x={CX} y={HEIGHT - 15} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="11px" fontWeight="700">S</text>
          <text x={25} y={CY - 20} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="11px" fontWeight="700">W</text>
        </svg>
      </div>
      
      {/* Footer Info details */}
      <div className="flex-between animate-fade-in" style={{ marginTop: '12px', fontSize: '13px', minHeight: '32px' }}>
        {selectedStart || selectedEnd ? (
          <div className="flex-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
            {selectedStart && (
              <span style={{ color: '#00f2fe' }}>
                🟢 <strong>{translate('start_node', language)}:</strong> {nodes[selectedStart]?.name.split(' (')[0]}
              </span>
            )}
            {selectedEnd && (
              <span style={{ color: '#f02fc2' }}>
                🔴 <strong>{translate('dest_node', language)}:</strong> {nodes[selectedEnd]?.name.split(' (')[0]}
              </span>
            )}
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>{translate('no_path', language)}</span>
        )}
      </div>
    </div>
  );
}
