import React, { useState, useCallback, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { 
  Upload, 
  Download, 
  FileText, 
  X, 
  AlertCircle, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Progress } from './components/ui/progress';
import { Alert, AlertDescription } from './components/ui/alert';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Checkbox } from './components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { pdfProcessor } from './utils/pdfProcessor';
import { usePDFViewer } from './hooks/usePDFViewer';
import { FormField } from './types/FormField';

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    numPages,
    pageNumber,
    scale,
    isLoading: isPDFLoading,
    error: pdfError,
    onDocumentLoadSuccess,
    onDocumentLoadError,
    goToPage,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
    resetZoom,
    canGoNext,
    canGoPrev
  } = usePDFViewer({ file: pdfFile });

  const handleFileUpload = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setError('');
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Load the PDF
      const loadResult = await pdfProcessor.loadPDF(file);
      setProgress(30);
      
      if (!loadResult.success) {
        setError(loadResult.error || 'Failed to load PDF');
        setIsProcessing(false);
        return;
      }

      // Extract form fields
      const fields = pdfProcessor.extractFormFields();
      setProgress(70);
      
      setPdfFile(file);
      setFormFields(fields);
      setProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
      }, 300);
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError('Failed to process PDF');
      setIsProcessing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const updateFieldValue = useCallback((fieldId: string, value: string | boolean) => {
    setFormFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, value } : field
    ));
  }, []);

  const downloadFilledPDF = useCallback(async () => {
    if (!pdfFile || formFields.length === 0) return;

    setIsGeneratingPDF(true);
    
    try {
      // Fill the form fields
      const fillResult = await pdfProcessor.fillFormFields(formFields);
      
      if (!fillResult.success) {
        setError(fillResult.error || 'Failed to fill form fields');
        setIsGeneratingPDF(false);
        return;
      }

      // Generate the filled PDF
      const pdfResult = await pdfProcessor.generateFilledPDF();
      
      if (!pdfResult.success || !pdfResult.pdfBytes) {
        setError(pdfResult.error || 'Failed to generate PDF');
        setIsGeneratingPDF(false);
        return;
      }

      // Download the filled PDF
      const blob = new Blob([pdfResult.pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filled_${pdfFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating filled PDF:', error);
      setError('Failed to generate filled PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [pdfFile, formFields]);

  const resetForm = useCallback(() => {
    setPdfFile(null);
    setFormFields([]);
    setSelectedField(null);
    setProgress(0);
    setError('');
    pdfProcessor.cleanup();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const renderFormField = useCallback((field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={field.value as string}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className="notion-focus"
          />
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={field.value as boolean}
              onCheckedChange={(checked) => updateFieldValue(field.id, checked)}
            />
            <span className="text-sm text-muted-foreground">
              Check to confirm
            </span>
          </div>
        );
      
      case 'radio':
        return (
          <RadioGroup
            value={field.value as string}
            onValueChange={(value) => updateFieldValue(field.id, value)}
          >
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Field type "{field.type}" not supported yet
          </div>
        );
    }
  }, [updateFieldValue]);

  const completedFields = formFields.filter(field => {
    if (field.type === 'checkbox') return field.value as boolean;
    if (field.type === 'radio') return field.value;
    return (field.value as string).length > 0;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">PDF Form Filler</h1>
            </div>
            {pdfFile && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  className="notion-transition hover:bg-secondary"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={downloadFilledPDF}
                  disabled={formFields.length === 0 || isGeneratingPDF}
                  className="notion-transition bg-accent hover:bg-accent/90"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isGeneratingPDF ? 'Generating...' : 'Download'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!pdfFile ? (
          /* Upload Section */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4">
                Fill PDF Forms Locally
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Upload any PDF with form fields, fill them out, and download the completed document. 
                All processing happens in your browser - no data leaves your device.
              </p>
            </div>

            <Card className="p-8 sm:p-12 border-2 border-dashed border-border hover:border-accent/50 notion-transition">
              <div
                className="text-center cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-accent/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Drop your PDF here
                </h3>
                <p className="text-muted-foreground mb-6">
                  or click to browse files
                </p>
                <Button className="notion-transition bg-accent hover:bg-accent/90">
                  Choose PDF File
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
            </Card>

            {(error || pdfError) && (
              <Alert className="mt-6 border-destructive/20 bg-destructive/5">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error || pdfError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          /* PDF Viewer and Form Editor */
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* PDF Viewer */}
            <div className="xl:col-span-3">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-foreground">
                    {pdfFile.name}
                  </h3>
                  {isProcessing && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground">
                        Processing...
                      </span>
                      <div className="w-32">
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* PDF Controls */}
                {numPages && (
                  <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevPage}
                        disabled={!canGoPrev}
                        className="notion-transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium">
                        Page {pageNumber} of {numPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextPage}
                        disabled={!canGoNext}
                        className="notion-transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomOut}
                        className="notion-transition"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[4rem] text-center">
                        {Math.round(scale * 100)}%
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomIn}
                        className="notion-transition"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetZoom}
                        className="notion-transition"
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="relative bg-muted/30 rounded-lg overflow-hidden min-h-[600px] flex items-center justify-center">
                  <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="w-8 h-8 mx-auto mb-4 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
                          <p className="text-sm text-muted-foreground">Loading PDF...</p>
                        </div>
                      </div>
                    }
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      scale={scale}
                      className="border border-border/50 shadow-lg"
                    />
                  </Document>
                </div>
              </Card>
            </div>

            {/* Form Fields Panel */}
            <div className="xl:col-span-1">
              <Card className="p-6 sticky top-24">
                <h3 className="text-lg font-medium text-foreground mb-6">
                  Form Fields
                </h3>
                
                {formFields.length === 0 ? (
                  <div className="text-center py-8">
                    {isProcessing ? (
                      <div>
                        <div className="w-8 h-8 mx-auto mb-4 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
                        <p className="text-sm text-muted-foreground">
                          Extracting form fields...
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          No form fields detected in this PDF
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formFields.map((field) => (
                      <div
                        key={field.id}
                        className={`p-4 rounded-lg border notion-transition cursor-pointer ${
                          selectedField === field.id
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-accent/50'
                        }`}
                        onClick={() => setSelectedField(field.id)}
                      >
                        <Label className="block text-sm font-medium text-foreground mb-2">
                          {field.label}
                        </Label>
                        
                        {renderFormField(field)}
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Fields completed:
                        </span>
                        <span className="font-medium text-foreground">
                          {completedFields.length} / {formFields.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;