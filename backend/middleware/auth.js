const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password_hash');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token. User not found.'
        });
      }

      if (!user.active) {
        return res.status(401).json({
          success: false,
          error: 'Account has been deactivated.'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token has expired.'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error in authentication.'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password_hash');

      if (user && user.active) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (jwtError) {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

const requireSubscription = (minTier = 'basic') => {
  const tierLevels = {
    'basic': 1,
    'premium': 2,
    'elite': 3
  };

  const requiredLevel = tierLevels[minTier];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    if (req.user.subscription_tier === 'none' || req.user.subscription_status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Active subscription required.'
      });
    }

    const userLevel = tierLevels[req.user.subscription_tier] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        error: `${minTier.charAt(0).toUpperCase() + minTier.slice(1)} subscription required.`
      });
    }

    if (req.user.subscription_end_date && req.user.subscription_end_date < new Date()) {
      return res.status(403).json({
        success: false,
        error: 'Subscription has expired.'
      });
    }

    next();
  };
};

const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.'
    });
  }

  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      error: 'Email verification required. Please check your email.'
    });
  }

  next();
};

const requireStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.'
    });
  }

  if (!['staff', 'admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Staff privileges required.'
    });
  }

  next();
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  authMiddleware,
  optionalAuth,
  requireSubscription,
  requireEmailVerification,
  requireStaff,
  generateTokens,
  verifyRefreshToken
};