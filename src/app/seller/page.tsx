"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  IndianRupee,
  AlertTriangle,
  Upload,
  LogOut,
  Scissors,
  CheckCircle,
  Check,
  X,
  Undo2,
  RefreshCw,
  ShoppingBag,
  Truck
} from "lucide-react";
import { signOut } from "next-auth/react";

interface VariantInput {
  topSize: string;
  bottomSize: string;
  price: number;
  stock: number;
}

interface OptionInput {
  optionName: string;
  optionValue: string;
  priceAdjustment: number;
}

const renderSelectedOptions = (optionsStr: string | null) => {
  if (!optionsStr) return null;
  if (optionsStr === "{}") return null;
  try {
    if (optionsStr.startsWith("{") && optionsStr.endsWith("}")) {
      const parsed = JSON.parse(optionsStr);
      return Object.entries(parsed)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    }
  } catch (e) {}
  return optionsStr;
};

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"overview" | "add-product" | "orders" | "returns">("overview");
  const [returns, setReturns] = useState<any[]>([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<any | null>(null);
  const [variantEditState, setVariantEditState] = useState<Record<string, { stock: number; price: number }>>({});
  const [updatingVariants, setUpdatingVariants] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "overview" || tab === "add-product" || tab === "orders" || tab === "returns") {
        setActiveTab(tab);
      }
    }
  }, []);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inventoryPage, setInventoryPage] = useState(1);
  const INVENTORY_ITEMS_PER_PAGE = 5;

  // Form State for listing new product
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Pheran Set");
  const [customCategory, setCustomCategory] = useState("");
  const [collection, setCollection] = useState("");
  const [customCollection, setCustomCollection] = useState("");
  const [tier, setTier] = useState("LUXE");
  const [fabricDetails, setFabricDetails] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [deliveryTimeline, setDeliveryTimeline] = useState("10-15 Days");
  const [isSet, setIsSet] = useState(false);
  const [topLength, setTopLength] = useState("");
  const [pantLength, setPantLength] = useState("");
  const [sleeveLength, setSleeveLength] = useState("");

  // Size Chart State
  const [sizeChartType, setSizeChartType] = useState<"STANDARD" | "IMAGE" | "CUSTOM">("STANDARD");
  const [sizeChartImageUrl, setSizeChartImageUrl] = useState("");
  const [uploadingSizeChart, setUploadingSizeChart] = useState(false);
  const [customSizeChart, setCustomSizeChart] = useState<Record<string, { chest: string; waist: string; hip: string }>>({
    S: { chest: "36", waist: "30", hip: "39" },
    M: { chest: "38", waist: "32", hip: "41" },
    L: { chest: "40", waist: "34", hip: "43" },
    XL: { chest: "42", waist: "36", hip: "45" },
  });

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [trackingCompany, setTrackingCompany] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  
  // Image URLs list
  const [imageUrl1, setImageUrl1] = useState("");
  const [imageUrl2, setImageUrl2] = useState("");
  const [imageUrl3, setImageUrl3] = useState("");
  const [imageUrl4, setImageUrl4] = useState("");
  const [imageUrl5, setImageUrl5] = useState("");
  const [imageUrl6, setImageUrl6] = useState("");
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);
  const [uploading3, setUploading3] = useState(false);
  const [uploading4, setUploading4] = useState(false);
  const [uploading5, setUploading5] = useState(false);
  const [uploading6, setUploading6] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, imageNum: 1 | 2 | 3 | 4 | 5 | 6) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imageNum === 1) setUploading1(true);
    else if (imageNum === 2) setUploading2(true);
    else if (imageNum === 3) setUploading3(true);
    else if (imageNum === 4) setUploading4(true);
    else if (imageNum === 5) setUploading5(true);
    else if (imageNum === 6) setUploading6(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/seller/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        if (imageNum === 1) setImageUrl1(data.url);
        else if (imageNum === 2) setImageUrl2(data.url);
        else if (imageNum === 3) setImageUrl3(data.url);
        else if (imageNum === 4) setImageUrl4(data.url);
        else if (imageNum === 5) setImageUrl5(data.url);
        else if (imageNum === 6) setImageUrl6(data.url);
      } else {
        alert(data.error || "Failed to upload image. Please try again.");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("A network error occurred while uploading image.");
    } finally {
      if (imageNum === 1) setUploading1(false);
      else if (imageNum === 2) setUploading2(false);
      else if (imageNum === 3) setUploading3(false);
      else if (imageNum === 4) setUploading4(false);
      else if (imageNum === 5) setUploading5(false);
      else if (imageNum === 6) setUploading6(false);
    }
  };

  // Size list & Pricing options
  const [variants, setVariants] = useState<VariantInput[]>([
    { topSize: "S", bottomSize: "S", price: 4999, stock: 10 },
    { topSize: "M", bottomSize: "M", price: 4999, stock: 10 },
    { topSize: "L", bottomSize: "L", price: 5499, stock: 5 },
    { topSize: "XL", bottomSize: "XL", price: 5499, stock: 5 },
  ]);

  // Customizable product options (e.g. Dupatta)
  const [options, setOptions] = useState<OptionInput[]>([
    { optionName: "Dupatta", optionValue: "With Dupatta", priceAdjustment: 1500 },
    { optionName: "Dupatta", optionValue: "Without Dupatta", priceAdjustment: 0 },
  ]);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load seller products
  const fetchProducts = async () => {
    if (!session?.user || (session.user as any).role !== "SELLER") return;
    try {
      setLoading(true);
      const res = await fetch("/api/seller/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
        setInventoryPage(1);
      }
    } catch (e) {
      console.error("Error loading products:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDiscount = async (productId: string) => {
    const inputElement = document.getElementById(`discount-input-${productId}`) as HTMLInputElement;
    if (!inputElement) return;

    const discountVal = parseFloat(inputElement.value);
    if (isNaN(discountVal) || discountVal < 0 || discountVal > 100) {
      alert("Please enter a valid discount percentage between 0 and 100.");
      return;
    }

    try {
      const res = await fetch("/api/seller/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          discountPercent: discountVal,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProducts((prev) =>
          prev.map((prod) =>
            prod.id === productId ? { ...prod, discountPercent: discountVal } : prod
          )
        );
        alert(`Discount of ${discountVal}% successfully applied!`);
      } else {
        alert(data.error || "Failed to update discount.");
      }
    } catch (err) {
      console.error("Error updating discount:", err);
      alert("Failed to connect to server.");
    }
  };

  const handleOpenVariantModal = (product: any) => {
    setSelectedProductForVariants(product);
    const initialStates: Record<string, { stock: number; price: number }> = {};
    product.variants.forEach((v: any) => {
      initialStates[v.id] = { stock: v.stock, price: v.price };
    });
    setVariantEditState(initialStates);
  };

  const handleUpdateVariantsSubmit = async () => {
    if (!selectedProductForVariants) return;
    setUpdatingVariants(true);

    try {
      const variantsPayload = Object.entries(variantEditState).map(([id, state]) => ({
        id,
        stock: state.stock,
        price: state.price,
      }));

      const res = await fetch("/api/seller/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductForVariants.id,
          variants: variantsPayload,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProducts((prev) =>
          prev.map((prod) =>
            prod.id === selectedProductForVariants.id 
              ? { ...prod, variants: data.product.variants } 
              : prod
          )
        );
        setSelectedProductForVariants(null);
        alert("Inventory stock and prices successfully updated!");
      } else {
        alert(data.error || "Failed to update variants.");
      }
    } catch (err) {
      console.error("Error updating variants:", err);
      alert("Failed to connect to server.");
    } finally {
      setUpdatingVariants(false);
    }
  };

  // Fetch seller returns
  const fetchReturns = async () => {
    if (!session?.user || (session.user as any).role !== "SELLER") return;
    try {
      setReturnsLoading(true);
      const res = await fetch("/api/seller/returns");
      const data = await res.json();
      if (res.ok) {
        setReturns(data.returns || []);
      }
    } catch (e) {
      console.error("Error loading returns:", e);
    } finally {
      setReturnsLoading(false);
    }
  };

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleProcessReturn = async (orderId: string, orderItemId: string, approve: boolean, confirmReceipt?: boolean) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemsToRefund: [{ orderItemId, approve, confirmReceipt }]
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: confirmReceipt
            ? "Receipt confirmed and refund credited to customer wallet."
            : approve 
              ? "Return request approved! Sizing pickup initiated."
              : "Return request rejected."
        });
        fetchReturns();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to process return." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "returns") {
      fetchReturns();
    }
  }, [activeTab, session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/seller/login");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "SELLER") {
        router.push("/"); // Redirect non-sellers to home
      } else {
        fetchProducts();
      }
    }
  }, [status, session]);

  // Handle sizes controls
  const handleAddVariant = () => {
    setVariants([...variants, { topSize: "Custom", bottomSize: "Custom", price: 4999, stock: 5 }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantInput, value: any) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    setVariants(next);
  };

  // Handle options controls
  const handleAddOption = () => {
    setOptions([...options, { optionName: "Inner Lining", optionValue: "With Inner", priceAdjustment: 1000 }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: keyof OptionInput, value: any) => {
    const next = [...options];
    next[index] = { ...next[index], [field]: value };
    setOptions(next);
  };

  const handleSizeChartImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSizeChart(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/seller/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setSizeChartImageUrl(data.url);
      } else {
        alert(data.error || "Failed to upload image. Please try again.");
      }
    } catch (err) {
      console.error("Error uploading size chart:", err);
      alert("A network error occurred.");
    } finally {
      setUploadingSizeChart(false);
    }
  };

  const handleCustomSizeChartChange = (size: string, field: "chest" | "waist" | "hip", value: string) => {
    setCustomSizeChart((prev) => ({
      ...prev,
      [size]: {
        ...prev[size],
        [field]: value
      }
    }));
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchOrders();
      } else {
        alert(data.error || "Failed to update order status.");
      }
    } catch (e) {
      console.error("Error updating status:", e);
      alert("A network error occurred.");
    }
  };

  const handleUpdateStatusSubmit = async (orderId: string, status: string) => {
    if (!trackingCompany.trim() || !trackingNumber.trim()) {
      alert("Please provide both Courier Company and Tracking Code.");
      return;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingCompany: trackingCompany.trim(),
          trackingNumber: trackingNumber.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUpdatingOrderId(null);
        setTrackingCompany("");
        setTrackingNumber("");
        fetchOrders();
      } else {
        alert(data.error || "Failed to update order status.");
      }
    } catch (e) {
      console.error("Error updating status:", e);
      alert("A network error occurred.");
    }
  };

  const fetchOrders = async () => {
    if (!session?.user || (session.user as any).role !== "SELLER") return;
    try {
      setOrdersLoading(true);
      const res = await fetch("/api/seller/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Error loading seller orders:", e);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab, session]);

  if (status === "loading" || loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-gold font-serif">
        loading seller dashboard...
      </div>
    );
  }

  // List Silhouette Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormMessage(null);

    // Step 1: Basics validation
    if (!title.trim()) {
      setFormMessage({ type: "error", text: "Please specify a product title." });
      setFormStep(1);
      setFormSubmitting(false);
      return;
    }
    if (!description.trim()) {
      setFormMessage({ type: "error", text: "Please enter a product description." });
      setFormStep(1);
      setFormSubmitting(false);
      return;
    }
    if (category === "Other" && !customCategory.trim()) {
      setFormMessage({ type: "error", text: "Please specify your custom category name." });
      setFormStep(1);
      setFormSubmitting(false);
      return;
    }
    if (collection === "Other" && !customCollection.trim()) {
      setFormMessage({ type: "error", text: "Please specify your custom collection name." });
      setFormStep(1);
      setFormSubmitting(false);
      return;
    }
    if (!fabricDetails.trim()) {
      setFormMessage({ type: "error", text: "Please specify fabric details." });
      setFormStep(1);
      setFormSubmitting(false);
      return;
    }
    if (!careInstructions.trim()) {
      setFormMessage({ type: "error", text: "Please specify care instructions." });
      setFormStep(1);
      setFormSubmitting(false);
      return;
    }

    // Step 2: Tailoring / Sizing Validation
    if (sizeChartType === "IMAGE" && !sizeChartImageUrl) {
      setFormMessage({ type: "error", text: "Please upload or specify a size chart graphic image." });
      setFormStep(2);
      setFormSubmitting(false);
      return;
    }
    const imagesToSubmit = [imageUrl1, imageUrl2, imageUrl3, imageUrl4, imageUrl5, imageUrl6].filter(Boolean);
    if (imagesToSubmit.length === 0) {
      setFormMessage({ type: "error", text: "Please upload or provide at least one silhouette image." });
      setFormStep(2);
      setFormSubmitting(false);
      return;
    }

    // Step 3: Variants & Options Validation
    if (!deliveryTimeline.trim()) {
      setFormMessage({ type: "error", text: "Please specify custom delivery timeline." });
      setFormStep(3);
      setFormSubmitting(false);
      return;
    }
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.topSize.trim() || (isSet && !v.bottomSize.trim())) {
        setFormMessage({ type: "error", text: `Please fill in all size values in row ${i + 1} of variants.` });
        setFormStep(3);
        setFormSubmitting(false);
        return;
      }
      if (isNaN(v.price) || v.price <= 0) {
        setFormMessage({ type: "error", text: `Please enter a valid price in row ${i + 1} of variants.` });
        setFormStep(3);
        setFormSubmitting(false);
        return;
      }
      if (isNaN(v.stock) || v.stock < 0) {
        setFormMessage({ type: "error", text: `Please enter a valid stock quantity in row ${i + 1} of variants.` });
        setFormStep(3);
        setFormSubmitting(false);
        return;
      }
    }

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      if (!opt.optionName.trim() || !opt.optionValue.trim()) {
        setFormMessage({ type: "error", text: `Please fill in both Option Name and Value in row ${i + 1} of add-ons.` });
        setFormStep(3);
        setFormSubmitting(false);
        return;
      }
      if (isNaN(opt.priceAdjustment)) {
        setFormMessage({ type: "error", text: `Please enter a valid price adjustment in row ${i + 1} of add-ons.` });
        setFormStep(3);
        setFormSubmitting(false);
        return;
      }
    }

    const categoryToSubmit = category === "Other" ? customCategory.trim() : category;
    const collectionToSubmit = collection === "Other" ? customCollection.trim() : (collection || null);

    try {
      const payload = {
        title,
        description,
        category: categoryToSubmit,
        collection: collectionToSubmit,
        fabricDetails,
        careInstructions,
        deliveryTimeline,
        isSet,
        tier,
        topLength: topLength || null,
        pantLength: pantLength || null,
        sleeveLength: sleeveLength || null,
        images: JSON.stringify(imagesToSubmit),
        variants,
        options,
        sizeChartType,
        sizeChartData: sizeChartType === "IMAGE"
          ? sizeChartImageUrl
          : sizeChartType === "CUSTOM"
            ? JSON.stringify(customSizeChart)
            : null
      };

      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setFormMessage({ type: "success", text: "Silhouette successfully listed! It will go live immediately." });
        // Reset form fields
        setTitle("");
        setDescription("");
        setCategory("Pheran Set");
        setCustomCategory("");
        setCollection("");
        setCustomCollection("");
        setTier("LUXE");
        setFabricDetails("");
        setCareInstructions("");
        setImageUrl1("");
        setImageUrl2("");
        setImageUrl3("");
        setImageUrl4("");
        setImageUrl5("");
        setImageUrl6("");
        setTopLength("");
        setPantLength("");
        setSleeveLength("");
        setSizeChartType("STANDARD");
        setSizeChartImageUrl("");
        setCustomSizeChart({
          S: { chest: "36", waist: "30", hip: "39" },
          M: { chest: "38", waist: "32", hip: "41" },
          L: { chest: "40", waist: "34", hip: "43" },
          XL: { chest: "42", waist: "36", hip: "45" },
        });
        setFormStep(1);
        
        fetchProducts(); // reload listings
        setTimeout(() => {
          setActiveTab("overview");
          setFormMessage(null);
        }, 2000);
      } else {
        setFormMessage({ type: "error", text: data.error || "Failed to create listing." });
      }
    } catch (err) {
      setFormMessage({ type: "error", text: "A server connection issue occurred." });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Calculate earnings mock statistic (Model A: 10% platform commission deducted)
  const totalListings = products.length;
  const inStockListings = products.filter((p) => p.variants.reduce((acc: number, v: any) => acc + v.stock, 0) > 0).length;

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-brand-charcoal text-brand-cream p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-800">
        <div className="space-y-8">
          <div className="text-left border-b border-stone-800 pb-5">
            <h1 className="font-serif text-lg tracking-widest text-brand-cream lowercase flex items-baseline gap-1">
              vamika <span className="font-serif italic text-brand-gold font-normal">&</span> bhargavi
            </h1>
            <p className="text-[9px] font-sans text-brand-gold font-bold uppercase tracking-widest mt-1">
              Merchant Portal
            </p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "overview"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 mr-3" />
              Overview & Inventory
            </button>
            <button
              onClick={() => setActiveTab("add-product")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "add-product"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <PlusCircle className="h-4 w-4 mr-3" />
              List Silhouette
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "orders"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <ShoppingBag className="h-4 w-4 mr-3" />
              Manage Orders
            </button>
            <button
              onClick={() => setActiveTab("returns")}
              className={`w-full flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "returns"
                  ? "bg-brand-gold text-brand-cream"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <Undo2 className="h-4 w-4 mr-3" />
              Returns & Logs
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-stone-800 mt-8 md:mt-0">
          <p className="text-[10px] text-gray-500 font-sans tracking-wide uppercase truncate">
            Merchant: {session?.user?.email}
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/seller/login" })}
            className="flex items-center text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors mt-3 w-full"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Exit Portal
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 sm:p-10 max-w-5xl overflow-y-auto">
        {message && (
          <div className={`mb-6 p-4 rounded-md text-xs font-sans tracking-wide ${
            message.type === "success" 
              ? "bg-green-50 text-green-800 border-l-4 border-green-600" 
              : "bg-red-50 text-red-800 border-l-4 border-red-600"
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="border-b border-[#E8DFC8] pb-4">
              <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
                merchant dashboard
              </h2>
              <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Manage your apparel variants, inventory stock and earnings ledger
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-[#FAF6F0] rounded border border-[#E8DFC8] text-brand-gold">
                  <IndianRupee className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-sans text-gray-400 uppercase tracking-widest">Total Earnings</p>
                  <p className="text-xl font-bold font-sans text-brand-charcoal mt-1">Rs. 0</p>
                  <p className="text-[9px] font-sans text-stone-400 mt-0.5 normal-case italic">Net (10% fees deducted)</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-[#FAF6F0] rounded border border-[#E8DFC8] text-[#A59578]">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-sans text-gray-400 uppercase tracking-widest">Silhouettes Listed</p>
                  <p className="text-xl font-bold font-sans text-brand-charcoal mt-1">{totalListings}</p>
                  <p className="text-[9px] font-sans text-stone-400 mt-0.5 normal-case italic">{inStockListings} currently in stock</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-md border border-[#E8DFC8] shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-[#FAF6F0] rounded border border-[#E8DFC8] text-brand-charcoal">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-sans text-gray-400 uppercase tracking-widest">Seller Status</p>
                  <p className="text-sm font-bold font-sans text-emerald-700 mt-2 uppercase tracking-wide flex items-center">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 mr-2 animate-ping" />
                    Live & Verified
                  </p>
                </div>
              </div>
            </div>

            {/* Inventory table */}
            <div className="bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#E8DFC8] bg-[#FAF6F0]">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                  apparel stock list
                </h3>
              </div>

              {products.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="h-10 w-10 text-[#E8DFC8] mx-auto mb-3" />
                  <p className="font-serif text-base text-stone-600">No silhouettes listed yet.</p>
                  <p className="font-sans text-[11px] text-gray-400 mt-1 uppercase tracking-wide">
                    Click &apos;List Silhouette&apos; in the sidebar to add your first coordinate set or pheran.
                  </p>
                </div>
              ) : (() => {
                const totalInventoryPages = Math.ceil(products.length / INVENTORY_ITEMS_PER_PAGE);
                const paginatedProducts = products.slice(
                  (inventoryPage - 1) * INVENTORY_ITEMS_PER_PAGE,
                  inventoryPage * INVENTORY_ITEMS_PER_PAGE
                );

                return (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#FAF6F0] border-b border-[#E8DFC8] text-gray-500 uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-6 py-3">Silhouette</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Price Range</th>
                            <th className="px-6 py-3">Total Stock</th>
                            <th className="px-6 py-3">Discount</th>
                            <th className="px-6 py-3">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#FAF5EC] text-brand-charcoal">
                          {paginatedProducts.map((prod) => {
                            const prices = prod.variants.map((v: any) => v.price);
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            const totalStock = prod.variants.reduce((acc: number, v: any) => acc + v.stock, 0);

                            return (
                              <tr key={prod.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                                <td className="px-6 py-4 font-medium flex items-center space-x-3">
                                  {prod.images && (
                                    <img
                                      src={JSON.parse(prod.images)[0]}
                                      alt=""
                                      className="h-10 w-8 object-cover rounded border border-[#E8DFC8] bg-brand-cream-dark"
                                    />
                                  )}
                                  <span className="font-serif text-sm">{prod.title}</span>
                                </td>
                                <td className="px-6 py-4 uppercase tracking-wider text-[10px] text-brand-gold font-semibold">
                                  {prod.category} <span className="text-gray-400 font-normal">({prod.tier})</span>
                                </td>
                                <td className="px-6 py-4 font-medium">
                                  Rs. {minPrice === maxPrice ? minPrice.toLocaleString() : `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    totalStock === 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                                  }`}>
                                    {totalStock} items
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-1">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      defaultValue={prod.discountPercent || 0}
                                      id={`discount-input-${prod.id}`}
                                      className="w-11 bg-white border border-[#E8DFC8] rounded px-1 py-0.5 text-center font-sans text-xs focus:outline-none focus:border-brand-gold"
                                    />
                                    <span className="text-xs text-gray-400 font-sans">%</span>
                                    <button
                                      onClick={() => handleUpdateDiscount(prod.id)}
                                      className="bg-brand-charcoal text-white hover:bg-brand-gold text-[9px] uppercase tracking-wider font-bold py-1 px-2 rounded-sm transition-all cursor-pointer"
                                    >
                                      Apply
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => handleOpenVariantModal(prod)}
                                    className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light border-b border-brand-gold/30 hover:border-brand-gold transition-colors cursor-pointer"
                                  >
                                    Edit Stock ({prod.variants.length})
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {totalInventoryPages > 1 && (
                      <div className="flex justify-center items-center space-x-2 border-t border-[#E8DFC8] py-4 bg-[#FAF6F0]/20">
                        <button
                          type="button"
                          onClick={() => setInventoryPage((p) => Math.max(1, p - 1))}
                          disabled={inventoryPage <= 1}
                          className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                            inventoryPage <= 1
                              ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                              : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                          }`}
                        >
                          Prev
                        </button>
                        <span className="text-[10px] font-sans text-gray-500 font-bold uppercase tracking-widest px-3">
                          Page {inventoryPage} of {totalInventoryPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setInventoryPage((p) => Math.min(totalInventoryPages, p + 1))}
                          disabled={inventoryPage >= totalInventoryPages}
                          className={`px-3 py-1.5 border border-[#E8DFC8] rounded-md text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${
                            inventoryPage >= totalInventoryPages
                              ? "opacity-45 cursor-not-allowed bg-[#FAF6F0] text-gray-400"
                              : "bg-white text-brand-charcoal hover:border-brand-gold hover:text-brand-gold shadow-xs"
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab 2: Add Product Form */}
        {activeTab === "add-product" && (
          <div className="space-y-8">
            <div className="border-b border-[#E8DFC8] pb-4">
              <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
                list new silhouette
              </h2>
              <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Upload your boutique apparel specifications, custom sizing prices and stock details
              </p>
            </div>

            {/* Prominent Free Delivery and Payout deduction notice */}
            <div className="bg-[#FAF6F0] border border-brand-gold/40 rounded-md p-5 flex items-start space-x-4">
              <AlertTriangle className="h-5 w-5 text-brand-gold flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                  Delivery Policy & Settlement Rules
                </h4>
                <p className="text-[11px] text-gray-600 uppercase tracking-wide leading-relaxed">
                  * All items will be displayed with <strong className="text-emerald-700 font-bold">Free Delivery</strong> to customers nationwide. Please bundle average shipping costs directly into your product pricing.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-md border border-[#E8DFC8] shadow-sm">
              {/* Step indicator */}
              <div className="flex justify-between items-center mb-6 border-b border-[#FAF5EC] pb-4">
                <div className="flex space-x-6">
                  <button
                    type="button"
                    onClick={() => setFormStep(1)}
                    className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all cursor-pointer ${
                      formStep === 1
                        ? "border-brand-gold text-brand-charcoal font-semibold"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    1. Basics
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!title.trim() || !description.trim() || !fabricDetails.trim() || !careInstructions.trim()) {
                        setFormMessage({ type: "error", text: "Please fill in all basic fields in Step 1 first." });
                        return;
                      }
                      setFormMessage(null);
                      setFormStep(2);
                    }}
                    className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all cursor-pointer ${
                      formStep === 2
                        ? "border-brand-gold text-brand-charcoal font-semibold"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    2. Tailoring & Media
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!title.trim() || !description.trim() || !fabricDetails.trim() || !careInstructions.trim()) {
                        setFormMessage({ type: "error", text: "Please fill in all basic fields in Step 1 first." });
                        return;
                      }
                      const imagesToSubmit = [imageUrl1, imageUrl2].filter(Boolean);
                      if (imagesToSubmit.length === 0) {
                        setFormMessage({ type: "error", text: "Please upload or specify at least one product image in Step 2." });
                        return;
                      }
                      setFormMessage(null);
                      setFormStep(3);
                    }}
                    className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all cursor-pointer ${
                      formStep === 3
                        ? "border-brand-gold text-brand-charcoal font-semibold"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    3. Pricing & Options
                  </button>
                </div>
                <span className="text-[10px] font-sans text-brand-gold font-bold uppercase tracking-widest bg-[#FAF6F0] px-2.5 py-1 rounded border border-[#E8DFC8]">
                  Step {formStep} of 3
                </span>
              </div>

              {formMessage && (
                <div className={`p-4 rounded-md text-xs font-sans tracking-wide ${
                  formMessage.type === "success" 
                    ? "bg-green-50 text-green-800 border-l-4 border-green-600" 
                    : "bg-red-50 text-red-800 border-l-4 border-red-600"
                }`}>
                  {formMessage.text}
                </div>
              )}

              {/* Step 1: Basics */}
              {formStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Silhouette / Product Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans"
                        placeholder="e.g. Sage Green Velvet Kurta Set"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans resize-none"
                        placeholder="Describe the fabric, tailoring cuts, aesthetics, embroidery elements..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans cursor-pointer"
                      >
                        <option value="Pheran Set">Pheran Set</option>
                        <option value="Kurta">Kurta</option>
                        <option value="Salwar">Salwar</option>
                        <option value="Other">Other...</option>
                      </select>
                      {category === "Other" && (
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="mt-2 block w-full rounded-md border border-brand-gold/60 py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans"
                          placeholder="Specify custom category (e.g. Saree)"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Collection (Optional)
                      </label>
                      <select
                        value={collection}
                        onChange={(e) => setCollection(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans cursor-pointer"
                      >
                        <option value="">None</option>
                        <option value="Aari Embroidery">Aari Embroidery</option>
                        <option value="Summer Linen">Summer Linen</option>
                        <option value="Bestsellers">Bestsellers</option>
                        <option value="Luxe Festive">Luxe Festive</option>
                        <option value="Other">Other...</option>
                      </select>
                      {collection === "Other" && (
                        <input
                          type="text"
                          value={customCollection}
                          onChange={(e) => setCustomCollection(e.target.value)}
                          className="mt-2 block w-full rounded-md border border-brand-gold/60 py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans"
                          placeholder="Specify custom collection (e.g. Festive Luxe)"
                        />
                      )}
                    </div>

                    {/* Defaulting all product creations to LUXE line */}

                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Fabric Details
                      </label>
                      <input
                        type="text"
                        value={fabricDetails}
                        onChange={(e) => setFabricDetails(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans"
                        placeholder="e.g. Pure Kashmiri Wool Blend, Silk Velvet"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Care Instructions
                      </label>
                      <input
                        type="text"
                        value={careInstructions}
                        onChange={(e) => setCareInstructions(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans"
                        placeholder="e.g. Dry Clean Only, Handwash Separately"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Tailoring & Media */}
              {formStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Stitching format */}
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Stitching Format
                      </label>
                      <label className="flex items-center mt-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSet}
                          onChange={(e) => setIsSet(e.target.checked)}
                          className="rounded border-[#E8DFC8] text-brand-gold focus:ring-brand-gold h-4 w-4"
                        />
                        <span className="ml-2 text-xs font-sans text-brand-charcoal uppercase tracking-wider">
                          This is a Coordinate Set (Top + Bottom / Salwar)
                        </span>
                      </label>
                    </div>

                    {/* Length details */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#A59578]">
                          Top L.
                        </label>
                        <input
                          type="text"
                          value={topLength}
                          onChange={(e) => setTopLength(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-2 text-xs bg-white text-brand-charcoal focus:outline-none"
                          placeholder="e.g. 45"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#A59578]">
                          Pant L.
                        </label>
                        <input
                          type="text"
                          disabled={!isSet}
                          value={pantLength}
                          onChange={(e) => setPantLength(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-2 text-xs bg-white text-brand-charcoal focus:outline-none disabled:opacity-50"
                          placeholder="e.g. 38"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-sans font-bold uppercase tracking-widest text-[#A59578]">
                          Sleeve L.
                        </label>
                        <input
                          type="text"
                          value={sleeveLength}
                          onChange={(e) => setSleeveLength(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-2 text-xs bg-white text-brand-charcoal focus:outline-none"
                          placeholder="e.g. 22"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Size Chart Config */}
                  <div className="border-t border-[#FAF5EC] pt-4 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal flex items-center">
                      <Scissors className="h-4 w-4 mr-2 text-brand-gold" /> Size Chart Configuration
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                          Sizing Chart Type
                        </label>
                        <select
                          value={sizeChartType}
                          onChange={(e) => setSizeChartType(e.target.value as any)}
                          className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans cursor-pointer"
                        >
                          <option value="STANDARD">Standard Boutique Sizing (S-XL)</option>
                          <option value="CUSTOM">Custom Sizing Table (Bust, Waist, Hip)</option>
                          <option value="IMAGE">Upload Size Chart Graphic (Image)</option>
                        </select>
                      </div>

                      {sizeChartType === "IMAGE" && (
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-sans text-gray-500 uppercase tracking-wider font-bold">
                            Upload Size Chart Image
                          </label>
                          {sizeChartImageUrl ? (
                            <div className="relative aspect-[4/3] max-w-[200px] mt-1 border border-[#E8DFC8] rounded-md overflow-hidden bg-brand-cream-dark group">
                              <img src={sizeChartImageUrl} alt="Size Chart Graphic" className="w-full h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => setSizeChartImageUrl("")}
                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 cursor-pointer shadow-md hover:bg-red-700 transition-colors flex items-center justify-center h-6 w-6"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative border-2 border-dashed border-[#E8DFC8] hover:border-brand-gold rounded-md p-6 max-w-[200px] text-center bg-white transition-colors mt-1">
                              {uploadingSizeChart ? (
                                <div className="space-y-2 py-4 flex flex-col items-center justify-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-gold border-t-transparent mx-auto" />
                                  <p className="text-[9px] font-sans text-gray-400 uppercase tracking-wider">Uploading...</p>
                                </div>
                              ) : (
                                <label className="cursor-pointer space-y-2 block">
                                  <Upload className="h-6 w-6 text-[#A59578] mx-auto" />
                                  <span className="block text-[10px] font-sans text-stone-600 uppercase tracking-wider font-bold">Choose File</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleSizeChartImageChange}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {sizeChartType === "CUSTOM" && (
                        <div className="sm:col-span-2 overflow-x-auto border border-[#E8DFC8] rounded-md mt-1">
                          <table className="w-full text-left text-xs font-sans border-collapse">
                            <thead>
                              <tr className="bg-[#FAF6F0] border-b border-[#E8DFC8] text-[#A59578] uppercase tracking-wider text-[9px] font-bold font-sans">
                                <th className="p-2.5">Size</th>
                                <th className="p-2.5">Chest/Bust</th>
                                <th className="p-2.5">Waist</th>
                                <th className="p-2.5">Hip</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#FAF5EC] text-brand-charcoal font-sans">
                              {["S", "M", "L", "XL"].map((sz) => (
                                <tr key={sz}>
                                  <td className="p-2.5 font-bold text-brand-gold">{sz}</td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={customSizeChart[sz]?.chest || ""}
                                      onChange={(e) => handleCustomSizeChartChange(sz, "chest", e.target.value)}
                                      className="w-full max-w-[70px] bg-white border border-[#E8DFC8] rounded py-1 px-2 text-xs font-sans"
                                      placeholder="e.g. 36"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={customSizeChart[sz]?.waist || ""}
                                      onChange={(e) => handleCustomSizeChartChange(sz, "waist", e.target.value)}
                                      className="w-full max-w-[70px] bg-white border border-[#E8DFC8] rounded py-1 px-2 text-xs font-sans"
                                      placeholder="e.g. 30"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={customSizeChart[sz]?.hip || ""}
                                      onChange={(e) => handleCustomSizeChartChange(sz, "hip", e.target.value)}
                                      className="w-full max-w-[70px] bg-white border border-[#E8DFC8] rounded py-1 px-2 text-xs font-sans"
                                      placeholder="e.g. 39"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Silhouette Images */}
                  <div className="border-t border-[#FAF5EC] pt-4 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal flex items-center">
                      <Upload className="h-4 w-4 mr-2 text-brand-gold" /> Silhouette Images
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                      {[
                        { num: 1, label: "Primary (Required)", url: imageUrl1, setUrl: setImageUrl1, uploading: uploading1 },
                        { num: 2, label: "Image 2 (Optional)", url: imageUrl2, setUrl: setImageUrl2, uploading: uploading2 },
                        { num: 3, label: "Image 3 (Optional)", url: imageUrl3, setUrl: setImageUrl3, uploading: uploading3 },
                        { num: 4, label: "Image 4 (Optional)", url: imageUrl4, setUrl: setImageUrl4, uploading: uploading4 },
                        { num: 5, label: "Image 5 (Optional)", url: imageUrl5, setUrl: setImageUrl5, uploading: uploading5 },
                        { num: 6, label: "Image 6 (Optional)", url: imageUrl6, setUrl: setImageUrl6, uploading: uploading6 },
                      ].map(({ num, label, url, setUrl, uploading }) => (
                        <div key={num} className="space-y-2">
                          <label className="block text-[9px] font-sans text-gray-500 uppercase tracking-wider font-bold truncate">
                            {label}
                          </label>
                          {url ? (
                            <div className="relative aspect-[3/4] w-full border border-[#E8DFC8] rounded-md overflow-hidden bg-brand-cream-dark group">
                              <img src={url} alt={`Silhouette ${num}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setUrl("")}
                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 cursor-pointer shadow-md hover:bg-red-700 transition-colors flex items-center justify-center h-6 w-6"
                                title="Remove image"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative border border-dashed border-[#E8DFC8] hover:border-brand-gold rounded-md p-4 w-full aspect-[3/4] flex items-center justify-center text-center bg-white transition-colors">
                              {uploading ? (
                                <div className="space-y-2 flex flex-col items-center justify-center">
                                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-gold border-t-transparent mx-auto" />
                                  <p className="text-[8px] font-sans text-gray-400 uppercase tracking-wider">Uploading...</p>
                                </div>
                              ) : (
                                <label className="cursor-pointer space-y-1 block w-full">
                                  <Upload className="h-5 w-5 text-[#A59578] mx-auto" />
                                  <span className="block text-[8px] font-sans text-stone-600 uppercase tracking-wider font-bold">Choose</span>
                                  <span className="block text-[7px] text-gray-400">Up to 5MB</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageFileChange(e, num as any)}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & Options */}
              {formStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-brand-charcoal">
                        Custom Delivery Timeline
                      </label>
                      <input
                        type="text"
                        value={deliveryTimeline}
                        onChange={(e) => setDeliveryTimeline(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#E8DFC8] py-2 px-3 text-xs bg-white text-brand-charcoal focus:outline-none focus:border-brand-gold font-sans"
                        placeholder="e.g. 10-15 Days"
                      />
                    </div>
                  </div>

                  {/* Sizes and Pricing Grid */}
                  <div className="border-t border-[#FAF5EC] pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal flex items-center">
                        <Scissors className="h-4 w-4 mr-2 text-brand-gold" /> Size-Specific Pricing & Stock
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light"
                      >
                        + Add Size Variant
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                      {variants.map((v, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#FAF6F0] p-3 rounded border border-[#E8DFC8] items-end">
                          <div>
                            <label className="block text-[9px] font-sans text-gray-500 uppercase tracking-wider">Top Size</label>
                            <select
                              value={v.topSize}
                              onChange={(e) => handleVariantChange(index, "topSize", e.target.value)}
                              className="mt-1 block w-full rounded bg-white border border-[#E8DFC8] py-1.5 px-2 text-xs font-sans text-brand-charcoal focus:outline-none focus:border-brand-gold"
                            >
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="Custom">Custom Fit</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-sans text-gray-500 uppercase tracking-wider">Bottom Size</label>
                            <select
                              disabled={!isSet}
                              value={v.bottomSize}
                              onChange={(e) => handleVariantChange(index, "bottomSize", e.target.value)}
                              className="mt-1 block w-full rounded bg-white border border-[#E8DFC8] py-1.5 px-2 text-xs font-sans text-brand-charcoal focus:outline-none focus:border-brand-gold disabled:opacity-50"
                            >
                              <option value="">None (Tunic Only)</option>
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="Custom">Custom Fit</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-sans text-gray-500 uppercase tracking-wider">Price (Rs.)</label>
                            <input
                              type="number"
                              min="100"
                              value={v.price}
                              onChange={(e) => handleVariantChange(index, "price", parseFloat(e.target.value))}
                              className="mt-1 block w-full rounded bg-white border border-[#E8DFC8] py-1.5 px-2 text-xs font-sans text-brand-charcoal focus:outline-none focus:border-brand-gold"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <label className="block text-[9px] font-sans text-gray-500 uppercase tracking-wider">Stock Qty</label>
                              <input
                                type="number"
                                min="0"
                                value={v.stock}
                                onChange={(e) => handleVariantChange(index, "stock", parseInt(e.target.value))}
                                className="mt-1 block w-full rounded bg-white border border-[#E8DFC8] py-1.5 px-2 text-xs font-sans text-brand-charcoal focus:outline-none focus:border-brand-gold"
                              />
                            </div>
                            {variants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(index)}
                                className="text-red-500 hover:text-red-700 font-sans text-[10px] uppercase font-bold tracking-wider pt-5"
                              >
                                Del
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Option Add-ons */}
                  <div className="border-t border-[#FAF5EC] pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal flex items-center">
                        <PlusCircle className="h-4 w-4 mr-2 text-brand-gold" /> Custom Options & Add-ons (e.g. Dupatta, Silk Lining)
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light"
                      >
                        + Add Option Value
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {options.map((opt, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#FAF6F0] p-3 rounded border border-[#E8DFC8] items-end">
                          <div className="sm:col-span-2">
                            <label className="block text-[9px] font-sans text-gray-500 uppercase tracking-wider">Option Name</label>
                            <input
                              type="text"
                              value={opt.optionName}
                              onChange={(e) => handleOptionChange(index, "optionName", e.target.value)}
                              className="mt-1 block w-full rounded bg-white border border-[#E8DFC8] py-1.5 px-2 text-xs font-sans text-brand-charcoal focus:outline-none"
                              placeholder="e.g. Dupatta Fabric"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-sans text-gray-500 uppercase tracking-wider">Value Text</label>
                            <input
                              type="text"
                              value={opt.optionValue}
                              onChange={(e) => handleOptionChange(index, "optionValue", e.target.value)}
                              className="mt-1 block w-full rounded bg-white border border-[#E8DFC8] py-1.5 px-2 text-xs font-sans text-brand-charcoal focus:outline-none"
                              placeholder="e.g. Silk Dupatta"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <label className="block text-[9px] font-sans text-gray-500 uppercase tracking-wider">Price Adjustment (Rs.)</label>
                              <input
                                type="number"
                                value={opt.priceAdjustment}
                                onChange={(e) => handleOptionChange(index, "priceAdjustment", parseFloat(e.target.value))}
                                className="mt-1 block w-full rounded bg-white border border-[#E8DFC8] py-1.5 px-2 text-xs font-sans text-brand-charcoal focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index)}
                              className="text-red-500 hover:text-red-700 font-sans text-[10px] uppercase font-bold tracking-wider pt-5"
                            >
                              Del
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit / Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-[#FAF5EC]">
                <div>
                  {formStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setFormStep((prev) => (prev - 1) as any)}
                      className="bg-transparent border border-stone-400 text-stone-700 px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest font-sans hover:bg-[#FAF6F0] transition-all cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="bg-transparent border border-stone-300 text-stone-500 px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest font-sans hover:bg-[#FAF6F0] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  {formStep < 3 ? (
                    <button
                      key="next-step-btn"
                      type="button"
                      onClick={() => {
                        if (formStep === 1) {
                          if (!title.trim() || !description.trim() || !fabricDetails.trim() || !careInstructions.trim()) {
                            setFormMessage({ type: "error", text: "Please fill in all basic fields in Step 1 first." });
                            return;
                          }
                          setFormMessage(null);
                          setFormStep(2);
                        } else if (formStep === 2) {
                          const imagesToSubmit = [imageUrl1, imageUrl2].filter(Boolean);
                          if (imagesToSubmit.length === 0) {
                            setFormMessage({ type: "error", text: "Please upload or specify at least one product image in Step 2." });
                            return;
                          }
                          setFormMessage(null);
                          setFormStep(3);
                        }
                      }}
                      className="bg-brand-charcoal text-brand-cream px-8 py-2.5 rounded text-xs font-bold uppercase tracking-widest font-sans hover:bg-opacity-90 shadow-md transition-all cursor-pointer"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      key="submit-silhouette-btn"
                      type="submit"
                      disabled={formSubmitting}
                      className="bg-brand-gold text-brand-cream px-8 py-2.5 rounded text-xs font-bold uppercase tracking-widest font-sans hover:bg-brand-gold-light shadow-md transition-all cursor-pointer"
                    >
                      {formSubmitting ? "Submitting..." : "Publish Silhouette"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab: Orders Management */}
        {activeTab === "orders" && (
          <div className="space-y-8">
            <div className="border-b border-[#E8DFC8] pb-4">
              <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
                order management
              </h2>
              <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Monitor and update shipping / delivery details for orders containing your silhouettes
              </p>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#E8DFC8] bg-[#FAF6F0] flex justify-between items-center">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                  Active Orders Log
                </h3>
                <button
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                  className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {ordersLoading ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-gold border-t-transparent" />
                  <p className="font-serif text-sm text-stone-600">Loading orders history...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingBag className="h-10 w-10 text-[#E8DFC8] mx-auto mb-3" />
                  <p className="font-serif text-base text-stone-600">No active orders found.</p>
                  <p className="font-sans text-[11px] text-gray-400 mt-1 uppercase tracking-wide">
                    Customer orders containing your listed silhouettes will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-[#FAF6F0] border-b border-[#E8DFC8] text-gray-500 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-3">Order Info</th>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3">Your Items</th>
                        <th className="px-6 py-3">Your Earnings</th>
                        <th className="px-6 py-3">Delivery Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF5EC] text-brand-charcoal">
                      {orders.map((ord) => {
                        let statusClass = "bg-stone-50 text-stone-700 border-stone-200";
                        if (ord.status === "PLACED") statusClass = "bg-orange-50 text-orange-800 border-orange-200";
                        else if (ord.status === "CONFIRMED") statusClass = "bg-blue-50 text-blue-800 border-blue-200";
                        else if (ord.status === "SHIPPED") statusClass = "bg-purple-50 text-purple-800 border-purple-200";
                        else if (ord.status === "DELIVERED") statusClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
                        else if (ord.status === "CANCELLED") statusClass = "bg-red-50 text-red-800 border-red-200";

                        const isUpdating = updatingOrderId === ord.id;

                        return (
                          <tr key={ord.id} className="hover:bg-[#FAF6F0]/40 transition-colors align-top">
                            <td className="px-6 py-4">
                              <div className="font-serif text-sm font-semibold text-brand-gold">#{ord.orderNumber}</div>
                              <div className="text-[9px] text-gray-400 mt-1 uppercase">
                                {new Date(ord.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="text-[9px] text-gray-400 mt-0.5 font-bold">
                                {ord.paymentType} ({ord.paymentStatus})
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-xs text-brand-charcoal">{ord.customerName}</div>
                              <div className="text-[10px] text-gray-500 mt-0.5">{ord.customerPhone}</div>
                              <div className="text-[9px] text-gray-400 mt-1 uppercase max-w-[200px] whitespace-normal break-words">
                                {ord.shippingAddress}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-2">
                                {ord.items.map((item: any) => (
                                  <div key={item.id} className="flex items-center space-x-2">
                                    <img src={item.image} alt="" className="h-8 w-6 object-cover rounded border border-[#E8DFC8]" />
                                    <div>
                                      <div className="font-medium text-[11px] leading-tight">{item.title}</div>
                                      <div className="text-[9px] text-gray-400">
                                        Qty: {item.quantity} | Size: {item.topSize}{item.bottomSize ? `/${item.bottomSize}` : ""}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-xs">
                              Rs. {ord.sellerSubtotal.toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <span className={`inline-block px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider ${statusClass}`}>
                                  {ord.status}
                                </span>
                                {ord.status === "SHIPPED" && ord.trackingNumber && (
                                  <div className="text-[9px] text-gray-400 leading-tight">
                                    {ord.trackingCompany} ({ord.trackingNumber})
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {isUpdating ? (
                                <div className="space-y-2 max-w-[200px] ml-auto text-left bg-[#FAF6F0] p-2.5 rounded border border-[#E8DFC8]">
                                  <div>
                                    <label className="block text-[8px] font-sans text-gray-500 uppercase tracking-widest font-bold font-sans">Courier Company</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Delhivery"
                                      value={trackingCompany}
                                      onChange={(e) => setTrackingCompany(e.target.value)}
                                      className="mt-1 block w-full bg-white border border-[#E8DFC8] rounded py-1 px-1.5 text-[10px] font-sans text-brand-charcoal"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-sans text-gray-500 uppercase tracking-widest font-bold font-sans">Tracking Code</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. 123456789"
                                      value={trackingNumber}
                                      onChange={(e) => setTrackingNumber(e.target.value)}
                                      className="mt-1 block w-full bg-white border border-[#E8DFC8] rounded py-1 px-1.5 text-[10px] font-sans text-brand-charcoal"
                                    />
                                  </div>
                                  <div className="flex space-x-1.5 font-sans">
                                    <button
                                      onClick={() => handleUpdateStatusSubmit(ord.id, "SHIPPED")}
                                      className="flex-1 bg-brand-charcoal text-brand-cream text-[9px] font-bold py-1.5 px-2 rounded uppercase tracking-wider text-center"
                                    >
                                      Submit
                                    </button>
                                    <button
                                      onClick={() => setUpdatingOrderId(null)}
                                      className="bg-transparent border border-gray-400 text-stone-600 text-[9px] font-bold py-1.5 px-2 rounded uppercase tracking-wider text-center"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col space-y-1.5 items-end font-sans">
                                  {ord.status === "PLACED" && (
                                    <>
                                      <button
                                        onClick={() => handleStatusUpdate(ord.id, "CONFIRMED")}
                                        className="bg-brand-gold text-brand-cream text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-widest hover:bg-opacity-90"
                                      >
                                        Confirm Order
                                      </button>
                                      <button
                                        onClick={() => handleStatusUpdate(ord.id, "CANCELLED")}
                                        className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase tracking-widest"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                  {ord.status === "CONFIRMED" && (
                                    <button
                                      onClick={() => {
                                        setUpdatingOrderId(ord.id);
                                        setTrackingCompany("");
                                        setTrackingNumber("");
                                      }}
                                      className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-widest hover:bg-purple-700"
                                    >
                                      Ship Order
                                    </button>
                                  )}
                                  {ord.status === "SHIPPED" && (
                                    <button
                                      onClick={() => handleStatusUpdate(ord.id, "DELIVERED")}
                                      className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-widest hover:bg-emerald-700"
                                    >
                                      Mark Delivered
                                    </button>
                                  )}
                                  {ord.status === "DELIVERED" && (
                                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest flex items-center">
                                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> Fulfilled
                                    </span>
                                  )}
                                  {ord.status === "CANCELLED" && (
                                    <span className="text-[10px] text-red-600 font-bold uppercase tracking-widest">
                                      Cancelled
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Returns & Logs */}
        {activeTab === "returns" && (
          <div className="space-y-8">
            <div className="border-b border-[#E8DFC8] pb-4">
              <h2 className="font-serif text-3xl font-semibold tracking-wide lowercase">
                returns & logs
              </h2>
              <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Monitor customer return requests, reasons, and return statuses for your products
              </p>
            </div>

            {/* Returns Table */}
            <div className="bg-white rounded-md border border-[#E8DFC8] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#E8DFC8] bg-[#FAF6F0] flex justify-between items-center">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                  Return Requests Log
                </h3>
                <button
                  onClick={fetchReturns}
                  disabled={returnsLoading}
                  className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-light flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${returnsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {returnsLoading ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-gold border-t-transparent" />
                  <p className="font-serif text-sm text-stone-600">Loading returns history...</p>
                </div>
              ) : returns.length === 0 ? (
                <div className="p-12 text-center">
                  <Undo2 className="h-10 w-10 text-[#E8DFC8] mx-auto mb-3" />
                  <p className="font-serif text-base text-stone-600">No return requests found.</p>
                  <p className="font-sans text-[11px] text-gray-400 mt-1 uppercase tracking-wide">
                    Return requests submitted by customers for your silhouettes will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-[#FAF6F0] border-b border-[#E8DFC8] text-gray-500 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-3">Order Info</th>
                        <th className="px-6 py-3">Silhouette</th>
                        <th className="px-6 py-3">Details</th>
                        <th className="px-6 py-3 text-center">Return Qty</th>
                        <th className="px-6 py-3">Reason</th>
                        <th className="px-6 py-3 text-center">Status / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF5EC] text-brand-charcoal">
                      {returns.map((ret) => {
                        let statusLabel = ret.returnStatus;
                        let statusClass = "bg-stone-100 text-stone-700 border-stone-200";
                        
                        if (ret.returnStatus === "RETURN_REQUESTED") {
                          statusLabel = "Requested";
                          statusClass = "bg-amber-50 text-amber-800 border-amber-200";
                        } else if (ret.returnStatus === "RETURN_APPROVED") {
                          statusLabel = "Approved (Pending Pickup)";
                          statusClass = "bg-blue-50 text-blue-800 border-blue-200";
                        } else if (ret.returnStatus === "RETURNED") {
                          statusLabel = "Returned & Refunded";
                          statusClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
                        } else if (ret.returnStatus === "RETURN_REJECTED") {
                          statusLabel = "Rejected";
                          statusClass = "bg-red-50 text-red-800 border-red-200";
                        }

                        return (
                          <tr key={ret.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                            <td className="px-6 py-4 font-medium">
                               <button 
                                 onClick={() => router.push(`/seller/returns/${ret.id}`)}
                                 className="font-serif text-sm text-brand-gold hover:text-brand-gold-light hover:underline block text-left"
                                 title="Click to view details"
                               >
                                 #{ret.orderNumber}
                               </button>
                               <div className="text-[9px] text-gray-400 mt-0.5">
                                 {new Date(ret.orderDate).toLocaleDateString(undefined, {
                                   year: 'numeric',
                                   month: 'short',
                                   day: 'numeric'
                                 })}
                               </div>
                             </td>
                            <td className="px-6 py-4 font-medium flex items-center space-x-3">
                              {ret.productImage && (
                                <img
                                  src={ret.productImage}
                                  alt=""
                                  className="h-10 w-8 object-cover rounded border border-[#E8DFC8] bg-brand-cream-dark"
                                />
                              )}
                              <span className="font-serif text-sm">{ret.productTitle}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-0.5 text-[10px]">
                                {ret.topSize && (
                                  <div><span className="text-gray-400">Top Size:</span> {ret.topSize}</div>
                                )}
                                {ret.bottomSize && (
                                  <div><span className="text-gray-400">Bottom Size:</span> {ret.bottomSize}</div>
                                )}
                                {ret.selectedOptions && ret.selectedOptions !== "{}" && (
                                  <div className="text-[9px] text-gray-500 italic max-w-[150px] truncate" title={renderSelectedOptions(ret.selectedOptions) || undefined}>
                                    {renderSelectedOptions(ret.selectedOptions)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-semibold">
                              {ret.returnQuantity} <span className="text-gray-400 font-normal">of {ret.quantity}</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-[11px] text-stone-600 max-w-[200px] whitespace-normal break-words leading-relaxed">
                                {ret.returnReason || "No reason provided"}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {ret.returnStatus === "RETURN_REQUESTED" ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleProcessReturn(ret.orderId, ret.id, true)}
                                    disabled={actionLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded transition-all flex items-center gap-1 font-sans font-bold uppercase text-[9px] tracking-wider cursor-pointer"
                                    title="Approve Return Request"
                                  >
                                    <Check className="h-3 w-3" /> Approve Return
                                  </button>
                                  <button
                                    onClick={() => handleProcessReturn(ret.orderId, ret.id, false)}
                                    disabled={actionLoading}
                                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-all flex items-center gap-1 font-sans font-bold uppercase text-[9px] tracking-wider cursor-pointer"
                                    title="Reject Return Request"
                                  >
                                    <X className="h-3 w-3" /> Reject
                                  </button>
                                </div>
                              ) : ret.returnStatus === "RETURN_APPROVED" ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleProcessReturn(ret.orderId, ret.id, true, true)}
                                    disabled={actionLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded transition-all flex items-center gap-1 font-sans font-bold uppercase text-[9px] tracking-wider cursor-pointer"
                                    title="Confirm Item Received & Refund to Wallet"
                                  >
                                    <Check className="h-3 w-3" /> Confirm & Refund
                                  </button>
                                  <button
                                    onClick={() => handleProcessReturn(ret.orderId, ret.id, false)}
                                    disabled={actionLoading}
                                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-all flex items-center gap-1 font-sans font-bold uppercase text-[9px] tracking-wider cursor-pointer"
                                    title="Reject Pickup/Inspection"
                                  >
                                    <X className="h-3 w-3" /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold tracking-wide uppercase ${statusClass}`}>
                                  {statusLabel}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Variant Editor Modal */}
      {selectedProductForVariants && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#FAF6F0] border border-[#E8DFC8] shadow-2xl rounded-lg max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-205">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E8DFC8] flex items-center justify-between bg-[#FAF6F0]">
              <div>
                <h3 className="font-serif text-base font-bold text-brand-charcoal lowercase tracking-wide">
                  edit size variants & stock
                </h3>
                <p className="text-[10px] text-gray-500 font-sans uppercase tracking-widest mt-0.5">
                  Product: {selectedProductForVariants.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedProductForVariants(null)}
                className="text-stone-400 hover:text-brand-charcoal transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-12 gap-3 text-[10px] font-sans font-bold uppercase tracking-widest text-gray-400 pb-1 border-b border-[#FAF5EC]">
                <div className="col-span-4">Size</div>
                <div className="col-span-4">Price (Rs.)</div>
                <div className="col-span-4">Stock Quantity</div>
              </div>

              <div className="space-y-3">
                {selectedProductForVariants.variants.map((v: any) => {
                  const currentState = variantEditState[v.id] || { stock: v.stock, price: v.price };
                  const sizeLabel = v.bottomSize 
                    ? `Top: ${v.topSize} / Pant: ${v.bottomSize}`
                    : `Size: ${v.topSize}`;

                  return (
                    <div key={v.id} className="grid grid-cols-12 gap-3 items-center font-sans text-xs">
                      <div className="col-span-4 font-bold text-brand-charcoal truncate pr-2">
                        {sizeLabel}
                      </div>
                      
                      <div className="col-span-4">
                        <input
                          type="number"
                          min="0"
                          value={currentState.price}
                          onChange={(e) => setVariantEditState(prev => ({
                            ...prev,
                            [v.id]: { ...prev[v.id], price: parseFloat(e.target.value) || 0 }
                          }))}
                          className="w-full bg-white border border-[#E8DFC8] rounded py-1.5 px-3 text-xs text-brand-charcoal focus:outline-none focus:border-brand-gold"
                        />
                      </div>

                      <div className="col-span-4">
                        <input
                          type="number"
                          min="0"
                          value={currentState.stock}
                          onChange={(e) => setVariantEditState(prev => ({
                            ...prev,
                            [v.id]: { ...prev[v.id], stock: parseInt(e.target.value) || 0 }
                          }))}
                          className="w-full bg-white border border-[#E8DFC8] rounded py-1.5 px-3 text-xs text-brand-charcoal focus:outline-none focus:border-brand-gold"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#FAF6F0]/50 border-t border-[#E8DFC8] flex justify-end space-x-3">
              <button
                onClick={() => setSelectedProductForVariants(null)}
                className="px-4 py-2 bg-transparent border border-stone-400 text-stone-600 rounded text-xs font-sans font-bold uppercase tracking-widest hover:bg-stone-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateVariantsSubmit}
                disabled={updatingVariants}
                className="px-5 py-2 bg-brand-charcoal text-brand-cream hover:bg-brand-gold rounded text-xs font-sans font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {updatingVariants ? "Saving changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}
