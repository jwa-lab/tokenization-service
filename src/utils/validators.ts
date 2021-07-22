import * as yup from "yup";

export const itemIdValidator = yup
    .number()
    .strict()
    .typeError("item_id must be an integer.")
    .min(0)
    .defined("The item_id (positive integer) must be provided.");

export const inventoryIdValidator = yup
    .string()
    .strict()
    .typeError("inventory_item_id must be a string.")
    .defined("The inventory_item_id (string) must be provided.");

export const userIdValidator = yup
    .string()
    .strict()
    .typeError("user_id must be a string.")
    .defined("The user_id (string) must be provided.");
