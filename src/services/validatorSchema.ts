import * as yup from 'yup';

export const inventoryItemSchema = yup.object({
    inventory_address: yup.string().typeError("inventory_address must be a string").defined("The inventory address must be provided, don't forget it ! "),
    item_id: yup.number().typeError("item_id must be a number").positive("The item_id must be a positive number.").defined("The item_id must be provided, don't forget it ! "),
    instance_number: yup.number().typeError("instance_number must be a number").positive("The instance number must be a positive number.").defined("The instance number must be provided, don't forget it ! "),
});
