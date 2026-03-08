import { z } from "zod";

export const extractionLineItemSchema = z.object({
  description: z.string(),
  hs_code: z.string().optional(),
  value: z.number().optional(),
  quantity: z.number().optional(),
  unit_price: z.number().optional(),
  total: z.number().optional(),
  discrepancy: z.object({
    expected: z.number(),
    actual: z.number(),
    item: z.string(),
    reportedAt: z.string(),
  }).optional(),
}).passthrough();

export const extractionDataSchema = z.object({
  invoice_number: z.string().optional(),
  date: z.string().optional(),
  invoice_date: z.string().optional(),
  vendor: z.object({ name: z.string(), address: z.string().optional() }).optional(),
  buyer: z.object({ name: z.string(), address: z.string().optional() }).optional(),
  total_amount: z.number().optional(),
  currency: z.string().optional(),
  line_items: z.array(extractionLineItemSchema).optional(),
  weights: z.object({ gross: z.string().optional(), net: z.string().optional() }).optional(),
  vendor_email: z.string().optional(),
  vendor_phone: z.string().optional(),
  claimDraft: z.string().optional(),
  lastUpdated: z.string().optional(),
}).passthrough();
