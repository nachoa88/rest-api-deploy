const express = require('express') // Require is because we are using commonJS, import is for ES6 modules.
const crypto = require('node:crypto') // This is a built-in module to generate random ids.
const cors = require('cors') // This is a middleware to handle CORS.
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies') // We import the schema to validate the request body.

const app = express()
app.use(express.json()) // This is a middleware that parses the request body to JSON.
// CORS: We can use the cors middleware to handle CORS instead of doing it manually (npm install cors -E).
app.use(cors({
  origin: (origin, callback) => {
    // We can create a variable to store the accepted origins for the CORS policy.
    const ACCEPTED_ORIGINS = [
      'http://127.0.0.1:5500',
      'http://localhost:1234',
      'https://blablabla.com',
      'https://iap-dev.tech'
    ]
    // We check if the origin is in the accepted origins we return the callback with no error and true.
    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    // If there is no origin or if it's not present (request from the same origin don't have the origin header) we return the callback with no error and true.
    if (!origin) {
      return callback(null, true)
    }
    // Otherwise, we return the callback with an error.
    return callback(new Error('Not allowed by CORS'))
  }
}))
app.disable('x-powered-by')

// 1st Endpoint: GET ALL the MOVIES, movies are identified by the /movies path.
app.get('/movies', (req, res) => {
  // We can use this endpoint to filter also the movies by genre (or any other thing).
  const { genre } = req.query // From the request retrieve the genre query parameter.
  if (genre) { // If the genre parameter is present, filter the movies by genre.
    const filteredMovies = movies.filter(
      // We use some because the genre is an array and we want not to be case sensitive when filtering.
      (movie) => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  // If there is no other parameter as filter, return all the movies.
  return res.json(movies)
})

// 2nd Endpoint: GET a SINGLE MOVIE BY ID, movies are identified by the /movies/:id path.
app.get('/movies/:id', (req, res) => {
  const { id } = req.params // From the request retrieve the id parameter.
  // Find the movie with the same id as the one in the request.
  const movie = movies.find((movie) => movie.id === id)
  if (!movie) { // If the movie is not found, return a 404.
    return res.status(404).json({ message: 'Movie not found' })
  }
  return res.json(movie) // If the movie is found, return it.
})

// 3rd Endpoint: POST a NEW MOVIE, movies are identified by the /movies path.
app.post('/movies', (req, res) => {
  const result = validateMovie(req.body) // Validate the request body with the schema.

  if (!result.success) { // If the validation fails, return a 400 status code (Bad Request).
    // 422 unprocessable entity is maybe a better status code for validation errors.
    return res.status(400).json({ error: JSON.parse(result.error.message) }) // We parse the error message to return a JSON that is more readable.
  }

  const newMovie = {
    id: crypto.randomUUID(), // Generate a random id (uuid v4). UUID = Unic Universally Identifier.
    ...result.data // Spread the validated data from the request body.
  }

  // This is not REST because we're saving the data in memory, but it's just for the example.
  movies.push(newMovie)

  return res.status(201).json(newMovie) // Return the new movie with the 201 status code (Created).
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie Deleted' })
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(404).json({ error: JSON.parse(result.error.message) })
  }
  // We look for the id in the request params.
  const { id } = req.params
  // We look for the movie in the movies array with the same id.
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  // If the movie is not found, return a 404 status code (Not Found).
  if (movieIndex < 0) {
    return res.status(404).json({ message: 'Movie not found' })
  }
  // We update the movie with the data we had about the movie and the new data from the request body.
  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }
  // We update the movie in the movies array.
  movies[movieIndex] = updateMovie

  return res.json(updateMovie) // Return the updated movie.
})

const PORT = process.env.PORT ?? 3000 // We use the PORT environment variable if it's present, otherwise we use 3000.

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`)
})
