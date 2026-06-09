const { sequelize, Country, Package, PackagePrice, Product, FAQ, Setting, Testimonial, Founder, ManufacturingPartner, EarningStream } = 
require('./models');
const settingsContent = require('./seed/settingsContent');
const faqContent = require('./seed/faqContent');

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
        value: JSON.stringify(["I am new to network marketing","I am already in network marketing","I am in network marketing but not satisfied and want to switch companies","I am just exploring opportunities","I am tired of depending on one source of income","I am tired of being jobless","I want this business by all means"]),
        description: 'Landing page wizard segment selection options (JSON array)'
      },
      {
        key: 'list_options',
        value: JSON.stringify(["Tired of depending on a single income?","Tired of working hard but not progressing financially?","Tired of job uncertainty and rising living costs?","A single mother looking for a flexible way to support your family?","An employee looking for an additional source of income?","Unemployed and searching for an opportunity?","A student exploring future possibilities?","An entrepreneur looking to expand your income streams?"]),
        description: 'Landing page wizard New/Exploring checklist options (JSON array)'
      },
      {
        key: 'already_in_nm_message',
        value: settingsContent.already_in_nm_message,
        description: 'Message shown to "Already in NM" leads on Step 3A of wizard'
      },
      {
        key: 'nm_why_fail_reasons',
        value: JSON.stringify(["They stop learning after joining.","They expect fast money without personal growth.","They lack consistency in daily activities.","They fear rejection and criticism.","They quit too early before momentum is created.","They refuse to follow systems and mentorship.","They do not attend trainings, webinars, and events.","They become emotionally affected by negative opinions.","They focus more on convincing than sorting.","They do not develop leadership skills.","They fail to duplicate simple systems.","They compare themselves with others and lose confidence.","They are not patient enough to build long-term residual income.","They try to build alone without guidance.","They do not invest in self-development and education."]),
        description: 'Why distributors fail — bullet list for Already-in-NM step (JSON array)'
      },
      {
        key: 'nm_coaching_benefits',
        value: JSON.stringify(["Avoid common mistakes that destroy many distributors.","Learn proven strategies faster.","Stay focused and accountable.","Build confidence during difficult moments.","Improve your communication and presentation skills.","Understand duplication and team building.","Develop leadership and emotional intelligence.","Handle rejection professionally.","Stay consistent even when results are slow.","Grow personally while growing your organization."]),
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
        key: 'cashflow_quadrant_image',
        value: '',
        description: 'Cashflow quadrant image URL or media path'
      },
      {
        key: 'binary_tree_image',
        value: '',
        description: 'Binary tree diagram image URL or media path'
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
        description: 'A synergistic blend of resveratrol longevity polyphenols designed to prolong lifespan, reduce symptoms of aging, and promote metabolic health.',        price: 28000.00,
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
    const faqs = [
      {
        order: 0,
        question: 'What is Network Marketing Academia and how is it connected to the business opportunity?',
        answer: 'Network Marketing Academia is an educational platform designed to help individuals understand modern network marketing, leadership, and digital entrepreneurship. Business participation is facilitated through our official partner company, Alliance In Motion Global Group of Companies.'
      },
      {
        order: 1,
        question: 'I DON’T HAVE TIME',
        answer: 'Most successful people started part-time. You can build this business during your free hours while continuing your normal activities.'
      },
      {
        order: 2,
        question: 'I DON’T HAVE THE MONEY',
        answer: 'Many people begin from difficult financial situations. The business is often started precisely because someone wants financial change.'
      },
      {
        order: 3,
        question: 'THIS IS NOT MY THING',
        answer: 'Nobody is born experienced. Business skills are learned through training, repetition, and exposure.'
      },
      {
        order: 4,
        question: 'I DON’T HAVE EXPERIENCE',
        answer: 'Experience is not required. The system, mentorship, and team support help you learn step by step.'
      },
      {
        order: 5,
        question: 'WHAT IF PEOPLE REJECT ME?',
        answer: 'Rejection is part of every business. Even successful companies hear “no” every day. One decision from the right person can change everything.'
      },
      {
        order: 6,
        question: 'I DON’T KNOW HOW TO TALK TO PEOPLE',
        answer: 'You don’t need to be a professional speaker. Simple sharing and genuine conversations are enough to start.'
      },
      {
        order: 7,
        question: 'I AM SHY',
        answer: 'Many top earners started as shy people. Confidence grows with action and experience.'
      },
      {
        order: 8,
        question: 'MY FRIENDS OR FAMILY MAY LAUGH AT ME',
        answer: 'Most people who quit network marketing quit because of the opinions of people who never built a business themselves.'
      },
      {
        order: 9,
        question: 'WHAT IF I FAIL?',
        answer: 'Failure only becomes permanent when someone stops trying. Every successful entrepreneur failed at some point before succeeding.'
      },
      {
        order: 10,
        question: 'I DON’T KNOW MANY PEOPLE',
        answer: 'Social media allows you to connect with thousands of people beyond your personal circle.'
      },
      {
        order: 11,
        question: 'IS NETWORK MARKETING A PYRAMID SCHEME?',
        answer: 'No. Legitimate network marketing companies have real products, company registration, and compensation plans based on business activity.'
      },
      {
        order: 12,
        question: 'I HAVE BEEN SCAMMED BEFORE',
        answer: 'Past experiences should not stop you from recognizing legitimate opportunities. Every industry has both genuine and fake companies.'
      },
      {
        order: 13,
        question: 'I NEED TO THINK ABOUT IT',
        answer: 'That is understandable. But remember, opportunities often reward people who take decisions while others remain uncertain.'
      },
      {
        order: 14,
        question: 'WHAT IF PEOPLE SAY IT DOESN’T WORK?',
        answer: 'Many people say something does not work simply because they personally did not stay consistent long enough.'
      },
      {
        order: 15,
        question: 'I DON’T LIKE SELLING',
        answer: 'This business is more about sharing information and building networks than traditional selling.'
      },
      {
        order: 16,
        question: 'I AM TOO OLD / TOO YOUNG',
        answer: 'Success in network marketing is not determined by age. People from different generations succeed in this industry.'
      },
      {
        order: 17,
        question: 'I DON’T HAVE LEADERSHIP SKILLS',
        answer: 'Leadership is developed during the journey. Nobody starts as an expert leader.'
      },
      {
        order: 18,
        question: 'WHAT IF MY SPOUSE DOESN’T SUPPORT ME?',
        answer: 'Many entrepreneurs started alone before their results eventually gained support from others.'
      },
      {
        order: 19,
        question: 'I DON’T WANT TO DISTURB PEOPLE',
        answer: 'You are simply presenting information. Every adult has the freedom to accept or decline.'
      },
      {
        order: 20,
        question: 'CAN I REALLY MAKE MONEY HERE?',
        answer: 'Income depends on effort, consistency, learning, and teamwork. Like any business, results vary from person to person.'
      },
      {
        order: 21,
        question: 'WHY DO PEOPLE QUIT NETWORK MARKETING?',
        answer: 'Most people quit because of fear, negative surroundings, impatience, or lack of consistency — not because the industry itself cannot work.'
      },
      {
        order: 22,
        question: 'WHY SHOULD I START NOW?',
        answer: 'Waiting rarely changes financial situations. Many people later regret the opportunities they ignored because of fear or doubt.'
      },
      {
        order: 23,
        question: 'WHAT IF I’VE TRIED MANY OPPORTUNITIES BEFORE WITHOUT SUCCESS?',
        answer: 'Your past experience doesn’t define your future results. Success often comes when you apply consistency in the right system, not by changing goals every time.'
      },
      {
        order: 24,
        question: 'HOW IS THIS DIFFERENT FROM MY PREVIOUS EXPERIENCES?',
        answer: 'The difference is in structure, mentorship, and duplication. You are not building alone—you are following .'
      },
      {
        order: 25,
        question: 'DO I NEED PERFECT ENGLISH OR EDUCATION TO START?',
        answer: 'No. What matters is willingness to learn and apply simple instructions step by step.'
      },
      {
        order: 26,
        question: 'WHAT IF I DON’T SEE RESULTS QUICKLY?',
        answer: 'Like any real business, results depend on consistency. Those who persist usually separate themselves from those who stop too early.'
      },
      {
        order: 27,
        question: 'IS SUCCESS GUARANTEED IF I JOIN?',
        answer: 'No business can guarantee success. But what is guaranteed is access to a system, training, and an opportunity to grow based on effort.'
      },
      {
        order: 28,
        question: 'WHAT KIND OF PEOPLE FAIL IN THIS BUSINESS?',
        answer: 'Those who stop early, stay inconsistent, or expect results without applying the system.'
      },
      {
        order: 29,
        question: 'DO I NEED TO LEAVE MY JOB TO START?',
        answer: 'No. Many people start part-time and transition only when their results grow.'
      },
      {
        order: 30,
        question: 'WHAT IF I DON’T UNDERSTAND EVERYTHING AT THE BEGINNING?',
        answer: 'Understanding comes through action. Most people learn step by step while doing.'
      },
      {
        order: 31,
        question: 'IS THIS ONLY FOR EXTROVERTS?',
        answer: 'No. Introverts often perform very well because they focus more on listening, learning, and consistency.'
      },
      {
        order: 32,
        question: 'WHAT IF I DON’T HAVE SUPPORT FROM ANYONE?',
        answer: 'Support is not required to start. Many successful people began alone and built proof through results.'
      },
      {
        order: 33,
        question: 'HOW DO I KNOW THIS ISN’T JUST HYPE?',
        answer: 'The real test is action. People who apply the system over time usually see whether it works or not.'
      },
      {
        order: 34,
        question: 'WHAT IF I START AND WANT TO STOP LATER?',
        answer: 'You are free to stop anytime. But most people who stop do so before giving the process enough time.'
      },
      {
        order: 35,
        question: 'WHAT KIND OF MINDSET IS REQUIRED TO SUCCEED?',
        answer: 'Patience, consistency, openness to learning, and the ability to follow a proven system.'
      },
      {
        order: 36,
        question: 'WHY DO PEOPLE REGRET NOT STARTING EARLIER?',
        answer: 'Because they realize later that hesitation cost them time, experience, and potential growth.'
      },
      {
        order: 37,
        question: 'WHAT IS THE REAL RISK IF I DON’T TRY?',
        answer: 'Staying in the same financial situation while expecting change without action.'
      },
      {
        order: 38,
        question: 'WHAT IF THIS BECOMES MY TURNING POINT?',
        answer: 'Then everything changes gradually—your mindset, skills, network, and income potential over time.'
      },
      {
        order: 39,
        question: "I don't like recruiting people. Why does this business involve building a team?",
        answer: faqContent.faq_recruiting_answer
      }
    ];

    for (const f of faqs) {
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
      { name: 'Dr. Ed Cabantog', initials: 'EC', role: 'President & CEO', title: 'Dr.', bio: 'Dr. Ed Cabantog provides health guidance and leads expansion strategies globally. A medical doctor turned entrepreneur, he co-founded AIM Global with a vision to bring world-class health products to every household.', order: 1 },
      { name: 'Engr. Francis Miguel', initials: 'FM', role: 'Chief Finance Officer', title: 'Engr.', bio: 'Pioneering the corporate finance systems ensuring safe, fast commission payouts. He oversees the financial infrastructure that supports millions of distributors worldwide.', order: 2 },      { name: 'John Asperin', initials: 'JA', role: 'Chief Marketing Officer', title: 'Mr.', bio: 'Crafting marketing strategies and distribution pathways that engage millions. John leads global business development and has grown AIM Global into an international powerhouse.', order: 3 }
    ]);

    // 7. Seed Manufacturing Partners
    console.log('Seeding Manufacturing Partners...');
    await ManufacturingPartner.bulkCreate([
      { name: "Nature's Way", country: 'USA', description: 'Nutraceutical research & herbal production expertise. One of the world\'s leading manufacturers of natural health products.', order: 1 },
      { name: 'DSM', country: 'Europe', description: 'Science-based nutrition & lipid supplement solutions. A global leader in vitamins, carotenoids, and other micronutrients.', order: 2 },      { name: 'Weider', country: 'USA', description: 'Active nutrition & sports medicine manufacturing. Pioneer in sports supplements and health products since 1936.', order: 3 },
      { name: 'Natrol', country: 'USA', description: 'Premium brain health and sleep support supplements. Known for high-quality melatonin and cognitive health products.', order: 4 },
      { name: 'Robinson Pharma', country: 'USA', description: 'Contract manufacturer specializing in dietary supplements and nutraceuticals for global brands.', order: 5 }
    ]);

    // 8. Seed Testimonials
    console.log('Seeding Testimonials...');
    await Testimonial.bulkCreate([
      { name: 'David Kamara', lifestyleTag: 'African Lile', quote: 'Before I joined this business, I was working long hours every day and still struggling financially. I had big dreams for my family, but my salary was never enough to create the life I wanted. At first, I doubted network marketing because many people around me didn\'t understand it. But after staying consistent, learning new skills, and building my team step by step, everything started changing. Today, I earn more than I ever imagined, I support my family comfortably, and most importantly, I finally have hope and freedom for my future.', order: 1, active: true },
      { name: 'Jessica Miller', lifestyleTag: 'Western Lifestyle — Female', quote: 'I used to feel trapped in the corporate routine — waking up early, commuting every day, and living paycheck to paycheck despite having a good job. What attracted me to this opportunity was the flexibility and the possibility of building something for myself. It wasn\'t easy in the beginning, but the mentorship and supportive community helped me grow both financially and personally. Now I work from anywhere, spend more time with my children, and I finally feel in control of my life again.', order: 2, active: true },
      { name: 'Sarah Johnson', lifestyleTag: 'African Lifestyle — Female', quote: 'As a single mother, life was extremely difficult. I tried small businesses and side hustles, but nothing gave me stability. When a friend introduced me to network marketing, I was skeptical because I had failed in other things before. But I decided to give myself one more chance. Slowly, I started seeing results. The extra income helped me pay school fees, improve my home, and regain confidence in myself. This business didn\'t only change my finances — it changed my mindset completely.', order: 3, active: true },
      { name: 'Michael Anderson', lifestyleTag: 'Western Lifestyle — Male', quote: 'I spent years chasing promotions and overtime, believing that was the only path to success. The problem was that the more money I made, the less time I had for my family and personal life. Joining this business opened my eyes to another way of creating income. I learned how to build systems, work with people, and create leverage instead of trading hours for money. A few years later, I\'ve reduced my working hours dramatically and created a lifestyle I once thought was impossible.', order: 4, active: true },
      { name: 'Daniel Mensah', lifestyleTag: 'African Lifestyle — Young Professional', quote: 'After graduating from university, I believed finding a job would solve all my problems. But reality was different. Jobs were scarce, salaries were low, and opportunities felt limited. When I discovered this business, I saw ordinary people creating extraordinary results through teamwork and consistency. I decided to commit myself seriously. Today, I travel, meet ambitious people, and earn income that gives me confidence about my future. For the first time in my life, I feel like I am building something that truly belongs to me.', order: 5, active: true }
    ]);

    // 9. Seed Earning Streams
    console.log('Seeding Earning Streams...');
    await EarningStream.bulkCreate([
      {
        slug: 'drb',
        title: 'Direct Referral Bonus (DRB)',
        icon: '🤝',
        shortDescription: 'Earn a commission every time someone you personally introduce joins and activates a package.',        longDescription: 'The Direct Referral Bonus (DRB) is the commission you earn when someone joins the business through your personal invitation and activates a package under you. It is a reward for directly introducing new people to the opportunity. The amount depends on the package chosen — higher packages generate higher bonuses. There is no limit to the number of people you can refer, so the more active referrals you have, the greater your total potential earnings.',        order: 1,        active: true      },
      {
        slug: 'msb',
        title: 'Matched Sales Bonus (MSB) / Pairing Commission',
        icon: '🔁',
        shortDescription: 'Earn every time one person joins your left side and one joins your right side — automatically matched by the system.',
        longDescription: 'AIM Global uses a Binary Network System. When you register, you get two sides — left and right. Every time a new member joins your left and a new member joins your right, the system automatically detects this and issues you a Matched Sales Bonus (pairing). This process duplicates downwards infinitely. Even people you did not personally recruit can trigger pairings if they are placed in your organization. The global package gives 1 pair per match, up to 15 pairs for MegaVerse.',        order: 2,
        active: true
      },
      {
        slug: 'unilevel',
        title: 'Unilevel Commission (5%–10%)',
        icon: '📊',
        shortDescription: 'Earn 5% sponsor commission and 5% placement commission on product purchases by your downline up to 10 levels deep.',
        longDescription: 'Every time your downline purchases a product, you earn a 5% Sponsor Commission from your direct referrals and another 5% Placement Commission from your 1st up to 10th level in the organization. Each product is assigned a fixed commissional point which determines the 5% unilevel commission earned on every purchase. This system uses Dynamic Compression — if any level within your 10 levels is inactive, the next active level moves up, ensuring you never lose commissions to inactive distributors.',
        order: 3,
        active: true
      },
      {
        slug: 'stairstep',
        title: 'Stairstep ',icon: '',
        shortDescription: 'Earn additional commissions based on your rank — 10% for Silver Executive, 20% for Gold Executive, 30% for Global Ambassador.',
        longDescription: 'The Stairstep System rewards rank promotion through product reorders. This income is added to your Unilevel commission received monthly. Silver Executives earn an additional 10% stairstep commission. Gold Executives earn 20% additional. Global Ambassadors earn 30% additional. Ranks are achieved through group accumulation of positional points — no demotion, no pass-up, no time frame, no reversion.',
        order: 4,
        active: true
      },
      {
        slug: 'royalty',
        title: 'Royalty Bonus (2%)',
        icon: '👑',
        shortDescription: 'As a Global Ambassador, earn 2% rebates based on Group Reorder Points down to your 5th level Global Ambassador downlines.',
        longDescription: 'The Royalty Bonus is exclusively available to Global Ambassadors. You earn 2% rebates based on Group Reorder Points generated by your downlines who are also Global Ambassadors, up to 5 levels deep. This is a powerful passive income stream that rewards leadership development within your organization.',        order: 5,
        active: true
      },
      {
        slug: 'profit-sharing',
        title: 'Profit Sharing',
        icon: '🏦',
        shortDescription: 'Elite Global Ambassadors receive a share of company profits on a yearly basis based on specific rank and activity requirements.',
        longDescription: 'Profit Sharing is given to Elite Global Ambassadors on a yearly basis based on certain requirements set by the company. This represents one of the highest levels of recognition and reward in the AIM Global compensation system, reflecting the company\'s commitment to sharing its success with top-performing distributors.',        order: 6,
        active: true
      },
      {
        slug: 'upp',
        title: 'Uni Pay Plan (UPP)',
        icon: '💹',
        shortDescription: 'AIM Global\'s unilevel income system where distributors earn commissions from product purchases and reorders made by their downlines up to multiple levels deep.',
        longDescription: 'The Uni Pay Plan is AIM Global\'s unilevel income system where distributors earn commissions from product purchases and reorders made by their direct and indirect downlines up to multiple levels deep. The more active distributors and consumers in your organization, the bigger your monthly residual income. This system ensures that product sales across your entire network contribute to your monthly earnings.',        order: 7,
        active: true
      },
      {
        slug: 'retail',
        title: 'Retail Profit (25% Discount)',
        icon: '🛍️',
        shortDescription: 'Earn direct profit by purchasing products at distributor price (25% discount) and selling them at retail price to customers.',
        longDescription: 'Retail offers a 25% discount on all AIM Global products for distributors. This allows you to earn direct profit by purchasing products at the distributor price and selling them at the full retail price to customers. While the business is not focused primarily on retail selling, this provides an additional immediate income stream alongside the residual and network-based earnings.',
        order: 8,
        active: true
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

seed();
