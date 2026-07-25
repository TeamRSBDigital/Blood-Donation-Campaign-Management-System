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

  // Reports & Analytics Dashboard API (Strict RBAC Protection for ADMIN and SUPER_ADMIN)
  app.get(['/api/reports/analytics', '/api/reports/stats'], authMiddleware, (req: any, res: any) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'এই রিপোর্ট ও এনালিটিক্স সুবিধা কেবল এডমিনদের জন্য সীমাবদ্ধ।' });
    }

    // Parse filters from query string
    const { startDate, endDate, bloodGroup, district, upazila, availability, requestStatus } = req.query;

    // Fetch base records
    let donors = dbService.getDonors();
    let requests = dbService.getBloodRequests();
    const histories = dbService.getAllDonationHistories();
    const adminUsers = dbService.getAdminUsers();
    const auditLogs = dbService.getAuditLogs();

    // Apply filters if provided
    if (bloodGroup && bloodGroup !== 'ALL') {
      donors = donors.filter(d => d.bloodGroup === bloodGroup);
      requests = requests.filter(r => r.bloodGroup === bloodGroup);
    }
    if (district && district !== 'ALL') {
      donors = donors.filter(d => d.district?.toLowerCase() === (district as string).toLowerCase());
      requests = requests.filter(r => r.district?.toLowerCase() === (district as string).toLowerCase());
    }
    if (upazila && upazila !== 'ALL') {
      donors = donors.filter(d => d.upazila?.toLowerCase() === (upazila as string).toLowerCase());
      requests = requests.filter(r => r.upazila?.toLowerCase() === (upazila as string).toLowerCase());
    }
    if (availability && availability !== 'ALL') {
      donors = donors.filter(d => d.status === availability);
    }
    if (requestStatus && requestStatus !== 'ALL') {
      requests = requests.filter(r => r.status === requestStatus);
    }
    if (startDate) {
      donors = donors.filter(d => d.createdAt >= (startDate as string));
      requests = requests.filter(r => r.requiredDate >= (startDate as string) || r.createdAt >= (startDate as string));
    }
    if (endDate) {
      donors = donors.filter(d => d.createdAt <= (endDate as string) + 'T23:59:59');
      requests = requests.filter(r => r.requiredDate <= (endDate as string));
    }

    // Overview Stats
    const totalDonors = donors.length;
    const availableDonors = donors.filter(d => d.status === 'AVAILABLE').length;
    const unavailableDonors = totalDonors - availableDonors;

    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'COMPLETED' || r.status === 'FULFILLED').length;
    const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
    const searchingRequests = requests.filter(r => r.status === 'SEARCHING').length;
    const matchedRequests = requests.filter(r => r.status === 'MATCHED').length;
    const cancelledRequests = requests.filter(r => r.status === 'CANCELLED').length;

    const totalVolunteers = adminUsers.length;

    // Blood Group Detailed Breakdown (All 8 Groups)
    const bloodGroupsList: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const bloodGroupReport = bloodGroupsList.map(bg => {
      const bgDonors = donors.filter(d => d.bloodGroup === bg);
      const bgTotal = bgDonors.length;
      const bgAvailable = bgDonors.filter(d => d.status === 'AVAILABLE').length;
      const bgUnavailable = bgTotal - bgAvailable;
      const percentage = totalDonors > 0 ? Number(((bgTotal / totalDonors) * 100).toFixed(1)) : 0;
      return {
        bloodGroup: bg,
        totalDonors: bgTotal,
        available: bgAvailable,
        unavailable: bgUnavailable,
        percentage
      };
    });

    // Location Breakdown (Division, District, Upazila, Union)
    const locationMap: Record<string, { division: string; district: string; upazila: string; union: string; donorCount: number; availableCount: number }> = {};
    donors.forEach(d => {
      const div = d.division || 'ঢাকা';
      const dist = d.district || 'রাজবাড়ী';
      const upa = d.upazila || 'পাংশা';
      const uni = d.union || 'পাংশা পৌরসভা';
      const key = `${div}_${dist}_${upa}_${uni}`;

      if (!locationMap[key]) {
        locationMap[key] = {
          division: div,
          district: dist,
          upazila: upa,
          union: uni,
          donorCount: 0,
          availableCount: 0
        };
      }
      locationMap[key].donorCount++;
      if (d.status === 'AVAILABLE') locationMap[key].availableCount++;
    });
    const locationReport = Object.values(locationMap);

    // Donation Time-Based Report
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM
    const currentYearStr = todayStr.slice(0, 4); // YYYY

    const todayDonations = histories.filter(h => h.date === todayStr).length;
    const weekDonations = histories.filter(h => h.date >= sevenDaysAgo && h.date <= todayStr).length;
    const monthDonations = histories.filter(h => h.date.startsWith(currentMonthStr)).length;
    const yearDonations = histories.filter(h => h.date.startsWith(currentYearStr)).length;

    // Request Status Percentages
    const requestReport = [
      { status: 'PENDING', label: 'অপেক্ষমাণ (Pending)', count: pendingRequests, percentage: totalRequests > 0 ? Number(((pendingRequests / totalRequests) * 100).toFixed(1)) : 0 },
      { status: 'SEARCHING', label: 'সন্ধান চলছে (Searching)', count: searchingRequests, percentage: totalRequests > 0 ? Number(((searchingRequests / totalRequests) * 100).toFixed(1)) : 0 },
      { status: 'MATCHED', label: 'রক্তদাতা ম্যাচড (Matched)', count: matchedRequests, percentage: totalRequests > 0 ? Number(((matchedRequests / totalRequests) * 100).toFixed(1)) : 0 },
      { status: 'COMPLETED', label: 'সম্পন্ন (Completed)', count: completedRequests, percentage: totalRequests > 0 ? Number(((completedRequests / totalRequests) * 100).toFixed(1)) : 0 },
      { status: 'CANCELLED', label: 'বাতিলকৃত (Cancelled)', count: cancelledRequests, percentage: totalRequests > 0 ? Number(((cancelledRequests / totalRequests) * 100).toFixed(1)) : 0 }
    ];

    // Recent Activity Feed
    const latestDonors = [...donors].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    const latestRequests = [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    const latestDonations = [...histories].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    const latestAuditLogs = [...auditLogs].slice(0, 5);

    // Monthly Trends (Last 6 Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const registrationTrendMap: Record<string, number> = {};
    const donationTrendMap: Record<string, number> = {};
    const requestTrendMap: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      registrationTrendMap[mName] = 0;
      donationTrendMap[mName] = 0;
      requestTrendMap[mName] = 0;
    }

    donors.forEach(d => {
      if (d.createdAt) {
        const dateObj = new Date(d.createdAt);
        const mName = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear().toString().slice(-2)}`;
        if (registrationTrendMap[mName] !== undefined) {
          registrationTrendMap[mName]++;
        }
      }
    });

    histories.forEach(h => {
      if (h.date) {
        const dateObj = new Date(h.date);
        const mName = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear().toString().slice(-2)}`;
        if (donationTrendMap[mName] !== undefined) {
          donationTrendMap[mName]++;
        }
      }
    });

    requests.forEach(r => {
      if (r.createdAt || r.requiredDate) {
        const dateObj = new Date(r.createdAt || r.requiredDate);
        const mName = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear().toString().slice(-2)}`;
        if (requestTrendMap[mName] !== undefined) {
          requestTrendMap[mName]++;
        }
      }
    });

    const monthlyRegistrationTrend = Object.entries(registrationTrendMap).map(([month, count]) => ({ month, count }));
    const donationTrend = Object.entries(donationTrendMap).map(([period, count]) => ({ period, count }));
    const requestTrend = Object.entries(requestTrendMap).map(([period, count]) => ({ period, count }));

    res.json({
      overview: {
        totalDonors,
        availableDonors,
        unavailableDonors,
        totalRequests,
        completedRequests,
        pendingRequests,
        cancelledRequests,
        totalVolunteers
      },
      bloodGroupReport,
      locationReport,
      donationReport: {
        todayDonations,
        weekDonations,
        monthDonations,
        yearDonations
      },
      requestReport,
      recentActivity: {
        latestDonors,
        latestRequests,
        latestDonations,
        latestAuditLogs
      },
      charts: {
        bloodGroupDistribution: bloodGroupReport.map(b => ({ group: b.bloodGroup, total: b.totalDonors, available: b.available, unavailable: b.unavailable })),
        donationTrend,
        requestTrend,
        monthlyRegistrationTrend,
        locationDistribution: locationReport.map(l => ({ name: l.union, count: l.donorCount, available: l.availableCount }))
      }
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

  // Secure Data Export Endpoint (Strict SUPER_ADMIN Access Only)
  app.post('/api/export/data', authMiddleware, (req: any, res: any) => {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'প্রবেশাধিকার সংরক্ষিত। শুধুমাত্র সুপার এডমিন এই ডাটা এক্সপোর্ট করতে পারবেন।' });
    }

    const {
      module = 'donors',
      format = 'xlsx',
      scope = 'filtered',
      startDate = '',
      endDate = '',
      bloodGroup = 'ALL',
      district = 'ALL',
      upazila = 'ALL',
      availability = 'ALL',
      requestStatus = 'ALL',
      userRole = 'ALL'
    } = req.body;

    const ipAddress = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    const nowStr = new Date().toISOString().split('T')[0];

    let rawData: any[] = [];
    let filename = `${module}-${nowStr}.${format}`;
    let filterSummaryArr: string[] = [`স্কোপ: ${scope === 'all' ? 'সকল রেকর্ড' : 'ফিল্টারকৃত'}`];

    // Module-specific data fetching & sanitization
    if (module === 'donors') {
      filename = `blood-donors-${nowStr}.${format}`;
      let donors = dbService.getDonors();

      if (scope === 'filtered') {
        if (bloodGroup && bloodGroup !== 'ALL') {
          donors = donors.filter(d => d.bloodGroup === bloodGroup);
          filterSummaryArr.push(`রক্তের গ্রুপ: ${bloodGroup}`);
        }
        if (district && district !== 'ALL') {
          donors = donors.filter(d => d.district?.toLowerCase() === district.toLowerCase());
          filterSummaryArr.push(`জেলা: ${district}`);
        }
        if (upazila && upazila !== 'ALL') {
          donors = donors.filter(d => d.upazila?.toLowerCase() === upazila.toLowerCase());
          filterSummaryArr.push(`উপজেলা: ${upazila}`);
        }
        if (availability && availability !== 'ALL') {
          donors = donors.filter(d => d.status === availability);
          filterSummaryArr.push(`স্ট্যাটাস: ${availability}`);
        }
        if (startDate) {
          donors = donors.filter(d => d.createdAt >= startDate);
          filterSummaryArr.push(`শুরু: ${startDate}`);
        }
        if (endDate) {
          donors = donors.filter(d => d.createdAt <= endDate + 'T23:59:59');
          filterSummaryArr.push(`শেষ: ${endDate}`);
        }
      }

      // Sanitize donors data
      rawData = donors.map(d => ({
        'আইডি (ID)': d.id,
        'নাম (Name)': d.name,
        'ইংরেজি নাম (Name En)': d.nameEn || '',
        'রক্তের গ্রুপ (Blood Group)': d.bloodGroup,
        'মোবাইল নম্বর (Phone)': d.phone,
        'হোয়াটসঅ্যাপ (WhatsApp)': d.whatsAppPhone || '',
        'লিঙ্গ (Gender)': d.gender === 'MALE' ? 'পুরুষ' : d.gender === 'FEMALE' ? 'নারী' : 'অন্যান্য',
        'বয়স (Age)': d.age,
        'জেলা (District)': d.district,
        'উপজেলা (Upazila)': d.upazila,
        'ইউনিয়ন (Union)': d.union,
        'গ্রাম (Village)': d.village,
        'সর্বশেষ রক্তদান (Last Donation)': d.lastDonationDate || 'N/A',
        'মোট রক্তদান (Total Donations)': d.totalDonations || 0,
        'বর্তমান অবস্থা (Status)': d.status,
        'যাচাইকৃত (Verified)': d.isVerified ? 'হ্যাঁ' : 'না',
        'নিবন্ধনের তারিখ (Created At)': d.createdAt ? d.createdAt.split('T')[0] : ''
      }));
    } else if (module === 'requests') {
      filename = `blood-requests-${nowStr}.${format}`;
      let requests = dbService.getBloodRequests();

      if (scope === 'filtered') {
        if (bloodGroup && bloodGroup !== 'ALL') {
          requests = requests.filter(r => r.bloodGroup === bloodGroup);
          filterSummaryArr.push(`রক্তের গ্রুপ: ${bloodGroup}`);
        }
        if (district && district !== 'ALL') {
          requests = requests.filter(r => r.district?.toLowerCase() === district.toLowerCase());
          filterSummaryArr.push(`জেলা: ${district}`);
        }
        if (upazila && upazila !== 'ALL') {
          requests = requests.filter(r => r.upazila?.toLowerCase() === upazila.toLowerCase());
          filterSummaryArr.push(`উপজেলা: ${upazila}`);
        }
        if (requestStatus && requestStatus !== 'ALL') {
          requests = requests.filter(r => r.status === requestStatus);
          filterSummaryArr.push(`স্ট্যাটাস: ${requestStatus}`);
        }
        if (startDate) {
          requests = requests.filter(r => r.requiredDate >= startDate || r.createdAt >= startDate);
          filterSummaryArr.push(`শুরু: ${startDate}`);
        }
        if (endDate) {
          requests = requests.filter(r => r.requiredDate <= endDate || r.createdAt <= endDate + 'T23:59:59');
          filterSummaryArr.push(`শেষ: ${endDate}`);
        }
      }

      rawData = requests.map(r => ({
        'আবেদন ট্র্যাকিং নম্বর': r.requestNumber || r.id,
        'রোগীর নাম': r.patientName,
        'রক্তের গ্রুপ': r.bloodGroup,
        'প্রয়োজনীয় ব্যাগ': r.bagsNeeded,
        'হাসপাতাল': r.hospitalName,
        'জেলা': r.district,
        'উপজেলা': r.upazila,
        'যোগাযোগ নম্বর': r.contactPhone,
        'প্রয়োজনের তারিখ': r.requiredDate,
        'জরুরি মাত্রা': r.priority,
        'বর্তমান স্ট্যাটাস': r.status,
        'আবেদনের সময়': r.createdAt ? r.createdAt.split('T')[0] : ''
      }));
    } else if (module === 'donations') {
      filename = `donation-history-${nowStr}.${format}`;
      let histories = dbService.getAllDonationHistories();
      const donorsMap = new Map(dbService.getDonors().map(d => [d.id, d]));

      let enrichedHistories = histories.map(h => {
        const donor = donorsMap.get(h.donorId);
        return {
          ...h,
          donorName: donor?.name || 'অজ্ঞাত রক্তদাতা',
          bloodGroup: donor?.bloodGroup || 'N/A'
        };
      });

      if (scope === 'filtered') {
        if (bloodGroup && bloodGroup !== 'ALL') {
          enrichedHistories = enrichedHistories.filter(h => h.bloodGroup === bloodGroup);
          filterSummaryArr.push(`রক্তের গ্রুপ: ${bloodGroup}`);
        }
        if (startDate) {
          enrichedHistories = enrichedHistories.filter(h => h.date >= startDate);
          filterSummaryArr.push(`শুরু: ${startDate}`);
        }
        if (endDate) {
          enrichedHistories = enrichedHistories.filter(h => h.date <= endDate);
          filterSummaryArr.push(`শেষ: ${endDate}`);
        }
      }

      rawData = enrichedHistories.map(h => ({
        'রেকর্ড আইডি': h.id,
        'রক্তদাতার আইডি': h.donorId,
        'রক্তদাতার নাম': h.donorName,
        'রক্তের গ্রুপ': h.bloodGroup,
        'রক্তদানের তারিখ': h.date,
        'হাসপাতাল / স্থান': h.hospitalName || h.location || '',
        'রোগীর নাম': h.patientName || '',
        'ব্যাগ সংখ্যা': h.bagsCount || 1,
        'নোটস': h.notes || ''
      }));
    } else if (module === 'reports') {
      filename = `report-${nowStr}.${format}`;
      const donors = dbService.getDonors();
      const requests = dbService.getBloodRequests();
      const histories = dbService.getAllDonationHistories();

      rawData = [
        { 'বিষয়': 'মোট নিবন্ধিত রক্তদাতা', 'মান': `${donors.length} জন` },
        { 'বিষয়': 'রক্তদানে প্রস্তুত (Available)', 'মান': `${donors.filter(d => d.status === 'AVAILABLE').length} জন` },
        { 'বিষয়': 'অনুপস্থিত / সীমিত', 'মান': `${donors.filter(d => d.status !== 'AVAILABLE').length} জন` },
        { 'বিষয়': 'মোট রক্তের আবেদন', 'মান': `${requests.length} টি` },
        { 'বিষয়': 'সম্পন্ন রক্তের আবেদন', 'মান': `${requests.filter(r => r.status === 'COMPLETED' || r.status === 'FULFILLED').length} টি` },
        { 'বিষয়': 'অপেক্ষমাণ আবেদন', 'মান': `${requests.filter(r => r.status === 'PENDING').length} টি` },
        { 'বিষয়': 'বাতিলকৃত আবেদন', 'মান': `${requests.filter(r => r.status === 'CANCELLED').length} টি` },
        { 'বিষয়': 'সর্বমোট রক্তদান রেকর্ড', 'মান': `${histories.length} ব্যাগ` }
      ];
    } else if (module === 'logs') {
      filename = `activity-logs-${nowStr}.${format}`;
      let logs = dbService.getAuditLogs();

      if (scope === 'filtered' && startDate) {
        logs = logs.filter(l => l.timestamp >= startDate);
        filterSummaryArr.push(`শুরু: ${startDate}`);
      }
      if (scope === 'filtered' && endDate) {
        logs = logs.filter(l => l.timestamp <= endDate + 'T23:59:59');
        filterSummaryArr.push(`শেষ: ${endDate}`);
      }

      rawData = logs.map(l => ({
        'লগ আইডি': l.id,
        'ব্যবহারকারীর নাম': l.actorName,
        'রোল': l.actorRole,
        'অ্যাকশন': l.action,
        'বিস্তারিত বিবরণ': l.details,
        'সময়কাল': l.timestamp
      }));
    } else if (module === 'users') {
      filename = `users-${nowStr}.${format}`;
      let users = dbService.getAdminUsers();

      if (scope === 'filtered' && userRole && userRole !== 'ALL') {
        users = users.filter(u => u.role === userRole);
        filterSummaryArr.push(`রোল: ${userRole}`);
      }

      // Sanitize Users data - EXCLUDE Passwords and Security Tokens
      rawData = users.map(u => ({
        'ব্যবহারকারী আইডি': u.id,
        'নাম': u.name,
        'ইমেইল': u.email,
        'ফোন নম্বর': u.phone || '',
        'সিস্টেম রোল': u.role,
        'সক্রিয় অবস্থা': u.active ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)',
        'অ্যাকাউন্ট তৈরির তারিখ': u.createdAt ? u.createdAt.split('T')[0] : ''
      }));
    }

    const filterSummary = filterSummaryArr.join(' | ');

    // Write Audit Log for Export Action
    dbService.addAuditLog(
      req.user.name,
      req.user.role,
      'EXPORT_DATA',
      `সংবেদনশীল ডাটা এক্সপোর্ট সম্পন্ন হয়েছে: [মডিউল: ${module.toUpperCase()}, ফরমেট: ${format.toUpperCase()}, ${filterSummary}, রেকর্ডস: ${rawData.length}টি, IP: ${ipAddress}]`
    );

    res.json({
      success: true,
      filename,
      module,
      format,
      recordCount: rawData.length,
      filterSummary,
      data: rawData,
      auditMeta: {
        userId: req.user.id,
        userName: req.user.name,
        role: req.user.role,
        exportTime: new Date().toISOString(),
        ipAddress,
        deviceInfo: userAgent
      }
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
