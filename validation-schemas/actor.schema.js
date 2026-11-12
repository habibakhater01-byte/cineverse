const { z } = require("zod");

// multipart forms send "" for empty fields, treat it as "not provided"
const emptyToUndefined = (v) => (v === "" ? undefined : v);

const actorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  birthdate: z.preprocess(emptyToUndefined, z.coerce.date({ message: "Invalid date" }).optional()),
});

const actorUpdateSchema = actorSchema.partial();

module.exports = { actorSchema, actorUpdateSchema };