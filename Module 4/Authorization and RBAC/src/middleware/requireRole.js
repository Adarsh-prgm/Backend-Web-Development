// TODO: Implement the requireRole factory.
//
// requireRole(...allowedRoles) must RETURN an Express middleware that:
//
// 1. Responds 401 { error: { code: 'UNAUTHENTICATED', message: '...' } }
//    if req.user is missing (defensive — requireAuth should have set it).
//
// 2. Responds 403 { error: { code: 'FORBIDDEN', message: '...' } }
//    if req.user.role is NOT in allowedRoles.
//
// 3. Otherwise calls next().
//
// Read the role ONLY from req.user.role — never from req.body.
//
// Right now it lets everyone through, so the role gates do nothing.


function requireRole(...allowedRoles) {
  return (req, res, next) => {


    // requireAuth ran first, so req.user exists and is trusted
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required',
        },
      });
    }


    if (!allowedRoles.includes(req.user.role)) {
      // known user, wrong role → 403, not 401
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action',
        },
      });
    }


    next(); // role allowed — proceed
  };
}


module.exports = {
  requireRole,
};