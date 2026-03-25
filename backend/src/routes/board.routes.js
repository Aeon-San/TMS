import express from 'express';
import {
  createBoard,
  getUserBoards,
  getBoard,
  inviteUserToBoard,
  acceptInvitation,
  declineInvitation,
  getUserInvitations,
} from '../controllers/board.controller.js';
import { authCheck } from '../middleware/authCheck.js';
import validateRequest from '../middleware/validateRequest.js';
import { validateBoardInvite, validateBoardPayload } from '../validators/board.validators.js';

const router = express.Router();

router.use(authCheck);

router.post('/', validateRequest(validateBoardPayload), createBoard);
router.get('/', getUserBoards);
router.get('/invitations', getUserInvitations);
router.post('/invitations/:invitationId/accept', acceptInvitation);
router.post('/invitations/:invitationId/decline', declineInvitation);
router.get('/:boardId', getBoard);
router.post('/:boardId/invite', validateRequest(validateBoardInvite), inviteUserToBoard);

export default router;
