import * as yup from 'yup';

export const inventoryCreateSchema = yup.object({
    user_id: yup.string().defined("All fields must be completed"),
    inventory_address: yup.string().optional(),
});
