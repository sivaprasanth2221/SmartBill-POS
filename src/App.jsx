import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ShoppingCart, X, FileText, Package, BarChart3, Save, Download, Printer } from 'lucide-react';

const BillingSoftware = () => {
  // Load data from persistent storage
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('pos');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [bills, setBills] = useState([]);
  const [upiId, setUpiId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [paytmMerchantId, setPaytmMerchantId] = useState('');
  const [paytmMerchantKey, setPaytmMerchantKey] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed

  // Storage helper functions (localStorage wrapper)
  const storage = {
    get: (key) => {
      try {
        const value = localStorage.getItem(key);
        return value ? { value } : null;
      } catch (error) {
        console.error(`Error getting ${key} from storage:`, error);
        return null;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(key, value);
        return Promise.resolve();
      } catch (error) {
        console.error(`Error setting ${key} in storage:`, error);
        return Promise.reject(error);
      }
    }
  };

  // Initialize data from storage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load settings
      const settingsResult = storage.get('settings');
      if (settingsResult) {
        const settings = JSON.parse(settingsResult.value);
        setUpiId(settings.upiId || '');
        setStoreName(settings.storeName || 'SmartBill Store');
        setPaytmMerchantId(settings.paytmMerchantId || '');
        setPaytmMerchantKey(settings.paytmMerchantKey || '');
      } else {
        setStoreName('SmartBill Store');
      }

      // Load products
      const productsResult = storage.get('products');
      if (productsResult) {
        setProducts(JSON.parse(productsResult.value));
      } else {
        // Initialize with sample products on first load
        const sampleProducts = [
          { id: 1, name: 'Apple', price: 120, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/640px-Red_Apple.jpg', category: 'Fruits', stock: 50 },
          { id: 2, name: 'Banana', price: 40, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banana-Single.jpg/640px-Banana-Single.jpg', category: 'Fruits', stock: 100 },
          { id: 3, name: 'Milk', price: 60, image: 'https://images.unsplash.com/photo-1517448931760-9bf4414148c5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387', category: 'Dairy', stock: 30 },
          { id: 4, name: 'Bread', price: 35, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Korb_mit_Br%C3%B6tchen.JPG/640px-Korb_mit_Br%C3%B6tchen.JPG', category: 'Bakery', stock: 25 },
          { id: 5, name: 'Eggs', price: 80, image: 'https://plus.unsplash.com/premium_photo-1700004502440-aed2c0d909d8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870', category: 'Dairy', stock: 60 },
          { id: 6, name: 'Rice', price: 150, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387', category: 'Grains', stock: 40 }
        ];
        setProducts(sampleProducts);
        await storage.set('products', JSON.stringify(sampleProducts));
      }

      // Load bills
      const billsResult = storage.get('bills');
      if (billsResult) {
        setBills(JSON.parse(billsResult.value));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setStoreName('SmartBill Store');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProducts = async (updatedProducts) => {
    try {
      await storage.set('products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error saving products:', error);
      alert('Failed to save products. Please try again.');
    }
  };

  const saveBills = async (updatedBills) => {
    try {
      await storage.set('bills', JSON.stringify(updatedBills));
      setBills(updatedBills);
    } catch (error) {
      console.error('Error saving bills:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = { upiId, storeName, paytmMerchantId, paytmMerchantKey };
      await storage.set('settings', JSON.stringify(settings));
      setShowSettings(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    image: '',
    category: '',
    stock: ''
  });

  // Report filters
  const [reportPeriod, setReportPeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filter bills based on date range
  const getFilteredBills = () => {
    const now = new Date();
    let startDate = new Date(0);
    let endDate = new Date();

    switch (reportPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
        endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
        break;
      case 'last7days':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = new Date(weekAgo.getFullYear(), weekAgo.getMonth(), weekAgo.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'last30days':
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);
        startDate = new Date(monthAgo.getFullYear(), monthAgo.getMonth(), monthAgo.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'custom':
        if (customStartDate) {
          startDate = new Date(customStartDate);
          startDate.setHours(0, 0, 0, 0);
        }
        if (customEndDate) {
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      case 'all':
      default:
        return bills;
    }

    return bills.filter(bill => {
      const billDate = new Date(bill.date);
      return billDate >= startDate && billDate <= endDate;
    });
  };

  const filteredBills = getFilteredBills();

  // Add to cart
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('Product out of stock!');
      return;
    }
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('Cannot add more items than available stock!');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Update cart quantity
  const updateQuantity = (id, quantity) => {
    const product = products.find(p => p.id === id);
    if (!product) {
      console.error('Product not found');
      return;
    }
    if (quantity > product.stock) {
      alert('Cannot exceed available stock!');
      return;
    }
    if (quantity === 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Generate UPI QR Code URL
  const generateUPIQR = (amount) => {
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(storeName)}&am=${amount}&cu=INR`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
  };

  // Complete checkout
  const completeCheckout = async () => {
    const bill = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: [...cart],
      total: calculateTotal()
    };
    
    // Update stock
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        return { ...product, stock: product.stock - cartItem.quantity };
      }
      return product;
    });
    
    await saveProducts(updatedProducts);
    const updatedBills = [bill, ...bills];
    await saveBills(updatedBills);
    
    setPaymentCompleted(true);
    
    setTimeout(() => {
      setCart([]);
      setShowCheckout(false);
      setPaymentCompleted(false);
    }, 2000);
  };

  // Load Paytm Checkout JS dynamically
  const loadPaytmCheckoutJS = (merchantId) => {
    return new Promise((resolve, reject) => {
      // Check if script already loaded
      if (window.Paytm && window.Paytm.CheckoutJS) {
        resolve(window.Paytm.CheckoutJS);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/${merchantId}.js`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        if (window.Paytm && window.Paytm.CheckoutJS) {
          resolve(window.Paytm.CheckoutJS);
        } else {
          reject(new Error('Paytm CheckoutJS not loaded'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Paytm CheckoutJS'));
      };
      
      document.body.appendChild(script);
    });
  };

  // Initialize Paytm payment
  const initiatePaytmPayment = async () => {
    if (!paytmMerchantId || !paytmMerchantKey) {
      alert('Please configure Paytm Merchant ID and Key in Settings first!');
      setShowCheckout(false);
      setShowSettings(true);
      return;
    }

    const amount = calculateTotal();
    const orderId = `ORDER_${Date.now()}`;
    
    setPaymentStatus('processing');

    try {
      // IMPORTANT: In production, you MUST call your backend API to generate the transaction token
      // The merchant key should NEVER be exposed in frontend code
      // 
      // Backend API endpoint example:
      // POST /api/paytm/generate-token
      // Body: { orderId, amount, merchantId }
      // Response: { token, orderId }
      
      // Call backend API to generate Paytm transaction token
      // In production, this will be your Vercel deployment URL
      // For local development, use http://localhost:5173 (same origin)
      // For Vercel deployment, the API routes are on the same domain
      const backendApiUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
      
      let token;
      try {
        // Try to call backend API
        const response = await fetch(`${backendApiUrl}/api/paytm/generate-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            amount,
            merchantId: paytmMerchantId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          token = data.token;
        } else {
          throw new Error('Backend API not available');
        }
      } catch (error) {
        // Backend not available - show instruction
        console.warn('Backend API not available. Please set up backend API to generate Paytm transaction token.');
        alert('Backend API not configured. For production use, you need a backend server to generate Paytm transaction tokens securely.\n\nPlease set up your backend API endpoint.');
        setPaymentStatus('pending');
        return;
      }

      // Load Paytm Checkout JS
      const CheckoutJS = await loadPaytmCheckoutJS(paytmMerchantId);

      // Initialize Paytm Checkout
      CheckoutJS.invoke({
        config: {
          checkout: {
            flow: 'DEFAULT',
            merchant: {
              mid: paytmMerchantId,
              name: storeName,
              redirect: true,
            },
            data: {
              orderId: orderId,
              token: token,
              tokenType: 'TXN_TOKEN',
              amount: amount.toString(),
            },
            handler: {
              notifyMerchant: function(eventName, data) {
                console.log('Paytm Event:', eventName, data);
                if (eventName === 'PAYMENT_SUCCESS') {
                  handlePaytmPaymentSuccess(orderId, amount);
                } else if (eventName === 'PAYMENT_ERROR') {
                  handlePaytmPaymentFailure(new Error(data.errorMessage || 'Payment failed'));
                }
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('Paytm payment error:', error);
      handlePaytmPaymentFailure(error);
    }
  };

  // Handle Paytm payment success
  const handlePaytmPaymentSuccess = (orderId, amount) => {
    setPaymentStatus('success');
    completeCheckout();
  };

  // Handle Paytm payment failure
  const handlePaytmPaymentFailure = (error) => {
    setPaymentStatus('failed');
    alert('Payment failed: ' + (error.message || 'Unknown error'));
    setShowCheckout(false);
    setPaymentStatus('pending');
  };

  // CRUD Operations for Products
  const addProduct = async () => {
    if (!productForm.name || !productForm.price) {
      alert('Please fill in product name and price');
      return;
    }
    
    const newProduct = {
      id: Date.now(),
      name: productForm.name.trim(),
      price: parseFloat(productForm.price),
      image: productForm.image.trim(),
      category: (productForm.category || 'General').trim(),
      stock: parseInt(productForm.stock) || 0
    };
    
    await saveProducts([...products, newProduct]);
    resetForm();
  };

  const updateProduct = async () => {
    if (!productForm.name || !productForm.price) {
      alert('Please fill in product name and price');
      return;
    }

    const updatedProducts = products.map(p => {
      if (p.id === editingProduct.id) {
        return {
          ...p,
          name: productForm.name.trim(),
          price: parseFloat(productForm.price),
          image: productForm.image.trim() || 'https://cdn.pixabay.com/photo/2016/03/05/19/02/abstract-1238247_640.jpg',
          category: (productForm.category || 'General').trim(),
          stock: parseInt(productForm.stock) || 0
        };
      }
      return p;
    });
    
    await saveProducts(updatedProducts);
    resetForm();
  };

  const deleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await saveProducts(products.filter(p => p.id !== id));
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock
    });
    setShowProductForm(true);
    setActiveTab('inventory');
  };

  const resetForm = () => {
    setProductForm({ name: '', price: '', image: '', category: '', stock: '' });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  // Export data functions
  const exportToCSV = () => {
    const headers = ['Bill ID', 'Date', 'Items', 'Total'];
    const rows = filteredBills.map(bill => [
      bill.id,
      bill.date,
      bill.items.map(item => `${item.name} x${item.quantity}`).join('; '),
      bill.total
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const printReport = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg print:shadow-none">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-indigo-600 flex items-center gap-2">
              <img src='favicon.png' alt='Logo' className="w-8 h-8" />
              {storeName}
            </h1>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={() => setActiveTab('pos')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'pos'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                POS
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'inventory'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Inventory
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'reports'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Reports
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* POS Tab */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Grid */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Products</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className={`bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-indigo-400 overflow-hidden ${
                        product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <img
                        src={product.image || 'https://cdn.pixabay.com/photo/2016/03/05/19/02/abstract-1238247_640.jpg'}
                        alt={product.name}
                        className="w-full h-32 object-cover"
                        key={`${product.id}-${product.image}`}
                        onError={(e) => {
                          e.target.src = 'https://cdn.pixabay.com/photo/2016/03/05/19/02/abstract-1238247_640.jpg';
                        }}
                      />
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.category}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-lg font-bold text-indigo-600">₹{product.price}</p>
                          <p className={`text-xs ${product.stock <= 10 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                            Stock: {product.stock}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  Cart
                </h2>
                
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-500">₹{item.price} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => updateQuantity(item.id, 0)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold">Total:</span>
                        <span className="text-2xl font-bold text-indigo-600">₹{calculateTotal()}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (!paytmMerchantId || !paytmMerchantKey) {
                            alert('Please configure Paytm Merchant ID and Key in Settings first!');
                            setShowSettings(true);
                            return;
                          }
                          setPaymentStatus('pending');
                          setShowCheckout(true);
                        }}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg"
                      >
                        Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
              <button
                onClick={() => setShowProductForm(!showProductForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>

            {/* Product Form */}
            {showProductForm && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name *"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Price *"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Image URL (Pixabay or other open source)"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none md:col-span-2"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={editingProduct ? updateProduct : addProduct}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingProduct ? 'Update' : 'Add'} Product
                  </button>
                  <button
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Image</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Stock</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <img 
                          src={product.image || 'https://cdn.pixabay.com/photo/2016/03/05/19/02/abstract-1238247_640.jpg'} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded"
                          key={`${product.id}-${product.image}`}
                          onError={(e) => {
                            e.target.src = 'https://cdn.pixabay.com/photo/2016/03/05/19/02/abstract-1238247_640.jpg';
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold">{product.name}</td>
                      <td className="px-4 py-3">{product.category}</td>
                      <td className="px-4 py-3 font-semibold text-indigo-600">₹{product.price}</td>
                      <td className="px-4 py-3">
                        <span className={product.stock <= 10 ? 'text-red-500 font-semibold' : ''}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editProduct(product)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:flex-row">
              <h2 className="text-2xl font-bold text-gray-800">Sales Reports</h2>
              
              {/* Report Filter Controls */}
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto print:hidden">
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>

                {reportPeriod === 'custom' && (
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Start Date"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="End Date"
                    />
                  </div>
                )}

                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={printReport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg p-6">
                <p className="text-sm opacity-90">Total Sales</p>
                <p className="text-3xl font-bold">₹{filteredBills.reduce((sum, bill) => sum + bill.total, 0)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
                <p className="text-sm opacity-90">Total Bills</p>
                <p className="text-3xl font-bold">{filteredBills.length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
                <p className="text-sm opacity-90">Average Bill</p>
                <p className="text-3xl font-bold">
                  ₹{filteredBills.length > 0 ? Math.round(filteredBills.reduce((sum, bill) => sum + bill.total, 0) / filteredBills.length) : 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6">
                <p className="text-sm opacity-90">Items Sold</p>
                <p className="text-3xl font-bold">
                  {filteredBills.reduce((sum, bill) => sum + bill.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}
                </p>
              </div>
            </div>

            {/* Period Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Showing results for:</strong> {
                  reportPeriod === 'all' ? 'All Time' :
                  reportPeriod === 'today' ? 'Today' :
                  reportPeriod === 'yesterday' ? 'Yesterday' :
                  reportPeriod === 'last7days' ? 'Last 7 Days' :
                  reportPeriod === 'last30days' ? 'Last 30 Days' :
                  reportPeriod === 'thisMonth' ? 'This Month' :
                  reportPeriod === 'lastMonth' ? 'Last Month' :
                  reportPeriod === 'custom' && customStartDate && customEndDate ? 
                    `${customStartDate} to ${customEndDate}` : 
                    'Custom Range (Select dates)'
                }
              </p>
            </div>

            {/* Bills List */}
            <div className="space-y-4">
              {filteredBills.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No bills found for selected period</p>
                </div>
              ) : (
                filteredBills.map(bill => (
                  <div key={bill.id} className="border rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-lg">Bill #{bill.id}</p>
                        <p className="text-sm text-gray-500">{new Date(bill.date).toLocaleString()}</p>
                      </div>
                      <p className="text-xl font-bold text-indigo-600">₹{bill.total}</p>
                    </div>
                    <div className="space-y-1">
                      {bill.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span className="font-semibold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            {!paymentCompleted ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Complete Payment</h3>
                  <button onClick={() => setShowCheckout(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-3">Bill Summary</h4>
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm mb-2">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-indigo-600">₹{calculateTotal()}</span>
                  </div>
                </div>

                {paymentStatus === 'pending' && (
                  <div className="text-center mb-6">
                    <p className="text-lg font-semibold text-gray-800 mb-4">Pay with Paytm</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800 text-center">
                        Click the button below to proceed with Paytm payment gateway.
                      </p>
                    </div>
                    <button
                      onClick={initiatePaytmPayment}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                      </svg>
                      Pay ₹{calculateTotal()} with Paytm
                    </button>
                  </div>
                )}

                {paymentStatus === 'processing' && (
                  <div className="text-center mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-800 mb-2">Processing Payment...</p>
                    <p className="text-sm text-gray-500">Please wait while we process your payment</p>
                  </div>
                )}

                {paymentStatus === 'failed' && (
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-red-600 mb-2">Payment Failed</p>
                    <p className="text-sm text-gray-500 mb-4">Please try again</p>
                    <button
                      onClick={() => {
                        setPaymentStatus('pending');
                        initiatePaytmPayment();
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                      Retry Payment
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
                <p className="text-gray-600">Bill has been generated</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter store name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">UPI ID (Optional)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="yourname@upi"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: UPI ID for fallback payment methods.
                </p>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Paytm Payment Gateway</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Paytm Merchant ID *</label>
                  <input
                    type="text"
                    value={paytmMerchantId}
                    onChange={(e) => setPaytmMerchantId(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Enter your Paytm Merchant ID"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get this from your Paytm Business Dashboard
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Paytm Merchant Key *</label>
                  <input
                    type="password"
                    value={paytmMerchantKey}
                    onChange={(e) => setPaytmMerchantKey(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Enter your Paytm Merchant Key"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Keep this secure. Get this from your Paytm Business Dashboard
                  </p>
                </div>
              </div>

              {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> For production use, you need a backend server to generate Paytm transaction tokens securely. The merchant key should never be exposed in frontend code.
                </p>
              </div> */}
            </div>

            <button
              onClick={saveSettings}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all mt-6"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSoftware;