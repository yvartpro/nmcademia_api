const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { uploadImage, uploadVideo, optimizeImage, optimizeVideo } = require('../middleware/upload');

const LeadController = require('../controllers/LeadController');
const CountryController = require('../controllers/CountryController');
const PackageController = require('../controllers/PackageController');
const ProductController = require('../controllers/ProductController');
const FAQController = require('../controllers/FAQController');
const SettingController = require('../controllers/SettingController');
const ChatController = require('../controllers/ChatController');
const MediaController = require('../controllers/MediaController');
const TestimonialController = require('../controllers/TestimonialController');
const FounderController = require('../controllers/FounderController');
const ManufacturingPartnerController = require('../controllers/ManufacturingPartnerController');
const EarningStreamController = require('../controllers/EarningStreamController');
const WayController = require('../controllers/WayController');
const OwnerController = require('../controllers/OwnerController');

// Apply auth middleware to ALL admin routes
router.use(requireAuth);

// Owner Profile Management
router.get('/owner/profile', OwnerController.getAdminProfile);
router.put('/owner/profile', OwnerController.updateProfile);

// Leads
router.get('/leads', LeadController.getAllLeads);
router.get('/leads/:id', LeadController.getLeadById);
router.put('/leads/:id/status', LeadController.updateLeadStatus);
router.delete('/leads/:id', LeadController.deleteLead);

// Countries
router.get('/countries', CountryController.adminGetAllCountries);
router.post('/countries', CountryController.createCountry);
router.put('/countries/:id', CountryController.updateCountry);
router.delete('/countries/:id', CountryController.deleteCountry);

// Packages
router.post('/packages', PackageController.createPackage);
router.put('/packages/:id', PackageController.updatePackage);
router.delete('/packages/:id', PackageController.deletePackage);

// Products
router.post('/products', ProductController.createProduct);
router.put('/products/:id', ProductController.updateProduct);
router.delete('/products/:id', ProductController.deleteProduct);

// FAQs
router.post('/faqs', FAQController.createFAQ);
router.put('/faqs/:id', FAQController.updateFAQ);
router.delete('/faqs/:id', FAQController.deleteFAQ);

// Settings
router.get('/settings', SettingController.getAllSettingsDetailed);
router.put('/settings', SettingController.updateSettings);
router.delete('/settings/:key', SettingController.deleteSetting);

// Testimonials
router.post('/testimonials', TestimonialController.createTestimonial);
router.put('/testimonials/:id', TestimonialController.updateTestimonial);
router.delete('/testimonials/:id', TestimonialController.deleteTestimonial);

// Founders
router.post('/founders', FounderController.createFounder);
router.put('/founders/:id', FounderController.updateFounder);
router.delete('/founders/:id', FounderController.deleteFounder);

// Manufacturing Partners
router.post('/manufacturing-partners', ManufacturingPartnerController.createManufacturingPartner);
router.put('/manufacturing-partners/:id', ManufacturingPartnerController.updateManufacturingPartner);
router.delete('/manufacturing-partners/:id', ManufacturingPartnerController.deleteManufacturingPartner);

// Earning Streams
router.get('/earning-streams', EarningStreamController.getAllEarningStreamsAdmin);
router.post('/earning-streams', EarningStreamController.createEarningStream);
router.put('/earning-streams/:id', EarningStreamController.updateEarningStream);
router.delete('/earning-streams/:id', EarningStreamController.deleteEarningStream);

// Ways of Earning
router.get('/ways', WayController.getAllWaysAdmin);
router.post('/ways', WayController.createWay);
router.put('/ways/:id', WayController.updateWay);
router.delete('/ways/:id', WayController.deleteWay);

// Chat Admin Endpoints
router.get('/chat/sessions', ChatController.getActiveSessions);
router.get('/chat/sessions/:chatSessionId', ChatController.getSessionMessages);
router.post('/chat/reply', ChatController.sendTrainerReply);
router.post('/chat/sessions/:chatSessionId/close', ChatController.closeSession);

// Media
router.get('/media', MediaController.getAllMedia);
router.post('/media/image', uploadImage.single('file'), optimizeImage, MediaController.uploadImage);
router.post('/media/video', uploadVideo.single('file'), optimizeVideo, MediaController.uploadVideo);
router.delete('/media/:id', MediaController.deleteMedia);

module.exports = router;
