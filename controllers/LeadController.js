const { Lead } = require('../models');

exports.createLead = async (req, res) => {
  try {
    const { fullName, email, phone, country, profileType, challenges, consent } = req.body;

    if (!req.owner) {
      return res.status(400).json({ message: 'Owner context missing for lead submission.' });
    }

    if (!fullName || !email || !country || !profileType) {
      return res.status(400).json({ message: 'Full name, email, country and profile type are required' });
    }

    if (!consent) {
      return res.status(400).json({ message: 'Consent is required to submit personal information' });
    }

    const lead = await Lead.create({
      fullName,
      email,
      phone,
      country,
      profileType,
      challenges: typeof challenges === 'object' ? JSON.stringify(challenges) : challenges,
      consent,
      status: 'Pending',
      ownerId: req.owner.id
    });

    res.status(201).json({
      message: 'Prospect captured successfully',
      lead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getAllLeads = async (req, res) => {
  try {
    const { country, status, profileType } = req.query;
    const where = { ownerId: req.user.ownerId };

    if (country) where.country = country;
    if (status) where.status = status;
    if (profileType) where.profileType = profileType;

    const leads = await Lead.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(leads);
  } catch (error) {
    console.error('Get all leads error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['Pending', 'Contacted', 'Joined', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Valid status required' });
    }

    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.status = status;
    await lead.save();

    res.json({ message: 'Lead status updated successfully', lead });
  } catch (error) {
    console.error('Update lead status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    await lead.destroy();
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
