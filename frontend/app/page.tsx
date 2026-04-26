'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/upload/ImageUpload';
import ParsedDataConfirm from '@/components/upload/ParsedDataConfirm';
import { scheduleAPI } from '@/lib/api';

export default function Home() {
  const [liveExtraction, setLiveExtraction] = useState<any | null>(null);
  const [equipmentLogs, setEquipmentLogs] = useState<any[]>([]);

  const loadLogs = async () => {
    try {
      const logs = await scheduleAPI.getEquipmentLogs();
      setEquipmentLogs(logs);
    } catch (error) {
      console.error("Failed to load equipment logs:", error);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleExtractionComplete = (data: any) => {
    setLiveExtraction(data);
    loadLogs();
  };

  // NEW: Function to handle the button click
  const handleClearData = async () => {
    if (window.confirm("Are you sure you want to clear the entire dashboard? This will wipe the database.")) {
      try {
        await scheduleAPI.clearEquipmentLogs();
        loadLogs(); // Reload the UI so it shows up empty instantly
      } catch (error) {
        console.error("Failed to clear logs:", error);
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-blue-900">MedEntry Asset Tracker</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Upload */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Snap & Sync</h2>
              <ImageUpload onExtractionComplete={handleExtractionComplete} />
            </div>

            {liveExtraction && liveExtraction.entries && liveExtraction.entries.length > 0 && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <ParsedDataConfirm 
                  data={{
                    equipmentId: liveExtraction.entries[0].equipment_name,
                    status: 'In Field',
                    location: liveExtraction.entries[0].location,
                    eta: '4 Hours'
                  }}
                  onConfirm={(finalData) => {
                     console.log("Saving verified data:", finalData);
                     setLiveExtraction(null); 
                  }}
                  onEdit={() => {}}
                />
              </div>
            )}
          </div>
          
          {/* Right Column: Dashboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            
            {/* NEW: Added the Clear Data button to the header flexbox */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Equipment Dashboard</h2>
                <button 
                  onClick={handleClearData}
                  className="text-sm font-medium text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                >
                  Clear Data
                </button>
            </div>

            <div className="h-[600px] overflow-y-auto pr-2 space-y-4">
              {equipmentLogs.length === 0 ? (
                 <p className="text-gray-500 text-center mt-10">No equipment currently tracked.</p>
              ) : (
                equipmentLogs.map((log) => (
                  <div key={log.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-800 text-lg">{log.equipment_name}</span>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">In Field</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm gap-2">
                       <span className="font-medium text-gray-700">Location:</span> {log.location}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm gap-2 mt-1">
                       <span className="font-medium text-gray-700">Signed out by:</span> {log.signed_out_by}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}