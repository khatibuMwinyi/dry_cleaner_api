import Service from "../models/Service.js";

export const buildInvoiceItems = async (rawItems) => {
  let subtotal = 0;
  const items = [];

  for (const item of rawItems) {
    const { serviceId, quantity } = item;

    if (!quantity || quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      throw new Error("Invalid service");
    }

    const unitPrice = service.basePrice;

    if (!unitPrice || unitPrice <= 0) {
      throw new Error("Price not defined");
    }

    const totalPrice = unitPrice * quantity;
    subtotal += totalPrice;

    items.push({
      serviceId: service._id,
      serviceName: service.name,
      quantity,
      unitPrice,
      totalPrice
    });
  }

  return { items, subtotal };
};
