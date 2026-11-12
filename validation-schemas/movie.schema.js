const { z } = require("zod");

const parseList = (v) => {
  if (v === undefined || v === null) return undefined;
  if (Array.isArray(v)) return v;
  const s = String(v).trim();
  if (s.startsWith("[")) {
    try {
      return JSON.parse(s);
    } catch {
      return v;
    }
  }
  return s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];
};

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid actor id");

const movieSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  year: z.coerce.number({ message: "Year is required" }).int().min(1888, "Invalid year").max(2100, "Invalid year"),
  director: z.string().trim().min(1, "Director is required").max(100),
  genres: z.preprocess(parseList, z.array(z.string().trim().min(1)).min(1, "At least one genre is required")),
  trailerLink: z.string().trim().url("Enter a valid link").max(500),
  description: z.string().trim().min(1, "Description is required").max(5000),
  actors: z.preprocess(parseList, z.array(objectId).optional()),
});

const movieUpdateSchema = movieSchema.partial();

const actorsOnlySchema = z.object({
  actors: z.preprocess(parseList, z.array(objectId)),
});

module.exports = { movieSchema, movieUpdateSchema, actorsOnlySchema };