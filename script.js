// APLIKASI JAVASCRIPT UNTUK FK JERSEY OFICIAL

// **PENTING: GANTI NOMOR WHATSAPP INI DENGAN NOMOR ANDA YANG BENAR**
const whatsappNumber = "62895611492509"; // Ganti dengan nomor Anda, misal: 6281212345678

// Data Keranjang Belanja (Global State)
let cart = [];
let currentProduct = null; // Menyimpan data produk saat modal detail dibuka

// =======================================================
// 1. Fungsionalitas Umum & Menu Mobile
// =======================================================
let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.navbar');

// Elemen Keranjang dan Sidebar
const cartBtn = document.querySelector('#cart-btn');
const cartSidebar = document.querySelector('#cart-sidebar');
const closeCartBtn = document.querySelector('#close-cart-btn');
const cartCountSpan = document.querySelector('#cart-count');
const cartItemsContainer = document.querySelector('.cart-items-container');
const emptyCartMessage = document.querySelector('#empty-cart-message');
const summaryTotalQty = document.querySelector('#summary-total-qty');
const summaryTotalPrice = document.querySelector('#summary-total-price');
const cartSummaryDiv = document.querySelector('#cart-summary');
const checkoutBtn = document.querySelector('#open-checkout-modal-btn');

// Elemen Modal Detail Item
const detailModal = document.querySelector('#product-detail-modal');
const closeDetailModalBtn = document.querySelector('#close-detail-modal-btn');
const detailModalForm = document.querySelector('#add-to-cart-form');
const modalProductName = document.querySelector('#modal-product-name');
const modalProductImage = document.querySelector('#modal-product-image');
const modalProductPrice = document.querySelector('#modal-product-price');
const modalSubtotalPrice = document.querySelector('#modal-subtotal-price');
const sizeSelect = document.querySelector('#size');
const quantityInput = document.querySelector('#quantity');

// Elemen Modal Checkout
const checkoutModal = document.querySelector('#checkout-modal');
const closeCheckoutModalBtn = document.querySelector('#close-checkout-modal-btn');
const checkoutForm = document.querySelector('#checkout-form');
const modalFinalPrice = document.querySelector('#modal-final-price');

// Elemen Notifikasi
const notificationArea = document.querySelector('#notification-area');


// Menu Mobile Toggle
menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');

    // Pastikan sidebar cart tertutup saat menu mobile dibuka
    if (cartSidebar && cartSidebar.classList.contains('active')) {
        cartSidebar.classList.remove('active');
    }
};

window.onscroll = () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
};

// =======================================================
// 2. Fungsi Pembantu Format Rupiah
// =======================================================
function formatRupiah(angka) {
    var numberString = String(angka);
    var remainder = numberString.length % 3;
    var rupiah = numberString.substr(0, remainder);
    var thousands = numberString.substr(remainder).match(/\d{3}/g);

    if (thousands) {
        var separator = remainder ? '.' : '';
        rupiah += separator + thousands.join('.');
    }

    return rupiah;
}

// =======================================================
// 3. Fungsionalitas Notifikasi
// =======================================================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

    // Tambahkan ke area notifikasi
    notificationArea.appendChild(notification);

    // Tampilkan dengan delay kecil untuk efek CSS transition
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Hilangkan setelah 4 detik
    setTimeout(() => {
        notification.classList.remove('show');
        // Hapus elemen setelah transisi selesai (0.5s)
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 4000);
}

// =======================================================
// 4. Fungsionalitas Keranjang (Cart)
// =======================================================

// Fungsi untuk menyimpan dan memuat keranjang dari localStorage (untuk persistensi)
function saveCart() {
    // NOTE: Sebaiknya gunakan Firebase/Backend untuk aplikasi produksi
    localStorage.setItem('fk_jersey_cart', JSON.stringify(cart));
}

function loadCart() {
    const storedCart = localStorage.getItem('fk_jersey_cart');
    if (storedCart) {
        try {
            cart = JSON.parse(storedCart);
        } catch (e) {
            console.error("Gagal memuat keranjang dari localStorage:", e);
            cart = [];
        }
    }
    updateCartDisplay();
}

function updateCartDisplay() {
    // 1. Update jumlah total di header
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountSpan.textContent = totalItems;

    // 2. Render item di sidebar
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartSummaryDiv.style.display = 'none';
        checkoutBtn.disabled = true;
    } else {
        emptyCartMessage.style.display = 'none';
        cartSummaryDiv.style.display = 'block';
        checkoutBtn.disabled = false;

        let totalFinalPrice = 0;

        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';

            const subtotal = item.price * item.qty;
            totalFinalPrice += subtotal;

            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Ukuran: ${item.size}</p>
                    <p class="cart-item-price">Rp ${formatRupiah(subtotal)},-</p>
                </div>
                <div class="cart-item-actions">
                    <input type="number" min="1" value="${item.qty}" data-index="${index}" class="item-qty-input">
                    <div class="remove-btn" data-index="${index}"><i class="fas fa-trash"></i></div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        // 3. Update ringkasan total
        summaryTotalQty.textContent = totalItems;
        summaryTotalPrice.textContent = `Rp ${formatRupiah(totalFinalPrice)},-`;
    }

    // 4. Setelah merender, tambahkan listener untuk update kuantitas dan hapus item
    document.querySelectorAll('.item-qty-input').forEach(input => {
        input.addEventListener('change', updateItemQuantity);
    });
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', removeItem);
    });

    saveCart();
}

function updateItemQuantity(event) {
    const index = parseInt(event.target.getAttribute('data-index'));
    const newQty = parseInt(event.target.value);

    if (newQty >= 1) {
        cart[index].qty = newQty;
        updateCartDisplay();
    } else {
        // Jika input kurang dari 1, kembalikan ke nilai sebelumnya atau 1
        event.target.value = cart[index].qty;
    }
}

function removeItem(event) {
    const index = parseInt(event.currentTarget.getAttribute('data-index'));
    const removedItemName = cart[index].name;

    cart.splice(index, 1);
    showNotification(`🗑️ ${removedItemName} dihapus dari keranjang.`);
    updateCartDisplay();
}


// Fungsi untuk menambahkan item ke keranjang
function addToCart(product, size, qty) {
    // Cek apakah item (dengan ukuran yang sama) sudah ada
    const existingItemIndex = cart.findIndex(item => item.id === product.id && item.size === size);

    if (existingItemIndex > -1) {
        // Jika sudah ada, tambahkan kuantitasnya
        cart[existingItemIndex].qty += qty;
        showNotification(`👍 Jumlah ${product.name} (Size ${size}) diperbarui.`);
    } else {
        // Jika belum ada, tambahkan item baru
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            size: size,
            qty: qty
        });
        showNotification(`🛒 ${product.name} (Size ${size}) berhasil ditambahkan!`);
    }

    updateCartDisplay();
}

// =======================================================
// 5. Event Listeners
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // Muat keranjang saat halaman dimuat
    loadCart();

    // Listener Tombol "Tambahkan ke Keranjang" (Membuka Modal Detail Item)
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.getAttribute('data-product-id');
            const productElement = document.querySelector(`.box[data-id="${productId}"]`);

            // Ambil data produk dari elemen HTML
            currentProduct = {
                id: productId,
                name: productElement.getAttribute('data-name'),
                price: parseInt(productElement.getAttribute('data-price')),
                image: productElement.getAttribute('data-image')
            };

            // Isi data di modal detail item
            modalProductName.textContent = `Pesan: ${currentProduct.name}`;
            modalProductImage.src = currentProduct.image || 'https://placehold.co/100x100/34495e/ecf0f1?text=Jersey';
            modalProductPrice.textContent = `Rp ${formatRupiah(currentProduct.price)},-`;
            sizeSelect.value = ""; // Reset pilihan ukuran
            quantityInput.value = 1; // Reset jumlah

            // Hitung subtotal awal
            modalSubtotalPrice.textContent = `Rp ${formatRupiah(currentProduct.price * 1)},-`;

            detailModal.style.display = 'block';

            // Pastikan input kuantitas dan pilihan ukuran memicu update subtotal
            function updateSubtotal() {
                const qty = parseInt(quantityInput.value) || 0;
                const subtotal = currentProduct.price * qty;
                modalSubtotalPrice.textContent = `Rp ${formatRupiah(subtotal)},-`;
            }

            quantityInput.oninput = updateSubtotal;
            sizeSelect.onchange = updateSubtotal; // Biar subtotal update walau tidak perlu
        });
    });

    // Listener Form Tambahkan ke Keranjang (Menambahkan Item)
    detailModalForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const size = sizeSelect.value;
        const quantity = parseInt(quantityInput.value);

        if (!currentProduct || !size || quantity < 1) {
            alert("Mohon lengkapi Ukuran dan Jumlah yang benar.");
            return;
        }

        addToCart(currentProduct, size, quantity);

        // Tutup modal detail
        detailModal.style.display = 'none';
    });


    // Listener Tombol Buka Keranjang
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.toggle('active');
        // Pastikan menu mobile tertutup
        menu.classList.remove('fa-times');
        navbar.classList.remove('active');
    });

    // Listener Tombol Tutup Sidebar Keranjang
    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });

    // Listener Tombol Tutup Modal Detail Item
    closeDetailModalBtn.addEventListener('click', () => {
        detailModal.style.display = 'none';
    });

    // Listener Tombol Buka Modal Checkout dari Sidebar
    checkoutBtn.addEventListener('click', () => {
        const totalFinalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

        if (cart.length === 0) {
            showNotification('Keranjang kosong! Tidak bisa checkout.');
            return;
        }

        // Tampilkan total harga di modal checkout
        modalFinalPrice.textContent = `Rp ${formatRupiah(totalFinalPrice)},-`;

        // Tutup sidebar keranjang
        cartSidebar.classList.remove('active');

        // Tampilkan modal checkout
        checkoutModal.style.display = 'block';
    });

    // Listener Tombol Tutup Modal Checkout
    closeCheckoutModalBtn.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });

    // Listener Form Checkout (Kirim Pesanan via WhatsApp)
    checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nama = document.querySelector('#nama').value;
        const alamat = document.querySelector('#alamat').value;
        const telepon = document.querySelector('#telepon').value;
        let totalFinalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

        if (!nama || !alamat || !telepon || cart.length === 0) {
            // Ini tidak akan terjadi karena form sudah required dan tombol checkout sudah di-disable jika cart kosong, 
            // tapi tetap sebagai safeguard
            return;
        }

        // Susun item pesanan
        let orderDetails = '';
        cart.forEach((item, index) => {
            const subtotal = item.price * item.qty;
            orderDetails += `${index + 1}. ${item.name} | Size: ${item.size} | Qty: ${item.qty} | Subtotal: Rp ${formatRupiah(subtotal)},- %0A`;
        });

        let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

        // Format pesan WhatsApp Final
        // Menggunakan encodeURIComponent untuk memastikan semua karakter dikodekan dengan benar
        const message = `*KONFIRMASI PESANAN (FK Jersey Oficial)*%0A%0A` +
            `============================%0A` +
            `*DATA PEMESAN:*%0A` +
            `Nama: ${nama}%0A` +
            `No. WA: ${telepon}%0A` +
            `Alamat: ${alamat}%0A` +
            `============================%0A` +
            `*DETAIL PESANAN (${totalQty} Item):*%0A` +
            `${orderDetails}` +
            `============================%0A` +
            `*TOTAL HARGA:* Rp ${formatRupiah(totalFinalPrice)},-%0A%0A` +
            `Mohon diproses, terima kasih.`;

        // Buat link WhatsApp
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

        // Buka di tab baru
        window.open(whatsappLink, '_blank');

        // Reset form/cart setelah pengiriman berhasil
        checkoutModal.style.display = 'none';
        checkoutForm.reset();
        cart = [];
        saveCart(); // Simpan keranjang kosong
        updateCartDisplay(); // Perbarui tampilan
        showNotification('🎉 Pesanan terkirim! Silakan cek WhatsApp Anda.');
    });


    // Tutup modal jika user mengklik di luar modal
    window.addEventListener('click', (event) => {
        if (event.target === detailModal) {
            detailModal.style.display = 'none';
        }
        if (event.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
        // Jangan tutup sidebar keranjang saat klik di luar (biarkan tombol close saja)
    });
});