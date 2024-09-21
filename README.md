# JWT Authentication API with Node.js, Express, and TypeScript

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-4.18.3-blue?style=for-the-badge" alt="Express">
  <img src="https://img.shields.io/badge/Typescript-5.4.2-blue?style=for-the-badge" alt="Typescript">
  <img src="https://img.shields.io/badge/JWT-9.0.2-orange?style=for-the-badge" alt="JWT">
</p>

## About The Project

This repository implements full JWT-based authentication using Node.js, Express, and TypeScript. It provides features for user registration, activation, login, access token refresh, password reset, and more. Authentication and route protection are handled through JSON Web Tokens (JWT), offering a secure and scalable solution.

### Key Features:

- User Registration with Email Activation
- Login and Logout
- JWT-based Access Token and Refresh Token Mechanism
- Password Reset via Email
- User Info and Profile Update
- Secure Routes with JWT Authentication Middleware

### Routes Overview

| Method | Endpoint                     | Description                             | Auth Required |
| ------ | ---------------------------- | --------------------------------------- | ------------- |
| POST   | `/registration`              | Registers a new user                    | No            |
| POST   | `/activate-user`             | Activates a newly registered user       | No            |
| POST   | `/login`                     | Logs in a user                          | No            |
| GET    | `/logout`                    | Logs out a user                         | Yes           |
| GET    | `/refresh`                   | Refreshes the access token              | No            |
| GET    | `/me`                        | Fetches user information                | Yes           |
| PUT    | `/update-user-info`          | Updates the user’s information          | Yes           |
| PUT    | `/change-password`           | Changes the user’s password             | Yes           |
| POST   | `/reset-password-link`       | Sends a password reset link to the user | No            |
| POST   | `/reset-password/:id/:token` | Resets the user’s password using token  | No            |



## Built With

This project was developed using the following technologies:

- ![Node.js][Node.js-icon]
- ![Express.js][Express.js-icon]
- ![TypeScript][TypeScript-icon]
- ![JWT][JWT-icon]
- ![MongoDB][MongoDB-icon]
- ![Mongoose][Mongoose-icon]
- ![Nodemailer][Nodemailer-icon]
- ![Cloudinary][Cloudinary-icon]



## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js 18.x](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/deepak-raaaz/express-jwt-auth.git
   cd jwt-auth
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:

   ```bash
   PORT=8080
   ORIGIN=['http://localhost:8080/']
   NODE_ENV=development
   DB_URL=your_db_url
   CLOUD_NAME=your_cloud_name
   CLOUD_API_KEY=your_cloud_api_key
   CLOUD_SECRET_KEY=your_cloud_secret_key
   REDIS_URL=your_redis_url
   ACTIVATION_SECRET=your_activation_secret_code
   ACCESS_TOKEN=your_access_token
   REFRESH_TOKEN=your_refresh_token
   ACCESS_TOKEN_EXPIRE=5
   REFRESH_TOKEN_EXPIRE=60
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   ```

4. Build the project:

   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm run start
   ```


## Usage

### Running in Development Mode

You can run the project in development mode using the following command:

```bash
npm run dev
```

This will use `ts-node-dev` for live reload and faster development.

### API Testing

Use tools like Postman or cURL to test the API endpoints. Make sure to provide valid JWT tokens for protected routes.

### Example Request (Login)

```bash
POST /login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Example Request (Protected Route)

```bash
GET /me
Authorization: Bearer <access-token>
```


## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.



## License

Distributed under the ISC License. See `LICENSE` for more information.



## Contact

Deepak Kumar - [deepakjamui26@gmail.com](mailto:deepakjamui26@gmail.com)

GitHub: [https://github.com/deepak-raaaz](https://github.com/deepak-raaaz)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/deepak-raaaz/
[Node.js-icon]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[Express.js-icon]: https://img.shields.io/badge/express.js-404D59?style=for-the-badge
[TypeScript-icon]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[JWT-icon]: https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens
[MongoDB-icon]: https://img.shields.io/badge/mongodb-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white
[Mongoose-icon]: https://img.shields.io/badge/mongoose-880000?style=for-the-badge
[Nodemailer-icon]: https://img.shields.io/badge/nodemailer-%23008080.svg?style=for-the-badge&logo=nodemailer&logoColor=white
[Cloudinary-icon]: https://img.shields.io/badge/cloudinary-3378FF?style=for-the-badge&logo=cloudinary&logoColor=white
