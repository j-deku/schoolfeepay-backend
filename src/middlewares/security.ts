// middlewares/security.js
import helmet from 'helmet';

const securityMiddleware = helmet({
     crossOriginResourcePolicy: { policy: "cross-origin" },
});

export default securityMiddleware;