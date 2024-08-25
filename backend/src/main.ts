import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for the specific origin
  app.enableCors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Allow cookies and other credentials
  });
  app.use(bodyParser.json({ limit: '50mb' }));  // Increase limit as needed
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  await app.listen(5000); // Ensure the correct port is specified
}
bootstrap();