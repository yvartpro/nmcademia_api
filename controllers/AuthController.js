const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password';
const hashedPass = bcrypt.hashSync(ADMIN_PASS, 10);

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    if (username !== ADMIN_USER) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, hashedPass);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username: ADMIN_USER, role: 'admin' },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
