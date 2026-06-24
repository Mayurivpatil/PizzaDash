# PizzaDash 🍕

A premium, full-stack pizza ordering application featuring a highly interactive storefront design inspired by Zomato and a powerful, real-time administrative back-office kitchen display dashboard.

---

## 🚀 Key Features

* **Unified Premium Branding:** A cohesive visual identity shared across both client-facing and internal management tools utilizing responsive text-and-icon logo configurations.
* **Dynamic Menu & Filtering:** Connected directly to the Forkify API to deliver instant category listings (`All`, `Cheesy`, `Veggie`, `Meat Lovers`) and search matching.
* **Persistent Search History:** Saves up to 3 recent user inquiries natively inside browser `localStorage` for rapid recall.
* **Full-Featured Basket Workflow:** Supports a real-time responsive sliding cart sidebar that handles multi-quantity edits, customer delivery form validation, and instant payment settlement handling (Cash or QR Code/UPI simulation).
* **Live Fulfillment Stepper UI:** Animates processing milestones dynamically tracking placement from *Received ➔ Preparing ➔ On Way ➔ Delivered*.
* **Unified Metrics Display Panel:** Admin view parses live records to provide analytical summaries (Total Orders vs. Actively Preparing Counters) alongside administrative override controls.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Custom Variables, Flexbox, Grid), Vanilla JavaScript (ES6+, Fetch API), FontAwesome Library.
* **Backend:** Node.js, Express.js.
* **Database:** MySQL.
