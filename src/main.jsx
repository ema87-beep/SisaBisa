import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Building2,
  Camera,
  ChevronDown,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  CreditCard,
  FileText,
  Heart,
  History,
  House,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  PackagePlus,
  QrCode,
  Save,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Truck,
  User,
  Wallet,
  WalletCards
} from "lucide-react";
import brandLogo from "./assets/sisabisa-logo-new.png";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "/api";
const rupiah = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const categories = ["Semua", "Sweet Bites", "Savory Bites", "Pastry", "Cake & Dessert"];
const priceRanges = ["Semua", "10.000 - 20.000", "20.000 - 30.000", "30.000 - 40.000", "40.000 - 50.000"];
const landingPages = ["landing", "landing-how", "landing-store", "landing-about"];
const authPages = ["auth-login", "auth-register-user", "auth-register-merchant"];
const paymentMethods = [
  { id: "QRIS", label: "QRIS", icon: QrCode },
  { id: "OVO", label: "OVO", icon: WalletCards },
  { id: "DANA", label: "DANA", icon: WalletCards },
  { id: "GoPay", label: "GoPay", icon: WalletCards },
  { id: "ShopeePay", label: "ShopeePay", icon: WalletCards },
  { id: "Transfer Bank", label: "Transfer Bank", icon: Building2 },
  { id: "Kartu Debit/Kredit", label: "Kartu", icon: CreditCard }
];
const statusLabels = {
  Reserved: "Dipesan",
  Preparing: "Diproses",
  "Ready for Pickup": "Siap Diambil",
  Completed: "Selesai",
  Cancelled: "Dibatalkan"
};
const refundLabels = {
  none: "Belum ada refund",
  requested: "Refund diajukan",
  approved: "Refund disetujui",
  rejected: "Refund ditolak"
};
const fallbackImage = "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=85";
const locations = [
  { id: "jakarta", label: "Jakarta, Indonesia" },
  { id: "bandung", label: "Bandung, Indonesia" },
  { id: "malang", label: "Malang, Indonesia" },
  { id: "surabaya", label: "Surabaya, Indonesia" }
];
const landingNavItems = [
  { id: "landing", label: "Beranda" },
  { id: "landing-how", label: "Cara Kerja" },
  { id: "landing-store", label: "Toko" },
  { id: "landing-about", label: "Tentang Kami" }
];

const policyContent = {
  user: {
    "Terms & Conditions": [
      "Pengguna wajib memastikan data akun, kontak, dan metode pembayaran valid saat melakukan transaksi.",
      "Pesanan rescue food tidak dapat dipilih isinya satu per satu kecuali merchant menyatakan sebaliknya.",
      "Pembeli wajib mengambil pesanan sesuai jadwal pickup yang ditampilkan pada halaman pesanan."
    ],
    "Privacy Policy": [
      "Kami menyimpan informasi akun, transaksi, dan preferensi agar pengalaman belanja lebih personal dan aman.",
      "Data tidak diperjualbelikan ke pihak ketiga di luar kebutuhan pembayaran, keamanan, dan operasional layanan."
    ],
    "Refund & Return Policy": [
      "Refund hanya dapat diajukan setelah pesanan diterima dan maksimal 6 jam setelah pickup selesai.",
      "Pengajuan refund diproses jika produk rusak berat, tidak layak konsumsi, atau berbeda signifikan dari deskripsi merchant.",
      "Return fisik tidak diwajibkan kecuali merchant meminta bukti tambahan."
    ],
    "Payment Policy": [
      "Pembayaran diproses saat checkout dan status pesanan akan berubah setelah transaksi berhasil.",
      "Promo atau potongan harga tidak bisa digabung di luar aturan kampanye yang berlaku."
    ],
    "Food Safety Disclaimer": [
      "Produk di platform ini adalah makanan rescue yang mendekati masa expired atau mendekati akhir waktu jual terbaik.",
      "Produk tetap aman dikonsumsi dalam waktu tertentu jika disimpan dan ditangani sesuai anjuran merchant.",
      "Setelah pembelian selesai, pembeli bertanggung jawab untuk memeriksa kondisi fisik, aroma, suhu, dan cara penyimpanan produk."
    ]
  },
  merchant: {
    "Terms & Conditions": [
      "Merchant wajib memberikan deskripsi produk yang jujur, termasuk kisaran isi box, jadwal pickup, dan jumlah stok.",
      "Merchant bertanggung jawab menjaga kualitas, keamanan, dan kesiapan pesanan sampai waktu serah terima."
    ],
    "Privacy Policy": [
      "Data pesanan dan pelanggan hanya boleh digunakan untuk operasional toko dan pemenuhan layanan.",
      "Merchant tidak diperbolehkan menyimpan atau memanfaatkan data pelanggan di luar kebutuhan transaksi."
    ],
    "Refund & Return Policy": [
      "Merchant wajib meninjau permintaan refund secara adil berdasarkan bukti yang diajukan pembeli.",
      "Refund dapat disetujui bila kualitas produk tidak sesuai, rusak, atau tidak aman saat diterima pembeli."
    ],
    "Payment Policy": [
      "Merchant menerima pembayaran setelah transaksi tercatat sukses di sistem.",
      "Penyelesaian dana mengikuti status pesanan dan keputusan refund jika ada sengketa."
    ],
    "Food Safety Disclaimer": [
      "Merchant wajib menandai produk rescue sebagai makanan yang mendekati expired atau best-before.",
      "Merchant wajib memberi instruksi singkat terkait penyimpanan dan jangka konsumsi aman.",
      "Setelah serah terima, tanggung jawab penyimpanan beralih ke pembeli, namun merchant tetap wajib mengirim produk yang layak dan aman."
    ]
  }
};

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function distanceOf(product, locationId) {
  const offset = locationId === "jakarta" ? 0 : locationId === "bandung" ? 0.9 : locationId === "malang" ? 1.2 : 1.8;
  return Number((0.8 + ((product.id * 7) % 23) / 10 + offset).toFixed(1));
}

function merchantLocationId(product) {
  return product.location_id || "jakarta";
}

function locationLabelById(locationId) {
  return locations.find((location) => location.id === locationId)?.label || locations[0].label;
}

function nextLocation(locationId) {
  return locations[(locations.findIndex((location) => location.id === locationId) + 1) % locations.length].id;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart") || "[]"));
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem("favorites") || "[]"));
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "Semua", priceRange: "Semua", sort: "Terbaru", distance: "Semua" });
  const [page, setPage] = useState("landing");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [locationId, setLocationId] = useState("jakarta");
  const [toast, setToast] = useState("");
  const [lastOrderId, setLastOrderId] = useState(null);
  const [checkoutAgreement, setCheckoutAgreement] = useState(false);
  const [userSection, setUserSection] = useState("home");
  const [merchantSection, setMerchantSection] = useState("dashboard");

  const authedFetch = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Permintaan gagal");
    return data;
  };

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(window.__sisabisaToast);
    window.__sisabisaToast = window.setTimeout(() => setToast(""), 3200);
  };

  const loadProducts = async () => {
    const data = await fetch(`${API}/products`).then((res) => res.json());
    setProducts(data);
  };

  const loadOrders = async () => {
    if (!token) {
      setOrders([]);
      return;
    }
    try {
      setOrders(await authedFetch(`${API}/orders`));
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (token) loadOrders();
  }, [token]);

  useEffect(() => {
    if (user?.role === "merchant" && user.location_id) {
      setLocationId(user.location_id);
    }
  }, [user?.id, user?.role, user?.location_id]);

  const selectedProduct = products.find((product) => product.id === selectedProductId) || null;
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;
  const lastOrder = orders.find((order) => order.id === lastOrderId) || null;
  const favoriteProducts = products.filter((product) => favorites.includes(product.id));
  const userOrders = user?.role === "user" ? orders : [];
  const merchantOrders = user?.role === "merchant" ? orders : [];
  const merchantProducts = user?.role === "merchant" ? products.filter((product) => product.merchant_id === user.id) : [];

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.filter((product) => merchantLocationId(product) === locationId);
    if (filters.category !== "Semua") {
      list = list.filter((product) => product.category === filters.category);
    }
    if (filters.priceRange === "10.000 - 20.000") list = list.filter((product) => product.price >= 10000 && product.price <= 20000);
    if (filters.priceRange === "20.000 - 30.000") list = list.filter((product) => product.price >= 20000 && product.price <= 30000);
    if (filters.priceRange === "30.000 - 40.000") list = list.filter((product) => product.price >= 30000 && product.price <= 40000);
    if (filters.priceRange === "40.000 - 50.000") list = list.filter((product) => product.price >= 40000 && product.price <= 50000);
    if (filters.distance === "< 2 km") list = list.filter((product) => distanceOf(product, locationId) < 2);
    if (filters.distance === "< 5 km") list = list.filter((product) => distanceOf(product, locationId) < 5);
    if (q) {
      list = list.filter((product) => [product.name, product.description, product.merchant_name, product.category].join(" ").toLowerCase().includes(q));
    }
    if (filters.sort === "Harga Termurah") list.sort((a, b) => a.price - b.price);
    if (filters.sort === "Harga Tertinggi") list.sort((a, b) => b.price - a.price);
    if (filters.sort === "Terdekat") list.sort((a, b) => distanceOf(a, locationId) - distanceOf(b, locationId));
    if (filters.sort === "Favorit") list.sort((a, b) => Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)));
    if (filters.sort === "Terbaru") list.sort((a, b) => b.id - a.id);
    return list;
  }, [products, filters, search, favorites, locationId]);

  const cartLines = cart
    .map((line) => ({ ...line, product: products.find((product) => product.id === line.productId) || line.product }))
    .filter((line) => line.product);
  const cartTotal = cartLines.reduce((sum, line) => sum + line.quantity * line.product.price, 0);

  const saveSession = ({ user: nextUser, token: nextToken }) => {
    setUser(nextUser);
    setToken(nextToken);
    if (nextUser?.role === "merchant" && nextUser.location_id) {
      setLocationId(nextUser.location_id);
    }
    localStorage.setItem("user", JSON.stringify(nextUser));
    localStorage.setItem("token", nextToken);
    setUserSection("home");
    setMerchantSection("dashboard");
    setPage(nextUser.role === "merchant" ? "merchant-dashboard" : "explore");
    notify(`Halo, ${nextUser.name}`);
  };

  const updateMerchantProfile = async (payload) => {
    const response = await authedFetch(`${API}/me`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    setUser(response.user);
    setLocationId(payload.locationId || "jakarta");
    localStorage.setItem("user", JSON.stringify(response.user));
    setProducts((current) => current.map((product) => (
      product.merchant_id === response.user.id
        ? {
            ...product,
            merchant_name: response.user.merchant_name || response.user.name,
            location_id: response.user.location_id || payload.locationId || "jakarta"
          }
        : product
    )));
    await loadProducts();
    notify("Lokasi toko berhasil diperbarui");
  };

  const logout = () => {
    setUser(null);
    setToken("");
    setOrders([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserSection("home");
    setMerchantSection("dashboard");
    setPage("landing");
  };

  const toggleFavorite = (productId) => {
    setFavorites((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]);
    notify(favorites.includes(productId) ? "Dihapus dari favorit" : "Ditambahkan ke favorit");
  };

  const openProduct = (productId) => {
    setSelectedProductId(productId);
    setPage("detail");
  };

  const openOrder = (orderId, nextPage = "order-detail") => {
    setSelectedOrderId(orderId);
    setPage(nextPage);
  };

  const addToCart = (product) => {
    if (product.stock < 1) return notify("Produk ini sedang habis");
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) => item.productId === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock), product }
          : item);
      }
      return [...current, { productId: product.id, quantity: 1, product }];
    });
    notify(`${product.name} masuk ke keranjang`);
    setPage("checkout");
  };

  const checkout = async () => {
    if (!user) return setPage("auth-login");
    if (user.role !== "user") return notify("Checkout hanya untuk akun pembeli");
    if (!cartLines.length) return notify("Keranjang masih kosong");
    if (!checkoutAgreement) return notify("Centang persetujuan Terms & Conditions dan Food Safety Disclaimer");
    try {
      const payload = {
        items: cartLines.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        paymentMethod
      };
      const response = await authedFetch(`${API}/checkout`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setCart([]);
      setCheckoutAgreement(false);
      await loadProducts();
      const freshOrders = await authedFetch(`${API}/orders`);
      setOrders(freshOrders);
      setLastOrderId(response.orderId);
      setPage("success");
      notify("Pesanan berhasil dibuat");
    } catch (error) {
      notify(error.message);
    }
  };

  const markReceived = async (orderId) => {
    await authedFetch(`${API}/orders/${orderId}/received`, { method: "PUT" });
    await loadOrders();
    notify("Pesanan sudah ditandai diterima");
  };

  const submitReview = async (productId, rating, comment, photo) => {
    await authedFetch(`${API}/reviews`, {
      method: "POST",
      body: JSON.stringify({ productId, rating, comment, photo })
    });
    await loadProducts();
    await loadOrders();
    notify("Review berhasil dikirim");
  };

  const requestRefund = async (orderId, reason) => {
    await authedFetch(`${API}/orders/${orderId}/refund`, {
      method: "PUT",
      body: JSON.stringify({ reason })
    });
    await loadOrders();
    notify("Refund berhasil diajukan");
  };

  const updateRefundStatus = async (orderId, refundStatus) => {
    await authedFetch(`${API}/orders/${orderId}/refund-status`, {
      method: "PUT",
      body: JSON.stringify({ refundStatus })
    });
    await loadOrders();
    notify("Status refund diperbarui");
  };

  const upsertProduct = async (payload, id) => {
    await authedFetch(id ? `${API}/products/${id}` : `${API}/products`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    await loadProducts();
    notify(id ? "Produk diperbarui" : "Produk ditambahkan");
  };

  const deleteProduct = async (id) => {
    await authedFetch(`${API}/products/${id}`, { method: "DELETE" });
    await loadProducts();
    notify("Produk dihapus");
  };

  const updateOrderStatus = async (id, status) => {
    await authedFetch(`${API}/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    await loadOrders();
    notify("Status pesanan diperbarui");
  };

  const goToSettings = () => {
    setPage(user?.role === "merchant" ? "merchant-settings" : "user-settings");
  };

  const openLandingPage = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openUserArea = (section = "home") => {
    if (!user) {
      setPage("auth-login");
      return;
    }
    if (user.role === "merchant") {
      setMerchantSection(section === "favorites" ? "dashboard" : section === "address" ? "dashboard" : "dashboard");
      setPage("merchant-dashboard");
      return;
    }
    setUserSection(section);
    setPage("user-dashboard");
  };

  const openMerchantArea = (section = "dashboard") => {
    if (!user) {
      setPage("auth-login");
      return;
    }
    if (user.role !== "merchant") {
      setUserSection("home");
      setPage("user-dashboard");
      return;
    }
    setMerchantSection(section);
    setPage("merchant-dashboard");
  };

  return (
    <div className="sisa-app">
      {landingPages.includes(page) ? (
        <LandingHeader page={page} setPage={openLandingPage} />
      ) : !authPages.includes(page) ? (
        <AppHeader
          user={user}
          page={page}
          setPage={setPage}
          logout={logout}
          search={search}
          setSearch={setSearch}
          locationId={locationId}
          setLocationId={setLocationId}
          favorites={favorites}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          openUserArea={openUserArea}
          openMerchantArea={openMerchantArea}
        />
      ) : null}

      {toast ? <div className="toast"><Bell size={16} />{toast}</div> : null}

      {page === "landing" && <LandingPage setPage={openLandingPage} setFilters={setFilters} setExplorePage={() => setPage("explore")} />}
      {page === "landing-how" && <LandingHowPage setPage={openLandingPage} setExplorePage={() => setPage("explore")} />}
      {page === "landing-store" && <LandingStorePage products={products} openProduct={openProduct} setPage={openLandingPage} />}
      {page === "landing-about" && <LandingAboutPage setPage={openLandingPage} />}
      {page === "explore" && (
        <ExplorePage
          products={filteredProducts}
          search={search}
          setSearch={setSearch}
          filters={filters}
          setFilters={setFilters}
          openProduct={openProduct}
          addToCart={addToCart}
          toggleFavorite={toggleFavorite}
          favorites={favorites}
          locationId={locationId}
          setPage={setPage}
        />
      )}
      {page === "detail" && selectedProduct && (
        <DetailPage
          product={selectedProduct}
          locationId={locationId}
          addToCart={addToCart}
          toggleFavorite={toggleFavorite}
          isFavorite={favorites.includes(selectedProduct.id)}
          goBack={() => setPage("explore")}
        />
      )}
      {page === "checkout" && (
        <CheckoutPage
          cartLines={cartLines}
          total={cartTotal}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          setCart={setCart}
          checkout={checkout}
          openProduct={openProduct}
          agreement={checkoutAgreement}
          setAgreement={setCheckoutAgreement}
          goToSettings={goToSettings}
        />
      )}
      {page === "success" && <SuccessPage order={lastOrder} setPage={setPage} />}
      {page === "auth-login" && <AuthPage mode="login" initialRole="user" saveSession={saveSession} notify={notify} setPage={setPage} />}
      {page === "auth-register-user" && <AuthPage mode="register" initialRole="user" saveSession={saveSession} notify={notify} setPage={setPage} />}
      {page === "auth-register-merchant" && <AuthPage mode="register" initialRole="merchant" saveSession={saveSession} notify={notify} setPage={setPage} />}
      {page === "order-detail" && selectedOrder && (
        <OrderDetailPage
          order={selectedOrder}
          openProduct={openProduct}
          markReceived={markReceived}
          requestRefund={requestRefund}
          submitReview={submitReview}
          goBack={() => setPage(user?.role === "merchant" ? "merchant-dashboard" : "user-dashboard")}
          userRole={user?.role}
          updateRefundStatus={updateRefundStatus}
        />
      )}
      {page === "user-dashboard" && user?.role === "user" && (
        <UserDashboard
          user={user}
          orders={userOrders}
          favoriteProducts={favoriteProducts}
          products={products}
          openProduct={openProduct}
          openOrder={openOrder}
          openSection={openUserArea}
          section={userSection}
          locationId={locationId}
          setLocationId={setLocationId}
          paymentMethod={paymentMethod}
          logout={logout}
          goToSettings={goToSettings}
        />
      )}
      {page === "merchant-dashboard" && user?.role === "merchant" && (
        <MerchantDashboard
          user={user}
          products={merchantProducts}
          orders={merchantOrders}
          allProducts={products}
          openOrder={openOrder}
          openProduct={openProduct}
          upsertProduct={upsertProduct}
          deleteProduct={deleteProduct}
          updateOrderStatus={updateOrderStatus}
          openSection={openMerchantArea}
          section={merchantSection}
          logout={logout}
          goToSettings={goToSettings}
        />
      )}
      {page === "user-settings" && user?.role === "user" && (
        <SettingsPage role="user" user={user} goBack={() => setPage("user-dashboard")} />
      )}
      {page === "merchant-settings" && user?.role === "merchant" && (
        <SettingsPage role="merchant" user={user} goBack={() => setPage("merchant-dashboard")} saveMerchantProfile={updateMerchantProfile} />
      )}
    </div>
  );
}

function LandingHeader({ page, setPage }) {
  if (page === "landing") {
    return (
      <header className="landing-header landing-header-dark">
        <div className="shell landing-header-inner">
          <BrandLogo onClick={() => setPage("landing")} />
          <nav className="landing-nav landing-nav-dark">
            {landingNavItems.map((item) => (
              <button
                key={item.id}
                className={page === item.id ? "active" : ""}
                onClick={() => setPage(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="landing-header-actions">
            <button className="ghost-btn" onClick={() => setPage("auth-login")}>Login</button>
            <button className="primary-btn landing-login-btn" onClick={() => setPage("auth-register-user")}>Daftar</button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="landing-header">
      <div className="shell landing-header-inner">
        <BrandLogo onClick={() => setPage("landing")} />
        <nav className="landing-nav">
          {landingNavItems.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "active" : ""}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="landing-header-actions">
          <button className="ghost-btn" onClick={() => setPage("auth-login")}>Login</button>
          <button className="primary-btn" onClick={() => setPage("auth-register-user")}>Daftar</button>
        </div>
      </div>
    </header>
  );
}

function AppHeader({ user, page, setPage, logout, search, setSearch, locationId, setLocationId, favorites, cartCount, openUserArea, openMerchantArea }) {
  if (user?.role === "merchant") {
    return (
      <header className="app-header merchant-header-minimal">
        <div className="shell app-header-inner merchant-header-inner">
          <BrandLogo onClick={() => setPage("merchant-dashboard")} />
          <div className="header-icons">
            <button className="ghost-btn" onClick={logout}><LogOut size={16} /> Logout</button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="app-header">
      <div className="shell app-header-inner">
        <BrandLogo onClick={() => setPage("explore")} />
        <div className="header-search-shell">
          <Search size={18} />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage("explore"); }} placeholder="Cari makanan atau toko..." />
        </div>
        <button className="header-location" onClick={() => setLocationId(nextLocation(locationId))}>
          <MapPin size={16} />
          <span>{locationLabelById(locationId)}</span>
          <ChevronDown size={16} />
        </button>
        <div className="header-icons">
          <button className="icon-ghost" onClick={() => user?.role === "merchant" ? openMerchantArea("dashboard") : openUserArea("home")} aria-label="Profil">
            <User size={18} />
          </button>
          <button className="icon-ghost" onClick={() => user?.role === "merchant" ? openMerchantArea("ulasan") : openUserArea("favorites")} aria-label="Favorit">
            <Heart size={18} />
            {favorites.length ? <span>{favorites.length}</span> : null}
          </button>
          <button className="icon-ghost" onClick={() => setPage("checkout")} aria-label="Keranjang">
            <ShoppingBag size={18} />
            {cartCount ? <span>{cartCount}</span> : null}
          </button>
          {user ? <button className="ghost-btn" onClick={logout}><LogOut size={16} /> Logout</button> : <button className="primary-btn" onClick={() => setPage("auth-login")}>Masuk</button>}
        </div>
      </div>
    </header>
  );
}

function BrandLogo({ onClick }) {
  return (
    <button className="brand-logo" onClick={onClick || (() => window.scrollTo({ top: 0, behavior: "smooth" }))}>
      <span className="brand-mark-frame">
        <img className="brand-mark" src={brandLogo} alt="SisaBisa" />
      </span>
    </button>
  );
}

function LandingPage({ setPage, setFilters, setExplorePage }) {
  const features = [
    { icon: Wallet, title: "Hemat Uang", text: "Dapat makanan berkualitas dengan harga miring." },
    { icon: ShoppingBag, title: "Selamatkan Makanan", text: "Kurangi makanan yang terbuang setiap hari." },
    { icon: ShieldCheck, title: "Dukung Lingkungan", text: "Membantu bumi dengan pilihan belanja yang lebih baik." },
    { icon: Package, title: "Mudah & Praktis", text: "Pesan online lalu ambil di toko terdekat." }
  ];
  const steps = [
    "Pilih makanan dari toko terdekat",
    "Pesan dan bayar secara aman",
    "Ambil pesanan sesuai jadwal",
    "Bantu kurangi food waste"
  ];

  return (
    <main>
      <section className="landing-hero landing-hero-dark">
        <div className="shell landing-hero-grid">
          <div className="landing-copy landing-copy-dark">
            <span className="landing-kicker">Marketplace Bakery Rescue</span>
            <h1>
              <span className="accent-line">Roti, pastry,</span>
              <span>dan box kejutan dari bakery favoritmu.</span>
            </h1>
            <p>SisaBisa membantu kamu menemukan rescue box bakery dengan pickup cepat, harga hemat, dan stok yang terus bergerak.</p>
            <div className="landing-actions">
              <button className="primary-btn" onClick={() => setExplorePage()}>Cari Makanan</button>
              <button className="ghost-btn" onClick={() => { setFilters({ category: "Semua", priceRange: "Semua", sort: "Terdekat", distance: "< 2 km" }); setExplorePage(); }}>Lihat Terdekat</button>
            </div>
          </div>
          <div className="landing-image-card landing-image-dark-card">
            <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=85" alt="Rescue food bakery box" />
            <div className="landing-image-badge">
              <strong>Pickup cepat</strong>
              <span>Batch segar hampir habis</span>
            </div>
          </div>
        </div>
      </section>

      <section className="shell landing-sections">
        <section className="soft-panel">
          <h2>Kenapa SisaBisa?</h2>
          <div className="benefit-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="icon-feature">
                  <span className="icon-badge"><Icon size={20} /></span>
                  <strong>{feature.title}</strong>
                  <p>{feature.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="soft-panel">
          <h2>Cara Kerja</h2>
          <div className="step-row">
            {steps.map((step, index) => (
              <article key={step} className="step-card">
                <span>{index + 1}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
          <button className="link-inline" onClick={() => setPage("landing-how")}>Lihat detail alur <ChevronRight size={16} /></button>
        </section>
      </section>
    </main>
  );
}

function LandingHowPage({ setPage, setExplorePage }) {
  const steps = [
    { title: "Cari toko terdekat", text: "Pilih merchant rescue food berdasarkan lokasi aktif, kategori, dan harga." },
    { title: "Pilih box favorit", text: "Baca detail produk, rating pembeli, estimasi isi, dan jam ambil." },
    { title: "Bayar dengan aman", text: "Gunakan QRIS, OVO, DANA, GoPay, ShopeePay, transfer bank, atau kartu." },
    { title: "Ambil di toko", text: "Datang ke toko sesuai jadwal pickup dan tunjukkan kode pengambilan." }
  ];

  return (
    <main className="shell landing-subpage">
      <section className="soft-panel">
        <div className="section-head">
          <div>
            <h2>Cara Kerja SisaBisa</h2>
            <p>Alur lengkap dari pencarian sampai penyelamatan makanan.</p>
          </div>
          <button className="primary-btn" onClick={setExplorePage}>Mulai Explore</button>
        </div>
        <div className="step-detail-grid">
          {steps.map((step, index) => (
            <article key={step.title} className="step-detail-card">
              <span className="step-number">{index + 1}</span>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
        <button className="link-inline" onClick={() => setPage("landing")}>Kembali ke beranda</button>
      </section>
    </main>
  );
}

function LandingStorePage({ products, openProduct, setPage }) {
  const storeMap = new Map();
  products.forEach((product) => {
    if (!storeMap.has(product.merchant_name)) {
      storeMap.set(product.merchant_name, {
        merchant_name: product.merchant_name,
        verified: product.verified,
        image: product.image || fallbackImage,
        locationId: merchantLocationId(product),
        items: []
      });
    }
    storeMap.get(product.merchant_name).items.push(product);
  });

  return (
    <main className="shell landing-subpage">
      <section className="soft-panel">
        <div className="section-head">
          <div>
            <h2>Toko di SisaBisa</h2>
            <p>Bandingkan toko terverifikasi dan toko baru yang aktif menyelamatkan makanan.</p>
          </div>
        </div>
        <div className="store-directory-grid">
          {[...storeMap.values()].map((store) => (
            <article key={store.merchant_name} className="store-directory-card">
              <img src={store.image} alt={store.merchant_name} />
              <div>
                <div className="store-card-title">
                  <strong>{store.merchant_name}</strong>
                  <span className={store.verified ? "green-badge" : "status-badge"}>{store.verified ? "Verified Merchant" : "Toko Baru"}</span>
                </div>
                <p>{locationLabelById(store.locationId)}</p>
                <small>{store.items.length} produk aktif</small>
              </div>
              <div className="store-directory-actions">
                <button className="ghost-btn tiny-btn" onClick={() => setPage("landing-about")}>Tentang</button>
                <button className="primary-btn tiny-btn" onClick={() => openProduct(store.items[0].id)}>Lihat Produk</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function LandingAboutPage({ setPage }) {
  return (
    <main className="shell landing-subpage">
      <section className="soft-panel about-panel">
        <h2>Tentang SisaBisa</h2>
        <p>SisaBisa adalah marketplace rescue food untuk roti, pastry, kue, dan snack yang masih layak konsumsi tetapi mendekati akhir waktu jual terbaik.</p>
        <div className="about-grid">
          <article className="settings-card">
            <h3>Misi</h3>
            <p>Menghubungkan pembeli dengan toko lokal agar makanan enak tidak berakhir terbuang.</p>
          </article>
          <article className="settings-card">
            <h3>Untuk Pembeli</h3>
            <p>Dapat harga hemat, lokasi pickup jelas, pembayaran praktis, dan ulasan transparan.</p>
          </article>
          <article className="settings-card">
            <h3>Untuk Merchant</h3>
            <p>Kurangi waste, pergerakan stok lebih sehat, dan pesanan bisa dikelola dari dashboard toko.</p>
          </article>
        </div>
        <button className="primary-btn" onClick={() => setPage("landing-store")}>Lihat toko partner</button>
      </section>
    </main>
  );
}

function ExplorePage({ products, search, setSearch, filters, setFilters, openProduct, addToCart, toggleFavorite, favorites, locationId, setPage }) {
  return (
    <main className="shell explore-page">
      <section className="explore-headline">
        <div>
          <h2>Temukan makanan terdekat</h2>
          <p>Mystery box makanan lezat dengan harga hemat di {locationLabelById(locationId)}.</p>
        </div>
      </section>

      <section className="filter-bar">
        <label className="filter-field">
          <span>Harga</span>
          <select value={filters.priceRange} onChange={(event) => setFilters({ ...filters, priceRange: event.target.value })}>
            {priceRanges.map((range) => <option key={range}>{range}</option>)}
          </select>
        </label>
        <label className="filter-field">
          <span>Jarak</span>
          <select value={filters.distance} onChange={(event) => setFilters({ ...filters, distance: event.target.value })}>
            {["Semua", "< 2 km", "< 5 km"].map((distance) => <option key={distance}>{distance}</option>)}
          </select>
        </label>
        <label className="filter-field">
          <span>Urutkan</span>
          <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}>
            {["Terbaru", "Harga Termurah", "Harga Tertinggi", "Terdekat", "Favorit"].map((sort) => <option key={sort}>{sort}</option>)}
          </select>
        </label>
        <div className="filter-actions">
          <button className="ghost-btn tiny-btn filter-action-btn" onClick={() => setFilters({ ...filters })}>
            <Settings size={14} /> Filter
          </button>
        </div>
      </section>

      <section className="header-search-inline">
        <div className="filter-search">
          <Search size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari makanan atau toko..." />
        </div>
      </section>

      <section className="category-scroll">
        {categories.map((category) => (
          <button key={category} className={filters.category === category ? "tag-pill active" : "tag-pill"} onClick={() => setFilters({ ...filters, category })}>
            {category}
          </button>
        ))}
      </section>

      <section className="product-grid">
        {products.map((product) => (
          <article key={product.id} className="listing-card">
            <button className="listing-image" onClick={() => openProduct(product.id)}>
              <img src={product.image || fallbackImage} alt={product.name} />
              <span className="stock-chip">{product.stock <= 3 ? "Hampir Habis" : `Sisa ${product.stock}`}</span>
            </button>
            <div className="listing-body">
              <div className="listing-head">
                <div>
                  <strong>{product.merchant_name}</strong>
                  <h3>{product.name}</h3>
                </div>
                <button className={favorites.includes(product.id) ? "favorite-btn active" : "favorite-btn"} onClick={() => toggleFavorite(product.id)}>
                  <Heart size={16} />
                </button>
              </div>
              <p>{product.description}</p>
              <div className="listing-meta">
                <span>{product.verified ? <BadgeCheck size={14} /> : <Store size={14} />}{product.verified ? "Terverifikasi" : "Toko Baru"}</span>
                <span><MapPin size={14} /> {distanceOf(product, locationId)} km</span>
                <span>{locationLabelById(merchantLocationId(product))}</span>
              </div>
              <div className="listing-price">
                <div>
                  <strong>{rupiah(product.price)}</strong>
                  <small>{rupiah(product.estimated_value || product.price)}</small>
                </div>
                <div className="listing-actions">
                  <button className="ghost-btn tiny-btn" onClick={() => openProduct(product.id)}>Detail</button>
                  <button className="primary-btn tiny-btn" onClick={() => addToCart(product)}>Tambah</button>
                </div>
              </div>
              <button className="link-inline card-link" onClick={() => setPage("landing-store")}>Lihat toko</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function DetailPage({ product, locationId, addToCart, toggleFavorite, isFavorite, goBack }) {
  return (
    <main className="shell detail-page">
      <button className="back-link" onClick={goBack}><ArrowLeft size={18} /> Kembali</button>
      <section className="detail-grid">
        <div className="detail-gallery">
          <img className="hero-shot" src={product.image || fallbackImage} alt={product.name} />
          <div className="thumb-row">
            {[0, 1, 2, 3].map((thumb) => <img key={thumb} src={product.image || fallbackImage} alt="" />)}
          </div>
        </div>
        <div className="detail-summary">
          <div className="detail-header-row">
            <div>
              <strong>{product.merchant_name}</strong>
              <h2>{product.name}</h2>
            </div>
            <button className={isFavorite ? "favorite-btn active" : "favorite-btn"} onClick={() => toggleFavorite(product.id)}>
              <Heart size={18} />
            </button>
          </div>
          <div className="detail-meta-row">
            <span><Star size={14} /> {product.avg_rating || "Baru"} ({product.review_count || 0})</span>
            <span><MapPin size={14} /> {distanceOf(product, locationId)} km</span>
          </div>
          <div className="soft-card">
            <strong>Kemungkinan isi:</strong>
            <ul className="plain-list">
              <li>Croissant</li>
              <li>Roti manis</li>
              <li>Donat / muffin</li>
              <li>Produk lainnya</li>
            </ul>
          </div>
          <div className="price-card">
            <div>
              <strong>{rupiah(product.price)}</strong>
              <small>{rupiah(product.estimated_value || product.price)}</small>
            </div>
            <span className="green-badge">Hemat 37%</span>
          </div>
          <div className="soft-card compact-stack">
            <span><Clock3 size={16} /> Ambil di toko: Hari ini, 15:00 - 20:00</span>
            <span><MapPin size={16} /> Lokasi toko: {locationLabelById(merchantLocationId(product))}</span>
            <span><ShoppingBag size={16} /> Sisa stok: {product.stock} box</span>
          </div>
          <button className="primary-btn full-btn" onClick={() => addToCart(product)}>Tambah ke Keranjang</button>
        </div>
      </section>

      <section className="store-panel">
        <div className="store-card">
          <img src={product.image || fallbackImage} alt={product.merchant_name} />
          <div>
            <strong>{product.merchant_name}</strong>
            <p>Toko rescue food yang menyediakan berbagai macam roti dan pastry segar setiap hari.</p>
          </div>
        </div>
      </section>

      <section className="review-section">
        <h3>Review pembeli</h3>
        <div className="review-stack">
          {product.reviews?.length ? product.reviews.map((review) => (
            <article key={review.id} className="review-card">
              {review.photo ? <img src={review.photo} alt="Foto review" /> : <div className="review-placeholder" />}
              <div>
                <strong>{review.name}</strong>
                <span>{review.rating}/5</span>
                <p>{review.comment}</p>
              </div>
            </article>
          )) : <p className="empty-text">Belum ada review untuk produk ini.</p>}
        </div>
      </section>
    </main>
  );
}

function CheckoutPage({ cartLines, total, paymentMethod, setPaymentMethod, setCart, checkout, openProduct, agreement, setAgreement, goToSettings }) {
  return (
    <main className="shell checkout-grid">
      <section className="soft-panel">
        <h2>Detail Pesanan</h2>
        {cartLines.map((line) => (
          <button key={line.productId} className="checkout-item" onClick={() => openProduct(line.productId)}>
            <img src={line.product.image || fallbackImage} alt={line.product.name} />
            <div>
              <strong>{line.product.merchant_name}</strong>
              <p>{line.product.name}</p>
              <small>{line.quantity} x {rupiah(line.product.price)}</small>
            </div>
          </button>
        ))}
        <div className="soft-card compact-stack">
          <span><Clock3 size={16} /> Ambil di toko: Hari ini, 15:00 - 20:00</span>
          <textarea placeholder="Catatan untuk toko (opsional)" />
        </div>

        <div className="soft-card summary-card">
          <strong>Ringkasan Pembayaran</strong>
          <div><span>Subtotal</span><span>{rupiah(total)}</span></div>
          <div><span>Biaya Layanan</span><span>{rupiah(2000)}</span></div>
          <div className="summary-total"><span>Total Pembayaran</span><span>{rupiah(total + 2000)}</span></div>
        </div>
      </section>

      <section className="soft-panel">
        <h2>Metode Pembayaran</h2>
        <div className="payment-list">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button key={method.id} className={paymentMethod === method.id ? "payment-row active" : "payment-row"} onClick={() => setPaymentMethod(method.id)}>
                <span><Icon size={16} /> {method.label}</span>
                <span className="radio-dot" />
              </button>
            );
          })}
        </div>

        <label className="consent-box">
          <input type="checkbox" checked={agreement} onChange={(event) => setAgreement(event.target.checked)} />
          <span>Saya telah membaca dan menyetujui Terms & Conditions serta Food Safety Disclaimer</span>
        </label>
        <button className="link-inline align-left" onClick={goToSettings}>Buka halaman kebijakan</button>

        <button className="primary-btn full-btn" onClick={checkout}>Bayar Sekarang</button>
        <p className="help-note">Transaksi aman dan terenkripsi.</p>
        <button className="ghost-btn full-btn" onClick={() => setCart([])}>Kosongkan Keranjang</button>
      </section>
    </main>
  );
}

function SuccessPage({ order, setPage }) {
  return (
    <main className="shell success-wrap">
      <section className="success-card">
        <span className="success-icon"><CircleCheckBig size={32} /></span>
        <h2>Pesanan Berhasil!</h2>
        <p>Terima kasih telah ikut menyelamatkan makanan.</p>
        <div className="pickup-panel">
          <div>
            <strong>Kode Pickup</strong>
            <div className="pickup-number">{order?.pickup_code || "-"}</div>
          </div>
          <div className="qr-box">
            <QrCode size={72} />
          </div>
        </div>
        <div className="success-meta">
          <span><Store size={16} /> Ambil di toko</span>
          <span><Clock3 size={16} /> Hari ini, 15:00 - 20:00</span>
        </div>
        <button className="primary-btn full-btn" onClick={() => setPage("user-dashboard")}>Lihat Pesanan Saya</button>
        <button className="ghost-btn full-btn" onClick={() => setPage("landing")}>Kembali ke Beranda</button>
      </section>
    </main>
  );
}

function AuthPage({ mode, initialRole, saveSession, notify, setPage }) {
  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    merchantName: ""
  });

  const submit = async (event) => {
    event.preventDefault();
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role })
      });
      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error("Server belum siap atau respons login tidak valid");
      }
      if (!response.ok) throw new Error(data.error || "Gagal login");
      saveSession(data);
    } catch (error) {
      notify(error.message);
    }
  };

  return (
    <main className="auth-wrap">
      <form className="auth-sheet" onSubmit={submit}>
        <div>
          <p className="eyebrow">Akses Aman</p>
          <h2>
            {mode === "login" ? "Masuk ke SisaBisa" : role === "merchant" ? "Daftar Merchant SisaBisa" : "Daftar Pembeli SisaBisa"}
          </h2>
        </div>
        <div className="segmented-control">
          <button type="button" className={role === "user" ? "active" : ""} onClick={() => { setRole("user"); if (mode === "register") setPage("auth-register-user"); }}>Pembeli</button>
          <button type="button" className={role === "merchant" ? "active" : ""} onClick={() => { setRole("merchant"); if (mode === "register") setPage("auth-register-merchant"); }}>Merchant</button>
        </div>
        {mode === "register" ? <input placeholder="Nama" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /> : null}
        {mode === "register" && role === "merchant" ? <input placeholder="Nama Toko" value={form.merchantName} onChange={(event) => setForm({ ...form, merchantName: event.target.value })} /> : null}
        <input placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        <button className="primary-btn full-btn">{mode === "login" ? "Masuk" : "Daftar"}</button>
        <button
          type="button"
          className="link-inline center"
          onClick={() => setPage(mode === "login" ? "auth-register-user" : "auth-login")}
        >
          {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}
        </button>
        {mode === "register" ? (
          <button type="button" className="link-inline center" onClick={() => setPage(role === "merchant" ? "auth-register-user" : "auth-register-merchant")}>
            {role === "merchant" ? "Daftar sebagai pembeli" : "Daftar sebagai merchant"}
          </button>
        ) : (
          <button type="button" className="link-inline center" onClick={() => setPage("auth-register-merchant")}>
            Buat akun merchant
          </button>
        )}
        <button type="button" className="link-inline center" onClick={() => setPage("landing")}>
          Kembali ke landing
        </button>
      </form>
    </main>
  );
}

function Sidebar({ items, title, subtitle }) {
  return (
    <aside className="side-menu">
      {title ? (
        <div className="sidebar-shop">
          <img className="sidebar-logo" src={brandLogo} alt={title} />
          <div>
            <strong>{title}</strong>
            <span>{subtitle}</span>
          </div>
        </div>
      ) : null}
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.label} className={item.active ? "menu-item active" : "menu-item"} onClick={item.onClick}>
            <Icon size={16} /> {item.label}
          </button>
        );
      })}
    </aside>
  );
}

function UserDashboard({ user, orders, favoriteProducts, products, openProduct, openOrder, openSection, section, locationId, setLocationId, paymentMethod, logout, goToSettings }) {
  const totalSpend = orders.reduce((sum, order) => sum + order.total, 0);
  const rescuedKg = orders.reduce((sum, order) => sum + order.items.length * 1.2, 0);
  const sidebarItems = [
    { label: "Beranda", icon: House, active: section === "home", onClick: () => openSection("home") },
    { label: "Pesanan Saya", icon: History, active: section === "orders", onClick: () => openSection("orders") },
    { label: "Favorit", icon: Heart, active: section === "favorites", onClick: () => openSection("favorites") },
    { label: "Alamat", icon: MapPin, active: section === "address", onClick: () => openSection("address") },
    { label: "Pembayaran", icon: CreditCard, active: section === "payment", onClick: () => openSection("payment") },
    { label: "Pengaturan", icon: Settings, active: false, onClick: goToSettings },
    { label: "Logout", icon: LogOut, active: false, onClick: logout }
  ];
  const recentRecommendations = products.filter((product) => !favoriteProducts.some((favorite) => favorite.id === product.id)).slice(0, 4);

  return (
    <main className="shell dashboard-shell">
      <Sidebar items={sidebarItems} />
      <section className="dashboard-main">
        <div className="dash-headline">
          <div>
            <h2>Halo, {user.name}!</h2>
            <p>Terima kasih telah menjadi Food Hero!</p>
          </div>
        </div>

        {section === "home" ? (
          <>
            <div className="stats-strip">
              <article><strong>{orders.length}</strong><span>Pesanan</span></article>
              <article><strong>{rescuedKg.toFixed(1)} kg</strong><span>Makanan Terselamatkan</span></article>
              <article><strong>{rupiah(totalSpend)}</strong><span>Uang Dibelanjakan</span></article>
            </div>

            <section className="dashboard-card">
              <div className="section-head">
                <h3>Pesanan Terakhir</h3>
                <button className="link-inline" onClick={() => openSection("orders")}>Lihat Semua</button>
              </div>
              <div className="dashboard-list">
                {orders.slice(0, 3).map((order) => (
                  <button key={order.id} className="dashboard-list-row" onClick={() => openOrder(order.id)}>
                    <div className="thumb-placeholder" />
                    <div>
                      <strong>Pesanan #{order.id}</strong>
                      <p>{order.items[0]?.product_snapshot.name || "Bakery Box"}</p>
                      <small>{new Date(order.created_at).toLocaleString()}</small>
                    </div>
                    <span className="status-badge">{statusLabels[order.status] || order.status}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="dashboard-card">
              <div className="section-head">
                <h3>Rekomendasi Untukmu</h3>
                <button className="link-inline" onClick={() => openSection("favorites")}>Lihat Favorit</button>
              </div>
              <div className="recommend-grid">
                {recentRecommendations.length ? recentRecommendations.map((product) => (
                  <button key={product.id} className="mini-product-card" onClick={() => openProduct(product.id)}>
                    <img src={product.image || fallbackImage} alt={product.name} />
                    <strong>{product.name}</strong>
                  </button>
                )) : <p className="empty-text">Belum ada rekomendasi.</p>}
              </div>
            </section>
          </>
        ) : null}

        {section === "orders" ? (
          <section className="dashboard-card">
            <div className="section-head">
              <h3>Pesanan Saya</h3>
              <span className="green-badge">{orders.length} pesanan</span>
            </div>
            <div className="dashboard-list">
              {orders.length ? orders.map((order) => (
                <button key={order.id} className="dashboard-list-row" onClick={() => openOrder(order.id)}>
                  <div className="thumb-placeholder" />
                  <div>
                    <strong>#{order.id}</strong>
                    <p>{order.items.map((item) => item.product_snapshot.name).join(", ")}</p>
                    <small>{order.pickup_code}</small>
                  </div>
                  <span className="status-badge">{statusLabels[order.status] || order.status}</span>
                </button>
              )) : <p className="empty-text">Belum ada pesanan.</p>}
            </div>
          </section>
        ) : null}

        {section === "favorites" ? (
          <section className="dashboard-card">
            <div className="section-head">
              <h3>Favorit</h3>
              <span className="green-badge">{favoriteProducts.length} tersimpan</span>
            </div>
            <div className="recommend-grid">
              {favoriteProducts.length ? favoriteProducts.map((product) => (
                <button key={product.id} className="mini-product-card" onClick={() => openProduct(product.id)}>
                  <img src={product.image || fallbackImage} alt={product.name} />
                  <strong>{product.name}</strong>
                </button>
              )) : <p className="empty-text">Belum ada produk favorit.</p>}
            </div>
          </section>
        ) : null}

        {section === "address" ? (
          <section className="dashboard-card">
            <div className="section-head">
              <h3>Alamat & Lokasi Pickup</h3>
              <span className="status-badge">Tersinkron dengan header explore</span>
            </div>
            <div className="address-grid">
              {locations.map((location) => (
                <button
                  key={location.id}
                  className={location.id === locationId ? "address-card active" : "address-card"}
                  onClick={() => setLocationId(location.id)}
                >
                  <strong>{location.label}</strong>
                  <p>Pickup dan rekomendasi toko akan mengikuti kota ini.</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {section === "payment" ? (
          <section className="dashboard-card">
            <div className="section-head">
              <h3>Pembayaran</h3>
              <span className="green-badge">Default: {paymentMethod}</span>
            </div>
            <div className="payment-summary-list">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <article key={method.id} className={paymentMethod === method.id ? "payment-summary-card active" : "payment-summary-card"}>
                    <strong><Icon size={16} /> {method.label}</strong>
                    <p>{paymentMethod === method.id ? "Sedang dipakai di checkout." : "Tersedia untuk checkout."}</p>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function MerchantDashboard({ user, products, orders, allProducts, openOrder, openProduct, upsertProduct, deleteProduct, updateOrderStatus, openSection, section, logout, goToSettings }) {
  const [editing, setEditing] = useState(null);
  const merchantReviews = products
    .filter((product) => product.review_count)
    .sort((a, b) => b.review_count - a.review_count);
  const sidebarItems = [
    { label: "Dashboard", icon: LayoutDashboard, active: section === "dashboard", onClick: () => openSection("dashboard") },
    { label: "Produk Saya", icon: Package, active: section === "products", onClick: () => openSection("products") },
    { label: "Pesanan", icon: History, active: section === "orders", onClick: () => openSection("orders") },
    { label: "Statistik", icon: Truck, active: section === "stats", onClick: () => openSection("stats") },
    { label: "Ulasan", icon: Star, active: section === "ulasan", onClick: () => openSection("ulasan") },
    { label: "Pengaturan Toko", icon: Settings, active: false, onClick: goToSettings },
    { label: "Logout", icon: LogOut, active: false, onClick: logout }
  ];

  return (
    <main className="shell dashboard-shell">
      <Sidebar items={sidebarItems} title={user.merchant_name || user.name} subtitle="Dashboard" />
      <section className="dashboard-main">
        <div className="dash-headline">
          <div>
            <h2>Dashboard</h2>
            <p>Pantau produk aktif, pesanan, dan refund dari toko kamu.</p>
          </div>
          {section === "dashboard" ? (
            <button className="primary-btn" onClick={() => setEditing({})}><PackagePlus size={16} /> Tambah Produk</button>
          ) : null}
        </div>

        {section === "dashboard" ? (
          <>
            <div className="stats-strip merchant-stats">
              <article><strong>{orders.length}</strong><span>Pesanan Hari Ini</span></article>
              <article><strong>{products.length}</strong><span>Produk Aktif</span></article>
              <article><strong>{products.reduce((sum, product) => sum + product.stock, 0)}</strong><span>Stok Tersisa</span></article>
              <article><strong>{rupiah(orders.reduce((sum, order) => sum + order.total, 0))}</strong><span>Pendapatan</span></article>
            </div>

            <section className="dashboard-card">
              <div className="section-head">
                <h3>Produk Aktif</h3>
                <button className="link-inline" onClick={() => openSection("products")}>Lihat Semua</button>
              </div>
              <div className="merchant-product-list">
                {products.slice(0, 3).map((product) => (
                  <article key={product.id} className="merchant-row">
                    <button className="merchant-image-btn" onClick={() => openProduct(product.id)}>
                      <img src={product.image || fallbackImage} alt={product.name} />
                    </button>
                    <div>
                      <strong>{product.name}</strong>
                      <p>{product.description}</p>
                    </div>
                    <span>{rupiah(product.price)}</span>
                    <span>Stok {product.stock}</span>
                    <button className="ghost-btn tiny-btn" onClick={() => setEditing(product)}>Edit</button>
                    <button className="ghost-btn tiny-btn danger-btn" onClick={() => deleteProduct(product.id)}>Hapus</button>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-card">
              <div className="section-head">
                <h3>Pesanan Terbaru</h3>
                <button className="link-inline" onClick={() => openSection("orders")}>Lihat Semua</button>
              </div>
              <div className="dashboard-list">
                {orders.slice(0, 4).map((order) => (
                  <div key={order.id} className="dashboard-list-row merchant-order-open">
                    <button className="merchant-order-link" onClick={() => openOrder(order.id)}>
                      <div className="thumb-placeholder" />
                      <div>
                        <strong>#{order.id}</strong>
                        <p>{order.items[0]?.product_snapshot.name || "Bakery Box"}</p>
                        <small>{order.pickup_code}</small>
                      </div>
                    </button>
                    <select value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)}>
                      {Object.keys(statusLabels).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                    </select>
                    <span className="status-badge">{refundLabels[order.refund_status] || refundLabels.none}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {section === "products" ? (
          <section className="dashboard-card">
            <div className="section-head">
              <h3>Produk Saya</h3>
              <span className="green-badge">{products.length} aktif</span>
            </div>
            <div className="merchant-product-list">
              {products.map((product) => (
                <article key={product.id} className="merchant-row">
                  <button className="merchant-image-btn" onClick={() => openProduct(product.id)}>
                    <img src={product.image || fallbackImage} alt={product.name} />
                  </button>
                  <div>
                    <strong>{product.name}</strong>
                    <p>{product.description}</p>
                  </div>
                  <span>{rupiah(product.price)}</span>
                  <span>Stok {product.stock}</span>
                  <button className="ghost-btn tiny-btn" onClick={() => setEditing(product)}>Edit</button>
                  <button className="ghost-btn tiny-btn danger-btn" onClick={() => deleteProduct(product.id)}>Hapus</button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {section === "orders" ? (
          <section className="dashboard-card">
            <div className="section-head">
              <h3>Pesanan</h3>
              <span className="green-badge">{orders.length} masuk</span>
            </div>
            <div className="dashboard-list">
              {orders.length ? orders.map((order) => (
                <div key={order.id} className="dashboard-list-row merchant-order-open">
                  <button className="merchant-order-link" onClick={() => openOrder(order.id)}>
                    <div className="thumb-placeholder" />
                    <div>
                      <strong>#{order.id}</strong>
                      <p>{order.items.map((item) => item.product_snapshot.name).join(", ")}</p>
                      <small>{order.pickup_code}</small>
                    </div>
                  </button>
                  <select value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)}>
                    {Object.keys(statusLabels).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                  </select>
                  <span className="status-badge">{refundLabels[order.refund_status] || refundLabels.none}</span>
                </div>
              )) : <p className="empty-text">Belum ada pesanan masuk.</p>}
            </div>
          </section>
        ) : null}

        {section === "stats" ? (
          <section className="dashboard-card">
            <div className="section-head">
              <h3>Statistik Toko</h3>
            </div>
            <div className="stats-strip merchant-stats">
              <article><strong>{orders.filter((order) => order.status === "Completed").length}</strong><span>Pesanan Selesai</span></article>
              <article><strong>{products.reduce((sum, product) => sum + product.stock, 0)}</strong><span>Total Stok</span></article>
              <article><strong>{products.reduce((sum, product) => sum + (product.review_count || 0), 0)}</strong><span>Total Review</span></article>
              <article><strong>{rupiah(orders.reduce((sum, order) => sum + order.total, 0))}</strong><span>Pendapatan Kotor</span></article>
            </div>
          </section>
        ) : null}

        {section === "ulasan" ? (
          <section className="dashboard-card">
            <div className="section-head">
              <h3>Ulasan Produk</h3>
              <span className="status-badge">Klik produk untuk lihat detail</span>
            </div>
            <div className="merchant-review-grid">
              {merchantReviews.length ? merchantReviews.map((product) => (
                <button key={product.id} className="merchant-review-card" onClick={() => openProduct(product.id)}>
                  <img src={product.image || fallbackImage} alt={product.name} />
                  <div>
                    <strong>{product.name}</strong>
                    <p>{(product.rating || 0).toFixed(1)} / 5 dari {product.review_count} ulasan</p>
                  </div>
                </button>
              )) : <p className="empty-text">Belum ada ulasan untuk toko ini.</p>}
            </div>
          </section>
        ) : null}
      </section>

      {editing ? <ProductForm product={editing.id ? editing : null} close={() => setEditing(null)} save={async (payload, id) => { await upsertProduct(payload, id); setEditing(null); }} /> : null}
    </main>
  );
}

function OrderDetailPage({ order, openProduct, markReceived, requestRefund, submitReview, goBack, userRole, updateRefundStatus }) {
  const [refundReason, setRefundReason] = useState("");

  return (
    <main className="shell order-detail-page">
      <button className="back-link" onClick={goBack}><ArrowLeft size={18} /> Kembali</button>
      <section className="soft-panel">
        <div className="section-head">
          <h2>Detail Pesanan #{order.id}</h2>
          <span className="status-badge">{statusLabels[order.status] || order.status}</span>
        </div>
        <div className="order-detail-meta">
          <span><QrCode size={16} /> {order.pickup_code}</span>
          <span><Wallet size={16} /> {order.payment_method}</span>
          <span><FileText size={16} /> {refundLabels[order.refund_status] || refundLabels.none}</span>
        </div>
        <div className="dashboard-list">
          {order.items.map((item) => (
            <button key={item.id} className="dashboard-list-row" onClick={() => openProduct(item.product_id)}>
              <img className="mini-thumb" src={item.product_snapshot.image || fallbackImage} alt={item.product_snapshot.name} />
              <div>
                <strong>{item.product_snapshot.name}</strong>
                <p>{item.product_snapshot.category}</p>
              </div>
              <span>{item.quantity}x</span>
            </button>
          ))}
        </div>
        {userRole === "user" && order.status !== "Completed" && order.status !== "Cancelled" ? (
          <button className="primary-btn" onClick={() => markReceived(order.id)}>Tandai Sudah Diterima</button>
        ) : null}
        {userRole === "user" && order.status === "Completed" ? (
          <div className="refund-section">
            <div className="soft-card">
              <strong>Refund & Return</strong>
              <p>Ajukan refund jika produk rusak, tidak aman, atau berbeda jauh dari deskripsi merchant.</p>
              <textarea placeholder="Alasan refund / return" value={refundReason} onChange={(event) => setRefundReason(event.target.value)} />
              <button className="ghost-btn" onClick={() => requestRefund(order.id, refundReason)}>Ajukan Refund</button>
            </div>
            <div className="review-stack">
              {order.items.map((item) => <OrderReviewForm key={item.id} item={item} submitReview={submitReview} />)}
            </div>
          </div>
        ) : null}
        {userRole === "merchant" && order.refund_status === "requested" ? (
          <div className="inline-actions">
            <button className="ghost-btn" onClick={() => updateRefundStatus(order.id, "approved")}>Setujui Refund</button>
            <button className="ghost-btn danger-btn" onClick={() => updateRefundStatus(order.id, "rejected")}>Tolak Refund</button>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function OrderReviewForm({ item, submitReview }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState("");

  return (
    <form className="review-form-card" onSubmit={(event) => {
      event.preventDefault();
      submitReview(item.product_id, rating, comment, photo);
      setComment("");
      setPhoto("");
    }}>
      <strong>Review {item.product_snapshot.name}</strong>
      {photo ? <img className="review-upload-preview" src={photo} alt="Preview review" /> : null}
      <div className="mini-review-grid">
        <input type="number" min="1" max="5" value={rating} onChange={(event) => setRating(event.target.value)} />
        <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Tulis pengalaman kamu" />
        <label className="upload-pill"><Camera size={16} /> Upload Foto<input type="file" accept="image/*" onChange={async (event) => setPhoto(await readImageFile(event.target.files?.[0]))} /></label>
        <button className="primary-btn tiny-btn">Kirim</button>
      </div>
    </form>
  );
}

function ProductForm({ product, close, save }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "Sweet Bites",
    price: product?.price || 25000,
    estimatedValue: product?.estimated_value || product?.price || 35000,
    stock: product?.stock || 10,
    image: product?.image || "",
    description: product?.description || "",
    expiresAt: product?.expires_at || new Date(Date.now() + 6 * 3600000).toISOString(),
    isMystery: !!product?.is_mystery
  });
  const hasImage = Boolean(form.image);

  return (
    <div className="modal-backdrop" onClick={close}>
      <form
        className="merchant-modal"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          if (!hasImage) return;
          save(form, product?.id);
        }}
      >
        <div className="section-head">
          <h3>{product ? "Edit Produk" : "Tambah Produk"}</h3>
          <button type="button" className="ghost-btn" onClick={close}>Tutup</button>
        </div>
        <input placeholder="Nama produk" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
          {categories.filter((item) => item !== "Semua").map((item) => <option key={item}>{item}</option>)}
        </select>
        <input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
        <input type="number" value={form.estimatedValue} onChange={(event) => setForm({ ...form, estimatedValue: event.target.value })} />
        <input type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
        <label className="image-drop">
          <img src={form.image || fallbackImage} alt="Preview produk" />
          <span><ImagePlus size={16} /> {hasImage ? "Klik untuk ganti foto" : "Upload foto toko"}</span>
          <input type="file" accept="image/*" onChange={async (event) => setForm({ ...form, image: await readImageFile(event.target.files?.[0]) })} />
        </label>
        <p className="helper-note">Gunakan upload foto dari perangkat. Link foto tidak dipakai di form ini.</p>
        <textarea placeholder="Deskripsi produk" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <label className="switch-line">
          <input type="checkbox" checked={form.isMystery} onChange={(event) => setForm({ ...form, isMystery: event.target.checked })} />
          Mystery Box
        </label>
        <div className="modal-actions product-form-actions">
          <button type="button" className="ghost-btn" onClick={close}>Batal</button>
          <button className="primary-btn full-btn" disabled={!hasImage}><Save size={16} /> Simpan Produk</button>
        </div>
      </form>
    </div>
  );
}

function SettingsPage({ role, user, goBack, saveMerchantProfile }) {
  const items = policyContent[role];
  const [merchantName, setMerchantName] = useState(user?.merchant_name || user?.name || "");
  const [storeLocationId, setStoreLocationId] = useState(user?.location_id || "jakarta");
  return (
    <main className="shell settings-page">
      <button className="back-link" onClick={goBack}><ArrowLeft size={18} /> Kembali</button>
      <section className="soft-panel">
        <div className="section-head">
          <div>
            <h2>Pengaturan Profil</h2>
            <p>{role === "merchant" ? user.merchant_name || user.name : user.name}</p>
          </div>
          <span className="green-badge">{role === "merchant" ? "Merchant" : "Pembeli"}</span>
        </div>
        {role === "merchant" ? (
          <form
            className="settings-card merchant-settings-form"
            onSubmit={async (event) => {
              event.preventDefault();
              await saveMerchantProfile({ merchantName, locationId: storeLocationId });
            }}
          >
            <h3>Pengaturan Toko</h3>
            <p>Ubah nama tampilan toko dan lokasi toko langsung dari dashboard.</p>
            <input value={merchantName} onChange={(event) => setMerchantName(event.target.value)} placeholder="Nama toko" />
            <select value={storeLocationId} onChange={(event) => setStoreLocationId(event.target.value)}>
              {locations.map((location) => <option key={location.id} value={location.id}>{location.label}</option>)}
            </select>
            <div className="modal-actions">
              <button className="primary-btn" type="submit"><Save size={16} /> Simpan Lokasi Toko</button>
            </div>
          </form>
        ) : null}
        <div className="settings-grid">
          {Object.entries(items).map(([title, paragraphs]) => (
            <article key={title} className="settings-card">
              <h3>{title}</h3>
              {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
