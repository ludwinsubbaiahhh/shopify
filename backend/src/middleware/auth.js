import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token
 */
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware to ensure tenant context
 */
export const requireTenant = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || req.body.tenantId || req.query.tenantId;
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  req.tenantId = tenantId;
  next();
};

