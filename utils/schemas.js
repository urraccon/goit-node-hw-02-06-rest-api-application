import Joi from "joi";

export const contactSchema = Joi.object({
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

export const signupUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_+-]+$/, { name: "password" }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const userEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});
