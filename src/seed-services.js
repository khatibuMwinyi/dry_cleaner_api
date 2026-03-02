import mongoose from "mongoose";
import dotenv from "dotenv";
import Service from "./models/Service.js";
import Inventory from "./models/Inventory.js";

dotenv.config({ path: "./.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dry_cleaner";

const servicesData = [
  // MEN
  { name: "Suit 1pc - MEN", category: "MEN", subCategory: "Suits & Formal", basePrice: 13000 },
  { name: "Suit 3pc - MEN", category: "MEN", subCategory: "Suits & Formal", basePrice: 13000 },
  { name: "Safari Suit", category: "MEN", subCategory: "Suits & Formal", basePrice: 11000 },
  { name: "Kaunda Suit", category: "MEN", subCategory: "Suits & Formal", basePrice: 11000 },
  { name: "Kitenge Suit", category: "MEN", subCategory: "Suits & Formal", basePrice: 12000 },
  { name: "Nigerian Suit", category: "MEN", subCategory: "Suits & Formal", basePrice: 12000 },
  { name: "Panjab Suit", category: "MEN", subCategory: "Suits & Formal", basePrice: 13000 },
  { name: "Linen Suit", category: "MEN", subCategory: "Suits & Formal", basePrice: 12000 },
  { name: "Pajama Suit", category: "MEN", subCategory: "Suits & Formal", basePrice: 7500 },
  { name: "Coat - MEN", category: "MEN", subCategory: "Jackets & Coats", basePrice: 7000 },
  { name: "Overcoat", category: "MEN", subCategory: "Jackets & Coats", basePrice: 8000 },
  { name: "Leather Jacket", category: "MEN", subCategory: "Jackets & Coats", basePrice: 20000 },
  { name: "Shirt - MEN", category: "MEN", subCategory: "Tops", basePrice: 4500 },
  { name: "T-Shirt - MEN", category: "MEN", subCategory: "Tops", basePrice: 4500 },
  { name: "Sweater Half", category: "MEN", subCategory: "Tops", basePrice: 3000 },
  { name: "Pullover / Normal Sweater", category: "MEN", subCategory: "Tops", basePrice: 4500 },
  { name: "Kanzu", category: "MEN", subCategory: "Tops", basePrice: 7500 },
  { name: "Kizibao", category: "MEN", subCategory: "Tops", basePrice: 3500 },
  { name: "Trouser - MEN", category: "MEN", subCategory: "Bottoms", basePrice: 5000 },
  { name: "Jeans - MEN", category: "MEN", subCategory: "Bottoms", basePrice: 5000 },
  { name: "Short/Pence", category: "MEN", subCategory: "Bottoms", basePrice: 3500 },
  { name: "Track Suit - MEN", category: "MEN", subCategory: "Bottoms", basePrice: 10000 },
  { name: "Truck Pant", category: "MEN", subCategory: "Bottoms", basePrice: 5000 },
  { name: "Tie", category: "MEN", subCategory: "Accessories & Innerwear", basePrice: 3000 },
  { name: "Boxer", category: "MEN", subCategory: "Accessories & Innerwear", basePrice: 3000 },
  { name: "Vest - MEN", category: "MEN", subCategory: "Accessories & Innerwear", basePrice: 3000 },
  { name: "Overall", category: "MEN", subCategory: "Workwear", basePrice: 7000 },

  // WOMEN
  { name: "Ladies Suit 2pc", category: "WOMEN", subCategory: "Suits & Formal", basePrice: 13000 },
  { name: "Ladies Suit 3pc", category: "WOMEN", subCategory: "Suits & Formal", basePrice: 13000 },
  { name: "Evening Dress", category: "WOMEN", subCategory: "Suits & Formal", basePrice: 12000 },
  { name: "Wedding Dress", category: "WOMEN", subCategory: "Suits & Formal", basePrice: 40000 },
  { name: "Long Dress - WOMEN", category: "WOMEN", subCategory: "Suits & Formal", basePrice: 10000 },
  { name: "Dress / Gown - WOMEN", category: "WOMEN", subCategory: "Suits & Formal", basePrice: 7500 },
  { name: "Joho, Kofia, Skafu", category: "WOMEN", subCategory: "Suits & Formal", basePrice: 13000 },
  { name: "Joho Pekee", category: "WOMEN", subCategory: "Suits & Formal", basePrice: 10000 },
  { name: "Blouse", category: "WOMEN", subCategory: "Tops", basePrice: 4500 },
  { name: "Jamper", category: "WOMEN", subCategory: "Tops", basePrice: 7500 },
  { name: "Skirt Normal", category: "WOMEN", subCategory: "Bottoms", basePrice: 5000 },
  { name: "Skirt Jeans", category: "WOMEN", subCategory: "Bottoms", basePrice: 5500 },
  { name: "Women Trouser", category: "WOMEN", subCategory: "Bottoms", basePrice: 5000 },
  { name: "Dangree - WOMEN", category: "WOMEN", subCategory: "Bottoms", basePrice: 7500 },
  { name: "Veil", category: "WOMEN", subCategory: "Accessories & Innerwear", basePrice: 3000 },
  { name: "Hand Bag", category: "WOMEN", subCategory: "Accessories & Innerwear", basePrice: 5000 },
  { name: "Underpants / Underwear - WOMEN", category: "WOMEN", subCategory: "Accessories & Innerwear", basePrice: 4500 },
  { name: "Socks Pair Normal - WOMEN", category: "WOMEN", subCategory: "Accessories & Innerwear", basePrice: 2000 },

  // KIDS
  { name: "Suit 2pc - KIDS", category: "KIDS", subCategory: "Suits & Formal", basePrice: 7000 },
  { name: "Suit 3pc - KIDS", category: "KIDS", subCategory: "Suits & Formal", basePrice: 7000 },
  { name: "Kipaumara Gown", category: "KIDS", subCategory: "Suits & Formal", basePrice: 10000 },
  { name: "Dress - KIDS", category: "KIDS", subCategory: "Dresses", basePrice: 3000 },
  { name: "Long Dress - KIDS", category: "KIDS", subCategory: "Dresses", basePrice: 5000 },
  { name: "T-Shirt - KIDS", category: "KIDS", subCategory: "Tops", basePrice: 2000 },
  { name: "Shirt - KIDS", category: "KIDS", subCategory: "Tops", basePrice: 2000 },
  { name: "Sweater Shirt", category: "KIDS", subCategory: "Tops", basePrice: 3000 },
  { name: "Waist Coat - KIDS", category: "KIDS", subCategory: "Tops", basePrice: 2000 },
  { name: "Pants - KIDS", category: "KIDS", subCategory: "Bottoms", basePrice: 3000 },
  { name: "Short - KIDS", category: "KIDS", subCategory: "Bottoms", basePrice: 2000 },
  { name: "Skirts - KIDS", category: "KIDS", subCategory: "Bottoms", basePrice: 3000 },
  { name: "Dangree - KIDS", category: "KIDS", subCategory: "Bottoms", basePrice: 2000 },
  { name: "Track Suit - KIDS", category: "KIDS", subCategory: "Bottoms", basePrice: 4000 },
  { name: "Coat Normal", category: "KIDS", subCategory: "Outerwear", basePrice: 3000 },
  { name: "Coat Large - KIDS", category: "KIDS", subCategory: "Outerwear", basePrice: 5000 },
  { name: "Swimming Costume", category: "KIDS", subCategory: "Others", basePrice: 3000 },
  { name: "Stocking Socks - KIDS", category: "KIDS", subCategory: "Others", basePrice: 2000 },

  // BEDDING
  { name: "Bed Sheet Double", category: "BEDDING", subCategory: "Bed Sheets", basePrice: 5000 },
  { name: "Bed Sheet Single", category: "BEDDING", subCategory: "Bed Sheets", basePrice: 3000 },
  { name: "Duvet Small", category: "BEDDING", subCategory: "Duvets & Quilts", basePrice: 10000 },
  { name: "Duvet Large - BEDDING", category: "BEDDING", subCategory: "Duvets & Quilts", basePrice: 14000 },
  { name: "Duvet Cover", category: "BEDDING", subCategory: "Duvets & Quilts", basePrice: 40000 },
  { name: "Quilt Double", category: "BEDDING", subCategory: "Duvets & Quilts", basePrice: 14000 },
  { name: "Quilt Single", category: "BEDDING", subCategory: "Duvets & Quilts", basePrice: 10000 },
  { name: "Blanket Single", category: "BEDDING", subCategory: "Blankets", basePrice: 7000 },
  { name: "Blanket Large", category: "BEDDING", subCategory: "Blankets", basePrice: 14000 },
  { name: "Pillow Cover", category: "BEDDING", subCategory: "Pillow & Covers", basePrice: 2000 },
  { name: "Cushion Cover", category: "BEDDING", subCategory: "Pillow & Covers", basePrice: 3000 },

  // CURTAINS
  { name: "Curtain Large", category: "CURTAINS", subCategory: "Standard Curtains", basePrice: 15000 },
  { name: "Curtain Medium", category: "CURTAINS", subCategory: "Standard Curtains", basePrice: 10000 },
  { name: "Sheer Curtains Normal", category: "CURTAINS", subCategory: "Sheer Curtains", basePrice: 5000 },
  { name: "Sheer Curtains Large", category: "CURTAINS", subCategory: "Sheer Curtains", basePrice: 10000 },

  // HOUSEHOLD ITEMS
  { name: "Hand Towel", category: "HOUSEHOLD ITEMS", subCategory: "Towels & Linen", basePrice: 2000 },
  { name: "Towel - HH", category: "HOUSEHOLD ITEMS", subCategory: "Towels & Linen", basePrice: 5000 },
  { name: "Bath Robes", category: "HOUSEHOLD ITEMS", subCategory: "Towels & Linen", basePrice: 6000 },
  { name: "Table Cloth", category: "HOUSEHOLD ITEMS", subCategory: "Towels & Linen", basePrice: 3000 },
  { name: "Chair Covers", category: "HOUSEHOLD ITEMS", subCategory: "Covers", basePrice: 3000 },
  { name: "Car Seat Cover Set", category: "HOUSEHOLD ITEMS", subCategory: "Covers", basePrice: 30000 },
  { name: "Carpet Normal", category: "HOUSEHOLD ITEMS", subCategory: "Carpets & Mats", basePrice: 20000 },
  { name: "Carpet Large", category: "HOUSEHOLD ITEMS", subCategory: "Carpets & Mats", basePrice: 30000 },
  { name: "Foot Mats", category: "HOUSEHOLD ITEMS", subCategory: "Carpets & Mats", basePrice: 5000 },
  { name: "Rubbers & Sneakers", category: "HOUSEHOLD ITEMS", subCategory: "Footwear", basePrice: 5000 },
  { name: "Boots - HH", category: "HOUSEHOLD ITEMS", subCategory: "Footwear", basePrice: 7500 },
  { name: "Suitcase Large", category: "HOUSEHOLD ITEMS", subCategory: "Bags & Travel Items", basePrice: 17000 },
  { name: "Suitcase Small", category: "HOUSEHOLD ITEMS", subCategory: "Bags & Travel Items", basePrice: 10000 },
  { name: "Backpack Bag", category: "HOUSEHOLD ITEMS", subCategory: "Bags & Travel Items", basePrice: 5000 },
  { name: "Hat / Cap", category: "HOUSEHOLD ITEMS", subCategory: "Miscellaneous", basePrice: 4000 },
  { name: "Mosquito Nets", category: "HOUSEHOLD ITEMS", subCategory: "Miscellaneous", basePrice: 10000 },
  { name: "Small Teddy Bear", category: "HOUSEHOLD ITEMS", subCategory: "Miscellaneous", basePrice: 6000 },
  { name: "Medium Teddy Bear", category: "HOUSEHOLD ITEMS", subCategory: "Miscellaneous", basePrice: 7000 },
  { name: "Large Teddy Bear", category: "HOUSEHOLD ITEMS", subCategory: "Miscellaneous", basePrice: 13000 },
];

const seedServices = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    let solvent = await Inventory.findOne({ name: { $regex: /solvent/i } });
    
    if (!solvent) {
      solvent = await Inventory.create({
        name: "Solvent ya kufulia nguo",
        quantity: 1000,
        unit: "liter",
        costPerUnit: 0,
        reorderLevel: 100,
      });
      console.log("Created inventory item: Solvent ya kufulia nguo");
    } else {
      console.log("Found existing inventory item:", solvent.name);
    }

    await Service.deleteMany({});
    console.log("Cleared existing services");

    const servicesWithConsumables = servicesData.map((service) => ({
      ...service,
      consumables: [
        {
          inventory: solvent._id,
          quantity: 1,
        },
      ],
    }));

    await Service.insertMany(servicesWithConsumables);
    console.log(`Created ${servicesData.length} services with solvent consumable`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

seedServices();
