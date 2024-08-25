import { Controller, Get, Post, Res, UploadedFile, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('load')
  async loadPdf(@Res() res: Response) {
    try {
      const pdfBytes = await this.pdfService.loadPdf();
      res.contentType('application/pdf');
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error('Error loading PDF:', error);
      res.status(error.getStatus()).send(error.message);
    }
  }

  @Post('save')
  @UseInterceptors(FileInterceptor('file'))
  async savePdf(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    try {
      if (!file || file.mimetype !== 'application/pdf') {
        throw new HttpException('Invalid file type', HttpStatus.BAD_REQUEST);
      }

      await this.pdfService.savePdf(file.buffer);
      res.status(200).json({ message: 'PDF saved successfully' });
    } catch (error) {
      console.error('Error saving PDF:', error);
      res.status(error.getStatus()).send(error.message);
    }
  }
}
