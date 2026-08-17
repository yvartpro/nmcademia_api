const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { uploadImage, uploadVideo, hybridUpload, optimizeImage, optimizeVideo } = require('../middleware/upload');

const LeadController = require('../controllers/LeadController');
const CountryController = require('../controllers/CountryController');
const PackageController = require('../controllers/PackageController');
const ProductController = require('../controllers/ProductController');
const FAQController = require('../controllers/FAQController');
const SettingController = require('../controllers/SettingController');
const LanguageController = require('../controllers/LanguageController');
const TranslationController = require('../controllers/TranslationController');
const ChatController = require('../controllers/ChatController');
const MediaController = require('../controllers/MediaController');
const TestimonialController = require('../controllers/TestimonialController');
const FounderController = require('../controllers/FounderController');
const ManufacturingPartnerController = require('../controllers/ManufacturingPartnerController');
const EarningStreamController = require('../controllers/EarningStreamController');
const WayController = require('../controllers/WayController');
const OwnerController = require('../controllers/OwnerController');
const PresentationController = require('../controllers/PresentationController');

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

// Languages and translations
router.get('/languages', LanguageController.getAllLanguages);
router.post('/languages', LanguageController.createLanguage);
router.put('/languages/:id', LanguageController.updateLanguage);
router.delete('/languages/:id', LanguageController.deleteLanguage);

router.get('/translations', TranslationController.getTranslations);
router.post('/translations', TranslationController.upsertTranslation);
router.post('/translations/bulk', TranslationController.bulkUpsertTranslations);

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
router.get('/media/:id/status', MediaController.getMediaStatus);
router.post('/media/image', uploadImage.single('file'), optimizeImage, MediaController.uploadImage);
router.post('/media/hls-upload', hybridUpload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), optimizeImage, MediaController.uploadVideoHls);
// Upload video with optional thumbnail (both saved in a DB transaction)
router.post('/media/video-with-thumbnail', hybridUpload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), optimizeVideo, optimizeImage, MediaController.uploadVideoWithThumbnail);
router.patch('/media/:id/thumbnail', uploadImage.single('thumbnail'), optimizeImage, MediaController.updateThumbnail);
router.delete('/media/:id', MediaController.deleteMedia);

// Presentations
router.get('/presentations', PresentationController.getAllPresentationsAdmin);
router.post('/presentations', PresentationController.createPresentation);
router.put('/presentations/:id', PresentationController.updatePresentation);
router.delete('/presentations/:id', PresentationController.deletePresentation);

module.exports = router;
