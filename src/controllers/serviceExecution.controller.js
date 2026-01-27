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
    const { quantity = 1 } = req.body;

    if (quantity <= 0) {
      throw new Error("Execution quantity must be positive");
    }

    const service = await Service.findById(req.params.serviceId)
      .session(session);

    if (!service) throw new Error("Service not found");

    // Track inventory consumption for expense creation
    const inventoryUsage = [];
    let totalExpenseAmount = 0;

    // Consume inventory and track usage
    for (const item of service.consumables) {
      const inventory = await Inventory.findById(item.inventory)
        .session(session);

      if (!inventory) {
        throw new Error("Inventory item missing");
      }

      const quantityToConsume = item.quantity * quantity;
      inventory.consume(quantityToConsume);
      await inventory.save({ session });

      // Record inventory consumption
      const consumption = await InventoryConsumption.create(
        [
          {
            inventory: inventory._id,
            quantityUsed: quantityToConsume,
            sourceType: "SERVICE",
            sourceId: req.params.serviceId,
          },
        ],
        { session }
      );

      inventoryUsage.push({
        inventory: inventory._id,
        quantityUsed: quantityToConsume,
      });

      // Calculate expense amount (you can adjust this logic based on your needs)
      // For now, we'll use a simple calculation or set it to 0 if inventory cost isn't tracked
      totalExpenseAmount += 0; // Update this if you track inventory costs
    }

    // Create service execution record
    const serviceExecution = await ServiceExecution.create(
      [
        {
          service: service._id,
          basePrice: service.basePrice,
          consumables: service.consumables.map((c) => ({
            inventory: c.inventory,
            quantity: c.quantity * quantity,
          })),
          status: "SUCCESS",
        },
      ],
      { session }
    );

    // Create expense record linked to service execution
    const expense = await Expense.create(
      [
        {
          category: "Service Execution",
          amount: totalExpenseAmount,
          description: `Inventory usage for ${service.name} (${quantity} unit(s))`,
          date: new Date(),
          serviceExecution: serviceExecution[0]._id,
          inventoryUsage: inventoryUsage,
        },
      ],
      { session }
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
