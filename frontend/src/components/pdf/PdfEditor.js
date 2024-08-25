import React, { useState } from 'react';
import axios from 'axios';
import * as PDFJS from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.0.279/pdf.worker.min.js';

function PdfEditor() {
  const [pdfUrl, setPdfUrl] = useState('');

  const loadPdf = async () => {
    try {
      const response = await axios.get('http://localhost:5000/pdf/load', { responseType: 'arraybuffer' });
      const pdfBytes = response.data;
      const pdfDoc = await PDFDocument.load(pdfBytes);

      const modifiedPdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };

  const savePdf = async () => {
    try {
      if (!pdfUrl) {
        alert('No PDF loaded to save.');
        return;
      }

      const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
      const pdfBytes = response.data;

      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      const pdfData = new Uint8Array(pdfBytes);
      const pdf = await PDFJS.getDocument({ data: pdfData }).promise;
      
      const formFields = [];
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const annotations = await page.getAnnotations();
        
        annotations.forEach((annotation) => {
          if (annotation.fieldName) {
            formFields.push({
              fieldName: annotation.fieldName,
              value: annotation.fieldValue || "",
              fieldType: annotation.fieldType,
            });
          }
        });
      }
      console.log('Extracted Form Fields:', formFields);

      const modifiedPdfBytes = await pdfDoc.save();

      const formData = new FormData();
      formData.append('file', new Blob([modifiedPdfBytes], { type: 'application/pdf' }), 'filled.pdf');

      await axios.post('http://localhost:5000/pdf/save', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('PDF saved successfully!');
      setPdfUrl(''); 
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error saving PDF. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', boxSizing: 'border-box', width: '100%', height: '100vh' }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={loadPdf}
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Load PDF
        </button>
        <button
          onClick={savePdf}
          disabled={!pdfUrl}
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: pdfUrl ? 'pointer' : 'not-allowed',
            fontSize: '16px',
          }}
        >
          Save PDF
        </button>
      </div>
    
      {pdfUrl && (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <embed
            src={pdfUrl}
            type="application/pdf"
            style={{
              width: '80%',
              height: '100%',
              border: '1px solid #ddd',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default PdfEditor;
