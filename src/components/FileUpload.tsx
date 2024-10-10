import React, { useState } from 'react';
import { Upload, Type } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onTextInput: (text: string) => void;
  darkMode: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, onTextInput, darkMode }) => {
  const [text, setText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onTextInput(text.trim());
    }
  };

  return (
    <div className="mb-6 flex flex-col items-center">
      <label htmlFor="file-upload" className={`cursor-pointer ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-2 px-4 rounded inline-flex items-center mb-4`}>
        <Upload className="mr-2" />
        <span>Upload EPUB, PDF, or TXT</span>
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".epub,.pdf,.txt"
        onChange={handleFileChange}
        className="hidden"
      />
      <form onSubmit={handleTextSubmit} className="flex flex-col items-center w-full max-w-md">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Or paste/type your text here"
          className={`border ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded px-4 py-2 w-full h-32 mb-2 resize-none`}
        />
        <button type="submit" className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-2 px-4 rounded inline-flex items-center`}>
          <Type className="mr-2" />
          <span>Use Text</span>
        </button>
      </form>
    </div>
  );
};

export default FileUpload;