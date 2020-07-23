import express from 'express';

import townhallRoutes from './townhalls';

const router = express.Router();

router.use('/townhalls/', townhallRoutes);

export default router;
