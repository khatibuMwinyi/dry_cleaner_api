import ClothingType from "../models/ClothingType.js";
import Service from "../models/Service.js";

export const createClothingType = async (req, res) => {
  const { name, pricing } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Clothing type name required" });
  }

  // Validate pricing keys (service IDs)
  if (pricing) {
    for (const [serviceId, price] of Object.entries(pricing)) {
      const service = await Service.findById(serviceId);
      if (!service || price <= 0) {
        return res.status(400).json({
          message: "Invalid service pricing",
        });
      }
    }
  }

  const clothingType = await ClothingType.create({
    name,
    pricing,
  });

  res.status(201).json(clothingType);
};

export const getClothingTypes = async (_, res) => {
  const clothingTypes = await ClothingType.find();
  res.json(clothingTypes);
};

export const getClothingTypeById = async (req, res) => {
  try {
    const clothingType = await ClothingType.findById(req.params.id);
    if (!clothingType)
      return res.status(404).json({ message: "Clothing type not found" });
    res.json(clothingType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateClothingType = async (req, res) => {
  try {
    const { name, pricing } = req.body;
    const clothingType = await ClothingType.findById(req.params.id);
    if (!clothingType)
      return res.status(404).json({ message: "Clothing type not found" });

    if (name) clothingType.name = name;

    if (pricing) {
      // Validate pricing keys (service IDs)
      for (const [serviceId, price] of Object.entries(pricing)) {
        const service = await Service.findById(serviceId);
        if (!service || price <= 0) {
          return res.status(400).json({ message: "Invalid service pricing" });
        }
      }

      // Replace pricing map
      clothingType.pricing = pricing;
    }

    await clothingType.save();
    res.json(clothingType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteClothingType = async (req, res) => {
  try {
    const deleted = await ClothingType.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Clothing type not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
