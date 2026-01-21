import mongoose from "mongoose";
import Service from "../models/Service.js";
import ServiceExecution from "../models/ServiceExecution.js";

export const executeService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId)
      .populate("consumables.inventory")
      .session(session);

    if (!service || !service.isActive) {
      throw new Error("Service not found or inactive");
    }

    // Validate inventory
    for (const item of service.consumables) {
      if (!item.inventory) {
        throw new Error("Invalid inventory reference");
      }

      if (item.inventory.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.inventory.name}`
        );
      }
    }

    // Consume inventory
    for (const item of service.consumables) {
      item.inventory.consume(item.quantity);
      await item.inventory.save({ session });
    }

    // Record execution history
    await ServiceExecution.create(
      [
        {
          service: service._id,
          basePrice: service.basePrice,
          consumables: service.consumables.map((c) => ({
            inventory: c.inventory._id,
            quantity: c.quantity,
          })),
          status: "SUCCESS",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Service executed successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ message: error.message });
  }
};
