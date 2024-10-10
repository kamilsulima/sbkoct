# SBKOCT - Speed Reading App

SBKOCT (abbreviation for Polish "szybko-czyt" meaning speed-reader) is an advanced speed reading application built with React and TypeScript. It offers a modern, customizable interface for improving reading speed and comprehension.

## Features

- Support for multiple file formats: EPUB (WIP...), PDF, TXT and text input
- Adjustable reading speed (60-1000 WPM)
- Customizable font size and focus point
- Multiple display modes: single word, multiple words, and full sentence
- Progress tracking and average speed calculation
- Dark mode support
- Focus mode for distraction-free reading
- Keyboard shortcuts for easy navigation and control

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- epub.js
- pdf.js
- Lucide React icons

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sbkoct.git
   cd sbkoct
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Upload an EPUB, PDF, or TXT file, or paste text directly into the input area.
2. Use the play/pause button or spacebar to start/stop reading.
3. Adjust the speed, font size, and other settings as needed.
4. Use arrow keys for navigation: left/right to move between words, up/down to change speed.
5. Press 'F' to toggle focus mode.

## Building for Production

To create a production build, run:

```
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.