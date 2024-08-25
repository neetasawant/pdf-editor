import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class PdfService {
  private readonly uploadsDir = join(__dirname, '..', '..', 'uploads');

  constructor() {
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async loadPdf(): Promise<Uint8Array> {
    try {
      const filePath = join(this.uploadsDir, 'example.pdf');
      if (!existsSync(filePath)) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      const fileBuffer = readFileSync(filePath);
      const pdfDoc = await PDFDocument.load(fileBuffer);
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new HttpException('Error loading PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async savePdf(fileBuffer: Buffer): Promise<void> {
    try {
      if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
        throw new HttpException('Invalid file', HttpStatus.BAD_REQUEST);
      }

      const filePath = join(this.uploadsDir, 'filled-example.pdf');
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pdfBytes = await pdfDoc.save();
      writeFileSync(filePath, pdfBytes);
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw new HttpException('Error saving PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
