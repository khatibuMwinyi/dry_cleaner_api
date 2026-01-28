import mongoose from "mongoose";
import Service from "../models/Service.js";
import Inventory from "../models/Inventory.js";
import InventoryConsumption from "../models/InventoryConsumption.js";
import ServiceExecution from "../models/ServiceExecution.js";
import Expense from "../models/Expense.js";

export const executeService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { quantity = 1, invoiceId } = req.body;

    if (quantity <= 0) {
      throw new Error("Execution quantity must be positive");
    }

    const service = await Service.findById(req.params.serviceId)
      .session(session);

    if (!service) throw new Error("Service not found");

    // Create service execution record first (so we can link consumption + expenses)
    const serviceExecution = await ServiceExecution.create(
      [
        {
          service: service._id,
          basePrice: service.basePrice,
          consumables: [],
          status: "SUCCESS",
          executedBy: req.user?._id,
          invoice: invoiceId || undefined,
        },
      ],
      { session },
    );

    // Track inventory consumption for expense creation
    const inventoryUsage = [];
    let totalExpenseAmount = 0;

    // Consume inventory and track usage
    for (const item of service.consumables) {
      const inventory = await Inventory.findById(item.inventory).session(session);

      if (!inventory) {
        throw new Error("Inventory item missing");
      }

      const quantityToConsume = Number(item.quantity) * Number(quantity);
      inventory.consume(quantityToConsume);
      await inventory.save({ session });

      // Store on execution
      serviceExecution[0].consumables.push({
        inventory: inventory._id,
        quantity: quantityToConsume,
      });

      // Expense amount from inventory cost
      const unitCost = Number(inventory.costPerUnit || 0);
      totalExpenseAmount += quantityToConsume * unitCost;

      // Record inventory consumption (link to serviceExecution id)
      await InventoryConsumption.create(
        [
          {
            inventory: inventory._id,
            quantityUsed: quantityToConsume,
            sourceType: "SERVICE",
            sourceId: serviceExecution[0]._id,
            notes: `Huduma: ${service.name}`,
          },
        ],
        { session },
      );

      inventoryUsage.push({
        inventory: inventory._id,
        quantityUsed: quantityToConsume,
      });
    }

    await serviceExecution[0].save({ session });

    // Swahili description for expenses
    const swDesc = `Matumizi ya bidhaa za ghala kwa huduma ya ${service.name} (idadi ${Number(
      quantity,
    ).toFixed(3)}).`;

    // Create expense record linked to service execution
    const expense = await Expense.create(
      [
        {
          category: "Service Execution",
          amount: totalExpenseAmount,
          description: swDesc,
          date: new Date(),
          serviceExecution: serviceExecution[0]._id,
          invoice: invoiceId || undefined,
          inventoryUsage,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    res.json({ 
      message: "Service executed successfully",
      serviceExecution: serviceExecution[0],
      expense: expense[0],
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
