import Job from "../models/Job.js";
import Invoice from "../models/Invoice.js";
import Service from "../models/Service.js";
import Inventory from "../models/Inventory.js";
import InventoryConsumption from "../models/InventoryConsumption.js";
import ServiceExecution from "../models/ServiceExecution.js";
import Expense from "../models/Expense.js";
import mongoose from "mongoose";

export const getJobs = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const query = {};
    if (status) query.status = status;

    // Check if dates are provided (not empty strings)
    const hasStartDate = startDate && startDate.trim() !== "";
    const hasEndDate = endDate && endDate.trim() !== "";

    let dateQuery = {};
    if (hasStartDate || hasEndDate) {
      // Use provided date range
      if (hasStartDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateQuery.$gte = start;
      }
      if (hasEndDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery.$lte = end;
      }
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateQuery.$gte = today;
      dateQuery.$lte = tomorrow;
    }
    query.submittedDate = dateQuery;

    const jobs = await Job.find(query).sort({ submittedDate: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getJobByInvoiceId = async (req, res) => {
  try {
    const job = await Job.findOne({ invoiceId: req.params.invoiceId });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const receiveJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualClothCount } = req.body;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "waiting") {
      return res.status(400).json({ message: "Job is not in waiting status" });
    }

    job.status = "received";
    job.receivedDate = new Date();
    job.actualClothCount = actualClothCount || 0;
    
    const invoice = await Invoice.findById(job.invoiceId);
    if (invoice) {
      const totalItems = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
      job.notedClothCount = totalItems;
    }

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const executeJob = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const job = await Job.findById(id).session(session);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "received") {
      return res.status(400).json({ message: "Job must be in received status to execute" });
    }

    const invoice = await Invoice.findById(job.invoiceId).session(session);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.isExecuted) {
      return res.status(400).json({ message: "Invoice already executed" });
    }

    for (const item of invoice.items) {
      const service = await Service.findById(item.serviceId).session(session);
      if (!service) throw new Error("Service not found");

      const qty = Number(item.quantity || 1);

      const serviceExecution = await ServiceExecution.create(
        [
          {
            service: service._id,
            basePrice: service.basePrice,
            consumables: [],
            status: "SUCCESS",
            executedBy: req.user?._id,
            invoice: invoice._id,
          },
        ],
        { session },
      );

      const inventoryUsage = [];
      let totalExpenseAmount = 0;

      for (const c of service.consumables) {
        const inventory = await Inventory.findById(c.inventory).session(session);
        if (!inventory) throw new Error("Inventory item missing");

        const quantityToConsume = Number(c.quantity) * qty;
        inventory.consume(quantityToConsume);
        await inventory.save({ session });

        serviceExecution[0].consumables.push({
          inventory: inventory._id,
          quantity: quantityToConsume,
        });

        totalExpenseAmount += quantityToConsume * Number(inventory.costPerUnit || 0);

        await InventoryConsumption.create(
          [
            {
              inventory: inventory._id,
              quantityUsed: quantityToConsume,
              sourceType: "SERVICE",
              sourceId: serviceExecution[0]._id,
              notes: `Invoice ${invoice._id}`,
            },
          ],
          { session },
        );

        inventoryUsage.push({ inventory: inventory._id, quantityUsed: quantityToConsume });
      }

      await serviceExecution[0].save({ session });

      await Expense.create(
        [
          {
            category: "Service Execution",
            amount: totalExpenseAmount,
            date: new Date(),
            serviceExecution: serviceExecution[0]._id,
            invoice: invoice._id,
            inventoryUsage,
          },
        ],
        { session },
      );
    }

    invoice.isExecuted = true;
    invoice.executedAt = new Date();
    invoice.executedBy = req.user?._id;
    await invoice.save({ session });

    job.status = "complete";
    job.completedDate = new Date();
    await job.save({ session });

    await session.commitTransaction();
    res.json(job);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const verifyJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "complete") {
      return res.status(400).json({ message: "Job must be in complete status to verify" });
    }

    if (status === "success") {
      job.status = "success";
      job.verifiedDate = new Date();
    } else if (status === "denied") {
      job.status = "denied-admin";
      job.deniedBy = "admin";
      job.deniedReason = notes || "Verification failed";
    } else {
      return res.status(400).json({ message: "Invalid status. Use 'success' or 'denied'" });
    }

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const denyJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const userRole = req.user?.role?.toLowerCase();
    if (userRole === "admin") {
      job.status = "denied-admin";
      job.deniedBy = "admin";
    } else if (userRole === "cleaner") {
      job.status = "denied-cleaner";
      job.deniedBy = "cleaner";
    } else {
      return res.status(403).json({ message: "Only admin or cleaner can deny a job" });
    }

    job.deniedReason = reason || "Job denied";
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const sendPickupNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "success") {
      return res.status(400).json({ message: "Job must be completed before sending pickup notification" });
    }

    const invoice = await Invoice.findById(job.invoiceId);
    if (!invoice || !invoice.customerId) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const Customer = (await import("../models/Customer.js")).default;
    const customer = await Customer.findById(invoice.customerId);
    if (!customer || !customer.phone) {
      return res.status(404).json({ message: "Customer phone not found" });
    }

    const message = `
Hello ${customer.name},

Your laundry is ready for pickup!

Invoice #: ${job.invoiceNumber}
Clothes: ${job.actualClothCount} items

Please visit us to collect your items.

Thank you for choosing Oweru International LTD!
    `.trim();

    const whatsappLink = `https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`;

    res.json({ success: true, whatsappLink });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
