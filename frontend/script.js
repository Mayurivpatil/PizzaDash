const grid = document.getElementById("pizza-grid");
const cartSidebar = document.getElementById("cart-sidebar");
const cartItemsList = document.getElementById("cart-items-list");
const cartCount = document.getElementById("cart-count");
const grandTotal = document.getElementById("grand-total");
const historySidebar = document.getElementById("history-sidebar");
const historyList = document.getElementById("history-list");

let cart = [];

// Fetch Pizzas from Forkify
let allPizzas = []; // New global variable to store the original list

async function loadPizzas() {
  try {
    const res = await fetch("https://forkify-api.herokuapp.com/api/v2/recipes?search=pizza");
    const data = await res.json();
    allPizzas = data.data.recipes.slice(0, 52); // Store the first 52
    displayPizzas(allPizzas); 
  } catch (err) {
    console.error("API Error", err);
  }
}


// Search for Pizza
document.getElementById("menu-search").addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    const filteredPizzas = allPizzas.filter(pizza => 
        pizza.title.toLowerCase().includes(searchTerm)
    );

    displayPizzas(filteredPizzas);
});

function displayPizzas(recipes) {
  grid.innerHTML = recipes
    .slice(0, 52)
    .map((recipe) => {
      const price = 120.99; // Mock price
      return `
            <div class="card">
                <img src="${recipe.image_url}" alt="${recipe.title}">
                <div class="card-body">
                    <h4>${recipe.title}</h4>
                    <p style="font-size: 12px; color: gray; margin: 5px 0;">${recipe.publisher}</p>
                    <span class="card-price">Rs. ${price}</span>
                    <button class="add-btn" onclick="addToCart('${recipe.title}', ${price})">Add +</button>
                </div>
            </div>
        `;
    })
    .join("");
}

// Check if pizza exists, if so increase quantity instead of adding a new row
function addToCart(title, price) {
    const existingItem = cart.find(item => item.title === title);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ title, price, quantity: 1 });
    }
    updateUI();
}

// Update UI to show quantities 
function updateUI() {
    // Update the red badge on the cart icon
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;

    // Generate the list of items in the sidebar
    cartItemsList.innerHTML = cart.map((item, index) => `
        <div class="cart-item" style="display: flex; flex-direction: column; gap: 8px; padding: 12px 0; border-bottom: 1px solid #eee;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">${item.title}</span>
                <strong style="color: #e23744;">Rs. ${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 5px; overflow: hidden;">
                    <button onclick="changeQty(${index}, -1)" style="background: #f8f8f8; border: none; padding: 5px 12px; cursor: pointer; font-weight: bold;">-</button>
                    <span style="padding: 0 10px; font-size: 14px; min-width: 20px; text-align: center;">${item.quantity}</span>
                    <button onclick="changeQty(${index}, 1)" style="background: #f8f8f8; border: none; padding: 5px 12px; cursor: pointer; font-weight: bold;">+</button>
                </div>
                <span style="font-size: 12px; color: #828282;">Rs. ${item.price} each</span>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    grandTotal.innerText = `Rs. ${total.toFixed(2)}`;
}

function changeQty(index, delta) {
    // Update quantity
    cart[index].quantity += delta;

    // If quantity drops to 0, remove the item from the array
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateUI();
}

// --- 4. Checkout Logic ---
document.getElementById("checkout-btn").addEventListener("click", async () => {
    if (cart.length === 0) return alert("Cart is empty");

    const nameInput = document.getElementById("cust-name");
    const phoneInput = document.getElementById("cust-phone");
    const addressInput = document.getElementById("cust-address");
    const payMethod = document.querySelector('input[name="pay-method"]:checked').value;

    if (!nameInput.value.trim() || !phoneInput.value.trim() || !addressInput.value.trim()) {
        alert("Please fill in all delivery details!");
        return;
    }

    const order = {
        customer_name: nameInput.value,
        customer_phone: phoneInput.value,
        delivery_address: addressInput.value,
        payment_method: payMethod,
        items: cart,
        total_price: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };

    try {
        const response = await fetch("http://localhost:5000/api/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order),
        });

        // Check if the response was successful
        if (response.ok) {
            alert("Order Received! 🍕");
            
            // 1. Reset Cart
            cart = [];
            updateUI();
            
            // 2. Clear Inputs
            nameInput.value = "";
            phoneInput.value = "";
            addressInput.value = "";
            
            // 3. Reset Payment UI
            document.querySelector('input[value="COD"]').checked = true;
            if (typeof toggleUPIFields === "function") toggleUPIFields(false);
            
            // 4. Close Sidebar
            document.getElementById("cart-sidebar").classList.remove("active");
            
        } else {
            // If server returns 400 or 500
            const errorData = await response.json();
            alert("Server Error: " + errorData.error);
        }
    } catch (err) {
        // This only runs if the FETCH fails (Network error / Server down)
        console.error("Fetch Error:", err);
        alert("Network error. Please check if your backend server is running.");
    }
});

// UI Handlers
document.getElementById("cart-icon").onclick = () =>
  cartSidebar.classList.add("active");
document.getElementById("close-cart").onclick = () =>
  cartSidebar.classList.remove("active");

loadPizzas();

// Open History Sidebar
document.getElementById("history-icon").onclick = () => {
  loadOrderHistory();
  historySidebar.classList.add("active");
};

// Close History Sidebar
document.getElementById("close-history").onclick = () => {
  historySidebar.classList.remove("active");
};

// Fetch History from Backend
async function loadOrderHistory() {
  try {
    const res = await fetch("http://localhost:5000/api/orders");
    const orders = await res.json();
    displayHistory(orders);
  } catch (err) {
    console.error("History Error", err);
  }
}

function displayHistory(orders) {
    historyList.innerHTML = "";

    if (orders.length === 0) {
        historyList.innerHTML = "<p style='text-align:center; color:gray;'>No orders yet!</p>";
        return;
    }

    historyList.innerHTML = orders.map(order => {
        const currentStatus = order.status || 'Preparing';
        const statusColor = currentStatus === 'Delivered' ? '#28a745' : '#f39c12';
        
        // Convert "COD" to a nicer label, or show "UPI / QR"
        const paymentLabel = order.payment_method === 'COD' ? 'Cash on Delivery' : 'Paid via UPI';

        return `
            <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                        <span style="font-weight: bold; font-size: 14px; display: block;">Order #${order.id}</span>
                        <span style="font-size: 10px; color: #aaa; text-transform: uppercase;">Real-time Update</span>
                    </div>
                    <span style="background: ${statusColor}; color: white; padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: bold;">
                        ${currentStatus}
                    </span>
                </div>
                
                <div style="font-size: 13px; color: #444; margin-bottom: 10px; padding-left: 8px; border-left: 3px solid #e23744;">
                    ${order.items.map(item => `<strong>${item.quantity || 1}x</strong> ${item.title}`).join('<br>')}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #eee; padding-top: 8px; margin-top: 8px;">
                    <span style="font-size: 11px; color: #888;">${paymentLabel}</span>
                    <strong style="color: #e23744;">Rs. ${parseFloat(order.total_price).toFixed(2)}</strong>
                </div>
            </div>
        `;
    }).join('');
}


// Refresh history every 30 seconds if the user is looking at it
setInterval(() => {
  if (historySidebar.classList.contains("active")) {
    loadOrderHistory();
  }
}, 10000);

document.getElementById("clear-cart").onclick = () => {
    if(confirm("Are you sure you want to empty your cart?")) {
        cart = [];
        updateUI();
    }
};

// Filter Logic
function filterByCategory(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.style.background = '#fff';
        b.style.color = '#000';
        b.style.borderColor = '#ddd';
    });
    btn.style.background = '#e23744';
    btn.style.color = '#fff';
    btn.style.borderColor = '#e23744';

    if (category === 'all') {
        displayPizzas(allPizzas);
        return;
    }

    // Keyword matching logic
    const filtered = allPizzas.filter(pizza => {
        const title = pizza.title.toLowerCase();
        if (category === 'cheese') return title.includes('cheese') || title.includes('margherita');
        if (category === 'veggie') return title.includes('veggie') || title.includes('artichoke') || title.includes('basil');
        if (category === 'meat') return title.includes('salami') || title.includes('pepperoni') || title.includes('chicken');
        return true;
    });

    displayPizzas(filtered);
}

// Back to Top 
const backToTopBtn = document.getElementById("backToTop");
window.onscroll = function() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
};

backToTopBtn.onclick = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function toggleUPIFields(show) {
    const upiDiv = document.getElementById('upi-fields');
    const qrImg = upiDiv.querySelector('img');
    
    if (show) {
        // Get the current total from the UI
        const totalText = document.getElementById("grand-total").innerText;
        const amount = totalText.replace(/[^\d.]/g, ''); // Extract just the numbers
        
        // Dynamic UPI URL: pa = VPA address, pn = Payee Name, am = Amount, cu = Currency
        const upiUrl = `upi://pay?pa=yourvpa@upi&pn=PizzaDash&am=${amount}&cu=INR`;
        
        // Update the QR API source
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`;
        
        upiDiv.style.display = 'block';
    } else {
        upiDiv.style.display = 'none';
    }
}