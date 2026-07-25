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
    const searchQuery = req.query.searchQuery as string;
    const availableOnly = req.query.availableOnly === 'true';

    const donors = dbService.getDonors({
      bloodGroup,
      union,
      upazila,
      searchQuery,
      availableOnly
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

  app.post('/api/requests', (req, res) => {
    const { patientName, bloodGroup, bagsNeeded, hospitalName, upazila, union, requiredDate, contactPerson, contactPhone, priority, diseaseOrReason, notes } = req.body;

    if (!patientName || !bloodGroup || !contactPhone || !hospitalName) {
      return res.status(400).json({ error: 'জরুরী সকল ফিল্ড সঠিকভাবে পূরণ করুন' });
    }

    const newReq = dbService.addBloodRequest({
      patientName,
      bloodGroup,
      bagsNeeded: Number(bagsNeeded) || 1,
      hospitalName,
      upazila: upazila || 'পাংশা',
      union: union || 'পাংশা পৌরসভা',
      requiredDate: requiredDate || new Date().toISOString().split('T')[0],
      contactPerson: contactPerson || patientName,
      contactPhone,
      priority: priority || 'NORMAL',
      diseaseOrReason: diseaseOrReason || 'জরুরী রক্ত দান',
      notes
    });

    // Optionally trigger Telegram notify if critical
    if (newReq.priority === 'CRITICAL' && dbService.getSettings().enableTelegramNotify) {
      console.log(`[TELEGRAM NOTIFY] Critical request created for ${patientName} (${bloodGroup}) at ${hospitalName}`);
    }

    res.status(201).json(newReq);
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
  app.post('/api/donors', authMiddleware, (req: any, res: any) => {
    const { name, nameEn, bloodGroup, phone, alternativePhone, gender, age, weightKg, district, upazila, union, village, lastDonationDate, hemoglobinLevel, bpNotes, medicalNotes, isVerified } = req.body;

    if (!name || !bloodGroup || !phone) {
      return res.status(400).json({ error: 'নাম, রক্তের গ্রুপ ও ফোন নাম্বার আবশ্যক' });
    }

    const newDonor = dbService.addDonor({
      name,
      nameEn,
      bloodGroup: bloodGroup as BloodGroup,
      phone,
      alternativePhone,
      gender: gender || 'MALE',
      age: Number(age) || 25,
      weightKg: weightKg ? Number(weightKg) : undefined,
      district: district || 'Rajbari',
      upazila: upazila || 'পাংশা',
      union: union || 'পাংশা পৌরসভা',
      village: village || 'পাংশা',
      lastDonationDate,
      hemoglobinLevel,
      bpNotes,
      medicalNotes,
      isVerified: isVerified !== undefined ? Boolean(isVerified) : true
    }, req.user.name);

    res.status(201).json(newDonor);
  });

  app.put('/api/donors/:id', authMiddleware, (req: any, res: any) => {
    const updated = dbService.updateDonor(req.params.id, req.body, req.user.name);
    if (!updated) return res.status(404).json({ error: 'রক্তদাতা পাওয়া যায়নি' });
    res.json(updated);
  });

  app.delete('/api/donors/:id', authMiddleware, (req: any, res: any) => {
    const success = dbService.deleteDonor(req.params.id, req.user.name);
    if (!success) return res.status(404).json({ error: 'রক্তদাতা পাওয়া যায়নি' });
    res.json({ message: 'রক্তদাতার ডাটা সফলভাবে মুছে ফেলা হয়েছে' });
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
