import Service from "../models/Service.js";

export const createService = async (req, res) => {
  const { name, basePrice } = req.body;

  if (!name || basePrice <= 0) {
    return res.status(400).json({ message: "Invalid service data" });
  }

  const service = await Service.create({ name, basePrice });
  res.status(201).json(service);
};

export const getServices = async (_, res) => {
  const services = await Service.find({ active: true });
  res.json(services);
};


