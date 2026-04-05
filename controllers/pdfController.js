import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import muhammara from 'muhammara';
import { PDFParse } from 'pdf-parse';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export const getHealth = (req, res) => {
  let muhammaraTest = false;
  try {
    muhammaraTest = typeof muhammara !== 'undefined' && typeof muhammara.recrypt === 'function';
  } catch (e) {
    console.error('Muhammara test failed:', e);
  }
  res.json({
    status: 'ok',
    muhammara: muhammaraTest,
    pdfLib: typeof PDFDocument !== 'undefined',
    pdfParse: typeof PDFParse !== 'undefined'
  });
};

export const getIndex = (req, res) => {
  console.log('Libraries check:', {
    muhammara: typeof muhammara !== 'undefined',
    pdfLib: typeof PDFDocument !== 'undefined',
    pdfParse: typeof PDFParse !== 'undefined'
  });
  const tools = [
    {
      id: 'merge',
      title: 'Gộp PDF',
      subtitle: 'Kết hợp nhiều tệp PDF thành một tệp duy nhất một cách dễ dàng.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>`,
      color: 'bg-red-100',
      textColor: 'text-red-600',
      hoverBg: 'group-hover:bg-red-100',
      hoverText: 'group-hover:text-red-600'
    },
    {
      id: 'split',
      title: 'Tách PDF',
      subtitle: 'Tách một tệp PDF thành nhiều tệp nhỏ hơn hoặc trích xuất các trang.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scissors"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><circle cx="6" cy="18" r="3"/><path d="M9.88 14.88 20 4"/><path d="m20 20-5-5"/></svg>`,
      color: 'bg-blue-100',
      textColor: 'text-blue-600',
      hoverBg: 'group-hover:bg-blue-100',
      hoverText: 'group-hover:text-blue-600'
    },
    {
      id: 'compress',
      title: 'Nén PDF',
      subtitle: 'Giảm kích thước tệp PDF của bạn mà không làm giảm chất lượng.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize-2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
      color: 'bg-green-100',
      textColor: 'text-green-600',
      hoverBg: 'group-hover:bg-green-100',
      hoverText: 'group-hover:text-green-600'
    },
    {
      id: 'lock',
      title: 'Khóa PDF',
      subtitle: 'Bảo vệ tệp PDF của bạn bằng mật khẩu mạnh mẽ.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
      color: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      hoverBg: 'group-hover:bg-indigo-100',
      hoverText: 'group-hover:text-indigo-600'
    },
    {
      id: 'word',
      title: 'PDF sang Word',
      subtitle: 'Chuyển đổi tệp PDF của bạn sang tài liệu Word có thể chỉnh sửa.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
      color: 'bg-orange-100',
      textColor: 'text-orange-600',
      hoverBg: 'group-hover:bg-orange-100',
      hoverText: 'group-hover:text-orange-600'
    },
    {
      id: 'rotate',
      title: 'Xoay PDF',
      subtitle: 'Xoay các trang PDF của bạn theo hướng mong muốn.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`,
      color: 'bg-purple-100',
      textColor: 'text-purple-600',
      hoverBg: 'group-hover:bg-purple-100',
      hoverText: 'group-hover:text-purple-600'
    },
    {
      id: 'unlock',
      title: 'Mở khóa PDF',
      subtitle: 'Loại bỏ mật khẩu và các hạn chế khỏi tệp PDF của bạn.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-open"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
      color: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      hoverBg: 'group-hover:bg-yellow-100',
      hoverText: 'group-hover:text-yellow-600'
    }
  ];

  res.render('index', { tools });
};

export const postMerge = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length < 2) {
      return res.status(400).send('Vui lòng tải lên ít nhất 2 tệp PDF.');
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const outputPath = path.join(process.cwd(), 'public', 'uploads', `merged-${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, mergedPdfBytes);

    // Clean up uploaded files
    files.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    res.download(outputPath, (err) => {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Đã xảy ra lỗi khi gộp PDF.');
  }
};

export const postSplit = async (req, res) => {
  try {
    const file = req.file;
    const { mode, range } = req.body;

    if (!file) {
      return res.status(400).send('Vui lòng tải lên tệp PDF.');
    }

    const pdfBytes = fs.readFileSync(file.path);
    const pdf = await PDFDocument.load(pdfBytes);
    const totalPages = pdf.getPageCount();

    if (mode === 'all') {
      const archive = archiver('zip', { zlib: { level: 9 } });
      res.attachment(`split-${Date.now()}.zip`);
      archive.pipe(res);

      for (let i = 0; i < totalPages; i++) {
        try {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(copiedPage);
          const newPdfBytes = await newPdf.save();
          archive.append(Buffer.from(newPdfBytes), { name: `page-${i + 1}.pdf` });
        } catch (err) {
          console.error(`Error splitting page ${i + 1}:`, err);
        }
      }

      await archive.finalize();
    } else {
      // Handle range: "1-3, 5"
      const pagesToExtract = [];
      const parts = range.split(',');
      
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map(Number);
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= totalPages) pagesToExtract.push(i - 1);
          }
        } else {
          const pageNum = Number(trimmed);
          if (pageNum >= 1 && pageNum <= totalPages) pagesToExtract.push(pageNum - 1);
        }
      }

      if (pagesToExtract.length === 0) {
        return res.status(400).send('Khoảng trang không hợp lệ.');
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, pagesToExtract);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      const newPdfBytes = await newPdf.save();
      const outputPath = path.join(process.cwd(), 'public', 'uploads', `split-${Date.now()}.pdf`);
      fs.writeFileSync(outputPath, newPdfBytes);
      
      res.download(outputPath, (err) => {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      });
    }

    // Clean up original upload
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  } catch (error) {
    console.error(error);
    res.status(500).send('Đã xảy ra lỗi khi tách PDF.');
  }
};

export const postCompress = async (req, res) => {
  try {
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).send('Vui lòng tải lên ít nhất một tệp PDF.');
    }

    const processPdf = async (file) => {
      const originalBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(originalBytes);
      
      // Compression strategy: use object streams and strip metadata
      const saveOptions = {
        useObjectStreams: true,
        addMetadata: false,
        updateMetadata: false,
      };

      const compressedPdfBytes = await pdf.save(saveOptions);
      const originalSize = originalBytes.length;
      const compressedSize = compressedPdfBytes.length;

      // If compressed version is larger, fallback to original bytes
      const finalBytes = compressedSize >= originalSize ? originalBytes : compressedPdfBytes;
      
      return {
        bytes: finalBytes,
        name: file.originalname,
        path: file.path
      };
    };

    if (files.length === 1) {
      const processed = await processPdf(files[0]);
      const finalPath = path.join(process.cwd(), 'public', 'uploads', `compressed-${Date.now()}-${processed.name}`);
      fs.writeFileSync(finalPath, processed.bytes);
      
      // Clean up original upload
      if (fs.existsSync(processed.path)) fs.unlinkSync(processed.path);
      
      res.download(finalPath, (err) => {
        // Clean up generated file after download
        if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
      });
    } else {
      const archive = archiver('zip', { zlib: { level: 9 } });
      res.attachment(`compressed-${Date.now()}.zip`);
      archive.pipe(res);

      for (const file of files) {
        try {
          const processed = await processPdf(file);
          archive.append(Buffer.from(processed.bytes), { name: processed.name });
          // Clean up original upload
          if (fs.existsSync(processed.path)) fs.unlinkSync(processed.path);
        } catch (err) {
          console.error(`Error processing file ${file.originalname}:`, err);
          // Still try to clean up
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
      }

      await archive.finalize();
    }
  } catch (error) {
    console.error('Compression Error:', error);
    res.status(500).send('Đã xảy ra lỗi khi nén PDF.');
  }
};

export const postLock = async (req, res) => {
  let outputPath = null;
  try {
    const file = req.file;
    const { password } = req.body;

    if (!file) {
      return res.status(400).send('Vui lòng tải lên tệp PDF.');
    }
    if (!password) {
      return res.status(400).send('Vui lòng nhập mật khẩu.');
    }

    outputPath = path.join(process.cwd(), 'public', 'uploads', `locked-${Date.now()}.pdf`);

    // Use muhammara to encrypt the PDF
    muhammara.recrypt(file.path, outputPath, {
      userPassword: password,
      ownerPassword: password, // Same password for owner for simplicity
      userProtectionFlag: 0 // Default protection
    });

    // Clean up uploaded file
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    res.download(outputPath, (err) => {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Lock Error:', error);
    if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).send('Đã xảy ra lỗi khi khóa PDF. Đảm bảo tệp không có mật khẩu trước đó.');
  }
};

export const postWord = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send('Vui lòng tải lên tệp PDF.');
    }

    console.log('Converting PDF to Word:', file.originalname);
    const dataBuffer = fs.readFileSync(file.path);
    const parser = new PDFParse({ data: dataBuffer });
    const textResult = await parser.getText();
    const text = textResult.text || '';

    console.log('Extracted text length:', text.length);

    // Split text into paragraphs and clean up, preserving double newlines as actual paragraph breaks
    const paragraphs = text.split(/\n\n+/)
      .map(section => {
        const lines = section.split(/\n/).map(l => l.trim()).filter(l => l !== '');
        if (lines.length === 0) return null;
        
        return new Paragraph({
          children: [
            new TextRun({
              text: lines.join(' '),
              size: 24, // 12pt
              font: "Times New Roman",
            })
          ],
          spacing: {
            before: 200,
            after: 200,
            line: 360, // 1.5 line spacing
          },
          alignment: "both",
        });
      })
      .filter(p => p !== null);

    // Create a new Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs.length > 0 ? paragraphs : [new Paragraph({
          children: [new TextRun("Tài liệu không có nội dung văn bản hoặc không thể trích xuất văn bản.")],
        })],
      }],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    
    const filename = `word-${Date.now()}.docx`;
    const outputPath = path.join(process.cwd(), 'public', 'uploads', filename);
    fs.writeFileSync(outputPath, buffer);

    console.log('Word file created:', outputPath);

    // Clean up original upload
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Delete the file after download attempt
      if (fs.existsSync(outputPath)) {
        try {
          fs.unlinkSync(outputPath);
        } catch (unlinkErr) {
          console.error('Error deleting temp word file:', unlinkErr);
        }
      }
    });
  } catch (error) {
    console.error('Word Conversion Error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).send('Đã xảy ra lỗi khi chuyển đổi PDF sang Word.');
  }
};

export const postUnlock = async (req, res) => {
  let outputPath = null;
  try {
    const file = req.file;
    const { password } = req.body;

    if (!file) {
      return res.status(400).send('Vui lòng tải lên tệp PDF.');
    }
    if (!password) {
      return res.status(400).send('Vui lòng nhập mật khẩu hiện tại.');
    }

    outputPath = path.join(process.cwd(), 'public', 'uploads', `unlocked-${Date.now()}.pdf`);

    // Use muhammara to decrypt the PDF
    muhammara.recrypt(file.path, outputPath, {
      password: password
    });

    // Clean up uploaded file
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    res.download(outputPath, (err) => {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Unlock Error:', error);
    if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).send('Đã xảy ra lỗi khi mở khóa PDF. Đảm bảo mật khẩu chính xác.');
  }
};

export const postRotate = async (req, res) => {
  try {
    const file = req.file;
    const { rotation } = req.body; // Rotation in degrees (90, 180, 270)

    if (!file) {
      return res.status(400).send('Vui lòng tải lên tệp PDF.');
    }

    const pdfBytes = fs.readFileSync(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const rotationAngle = parseInt(rotation) || 90;

    pages.forEach(page => {
      const currentRotation = page.getRotation().angle;
      page.setRotation({ angle: (currentRotation + rotationAngle) % 360 });
    });

    const rotatedPdfBytes = await pdfDoc.save();
    const outputPath = path.join(process.cwd(), 'public', 'uploads', `rotated-${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, rotatedPdfBytes);

    // Clean up original upload
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    res.download(outputPath, (err) => {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Rotate Error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).send('Đã xảy ra lỗi khi xoay PDF.');
  }
};
