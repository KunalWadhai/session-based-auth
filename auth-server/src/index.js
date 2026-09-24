import app from './app.js';
import { PORT } from './constants.js';
import connectMongoDb from './config/DBConnection.js';

async function startServer() {
    await connectMongoDb();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}...`);
    });
}

await startServer();