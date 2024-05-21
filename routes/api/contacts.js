import express from "express";
import ContactsOperations from "../../models/contacts.js";
import Joi from "joi";

const router = express.Router();

const STATUS_CODES = {
  ok: 200,
  internalServerError: 500,
  notFound: 404,
  created: 201,
  badRequest: 400,
};

const MESSAGES = {
  success: "The operation was successfully completed",
  error: "The operation failed because:",
  notFound: "Not found",
  missingFields: "One or more requested fields are missing",
  delete: "Contact deleted",
  missingField: "All fields are empty",
};

router.get("/", async (req, res, next) => {
  try {
    const contacts = await ContactsOperations.listContacts();

    res.status(STATUS_CODES.ok).json({
      message: MESSAGES.success,
      data: contacts,
    });
  } catch (error) {
    res.status(STATUS_CODES.internalServerError).json({
      message: `${MESSAGES.error} ${error.message}`,
    });
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const contact = await ContactsOperations.getContactById(contactId);

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
    res.status(STATUS_CODES.internalServerError).json({
      message: `${MESSAGES.error} ${error.message}`,
    });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const contact = req.body;
    const passedFieldsValidation = contactSchema.validate(contact);

    if (passedFieldsValidation.error) {
      res.status(STATUS_CODES.badRequest).json({
        message: passedFieldsValidation.error.details[0].message,
      });
      return;
    }

    const passedRequiredFields = allFieldsRequired(contact);

    if (!passedRequiredFields) {
      res.status(STATUS_CODES.badRequest).json({
        message: MESSAGES.missingFields,
      });
      return;
    }

    const createdContact = await ContactsOperations.addContact(contact);

    res.status(STATUS_CODES.created).json({
      message: MESSAGES.success,
      data: createdContact,
    });
  } catch (error) {
    res.status(STATUS_CODES.internalServerError).json({
      message: `${MESSAGES.error} ${error.message}`,
    });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const wasRemoved = await ContactsOperations.removeContact(contactId);

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
    res.status(STATUS_CODES.internalServerError).json({
      message: `${MESSAGES.error} ${error.message}`,
    });
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const changes = req.body;
    const passedFieldsValidation = contactSchema.validate(changes);

    if (passedFieldsValidation.error) {
      res.status(STATUS_CODES.badRequest).json({
        message: passedFieldsValidation.error.details[0].message,
      });
      return;
    }

    const passedRequiredFields = oneFieldRequired(changes);

    if (!passedRequiredFields) {
      res.status(STATUS_CODES.badRequest).json({
        message: MESSAGES.missingField,
      });
      return;
    }

    const changedContact = await ContactsOperations.updateContact(
      contactId,
      changes
    );

    if (!changedContact) {
      res.status(STATUS_CODES.notFound).json({
        message: MESSAGES.notFound,
      });
      return;
    }

    res.status(STATUS_CODES.ok).json({
      message: MESSAGES.success,
      data: changedContact,
    });
  } catch (error) {
    res.status(STATUS_CODES.internalServerError).json({
      message: `${MESSAGES.error} ${error.message}`,
    });
  }
});

// Validations

function allFieldsRequired(item) {
  if (!item?.name || !item?.email || !item?.phone) {
    return false;
  }

  return true;
}

function oneFieldRequired(item) {
  if (item?.name || item?.email || item?.phone) {
    return true;
  }

  return false;
}

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
});

export default router;
