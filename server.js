const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
	'<db_password>',
	process.env.DATABASE_PASSWORD,
);
console.log(DB);
mongoose.connect(DB).then(() => {
	console.log('DB connected succesfully!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`App running on port ${port}...`);
});
