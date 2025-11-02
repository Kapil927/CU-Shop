import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, ShoppingCart, Package, Star, LogIn, LogOut, X, Plus, Minus, Filter, RefreshCw, CreditCard, Trash2, Edit3, Heart, Eye, TrendingUp, Zap, Award, ChevronLeft, ChevronRight, Menu, User, Bell } from "lucide-react";

export default function EcommerceApp() {
  // const API_BASE = "http://localhost:8080/api";
  const API_BASE = "https://ecommerce-backend-kjni.onrender.com/api";

  axios.defaults.withCredentials = true;

  // --- States ---------------------------------------------------------------
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [view, setView] = useState("products");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    name: "",
    card: "",
    expiry: "",
    cvv: "",
  });
  const [latestOrderId, setLatestOrderId] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 0, comment: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [quickView, setQuickView] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDevInfo, setShowDevInfo] = useState(false);
  
  const ITEMS_PER_PAGE = 12;

  // --- Helpers --------------------------------------------------------------
  const normalizeArray = (data) => {
    if (!data && data !== 0) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.items)) return data.items;
    for (const k in data) {
      if (Array.isArray(data[k])) return data[k];
    }
    return [];
  };

  const showMsg = (txt, ms = 3500) => {
    setMessage(txt);
    if (ms > 0) setTimeout(() => setMessage(""), ms);
  };

  const priceStr = (p) => {
    const pr = p?.price ?? p?.priceAmount ?? 0;
    return Number(pr).toLocaleString();
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product?.id === productId);
  };

const toggleWishlist = async (productId) => {
  if (!user) {
    // ⚠️ Guest user — redirect to login
    showMsg("Please login to use Wishlist ❤️", 3000);
    setView("login");
    return;
  }

  const inWishlist = isInWishlist(productId);

  try {
    if (inWishlist) {
      const wishlistItem = wishlist.find(item => item.product?.id === productId);
      if (wishlistItem) {
        await axios.delete(`${API_BASE}/wishlist/remove/${wishlistItem.id}`, {
          params: { productId }
        });
        showMsg("Removed from wishlist 🗑️", 2000);
      }
    } else {
      await axios.post(`${API_BASE}/wishlist/add`, null, {
        params: { productId }
      });
      showMsg("Added to wishlist ❤️", 2000);
    }
    fetchWishlist();
  } catch (err) {
    console.error("toggleWishlist:", err);
    showMsg("Wishlist action failed. Please login again.", 2500);
  }
};


  // Pagination
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Fetchers -------------------------------------------------------------
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/products`);
      setProducts(normalizeArray(res.data));
      setCurrentPage(1);
    } catch (err) {
      console.error("fetchProducts:", err);
      showMsg("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API_BASE}/cart`);
      setCart(normalizeArray(res.data));
    } catch {
      setCart([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders/history`);
      setOrders(normalizeArray(res.data));
    } catch {
      setOrders([]);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/reviews`);
      setReviews(normalizeArray(res.data));
    } catch {
      setReviews([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("fetchCategories:", err);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API_BASE}/wishlist`);
      setWishlist(normalizeArray(res.data));
    } catch {
      setWishlist([]);
    }
  };

  // --- Auth -----------------------------------------------------------------
const register = async () => {
  try {
    console.log("Register payload:", form); // optional debug
    await axios.post(`${API_BASE}/auth/register`, {
      username: form.username,
      password: form.password,
      email: form.email,
      address: form.address, // 🆕
    });
    showMsg("Registered successfully — please login");
    setView("login");
  } catch (err) {
    console.error("register error:", err);
    showMsg(err?.response?.data || "Registration failed");
  }
};

  const login = async () => {
    try {
      const params = new URLSearchParams();
      params.append("username", form.username);
      params.append("password", form.password);

      await axios.post(`${API_BASE}/auth/login`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      setUser(form.username);
      showMsg(`Welcome back, ${form.username}! 🎉`);
      setView("products");
      fetchCart();
      fetchOrders();
      fetchWishlist();
      setShowMobileMenu(false);
    } catch {
      showMsg("Login failed — check credentials");
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout`);
      setUser(null);
      setCart([]);
      setOrders([]);
      setWishlist([]);
      showMsg("Logged out successfully");
      setShowMobileMenu(false);
    } catch {
      showMsg("Logout error");
    }
  };

  // --- Cart / Orders / Payment ----------------------------------------------
const addToCart = async (productId, qty = 1) => {
  if (!user) {
    // ⚠️ Not logged in → redirect to login view
    showMsg("Please login to add items to your cart 🛍️", 3000);
    setView("login");
    return;
  }

  try {
    await axios.post(`${API_BASE}/cart/add`, null, { params: { productId, qty } });
    showMsg("Added to cart ✅");
    fetchCart();
  } catch (err) {
    console.error("addToCart:", err);
    showMsg("Failed to add to cart. Please login again.", 3000);
  }
};


  const deleteCartItem = async (id) => {
    try {
      await axios.delete(`${API_BASE}/cart/remove/${id}`);
      showMsg("Item removed");
      fetchCart();
    } catch {
      showMsg("Failed to remove item");
    }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    try {
      await axios.put(`${API_BASE}/cart/update/${cartItemId}`, null, {
        params: { qty: newQty },
      });
      fetchCart();
    } catch (err) {
      console.error("updateQuantity:", err);
      showMsg("Failed to update quantity", 3000);
    }
  };

  const checkout = async () => {
    try {
      const res = await axios.post(`${API_BASE}/orders/checkout`);
      const order = res.data;
      setLatestOrderId(order.id);
      setShowPaymentModal(true);
    } catch (err) {
      console.error("checkout:", err);
      showMsg("Checkout failed - login or cart empty", 3500);
    }
  };

  const handlePayment = async () => {
    try {
      await axios.post(`${API_BASE}/payment/process/${latestOrderId}`);
      showMsg("✅ Payment successful! Order placed.", 4000);
      setShowPaymentModal(false);
      setCart([]);
      fetchOrders();
      setPaymentInfo({ name: "", card: "", expiry: "", cvv: "" });
    } catch (err) {
      console.error("payment error:", err);
      showMsg("Payment failed, please try again.");
    }
  };

  // --- Reviews --------------------------------------------------------------
  const submitReview = async () => {
    if (!reviewTarget) return;
    try {
      await axios.post(`${API_BASE}/reviews/add`, {
        productId: reviewTarget.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      showMsg("✅ Review submitted");
      setReviewTarget(null);
      setReviewData({ rating: 0, comment: "" });
      fetchReviews();
    } catch {
      showMsg("Failed to submit review");
    }
  };

  const editReview = async (review) => {
    const newComment = prompt("Edit your review:", review.comment || "");
    const newRating = prompt("Edit rating (1-5):", review.rating || "5");

    if (!newComment && !newRating) return;

    try {
      await axios.put(`${API_BASE}/reviews/update/${review.id}`, {
        rating: Number(newRating),
        comment: newComment,
      });
      showMsg("Review updated successfully");
      fetchReviews();
    } catch (err) {
      console.error("editReview:", err);
      showMsg("Failed to update review", 3000);
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`${API_BASE}/reviews/delete/${id}`);
      showMsg("Review deleted successfully");
      fetchReviews();
    } catch (err) {
      console.error("deleteReview:", err);
      showMsg("Failed to delete review", 3000);
    }
  };

  const handleSearch = async (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      fetchProducts();
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/products/search`, {
        params: { keyword: value },
      });
      setProducts(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("search error:", err);
      showMsg("Search failed", 2000);
    }
  };

  const applyFilters = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products/filter`, {
        params: {
          categoryId: selectedCategory || null,
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
          minRating: minRating || null,
        },
      });
      setProducts(res.data);
      showMsg("Filters applied");
      setShowFilters(false);
      setCurrentPage(1);
    } catch (err) {
      console.error("applyFilters:", err);
      showMsg("Filter failed", 2000);
    }
  };

  const resetFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    fetchProducts();
    setShowFilters(false);
  };

  const goToHome = () => {
    setView("products");
    fetchProducts();
    setSearchTerm("");
    setShowFilters(false);
    setCurrentPage(1);
  };

  // --- Lifecycle ------------------------------------------------------------
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.qty, 0);

  // --- UI -------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Free shipping on orders above ₹999
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span>📞 Support: 1800-123-4567</span>
              <span>📧 support@custore.com</span>
              <button
                onClick={() => setShowDevInfo(true)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Award className="w-3 h-3" />
                Developers
              </button>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <button onClick={goToHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 leading-tight">CU Store</h1>
                <p className="text-xs text-slate-500">Premium Marketplace</p>
              </div>
            </button>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all duration-300 text-sm"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {user && (
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              )}

              <button
                onClick={() => { setView("wishlist"); fetchWishlist(); }}
                className="relative p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setView("cart"); fetchCart(); }}
                className="relative p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {!user ? (
                <button
                  onClick={() => setView("login")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all duration-300"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
              ) : (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <button
                    onClick={() => setView("orders")}
                    className="p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Package className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-20 truncate">{user}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
              <button
                onClick={goToHome}
                className={`text-sm font-medium whitespace-nowrap transition-colors ${
                  view === "products" && !selectedCategory ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
                }`}
              >
                All Products
              </button>
              {Array.isArray(categories) && categories.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  onClick={async () => {
                    setSelectedCategory(cat.id);
                    setView("products");
                    setCurrentPage(1);
                    try {
                      const res = await axios.get(`${API_BASE}/products/filter`, {
                        params: {
                          categoryId: cat.id,
                          minPrice: minPrice || null,
                          maxPrice: maxPrice || null,
                          minRating: minRating || null,
                        },
                      });
                      setProducts(res.data);
                      showMsg(`Filtered by ${cat.name}`, 2000);
                    } catch (err) {
                      console.error("category filter error:", err);
                      showMsg("Filter failed", 2000);
                    }
                  }}
                  className={`text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              <button
                onClick={() => { setView("reviews"); fetchReviews(); }}
                className={`text-sm font-medium whitespace-nowrap transition-colors ${
                  view === "reviews" ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
                }`}
              >
                Reviews
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mt-8 space-y-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{user}</p>
                      <p className="text-xs text-slate-500">View Profile</p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setView("wishlist"); fetchWishlist(); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Wishlist</span>
                    {wishlist.length > 0 && (
                      <span className="ml-auto bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                        {wishlist.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { setView("cart"); fetchCart(); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart</span>
                    {cartItemCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {cartItemCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { setView("orders"); fetchOrders(); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Package className="w-5 h-5" />
                    <span>Orders</span>
                  </button>

                  <button
                    onClick={() => { setView("reviews"); fetchReviews(); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Star className="w-5 h-5" />
                    <span>Reviews</span>
                  </button>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors mt-4"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setView("login"); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => { setView("register"); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>Register</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message Toast */}
      {message && (
        <div className="fixed top-20 right-4 z-50 animate-in">
          <div className="bg-white border border-green-200 text-green-700 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb & Stats Bar */}
        {view === "products" && (
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <button onClick={goToHome} className="hover:text-blue-600">Home</button>
              <span>/</span>
              <span className="text-blue-600 font-medium">Products</span>
              <span className="ml-2 px-2 py-1 bg-slate-100 rounded-md text-xs">
                {products.length} items
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-blue-300 transition-all duration-300 text-sm"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-slate-400"}`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-slate-400"}`}
                >
                  <div className="w-4 h-4 flex flex-col gap-1">
                    <div className="bg-current h-1 rounded-sm"></div>
                    <div className="bg-current h-1 rounded-sm"></div>
                    <div className="bg-current h-1 rounded-sm"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Panel */}
        {view === "products" && showFilters && (
          <div className="mb-6 p-5 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) && categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
              />

              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
              />

              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm"
              >
                <option value="">All Ratings</option>
                <option value="4">⭐ 4+ Stars</option>
                <option value="3">⭐ 3+ Stars</option>
                <option value="2">⭐ 2+ Stars</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-300 text-sm"
                >
                  Apply
                </button>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <ShoppingCart className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* PRODUCTS VIEW */}
        {view === "products" && !loading && (
          <>
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-4"}>
              {paginatedProducts.map((p) => (
                <div
                  key={p.id}
                  className={`group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 ${
                    viewMode === "list" ? "flex" : ""
                  }`}
                >
                  <div className={`relative overflow-hidden ${viewMode === "list" ? "w-40 flex-shrink-0" : "h-48"}`}>
                    <img
                      src={p.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Quick Actions Overlay */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className={`p-2 rounded-lg backdrop-blur-md transition-colors duration-300 ${
                          isInWishlist(p.id)
                            ? "bg-red-500 text-white" 
                            : "bg-white/90 text-slate-600 hover:bg-red-50 hover:text-red-500"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isInWishlist(p.id) ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => setQuickView(p)}
                        className="p-2 rounded-lg bg-white/90 backdrop-blur-md text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Badge */}
                    {p.price && p.price < 1000 && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-md flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Deal
                      </div>
                    )}
                  </div>

                  <div className={`p-4 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
                    <div>
                      <h3 className="font-semibold text-sm mb-1 text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500 mb-2 line-clamp-2">{p.description}</p>
                    </div>

                    <div className={`flex items-center ${viewMode === "list" ? "justify-between" : "justify-between"} mt-2`}>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-slate-800">₹{priceStr(p)}</span>
                        <div className="flex items-center gap-1 text-xs text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-medium">4.5</span>
                          <span className="text-slate-400">(125)</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(p.id)}
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-1"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    currentPage === 1
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-white border border-slate-200 hover:border-blue-300 text-slate-700"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white border border-slate-200 hover:border-blue-300 text-slate-700"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-slate-400">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    currentPage === totalPages
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-white border border-slate-200 hover:border-blue-300 text-slate-700"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* CART VIEW */}
        {view === "cart" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Shopping Cart</h2>
              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-4 bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-all duration-300"
                    >
                      <img
                        src={c.product?.imageUrl || "https://via.placeholder.com/80"}
                        alt={c.product?.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{c.product?.name}</h3>
                        <p className="text-sm text-slate-500">₹{priceStr(c.product)} each</p>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(c.id, Math.max(1, c.qty - 1))}
                          className="w-7 h-7 rounded-md bg-white hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{c.qty}</span>
                        <button
                          onClick={() => updateQuantity(c.id, c.qty + 1)}
                          className="w-7 h-7 rounded-md bg-white hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-slate-800">
                          ₹{Number(c.product?.price * c.qty).toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteCartItem(c.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Your cart is empty</h3>
                  <p className="text-slate-500 mb-4">Add items to get started</p>
                  <button
                    onClick={() => setView("products")}
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            {cart.length > 0 && (
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200 sticky top-20">
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Order Summary</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal ({cartItemCount} items)</span>
                      <span className="font-semibold">₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Shipping</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tax (18%)</span>
                      <span className="font-semibold">₹{(cartTotal * 0.18).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-300 pt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-800">Total</span>
                        <span className="font-bold text-xl text-blue-600">₹{(cartTotal * 1.18).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={checkout}
                    className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Proceed to Checkout
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Award className="w-4 h-4" />
                    <span>Safe & Secure Payments</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS VIEW */}
        {view === "orders" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Your Orders</h2>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Order #{o.id}</h3>
                        <p className="text-sm text-slate-500 mt-1">Placed on {new Date().toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">₹{Number(o.total ?? 0).toLocaleString()}</div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                          o.status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                          {o.status}
                        </span>
                      </div>
                    </div>

                    {o.items?.map((it) => {
                      const alreadyReviewed = reviews.some(r => r.product?.id === it.product?.id);
                      return (
                        <div key={it.id} className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={it.product?.imageUrl || "https://via.placeholder.com/60"}
                              alt={it.product?.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h4 className="font-semibold text-slate-800">{it.product?.name}</h4>
                              <p className="text-sm text-slate-500">Qty: {it.qty} × ₹{priceStr(it.product)}</p>
                            </div>
                          </div>

                          {alreadyReviewed ? (
                            <span className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm">
                              <Star className="w-4 h-4 fill-current text-amber-400" />
                              Reviewed
                            </span>
                          ) : (
                            <button
                              onClick={() => setReviewTarget({ id: it.product?.id, name: it.product?.name })}
                              className="px-4 py-2 rounded-lg bg-amber-50 text-amber-600 font-medium hover:bg-amber-100 transition-colors text-sm flex items-center gap-1"
                            >
                              <Star className="w-4 h-4" />
                              Write Review
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No orders yet</h3>
                <p className="text-slate-500">Start shopping to see your orders here</p>
              </div>
            )}
          </div>
        )}

        {/* REVIEWS VIEW */}
        {view === "reviews" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Your Reviews</h2>
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 transition-all duration-300">
                    <div className="flex gap-4 mb-3">
                      <img
                        src={r.product?.imageUrl || "https://via.placeholder.com/80"}
                        alt={r.product?.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{r.product?.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3 italic">"{r.comment}"</p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      {user && user === r.user?.username && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => editReview(r)}
                            className="flex items-center gap-1 px-3 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteReview(r.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <Star className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No reviews yet</h3>
                <p className="text-slate-500">Purchase products to leave reviews</p>
              </div>
            )}
          </div>
        )}

        {/* WISHLIST VIEW */}
        {view === "wishlist" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Your Wishlist</h2>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {wishlist.map((item) => {
                  const p = item.product;
                  if (!p) return null;
                  return (
                    <div
                      key={item.id}
                      className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={p.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="p-2 rounded-lg bg-red-500 text-white backdrop-blur-md transition-colors duration-300 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        <div>
                          <h3 className="font-semibold text-sm mb-1 text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {p.name}
                          </h3>
                          <p className="text-xs text-slate-500 mb-2 line-clamp-2">{p.description}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-slate-800">₹{priceStr(p)}</span>
                            <div className="flex items-center gap-1 text-xs text-amber-500">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="font-medium">4.5</span>
                              <span className="text-slate-400">(125)</span>
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(p.id)}
                            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-1"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <Heart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Your wishlist is empty</h3>
                <p className="text-slate-500 mb-4">Save items you love for later</p>
                <button
                  onClick={() => setView("products")}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Browse Products
                </button>
              </div>
            )}
          </div>
        )}

        {/* LOGIN VIEW */}
        {view === "login" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
                <p className="text-slate-500 mt-2">Login to continue shopping</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                  <input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <input
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300"
                  />
                </div>

                <button
                  onClick={login}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Login
                </button>

                <div className="text-center text-sm">
                  <span className="text-slate-600">Don't have an account? </span>
                  <button
                    onClick={() => setView("register")}
                    className="text-blue-600 font-semibold hover:text-blue-700"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REGISTER VIEW */}
        {view === "register" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
                <p className="text-slate-500 mt-2">Join us and start shopping</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                  <input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Choose a username"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <input
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    type="password"
                    placeholder="Create a password"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email (optional)</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                    <input
                      value={form.address || ""}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Enter your full address"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300"
                    />
                  </div>

                </div>

                <button
                  onClick={register}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Create Account
                </button>

                <div className="text-center text-sm">
                  <span className="text-slate-600">Already have an account? </span>
                  <button
                    onClick={() => setView("login")}
                    className="text-green-600 font-semibold hover:text-green-700"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* QUICK VIEW MODAL */}
      {quickView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setQuickView(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-slate-100 p-8 flex items-center justify-center">
                <img
                  src={quickView.imageUrl || "https://via.placeholder.com/400"}
                  alt={quickView.name}
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
              
              <div className="p-8">
                <button
                  onClick={() => setQuickView(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">{quickView.name}</h2>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < 4 ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                    ))}
                  </div>
                  <span className="text-sm text-slate-500">(125 reviews)</span>
                </div>

                <div className="text-3xl font-bold text-blue-600 mb-4">
                  ₹{priceStr(quickView)}
                </div>

                <p className="text-slate-600 mb-6">{quickView.description}</p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      addToCart(quickView.id);
                      setQuickView(null);
                    }}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(quickView.id);
                    }}
                    className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      isInWishlist(quickView.id)
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(quickView.id) ? "fill-current" : ""}`} />
                    {isInWishlist(quickView.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">Key Features</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      Premium quality materials
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      Fast delivery available
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      30-day return policy
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Review {reviewTarget.name}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="transition-all duration-300 transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= reviewData.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Review</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all duration-300 min-h-32"
                  placeholder="Share your experience with this product..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setReviewTarget(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 font-medium transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Complete Payment</h2>
              <p className="text-slate-500 mt-2">Enter your payment details</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={paymentInfo.name}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="4111 1111 1111 1111"
                  value={paymentInfo.card}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, card: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={paymentInfo.expiry}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={paymentInfo.cvv}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all duration-300"
                    maxLength={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 font-medium transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={!paymentInfo.name || !paymentInfo.card || !paymentInfo.expiry || !paymentInfo.cvv}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 ${
                    paymentInfo.name && paymentInfo.card && paymentInfo.expiry && paymentInfo.cvv
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">CU Store</h3>
              <p className="text-slate-400 text-sm">Your trusted marketplace for premium products.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={goToHome} className="hover:text-white">Home</button></li>
                <li><button onClick={() => setView("products")} className="hover:text-white">Products</button></li>
                <li><button onClick={() => setView("cart")} className="hover:text-white">Cart</button></li>
                <li><button onClick={() => setView("orders")} className="hover:text-white">Orders</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-white cursor-pointer">Help Center</li>
                <li className="hover:text-white cursor-pointer">Terms & Conditions</li>
                <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer">Return Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>📞 1800-123-4567</li>
                <li>📧 support@custore.com</li>
                <li>📍 Ludhiana, Punjab, IN</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-6 text-center text-sm text-slate-400">
            <p>© 2024 CU Store. All rights reserved.</p>
            <button
              onClick={() => setShowDevInfo(true)}
              className="mt-2 text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 mx-auto"
            >
              <Award className="w-4 h-4" />
              View Developer Info
            </button>
          </div>
        </div>
      </footer>

      {/* Developer Info Modal */}
      {showDevInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDevInfo(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Developer Team</h2>
                    <p className="text-blue-100 text-sm">E-Commerce Platform Project</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDevInfo(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Development Team
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Kapil Thakur", uid: "24BCS80042" },
                    { name: "Shubham", uid: "23BCS12179" },
                    { name: "Harshita Parya", uid: "23BCS13838" },
                    { name: "Pritam Manna", uid: "23BCS11205" }
                  ].map((dev, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        {dev.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{dev.name}</p>
                        <p className="text-sm text-slate-500">UID: {dev.uid}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  Under Guidance Of
                </h3>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    K
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">Kusum Lata</p>
                    <p className="text-sm text-slate-600">Faculty ID: E17456</p>
                    <p className="text-xs text-slate-500 mt-1">Project Guide & Mentor</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-500">
                  🎓 Bachelor of Computer Science (BCS) Project
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Full Stack E-Commerce Application with React & Spring Boot
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
