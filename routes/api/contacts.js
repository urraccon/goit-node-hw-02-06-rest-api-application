import express from "express";
import ContactsController from "../../controller/contacts-controller.js";
import { MESSAGES, STATUS_CODES } from "../../utils/constants.js";
import { contactSchema } from "../../utils/schemas.js";
import {
  allFieldsRequired,
  favoriteFieldRequired,
  oneFieldRequired,
} from "../../utils/validations.js";
import UsersController from "../../controller/users-controller.js";
import "../../passport.js";

const router = express.Router();

router.get("/", UsersController.validateToken, async (req, res, next) => {
  try {
    const contacts = await ContactsController.listContacts();

    res.status(STATUS_CODES.ok).json({
      message: MESSAGES.success,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:contactId",
  UsersController.validateToken,
  async (req, res, next) => {
    try {
      const contactId = req.params.contactId;
      const contact = await ContactsController.getContactById(contactId);

      if (!contact) {
        return res.status(STATUS_CODES.notFound).json({
          message: MESSAGES.notFound,
        });
      }

      res.status(STATUS_CODES.ok).json({
        message: MESSAGES.success,
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/", UsersController.validateToken, async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = contactSchema.validate(body);

    if (error) {
      return res.status(STATUS_CODES.badRequest).json({
        message: error.details[0].message,
      });
    }

    const passedValidation = allFieldsRequired(body);

    if (!passedValidation) {
      return res.status(STATUS_CODES.badRequest).json({
        message: MESSAGES.missingFields,
      });
    }

    const createdContact = await ContactsController.addContact(body);

    res.status(STATUS_CODES.created).json({
      message: MESSAGES.success,
      data: createdContact,
    });
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/:contactId",
  UsersController.validateToken,
  async (req, res, next) => {
    try {
      const contactId = req.params.contactId;
      const wasRemoved = await ContactsController.removeContact(contactId);

      if (!wasRemoved) {
        return res.status(STATUS_CODES.notFound).json({
          message: MESSAGES.notFound,
        });
      }

      res.status(STATUS_CODES.ok).json({
        message: MESSAGES.delete,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:contactId",
  UsersController.validateToken,
  async (req, res, next) => {
    try {
      const contactId = req.params.contactId;
      const body = req.body;
      const { error } = contactSchema.validate(body);

      if (error) {
        return res.status(STATUS_CODES.badRequest).json({
          message: error.details[0].message,
        });
      }

      const passedValidation = oneFieldRequired(body);

      if (!passedValidation) {
        return res.status(STATUS_CODES.badRequest).json({
          message: MESSAGES.emptyBody,
        });
      }

      const wasModified = await ContactsController.updateContact(
        contactId,
        body
      );

      if (!wasModified) {
        return res.status(STATUS_CODES.notFound).json({
          message: MESSAGES.notFound,
        });
      }

      const modifiedContact = await ContactsController.getContactById(
        contactId
      );

      res.status(STATUS_CODES.ok).json({
        message: MESSAGES.success,
        data: modifiedContact,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:contactId/favorite",
  UsersController.validateToken,
  async (req, res, next) => {
    try {
      const contactId = req.params.contactId;
      const body = req.body;
      const { error } = contactSchema.validate(body);

      if (error) {
        return res.status(STATUS_CODES.badRequest).json({
          message: error.details[0].message,
        });
      }

      const passedValidation = favoriteFieldRequired(body);

      if (!passedValidation) {
        return res.status(STATUS_CODES.badRequest).json({
          message: MESSAGES.missingFavoriteField,
        });
      }

      const wasModified = await ContactsController.updateFavoriteStatus(
        contactId,
        body
      );

      if (!wasModified) {
        return res.status(STATUS_CODES.notFound).json({
          message: MESSAGES.notFound,
        });
      }

      const modifiedContact = await ContactsController.getContactById(
        contactId
      );

      res.status(STATUS_CODES.ok).json({
        message: MESSAGES.success,
        data: modifiedContact,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
