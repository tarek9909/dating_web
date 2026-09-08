import { Router } from 'express';
import { z } from 'zod';
import { customerController } from './customer.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';
import { requireInvitationOwnership } from '../../middleware/ownership.js';
import { validate } from '../../middleware/validate.js';
import { uploadMediaMiddleware } from '../../middleware/upload.js';

const router = Router();

// Protect all customer routes with authentication and role check
router.use(requireAuth);
router.use(requireRole('customer', 'admin'));

// Validation Schemas
const updateInvitationSchema = z.object({
  recipientName: z.string().min(1).max(150).optional(),
  dateType: z.enum(['exact', 'tomorrow', 'custom_text', 'tbd']).optional(),
  scheduleMode: z.enum(['strict', 'picker']).optional(),
  dateValue: z.string().optional().nullable(),
  dateText: z.string().max(255).optional(),
  timeValue: z.string().max(8).optional(),
  timezone: z.string().max(100).optional(),
  dressCode: z.string().max(150).optional(),
  dressCodeText: z.string().optional(),
  internalTitle: z.string().max(255).optional(),
});

const updateContentSchema = z.object({
  opening_text: z.string().optional(),
  question_text: z.string().optional(),
  yes_button_text: z.string().max(150).optional(),
  no_button_text: z.string().max(150).optional(),
  no_phrase_1: z.string().optional(),
  no_phrase_2: z.string().optional(),
  no_phrase_3: z.string().optional(),
  angry_title: z.string().max(255).optional(),
  angry_message: z.string().optional(),
  angry_button: z.string().max(150).optional(),
  location_title: z.string().max(255).optional(),
  location_subtitle: z.string().optional(),
  category_type: z.string().max(50).optional(),
  food_title: z.string().max(255).optional(),
  food_subtitle: z.string().optional(),
  when_title: z.string().max(255).optional(),
  when_subtitle: z.string().optional(),
  dress_code_title: z.string().max(255).optional(),
  dress_code_subtitle: z.string().optional(),
  dress_code_checklist: z.union([z.array(z.string()), z.string()]).optional(),
  opening_gif: z.string().nullable().optional(),
  angry_gif: z.string().nullable().optional(),
  when_gif: z.string().nullable().optional(),
  dress_gif: z.string().nullable().optional(),
  final_gif: z.string().nullable().optional(),
  final_title: z.string().max(255).optional(),
  final_message: z.string().optional(),
});

const applyTemplateSchema = z.object({
  templateId: z.number().int().positive(),
  mode: z.enum(['theme_only', 'full']).default('theme_only'),
});

const setLocationsSchema = z.object({
  locationIds: z.array(z.number().int().positive()),
});

const setFoodOptionsSchema = z.object({
  foodOptionIds: z.array(z.number().int().positive()),
});

const assignMediaSchema = z.object({
  mediaAssetId: z.number().int().positive(),
});

// Dashboard & Invitations
router.get('/dashboard', customerController.getDashboard);
router.get('/invitations', customerController.getInvitations);
router.get('/invitations/:publicId', requireInvitationOwnership, customerController.getInvitation);
router.patch('/invitations/:publicId', requireInvitationOwnership, validate(updateInvitationSchema), customerController.updateInvitation);

// Content
router.get('/invitations/:publicId/content', requireInvitationOwnership, customerController.getContent);
router.patch('/invitations/:publicId/content', requireInvitationOwnership, validate(updateContentSchema), customerController.updateContent);

// Template
router.put('/invitations/:publicId/template', requireInvitationOwnership, validate(applyTemplateSchema), customerController.applyTemplate);

// Locations & Food
router.get('/invitations/:publicId/locations', requireInvitationOwnership, customerController.getLocations);
router.put('/invitations/:publicId/locations', requireInvitationOwnership, validate(setLocationsSchema), customerController.setLocations);
router.patch('/invitations/:publicId/custom-locations', requireInvitationOwnership, customerController.updateCustomLocations);
router.get('/invitations/:publicId/food-options', requireInvitationOwnership, customerController.getFoodOptions);
router.put('/invitations/:publicId/food-options', requireInvitationOwnership, validate(setFoodOptionsSchema), customerController.setFoodOptions);
router.patch('/invitations/:publicId/custom-options', requireInvitationOwnership, customerController.updateCustomOptions);

// Media
router.post('/invitations/:publicId/media', requireInvitationOwnership, uploadMediaMiddleware.single('file'), customerController.uploadMedia);
router.put('/invitations/:publicId/media/:slot', requireInvitationOwnership, validate(assignMediaSchema), customerController.assignMediaSlot);
router.delete('/invitations/:publicId/media/:slot', requireInvitationOwnership, customerController.removeMediaSlot);

// Preview, Publish, Analytics
router.get('/invitations/:publicId/preview', requireInvitationOwnership, customerController.preview);
router.post('/invitations/:publicId/publish', requireInvitationOwnership, customerController.publish);
router.post('/invitations/:publicId/unpublish', requireInvitationOwnership, customerController.unpublish);
router.get('/invitations/:publicId/analytics', requireInvitationOwnership, customerController.getAnalytics);

// Global Catalog Reads
router.get('/templates', customerController.getTemplates);
router.get('/themes', customerController.getThemes);
router.get('/locations', customerController.getLocationsCatalog || customerController.getLocations);
router.get('/food-options', customerController.getFoodOptionsCatalog || customerController.getFoodOptions);
router.get('/gifs', customerController.getGifs);

export default router;
