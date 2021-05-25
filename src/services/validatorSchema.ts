import * as yup from 'yup';

export const inventoryItemSchema = yup.object({
    inventory_address: yup.string().typeError("inventory_address must be a string").defined("The inventory address must be provided, don't forget it ! "),
    item_id: yup.number().typeError("item_id must be a number").positive("The item_id must be a positive number.").defined("The item_id must be provided, don't forget it ! "),
    instance_number: yup.number().typeError("instance_number must be a number").positive("The instance number must be a positive number.").defined("The instance number must be provided, don't forget it ! "),
});

export const warehouseItemSchema = yup.object({
    available_quantity: yup.number().typeError("available_quantity must be a number").defined("The available quantity must be provided, don't forget it ! "),
    no_update_after: yup.string().typeError("available_quantity must be a number").optional(),
    item_id: yup.number().typeError("item_id must be a number").positive("The item_id must be a positive number.").defined("The item_id must be provided, don't forget it ! "),
    name: yup.string().typeError("name must be a string").defined("The name must be provided, don't forget it ! "),
    data: yup.object().typeError("data must be an object").defined("The data must be provided, don't forget it ! "),
    total_quantity: yup.number().typeError("total_quantity must be a number").defined("The total quantity must be provided, don't forget it ! "),
})