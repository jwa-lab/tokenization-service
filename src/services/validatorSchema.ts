import * as yup from "yup";

export const inventoryItemSchema = yup.object({
    inventory_address: yup
        .string()
        .strict()
        .typeError("inventory_address must be a string.")
        .defined("The inventory_address (string) must be provided."),
    item_id: yup
        .number()
        .typeError("item_id must be a number.")
        .positive("item_id must be a positive number.")
        .defined("The item_id (integer) must be provided."),
    instance_number: yup
        .number()
        .typeError("instance_number must be a number.")
        .positive("instance number must be a positive number.")
        .defined("The instance_number (integer) must be provided.")
});

export const warehouseItemSchema = yup.object({
    available_quantity: yup
        .number()
        .typeError("available_quantity must be a number.")
        .defined("The available_quantity (integer) must be provided."),
    no_update_after: yup
        .string()
        .strict()
        .typeError("available_quantity must be a number.")
        .optional(),
    item_id: yup
        .number()
        .typeError("item_id must be a number.")
        .positive("item_id must be a positive number.")
        .defined("The item_id (integer) must be provided."),
    name: yup
        .string()
        .strict()
        .typeError("name must be a string.")
        .defined("The name (string) must be provided."),
    data: yup
        .object()
        .typeError("data must be an object.")
        .defined("The data (object with string value(s)) must be provided."),
    total_quantity: yup
        .number()
        .typeError("total_quantity must be a number.")
        .defined("The total_quantity (integer) must be provided.")
});
