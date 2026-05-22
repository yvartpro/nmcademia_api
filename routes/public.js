const express = require('express');
const router = express.Router();

const LeadController = require('../controllers/LeadController');
const CountryController = require('../controllers/CountryController');
const PackageController = require('../controllers/PackageController');
const ProductController = require('../controllers/ProductController');
const FAQController = require('../controllers/FAQController');
const SettingController = require('../controllers/SettingController');
const ChatController = require('../controllers/ChatController');
const TestimonialController = require('../controllers/TestimonialController');
const FounderController = require('../controllers/FounderController');
const ManufacturingPartnerController = require('../controllers/ManufacturingPartnerController');
const EarningStreamController = require('../controllers/EarningStreamController');

// Leads
router.post('/leads', LeadController.createLead);

// Countries
router.get('/countries', CountryController.getAllCountries);

// Packages
router.get('/packages', PackageController.getAllPackages);

// Products
router.get('/products', ProductController.getAllProducts);

// FAQs
router.get('/faqs', FAQController.getAllFAQs);

// Settings
router.get('/settings', SettingController.getAllSettings);

// Content
router.get('/testimonials', TestimonialController.getAllTestimonials);
router.get('/founders', FounderController.getAllFounders);
router.get('/manufacturing-partners', ManufacturingPartnerController.getAllManufacturingPartners);
router.get('/earning-streams', EarningStreamController.getAllEarningStreams);

// Chat Guest Endpoints
router.post('/chat/session', ChatController.startSession);
router.post('/chat/message', ChatController.sendGuestMessage);
router.get('/chat/messages/:chatSessionId', ChatController.getGuestMessages);

module.exports = router;
