import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateProfessionalQuotePDF(quote: any, company: any, client: any, project: any) {
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedStandardFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedStandardFont(StandardFonts.TimesRomanBold);
  const italicFont = await pdfDoc.embedStandardFont(StandardFonts.TimesRomanItalic);
  const headingFont = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);
  
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  
  const items = JSON.parse(quote.items || '[]');
  const payment_terms = JSON.parse(quote.payment_terms || '[]');
  
  // Colors
  const primaryColor = rgb(0.2, 0.3, 0.7); // Professional blue
  const accentColor = rgb(0.9, 0.9, 0.9); // Light gray
  const textColor = rgb(0.2, 0.2, 0.2); // Dark gray
  const lightTextColor = rgb(0.5, 0.5, 0.5); // Medium gray
  
  let y = height - 60;
  
  // HEADER SECTION
  // Company logo area (placeholder)
  page.drawRectangle({
    x: 50,
    y: y - 50,
    width: 80,
    height: 50,
    color: primaryColor,
  });
  page.drawText('LOGO', {
    x: 75,
    y: y - 30,
    size: 12,
    font: boldFont,
    color: rgb(1, 1, 1),
  });
  
  // Quote title and number
  page.drawText('QUOTATION', {
    x: width - 200,
    y: y - 20,
    size: 28,
    font: headingFont,
    color: primaryColor,
  });
  
  page.drawText(`Quote #${quote.id}`, {
    x: width - 200,
    y: y - 42,
    size: 13,
    font: boldFont,
    color: textColor,
  });
  
  const currentDate = new Date().toLocaleDateString();
  page.drawText(`Date: ${currentDate}`, {
    x: width - 200,
    y: y - 58,
    size: 11,
    font: italicFont,
    color: lightTextColor,
  });
  
  y -= 90;
  
  // COMPANY AND CLIENT INFO SECTION
  // Background for info section
  page.drawRectangle({
    x: 40,
    y: y - 120,
    width: width - 80,
    height: 120,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: rgb(0.9, 0.9, 0.9),
    borderWidth: 1,
  });
  
  // Company info (left side)
  let leftY = y - 20;
  page.drawText('FROM:', {
    x: 60,
    y: leftY,
    size: 9,
    font: headingFont,
    color: primaryColor,
  });
  leftY -= 20;
  
  if (company) {
    page.drawText(company.name, {
      x: 60,
      y: leftY,
      size: 13,
      font: boldFont,
      color: textColor,
    });
    leftY -= 18;
    
    if (company.email) {
      page.drawText(company.email, {
        x: 60,
        y: leftY,
        size: 10,
        font: regularFont,
        color: lightTextColor,
      });
      leftY -= 14;
    }
    
    if (company.phone) {
      page.drawText(company.phone, {
        x: 60,
        y: leftY,
        size: 10,
        font: regularFont,
        color: lightTextColor,
      });
      leftY -= 14;
    }
    
    if (company.address) {
      page.drawText(company.address, {
        x: 60,
        y: leftY,
        size: 10,
        font: regularFont,
        color: lightTextColor,
      });
    }
  }
  
  // Client info (right side)
  let rightY = y - 20;
  page.drawText('TO:', {
    x: 320,
    y: rightY,
    size: 9,
    font: headingFont,
    color: primaryColor,
  });
  rightY -= 20;
  
  if (client) {
    page.drawText(client.name, {
      x: 320,
      y: rightY,
      size: 13,
      font: boldFont,
      color: textColor,
    });
    rightY -= 18;
    
    if (client.email) {
      page.drawText(client.email, {
        x: 320,
        y: rightY,
        size: 10,
        font: regularFont,
        color: lightTextColor,
      });
      rightY -= 14;
    }
    
    if (client.phone) {
      page.drawText(client.phone, {
        x: 320,
        y: rightY,
        size: 10,
        font: regularFont,
        color: lightTextColor,
      });
      rightY -= 14;
    }
    
    if (client.address) {
      page.drawText(client.address, {
        x: 320,
        y: rightY,
        size: 10,
        font: regularFont,
        color: lightTextColor,
      });
    }
  }
  
  y -= 150;
  
  // PROJECT INFO
  if (project) {
    page.drawText(`Project: ${project.name}`, {
      x: 50,
      y: y,
      size: 13,
      font: boldFont,
      color: primaryColor,
    });
    y -= 30;
  }
  
  // INTRODUCTION
  if (quote.introduction) {
    page.drawText('Introduction', {
      x: 50,
      y: y,
      size: 15,
      font: headingFont,
      color: textColor,
    });
    y -= 20;
    
    const introLines = quote.introduction.split('\n');
    introLines.forEach((line: string) => {
      page.drawText(line, {
        x: 50,
        y: y,
        size: 11,
        font: regularFont,
        color: textColor,
      });
      y -= 14;
    });
    y -= 10;
  }
  
  // SCOPE SUMMARY
  if (quote.scope_summary) {
    page.drawText('Project Scope', {
      x: 50,
      y: y,
      size: 15,
      font: headingFont,
      color: textColor,
    });
    y -= 20;
    
    const scopeLines = quote.scope_summary.split('\n');
    scopeLines.forEach((line: string) => {
      page.drawText(line, {
        x: 50,
        y: y,
        size: 11,
        font: regularFont,
        color: textColor,
      });
      y -= 14;
    });
    y -= 10;
  }
  
  // ITEMS TABLE
  if (items.length > 0) {
    page.drawText('Cost Breakdown', {
      x: 50,
      y: y,
      size: 15,
      font: headingFont,
      color: textColor,
    });
    y -= 30;
    
    // Table header
    page.drawRectangle({
      x: 50,
      y: y - 25,
      width: width - 100,
      height: 25,
      color: primaryColor,
    });
    
    page.drawText('Description', {
      x: 60,
      y: y - 15,
      size: 10,
      font: headingFont,
      color: rgb(1, 1, 1),
    });
    
    page.drawText('Qty', {
      x: 350,
      y: y - 15,
      size: 10,
      font: headingFont,
      color: rgb(1, 1, 1),
    });
    
    page.drawText('Rate (KSH)', {
      x: 400,
      y: y - 15,
      size: 10,
      font: headingFont,
      color: rgb(1, 1, 1),
    });
    
    page.drawText('Amount (KSH)', {
      x: 480,
      y: y - 15,
      size: 10,
      font: headingFont,
      color: rgb(1, 1, 1),
    });
    
    y -= 35;
    
    let total = 0;
    let rowIndex = 0;
    
    items.forEach((item: any) => {
      const amount = item.quantity * item.rate;
      total += amount;
      
      // Alternating row colors
      if (rowIndex % 2 === 0) {
        page.drawRectangle({
          x: 50,
          y: y - 20,
          width: width - 100,
          height: 20,
          color: rgb(0.98, 0.98, 0.98),
        });
      }
      
      page.drawText(item.item || item.description || 'Item', {
        x: 60,
        y: y - 10,
        size: 10,
        font: regularFont,
        color: textColor,
      });
      
      page.drawText(item.quantity.toString(), {
        x: 360,
        y: y - 10,
        size: 10,
        font: regularFont,
        color: textColor,
      });
      
      page.drawText(item.rate.toLocaleString('en', { minimumFractionDigits: 2 }), {
        x: 420,
        y: y - 10,
        size: 10,
        font: regularFont,
        color: textColor,
      });
      
      page.drawText(amount.toLocaleString('en', { minimumFractionDigits: 2 }), {
        x: 500,
        y: y - 10,
        size: 10,
        font: regularFont,
        color: textColor,
      });
      
      y -= 20;
      rowIndex++;
    });
    
    // Total section
    y -= 10;
    page.drawRectangle({
      x: 400,
      y: y - 25,
      width: width - 450,
      height: 25,
      color: primaryColor,
    });
    
    page.drawText('TOTAL:', {
      x: 420,
      y: y - 15,
      size: 12,
      font: headingFont,
      color: rgb(1, 1, 1),
    });
    
    page.drawText(`KSH ${total.toLocaleString('en', { minimumFractionDigits: 2 })}`, {
      x: 480,
      y: y - 15,
      size: 12,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
    
    y -= 50;
  }
  
  // PAYMENT TERMS
  if (payment_terms.length > 0) {
    page.drawText('Payment Schedule', {
      x: 50,
      y: y,
      size: 15,
      font: headingFont,
      color: textColor,
    });
    y -= 25;
    
    payment_terms.forEach((term: any) => {
      page.drawText(`• ${term.milestone}`, {
        x: 60,
        y: y,
        size: 10,
        font: boldFont,
        color: textColor,
      });
      
      page.drawText(`${term.percentage}% - KSH ${term.amount.toLocaleString('en', { minimumFractionDigits: 2 })}`, {
        x: 200,
        y: y,
        size: 10,
        font: regularFont,
        color: primaryColor,
      });
      
      if (term.due_date) {
        page.drawText(`Due: ${new Date(term.due_date).toLocaleDateString()}`, {
          x: 400,
          y: y,
          size: 9,
          font: regularFont,
          color: lightTextColor,
        });
      }
      
      y -= 18;
    });
    y -= 10;
  }
  
  // TERMS & CONDITIONS
  if (quote.notes) {
    page.drawText('Terms & Conditions', {
      x: 50,
      y: y,
      size: 15,
      font: headingFont,
      color: textColor,
    });
    y -= 20;
    
    const notesLines = quote.notes.split('\n');
    notesLines.forEach((line: string) => {
      page.drawText(line, {
        x: 50,
        y: y,
        size: 10,
        font: regularFont,
        color: textColor,
      });
      y -= 12;
    });
  }
  
  // FOOTER
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: 40,
    color: accentColor,
  });
  
  page.drawText(`Quote valid for ${quote.validity_period || 30} days from date of issue`, {
    x: 50,
    y: 20,
    size: 9,
    font: italicFont,
    color: lightTextColor,
  });
  
  page.drawText(`Generated on ${currentDate}`, {
    x: width - 150,
    y: 20,
    size: 8,
    font: italicFont,
    color: lightTextColor,
  });
  
  return await pdfDoc.save();
}
