import React, { useState, useCallback } from 'react';
import { useLocalization } from '../App';

interface FloatingActionBarProps {
    // Prompt
    prompt: string;
    onPromptChange: (value: string) => void;
    promptTextareaRef: React.RefObject<HTMLTextAreaElement>;

    // Actions
    onGenerate: () => void;
    onEnhancePrompt: () => void;
    onMagicPrompt: () => void;
    onGenerate3Prompts: () => void;

    // State
    isLoading: boolean;
    isEnhancing: boolean;
    hasReferences: boolean;
    hasGeneratedImages: boolean;

    // Controls
    aspectRatio: string;
    onAspectRatioChange: (ratio: string) => void;
    numImages: number;
    onNumImagesChange: (num: number) => void;
    seed: string;
    onSeedChange: (seed: string) => void;
    onRandomizeSeed: () => void;
    negativePrompt: string;
    onNegativePromptChange: (value: string) => void;

    // Dynamic Tools
    dynamicTools: any[];
    onGenerateTools: () => void;
    isToolsLoading: boolean;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
    prompt,
    onPromptChange,
    promptTextareaRef,
    onGenerate,
    onEnhancePrompt,
    onMagicPrompt,
    onGenerate3Prompts,
    isLoading,
    isEnhancing,
    hasReferences,
    hasGeneratedImages,
    aspectRatio,
    onAspectRatioChange,
    numImages,
    onNumImagesChange,
    seed,
    onSeedChange,
    onRandomizeSeed,
    negativePrompt,
    onNegativePromptChange,
    dynamicTools,
    onGenerateTools,
    isToolsLoading,
}) => {
    const { t } = useLocalization();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAspectMenu, setShowAspectMenu] = useState(false);
    const [showNumImagesMenu, setShowNumImagesMenu] = useState(false);
    const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);

    const aspectRatios = ["Auto", "1:1", "16:9", "9:16", "4:3", "3:4", "21:9"];
    const numImagesOptions = [1, 2, 3, 4];

    const handleExpandClick = useCallback(() => {
        setIsExpanded(true);
        setTimeout(() => promptTextareaRef.current?.focus(), 100);
    }, [promptTextareaRef]);

    return (
        <>
            {/* Advanced Panel Overlay (slide up from bottom) */}
            {showAdvancedPanel && (
                <div className="fixed bottom-20 left-0 right-0 lg:left-[280px] bg-light-surface/98 dark:bg-dark-surface/98 backdrop-blur-xl border-t border-light-border dark:border-dark-border rounded-t-2xl shadow-2xl z-40 p-6 max-h-[60vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-light-text dark:text-dark-text">{t.advancedSettings || 'Advanced Settings'}</h3>
                        <button
                            onClick={() => setShowAdvancedPanel(false)}
                            className="text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Negative Prompt */}
                    <div className="mb-4">
                        <label className="text-sm text-light-text-muted dark:text-dark-text-muted mb-2 block">{t.negativePrompt || 'Negative Prompt'}</label>
                        <input
                            type="text"
                            value={negativePrompt}
                            onChange={(e) => onNegativePromptChange(e.target.value)}
                            placeholder={t.negativePromptPlaceholder || "What to avoid..."}
                            className="w-full px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-lg text-light-text dark:text-dark-text focus:ring-2 focus:ring-brand-purple outline-none"
                        />
                    </div>

                    {/* Seed */}
                    <div className="mb-4">
                        <label className="text-sm text-light-text-muted dark:text-dark-text-muted mb-2 block">{t.seed || 'Seed'}</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={seed}
                                onChange={(e) => onSeedChange(e.target.value)}
                                placeholder={t.randomSeed || "Random"}
                                className="flex-1 px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-lg text-light-text dark:text-dark-text focus:ring-2 focus:ring-brand-purple outline-none"
                            />
                            <button
                                onClick={onRandomizeSeed}
                                className="px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                            >
                                🎲
                            </button>
                        </div>
                    </div>

                    {/* Professional Tools */}
                    {hasReferences && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm text-light-text-muted dark:text-dark-text-muted">{t.professionalTools || 'Professional Tools'}</label>
                                <button
                                    onClick={onGenerateTools}
                                    disabled={isToolsLoading}
                                    className="text-sm text-brand-purple hover:text-brand-pink transition-colors disabled:opacity-50"
                                >
                                    {isToolsLoading ? '⏳' : '🔄'} {t.generate || 'Generate'}
                                </button>
                            </div>
                            {dynamicTools.length > 0 ? (
                                <div className="text-sm text-light-text-muted dark:text-dark-text-muted">
                                    {dynamicTools.length} {t.toolsAvailable || 'tools available'}
                                </div>
                            ) : (
                                <div className="text-sm text-light-text-muted dark:text-dark-text-muted italic">
                                    {t.noToolsYet || 'Click generate to create professional tools'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Main Floating Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-xl border-t border-light-border dark:border-dark-border shadow-2xl z-50">
                {/* Compact Mode */}
                {!isExpanded && (
                    <div className="flex items-center gap-3 px-4 lg:px-6 py-3 lg:py-4">
                        {/* Prompt Preview (clickable to expand) */}
                        <button
                            onClick={handleExpandClick}
                            className="flex-1 text-left px-4 py-2.5 lg:py-3 bg-light-surface-accent dark:bg-dark-surface-accent rounded-xl text-sm text-light-text-muted dark:text-dark-text-muted truncate hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                        >
                            {prompt || t.promptPlaceholder || "Describe what you want to generate..."}
                        </button>

                        {/* Quick Pills */}
                        <div className="relative">
                            <button
                                onClick={() => setShowAspectMenu(!showAspectMenu)}
                                className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-light-surface-accent dark:bg-dark-surface-accent rounded-full text-sm text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                            >
                                <span>📐</span>
                                <span>{aspectRatio}</span>
                            </button>
                            {showAspectMenu && (
                                <div className="absolute bottom-full mb-2 right-0 bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl p-2 min-w-[120px] border border-light-border dark:border-dark-border">
                                    {aspectRatios.map(ratio => (
                                        <button
                                            key={ratio}
                                            onClick={() => {
                                                onAspectRatioChange(ratio);
                                                setShowAspectMenu(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors ${ratio === aspectRatio ? 'bg-brand-purple/20 text-brand-purple' : 'text-light-text dark:text-dark-text'}`}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowNumImagesMenu(!showNumImagesMenu)}
                                className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-light-surface-accent dark:bg-dark-surface-accent rounded-full text-sm text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                            >
                                <span>🖼️</span>
                                <span>{numImages}</span>
                            </button>
                            {showNumImagesMenu && (
                                <div className="absolute bottom-full mb-2 right-0 bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl p-2 min-w-[100px] border border-light-border dark:border-dark-border">
                                    {numImagesOptions.map(num => (
                                        <button
                                            key={num}
                                            onClick={() => {
                                                onNumImagesChange(num);
                                                setShowNumImagesMenu(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors ${num === numImages ? 'bg-brand-purple/20 text-brand-purple' : 'text-light-text dark:text-dark-text'}`}
                                        >
                                            {num} {num === 1 ? 'image' : 'images'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
                            className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-light-surface-accent dark:bg-dark-surface-accent rounded-full text-sm text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                        >
                            <span>⚙️</span>
                            <span className="hidden xl:inline">Advanced</span>
                        </button>

                        {/* Primary Action */}
                        <button
                            onClick={onGenerate}
                            disabled={isLoading}
                            className="px-6 lg:px-8 py-2.5 lg:py-3 bg-gradient-to-r from-brand-purple to-brand-pink rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {isLoading ? "⏳" : "⚡"} <span className="hidden sm:inline">{isLoading ? t.generating : t.generate}</span>
                        </button>
                    </div>
                )}

                {/* Expanded Mode */}
                {isExpanded && (
                    <div className="px-4 lg:px-6 py-4 lg:py-6 space-y-4">
                        {/* Prompt Textarea */}
                        <textarea
                            ref={promptTextareaRef}
                            value={prompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            rows={3}
                            placeholder={t.promptPlaceholder || "Describe what you want to generate..."}
                            className="w-full px-4 py-3 bg-light-surface-accent dark:bg-dark-surface-accent rounded-xl text-light-text dark:text-dark-text resize-none focus:ring-2 focus:ring-brand-purple outline-none"
                        />

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                            <button
                                onClick={onEnhancePrompt}
                                disabled={isEnhancing || !prompt}
                                className="px-3 lg:px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-lg text-sm hover:bg-light-border dark:hover:bg-dark-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ✨ {t.enhancePrompt || 'Enhance'}
                            </button>
                            <button
                                onClick={onMagicPrompt}
                                disabled={isEnhancing || !hasReferences}
                                className="px-3 lg:px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-lg text-sm hover:bg-light-border dark:hover:bg-dark-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🪄 {t.magicPrompt || 'Magic'}
                            </button>
                            <button
                                onClick={onGenerate3Prompts}
                                disabled={isEnhancing || !hasReferences}
                                className="px-3 lg:px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-lg text-sm hover:bg-light-border dark:hover:bg-dark-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                📝 {t.threePrompts || '3 Prompts'}
                            </button>

                            <div className="flex-1" />

                            {/* Collapse */}
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="px-3 lg:px-4 py-2 text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text"
                            >
                                ▼
                            </button>
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                            {/* Aspect Ratio */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowAspectMenu(!showAspectMenu)}
                                    className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-full text-sm text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                                >
                                    <span>📐</span>
                                    <span>{aspectRatio}</span>
                                </button>
                                {showAspectMenu && (
                                    <div className="absolute bottom-full mb-2 left-0 bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl p-2 min-w-[120px] border border-light-border dark:border-dark-border">
                                        {aspectRatios.map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => {
                                                    onAspectRatioChange(ratio);
                                                    setShowAspectMenu(false);
                                                }}
                                                className={`w-full px-4 py-2 text-left rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors ${ratio === aspectRatio ? 'bg-brand-purple/20 text-brand-purple' : 'text-light-text dark:text-dark-text'}`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Num Images */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNumImagesMenu(!showNumImagesMenu)}
                                    className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-full text-sm text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                                >
                                    <span>🖼️</span>
                                    <span>{numImages}</span>
                                </button>
                                {showNumImagesMenu && (
                                    <div className="absolute bottom-full mb-2 left-0 bg-light-surface dark:bg-dark-surface rounded-xl shadow-2xl p-2 min-w-[120px] border border-light-border dark:border-dark-border">
                                        {numImagesOptions.map(num => (
                                            <button
                                                key={num}
                                                onClick={() => {
                                                    onNumImagesChange(num);
                                                    setShowNumImagesMenu(false);
                                                }}
                                                className={`w-full px-4 py-2 text-left rounded-lg hover:bg-light-surface-accent dark:hover:bg-dark-surface-accent transition-colors ${num === numImages ? 'bg-brand-purple/20 text-brand-purple' : 'text-light-text dark:text-dark-text'}`}
                                            >
                                                {num} {num === 1 ? 'image' : 'images'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Seed Display */}
                            <button
                                onClick={() => setShowAdvancedPanel(true)}
                                className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-full text-sm text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                            >
                                <span>🎲</span>
                                <span className="hidden lg:inline">{seed || 'Random'}</span>
                            </button>

                            {/* Advanced */}
                            <button
                                onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
                                className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-light-surface-accent dark:bg-dark-surface-accent rounded-full text-sm text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                            >
                                <span>⚙️</span>
                                <span className="hidden lg:inline">Advanced</span>
                            </button>

                            <div className="flex-1" />

                            {/* Generate */}
                            <button
                                onClick={onGenerate}
                                disabled={isLoading}
                                className="px-6 lg:px-8 py-2.5 lg:py-3 bg-gradient-to-r from-brand-purple to-brand-pink rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "⏳ Generating..." : `⚡ ${t.generate || 'Generate'}`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default FloatingActionBar;
