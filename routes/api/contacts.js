import express from "express";
import Joi from "joi";
import ContactsController from "../../controller/contacts-controller.js";

const router = express.Router();

const STATUS_CODES = {
  ok: 200,
  notFound: 404,
  created: 201,
  badRequest: 400,
};

const MESSAGES = {
  success: "The operation was successfully completed",
  notFound: "Not found",
  missingFields: "One or more requested fields are missing",
  delete: "Contact deleted",
  emptyBody: "The body of the request is empty",
  missingFavoriteField: "Missing favorite field",
};

router.get("/", async (req, res, next) => {
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

router.get("/:contactId", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const contact = await ContactsController.getContactById(contactId);

    if (!contact) {
      res.status(STATUS_CODES.notFound).json({
        message: MESSAGES.notFound,
      });
      return;
    }

    res.status(STATUS_CODES.ok).json({
      message: MESSAGES.success,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = contactSchema.validate(body);

    if (error) {
      res.status(STATUS_CODES.badRequest).json({
        message: error.details[0].message,
      });
      return;
    }

    const passedValidation = allFieldsRequired(body);

    if (!passedValidation) {
      res.status(STATUS_CODES.badRequest).json({
        message: MESSAGES.missingFields,
      });
      return;
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

router.delete("/:contactId", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const wasRemoved = await ContactsController.removeContact(contactId);

    if (!wasRemoved) {
      res.status(STATUS_CODES.notFound).json({
        message: MESSAGES.notFound,
      });
      return;
    }

    res.status(STATUS_CODES.ok).json({
      message: MESSAGES.delete,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const body = req.body;
    const { error } = contactSchema.validate(body);

    if (error) {
      res.status(STATUS_CODES.badRequest).json({
        message: error.details[0].message,
      });
      return;
    }

    const passedValidation = oneFieldRequired(body);

    if (!passedValidation) {
      res.status(STATUS_CODES.badRequest).json({
        message: MESSAGES.emptyBody,
      });
      return;
    }

    const wasModified = await ContactsController.updateContact(contactId, body);

    if (!wasModified) {
      res.status(STATUS_CODES.notFound).json({
        message: MESSAGES.notFound,
      });
      return;
    }

    const modifiedContact = await ContactsController.getContactById(contactId);

    res.status(STATUS_CODES.ok).json({
      message: MESSAGES.success,
      data: modifiedContact,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const body = req.body;
    const { error } = contactSchema.validate(body);

    if (error) {
      res.status(STATUS_CODES.badRequest).json({
        message: error.details[0].message,
      });
    }

    const passedValidation = favoriteFieldRequired(body);

    if (!passedValidation) {
      res.status(STATUS_CODES.badRequest).json({
        message: MESSAGES.missingFavoriteField,
      });
    }

    const wasModified = await ContactsController.updateFavoriteStatus(
      contactId,
      body
    );

    if (!wasModified) {
      res.status(STATUS_CODES.notFound).json({
        message: MESSAGES.notFound,
      });
    }

    const modifiedContact = await ContactsController.getContactById(contactId);

    res.status(STATUS_CODES.ok).json({
      message: MESSAGES.success,
      data: modifiedContact,
    });
  } catch (error) {
    next(error);
  }
});

// Validations

function allFieldsRequired(body) {
  if (!body?.name || !body?.email || !body?.phone) {
    return false;
  }

  return true;
}

function oneFieldRequired(body) {
  if (body?.name || body?.email || body?.phone) {
    return true;
  }

  return false;
}

function favoriteFieldRequired(body) {
  if (body?.favorite) {
    return true;
  }

  return false;
}

// Schema

const contactSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z\s-]+$/, { name: "name" })
    .min(3)
    .max(30),
  email: Joi.string().email(),
  phone: Joi.string()
    .pattern(/^[\d+()\-\s]+$/, { name: "phone" })
    .min(3)
    .max(20),
  favorite: Joi.boolean(),
});

export default router;
