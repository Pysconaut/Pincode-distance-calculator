import React, { useState, useCallback } from 'react';
import { getDrivingInfo } from './services/geminiService';
import type { DrivingInfo } from './types';

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const App: React.FC = () => {
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
                setError(err.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [originPinCode, destinationCity]);
    
    const handleClear = useCallback(() => {
        setOriginPinCode('');
        setDestinationCity('');
        setError(null);
        setResult(null);
        setDirectionsUrl(null);
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-lg bg-gray-800 text-white p-6 sm:p-8 rounded-xl shadow-2xl space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400">Pin Code Distance Calculator</h1>
                    <p className="text-gray-400 mt-2">Calculate driving distances across India.</p>
                </div>

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
            </div>
        </div>
    );
};

export default App;