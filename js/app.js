document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('product-grid');
    
    if (!grid) return;

    // SVG icon for WhatsApp
    const whatsappIcon = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

    // Generate product cards
    siteConfig.products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Construct pre-filled WhatsApp message
        const message = encodeURIComponent(`Hi, I'm interested in ordering the ${product.name} blinds from your website.`);
        const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${message}`;

        card.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">
                    ${whatsappIcon}
                    Order via WhatsApp
                </a>
            </div>
        `;
        
        grid.appendChild(card);
    });

    // --- Quote Generator Logic ---
    const btnOpenQuote = document.getElementById('btn-open-quote');
    const quoteModal = document.getElementById('quote-modal');
    const closeBtn = document.querySelector('.close-modal');
    const quoteForm = document.getElementById('quote-form');
    const windowsContainer = document.getElementById('windows-container');
    const btnAddWindow = document.getElementById('btn-add-window');
    
    const formContainer = document.getElementById('quote-form-container');
    const resultContainer = document.getElementById('quote-result-container');
    const btnDownloadPdf = document.getElementById('btn-download-pdf');
    const btnResetQuote = document.getElementById('btn-reset-quote');

    // Helper to get product options HTML
    const getProductOptionsHtml = () => {
        return siteConfig.products.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    };

    // Helper to add a new window row
    const addWindowRow = (isFirst = false) => {
        const row = document.createElement('div');
        row.className = 'window-entry';
        
        row.innerHTML = `
            ${!isFirst ? '<button type="button" class="btn-remove-window">Remove</button>' : ''}
            <div class="form-group">
                <label>Room / Label (e.g. Master Bedroom)</label>
                <input type="text" class="q-label" required placeholder="Room Name">
            </div>
            <div class="form-group">
                <label>Select Product</label>
                <select class="q-product" required>
                    ${getProductOptionsHtml()}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Width</label>
                    <input type="number" class="q-width" step="0.1" min="1" required placeholder="e.g. 60">
                </div>
                <div class="form-group">
                    <label>Height</label>
                    <input type="number" class="q-height" step="0.1" min="1" required placeholder="e.g. 60">
                </div>
            </div>
        `;

        if (!isFirst) {
            row.querySelector('.btn-remove-window').addEventListener('click', () => {
                row.remove();
            });
        }
        
        windowsContainer.appendChild(row);
    };

    // Initialize first row if container exists
    if (windowsContainer) {
        addWindowRow(true); // First row cannot be removed
    }

    if (btnAddWindow) {
        btnAddWindow.addEventListener('click', () => {
            addWindowRow(false);
        });
    }

    // Modal Toggles
    if (btnOpenQuote) {
        btnOpenQuote.addEventListener('click', (e) => {
            e.preventDefault();
            quoteModal.classList.add('show');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            quoteModal.classList.remove('show');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === quoteModal) {
            quoteModal.classList.remove('show');
        }
    });

    // Handle Form Submission
    if (quoteForm) {
        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = quoteForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = "Calculating & Sending...";
            submitBtn.disabled = true;

            // Gather global inputs
            const name = document.getElementById('q-name').value;
            const email = document.getElementById('q-email').value;
            const phone = document.getElementById('q-phone').value;
            const unit = document.getElementById('q-unit').value;

            const itemsBody = document.getElementById('out-items-body');
            itemsBody.innerHTML = ''; // Clear previous

            let totalAreaSqft = 0;
            let emailBreakdownText = "Itemized Breakdown:\n";

            // Loop over all window entries
            const entries = document.querySelectorAll('.window-entry');
            entries.forEach((entry, index) => {
                const label = entry.querySelector('.q-label').value;
                const product = entry.querySelector('.q-product').value;
                const width = parseFloat(entry.querySelector('.q-width').value);
                const height = parseFloat(entry.querySelector('.q-height').value);

                // Calculate Area in sqft for this item
                let itemAreaSqft = 0;
                if (unit === 'inches') {
                    itemAreaSqft = (width * height) / 144;
                } else if (unit === 'cm') {
                    itemAreaSqft = (width * height) / 929.03;
                }

                totalAreaSqft += itemAreaSqft;

                // Add to email text
                emailBreakdownText += `${index + 1}. ${label} - ${product} (${width}x${height} ${unit}) = ${itemAreaSqft.toFixed(2)} sqft\n`;

                // Add row to table
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${label}</td>
                    <td>${product}</td>
                    <td>${width} x ${height} ${unit}</td>
                    <td>${itemAreaSqft.toFixed(2)}</td>
                `;
                itemsBody.appendChild(tr);
            });

            // Minimum Order Validation
            const errorDiv = document.getElementById('quote-error');
            if (totalAreaSqft < 100) {
                if (errorDiv) {
                    errorDiv.textContent = `Your total area is ${totalAreaSqft.toFixed(2)} sqft. We require a minimum order of 100 sqft to process a quote.`;
                    errorDiv.classList.remove('hidden');
                }
                
                // Restore button and stop execution
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                return; 
            } else {
                if (errorDiv) errorDiv.classList.add('hidden');
            }

            // Calculate Total Price (6 GBP per sqft)
            const pricePerSqft = 6.00;
            const totalPrice = totalAreaSqft * pricePerSqft;

            // Populate Result UI
            const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            document.getElementById('out-date').textContent = today;
            document.getElementById('out-name').textContent = name;
            document.getElementById('out-email').textContent = email;
            document.getElementById('out-phone').textContent = phone;
            document.getElementById('out-total-area').textContent = totalAreaSqft.toFixed(2);
            document.getElementById('out-price').textContent = totalPrice.toFixed(2);

            // --- Send Email via Web3Forms ---
            if (siteConfig.web3formsAccessKey && siteConfig.web3formsAccessKey !== "YOUR_WEB3FORMS_ACCESS_KEY_HERE") {
                const formData = new FormData();
                formData.append("access_key", siteConfig.web3formsAccessKey);
                formData.append("subject", `New Quote Request from ${name}`);
                formData.append("from_name", "Zebra Blinds Website");
                formData.append("name", name);
                formData.append("email", email);
                formData.append("phone", phone);
                formData.append("message", `
A new quote has been generated on the website!

Customer Details:
Name: ${name}
Email: ${email}
Phone: ${phone}

Quote Details:
Total Area: ${totalAreaSqft.toFixed(2)} sqft
Total Estimated Price: £${totalPrice.toFixed(2)}

${emailBreakdownText}
                `);

                try {
                    await fetch("https://api.web3forms.com/submit", {
                        method: "POST",
                        body: formData
                    });
                    console.log("Email notification sent successfully.");
                } catch (error) {
                    console.error("Failed to send email notification:", error);
                }
            } else {
                console.warn("Web3Forms Access Key is not configured. Email notification skipped.");
            }

            // Restore button and switch views
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            
            formContainer.classList.add('hidden');
            resultContainer.classList.remove('hidden');
        });
    }

    // Reset Quote Form
    if (btnResetQuote) {
        btnResetQuote.addEventListener('click', () => {
            quoteForm.reset();
            
            // Reset windows container to 1 row
            windowsContainer.innerHTML = '';
            addWindowRow(true);

            resultContainer.classList.add('hidden');
            formContainer.classList.remove('hidden');
        });
    }

    // Generate PDF using html2pdf
    if (btnDownloadPdf) {
        btnDownloadPdf.addEventListener('click', () => {
            const element = document.getElementById('offer-document');
            const opt = {
                margin:       0.5,
                filename:     'Zebra_Blinds_Offer.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            // New Promise-based usage:
            html2pdf().set(opt).from(element).save();
        });
    }
});
