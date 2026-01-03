import nodemailer from "nodemailer";

export const sendInvoiceEmail = async ({ to, pdf, invoiceId }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Oweru" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Invoice ${invoiceId}`,
    text: "Please find your invoice attached.",
    attachments: [
      {
        filename: `invoice-${invoiceId}.pdf`,
        content: pdf
      }
    ]
  });
};
