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
