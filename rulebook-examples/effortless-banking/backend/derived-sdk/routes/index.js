import { Router } from 'express';
import usersRouter from './users.js';
import businessesRouter from './businesses.js';
import beneficialOwnersRouter from './beneficial_owners.js';
import contactsRouter from './contacts.js';
import accountsRouter from './accounts.js';
import loansRouter from './loans.js';
import covenantsRouter from './covenants.js';
import riskRatingHistoryRouter from './risk_rating_history.js';
import documentsRouter from './documents.js';
import interactionsRouter from './interactions.js';
import constraintsRouter from './constraints.js';
import __meta__Router from './__meta__.js';

const router = Router();
router.use('/users', usersRouter);
router.use('/businesses', businessesRouter);
router.use('/beneficial_owners', beneficialOwnersRouter);
router.use('/contacts', contactsRouter);
router.use('/accounts', accountsRouter);
router.use('/loans', loansRouter);
router.use('/covenants', covenantsRouter);
router.use('/risk_rating_history', riskRatingHistoryRouter);
router.use('/documents', documentsRouter);
router.use('/interactions', interactionsRouter);
router.use('/constraints', constraintsRouter);
router.use('/__meta__', __meta__Router);

export default router;
