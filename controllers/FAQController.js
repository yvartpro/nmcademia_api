const { FAQ } = require('../models');
const { Op } = require('sequelize');

exports.getAllFAQs = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { question: { [Op.like]: `%${search}%` } },
        { answer: { [Op.like]: `%${search}%` } }
      ];
    }

    const faqs = await FAQ.findAll({
      where,
      order: [['order', 'ASC'], ['createdAt', 'ASC']]
    });

    res.json(faqs);
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, order, category } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const faq = await FAQ.create({
      question,
      answer,
      order,
      category
    });

    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    const { question, answer, order, category } = req.body;
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });

    await faq.update({
      question,
      answer,
      order,
      category
    });

    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    await faq.destroy();
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
