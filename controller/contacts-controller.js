import Contact from "../models/contacts.js";

async function listContacts() {
  return Contact.find();
}

async function getContactById(contactId) {
  return Contact.findById(contactId);
}

async function addContact(body) {
  return Contact.create(body);
}

async function removeContact(contactId) {
  return Contact.findByIdAndDelete(contactId);
}

async function updateContact(contactId, body) {
  return Contact.findByIdAndUpdate(contactId, body);
}

async function updateFavoriteStatus(contactId, body) {
  return Contact.findByIdAndUpdate(contactId, body);
}

const ContactsController = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateFavoriteStatus,
};

export default ContactsController;
