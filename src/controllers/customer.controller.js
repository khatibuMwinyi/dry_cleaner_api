import Customer from "../models/Customer.js";

export const createCustomer = async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json(customer);
};

export const getCustomers = async (_, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.json(customers);
};

export const updateCustomer = async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }
  res.json(customer);
};
