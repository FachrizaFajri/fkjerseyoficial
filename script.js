// =====================
// FK Jersey Oficial App
// =====================

const whatsappNumber = "62895611492509";

let cart = JSON.parse(localStorage.getItem("cartData")) || [];
let currentProduct = null;

// Element referensi
const detailModal = document.querySelector('#product-detail-modal');
const checkoutModal = document.querySelector('#checkout-modal');
const modalProductName = document.querySelector('#modal-product-name');
const modalProductImage = document.querySelector('#modal-product-image');
const modalProductPrice = document.querySelector('#modal-product-price');
const modalSubtotalPrice = document.querySelector('#modal-subtotal-price');
const modalFinalPrice = document.querySelector('#modal-final-price');
const sizeSelect = document.querySelector('#size');
const quantityInput = document.querySelector('#quantity');
const checkoutForm = document.querySelector('#checkout-form');
const cartBtn = document.querySelector('#cart-btn');
const cartSidebar = document.querySelector('#cart-sidebar');
const notificationArea = document.querySelector('#notification-area');
const cartCount = document.querySelector('#cart-count');
const cartItemsContainer = document.querySelector('.cart-items-container');
const emptyCartMsg = document.querySelector('#empty-cart-message');
const paymentMethodEl = document.querySelector('#payment-method');
const paymentInfo = document.querySelector('#payment-info');
const paymentDetails = document.querySelector('#payment-details');
const qrisImage = document.querySelector('#qris-image');
const closeCartBtn = document.querySelector('#close-cart-btn');

// Format Rupiah
function formatRupiah(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Notifikasi
function showNotification(msg) {
    const div = document.createElement("div");
    div.className = "notification show";
    div.innerHTML = `✔ ${msg}`;
    notificationArea.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Simpan ke LocalStorage
function saveCart() {
    localStorage.setItem("cartData", JSON.stringify(cart));
}

// Add to Cart
function addToCart(product, size, qty) {
    const existing = cart.find(i => i.id === product.id && i.size === size);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ ...product, size, qty, selected: true });
    }
    saveCart();
    showNotification(`${product.name} (Size ${size}) masuk keranjang`);
    updateCartDisplay();
    updateCartSummary();
}

// Buka modal detail produk
function openDetailModal(product, mode) {
    currentProduct = product;
    detailModal.setAttribute("data-mode", mode);

    modalProductName.textContent = product.name;
    modalProductImage.src = product.image;
    modalProductPrice.textContent = `Rp ${formatRupiah(product.price)},-`;

    sizeSelect.value = "";
    quantityInput.value = 1;
    updateSubtotal();

    detailModal.style.display = "block";
}

// Update Subtotal
function updateSubtotal() {
    const qty = parseInt(quantityInput.value) || 0;
    modalSubtotalPrice.textContent = `Rp ${formatRupiah(currentProduct.price * qty)},-`;
}
quantityInput.addEventListener("input", updateSubtotal);

// Event Tombol
document.querySelectorAll(".buy-now-btn").forEach(btn => {
    btn.addEventListener("click", e => {
        const box = e.target.closest(".box");
        const product = {
            id: box.dataset.id,
            name: box.dataset.name,
            price: parseInt(box.dataset.price),
            image: box.dataset.image,
            size: 'S', // Default size
            qty: 1,    // Default quantity
            selected: true // Ensure selected for checkout
        };
        // Directly set cart and open checkout modal
        cart = [product];
        saveCart();
        updateCartDisplay();
        modalFinalPrice.textContent = `Rp ${formatRupiah(product.price)},-`;
        // Clear form fields for new buy now
        document.querySelector("#nama").value = "";
        document.querySelector("#alamat").value = "";
        document.querySelector("#telepon").value = "";
        document.querySelector("#payment-method").value = "";
        checkoutModal.style.display = "block";
    });
});

document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", e => {
        const box = e.target.closest(".box");
        openDetailModal({
            id: box.dataset.id,
            name: box.dataset.name,
            price: parseInt(box.dataset.price),
            image: box.dataset.image
        }, "add-to-cart");
    });
});

// Submit Form Popup
document.querySelector("#add-to-cart-form").addEventListener("submit", e => {
    e.preventDefault();
    const qty = parseInt(quantityInput.value);
    const size = sizeSelect.value;
    const mode = detailModal.getAttribute("data-mode");

    if (!size || qty < 1) return alert("Pilih ukuran & jumlah!");

    detailModal.style.display = "none";

    if (mode === "buy-now") {
        cart = [{ ...currentProduct, size, qty }];
        modalFinalPrice.textContent = `Rp ${formatRupiah(currentProduct.price * qty)},-`;
        checkoutModal.style.display = "block";
    } else {
        addToCart(currentProduct, size, qty);
    }
});

// =======================
// Keranjang Sidebar
// =======================
function updateCartDisplay() {
    cartItemsContainer.innerHTML = "";
    cartCount.textContent = cart.reduce((sum, i) => sum + i.qty, 0);

    if (cart.length === 0) {
        emptyCartMsg.style.display = "block";
        return;
    }

    emptyCartMsg.style.display = "none";

    cart.forEach((item, idx) => {
        const subtotal = item.price * item.qty;
        const el = document.createElement("div");
        el.className = "cart-item";

        el.innerHTML = `
            <input type="checkbox" class="item-checkbox" data-idx="${idx}" ${item.selected ? 'checked' : ''}>
            <img src="${item.image}" class="cart-thumb">
            <div class="detail">
                <b>${item.name}</b>
                <p>Size: ${item.size}</p>
                <p>Subtotal: Rp ${formatRupiah(subtotal)},-</p>
            </div>
            <div class="qty-controls">
                <button class="qty-btn minus" data-idx="${idx}">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn plus" data-idx="${idx}">+</button>
            </div>
            <button class="remove-btn" data-idx="${idx}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItemsContainer.appendChild(el);
    });

    // Update checkout button state
    const selectedCount = cart.filter(item => item.selected).length;
    const checkoutBtn = document.querySelector("#open-checkout-modal-btn");
    if (checkoutBtn) {
        checkoutBtn.disabled = selectedCount === 0;
    }

    // Event checkbox
    document.querySelectorAll(".item-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", e => {
            const idx = e.target.dataset.idx;
            cart[idx].selected = e.target.checked;
            saveCart();
            updateCartDisplay();
            updateCartSummary();
        });
    });

    // Event hapus
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const index = e.target.closest("button").dataset.idx;
            cart.splice(index, 1);
            saveCart();
            updateCartDisplay();
            updateCartSummary();
        });
    });

    // Event qty +/-
    document.querySelectorAll(".plus").forEach(btn => {
        btn.addEventListener("click", e => {
            const i = e.target.dataset.idx;
            cart[i].qty++;
            saveCart();
            updateCartDisplay();
            updateCartSummary();
        });
    });

    document.querySelectorAll(".minus").forEach(btn => {
        btn.addEventListener("click", e => {
            const i = e.target.dataset.idx;
            if (cart[i].qty > 1) {
                cart[i].qty--;
            } else cart.splice(i, 1);
            saveCart();
            updateCartDisplay();
            updateCartSummary();
        });
    });
}

// Sidebar toggle
cartBtn.addEventListener("click", () => {
    cartSidebar.classList.toggle("active");
});

// Update cart summary
function updateCartSummary() {
    const selectedItems = cart.filter(item => item.selected);
    const totalQty = selectedItems.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

    let summaryHTML = '';
    if (selectedItems.length > 0) {
        summaryHTML = `
            <div class="cart-summary">
                <div class="summary-line">
                    <span>Total Item:</span>
                    <span>${totalQty}</span>
                </div>
                <div class="summary-line total-price-line">
                    <span>Total Harga:</span>
                    <span>Rp ${formatRupiah(totalPrice)},-</span>
                </div>
            </div>
        `;
    }

    // Remove existing summary if any
    const existingSummary = cartSidebar.querySelector('.cart-summary');
    if (existingSummary) {
        existingSummary.remove();
    }

    // Add new summary
    cartSidebar.insertAdjacentHTML('beforeend', summaryHTML);
}



// =======================
// Checkout WhatsApp
// =======================
checkoutForm.addEventListener("submit", e => {
    e.preventDefault();
    const nama = document.querySelector("#nama").value;
    const alamat = document.querySelector("#alamat").value;
    const telepon = document.querySelector("#telepon").value;
    const metode = paymentMethodEl.value;

    const selectedItems = cart.filter(item => item.selected);
    if (selectedItems.length === 0) return;

    let pesanProduk = "";
    let totalAkhir = 0;

    selectedItems.forEach((item) => {
        const subtotal = item.qty * item.price;
        totalAkhir += subtotal;
        pesanProduk += `
${item.name}
Ukuran : ${item.size}
Qty : ${item.qty}
Subtotal : Rp ${formatRupiah(subtotal)},-
`;
    });

    const msg = encodeURIComponent(`
*PESANAN FK JERSEY OFICIAL*
Nama: ${nama}
WA: ${telepon}
Alamat: ${alamat}
Metode Pembayaran: ${metode}

*Rincian Produk:*
${pesanProduk}
Total Akhir: Rp ${formatRupiah(totalAkhir)},-
`);

    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");

    // Remove selected items from cart
    cart = cart.filter(item => !item.selected);
    saveCart();
    updateCartDisplay();
    checkoutModal.style.display = "none";
    showNotification("Pesanan dikirim!");
});

// Close modal area
document.querySelector("#close-detail-modal-btn").addEventListener("click", () => detailModal.style.display = "none");
document.querySelector("#close-checkout-modal-btn").addEventListener("click", () => checkoutModal.style.display = "none");
window.addEventListener("click", e => {
    if (e.target === detailModal) detailModal.style.display = "none";
    if (e.target === checkoutModal) checkoutModal.style.display = "none";
    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });

});

// Event for checkout button
document.querySelector("#open-checkout-modal-btn").addEventListener("click", () => {
    const selectedItems = cart.filter(item => item.selected);
    if (selectedItems.length > 0) {
        const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
        modalFinalPrice.textContent = `Rp ${formatRupiah(totalPrice)},-`;
        checkoutModal.style.display = "block";
    }
});

// Load data awal
updateCartDisplay();
updateCartSummary();
