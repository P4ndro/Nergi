export interface UploadedFile {
  success: boolean;
  fileName: string;
  fileSize: number;
  fileType: string;
  extractedText: string;
}

export async function uploadAndExtractFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadedFile> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Starting file extraction for:", file.name, "Type:", file.type);
      
      // Simulate progress
      if (onProgress) {
        onProgress(20);
        setTimeout(() => onProgress(50), 100);
        setTimeout(() => onProgress(100), 200);
      }

      let extractedText = "";
      const fileType = getFileTypeFromExtension(file.name);
      console.log("Detected file type:", fileType);

      // Handle text files (client-side parsing)
      if (fileType === 'text' || fileType === 'txt') {
        console.log("Reading text file...");
        extractedText = await file.text();
        console.log("Text extracted, length:", extractedText.length);
      }
      // Handle PDF files
      else if (fileType === 'pdf') {
        console.log("PDF file detected, attempting extraction...");
        try {
          const pdfjsLib = await import('pdfjs-dist');
          // Set the worker source using the correct CDN URL
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          
          console.log("Loading PDF document...");
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ 
            data: arrayBuffer,
            useWorkerFetch: false,
            isEvalSupported: false
          }).promise;
          
          console.log("PDF loaded, pages:", pdf.numPages);
          
          let text = "";
          const pagesToExtract = Math.min(pdf.numPages, 10); // Limit to first 10 pages
          
          for (let i = 1; i <= pagesToExtract; i++) {
            console.log(`Extracting page ${i}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            text += pageText + "\n";
            
            if (onProgress) {
              onProgress(20 + (i / pagesToExtract) * 60); // Progress from 20% to 80%
            }
          }
          
          extractedText = text.trim() || "Could not extract text from PDF. The PDF might be image-based or corrupted.";
          console.log("PDF extraction complete, text length:", extractedText.length);
        } catch (e) {
          console.error("PDF parsing error:", e);
          extractedText = "Could not extract text from PDF. Please upload a text file instead or check if the PDF is corrupted.";
        }
      }
      // Handle other file types as text
      else {
        console.log("Unknown file type, attempting to read as text...");
        try {
          extractedText = await file.text();
        } catch (e) {
          console.error("Failed to read file as text:", e);
          reject(new Error("Unsupported file type. Please upload a .txt or .pdf file."));
          return;
        }
      }

      console.log("File extraction complete");
      resolve({
        success: true,
        extractedText,
        fileName: file.name,
        fileSize: file.size,
        fileType
      });
    } catch (error: any) {
      console.error("File upload error:", error);
      reject(new Error(error.message || 'Failed to extract text from file'));
    }
  });
}

function getFileTypeFromExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['txt', 'text'].includes(ext || '')) return 'text';
  return 'text';
}

