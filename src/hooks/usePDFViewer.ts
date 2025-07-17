import { useState, useCallback } from 'react';
import { pdfjs } from 'react-pdf';

// Set up PDF.js worker with local worker file
const setupPDFWorker = () => {
  try {
    // Use local worker file from public directory
    pdfjs.GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.mjs';
    
    // Enable verbose logging for debugging
    pdfjs.GlobalWorkerOptions.verbosity = pdfjs.VerbosityLevel.WARNINGS;
  } catch (error) {
    console.error('Failed to set up PDF.js worker:', error);
  }
};

// Initialize worker
setupPDFWorker();

interface UsePDFViewerProps {
  file: File | null;
}

export const usePDFViewer = ({ file }: UsePDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setError('Failed to load PDF document');
    setIsLoading(false);
    console.error('PDF load error:', error);
  }, []);

  const goToPage = useCallback((page: number) => {
    if (numPages && page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  }, [numPages]);

  const nextPage = useCallback(() => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(prev => prev + 1);
    }
  }, [numPages, pageNumber]);

  const prevPage = useCallback(() => {
    if (pageNumber > 1) {
      setPageNumber(prev => prev - 1);
    }
  }, [pageNumber]);

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  return {
    numPages,
    pageNumber,
    scale,
    isLoading,
    error,
    onDocumentLoadSuccess,
    onDocumentLoadError,
    goToPage,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
    resetZoom,
    canGoNext: numPages ? pageNumber < numPages : false,
    canGoPrev: pageNumber > 1
  };
};