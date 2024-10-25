import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Results: React.FC = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const url = params.get('url');

    const [performanceData, setPerformanceData] = useState<any>(null);
    const [aiSuggestions, setAiSuggestions] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchDataAndSuggestions = async () => {
            if (!url) return;

            try {
                setLoading(true);

                // Fetch performance data from Google PageSpeed Insights API
                const { data } = await axios.get(
                    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`
                );
                setPerformanceData(data);

                // Prepare performance data for OpenAI
                const performanceScore = data.lighthouseResult.categories.performance.score * 100;
                const performanceSummary = `
                    Performance Score: ${performanceScore.toFixed(2)}%
                    First Contentful Paint: ${data.lighthouseResult.audits['first-contentful-paint'].displayValue}
                    Speed Index: ${data.lighthouseResult.audits['speed-index'].displayValue}
                    Total Blocking Time: ${data.lighthouseResult.audits['total-blocking-time'].displayValue}
                    Largest Contentful Paint: ${data.lighthouseResult.audits['largest-contentful-paint'].displayValue}
                    Cumulative Layout Shift: ${data.lighthouseResult.audits['cumulative-layout-shift'].displayValue}
                `;

                // Get AI suggestions from OpenAI
                const openAiResponse = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: "gpt-3.5-turbo",
                        messages: [{
                            role: "system",
                            content: "You are a web performance expert. Provide specific suggestions to improve the website's performance score to 100%."
                        }, {
                            role: "user",
                            content: `Based on the following performance data, suggest specific improvements to achieve a 100% performance score: ${performanceSummary}`
                        }],
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                setAiSuggestions(openAiResponse.data.choices[0].message.content);
            } catch (err) {
                setError('Error fetching performance data or AI suggestions.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDataAndSuggestions();
    }, [url]);

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="p-8">
            <h1 className="text-xl font-bold mb-4">Performance Results for {url}</h1>
            {performanceData && performanceData.lighthouseResult && (
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">Performance Score: {(performanceData.lighthouseResult.categories.performance.score * 100).toFixed(2)}%</h2>
                    <p className="mt-2">First Contentful Paint: {performanceData.lighthouseResult.audits['first-contentful-paint'].displayValue}</p>
                    <p>Speed Index: {performanceData.lighthouseResult.audits['speed-index'].displayValue}</p>
                    <p>Total Blocking Time: {performanceData.lighthouseResult.audits['total-blocking-time'].displayValue}</p>
                    <p>Largest Contentful Paint: {performanceData.lighthouseResult.audits['largest-contentful-paint'].displayValue}</p>
                    <p>Cumulative Layout Shift: {performanceData.lighthouseResult.audits['cumulative-layout-shift'].displayValue}</p>
                </div>
            )}
            {aiSuggestions && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-2">AI Suggestions for Improvement</h2>
                    <div className="bg-gray-100 p-4 rounded">
                        <pre className="whitespace-pre-wrap">{aiSuggestions}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Results;