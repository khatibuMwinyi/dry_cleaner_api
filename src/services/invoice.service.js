import ClothingType from "../models/ClothingType.js";
import Service from "../models/Service.js";

export const buildInvoiceItems = async (rawItems) => {
  let subtotal = 0;
  const items = [];

  for (const item of rawItems) {
    const { clothingTypeId, serviceId, quantity } = item;

    if (!quantity || quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    const clothingType = await ClothingType.findById(clothingTypeId);
    if (!clothingType) throw new Error("Invalid clothing type");

    const service = await Service.findById(serviceId);
    if (!service || !service.active) {
      throw new Error("Invalid service");
    }

    const priceOverride = clothingType.pricing?.get(serviceId.toString());
    const unitPrice = priceOverride ?? service.basePrice;

    if (!unitPrice || unitPrice <= 0) {
      throw new Error("Price not defined");
    }

    const totalPrice = unitPrice * quantity;
    subtotal += totalPrice;

    items.push({
      clothingTypeId: clothingType._id,
      clothingTypeName: clothingType.name,
      serviceId: service._id,
      serviceName: service.name,
      quantity,
      unitPrice,
      totalPrice
    });
  }

  return { items, subtotal };
};
