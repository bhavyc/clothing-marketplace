import prisma from "@/lib/prisma";
import ProductDetailClient from "@/components/ProductDetailClient";
import { notFound } from "next/navigation";

export const revalidate = 0; // Fresh details per load

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  let product: any = null;

  if (id.startsWith("mock-")) {
    // Return matching mock product
    const mockProducts = [
      {
        id: "mock-1",
        title: "Aari Embroidered Velvet Pheran Set",
        description: "Stunning hand-crafted Kashmiri Aari embroidery on premium micro-velvet. A perfect blend of heritage art and contemporary style.",
        category: "Pheran Set",
        collection: "Aari Embroidery",
        isBestseller: true,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80",
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80"
        ]),
        seller: { shopName: "Kashmir Heritage" },
        fabricDetails: "Premium Micro-Velvet",
        careInstructions: "Dry Clean Only",
        deliveryTimeline: "10-15 Days",
        isSet: true,
        topLength: "45",
        pantLength: "38",
        sleeveLength: "22",
        variants: [
          { id: "var-1a", topSize: "S", bottomSize: "S", price: 8500, stock: 10 },
          { id: "var-1b", topSize: "M", bottomSize: "M", price: 8500, stock: 12 },
          { id: "var-1c", topSize: "L", bottomSize: "L", price: 9200, stock: 5 },
          { id: "var-1d", topSize: "XL", bottomSize: "XL", price: 9200, stock: 3 },
        ],
        options: [
          { id: "opt-1", optionName: "Dupatta", optionValue: "With Dupatta", priceAdjustment: 1500 },
          { id: "opt-2", optionName: "Dupatta", optionValue: "Without Dupatta", priceAdjustment: 0 },
        ],
      },
      {
        id: "mock-2",
        title: "Sage Green Summer Linen Coord Set",
        description: "Minimalist linen coord set with custom collar stitching and straight pants. Ideal for warm summer breeze and sophisticated look.",
        category: "Kurta",
        collection: "Summer Linen",
        isBestseller: true,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80",
          "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=700&q=80"
        ]),
        seller: { shopName: "Linen Loom" },
        fabricDetails: "Pure Organic French Linen",
        careInstructions: "Gentle Hand Wash in Cold Water",
        deliveryTimeline: "7-10 Days",
        isSet: true,
        topLength: "32",
        pantLength: "36",
        sleeveLength: "18",
        variants: [
          { id: "var-2a", topSize: "S", bottomSize: "S", price: 4200, stock: 8 },
          { id: "var-2b", topSize: "M", bottomSize: "M", price: 4200, stock: 10 },
          { id: "var-2c", topSize: "L", bottomSize: "L", price: 4500, stock: 6 },
        ],
        options: [],
      },
      {
        id: "mock-3",
        title: "Crimson Anarkali Silk Set",
        description: "Exquisite raw silk Anarkali dress set with gold border and organza dupatta. Perfectly suited for festive gatherings and wedding affairs.",
        category: "Pheran Set",
        collection: "Luxe Festive",
        isBestseller: true,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80"
        ]),
        seller: { shopName: "Royal Silks" },
        fabricDetails: "Raw Silk Top, Santoon Salwar, Organza Dupatta",
        careInstructions: "Dry Clean Only",
        deliveryTimeline: "12-18 Days",
        isSet: true,
        topLength: "50",
        pantLength: "38",
        sleeveLength: "20",
        variants: [
          { id: "var-3a", topSize: "S", bottomSize: "S", price: 12500, stock: 4 },
          { id: "var-3b", topSize: "M", bottomSize: "M", price: 12500, stock: 5 },
          { id: "var-3c", topSize: "L", bottomSize: "L", price: 13500, stock: 2 },
        ],
        options: [
          { id: "opt-3", optionName: "Inner Lining", optionValue: "With Silk Inner", priceAdjustment: 1000 },
          { id: "opt-4", optionName: "Inner Lining", optionValue: "Without Inner", priceAdjustment: 0 },
        ],
      },
      {
        id: "mock-4",
        title: "Ivory Cotton-Linen Tunic",
        description: "Comfortable and breathable casual tunic with delicate sleeve embroidery. Made for easy styling and daily premium comfort.",
        category: "Kurta",
        collection: "Summer Linen",
        isBestseller: true,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=700&q=80"
        ]),
        seller: { shopName: "Linen Loom" },
        fabricDetails: "60% Cotton, 40% Linen Blend",
        careInstructions: "Machine Wash Cold, Iron on Reverse",
        deliveryTimeline: "5-7 Days",
        isSet: false,
        topLength: "36",
        pantLength: null,
        sleeveLength: "16",
        variants: [
          { id: "var-4a", topSize: "S", bottomSize: null, price: 3200, stock: 12 },
          { id: "var-4b", topSize: "M", bottomSize: null, price: 3200, stock: 15 },
          { id: "var-4c", topSize: "L", bottomSize: null, price: 3500, stock: 8 },
        ],
        options: [],
      },
    ];

    product = mockProducts.find((p) => p.id === id);
  } else {
    try {
      product = await prisma.product.findUnique({
        where: { id },
        include: {
          seller: {
            select: { shopName: true },
          },
          variants: true,
          options: true,
        },
      });
    } catch (e) {
      console.error("Prisma error in fetching product details:", e);
    }
  }

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
