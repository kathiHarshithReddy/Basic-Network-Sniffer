/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Square, Activity, Trash2, Shield, Network, PieChart as PieChartIcon, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, LineChart, Line } from 'recharts';
import { Packet } from './types';

function generateMockPacket(id: number): Packet {
  const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'ICMP', 'DNS'];
  const protocol = protocols[Math.floor(Math.random() * protocols.length)];
  const sourceIps = ['192.168.1.105', '10.0.0.4', '172.16.0.50', '192.168.1.1', '10.10.10.10'];
  const destIps = ['8.8.8.8', '1.1.1.1', '104.21.55.20', '142.250.190.46', '192.168.1.255'];
  const payloads = [
    'GET / HTTP/1.1',
    'Application Data',
    'Echo Request (ping)',
    'Standard query A example.com',
    'Client Hello',
    'ACK, PSH',
    'SYN',
  ];

  return {
    id: `pkt-${id}`,
    timestamp: new Date().toISOString().split('T')[1].slice(0, -2), // Get HH:mm:ss.ms
    sourceIp: sourceIps[Math.floor(Math.random() * sourceIps.length)],
    destinationIp: destIps[Math.floor(Math.random() * destIps.length)],
    protocol: protocol,
    payloadInfo: payloads[Math.floor(Math.random() * payloads.length)],
    size: Math.floor(Math.random() * 1500) + 40,
  };
}

const getProtocolColor = (protocol: string) => {
  switch (protocol) {
    case 'TCP': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'UDP': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'HTTP': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'HTTPS': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'ICMP': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'DNS': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

export default function App() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const packetIdRef = useRef(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCapturing) {
      interval = setInterval(() => {
        setPackets((prev) => {
          const newPacket = generateMockPacket(packetIdRef.current++);
          const nextPackets = [newPacket, ...prev];
          if (nextPackets.length > 100) return nextPackets.slice(0, 100);
          return nextPackets;
        });
      }, 600); // Simulate incoming packets every 600ms
    }
    return () => clearInterval(interval);
  }, [isCapturing]);

  const toggleCapture = () => setIsCapturing(!isCapturing);
  const clearCapture = () => {
    setPackets([]);
    packetIdRef.current = 0;
  };

  const exportData = (format: 'json' | 'csv') => {
    if (packets.length === 0) return;
    
    let content = '';
    let type = '';
    let extension = '';

    if (format === 'json') {
      content = JSON.stringify(packets, null, 2);
      type = 'application/json';
      extension = 'json';
    } else if (format === 'csv') {
      const headers = ['ID', 'Timestamp', 'Source IP', 'Destination IP', 'Protocol', 'Size', 'Payload'];
      const rows = packets.map(p => [
        p.id, 
        p.timestamp, 
        p.sourceIp, 
        p.destinationIp, 
        p.protocol, 
        p.size, 
        `"${p.payloadInfo.replace(/"/g, '""')}"`
      ].join(','));
      content = [headers.join(','), ...rows].join('\n');
      type = 'text/csv';
      extension = 'csv';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `capture-${new Date().toISOString().slice(0, 10)}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const protocolStats = useMemo(() => {
    const stats: Record<string, number> = {};
    packets.forEach(p => {
      stats[p.protocol] = (stats[p.protocol] || 0) + 1;
    });
    
    // Sort and format for Recharts
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [packets]);

  const timeStats = useMemo(() => {
    const statsMap = new Map<string, number>();
    const reversed = [...packets].reverse();
    
    reversed.forEach(p => {
      const timeSec = p.timestamp.split('.')[0]; // HH:mm:ss
      statsMap.set(timeSec, (statsMap.get(timeSec) || 0) + 1);
    });
    
    // Sort chronologically and take last 60 items
    return Array.from(statsMap.entries())
      .map(([time, count]) => ({ time, count }))
      .slice(-60);
  }, [packets]);

  const COLORS = {
    TCP: '#3b82f6', // blue-500
    UDP: '#a855f7', // purple-500
    HTTP: '#22c55e', // green-500
    HTTPS: '#10b981', // emerald-500
    ICMP: '#f97316', // orange-500
    DNS: '#6366f1', // indigo-500
    Other: '#6b7280' // gray-500
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-300 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Network className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Network Sniffer</h1>
              <p className="text-sm text-slate-500 font-mono">wlan0 interface • promiscuous mode</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-lg border border-slate-800 font-mono text-sm">
              <Activity className="w-4 h-4 text-slate-400" />
              <span>Packets: {packets.length}</span>
            </div>
            
            <button
              onClick={toggleCapture}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                isCapturing 
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 border border-blue-500'
              }`}
            >
              {isCapturing ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  Stop Capture
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Start Capture
                </>
              )}
            </button>

            <div className="flex items-center rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
              <button
                onClick={() => exportData('csv')}
                disabled={packets.length === 0}
                className="flex items-center gap-2 px-3 py-2.5 font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-r border-slate-700 text-sm"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                 onClick={() => exportData('json')}
                 disabled={packets.length === 0}
                 className="flex items-center px-3 py-2.5 font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                 JSON
              </button>
            </div>

            <button
              onClick={clearCapture}
              disabled={packets.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </header>

        {/* Dashboard and Data Table */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Summary Dashboard */}
          <div className="lg:col-span-1 bg-slate-900/50 rounded-2xl border border-slate-800 p-5 flex flex-col overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 shrink-0">
               <PieChartIcon className="w-5 h-5 text-slate-400"/> Protocol Distribution
            </h2>
            <div className="w-full relative min-h-[180px] shrink-0">
              {packets.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                  No data to display
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={protocolStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {protocolStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {/* Volume Chart */}
            <h2 className="text-lg font-semibold text-white mt-6 mb-4 flex items-center gap-2 shrink-0">
               <Activity className="w-5 h-5 text-slate-400"/> Traffic Volume
            </h2>
            <div className="w-full relative h-[120px] shrink-0">
              {timeStats.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                  Waiting for data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeStats}>
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="Packets/sec"
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={false} 
                      isAnimationActive={false} 
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
                      itemStyle={{ color: '#e2e8f0' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {packets.length > 0 && (
               <div className="mt-6 pt-4 border-t border-slate-800/50 space-y-2 shrink-0">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">Total Packets</span>
                   <span className="text-slate-200 font-mono">{packets.length}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">Unique Protocols</span>
                   <span className="text-slate-200 font-mono">{protocolStats.length}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">Total Data (approx)</span>
                   <span className="text-slate-200 font-mono">
                     {(packets.reduce((acc, p) => acc + p.size, 0) / 1024).toFixed(2)} KB
                   </span>
                 </div>
               </div>
            )}
          </div>

          {/* Data Table */}
          <div className="lg:col-span-3 bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full">
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-900 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider sticky top-0">
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Source IP</div>
              <div className="col-span-2">Destination</div>
              <div className="col-span-2">Protocol</div>
              <div className="col-span-1">Length</div>
              <div className="col-span-3">Info / Payload</div>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-1">
            <AnimatePresence initial={false}>
              {packets.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-48 text-slate-500 gap-3"
                >
                  <Shield className="w-8 h-8 opacity-50" />
                  <p>No packets captured yet. Click Start to begin listening.</p>
                </motion.div>
              ) : (
                packets.map((packet) => (
                  <motion.div
                    key={packet.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-12 gap-4 p-3 bg-slate-950/50 hover:bg-slate-800/80 rounded-lg border border-slate-800/50 text-sm font-mono items-center transition-colors group cursor-pointer"
                  >
                    <div className="col-span-2 text-slate-500">{packet.timestamp}</div>
                    <div className="col-span-2 text-slate-300">{packet.sourceIp}</div>
                    <div className="col-span-2 text-slate-300">{packet.destinationIp}</div>
                    <div className="col-span-2">
                      <span className={`px-2 py-0.5 rounded text-xs border ${getProtocolColor(packet.protocol)}`}>
                        {packet.protocol}
                      </span>
                    </div>
                    <div className="col-span-1 text-slate-500">{packet.size}</div>
                    <div className="col-span-3 text-slate-400 truncate group-hover:text-slate-200 transition-colors">
                      {packet.payloadInfo}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
        </div>

      </div>
    </div>
  );
}
