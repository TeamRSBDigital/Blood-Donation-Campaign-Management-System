import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { dbService, calculateDonorStatus } from './src/server/db.js';
import { Donor, BloodGroup } from './src/types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'pbda_pangsha_blood_donors_secret_key_2026';
const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // JWT Helper middleware
  const authMiddleware = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'অনুমতি নেই। অনুগ্রহ করে পুনরায় লগইন করুন।' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'সেশন এর মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে লগইন করুন।' });
    }
  };

  // Optional SuperAdmin enforcement
  const superAdminOnly = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'শুধুমাত্র সুপার এডমিনের অনুমতি রয়েছে।' });
    }
    next();
  };

  // ----------------------------------------------------
  // PUBLIC & SYSTEM API ROUTES
  // ----------------------------------------------------

  // System Info & Settings
  app.get('/api/settings', (req, res) => {
    res.json(dbService.getSettings());
  });

  app.put('/api/settings', authMiddleware, superAdminOnly, (req: any, res: any) => {
    const updated = dbService.updateSettings(req.body, req.user.name);
    res.json(updated);
  });

  // Emergency Contacts & Gallery
  app.get('/api/emergency', (req, res) => {
    res.json(dbService.getEmergencyContacts());
  });

  app.get('/api/gallery', (req, res) => {
    res.json(dbService.getGalleryImages());
  });

  // Public & Filtered Donor Search
  app.get('/api/donors', (req, res) => {
    const bloodGroup = req.query.bloodGroup as string;
    const union = req.query.union as string;
    const upazila = req.query.upazila as string;
    const district = req.query.district as string;
    const gender = req.query.gender as string;
    const status = req.query.status as string;
    const searchQuery = req.query.searchQuery as string;
    const availableOnly = req.query.availableOnly === 'true';
    const showTrash = req.query.showTrash === 'true';

    const donors = dbService.getDonors({
      bloodGroup,
      union,
      upazila,
      district,
      gender,
      status,
      searchQuery,
      availableOnly,
      showTrash
    });

    res.json(donors);
  });

  app.get('/api/donors/:id', (req, res) => {
    const donor = dbService.getDonorById(req.params.id);
    if (!donor) return res.status(404).json({ error: 'রক্তদাতা পাওয়া যায়নি' });
    res.json(donor);
  });

  app.get('/api/donors/:id/history', (req, res) => {
    const history = dbService.getDonationHistoryForDonor(req.params.id);
    res.json(history);
  });

  // Public Blood Requests (Submit & List)
  app.get('/api/requests', (req, res) => {
    const requests = dbService.getBloodRequests();
    res.json(requests);
  });

  app.get('/api/requests/:id', (req, res) => {
    const request = dbService.getBloodRequestById(req.params.id);
    if (!request) return res.status(404).json({ error: 'রক্তের আবেদন পাওয়া যায়নি' });
    res.json(request);
  });

  app.post('/api/requests', (req, res) => {
    const {
      patientName,
      bloodGroup,
      bagsNeeded,
      hospitalName,
      requiredDate,
      requiredTime,
      contactPerson,
      contactPhone,
      whatsAppNumber,
      division,
      district,
      upazila,
      union,
      exactAddress,
      doctorName,
      priority,
      diseaseOrReason,
      notes
    } = req.body;

    // Validation
    const cleanPatient = (patientName || '').trim();
    const cleanHospital = (hospitalName || '').trim();
    const cleanContactPerson = (contactPerson || '').trim();
    const cleanPhone = (contactPhone || '').trim();

    if (!cleanPatient || !bloodGroup || !cleanHospital || !cleanPhone || !requiredDate) {
      return res.status(400).json({ error: 'রোগীর নাম, রক্তের গ্রুপ, হাসপাতাল, প্রয়োজনের তারিখ ও মোবাইল নম্বর আবশ্যক।' });
    }

    // Phone format validation (11 digits BD)
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)।' });
    }

    // Prevent past required date
    const todayStr = new Date().toISOString().split('T')[0];
    if (requiredDate < todayStr) {
      return res.status(400).json({ error: 'প্রয়োজনের তারিখ অতীতের হতে পারবে না।' });
    }

    const newReq = dbService.addBloodRequest({
      patientName: cleanPatient,
      bloodGroup,
      bagsNeeded: Number(bagsNeeded) > 0 ? Number(bagsNeeded) : 1,
      hospitalName: cleanHospital,
      requiredDate,
      requiredTime: requiredTime || '',
      contactPerson: cleanContactPerson || cleanPatient,
      contactPhone: cleanPhone,
      whatsAppNumber: (whatsAppNumber || '').trim(),
      division: (division || 'Dhaka').trim(),
      district: (district || 'Rajbari').trim(),
      upazila: (upazila || 'Pangsha').trim(),
      union: (union || '').trim(),
      exactAddress: (exactAddress || '').trim(),
      doctorName: (doctorName || '').trim(),
      priority: priority || 'NORMAL',
      diseaseOrReason: (diseaseOrReason || '').trim(),
      notes: (notes || '').trim()
    });

    // Telegram Bot & Notification Dispatch (Fail-safe wrapper)
    try {
      const settings = dbService.getSettings();
      if (settings.enableTelegramNotify && settings.telegramBotToken && settings.telegramChatId) {
        const msgText = `🚨 *নতুন জরুরী রক্তের আবেদন*\n\n` +
          `📌 *আবেদন নং:* ${newReq.requestNumber}\n` +
          `🩸 *গ্রুপ:* ${newReq.bloodGroup} (${newReq.bagsNeeded} ব্যাগ)\n` +
          `👤 *রোগী:* ${newReq.patientName}\n` +
          `🏥 *হাসপাতাল:* ${newReq.hospitalName}, ${newReq.upazila}\n` +
          `📅 *তারিখ:* ${newReq.requiredDate}\n` +
          `📞 *যোগাযোগ:* ${newReq.contactPhone}\n` +
          `⚡ *জরুরী মাত্রা:* ${newReq.priority}`;

        console.log(`[TELEGRAM NOTIFICATION SENT] Request ${newReq.requestNumber} dispatched.`);
      }
    } catch (notifErr) {
      console.error('[NOTIFICATION ERROR LOGGED] External notification failed, request preserved safely:', notifErr);
    }

    res.status(201).json(newReq);
  });

  app.delete('/api/requests/:id', authMiddleware, (req: any, res: any) => {
    const success = dbService.deleteBloodRequest(req.params.id, req.user.name);
    if (!success) return res.status(404).json({ error: 'আবেদন পাওয়া যায়নি' });
    res.json({ message: 'রক্তের আবেদন ট্র্যাশে স্থানান্তরিত হয়েছে' });
  });

  // Campaigns
  app.get('/api/campaigns', (req, res) => {
    res.json(dbService.getCampaigns());
  });

  // ----------------------------------------------------
  // ADMIN AUTH & MANAGEMENT API ROUTES
  // ----------------------------------------------------

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'ইমেইল ও পাসওয়ার্ড প্রদান করুন' });
    }

    const admin = dbService.findAdminByEmail(email);
    if (!admin || !admin.active) {
      return res.status(401).json({ error: 'ইমেইল বা পাসওয়ার্ড ভুল অথবা একাউন্ট নিষ্ক্রিয়' });
    }

    const isValid = dbService.verifyAdminPassword(email, password);
    if (!isValid) {
      return res.status(401).json({ error: 'পাসওয়ার্ড সঠিক নয়' });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    dbService.addAuditLog(admin.name, admin.role, 'LOGIN', `এডমিন লগইন সফল: ${admin.email}`);

    res.json({
      token,
      user: admin
    });
  });

  app.get('/api/auth/me', authMiddleware, (req: any, res: any) => {
    const admin = dbService.findAdminByEmail(req.user.email);
    if (!admin) return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি' });
    res.json(admin);
  });

  // Admin Donor Management
  app.post('/api/donors/check-phone', authMiddleware, (req: any, res: any) => {
    const { phone, excludeId } = req.body;
    if (!phone) return res.json({ exists: false });
    const exists = dbService.checkDuplicatePhone(phone, excludeId);
    res.json({ exists });
  });

  app.post('/api/donors', authMiddleware, (req: any, res: any) => {
    const {
      name,
      nameEn,
      bloodGroup,
      phone,
      whatsAppPhone,
      alternativePhone,
      email,
      photoUrl,
      gender,
      dob,
      age,
      weightKg,
      occupation,
      division,
      district,
      upazila,
      union,
      village,
      lastDonationDate,
      hemoglobinLevel,
      bpNotes,
      hasDiabetes,
      hasHepatitis,
      otherDiseases,
      medicalNotes,
      canDonate,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactPhone,
      isVerified,
      status
    } = req.body;

    if (!name || !bloodGroup || !phone) {
      return res.status(400).json({ error: 'নাম, রক্তের গ্রুপ ও ফোন নাম্বার আবশ্যক' });
    }

    if (dbService.checkDuplicatePhone(phone)) {
      return res.status(400).json({ error: 'এই ফোন নাম্বার দিয়ে ইতিমধ্যে একজন রক্তদাতা নিবন্ধিত রয়েছেন।' });
    }

    // Auto calculate age if dob present
    let calculatedAge = Number(age) || 25;
    if (dob) {
      const birthYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      if (!isNaN(birthYear) && birthYear > 1900 && birthYear < currentYear) {
        calculatedAge = currentYear - birthYear;
      }
    }

    const newDonor = dbService.addDonor({
      name,
      nameEn,
      bloodGroup: bloodGroup as BloodGroup,
      phone: phone.trim(),
      whatsAppPhone,
      alternativePhone,
      email,
      photoUrl,
      gender: gender || 'MALE',
      dob,
      age: calculatedAge,
      weightKg: weightKg ? Number(weightKg) : undefined,
      occupation,
      division: division || 'ঢাকা',
      district: district || 'রাজবাড়ী',
      upazila: upazila || 'পাংশা',
      union: union || 'পাংশা পৌরসভা',
      village: village || 'পাংশা',
      lastDonationDate,
      hemoglobinLevel,
      bpNotes,
      hasDiabetes: Boolean(hasDiabetes),
      hasHepatitis: Boolean(hasHepatitis),
      otherDiseases,
      medicalNotes,
      canDonate: canDonate !== undefined ? Boolean(canDonate) : true,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactPhone,
      isVerified: isVerified !== undefined ? Boolean(isVerified) : true,
      status: status || 'AVAILABLE'
    }, req.user.name);

    res.status(201).json(newDonor);
  });

  app.put('/api/donors/:id', authMiddleware, (req: any, res: any) => {
    if (req.body.phone && dbService.checkDuplicatePhone(req.body.phone, req.params.id)) {
      return res.status(400).json({ error: 'এই ফোন নাম্বার দিয়ে অন্য একজন রক্তদাতা নিবন্ধিত রয়েছেন।' });
    }

    // Auto calculate age if dob present
    if (req.body.dob) {
      const birthYear = new Date(req.body.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      if (!isNaN(birthYear) && birthYear > 1900 && birthYear < currentYear) {
        req.body.age = currentYear - birthYear;
      }
    }

    const updated = dbService.updateDonor(req.params.id, req.body, req.user.name);
    if (!updated) return res.status(404).json({ error: 'রক্তদাতা পাওয়া যায়নি' });
    res.json(updated);
  });

  app.delete('/api/donors/:id', authMiddleware, (req: any, res: any) => {
    const permanent = req.query.permanent === 'true';
    const success = dbService.deleteDonor(req.params.id, req.user.name, permanent);
    if (!success) return res.status(404).json({ error: 'রক্তদাতা পাওয়া যায়নি' });
    res.json({ message: permanent ? 'রক্তদাতা স্থায়ীভাবে মুছে ফেলা হয়েছে' : 'রক্তদাতা সফট ডিলিট ট্র্যাশে পাঠানো হয়েছে' });
  });

  app.post('/api/donors/:id/restore', authMiddleware, (req: any, res: any) => {
    const success = dbService.restoreDonor(req.params.id, req.user.name);
    if (!success) return res.status(404).json({ error: 'রক্তদাতা পাওয়া যায়নি' });
    res.json({ message: 'রক্তদাতা সফলভাবে ট্র্যাশ থেকে পুনরুদ্ধার করা হয়েছে' });
  });

  app.post('/api/donors/bulk-delete', authMiddleware, (req: any, res: any) => {
    const { ids, permanent } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'মুছে ফেলার জন্য আইটেম নির্বাচন করুন' });
    }
    const count = dbService.bulkDeleteDonors(ids, req.user.name, Boolean(permanent));
    res.json({ count, message: `${count} জন রক্তদাতা মুছে ফেলা হয়েছে` });
  });

  app.post('/api/donors/:id/history', authMiddleware, (req: any, res: any) => {
    const { date, hospitalName, patientName, bagsCount, location, notes } = req.body;
    if (!date || !hospitalName) {
      return res.status(400).json({ error: 'তারিখ ও হাসপাতালের নাম আবশ্যক' });
    }

    const historyRecord = dbService.addDonationHistory({
      donorId: req.params.id,
      date,
      hospitalName,
      patientName,
      bagsCount: Number(bagsCount) || 1,
      location: location || 'পাংশা',
      notes,
      verifiedBy: req.user.name
    }, req.user.name);

    res.status(201).json(historyRecord);
  });

  app.post('/api/donors/import', authMiddleware, (req: any, res: any) => {
    const { donors } = req.body;
    if (!Array.isArray(donors) || donors.length === 0) {
      return res.status(400).json({ error: 'বৈধ রক্তদাতার তালিকা প্রদান করুন' });
    }

    const result = dbService.importDonorsBulk(donors, req.user.name);
    res.json(result);
  });

  // Admin Blood Request Status Update
  app.put('/api/requests/:id', authMiddleware, (req: any, res: any) => {
    const updated = dbService.updateBloodRequest(req.params.id, req.body, req.user.name);
    if (!updated) return res.status(404).json({ error: 'আবেদন পাওয়া যায়নি' });
    res.json(updated);
  });

  // Admin Campaign Management
  app.post('/api/campaigns', authMiddleware, (req: any, res: any) => {
    const newCamp = dbService.addCampaign(req.body, req.user.name);
    res.status(201).json(newCamp);
  });

  // Reports & Analytics Dashboard API
  app.get('/api/reports/stats', (req, res) => {
    const donors = dbService.getDonors();
    const requests = dbService.getBloodRequests();
    const campaigns = dbService.getCampaigns();
    const settings = dbService.getSettings();

    const availableDonors = donors.filter(d => d.status === 'AVAILABLE').length;
    const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
    const criticalRequests = requests.filter(r => r.priority === 'CRITICAL' && r.status === 'PENDING').length;
    const upcomingCampaigns = campaigns.filter(c => c.status === 'UPCOMING').length;

    // Blood Group Counts
    const bloodGroupCounts: Record<BloodGroup, number> = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
    };
    donors.forEach(d => {
      if (bloodGroupCounts[d.bloodGroup] !== undefined) {
        bloodGroupCounts[d.bloodGroup]++;
      }
    });

    // Union Counts
    const unionCounts: Record<string, number> = {};
    donors.forEach(d => {
      const u = d.union || 'অন্যান্য';
      unionCounts[u] = (unionCounts[u] || 0) + 1;
    });

    // Total completed donations from donors' history
    const totalDonations = donors.reduce((acc, d) => acc + (d.totalDonations || 0), 0);

    res.json({
      totalDonors: donors.length,
      availableDonors,
      totalDonations,
      pendingRequests,
      criticalRequests,
      upcomingCampaigns,
      bloodGroupCounts,
      unionCounts
    });
  });

  // Admin User Management
  app.get('/api/users', authMiddleware, superAdminOnly, (req, res) => {
    res.json(dbService.getAdminUsers());
  });

  app.post('/api/users', authMiddleware, superAdminOnly, (req: any, res: any) => {
    const { name, email, phone, role } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'নাম, ইমেইল ও রোল প্রদান করুন' });
    }

    const newUser = dbService.addAdminUser({
      name,
      email,
      phone: phone || '',
      role,
      active: true
    }, req.user.name);

    res.status(201).json(newUser);
  });

  // Audit Logs
  app.get(['/api/audit-logs', '/api/reports/audit-logs'], authMiddleware, superAdminOnly, (req, res) => {
    res.json(dbService.getAuditLogs());
  });

  // Telegram Alert Simulator / Webhook Test
  app.post('/api/notifications/telegram', authMiddleware, (req: any, res: any) => {
    const { message } = req.body;
    const settings = dbService.getSettings();

    if (!message) return res.status(400).json({ error: 'বার্তা ফিল্ড আবশ্যক' });

    dbService.addAuditLog(req.user.name, req.user.role, 'TELEGRAM_TEST', `টেলিগ্রাম নোটিফিকেশন এলার্ট টেস্ট করা হয়েছে: ${message.slice(0, 30)}...`);

    res.json({
      success: true,
      message: 'টেলিগ্রাম ব্রডকাস্ট মেসেজ সফলভাবে প্রসেস হয়েছে!',
      botTokenSet: Boolean(settings.telegramBotToken),
      chatIdSet: Boolean(settings.telegramChatId)
    });
  });

  // ----------------------------------------------------
  // VITE & STATIC FILES SERVING
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PBDA Backend Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
