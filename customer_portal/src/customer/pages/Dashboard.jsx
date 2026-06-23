import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ChevronDown, Bot, User, Headphones } from "lucide-react";

import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import CustomCakeModal from "../components/CustomCakeModal";
import { CUSTOMER_BASE } from "../../services/config";

function Banner({ onOrderClick }) {
  return (
    <div className="relative w-full h-[500px] bg-[#1a1a1a] flex items-center justify-center overflow-hidden font-['DM_Sans']">
      <div
        className="absolute inset-0 opacity-40 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=2000')",
        }}
      />
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[#d4af37] text-[10px] font-black tracking-[0.4em] uppercase mb-4"
        >
          Pastry Project by Chef Lawrence
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white text-6xl md:text-7xl font-serif mb-8 leading-tight font-bold"
        >
          Baked Fresh,
          <br />
          <span className="italic text-[#d4af37]">Made with Love.</span>
        </motion.h1>
        <motion.button
          onClick={onOrderClick}
          whileHover={{ scale: 1.05 }}
          className="bg-[#d4af37] text-black px-12 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] shadow-2xl"
        >
          Browse Menu
        </motion.button>
      </div>
    </div>
  );
}

/* =========================
   CHAT BUBBLE COMPONENT
========================= */
function ChatBubble() {
  const [open, setOpen]           = useState(false);
  const [step, setStep]           = useState("enter_order"); // enter_order | chatting
  const [orderId, setOrderId]     = useState("");
  const [orderError, setOrderError] = useState("");
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [sending, setSending]     = useState(false);
  const [unread, setUnread]       = useState(0);
  const bottomRef                 = useRef(null);
  const pollRef                   = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* Poll for new messages every 5s when chat is open */
  useEffect(() => {
    if (step === "chatting" && orderId) {
      fetchMessages();
      pollRef.current = setInterval(fetchMessages, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [step, orderId]);

  const fetchMessages = async () => {
    try {
      const res  = await fetch(`${CUSTOMER_BASE}/api_chat_fetch.php?order_id=${orderId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        if (!open) {
          const newStaff = data.messages.filter(m => m.sender !== "customer").length;
          setUnread(newStaff);
        }
      }
    } catch (e) {
      console.error("Chat fetch error:", e);
    }
  };

  const handleOrderSubmit = async () => {
    const id = parseInt(orderId);
    if (!id) {
      setOrderError("Please enter a valid order number.");
      return;
    }
    setOrderError("");

    // Verify order exists
    try {
      const res  = await fetch(`${CUSTOMER_BASE}/api_chat_fetch.php?order_id=${id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        setStep("chatting");

        // Send welcome message if first time
        if (data.messages.length === 0) {
          await sendMessage("Hi! I have a question about my order.", true);
        }
      } else {
        setOrderError("Order not found. Please check your order number.");
      }
    } catch (e) {
      setOrderError("Could not connect. Please try again.");
    }
  };

  const sendMessage = async (text, silent = false) => {
    const msg = text || input.trim();
    if (!msg) return;

    if (!silent) {
      setSending(true);
      setInput("");
      // Optimistic UI
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: "customer",
        message: msg,
        created_at: new Date().toISOString()
      }]);
    }

    try {
      const res  = await fetch(`${CUSTOMER_BASE}/api_chat_send.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: parseInt(orderId), message: msg, sender: "customer" })
      });
      const data = await res.json();

      if (data.success && data.ai_reply) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: "ai",
          message: data.ai_reply,
          created_at: new Date().toISOString()
        }]);
      }
    } catch (e) {
      console.error("Send error:", e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const senderLabel = {
    customer: "You",
    staff: "Staff",
    ai: "Pastry AI"
  };

  return (
    <>
      {/* FLOAT BUTTON */}
      <button
        onClick={() => { setOpen(o => !o); setUnread(0); }}
        className="fixed bottom-6 right-6 bg-black text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl z-[9999] hover:bg-[#d4af37] transition-colors"
      >
        {open ? <X size={20} /> : <MessageCircle size={22} />}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {/* CHAT PANEL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[360px] bg-white rounded-[20px] shadow-2xl z-[9998] flex flex-col overflow-hidden border border-gray-100"
            style={{ height: "520px" }}
          >
            {/* HEADER */}
            <div className="bg-black px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#d4af37] flex items-center justify-center flex-shrink-0">
                <Headphones size={16} className="text-black" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Pastry Project Support</p>
                <p className="text-gray-400 text-[10px]">
                  {step === "chatting" ? `Order #${orderId}` : "We usually reply instantly"}
                </p>
              </div>
              {step === "chatting" && (
                <button
                  onClick={() => { setStep("enter_order"); setMessages([]); setOrderId(""); }}
                  className="text-gray-400 hover:text-white text-[10px] underline"
                >
                  Change order
                </button>
              )}
            </div>

            {/* BODY */}
            {step === "enter_order" ? (

              /* ORDER ID ENTRY */
              <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
                <div className="w-16 h-16 rounded-full bg-[#fdf8ec] flex items-center justify-center">
                  <MessageCircle size={28} className="text-[#d4af37]" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-800 mb-1">Chat with us</h3>
                  <p className="text-gray-400 text-xs">Enter your order number to get support</p>
                </div>
                <div className="w-full">
                  <input
                    type="number"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleOrderSubmit()}
                    placeholder="e.g. 47"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black text-center"
                  />
                  {orderError && (
                    <p className="text-red-500 text-xs mt-1 text-center">{orderError}</p>
                  )}
                </div>
                <button
                  onClick={handleOrderSubmit}
                  className="w-full bg-black text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#d4af37] hover:text-black transition-colors"
                >
                  Start Chat
                </button>
              </div>

            ) : (

              /* MESSAGES */
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-xs pt-8">
                      No messages yet. Say hi!
                    </div>
                  )}

                  {messages.map((msg, i) => {
                    const isCustomer = msg.sender === "customer";
                    const isAi       = msg.sender === "ai";

                    return (
                      <div key={msg.id ?? i} className={`flex gap-2 ${isCustomer ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold
                          ${isCustomer ? "bg-black text-white" : isAi ? "bg-[#d4af37] text-black" : "bg-purple-100 text-purple-700"}`}>
                          {isCustomer ? <User size={12} /> : isAi ? <Bot size={12} /> : "S"}
                        </div>

                        <div className={`max-w-[75%] ${isCustomer ? "items-end" : "items-start"} flex flex-col gap-1`}>
                          <span className="text-[9px] text-gray-400 px-1">
                            {senderLabel[msg.sender]} · {formatTime(msg.created_at)}
                          </span>
                          <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed
                            ${isCustomer
                              ? "bg-black text-white rounded-tr-sm"
                              : isAi
                              ? "bg-[#fdf8ec] text-gray-800 border border-[#f0e4b8] rounded-tl-sm"
                              : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                            }`}>
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {sending && (
                    <div className="flex gap-2 items-center">
                      <div className="w-7 h-7 rounded-full bg-[#d4af37] flex items-center justify-center">
                        <Bot size={12} className="text-black" />
                      </div>
                      <div className="bg-[#fdf8ec] border border-[#f0e4b8] px-4 py-2 rounded-2xl rounded-tl-sm">
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* INPUT */}
                <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2 items-end">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black max-h-24"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || sending}
                    className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#d4af37] transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* =========================
   MAIN DASHBOARD
========================= */
export default function Dashboard({ onAddToCart, navigate }) {
  const [products, setProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct]       = useState(null);
  const [isCustomCakeOpen, setIsCustomCakeOpen]     = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res  = await fetch("http://localhost/pastry_system/customer/api_products.php?action=list");
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const handleAction = (product, size, price) => {
    const cat = product.category?.toUpperCase();
    if (cat === "CAKES" || cat === "STARTER") {
      onAddToCart({ ...product, variant: size, qty: 1, price });
    } else {
      setSelectedProduct({ ...product, variant: size, basePrice: price });
      setIsProductModalOpen(true);
    }
  };

  const bestSellers = useMemo(() =>
    products.filter(p => !p.name?.toLowerCase().includes("customization")).slice(0, 6),
  [products]);

  const mustTry = useMemo(() =>
    products.filter(p => !p.name?.toLowerCase().includes("customization")).slice(6, 12),
  [products]);

  return (
    <div className="bg-white min-h-screen font-['DM_Sans'] relative">

      <Banner onOrderClick={() => navigate("/menu")} />

      <div className="max-w-7xl mx-auto px-10 py-12">

        {/* CUSTOM CAKE */}
        <div className="relative w-full h-[350px] rounded-[50px] overflow-hidden group bg-black shadow-2xl mb-20">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-1000"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=2000')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center px-16">
            <div className="max-w-md">
              <h2 className="text-white text-5xl font-serif font-bold mb-4">
                Want to customize <br />
                <span className="text-[#d4af37]">your cake?</span>
              </h2>
              <p className="text-gray-300 text-sm mb-8">
                Choose flavors, tiers, and design. We'll bake it your way.
              </p>
              <button
                onClick={() => setIsCustomCakeOpen(true)}
                className="bg-white text-black px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-[#d4af37]"
              >
                Customize Now
              </button>
            </div>
          </div>
        </div>

        {/* BEST SELLERS */}
        <section className="mb-20">
          <div className="flex justify-between mb-10">
            <div>
              <p className="text-[#d4af37] text-[10px] uppercase tracking-[0.4em]">Customer Favorites</p>
              <h2 className="text-4xl font-serif font-bold">Best Sellers</h2>
            </div>
            <button onClick={() => navigate("/menu")} className="text-[10px] uppercase tracking-[0.3em] text-gray-400 hover:text-black">
              View Menu
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {bestSellers.map(p => <ProductCard key={p.id} product={p} onAction={handleAction} />)}
          </div>
        </section>

        {/* MUST TRY */}
        <section className="pb-10">
          <div className="flex justify-between mb-10">
            <div>
              <p className="text-[#d4af37] text-[10px] uppercase tracking-[0.4em]">Chef Recommendation</p>
              <h2 className="text-4xl font-serif font-bold">Must Try</h2>
            </div>
            <button onClick={() => navigate("/menu")} className="text-[10px] uppercase tracking-[0.3em] text-gray-400 hover:text-black">
              Explore More
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {mustTry.map(p => <ProductCard key={p.id} product={p} onAction={handleAction} />)}
          </div>
        </section>
      </div>

      {/* CHAT BUBBLE */}
      <ChatBubble />

      {/* MODALS */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        allCakes={products.filter(p => p.category === "Cakes")}
        onAddToCart={onAddToCart}
      />
      <CustomCakeModal
        isOpen={isCustomCakeOpen}
        onClose={() => setIsCustomCakeOpen(false)}
        allCakes={products.filter(p => p.category === "Cakes")}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}
