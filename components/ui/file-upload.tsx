import React, { useState, useRef, useCallback } from 'react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    file: File | null;
    disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, file, disabled = false }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (!disabled) {
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                onFileSelect(files[0]);
            }
        }
    }, [disabled, onFileSelect]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files[0]);
        }
        // Reset input value to allow re-uploading the same file
        if (e.target) {
            e.target.value = '';
        }
    };

    const handleClick = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    return (
        <div
            className={`w-full p-6 bg-gray-700 border-2 border-dashed rounded-md text-center transition-colors duration-200
                ${isDragging ? 'border-cyan-500 bg-gray-600' : 'border-gray-600'}
                ${!disabled ? 'cursor-pointer hover:border-cyan-500' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
            role="button"
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
        >
            <input
                ref={inputRef}
                id="csv-upload"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 15v-6m-3 3l3-3 3 3" />
                </svg>
                {file ? (
                     <>
                        <p className="font-semibold text-white">{file.name}</p>
                        <p className="text-xs text-gray-400 mt-1">Click or drag a new file to replace</p>
                    </>
                ) : (
                     <>
                        <p className="font-semibold text-white">Drag & drop CSV file here</p>
                        <p className="text-sm text-gray-400">or click to select file</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default FileUpload;