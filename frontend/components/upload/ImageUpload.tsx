'use client';

import { useState, useRef } from 'react';
import { scheduleAPI, api } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ImageUpload({ onExtractionComplete }: { onExtractionComplete?: (data: any) => void }) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [savedFiles, setSavedFiles] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [selectedForExtract, setSelectedForExtract] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

const handleSave = async () => {
    if (!image) return;
    setIsSaving(true);
    try {
      const response = await scheduleAPI.uploadImage(image);
      setImage(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await handleViewFiles();
      setShowFiles(true);
      
      // ADD THIS LINE: Pass the model_output up to the Dashboard!
      if (onExtractionComplete && response.model_output) {
         onExtractionComplete(response.model_output);
      }
      
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewFiles = async () => {
    try {
      const response = await api.get('/files');
      setSavedFiles(response.data);
    } catch (err) {
      console.error('Failed to fetch files:', err);
    }
  };

  const toggleFiles = async () => {
    if (showFiles) {
      setShowFiles(false);
    } else {
      await handleViewFiles();
      setShowFiles(true);
    }
  };

  const toggleSelectForExtract = (id: number) => {
    setSelectedForExtract((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
        ) : (
          <div className="space-y-2">
            <p className="text-blue-600 font-medium">Click to upload an image</p>
            <p className="text-gray-400 text-sm">PNG, JPG, JPEG supported</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      {image && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      )}

      {/* Toggle + Extract Row */}
      <div className="flex gap-3">
        <button
          onClick={toggleFiles}
          className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {showFiles ? 'Hide Saved Files' : 'View Saved Files'}
        </button>
        {selectedForExtract.length > 0 && (
          <button
            onClick={() => alert('AI extraction coming soon!')}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors"
          >
            Extract ({selectedForExtract.length})
          </button>
        )}
      </div>

      {/* Saved Files Grid */}
      {showFiles && savedFiles.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Check images to select for extraction</p>
          <div className="grid grid-cols-2 gap-3">
            {savedFiles.map((file) => {
              const isSelected = selectedForExtract.includes(file.id);
              return (
                <div
                  key={file.id}
                  className={`bg-white border-2 rounded-lg overflow-hidden shadow-sm transition-all ${
                    isSelected ? 'border-purple-500 shadow-purple-200 shadow-md' : 'border-gray-200'
                  }`}
                >
                  {/* Checkbox row */}
                  <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-100">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectForExtract(file.id)}
                      className="w-4 h-4 accent-purple-500 cursor-pointer"
                    />
                    <p className="text-xs text-gray-600 truncate">{file.filename}</p>
                  </div>

                  {/* Image */}
                  <img
                    src={`${API_URL}/uploads/${file.filename}`}
                    alt={file.filename}
                    className="w-full h-40 object-cover cursor-pointer"
                    onClick={() => setSelectedFile(file)}
                  />

                  <div className="p-2">
                    <p className="text-xs text-gray-400">{new Date(file.uploaded_at).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showFiles && savedFiles.length === 0 && (
        <p className="text-center text-gray-400 text-sm">No files saved yet.</p>
      )}

      {/* Image Modal */}
      {selectedFile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="bg-white rounded-xl overflow-hidden max-w-2xl w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`${API_URL}/uploads/${selectedFile.filename}`}
              alt={selectedFile.filename}
              className="w-full max-h-96 object-contain"
            />
            <div className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{selectedFile.filename}</p>
                <p className="text-sm text-gray-400">{new Date(selectedFile.uploaded_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}