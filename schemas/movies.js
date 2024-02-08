const z = require('zod') // This is a library to validate the request body.

const movieSchema = z.object({
  title: z.string({
    // we can add properties to the schema to customize the error messages.
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().min(1900).max(2024), // We can add more validations to one property.
  director: z.string(),
  duration: z.number().int().positive(),
  poster: z.string().url({
    message: 'Movie poster must be a valid URL'
  }),
  genre: z.array(
    // We can use an enum to validate that the genre is one of the allowed ones.
    z.enum(['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller']),
    { // We can also customize the error messages for the array.
      required_error: 'Movie genre is required',
      invalid_type_error: 'Movie genre must be an array of enmu Genre',
      invalid_enum_error: 'Movie genre must be one of the allowed ones'
    }),
  rate: z.number().min(0).max(10).default(5) // We can add a default value to a property, so now it's optional.
})

function validateMovie (input) {
  return movieSchema.safeParse(input)
}

function validatePartialMovie (input) {
  // Partial method validates a partial object, so all the properties are optional but the ones that are present are validated.
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
