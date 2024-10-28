// Define a schema and model
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Create a new user
const newUser = new User({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
});

newUser.save()
  .then(user => console.log('User saved:', user))
  .catch(err => console.error('Error saving user:', err));
