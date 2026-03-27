import React, { useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileText } from 'lucide-react';

interface UploadDataProps {
  onDataLoaded: (data: any[]) => void;
}

export const UploadData: React.FC<UploadDataProps> = ({ onDataLoaded }) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data.map((row: any) => {
          const cpu = typeof row.CPU_Avg === 'string' ? parseFloat(row.CPU_Avg.replace('%', '')) : row.CPU_Avg;
          const memory = typeof row.Memory_Avg === 'string' ? parseFloat(row.Memory_Avg.replace('%', '')) : row.Memory_Avg;
          const cost = typeof row.Cost === 'string' ? parseFloat(row.Cost.replace('$', '').replace(',', '')) : row.Cost;

          return {
            Instance_ID: row.Instance_ID || 'Unknown',
            Instance_Type: row.Instance_Type || 'Unknown',
            CPU_Avg: (cpu === null || isNaN(cpu)) ? 0 : cpu,
            Memory_Avg: (memory === null || isNaN(memory)) ? 0 : memory,
            Cost: (cost === null || isNaN(cost)) ? 0 : cost,
            Environment: row.Environment || 'Development',
            Critical: row.Critical || 'No',
            Application_Name: row.Application_Name || 'Unknown App',
          };
        }) as any[];
        
        onDataLoaded(parsedData);
      },
      error: (error) => {
        console.error('CSV Parsing Error:', error);
      }
    });
  }, [onDataLoaded]);

  return (
    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors cursor-pointer relative group">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-4 text-zinc-400 group-hover:text-zinc-200 transition-colors">
        <div className="p-4 rounded-full bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
          <Upload className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium">Upload Infrastructure Data</p>
          <p className="text-sm opacity-60">Drag and drop your CSV file here or click to browse</p>
        </div>
        <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs">
          <FileText className="w-4 h-4" />
          <span>Required columns: Instance_ID, Instance_Type, CPU_Avg, Memory_Avg, Cost</span>
        </div>
        <div className="flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs">
          <FileText className="w-4 h-4" />
          <span>Optional columns: Environment, Critical, Application_Name</span>
        </div>
      </div>
    </div>
  );
};
