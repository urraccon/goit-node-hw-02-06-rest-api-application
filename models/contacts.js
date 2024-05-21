import contacts from "./contacts.json" assert { type: "json" };
import { randomUUID } from "node:crypto";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contactsPath = `${__dirname}\\contacts.json`;

const listContacts = async () => {
  return contacts;
};

const getContactById = async (contactId) => {
  return contacts.find((contact) => contact.id === contactId);
};

const removeContact = async (contactId) => {
  const contactIndex = contacts.findIndex(
    (contact) => contact.id === contactId
  );

  if (contactIndex === -1) {
    return false;
  }

  contacts.splice(contactIndex, 1);
  const encodedContacts = JSON.stringify(contacts);
  writeFile(contactsPath, encodedContacts);

  return true;
};

const addContact = async (body) => {
  const newContact = {
    id: randomUUID(),
    ...body,
  };

  contacts.push(newContact);
  const encodedContacts = JSON.stringify(contacts);
  writeFile(contactsPath, encodedContacts);

  return newContact;
};

const updateContact = async (contactId, body) => {
  const contactIndex = contacts.findIndex(
    (contact) => contact.id === contactId
  );

  if (contactIndex === -1) {
    return false;
  }

  contacts[contactIndex] = {
    ...contacts[contactIndex],
    ...body,
  };

  const encodedContacts = JSON.stringify(contacts);
  writeFile(contactsPath, encodedContacts);

  return contacts[contactIndex];
};

const ContactsOperations = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};

export default ContactsOperations;
