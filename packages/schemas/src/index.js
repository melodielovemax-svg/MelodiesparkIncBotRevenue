export const ProductSchema = {
  required: ['id', 'name', 'priceUSD', 'type'],
  properties: { id: { type: 'string' }, name: { type: 'string' }, priceUSD: { type: 'number' } }
};
export const RevenueLedgerEntrySchema = {
  required: ['id', 'orderId', 'amount', 'paymentVerifiedAt'],
  properties: { id: { type: 'string' }, amount: { type: 'number' } }
};
export function validate(data, schema) {
  const errors = [];
  for (const field of (schema.required || [])) {
    if (!data[field]) errors.push({ field, error: 'required' });
  }
  return { valid: errors.length === 0, errors };
}
