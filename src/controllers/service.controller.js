import mongoose from "mongoose";
import Service from "../models/Service.js";
import Inventory from "../models/Inventory.js";
import InventoryConsumption from "../models/InventoryConsumption.js";
import ServiceExecution from "../models/ServiceExecution.js";
export const createService = async (req, res) => {
  try {
    const { name, category, subCategory, basePrice, consumables, solventUsed } = req.body;

    if (!name || basePrice == null || !category || !subCategory) {
      return res.status(400).json({
        message: "Service name, category, subCategory and base price are required",
      });
    }

    // Create service
    const service = await Service.create({
      name: name.trim(),
      category: category.trim(),
      subCategory: subCategory.trim(),
      basePrice: Number(basePrice),
      solventUsed: solventUsed ? Number(solventUsed) : 0,
      consumables: consumables || []
    });

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
    const services = await Service.find().populate(
    "consumables.inventory",
    "name unit"
  );

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



export const getServiceExecutions = async (req, res) => {
  const executions = await ServiceExecution.find()
    .populate("service", "name")
    .populate("consumables.inventory", "name unit")
    .populate("executedBy", "email role")
    .sort({ createdAt: -1 });

  res.json(executions);
};
