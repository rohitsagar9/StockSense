/**
 * ==============================================================================
 * PRISMA DATABASE SEEDER (prisma/seed.js)
 * ==============================================================================
 * Populates initial data for testing and local development:
 * - Admin Manager & Staff user accounts
 * - Physical & Virtual Warehouses / Locations
 * - Product Categories & Initial Catalog
 * - Starting Stock Levels & Sample Operations
 * ==============================================================================
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting StockSense database seeding...");

  // 1. Clean existing records (in reverse relation order)
  console.log("🧹 Clearing old data...");
  await prisma.stockMove.deleteMany({});
  await prisma.operationLine.deleteMany({});
  await prisma.operation.deleteMany({});
  await prisma.stockLevel.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.warehouse.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  console.log("👤 Creating initial users...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);

  const manager = await prisma.user.create({
    data: {
      name: "Alex Inventory Manager",
      email: "manager@stocksense.com",
      password: hashedPassword,
      role: "MANAGER",
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Sam Warehouse Staff",
      email: "staff@stocksense.com",
      password: staffPassword,
      role: "STAFF",
    },
  });

  // 3. Create Warehouses
  console.log("🏭 Creating warehouses...");
  const mainWarehouse = await prisma.warehouse.create({
    data: {
      name: "Main Central Warehouse",
      code: "WH-MAIN",
      address: "Plot 42, Industrial Area, Hyderabad",
      isActive: true,
    },
  });

  const secondaryDepot = await prisma.warehouse.create({
    data: {
      name: "North Logistics Depot",
      code: "WH-NORTH",
      address: "Warehouse 12, Northern Ring Rd",
      isActive: true,
    },
  });

  // 4. Create Locations (Virtual Partner Locations + Internal Warehouse Locations)
  console.log("📍 Creating warehouse and virtual locations...");
  
  // Virtual external locations
  const vendorLocation = await prisma.location.create({
    data: {
      name: "Partner Vendors",
      code: "VIRTUAL/VENDOR",
      type: "VENDOR",
    },
  });

  const customerLocation = await prisma.location.create({
    data: {
      name: "Customers & Shipments",
      code: "VIRTUAL/CUSTOMER",
      type: "CUSTOMER",
    },
  });

  const scrapLocation = await prisma.location.create({
    data: {
      name: "Inventory Scrap & Loss",
      code: "VIRTUAL/SCRAP",
      type: "INVENTORY_LOSS",
    },
  });

  // Internal locations
  const mainStock = await prisma.location.create({
    data: {
      name: "Central Storage (Stock)",
      code: "WH-MAIN/STOCK",
      type: "INTERNAL",
      warehouseId: mainWarehouse.id,
    },
  });

  const prodRack = await prisma.location.create({
    data: {
      name: "Production Floor Rack",
      code: "WH-MAIN/PROD",
      type: "INTERNAL",
      warehouseId: mainWarehouse.id,
    },
  });

  const shelfA = await prisma.location.create({
    data: {
      name: "Shelf A-10",
      code: "WH-MAIN/SHELF-A",
      type: "INTERNAL",
      warehouseId: mainWarehouse.id,
    },
  });

  const northStorage = await prisma.location.create({
    data: {
      name: "North Transit Bay",
      code: "WH-NORTH/BAY-1",
      type: "INTERNAL",
      warehouseId: secondaryDepot.id,
    },
  });

  // 5. Create Categories
  console.log("📦 Creating product categories...");
  const catRaw = await prisma.category.create({
    data: {
      name: "Raw Materials",
      description: "Metals, plastics, and foundational manufacturing inputs",
    },
  });

  const catFinished = await prisma.category.create({
    data: {
      name: "Finished Goods",
      description: "Assembled, packaged products ready for customer delivery",
    },
  });

  const catHardware = await prisma.category.create({
    data: {
      name: "Hardware & Fasteners",
      description: "Bolts, screws, brackets, and small components",
    },
  });

  // 6. Create Products
  console.log("🛒 Creating products...");
  const steelRods = await prisma.product.create({
    data: {
      name: "Steel Rods 10mm",
      sku: "RAW-STEEL-10MM",
      description: "High-grade structural carbon steel rods",
      categoryId: catRaw.id,
      unitOfMeasure: "kg",
      reorderLevel: 30,
      reorderQty: 100,
    },
  });

  const chairs = await prisma.product.create({
    data: {
      name: "Ergonomic Mesh Office Chair",
      sku: "FURN-CHAIR-ERGO",
      description: "Adjustable lumbar support black mesh desk chair",
      categoryId: catFinished.id,
      unitOfMeasure: "Units",
      reorderLevel: 8,
      reorderQty: 25,
    },
  });

  const screws = await prisma.product.create({
    data: {
      name: "Hex Socket Screws M8",
      sku: "FAST-SCREW-M8",
      description: "Stainless steel grade 304 hex bolts",
      categoryId: catHardware.id,
      unitOfMeasure: "Units",
      reorderLevel: 100,
      reorderQty: 500,
    },
  });

  const alumSheets = await prisma.product.create({
    data: {
      name: "Anodized Aluminum Sheet 2mm",
      sku: "RAW-ALUM-2MM",
      description: "2m x 1m 2mm anodized aluminum plate",
      categoryId: catRaw.id,
      unitOfMeasure: "Sheets",
      reorderLevel: 15,
      reorderQty: 50,
    },
  });

  // 7. Initial Stock Levels
  console.log("📊 Setting up stock levels...");
  await prisma.stockLevel.createMany({
    data: [
      { productId: steelRods.id, locationId: mainStock.id, quantity: 150 },
      { productId: steelRods.id, locationId: prodRack.id, quantity: 20 },
      { productId: chairs.id, locationId: mainStock.id, quantity: 18 },
      { productId: screws.id, locationId: mainStock.id, quantity: 45 }, // Below reorderLevel (100) -> Low Stock alert
      { productId: alumSheets.id, locationId: mainStock.id, quantity: 0 }, // 0 -> Out of Stock alert
    ],
  });

  // 8. Sample Operations (Receipts, Deliveries, Transfers)
  console.log("📋 Creating sample operations and stock ledger entries...");
  
  // A. Completed Receipt from Vendor
  const receipt1 = await prisma.operation.create({
    data: {
      referenceNo: "REC-2026-0001",
      type: "RECEIPT",
      status: "DONE",
      sourceLocationId: vendorLocation.id,
      destLocationId: mainStock.id,
      partnerName: "Apex Steel Suppliers Ltd",
      notes: "Monthly bulk delivery of structural steel",
      createdById: manager.id,
      scheduledDate: new Date(),
      completedDate: new Date(),
      lines: {
        create: [
          {
            productId: steelRods.id,
            demandQty: 100,
            doneQty: 100,
          },
        ],
      },
    },
  });

  // StockMove ledger record for receipt1
  await prisma.stockMove.create({
    data: {
      operationId: receipt1.id,
      productId: steelRods.id,
      sourceLocationId: vendorLocation.id,
      destLocationId: mainStock.id,
      quantity: 100,
      moveType: "RECEIPT",
      movedById: manager.id,
    },
  });

  // B. Pending Receipt
  await prisma.operation.create({
    data: {
      referenceNo: "REC-2026-0002",
      type: "RECEIPT",
      status: "READY",
      sourceLocationId: vendorLocation.id,
      destLocationId: mainStock.id,
      partnerName: "Fastener Global Corp",
      notes: "Replenishment for hex screws",
      createdById: staff.id,
      scheduledDate: new Date(Date.now() + 86400000), // tomorrow
      lines: {
        create: [
          {
            productId: screws.id,
            demandQty: 500,
            doneQty: 0,
          },
        ],
      },
    },
  });

  // C. Completed Delivery Order
  const delivery1 = await prisma.operation.create({
    data: {
      referenceNo: "DEL-2026-0001",
      type: "DELIVERY",
      status: "DONE",
      sourceLocationId: mainStock.id,
      destLocationId: customerLocation.id,
      partnerName: "Acme Tech Workspace",
      notes: "Client order #4920 for office chairs",
      createdById: manager.id,
      scheduledDate: new Date(),
      completedDate: new Date(),
      lines: {
        create: [
          {
            productId: chairs.id,
            demandQty: 6,
            doneQty: 6,
          },
        ],
      },
    },
  });

  await prisma.stockMove.create({
    data: {
      operationId: delivery1.id,
      productId: chairs.id,
      sourceLocationId: mainStock.id,
      destLocationId: customerLocation.id,
      quantity: 6,
      moveType: "DELIVERY",
      movedById: staff.id,
    },
  });

  // D. Pending Delivery Order
  await prisma.operation.create({
    data: {
      referenceNo: "DEL-2026-0002",
      type: "DELIVERY",
      status: "WAITING",
      sourceLocationId: mainStock.id,
      destLocationId: customerLocation.id,
      partnerName: "Zenith Coworking Hub",
      notes: "Pending final payment confirmation",
      createdById: staff.id,
      scheduledDate: new Date(Date.now() + 172800000), // 2 days
      lines: {
        create: [
          {
            productId: chairs.id,
            demandQty: 4,
            doneQty: 0,
          },
        ],
      },
    },
  });

  // E. Internal Transfer
  const transfer1 = await prisma.operation.create({
    data: {
      referenceNo: "TRF-2026-0001",
      type: "TRANSFER",
      status: "DONE",
      sourceLocationId: mainStock.id,
      destLocationId: prodRack.id,
      notes: "Transfer raw steel rods to production floor",
      createdById: staff.id,
      scheduledDate: new Date(),
      completedDate: new Date(),
      lines: {
        create: [
          {
            productId: steelRods.id,
            demandQty: 20,
            doneQty: 20,
          },
        ],
      },
    },
  });

  await prisma.stockMove.create({
    data: {
      operationId: transfer1.id,
      productId: steelRods.id,
      sourceLocationId: mainStock.id,
      destLocationId: prodRack.id,
      quantity: 20,
      moveType: "TRANSFER",
      movedById: staff.id,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("--------------------------------------------------");
  console.log("Default Login Credentials:");
  console.log("  Manager: manager@stocksense.com  (pass: admin123)");
  console.log("  Staff:   staff@stocksense.com    (pass: staff123)");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
