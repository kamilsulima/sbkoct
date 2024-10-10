import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize, Minimize } from 'lucide-react';

interface SpeedReaderProps {
  text: string;
}

const SpeedReader: React.FC<SpeedReaderProps> = ({ text }) => {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [fontSize, setFontSize] = useState(48);
  const [focusPoint, setFocusPoint] = useState(0.5);
  const [wordsRead, setWordsRead] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [displayMode, setDisplayMode] = useState<'single' | 'multi' | 'sentence'>('single');
  const [maxWordLength, setMaxWordLength] = useState(10);
  const [focusMode, setFocusMode] = useState(false);
  const [showFocusModeIcon, setShowFocusModeIcon] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const focusModeIconTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const processedWords = text.split(/\s+/).map(word => {
      if (word.length > maxWordLength) {
        const chunks = [];
        for (let i = 0; i < word.length; i += maxWordLength) {
          chunks.push(word.slice(i, i + maxWordLength));
        }
        return chunks;
      }
      return word;
    }).flat();
    setWords(processedWords);
  }, [text, maxWordLength]);

  const nextWord = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % words.length;
      setWordsRead((prev) => prev + 1);
      return newIndex;
    });
  }, [words.length]);

  const prevWord = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + words.length) % words.length);
  }, [words.length]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
    if (!isPlaying) {
      startTimeRef.current = Date.now();
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          prevWord();
          break;
        case 'ArrowRight':
          nextWord();
          break;
        case 'ArrowUp':
          setSpeed(s => Math.min(s + 10, 1000));
          break;
        case 'ArrowDown':
          setSpeed(s => Math.max(s - 10, 60));
          break;
        case 'f':
          setFocusMode(!focusMode);
          break;
        case 'Escape':
          if (focusMode) {
            setFocusMode(false);
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextWord, prevWord, focusMode, togglePlay]);

  useEffect(() => {
    if (isPlaying) {
      const wordInterval = 60000 / speed;
      intervalRef.current = window.setInterval(() => {
        const currentWord = words[currentIndex];
        const pauseDuration = '.!?'.includes(currentWord.slice(-1)) ? wordInterval * 2 : 
                              ',;:'.includes(currentWord.slice(-1)) ? wordInterval * 1.5 : 
                              wordInterval;
        nextWord();
        setTimeout(() => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = window.setInterval(nextWord, wordInterval);
        }, pauseDuration);
      }, wordInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, nextWord, words, currentIndex]);

  useEffect(() => {
    if (startTimeRef.current && wordsRead > 0) {
      const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000;
      setAverageSpeed(Math.round(wordsRead / elapsedMinutes));
    }
  }, [wordsRead]);

  const getContent = useCallback(() => {
    switch (displayMode) {
      case 'single':
        return words[currentIndex] || '';
      case 'multi':
        return words.slice(currentIndex, currentIndex + 3).join(' ');
      case 'sentence':
        let sentence = '';
        for (let i = currentIndex; i < words.length; i++) {
          sentence += words[i] + ' ';
          if ('.!?'.includes(words[i].slice(-1))) break;
        }
        return sentence.trim();
    }
  }, [words, currentIndex, displayMode]);

  const content = getContent();

  const renderWord = () => {
    const focusIndex = Math.floor(content.length * focusPoint);
    const before = content.slice(0, focusIndex);
    const focus = content[focusIndex] || '';
    const after = content.slice(focusIndex + 1);
    return (
      <div style={{ fontSize: `${fontSize}px` }} className="text-current">
        <span>{before}</span>
        <span className="text-red-500">{focus}</span>
        <span>{after}</span>
      </div>
    );
  };

  const progress = (currentIndex / words.length) * 100;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedProgress = (x / rect.width) * 100;
      const newIndex = Math.floor((clickedProgress / 100) * words.length);
      setCurrentIndex(newIndex);
      setWordsRead(newIndex);
    }
  };

  const focusModeContent = (
    <div 
      className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center"
      onMouseMove={() => {
        setShowFocusModeIcon(true);
        if (focusModeIconTimeoutRef.current) {
          clearTimeout(focusModeIconTimeoutRef.current);
        }
        focusModeIconTimeoutRef.current = window.setTimeout(() => {
          setShowFocusModeIcon(false);
        }, 2000);
      }}
    >
      <div className="text-center">
        {renderWord()}
        {showFocusModeIcon && (
          <button onClick={() => setFocusMode(false)} className="mt-4 p-2 bg-gray-200 dark:bg-gray-700 rounded">
            <Minimize />
          </button>
        )}
      </div>
    </div>
  );

  const regularContent = (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 text-black dark:text-white shadow-md rounded px-4 sm:px-6 md:px-8 pt-6 pb-8 mb-4">
      <div className="mb-4 font-bold text-center h-20 flex items-center justify-center">
        {renderWord()}
      </div>
      <div 
        ref={progressBarRef}
        className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-4 cursor-pointer"
        onClick={handleProgressBarClick}
      >
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-center space-x-4 mb-4">
        <button onClick={prevWord} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-current">
          <ChevronLeft />
        </button>
        <button onClick={togglePlay} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-current">
          {isPlaying ? <Pause /> : <Play />}
        </button>
        <button onClick={nextWord} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-current">
          <ChevronRight />
        </button>
        <button onClick={() => setFocusMode(true)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-current">
          <Maximize />
        </button>
      </div>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="speed">Speed (WPM):</label>
          <input
            type="range"
            id="speed"
            min="60"
            max="1000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full"
          />
          <span>{speed}</span>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="fontSize">Font Size:</label>
          <input
            type="range"
            id="fontSize"
            min="12"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full"
          />
          <span>{fontSize}px</span>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="focusPoint">Focus Point:</label>
          <input
            type="range"
            id="focusPoint"
            min="0"
            max="1"
            step="0.1"
            value={focusPoint}
            onChange={(e) => setFocusPoint(Number(e.target.value))}
            className="w-full"
          />
          <span>{focusPoint}</span>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="maxWordLength">Max Word Length:</label>
          <input
            type="range"
            id="maxWordLength"
            min="5"
            max="20"
            value={maxWordLength}
            onChange={(e) => setMaxWordLength(Number(e.target.value))}
            className="w-full"
          />
          <span>{maxWordLength}</span>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="displayMode">Display Mode:</label>
          <select
            id="displayMode"
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value as 'single' | 'multi' | 'sentence')}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-black dark:text-white"
          >
            <option value="single">Single Word</option>
            <option value="multi">Multiple Words</option>
            <option value="sentence">Full Sentence</option>
          </select>
        </div>
      </div>
      <div className="mt-4 text-sm">
        <p>Progress: {progress.toFixed(1)}%</p>
        <p>Words Read: {wordsRead}</p>
        <p>Average Speed: {averageSpeed} WPM</p>
      </div>
    </div>
  );

  return focusMode ? focusModeContent : regularContent;
};

export default SpeedReader;