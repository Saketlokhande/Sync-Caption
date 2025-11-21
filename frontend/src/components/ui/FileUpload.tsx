import React, { useCallback, useState } from 'react';
import { Upload, FileVideo, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
  accept?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onError,
  accept = "video/mp4", 
  className 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateVideoDuration = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        
        if (duration > 30) {
          onError?.(`Video is too long (${duration.toFixed(1)}s). Please upload a video 30 seconds or less.`);
          resolve(false);
        } else {
          resolve(true);
        }
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        onError?.('Failed to read video file. Please try a different file.');
        resolve(false);
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isValid = await validateVideoDuration(file);
      if (isValid) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect, onError]);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isValid = await validateVideoDuration(file);
      if (isValid) {
        setSelectedFile(file);
        onFileSelect(file);
      }
      // Clear the input so the same file can be selected again if needed
      e.target.value = '';
    }
  }, [onFileSelect, onError]);

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  return (
    <div className={cn("w-full", className)}>
      <label
        className={cn(
          "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out",
          dragActive
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          selectedFile ? "border-green-500/50 bg-green-500/5" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          {selectedFile ? (
            <>
              <div className="relative mb-4">
                <FileVideo className="w-16 h-16 text-green-500" />
                <button 
                  onClick={clearFile}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mb-2 text-lg font-semibold text-foreground">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <div className="p-4 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <p className="mb-2 text-xl font-semibold text-foreground">
                Drag & drop your video here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <div className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                MP4 • Max 30 seconds • Max 50MB
              </div>
            </>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept={accept} 
          onChange={handleChange} 
        />
      </label>
    </div>
  );
};
