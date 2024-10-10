import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import SpeedReader from './components/SpeedReader';
import { Book } from 'epubjs';
import * as pdfjsLib from 'pdfjs-dist';
import { Sun, Moon } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setText('');

    try {
      if (file.type === 'application/epub+zip') {
        const arrayBuffer = await file.arrayBuffer();
        const book = new Book(arrayBuffer);
        await book.ready;
        let content = '';
        const spine = await book.loaded.spine;
        for (const item of spine.items) {
          const doc = await item.load(book.load.bind(book));
          content += ' ' + (doc.textContent || '');
        }
        setText(content.trim());
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const typedarray = new Uint8Array(arrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(' ');
          fullText += pageText + ' ';
        }
        setText(fullText.trim());
      } else if (file.type === 'text/plain') {
        const content = await file.text();
        setText(content);
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError(`An error occurred while processing the file: ${err.message}. Please try again with a different file.`);
    }
  };

  const handleTextInput = (inputText: string) => {
    setError(null);
    setText(inputText);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900 text-black dark:text-white flex flex-col items-center justify-center p-4 transition-colors duration-300`}>
      <h1 className="text-3xl font-bold mb-6">SBKOCT</h1>
      <div className="mb-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          {darkMode ? <Sun className="text-yellow-400" /> : <Moon />}
        </button>
      </div>
      <FileUpload onFileUpload={handleFileUpload} onTextInput={handleTextInput} darkMode={darkMode} />
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {text && <SpeedReader text={text} />}
    </div>
  );
}

export default App;