# 💬 WhatsApp Service Integration Guide - PBDA System

The PBDA Management System supports dual WhatsApp integration modes:
1. **Internal Web QR Code Gateway**: Embedded Node.js Web session.
2. **External HTTP Gateway**: API integration with cloud-hosted WhatsApp providers.

---

## 📱 Mode A: Internal Web QR Code Gateway

### Advantages
- Free to run without per-message API costs.
- Directly uses the official PBDA WhatsApp phone number.

### Configuration
1. Log in as Super Admin and navigate to **"হোয়াটসঅ্যাপ সার্ভিস"** -> **"QR কোড স্ক্যান"**.
2. Click **"নতুন সেশন তৈরি করুন"** (Start New Session).
3. Open WhatsApp on the official PBDA mobile device.
4. Go to **Settings -> Linked Devices -> Link a Device**.
5. Scan the QR code displayed on the PBDA Admin screen.
6. Once connected, status will display `CONNECTED (সংযুক্ত)`.

---

## 🌐 Mode B: External HTTP API Gateway

### Advantages
- High message throughput for large campaign broadcasts.
- Enterprise availability without dependence on a paired mobile phone.

### Configuration
1. Obtain API URL and Secret Key from your preferred WhatsApp Cloud API provider.
2. Set environment variables:
   ```env
   WHATSAPP_API_URL=https://api.whatsapp-provider.com/v1/send
   WHATSAPP_API_KEY=your_secret_whatsapp_api_key
   ```
3. Test connectivity in **"কমিউনিকেশন সেটিংস"**.

---

## 📄 Automated Message Templates

### Emergency Donor Outreach Template
```
🩸 পাংশা ব্ল্যাড ডোনার্স অ্যাসোসিয়েশন (PBDA) 🩸
জরুরী রক্ত সাহায্য প্রয়োজন!

রক্তের গ্রুপ: {BLOOD_GROUP}
রোগীর নাম: {PATIENT_NAME}
হাসপাতাল: {HOSPITAL_NAME}
ব্যাগ সংখ্যা: {BAGS_REQUIRED}
যোগাযোগ: {CONTACT_PHONE}

আপনি কি রক্তদান করতে প্রস্তুত? অনুগ্রহ করে দ্রুত যোগাযোগ করুন।
```
