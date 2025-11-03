import React, { useState, useCallback, useEffect } from 'react';
import { getDrivingInfo } from './services/geminiService';
import type { DrivingInfo } from './types';
import FileUpload from './components/ui/file-upload';


// --- SHARED COMPONENTS ---

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface ViewProps {
    setKeyReady: (isReady: boolean) => void;
}

// --- SINGLE CALCULATOR VIEW ---

const SingleCalculatorView: React.FC<ViewProps> = ({ setKeyReady }) => {
    const [originPinCode, setOriginPinCode] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<DrivingInfo | null>(null);
    const [directionsUrl, setDirectionsUrl] = useState<string | null>(null);

    const handleCalculate = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsLoading(true);
        setError(null);
        setResult(null);
        setDirectionsUrl(null);

        if (!/^\d{6}$/.test(originPinCode)) {
            setError('Please enter a valid 6-digit pin code.');
            setIsLoading(false);
            return;
        }

        if (!destinationCity.trim()) {
            setError('Please enter a destination city or town.');
            setIsLoading(false);
            return;
        }

        try {
            const drivingInfo = await getDrivingInfo(originPinCode, destinationCity);
            
            setResult(drivingInfo);

            const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originPinCode + ', India')}&destination=${encodeURIComponent(destinationCity + ', India')}`;
            setDirectionsUrl(url);

        } catch (err) {
            if (err instanceof Error) {
                const message = err.message.toLowerCase();
                 if (message.includes('api key') || message.includes('requested entity was not found')) {
                    setKeyReady(false);
                    setError("API Key error. Please select a valid API key and try again.");
                } else {
                    setError(err.message);
                }
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [originPinCode, destinationCity, setKeyReady]);
    
    const handleClear = useCallback(() => {
        setOriginPinCode('');
        setDestinationCity('');
        setError(null);
        setResult(null);
        setDirectionsUrl(null);
    }, []);

    return (
        <>
            <form onSubmit={handleCalculate} className="space-y-4">
                <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-300 mb-1">
                        Origin Pin Code (e.g., 400001)
                    </label>
                    <input
                        id="pincode"
                        type="text"
                        value={originPinCode}
                        onChange={(e) => setOriginPinCode(e.target.value)}
                        placeholder="Enter 6-digit pin code"
                        maxLength={6}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
                        Destination City/Town (e.g., Pune)
                    </label>
                    <input
                        id="city"
                        type="text"
                        value={destinationCity}
                        onChange={(e) => setDestinationCity(e.target.value)}
                        placeholder="Enter city or town name"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                        disabled={isLoading}
                    />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-grow w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoadingSpinner /> : null}
                        {isLoading ? 'Calculating...' : 'Calculate Distance'}
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Clear
                    </button>
                </div>
            </form>

            <div className="pt-4 min-h-[6rem]">
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-center">
                        <p>{error}</p>
                    </div>
                )}
                {result && !error && (
                    <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-lg">
                        {directionsUrl && (
                            <div className="mb-4">
                                <a
                                    href={directionsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                                    aria-label={`Open map directions from ${originPinCode} to ${destinationCity} in a new tab`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-white">Map from {originPinCode} to {destinationCity}</span>
                                </a>
                            </div>
                        )}
                        <div className="text-left text-gray-300">
                            <p className="text-xl font-bold text-green-400">{result.travelTime}
                            <span className="text-gray-400 font-normal"> ({result.distance.toLocaleString('en-IN')} km)</span></p>
                            <p className="text-sm mt-1">{result.routeSummary}</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};


// --- BULK CALCULATOR VIEW ---

interface BulkResultRow extends DrivingInfo {
    "Origin Pin Code": string;
    "Destination City": string;
}

interface BulkError {
    row: number;
    origin: string;
    destination: string;
    message: string;
}

/**
 * Basic CSV line parser that respects double quotes for field content.
 * Does NOT handle escaped quotes within a field ("field with ""quote""").
 */
const parseCsvLine = (line: string): string[] => {
    const matches = line.match(/(".*?"|[^",\r\n]+)(?=\s*,|\s*$)/g) || [];
    return matches.map(field => field.replace(/^"|"$/g, '').trim());
};


const BulkCalculatorView: React.FC<ViewProps> = ({ setKeyReady }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ processed: 0, total: 0 });
    const [results, setResults] = useState<BulkResultRow[]>([]);
    const [errors, setErrors] = useState<BulkError[]>([]);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const sampleCsvUrl = "data:text/csv;charset=utf-8,Origin Pin Code,Destination City%0A400001,Pune%0A110001,Jaipur";

    const handleFileSelect = (uploadedFile: File) => {
        if (uploadedFile.type !== 'text/csv' && !uploadedFile.name.endsWith('.csv')) {
            setGeneralError('Invalid file type. Please upload a .csv file.');
            setFile(null);
            return;
        }
        setFile(uploadedFile);
        setGeneralError(null);
        setResults([]);
        setErrors([]);
    };

    const handleBulkCalculate = async () => {
        if (!file) return;

        setIsProcessing(true);
        setResults([]);
        setErrors([]);
        setGeneralError(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) {
                    throw new Error("CSV file is empty or contains only a header.");
                }

                const header = parseCsvLine(lines[0]);
                const originIndex = header.findIndex(h => h.toLowerCase() === 'origin pin code');
                const destIndex = header.findIndex(h => h.toLowerCase() === 'destination city');

                if (originIndex === -1 || destIndex === -1) {
                    throw new Error("Invalid CSV headers. Please use 'Origin Pin Code' and 'Destination City'.");
                }
                
                const dataRows = lines.slice(1);
                setProgress({ processed: 0, total: dataRows.length });

                const newResults: BulkResultRow[] = [];
                const newErrors: BulkError[] = [];

                for (let i = 0; i < dataRows.length; i++) {
                    const row = parseCsvLine(dataRows[i]);
                    const origin = row[originIndex]?.trim();
                    const destination = row[destIndex]?.trim();
                    const rowIndex = i + 2; // CSV rows are 1-indexed, +1 for header

                    if (!origin || !destination) {
                        newErrors.push({ row: rowIndex, origin: origin || '', destination: destination || '', message: 'Missing origin or destination.' });
                        setProgress(p => ({ ...p, processed: p.processed + 1 }));
                        continue;
                    }

                    try {
                        const drivingInfo = await getDrivingInfo(origin, destination);
                        newResults.push({
                            "Origin Pin Code": origin,
                            "Destination City": destination,
                            ...drivingInfo
                        });
                    } catch (err) {
                        if (err instanceof Error) {
                            const message = err.message.toLowerCase();
                            if (message.includes('api key') || message.includes('requested entity was not found')) {
                                setKeyReady(false);
                                throw new Error("API Key error during bulk processing. Please select a valid API key and try again.");
                            }
                             newErrors.push({ row: rowIndex, origin, destination, message: err.message });
                        } else {
                            newErrors.push({ row: rowIndex, origin, destination, message: 'Unknown error' });
                        }
                    }
                    setProgress(p => ({ ...p, processed: p.processed + 1 }));
                }

                setResults(newResults);
                setErrors(newErrors);

            } catch (err) {
                 if (err instanceof Error) {
                    setGeneralError(err.message);
                } else {
                    setGeneralError('An unexpected error occurred while processing the file.');
                }
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsText(file);
    };

    const handleDownload = () => {
        const headers = ['Origin Pin Code', 'Destination City', 'Distance (km)', 'Travel Time', 'Route Summary'];
        const csvRows = [headers.join(',')];

        results.forEach(row => {
            const values = [
                `"${row['Origin Pin Code']}"`,
                `"${row['Destination City']}"`,
                row.distance,
                `"${row.travelTime}"`,
                `"${row.routeSummary.replace(/"/g, '""')}"` // Escape double quotes
            ];
            csvRows.push(values.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'distance_results.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleClear = () => {
        setFile(null);
        setResults([]);
        setErrors([]);
        setGeneralError(null);
        setIsProcessing(false);
        setProgress({ processed: 0, total: 0 });
    };

    return (
        <div className="space-y-4">
             <div className="text-center text-sm text-gray-400 p-4 bg-gray-900/50 rounded-lg">
                <p>Upload a CSV file with columns: <code className="text-cyan-400 font-mono">Origin Pin Code</code> and <code className="text-cyan-400 font-mono">Destination City</code>.</p>
                <a href={sampleCsvUrl} download="sample_template.csv" className="text-cyan-500 hover:underline mt-1 inline-block">
                    Download Template
                </a>
            </div>

            <FileUpload 
                file={file}
                onFileSelect={handleFileSelect}
                disabled={isProcessing}
            />
            
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 pt-2">
                <button
                    onClick={handleBulkCalculate}
                    disabled={!file || isProcessing}
                    className="flex-grow w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? <LoadingSpinner /> : null}
                    {isProcessing ? `Processing... (${progress.processed}/${progress.total})` : 'Calculate Distances'}
                </button>
                 <button
                    type="button"
                    onClick={handleClear}
                    disabled={isProcessing}
                    className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Clear
                </button>
            </div>

            {isProcessing && (
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-cyan-600 h-2.5 rounded-full" style={{ width: `${progress.total > 0 ? (progress.processed / progress.total) * 100 : 0}%` }}></div>
                </div>
            )}

            <div className="pt-4 min-h-[6rem]">
                 {generalError && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-center">
                        <p>{generalError}</p>
                    </div>
                )}
                {results.length > 0 && !isProcessing && (
                     <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-lg text-center">
                        <p className="text-green-400 font-bold">Processing complete!</p>
                        <p className="text-gray-300">{results.length} rows calculated successfully.</p>
                        <button onClick={handleDownload} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition">
                            Download Results
                        </button>
                    </div>
                )}
                {errors.length > 0 && !isProcessing && (
                    <div className="mt-4">
                        <h3 className="text-red-400 font-semibold mb-2 text-center">Failed Rows ({errors.length})</h3>
                        <div className="max-h-40 overflow-y-auto bg-gray-900/50 p-3 rounded-lg text-sm space-y-2">
                           {errors.map((err, index) => (
                               <div key={index} className="p-2 bg-red-900/30 rounded">
                                   <p className="font-mono text-red-300">Row {err.row}: {err.origin} to {err.destination}</p>
                                   <p className="text-red-400 ml-2"> &rarr; {err.message}</p>
                               </div>
                           ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

type Mode = 'single' | 'bulk';

const App: React.FC = () => {
    const [mode, setMode] = useState<Mode>('single');
    const [isKeyReady, setIsKeyReady] = useState(false);

    useEffect(() => {
        // Poll for the aistudio object, as it might be loaded asynchronously.
        const aistudioReadyCheck = (retries = 5) => {
          if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            window.aistudio.hasSelectedApiKey().then(setIsKeyReady);
          } else if (retries > 0) {
            setTimeout(() => aistudioReadyCheck(retries - 1), 200);
          }
        };
        aistudioReadyCheck();
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Per guidelines, assume success to avoid race conditions.
            setIsKeyReady(true);
        }
    };

    if (!isKeyReady) {
        return (
            <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans">
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg bg-gray-800 text-white p-6 sm:p-8 rounded-xl shadow-2xl text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400">API Key Required</h1>
                    <p className="text-gray-400 mt-2 mb-6">Please select a Google AI API key to continue.</p>
                    <button 
                        onClick={handleSelectKey}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition duration-300"
                    >
                        Select API Key
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                        Ensure the Gemini API is enabled for your key. 
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline ml-1">
                            Learn about billing
                        </a>.
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-lg bg-gray-800 text-white p-6 sm:p-8 rounded-xl shadow-2xl space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400">Pin Code Distance Calculator</h1>
                    <p className="text-gray-400 mt-2">Calculate driving distances across India.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-gray-900/50 p-1 rounded-lg">
                    <button 
                        onClick={() => setMode('single')}
                        className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${mode === 'single' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                        Single Calculation
                    </button>
                    <button 
                        onClick={() => setMode('bulk')}
                        className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${mode === 'bulk' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                        Bulk Calculation
                    </button>
                </div>

                {mode === 'single' ? <SingleCalculatorView setKeyReady={setIsKeyReady} /> : <BulkCalculatorView setKeyReady={setIsKeyReady} />}
            </div>
        </div>
    );
};

export default App;