import puppeteer from "puppeteer";
import { invoiceTemplate } from "../templates/invoice.template.js";
import { receiptTemplate } from "../templates/receipt.template.js";
import { monthlyReportTemplate } from "../templates/monthly-report.template.js";
import { weeklyReportTemplate } from "../templates/weekly-report.template.js";
import { dailyReportTemplate } from "../templates/daily-report.template.js";

const DEFAULT_PDF_TIMEOUT = process.env.PDF_TIMEOUT
  ? Number(process.env.PDF_TIMEOUT)
  : 120000;

export const generatePdfFromInvoice = async (invoice, company = {}) => {
  let browser;
  try {
    // Generate HTML from template
    const html = invoiceTemplate({ invoice, company });

    // Launch Puppeteer browser, allow overriding Chrome path via CHROME_PATH
    const launchOptions = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };
    if (process.env.CHROME_PATH)
      launchOptions.executablePath = process.env.CHROME_PATH;

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Increase default timeouts to avoid intermittent 30s navigation timeouts
    page.setDefaultNavigationTimeout(DEFAULT_PDF_TIMEOUT);
    page.setDefaultTimeout(DEFAULT_PDF_TIMEOUT);

    // Try to set content with a longer timeout and fallbacks to avoid navigation timeouts
    try {
      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: DEFAULT_PDF_TIMEOUT,
      });
    } catch (err) {
      try {
        await page.setContent(html, {
          waitUntil: "load",
          timeout: DEFAULT_PDF_TIMEOUT,
        });
      } catch (err2) {
        // final fallback: no waiting
        await page.setContent(html, { timeout: 0 });
      }
    }

    // ensure the document is fully parsed
    await page
      .waitForFunction(() => document.readyState === "complete", {
        timeout: DEFAULT_PDF_TIMEOUT,
      })
      .catch(() => {});

    // Generate PDF from HTML
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error("Failed to generate PDF: " + error.message);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // ignore
      }
    }
  }
};

export const generatePdfFromReceipt = async (invoice, company = {}) => {
  let browser;
  try {
    const html = receiptTemplate({ invoice, company });

    const launchOptions = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };
    if (process.env.CHROME_PATH)
      launchOptions.executablePath = process.env.CHROME_PATH;

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(DEFAULT_PDF_TIMEOUT);
    page.setDefaultTimeout(DEFAULT_PDF_TIMEOUT);

    try {
      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: DEFAULT_PDF_TIMEOUT,
      });
    } catch (err) {
      try {
        await page.setContent(html, {
          waitUntil: "load",
          timeout: DEFAULT_PDF_TIMEOUT,
        });
      } catch (err2) {
        await page.setContent(html, { timeout: 0 });
      }
    }

    await page
      .waitForFunction(() => document.readyState === "complete", {
        timeout: DEFAULT_PDF_TIMEOUT,
      })
      .catch(() => {});

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error("Receipt PDF generation error:", error);
    throw new Error("Failed to generate receipt PDF: " + error.message);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // ignore
      }
    }
  }
};

export const generatePdfFromMonthlyReport = async (reportData, company = {}) => {
  let browser;
  try {
    // Generate HTML from template
    const html = monthlyReportTemplate(reportData, company);

    // Launch Puppeteer browser, allow overriding Chrome path via CHROME_PATH
    const launchOptions = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };
    if (process.env.CHROME_PATH)
      launchOptions.executablePath = process.env.CHROME_PATH;

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Increase default timeouts to avoid intermittent 30s navigation timeouts
    page.setDefaultNavigationTimeout(DEFAULT_PDF_TIMEOUT);
    page.setDefaultTimeout(DEFAULT_PDF_TIMEOUT);

    // Try to set content with a longer timeout and fallbacks to avoid navigation timeouts
    try {
      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: DEFAULT_PDF_TIMEOUT,
      });
    } catch (err) {
      try {
        await page.setContent(html, {
          waitUntil: "load",
          timeout: DEFAULT_PDF_TIMEOUT,
        });
      } catch (err2) {
        // final fallback: no waiting
        await page.setContent(html, { timeout: 0 });
      }
    }

    // ensure the document is fully parsed
    await page
      .waitForFunction(() => document.readyState === "complete", {
        timeout: DEFAULT_PDF_TIMEOUT,
      })
      .catch(() => {});

    // Generate PDF from HTML
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      printBackground: true,
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error("Monthly report PDF generation error:", error);
    throw new Error("Failed to generate monthly report PDF: " + error.message);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // ignore
      }
    }
  }
};

export const generatePdfFromWeeklyReport = async (reportData, company = {}) => {
  let browser;
  try {
    const html = weeklyReportTemplate(reportData, company);

    const launchOptions = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };
    if (process.env.CHROME_PATH)
      launchOptions.executablePath = process.env.CHROME_PATH;

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(DEFAULT_PDF_TIMEOUT);
    page.setDefaultTimeout(DEFAULT_PDF_TIMEOUT);

    try {
      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: DEFAULT_PDF_TIMEOUT,
      });
    } catch (err) {
      try {
        await page.setContent(html, {
          waitUntil: "load",
          timeout: DEFAULT_PDF_TIMEOUT,
        });
      } catch (err2) {
        await page.setContent(html, { timeout: 0 });
      }
    }

    await page
      .waitForFunction(() => document.readyState === "complete", {
        timeout: DEFAULT_PDF_TIMEOUT,
      })
      .catch(() => {});

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      printBackground: true,
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error("Weekly report PDF generation error:", error);
    throw new Error("Failed to generate weekly report PDF: " + error.message);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {}
    }
  }
};

export const generatePdfFromDailyReport = async (reportData, company = {}) => {
  let browser;
  try {
    const html = dailyReportTemplate(reportData, company);

    const launchOptions = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };
    if (process.env.CHROME_PATH)
      launchOptions.executablePath = process.env.CHROME_PATH;

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(DEFAULT_PDF_TIMEOUT);
    page.setDefaultTimeout(DEFAULT_PDF_TIMEOUT);

    try {
      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: DEFAULT_PDF_TIMEOUT,
      });
    } catch (err) {
      try {
        await page.setContent(html, {
          waitUntil: "load",
          timeout: DEFAULT_PDF_TIMEOUT,
        });
      } catch (err2) {
        await page.setContent(html, { timeout: 0 });
      }
    }

    await page
      .waitForFunction(() => document.readyState === "complete", {
        timeout: DEFAULT_PDF_TIMEOUT,
      })
      .catch(() => {});

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      printBackground: true,
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error("Daily report PDF generation error:", error);
    throw new Error("Failed to generate daily report PDF: " + error.message);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {}
    }
  }
};

export default generatePdfFromInvoice;
