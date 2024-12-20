import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  GOOGLE_MAPS_API_KEY: z.string()
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) throw new Error('Invalid variables enviroments.')

export const env = _env.data