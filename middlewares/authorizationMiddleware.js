const authorizationMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (requiredRole === 'admin' && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    next();
  };
};

module.exports = authorizationMiddleware;
