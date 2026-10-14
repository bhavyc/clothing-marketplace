import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { DEMO_EMAIL, DEMO_NAME, DEMO_OTP, DEMO_PHONE_NUMBER, getOrCreateDemoUser } from "@/lib/demo-auth";

export async function populateDummyData() {
  const results = {
    usersCreated: 0,
    sellersCreated: 0,
    productsCreated: 0,
    couponsCreated: 0,
    ordersCreated: 0,
    message: "",
  };

  const adminHash = await bcrypt.hash("admin123", 10);
  const sellerHash = await bcrypt.hash("seller123", 10);
  const reviewerHash = await bcrypt.hash("reviewer123456", 10);

  // 1. Ensure Admin User exists
  await prisma.user.upsert({
    where: { email: "admin@boutique.com" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@boutique.com",
      name: "Boutique Owner Admin",
      password: adminHash,
      role: "ADMIN",
    },
  });

  // 2. Ensure Official Seller and SellerProfile exists
  const sellerUser = await prisma.user.upsert({
    where: { email: "seller@boutique.com" },
    update: { role: "SELLER" },
    create: {
      email: "seller@boutique.com",
      name: "Heritage Weavers & Tailors",
      password: sellerHash,
      role: "SELLER",
    },
  });

  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser.id },
    update: {
      shopName: "Kashmir Heritage & Luxury Looms",
      isApproved: true,
    },
    create: {
      userId: sellerUser.id,
      shopName: "Kashmir Heritage & Luxury Looms",
      description: "Authentic hand-embroidered Cashmere pherans, pure silk coord sets, and velvet couture direct from artisans.",
      isApproved: true,
      bankName: "State Bank of India",
      bankAccount: "12345678901",
      bankIfsc: "SBIN0001234",
    },
  });
  results.sellersCreated = 1;

  // 3. Ensure App Store Reviewer / Demo Customer exists with active credentials
  const demoReviewer = await getOrCreateDemoUser(DEMO_PHONE_NUMBER);
  results.usersCreated = 3;

  // 4. Upsert Active Promo Coupons
  const dummyCoupons = [
    {
      code: "PAY5",
      description: "5% off on Prepaid orders",
      discountPercent: 5.0,
      discountAmount: 0.0,
      minOrderValue: 1000.0,
      isPrepaidOnly: true,
      isActive: true,
    },
    {
      code: "WELCOME10",
      description: "10% off on your first luxury order",
      discountPercent: 10.0,
      discountAmount: 0.0,
      minOrderValue: 1999.0,
      isPrepaidOnly: false,
      isActive: true,
    },
    {
      code: "APPSTORE20",
      description: "App Store Exclusive 20% Discount",
      discountPercent: 20.0,
      discountAmount: 0.0,
      minOrderValue: 2500.0,
      isPrepaidOnly: false,
      isActive: true,
    },
    {
      code: "FESTIVE500",
      description: "Flat Rs. 500 off on festive orders above Rs. 4,999",
      discountPercent: 0.0,
      discountAmount: 500.0,
      minOrderValue: 4999.0,
      isPrepaidOnly: false,
      isActive: true,
    },
  ];

  for (const c of dummyCoupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  results.couponsCreated = dummyCoupons.length;

  // 5. Upsert Gift Cards
  const dummyGiftCards = [
    { code: "GIFT1000", balance: 1000.0, isActive: true },
    { code: "VIPLUXE", balance: 5000.0, isActive: true },
  ];
  for (const gc of dummyGiftCards) {
    await prisma.giftCard.upsert({
      where: { code: gc.code },
      update: gc,
      create: gc,
    });
  }

  // 6. Luxury Dummy Products Catalog
  const dummyProductsData = [
    {
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
      variants: [
        { topSize: "S", bottomSize: "S", price: 8500, stock: 15 },
        { topSize: "M", bottomSize: "M", price: 8500, stock: 20 },
        { topSize: "L", bottomSize: "L", price: 9200, stock: 10 },
        { topSize: "XL", bottomSize: "XL", price: 9200, stock: 8 },
      ],
      options: [
        { optionName: "Dupatta", optionValue: "With Dupatta", priceAdjustment: 1500 },
        { optionName: "Dupatta", optionValue: "Without Dupatta", priceAdjustment: 0 },
      ]
    },
    {
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
      variants: [
        { topSize: "S", bottomSize: "S", price: 4200, stock: 12 },
        { topSize: "M", bottomSize: "M", price: 4200, stock: 18 },
        { topSize: "L", bottomSize: "L", price: 4500, stock: 14 },
      ],
      options: []
    },
    {
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
      variants: [
        { topSize: "S", bottomSize: "S", price: 12500, stock: 6 },
        { topSize: "M", bottomSize: "M", price: 12500, stock: 10 },
        { topSize: "L", bottomSize: "L", price: 13500, stock: 5 },
      ],
      options: [
        { optionName: "Inner Lining", optionValue: "With Silk Inner", priceAdjustment: 1000 },
        { optionName: "Inner Lining", optionValue: "Without Inner", priceAdjustment: 0 },
      ]
    },
    {
      title: "Ivory Cotton-Linen Tunic",
      description: "Comfortable and breathable casual tunic with delicate sleeve embroidery detail. Classic silhouette for effortless daily styling.",
      category: "Kurta",
      collection: "Summer Linen",
      isBestseller: false,
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
      variants: [
        { topSize: "S", price: 3200, stock: 20 },
        { topSize: "M", price: 3200, stock: 25 },
        { topSize: "L", price: 3500, stock: 15 },
      ],
      options: []
    },
    {
      title: "Royal Maroon Handcrafted Tilla Pheran",
      description: "Heritage Kashmiri bridal Tilla metallic thread needlework adorned on deep maroon pure makhmal velvet. An heirloom piece tailored for grand festivities.",
      category: "Pheran Set",
      collection: "Tilla Royalty",
      isBestseller: true,
      fabricDetails: "Pure Makhmal Silk Velvet & Genuine Tilla Zari",
      careInstructions: "Dry Clean Only - Preserve in Muslin",
      deliveryTimeline: "15-20 Days",
      isSet: true,
      tier: "LUXE",
      topLength: "46",
      pantLength: "39",
      sleeveLength: "21",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80"
      ]),
      variants: [
        { topSize: "S", bottomSize: "S", price: 11900, stock: 8 },
        { topSize: "M", bottomSize: "M", price: 11900, stock: 12 },
        { topSize: "L", bottomSize: "L", price: 12800, stock: 7 },
      ],
      options: [
        { optionName: "Shawl Inclusion", optionValue: "Add Pure Cashmere Shawl", priceAdjustment: 4500 },
        { optionName: "Shawl Inclusion", optionValue: "Standard Velvet Dupatta", priceAdjustment: 0 },
      ]
    },
    {
      title: "Pastel Lavender Chanderi Silk Kurta Set",
      description: "Subtle and sophisticated Chanderi silk kurta paired with tonal cigarette trousers and scalloped hand-cut zari organza dupatta.",
      category: "Kurta",
      collection: "Festive Silk",
      isBestseller: true,
      fabricDetails: "Handwoven Chanderi Silk & Pure Cotton Lining",
      careInstructions: "Dry Clean Only",
      deliveryTimeline: "7-10 Days",
      isSet: true,
      tier: "LUXE",
      topLength: "44",
      pantLength: "37",
      sleeveLength: "19",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80",
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80"
      ]),
      variants: [
        { topSize: "S", bottomSize: "S", price: 6800, stock: 15 },
        { topSize: "M", bottomSize: "M", price: 6800, stock: 20 },
        { topSize: "L", bottomSize: "L", price: 7400, stock: 10 },
      ],
      options: []
    },
    {
      title: "Golden Mustard Georgette Sharara Set",
      description: "Vibrant festive three-piece set featuring a mirror-embellished short peplum kurta, flared tiered sharara pants, and a flowy dupatta.",
      category: "Pheran Set",
      collection: "Wedding Edit",
      isBestseller: false,
      fabricDetails: "Featherlight Micro Georgette with Santoon Lining",
      careInstructions: "Dry Clean Only",
      deliveryTimeline: "10-12 Days",
      isSet: true,
      tier: "LUXE",
      topLength: "34",
      pantLength: "40",
      sleeveLength: "17",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80"
      ]),
      variants: [
        { topSize: "S", bottomSize: "S", price: 9500, stock: 10 },
        { topSize: "M", bottomSize: "M", price: 9500, stock: 15 },
        { topSize: "L", bottomSize: "L", price: 10200, stock: 8 },
      ],
      options: []
    },
    {
      title: "Midnight Black Chikankari Organza Coord",
      description: "Dramatic yet graceful midnight sheer organza kurta lined in pure mulmul with tonal white shadow-work Chikankari embroidery.",
      category: "Kurta",
      collection: "Chikankari",
      isBestseller: true,
      fabricDetails: "Glass Sheer Organza & Soft Mulmul Inner",
      careInstructions: "Gentle Cold Handwash or Dry Clean",
      deliveryTimeline: "7-10 Days",
      isSet: true,
      tier: "INDI",
      topLength: "42",
      pantLength: "36",
      sleeveLength: "20",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=700&q=80"
      ]),
      variants: [
        { topSize: "S", bottomSize: "S", price: 5600, stock: 14 },
        { topSize: "M", bottomSize: "M", price: 5600, stock: 18 },
        { topSize: "L", bottomSize: "L", price: 6100, stock: 12 },
      ],
      options: []
    }
  ];

  const createdProducts: any[] = [];
  for (const p of dummyProductsData) {
    let existing = await prisma.product.findFirst({
      where: { title: p.title, sellerId: sellerProfile.id },
      include: { variants: true }
    });

    if (!existing) {
      existing = await prisma.product.create({
        data: {
          title: p.title,
          description: p.description,
          category: p.category,
          collection: p.collection,
          isBestseller: p.isBestseller,
          fabricDetails: p.fabricDetails,
          careInstructions: p.careInstructions,
          deliveryTimeline: p.deliveryTimeline,
          isSet: p.isSet,
          tier: p.tier,
          topLength: p.topLength,
          pantLength: p.pantLength,
          sleeveLength: p.sleeveLength,
          images: p.images,
          sellerId: sellerProfile.id,
          variants: {
            create: p.variants,
          },
          options: {
            create: p.options,
          },
        },
        include: { variants: true }
      });
      results.productsCreated++;
    }
    createdProducts.push(existing);
  }

  // 7. Dummy Orders for Demo / App Store Review and Analytics
  const sampleVariants = createdProducts.flatMap(p => p.variants || []);
  if (sampleVariants.length > 0) {
    const dummyOrdersData = [
      {
        orderNumber: "VB-DEMO-1001",
        customerName: "App Store Reviewer",
        customerEmail: DEMO_EMAIL,
        customerPhone: DEMO_PHONE_NUMBER,
        shippingAddress: "Flat 402, Royal Palms, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400050",
        subtotal: 9200.0,
        discountAmount: 0.0,
        totalAmount: 9200.0,
        paymentType: "PREPAID",
        paymentStatus: "PAID",
        paymentId: "pay_demo_1001_apple",
        status: "DELIVERED",
        trackingCompany: "BlueDart Express",
        trackingNumber: "BD-88291045",
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        variantIndex: 0,
        quantity: 1,
      },
      {
        orderNumber: "VB-DEMO-1002",
        customerName: "Priyanka Sharma",
        customerEmail: "priyanka.s@gmail.com",
        customerPhone: "+919811223344",
        shippingAddress: "Plot 18, Sector 15, Golf Course Road",
        city: "Gurugram",
        state: "Haryana",
        pincode: "122002",
        subtotal: 4200.0,
        discountAmount: 210.0,
        totalAmount: 3990.0,
        paymentType: "PREPAID",
        paymentStatus: "PAID",
        paymentId: "pay_demo_1002_hdfc",
        status: "SHIPPED",
        trackingCompany: "Delhivery Surface",
        trackingNumber: "DL-90123841",
        shippedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        couponUsed: "PAY5",
        variantIndex: Math.min(1, sampleVariants.length - 1),
        quantity: 1,
      },
      {
        orderNumber: "VB-DEMO-1003",
        customerName: "Ananya Deshmukh",
        customerEmail: "ananya.d@outlook.com",
        customerPhone: "+919877112233",
        shippingAddress: "Bungalow 7, Koregaon Park Lane 3",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411001",
        subtotal: 12500.0,
        discountAmount: 1250.0,
        totalAmount: 11250.0,
        paymentType: "PREPAID",
        paymentStatus: "PAID",
        paymentId: "pay_demo_1003_icici",
        status: "PROCESSING",
        couponUsed: "WELCOME10",
        variantIndex: Math.min(2, sampleVariants.length - 1),
        quantity: 1,
      },
      {
        orderNumber: "VB-DEMO-1004",
        customerName: "App Store Reviewer",
        customerEmail: DEMO_EMAIL,
        customerPhone: DEMO_PHONE_NUMBER,
        shippingAddress: "Tech Park Residences, Whitefield",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560066",
        subtotal: 6800.0,
        discountAmount: 0.0,
        totalAmount: 6800.0,
        paymentType: "PREPAID",
        paymentStatus: "PAID",
        paymentId: "pay_demo_1004_apple",
        status: "CONFIRMED",
        variantIndex: Math.min(3, sampleVariants.length - 1),
        quantity: 1,
      },
    ];

    for (const ord of dummyOrdersData) {
      const existingOrd = await prisma.order.findUnique({
        where: { orderNumber: ord.orderNumber },
      });

      if (!existingOrd) {
        const selectedVariant = sampleVariants[ord.variantIndex] || sampleVariants[0];
        await prisma.order.create({
          data: {
            orderNumber: ord.orderNumber,
            userId: ord.customerEmail === DEMO_EMAIL ? demoReviewer.id : null,
            customerName: ord.customerName,
            customerEmail: ord.customerEmail,
            customerPhone: ord.customerPhone,
            shippingAddress: ord.shippingAddress,
            city: ord.city,
            state: ord.state,
            pincode: ord.pincode,
            subtotal: ord.subtotal,
            discountAmount: ord.discountAmount,
            totalAmount: ord.totalAmount,
            paymentType: ord.paymentType,
            paymentStatus: ord.paymentStatus,
            paymentId: ord.paymentId,
            status: ord.status,
            trackingCompany: ord.trackingCompany,
            trackingNumber: ord.trackingNumber,
            shippedAt: ord.shippedAt,
            deliveredAt: ord.deliveredAt,
            couponUsed: ord.couponUsed,
            items: {
              create: [
                {
                  variantId: selectedVariant.id,
                  quantity: ord.quantity,
                  priceAtPurchase: ord.subtotal,
                  selectedOptions: "Standard Silk Tailoring",
                }
              ]
            }
          }
        });
        results.ordersCreated++;
      }
    }
  }

  results.message = `Successfully populated dummy store data: 8 Luxury Products, 4 Active Coupons, 2 Gift Cards, Demo Orders, and App Store Reviewer login credentials!`;
  return results;
}
