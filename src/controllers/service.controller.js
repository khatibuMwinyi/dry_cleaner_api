import mongoose from "mongoose";
import Service from "../models/Service.js";
import Inventory from "../models/Inventory.js";
import InventoryConsumption from "../models/InventoryConsumption.js";

export const createService = async (req, res) => {
  try {
    const { name, basePrice, inventoryUsage = [] } = req.body;

    if (!name || basePrice == null) {
      return res.status(400).json({
        message: "Service name and base price are required",
      });
    }

    // Create service
    const service = await Service.create({
      name: name.trim(),
      basePrice: Number(basePrice),
    });

    //  Consume inventory (optional)
    for (const usage of inventoryUsage) {
      const inventory = await Inventory.findById(usage.inventoryId);

      if (!inventory) {
        throw new Error("Inventory item not found");
      }

      if (inventory.quantity < usage.quantityUsed) {
        throw new Error(`Insufficient stock for ${inventory.name}`);
      }

      inventory.quantity -= Number(usage.quantityUsed);
      await inventory.save();

      await InventoryConsumption.create({
        inventory: inventory._id,
        quantityUsed: Number(usage.quantityUsed),
        sourceType: "SERVICE",
        sourceId: service._id,
      });
    }

    res.status(201).json(service);
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({
      message: error.message || "Failed to create service",
    });
  }
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.find({})
      .select("name basePrice createdAt")
      .lean();

    res.json(services);
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({
      message: "Failed to fetch services",
    });
  }
};

export const updateService = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid service ID" });
  }

  try {
    const updated = await Service.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({ message: "Failed to update service" });
  }
};

export const deleteService = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid service ID" });
  }

  try {
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deleted" });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({ message: "Failed to delete service" });
  }
};
