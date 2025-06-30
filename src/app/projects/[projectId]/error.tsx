'use client';

import { useEffect, useState } from 'react';
import {
    AlertTriangleIcon,
    RefreshCwIcon,
    HomeIcon,
    WifiOffIcon,
    ServerCrashIcon,
    ShieldXIcon,
    ZapOffIcon,
    DatabaseIcon,
    ClockIcon,
    HelpCircleIcon
} from 'lucide-react';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

const getErrorType = (error: Error) => {
    const message = error.message?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
        return 'network';
    }
    if (message.includes('timeout') || message.includes('504') || stack.includes('timeout')) {
        return 'timeout';
    }
    if (message.includes('server') || message.includes('500') || message.includes('502') || message.includes('503')) {
        return 'server';
    }
    if (message.includes('auth') || message.includes('401') || message.includes('403') || message.includes('unauthorized')) {
        return 'auth';
    }
    if (message.includes('database') || message.includes('prisma') || message.includes('sql')) {
        return 'database';
    }
    if (message.includes('chunk') || message.includes('loading') || stack.includes('chunk')) {
        return 'chunk';
    }
    return 'generic';
};

const errorConfig = {
    network: {
        icon: WifiOffIcon,
        title: 'Connection Problem',
        description: 'Unable to connect to our servers. Please check your internet connection and try again.',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10'
    },
    timeout: {
        icon: ClockIcon,
        title: 'Request Timeout',
        description: 'The request took too long to complete. Our servers might be busy right now.',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10'
    },
    server: {
        icon: ServerCrashIcon,
        title: 'Server Error',
        description: 'Our servers are experiencing issues. We\'re working to fix this as quickly as possible.',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10'
    },
    auth: {
        icon: ShieldXIcon,
        title: 'Access Denied',
        description: 'You don\'t have permission to access this resource. Please sign in or contact support.',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
    },
    database: {
        icon: DatabaseIcon,
        title: 'Database Error',
        description: 'We\'re having trouble accessing our database. Please try again in a moment.',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    chunk: {
        icon: ZapOffIcon,
        title: 'Loading Error',
        description: 'Failed to load application resources. This might be a temporary issue.',
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10'
    },
    generic: {
        icon: AlertTriangleIcon,
        title: 'Something went wrong',
        description: 'An unexpected error occurred. Our team has been notified and is working on a fix.',
        color: 'text-destructive',
        bgColor: 'bg-destructive/10'
    }
};

export default function ErrorPage({ error, reset }: ErrorProps) {
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [timeToRetry, setTimeToRetry] = useState(0);

    const errorType = getErrorType(error);
    const config = errorConfig[errorType];
    const ErrorIcon = config.icon;

    useEffect(() => {
        if (errorType === 'network' || errorType === 'timeout') {
            const timer = setTimeout(() => {
                if (retryCount < 3) {
                    handleRetry();
                }
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, retryCount, errorType]);

    useEffect(() => {
        if (timeToRetry > 0) {
            const timer = setTimeout(() => setTimeToRetry(timeToRetry - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeToRetry]);

    useEffect(() => {
        console.error('Application Error:', {
            message: error.message,
            stack: error.stack,
            digest: error.digest,
            type: errorType,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    }, [error, errorType]);

    const handleRetry = async () => {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            reset();
        } catch (retryError) {
            console.error('Retry failed:', retryError);
        } finally {
            setIsRetrying(false);
        }
    };

    const handleGoHome = () => {
        if (typeof window !== 'undefined') {
            sessionStorage.clear();
            localStorage.removeItem('error-state');
        }
        window.location.href = '/';
    };

    return (
        <main className="h-full">
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>

                <div className="relative max-w-lg w-full">
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-2xl p-8 dark:bg-gray-900/80 dark:border-gray-700">
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <div className={`w-24 h-24 ${config.bgColor} rounded-full flex items-center justify-center`}>
                                    <ErrorIcon className={`w-12 h-12 ${config.color}`} />
                                </div>
                                <div className={`absolute inset-0 w-24 h-24 ${config.bgColor} rounded-full animate-ping opacity-50`} />
                            </div>
                        </div>

                        <div className="text-center space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                    {config.title}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                    {config.description}
                                </p>
                            </div>

                            {timeToRetry > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                                        Auto-retry in {timeToRetry} seconds...
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">Error Type</div>
                                    <div className="text-gray-600 dark:text-gray-400 capitalize">{errorType}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">Attempts</div>
                                    <div className="text-gray-600 dark:text-gray-400">{retryCount}/3</div>
                                </div>
                            </div>

                            {error.digest && (
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Error ID</div>
                                    {error.digest}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 mt-8">
                            <button
                                onClick={handleRetry}
                                disabled={isRetrying || retryCount >= 3}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                <RefreshCwIcon className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
                                {isRetrying ? 'Retrying...' : retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
                            </button>

                            <button
                                onClick={handleGoHome}
                                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                <HomeIcon className="w-4 h-4" />
                                Go Home
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <HelpCircleIcon className="w-4 h-4" />
                                <span>Need immediate help?</span>
                                <a
                                    href="https://status.yourapp.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    Check Status
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-8">
                        <div className="flex space-x-2">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse"
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}