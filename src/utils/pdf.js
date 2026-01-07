import puppeteer from 'puppeteer';
import { invoiceTemplate } from '../templates/invoice.template.js';

export const generatePdfFromInvoice = async (invoice, company = {}) => {
  try {
    // Generate HTML from template
    const html = invoiceTemplate({ invoice, company });

    // Launch Puppeteer browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    // Try to set content with a longer timeout and fallbacks to avoid navigation timeouts
    try {
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    } catch (err) {
      try {
        await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
      } catch (err2) {
        // final fallback: no waiting
        await page.setContent(html, { timeout: 0 });
      }
    }
    // ensure the document is fully parsed
    await page.waitForFunction(() => document.readyState === 'complete', { timeout: 60000 }).catch(() => {});

    // Generate PDF from HTML
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};

export default generatePdfFromInvoice;
