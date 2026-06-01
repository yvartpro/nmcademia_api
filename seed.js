const {
  sequelize, Country, Package, PackagePrice, Product, FAQ, Setting,
  Testimonial, Founder, ManufacturingPartner, EarningStream
} = require('./models');
const settingsContent = require('./seed/settingsContent');
const wizardOptions = require('./seed/wizardOptions');
const faqsData = require('./seed/faqsData');
const testimonialsData = require('./seed/testimonialsData');
const earningStreamsData = require('./seed/earningStreamsData');

async function seed() {
  try {
    console.log('Seeding database (wiping existing tables)...');
    await sequelize.sync({ force: true });
    console.log('Database synced & cleared.');

    // 1. Seed Countries
    console.log('Seeding Countries...');
    const countries = [
      { name: 'Nigeria', code: 'NG', currency: 'NGN', currencySymbol: '₦', whatsappNumber: '+2348030001111' },
      { name: 'Kenya', code: 'KE', currency: 'KES', currencySymbol: 'KSh', whatsappNumber: '+254711223344' },
      { name: 'Burundi', code: 'BI', currency: 'BIF', currencySymbol: 'FBu', whatsappNumber: '+25779123456' },
      { name: 'United States', code: 'US', currency: 'USD', currencySymbol: '$', whatsappNumber: '+12025550199' }
    ];
    for (const c of countries) {
      await Country.create(c);
    }

    // 2. Seed Settings
    console.log('Seeding Settings...');
    const settings = [
      {
        key: 'video_url',
        value: 'https://www.youtube.com/embed/zpOULjyy-n8',
        description: 'Alliance In Motion Global Presentation Video Embed Link'
      },
      {
        key: 'whatsapp_number',
        value: '+2348030001111',
        description: 'Global trainer WhatsApp number'
      },
      {
        key: 'landing_hero_text',
        value: settingsContent.landing_hero_text,
        description: 'Landing Page Hero confrontational statement'
      },
      {
        key: 'mission_statement',
        value: settingsContent.mission_statement,
        description: 'Academia Mission statement text'
      },
      {
        key: 'objectives_statement',
        value: settingsContent.objectives_statement,
        description: 'Academia Objectives'
      },
      {
        key: 'vision_statement',
        value: settingsContent.vision_statement,
        description: 'Academia Vision text'
      },
      {
        key: 'nm_video_url',
        value: 'https://www.youtube.com/embed/zpOULjyy-n8',
        description: 'Eric Worre or intro "What is Network Marketing" video embed URL (shown in Mission section)'
      },
      {
        key: 'landing_cta_text',
        value: 'Enter the Vision',
        description: 'Landing page hero CTA button label'
      },
      {
        key: 'segment_options',
        value: wizardOptions.segment_options,
        description: 'Landing page wizard segment selection options (JSON array)'
      },
      {
        key: 'list_options',
        value: wizardOptions.list_options,
        description: 'Landing page wizard New/Exploring checklist options (JSON array)'
      },
      {
        key: 'already_in_nm_message',
        value: settingsContent.already_in_nm_message,
        description: 'Message shown to "Already in NM" leads on Step 3A of wizard'
      },
      {
        key: 'nm_why_fail_reasons',
        value: wizardOptions.nm_why_fail_reasons,
        description: 'Why distributors fail — bullet list for Already-in-NM step (JSON array)'
      },
      {
        key: 'nm_coaching_benefits',
        value: wizardOptions.nm_coaching_benefits,
        description: 'Benefits of coaching — bullet list for Already-in-NM step (JSON array)'
      },
      {
        key: 'coaching_cta_text',
        value: 'Get Coaching & Mentorship',
        description: 'CTA button label for the Already-in-NM path'
      },
      {
        key: 'new_exploring_message',
        value: settingsContent.new_exploring_message,
        description: 'Welcome message for New/Exploring leads on Step 3B of wizard'
      },
      {
        key: 'partner_company_name',
        value: 'Alliance In Motion Global Group of Companies (AGG)',
        description: 'Official partner company name'
      },
      {
        key: 'partner_company_intro',
        value: settingsContent.partner_company_intro,
        description: 'Partner company intro paragraph shown at the top of the Presentation page'
      },
      {
        key: 'partner_company_profile',
        value: settingsContent.partner_company_profile,
        description: 'Full partner company profile text'
      },
      {
        key: 'dream_section_text',
        value: settingsContent.dream_section_text,
        description: 'WHAT IS YOUR DREAM? section intro text'
      },
      {
        key: 'cashflow_quadrant_explanation',
        value: settingsContent.cashflow_quadrant_explanation,
        description: 'Cashflow quadrant section intro on presentation slide'
      },
      {
        key: 'binary_system_explanation',
        value: settingsContent.binary_system_explanation,
        description: 'Binary system explanation text for MSB section'
      },
      {
        key: 'how_to_join_note',
        value: settingsContent.how_to_join_note,
        description: 'Note shown below the HOW TO JOIN packages table'
      }
    ];
    for (const s of settings) {
      await Setting.create(s);
    }

    // 3. Seed Products
    console.log('Seeding Products...');
    const products = [
      {
        slug: 'c247',
        name: 'C24/7 Natura-Ceuticals',
        scientificName: 'Phyto-Alcalines',
        category: 'Food Supplements',
        description: 'The most nutritionally dense food concentrate in the world market today. Contains 22,000 phytonutrients, 29 vitamins and trace minerals, 18 amino acids, and super green foods.',
        price: 25000.00,
        featured: true
      },
      {
        slug: 'complete',
        name: 'Complete Phyto-Energizer',
        scientificName: 'Daily Essentials',
        category: 'Food Supplements',
        description: 'Contains 16,000 phytonutrients. It is a lower dose version of C24/7, suitable for pregnant or lactating mothers, and children.',
        price: 22000.00,
        featured: true
      },
      {
        slug: 'restorlyf',
        name: 'RestorLyf Longevity Formula',
        scientificName: 'Resveratrol Blend',
        category: 'Food Supplements',
        description: 'A synergistic blend of resveratrol longevity polyphenols designed to prolong lifespan, reduce symptoms of aging, and promote metabolic health.',
        price: 28000.00,
        featured: false
      },
      {
        slug: 'choleduz',
        name: 'Choleduz Omega Supreme',
        scientificName: 'Fish Oil & Vitamin E',
        category: 'Food Supplements',
        description: 'Premium source of Omega-3 fatty acids, EPA and DHA, that lowers blood bad cholesterol, supports heart health, and prevents cardiovascular diseases.',
        price: 18000.00,
        featured: false
      },
      {
        slug: 'liven',
        name: 'Liven Alkaline Coffee',
        scientificName: 'Premium Arabica & Complete',
        category: 'Beverages',
        description: 'The world\'s first alkaline coffee, fortified with Complete Phyto-Energizer. Balances stomach pH while offering rich coffee energy.',
        price: 8500.00,
        featured: true
      }
    ];
    for (const p of products) {
      await Product.create(p);
    }

    // 4. Seed Packages
    console.log('Seeding Packages & Package Prices...');
    const packages = [
      {
        slug: 'entriverse',
        name: 'Entriverse Package',
        description: 'Starter package designed for beginners trying out the business. Comes with complete set of products equivalent to value.',
        featured: false,
        prices: [
          { countryCode: 'NG', price: 79990, currency: 'NGN', referralBonus: 20000, matchBonus: 7000 },
          { countryCode: 'KE', price: 8000, currency: 'KES', referralBonus: 2000, matchBonus: 700 },
          { countryCode: 'BI', price: 160000, currency: 'BIF', referralBonus: 40000, matchBonus: 14000 },
          { countryCode: 'US', price: 60, currency: 'USD', referralBonus: 15, matchBonus: 5 }
        ]
      },
      {
        slug: 'neoverse',
        name: 'Neoverse Package',
        description: 'Popular intermediate entry package with higher earnings ceiling and more product allocation.',
        featured: false,
        prices: [
          { countryCode: 'NG', price: 99990, currency: 'NGN', referralBonus: 25000, matchBonus: 7000 },
          { countryCode: 'KE', price: 10000, currency: 'KES', referralBonus: 2500, matchBonus: 700 },
          { countryCode: 'BI', price: 200000, currency: 'BIF', referralBonus: 50000, matchBonus: 14000 },
          { countryCode: 'US', price: 75, currency: 'USD', referralBonus: 20, matchBonus: 5 }
        ]
      },
      {
        slug: 'technoverse',
        name: 'Technoverse Package',
        description: 'Advanced package for tech-oriented builders who want extra digital assets and premium resources.',
        featured: false,
        prices: [
          { countryCode: 'NG', price: 129990, currency: 'NGN', referralBonus: 30000, matchBonus: 7000 },
          { countryCode: 'KE', price: 13000, currency: 'KES', referralBonus: 3000, matchBonus: 700 },
          { countryCode: 'BI', price: 260000, currency: 'BIF', referralBonus: 60000, matchBonus: 14000 },
          { countryCode: 'US', price: 100, currency: 'USD', referralBonus: 25, matchBonus: 5 }
        ]
      },
      {
        slug: 'digiverse',
        name: 'Digiverse Package',
        description: 'Elite digital networker level. High pairing matching potentials and fully unlocked compensation matrices.',
        featured: true,
        prices: [
          { countryCode: 'NG', price: 259000, currency: 'NGN', referralBonus: 50000, matchBonus: 7000 },
          { countryCode: 'KE', price: 26000, currency: 'KES', referralBonus: 5000, matchBonus: 700 },
          { countryCode: 'BI', price: 520000, currency: 'BIF', referralBonus: 100000, matchBonus: 14000 },
          { countryCode: 'US', price: 200, currency: 'USD', referralBonus: 40, matchBonus: 5 }
        ]
      },
      {
        slug: 'megaverse',
        name: 'Megaverse Package',
        description: 'Professional agency builder package. Unlocks multiple centers of duplicate income.',
        featured: false,
        prices: [
          { countryCode: 'NG', price: 499990, currency: 'NGN', referralBonus: 100000, matchBonus: 7000 },
          { countryCode: 'KE', price: 50000, currency: 'KES', referralBonus: 10000, matchBonus: 700 },
          { countryCode: 'BI', price: 1000000, currency: 'BIF', referralBonus: 200000, matchBonus: 14000 },
          { countryCode: 'US', price: 380, currency: 'USD', referralBonus: 75, matchBonus: 5 }
        ]
      },
      {
        slug: 'maxiverse',
        name: 'Maxiverse Package',
        description: 'The ultimate investment package. Unlocks maximum allowed binary pairings, stair-steps, and UPP checks.',
        featured: false,
        prices: [
          { countryCode: 'NG', price: 999900, currency: 'NGN', referralBonus: 150000, matchBonus: 7000 },
          { countryCode: 'KE', price: 100000, currency: 'KES', referralBonus: 15000, matchBonus: 700 },
          { countryCode: 'BI', price: 2000000, currency: 'BIF', referralBonus: 300000, matchBonus: 14000 },
          { countryCode: 'US', price: 750, currency: 'USD', referralBonus: 110, matchBonus: 5 }
        ]
      }
    ];

    for (const p of packages) {
      const createdPkg = await Package.create({
        slug: p.slug,
        name: p.name,
        description: p.description,
        featured: p.featured
      });
      for (const pr of p.prices) {
        await PackagePrice.create({
          packageId: createdPkg.id,
          countryCode: pr.countryCode,
          price: pr.price,
          currency: pr.currency,
          referralBonus: pr.referralBonus,
          matchBonus: pr.matchBonus
        });
      }
    }

    // 5. Seed FAQs
    console.log('Seeding 40 FAQs...');
    for (const f of faqsData) {
      await FAQ.create({
        question: f.question,
        answer: f.answer,
        order: f.order,
        category: 'Alliance In Motion Opportunity'
      });
    }

    // 6. Seed Founders
    console.log('Seeding Founders...');
    await Founder.bulkCreate([
      {
        name: 'Dr. Ed Cabantog',
        initials: 'EC',
        role: 'President & CEO',
        title: 'Dr.',
        bio: 'Dr. Ed Cabantog provides health guidance and leads expansion strategies globally.',
        order: 1
      },
      {
        name: 'Engr. Francis Miguel',
        initials: 'FM',
        role: 'Chief Finance Officer',
        title: 'Engr.',
        bio: 'Pioneering corporate finance systems for safe, fast commission payouts.',
        order: 2
      },
      {
        name: 'John Asperin',
        initials: 'JA',
        role: 'Chief Marketing Officer',
        title: 'Mr.',
        bio: 'Leads global marketing and business development for AIM Global.',
        order: 3
      }
    ]);

    // 7. Seed Manufacturing Partners
    console.log('Seeding Manufacturing Partners...');
    await ManufacturingPartner.bulkCreate([
      { name: "Nature's Way", country: 'USA', description: 'Nutraceutical research and herbal production.', order: 1 },
      { name: 'DSM', country: 'Europe', description: 'Science-based nutrition and lipid supplements.', order: 2 },
      { name: 'Weider', country: 'USA', description: 'Active nutrition and sports medicine manufacturing.', order: 3 },
      { name: 'Natrol', country: 'USA', description: 'Premium brain health and sleep support supplements.', order: 4 },
      {
        name: 'Robinson Pharma',
        country: 'USA',
        description: 'Contract manufacturer for dietary supplements.',
        order: 5
      }
    ]);

    // 8. Seed Testimonials
    console.log('Seeding Testimonials...');
    await Testimonial.bulkCreate(testimonialsData);

    // 9. Seed Earning Streams
    console.log('Seeding Earning Streams...');
    await EarningStream.bulkCreate(earningStreamsData);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

seed();
