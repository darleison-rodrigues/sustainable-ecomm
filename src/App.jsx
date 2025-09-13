import React, { useState, useEffect } from 'react';
import { Globe, Leaf, Search, ExternalLink, BarChart3, Zap, Sparkles } from 'lucide-react';
import { co2 } from '@tgwf/co2';

const oneByte = new co2({ model: "1byte" });
const swd = new co2({ model: "swd" });

const predefinedSites = {
    SKIN: [
        { name: 'ELF Cosmetics', url: 'https://www.elfcosmetics.com/' },
        { name: 'Biotherm', url: 'https://www.biotherm.ca/' },
        { name: 'IT Cosmetics', url: 'https://itcosmetics.ca' }
    ],
    HAIR: [
        { name: 'Kérastase', url: 'https://www.kerastase.ca/' },
        { name: 'Pantene', url: 'https://pantene.ca/en-ca' },
        { name: 'Garnier', url: 'https://www.garnier.ca/' },
        { name: 'Herbal Essences', url: 'https://herbalessences.com/en-us/' }
    ]
};

export default function App() {
    const [currentUrl, setCurrentUrl] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeCategory, setActiveCategory] = useState('SKIN');
    const [rankings, setRankings] = useState([]);
    const [selectedModel, setSelectedModel] = useState('oneByte');
    const [messageBox, setMessageBox] = useState({ visible: false, text: '' });
    const [tipsLoading, setTipsLoading] = useState(false);
    const [ecoTips, setEcoTips] = useState('');

    const analyzeWebsite = async (url) => {
        if (!url) return;

        setLoading(true);
        setError('');
        setEcoTips(''); // Reset tips on new analysis

        try {
            // Simulate fetching website data
            const response = await simulateFetchWebsite(url);

            const totalBytes = response.size;
            const isGreenHosting = Math.random() > 0.6; // Random for demo

            // Calculate CO2 emissions using both models from the library
            const oneByteEmissions = oneByte.perByte(totalBytes, isGreenHosting, { 
                gridRegion: 'CAN',
                dataReloadRatio: 0.02,  // 2% cache hit for returning visitors
                firstVisitPercentage: 0.75 // 75% first-time visitors
            });
            const swdEmissions = swd.perByte(totalBytes, isGreenHosting, { 
                gridRegion: 'CAN',
                dataReloadRatio: 0.02,  // 2% cache hit for returning visitors
                firstVisitPercentage: 0.75 // 75% first-time visitors
            });

            const result = {
                url: url,
                totalBytes: totalBytes,
                oneByteEmissions: oneByteEmissions,
                swdEmissions: swdEmissions,
                isGreenHosting: isGreenHosting,
                requests: response.requests,
                loadTime: response.loadTime,
                oneByteGrade: calculateGrade(oneByteEmissions),
                swdGrade: calculateGrade(swdEmissions)
            };

            setAnalysisResult(result);
        } catch (err) {
            setError('Failed to analyze website. Please check the URL and try again.');
        } finally {
            setLoading(false);
        }
    };

    const simulateFetchWebsite = async (url) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate realistic mock data
        const baseSize = 500000 + Math.random() * 2000000; // 0.5-2.5MB
        return {
            size: Math.round(baseSize),
            requests: Math.round(20 + Math.random() * 80),
            loadTime: Math.round(1000 + Math.random() * 3000)
        };
    };
    
    const generateEcoTips = async () => {
        if (!analysisResult) return;

        setTipsLoading(true);
        setEcoTips('');

        const prompt = `You are a web sustainability consultant. Your goal is to provide concise, actionable tips to improve a website's carbon footprint. Focus on practical advice for developers and designers. Respond with a short, friendly introduction followed by a bulleted list of tips.
            A website was analyzed with the following metrics:
            - Page size: ${formatBytes(analysisResult.totalBytes)}
            - Requests: ${analysisResult.requests}
            - Load time: ${analysisResult.loadTime}ms
            - OneByte Grade: ${analysisResult.oneByteGrade}
            - Green Hosting: ${analysisResult.isGreenHosting ? 'Yes' : 'No'}

            Based on these metrics, what are 3-5 specific, actionable tips to reduce its carbon footprint? Focus on things like image optimization, code minification, and caching.`;

        try {
            const response = await fetch('/api/eco-tip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                throw new Error('API call failed');
            }

            const result = await response.json();
            const text = result?.response;
            setEcoTips(text || 'Could not generate tips. Please try again.');
        } catch (err) {
            console.error('API Error:', err);
            setEcoTips('Failed to get eco-tips. Please try again later.');
        } finally {
            setTipsLoading(false);
        }
    };

    const calculateGrade = (emissions) => {
        if (emissions < 0.5) return 'A+';
        if (emissions < 1.0) return 'A';
        if (emissions < 2.0) return 'B';
        if (emissions < 3.0) return 'C';
        if (emissions < 4.0) return 'D';
        return 'F';
    };

    const getGradeColor = (grade) => {
        const colors = {
            'A+': 'text-green-600',
            'A': 'text-green-500',
            'B': 'text-yellow-500',
            'C': 'text-orange-500',
            'D': 'text-red-500',
            'F': 'text-red-600'
        };
        return colors[grade] || 'text-gray-500';
    };

    const getRankingColor = (position) => {
        switch (position) {
            case 1:
                return 'bg-green-700';
            case 2:
                return 'bg-green-600';
            case 3:
                return 'bg-green-500';
            case 4:
                return 'bg-green-400';
            case 5:
                return 'bg-green-300';
            case 6:
                return 'bg-green-200';
            case 7:
                return 'bg-green-100';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };

    const analyzeAllSites = async () => {
        const allSites = [...predefinedSites.SKIN, ...predefinedSites.HAIR];
        const results = [];

        for (const site of allSites) {
            try {
                const response = await simulateFetchWebsite(site.url);
                const totalBytes = response.size;
                const isGreenHosting = Math.random() > 0.6;

                const oneByteEmissions = oneByte.perByte(totalBytes, isGreenHosting);
                const swdEmissions = swd.perByte(totalBytes, isGreenHosting);

                results.push({
                    ...site,
                    oneByteEmissions: oneByteEmissions,
                    swdEmissions: swdEmissions,
                    oneByteGrade: calculateGrade(oneByteEmissions),
                    swdGrade: calculateGrade(swdEmissions),
                    totalBytes: totalBytes,
                    isGreenHosting: isGreenHosting
                });
            } catch (err) {
                console.error(`Failed to analyze ${site.name}`);
            }
        }

        results.sort((a, b) => a.oneByteEmissions - b.oneByteEmissions);
        setRankings(results);
    };

    useEffect(() => {
        analyzeAllSites();
    }, []);

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatEmissions = (grams) => {
        if (grams < 0.001) return `${(grams * 1000000).toFixed(2)} μg CO₂`;
        if (grams < 1) return `${(grams * 1000).toFixed(2)} mg CO₂`;
        if (grams < 1000) return `${grams.toFixed(2)} g CO₂`;
        return `${(grams / 1000).toFixed(2)} kg CO₂`;
    };
    
    const showMessageBox = (text) => {
      setMessageBox({ visible: true, text });
    };

    const closeMessageBox = () => {
      setMessageBox({ ...messageBox, visible: false });
    };

    const handleAnalyzeClick = () => {
        const urlRegex = /^(http|https):\/\/[^ "]+$/;
        if (!currentUrl) {
            showMessageBox('Please enter a website URL to analyze.');
            return;
        }
        if (!urlRegex.test(currentUrl)) {
            showMessageBox('Please enter a valid URL, starting with http:// or https://');
            return;
        }
        analyzeWebsite(currentUrl);
    };

    return (
        <div className="min-h-screen font-sans bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-green-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-600 rounded-lg">
                                <Leaf className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Sustainable Ecomm</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                                {Object.keys(predefinedSites).map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeCategory === category
                                            ? 'bg-white text-green-600 shadow-sm'
                                            : 'text-gray-600 hover:text-green-600'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>

                            <div className="flex space-x-1 bg-blue-100 rounded-lg p-1">
                                <button
                                    onClick={() => setSelectedModel('oneByte')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${selectedModel === 'oneByte'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-blue-600'
                                        }`}
                                >
                                    OneByte
                                </button>
                                <button
                                    onClick={() => setSelectedModel('swd')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${selectedModel === 'swd'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-blue-600'
                                        }`}
                                >
                                    SWD
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* URL Analyzer */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
                            <div className="flex items-center space-x-3 mb-6">
                                <Globe className="h-6 w-6 text-green-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Analyze Website</h2>
                            </div>

                            <div className="flex space-x-3 mb-6">
                                <input
                                    type="url"
                                    value={currentUrl}
                                    onChange={(e) => setCurrentUrl(e.target.value)}
                                    placeholder="Enter website URL (e.g., https://example.com)"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                                <button
                                    onClick={handleAnalyzeClick}
                                    disabled={loading || !currentUrl}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Search className="w-5 h-5" />
                                    )}
                                    <span>{loading ? 'Analyzing...' : 'Analyze'}</span>
                                </button>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <p className="text-red-600">{error}</p>
                                </div>
                            )}

                            {analysisResult && (
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 mb-1">OneByte</div>
                                                <span className={`text-2xl font-bold ${getGradeColor(analysisResult.oneByteGrade)}`}>
                                                    {analysisResult.oneByteGrade}
                                                </span>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 mb-1">SWD</div>
                                                <span className={`text-2xl font-bold ${getGradeColor(analysisResult.swdGrade)}`}>
                                                    {analysisResult.swdGrade}
                                                </span>
                                            </div>
                                            {analysisResult.isGreenHosting && (
                                                <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                                                    <Leaf className="w-4 h-4 text-green-600" />
                                                    <span className="text-xs font-medium text-green-600">Green Hosting</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Zap className="w-4 h-4 text-orange-500" />
                                                <span className="text-sm font-medium text-gray-600">OneByte CO₂</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">
                                                {formatEmissions(analysisResult.oneByteEmissions)}
                                            </p>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Zap className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm font-medium text-gray-600">SWD CO₂</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">
                                                {formatEmissions(analysisResult.swdEmissions)}
                                            </p>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <BarChart3 className="w-4 h-4 text-purple-500" />
                                                <span className="text-sm font-medium text-gray-600">Page Size</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">
                                                {formatBytes(analysisResult.totalBytes)}
                                            </p>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Globe className="w-4 h-4 text-green-500" />
                                                <span className="text-sm font-medium text-gray-600">Requests</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">
                                                {analysisResult.requests}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <p className="mb-1">
                                            <strong>URL:</strong> <a href={analysisResult.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{analysisResult.url}</a>
                                        </p>
                                        <p className="mb-1">
                                            <strong>Load Time:</strong> {analysisResult.loadTime}ms
                                        </p>
                                        <p>
                                            <strong>Model Comparison:</strong> OneByte: {formatEmissions(analysisResult.oneByteEmissions)} vs SWD: {formatEmissions(analysisResult.swdEmissions)}
                                        </p>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            onClick={generateEcoTips}
                                            disabled={tipsLoading}
                                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                                        >
                                            {tipsLoading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Sparkles className="w-5 h-5" />
                                            )}
                                            <span>{tipsLoading ? 'Generating Tips...' : 'Get Eco-Tips ✨'}</span>
                                        </button>
                                    </div>

                                    {ecoTips && (
                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-700">
                                            {ecoTips.split('\n').map((line, index) => (
                                                <p key={index} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: line }} />
                                            ))}
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>
                    </div>

                    {/* Site Rankings */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {activeCategory} Sites Ranking
                                </h3>
                                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {selectedModel === 'oneByte' ? 'OneByte Model' : 'SWD Model'}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {predefinedSites[activeCategory].map((site) => {
                                    const ranking = rankings.find(r => r.url === site.url);
                                    if (!ranking) return null;
                                    
                                    const currentEmissions = selectedModel === 'oneByte' ? ranking?.oneByteEmissions : ranking?.swdEmissions;
                                    const currentGrade = selectedModel === 'oneByte' ? ranking?.oneByteGrade : ranking?.swdGrade;

                                    const sortedRankings = [...rankings].sort((a, b) => {
                                        const aEmissions = selectedModel === 'oneByte' ? a.oneByteEmissions : a.swdEmissions;
                                        const bEmissions = selectedModel === 'oneByte' ? b.oneByteEmissions : b.swdEmissions;
                                        return aEmissions - bEmissions;
                                    });
                                    const position = sortedRankings.findIndex(r => r.url === site.url) + 1;

                                    return (
                                        <div
                                            key={site.url}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                            onClick={() => {
                                                setCurrentUrl(site.url);
                                                handleAnalyzeClick();
                                            }}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankingColor(position)} ${position > 3 ? 'text-gray-800' : 'text-white'}`}>
                                                    {position || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{site.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatEmissions(currentEmissions)} • Grade {currentGrade}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {ranking.isGreenHosting && (
                                                    <Leaf className="w-4 h-4 text-green-500" />
                                                )}
                                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Leaf className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">CO₂ Models</span>
                                </div>
                                <p className="text-xs text-green-700 mb-2">
                                    <strong>OneByte:</strong> Simplified model using a fixed ratio of emissions per megabyte.
                                </p>
                                <p className="text-xs text-green-700">
                                    <strong>SWD:</strong> An alternative model with a different calculation based on kilobits.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {messageBox.visible && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                        <p className="text-lg font-medium text-gray-800 text-center">{messageBox.text}</p>
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={closeMessageBox}
                                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}