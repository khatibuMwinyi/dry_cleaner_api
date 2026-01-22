import mongoose from "mongoose";
import Service from "../models/Service.js";
import Inventory from "../models/Inventory.js";

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

    for (const item of service.consumables) {
      const inventory = await Inventory.findById(item.inventory)
        .session(session);

      if (!inventory) {
        throw new Error("Inventory item missing");
      }

      inventory.consume(item.quantity * quantity);
      await inventory.save({ session });
    }

    await session.commitTransaction();
    res.json({ message: "Service executed successfully" });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
