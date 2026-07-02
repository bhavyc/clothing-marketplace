const { PrismaClient } = require("../src/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:123456@localhost:5432/boutique_db?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database starting...");

  // Cleanup existing products to avoid duplicates
  await prisma.product.deleteMany({});
  console.log("Cleaned up existing products");

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const sellerPasswordHash = await bcrypt.hash("seller123", 10);
  const customerPasswordHash = await bcrypt.hash("customer123", 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@boutique.com" },
    update: {},
    create: {
      email: "admin@boutique.com",
      name: "Boutique Owner Admin",
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin seeded:", admin.email);

  // 2. Create Seller
  const sellerUser = await prisma.user.upsert({
    where: { email: "seller@boutique.com" },
    update: {},
    create: {
      email: "seller@boutique.com",
      name: "Heritage Weavers & Tailors",
      password: sellerPasswordHash,
      role: "SELLER",
    },
  });
  console.log("Seller user seeded:", sellerUser.email);

  // 3. Create Seller Profile
  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      shopName: "Kashmir Heritage",
      description: "Authentic hand-embroidered Cashmere pherans, wool coordinates sets, and pure silk attire direct from artisans.",
      isApproved: true,
      bankName: "State Bank of India",
      bankAccount: "12345678901",
      bankIfsc: "SBIN0001234",
    },
  });
  console.log("Seller profile seeded for shop:", sellerProfile.shopName);

  // 4. Create Customer
  const customer = await prisma.user.upsert({
    where: { email: "customer@boutique.com" },
    update: {},
    create: {
      email: "customer@boutique.com",
      name: "Boutique Admirer Customer",
      password: customerPasswordHash,
      role: "CUSTOMER",
    },
  });
  console.log("Customer seeded:", customer.email);

  // 5. Create Promo Coupon PAY5
  const couponPay5 = await prisma.coupon.upsert({
    where: { code: "PAY5" },
    update: {},
    create: {
      code: "PAY5",
      description: "5% off on Prepaid checkout orders",
      discountPercent: 5.0,
      minOrderValue: 1000.0,
      isPrepaidOnly: true,
      isActive: true,
    },
  });
  console.log("Coupon PAY5 seeded:", couponPay5.code);

  // 6. Create Initial Products
  // Product 1
  const product1 = await prisma.product.create({
    data: {
      title: "Aari Embroidered Velvet Pheran Set",
      description: "Stunning hand-crafted Kashmiri Aari embroidery on premium micro-velvet. Tailored coord set featuring a loose silhouette pheran top and straight trousers.",
      category: "Pheran Set",
      collection: "Aari Embroidery",
      isBestseller: true,
      fabricDetails: "Silk Micro-Velvet",
      careInstructions: "Dry Clean Only",
      deliveryTimeline: "10-15 Days",
      isSet: true,
      tier: "LUXE",
      topLength: "45",
      pantLength: "38",
      sleeveLength: "22",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80"
      ]),
      sellerId: sellerProfile.id,
      variants: {
        create: [
          { topSize: "S", bottomSize: "S", price: 8500, stock: 15 },
          { topSize: "M", bottomSize: "M", price: 8500, stock: 20 },
          { topSize: "L", bottomSize: "L", price: 9200, stock: 10 },
          { topSize: "XL", bottomSize: "XL", price: 9200, stock: 5 },
        ]
      },
      options: {
        create: [
          { optionName: "Dupatta", optionValue: "With Dupatta", priceAdjustment: 1500 },
          { optionName: "Dupatta", optionValue: "Without Dupatta", priceAdjustment: 0 },
        ]
      }
    }
  });
  console.log("Product seeded:", product1.title);

  // Product 2
  const product2 = await prisma.product.create({
    data: {
      title: "Sage Green Summer Linen Coord Set",
      description: "Minimalist organic linen coord set with custom collar stitching detail and straight pant trousers. Elegant and breathable daily wear.",
      category: "Kurta",
      collection: "Summer Linen",
      isBestseller: true,
      fabricDetails: "100% Organic French Linen",
      careInstructions: "Gentle Handwash Cold",
      deliveryTimeline: "7-10 Days",
      isSet: true,
      tier: "INDI",
      topLength: "32",
      pantLength: "36",
      sleeveLength: "18",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=700&q=80"
      ]),
      sellerId: sellerProfile.id,
      variants: {
        create: [
          { topSize: "S", bottomSize: "S", price: 4200, stock: 12 },
          { topSize: "M", bottomSize: "M", price: 4200, stock: 18 },
          { topSize: "L", bottomSize: "L", price: 4500, stock: 8 },
        ]
      }
    }
  });
  console.log("Product seeded:", product2.title);

  // Product 3
  const product3 = await prisma.product.create({
    data: {
      title: "Crimson Anarkali Silk Set",
      description: "Exquisite raw silk Anarkali dress set featuring gold border details and an organza dupatta. Tailored silhouette for premium festive occasions.",
      category: "Pheran Set",
      collection: "Sale",
      isBestseller: true,
      fabricDetails: "Raw Silk Top & Pants, Organza Dupatta",
      careInstructions: "Dry Clean Only",
      deliveryTimeline: "12-18 Days",
      isSet: true,
      tier: "LUXE",
      topLength: "50",
      pantLength: "38",
      sleeveLength: "20",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80"
      ]),
      sellerId: sellerProfile.id,
      variants: {
        create: [
          { topSize: "S", bottomSize: "S", price: 12500, stock: 6 },
          { topSize: "M", bottomSize: "M", price: 12500, stock: 8 },
          { topSize: "L", bottomSize: "L", price: 13500, stock: 4 },
        ]
      },
      options: {
        create: [
          { optionName: "Inner Lining", optionValue: "With Silk Inner", priceAdjustment: 1000 },
          { optionName: "Inner Lining", optionValue: "Without Inner", priceAdjustment: 0 },
        ]
      }
    }
  });
  console.log("Product seeded:", product3.title);

  // Product 4
  const product4 = await prisma.product.create({
    data: {
      title: "Ivory Cotton-Linen Tunic",
      description: "Comfortable and breathable casual tunic with delicate sleeve embroidery detail. Classic silhouette for effortless daily styling.",
      category: "Kurta",
      collection: "Summer Linen",
      isBestseller: true,
      fabricDetails: "Cotton Linen Blend",
      careInstructions: "Machine Wash Cold",
      deliveryTimeline: "5-7 Days",
      isSet: false,
      tier: "INDI",
      topLength: "36",
      sleeveLength: "16",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=700&q=80"
      ]),
      sellerId: sellerProfile.id,
      variants: {
        create: [
          { topSize: "S", price: 3200, stock: 20 },
          { topSize: "M", price: 3200, stock: 25 },
          { topSize: "L", price: 3500, stock: 15 },
        ]
      }
    }
  });
  console.log("Product seeded:", product4.title);

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
