# SaajhaMandi Backend API

A comprehensive Node.js backend API for the SaajhaMandi AI Market Partner application, designed to help street vendors with AI-powered recommendations, price forecasting, wholesaler matching, and order management.

## 🚀 Features

- **Authentication System**: JWT-based authentication with secure user registration and login
- **AI Recommendations**: Smart product recommendations based on market trends and user preferences
- **Price Forecasting**: AI-powered price predictions for various products across different cities
- **Wholesaler Matching**: Intelligent matching of vendors with suitable wholesalers
- **Deal Management**: Group buying deals and flash sales management
- **Order Management**: Complete order lifecycle management with real-time status updates
- **Security**: Rate limiting, CORS protection, and input validation

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi
- **Password Hashing**: bcryptjs

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/saajha_mandi

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# API Keys (Replace with actual keys)
OPENAI_API_KEY=your_openai_api_key_here
WEATHER_API_KEY=your_weather_api_key_here

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+91 9876543210",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "phoneOrEmail": "+91 9876543210",
  "password": "securepassword"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### Recommendations Endpoints

#### Get AI Recommendations
```http
GET /api/recommendations?category=vegetables&limit=5
Authorization: Bearer <jwt_token>
```

#### Get Recommendation Details
```http
GET /api/recommendations/:id
Authorization: Bearer <jwt_token>
```

### Price Forecast Endpoints

#### Get Price Forecast
```http
POST /api/forecast
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "item": "Tomatoes",
  "city": "Delhi"
}
```

#### Get Price History
```http
GET /api/forecast/history/tomatoes/delhi?days=30
Authorization: Bearer <jwt_token>
```

### Wholesaler Matching Endpoints

#### Match Wholesalers
```http
POST /api/match-wholesalers
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "items": ["Tomatoes", "Onions", "Rice"]
}
```

#### Get Wholesaler Details
```http
GET /api/match-wholesalers/:id
Authorization: Bearer <jwt_token>
```

### Deals Endpoints

#### Get Active Deals
```http
GET /api/deals?category=vegetables&city=Delhi&limit=10
Authorization: Bearer <jwt_token>
```

#### Get Deal Details
```http
GET /api/deals/:id
Authorization: Bearer <jwt_token>
```

#### Join Deal
```http
POST /api/deals/:id/join
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "quantity": 2
}
```

### Orders Endpoints

#### Get User Orders
```http
GET /api/orders/my-orders?status=Processing&limit=20&page=1
Authorization: Bearer <jwt_token>
```

#### Create Order
```http
POST /api/orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "items": [
    {
      "name": "Tomatoes",
      "quantity": "5kg",
      "price": "₹150"
    }
  ],
  "total": 150,
  "deliveryAddress": {
    "name": "John Doe",
    "phone": "+91 9876543210",
    "address": "123 Main St, Delhi",
    "city": "Delhi",
    "pincode": "110001"
  },
  "paymentMethod": "upi"
}
```

#### Get Order Details
```http
GET /api/orders/:orderId
Authorization: Bearer <jwt_token>
```

#### Cancel Order
```http
DELETE /api/orders/:orderId
Authorization: Bearer <jwt_token>
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse with configurable limits
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Joi-based request validation
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Helmet**: Security headers for Express applications

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  phone: String (required, unique),
  email: String (optional, unique),
  password: String (required, hashed),
  businessName: String (optional),
  address: Object,
  preferences: Object,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  orderId: String (unique),
  userId: ObjectId (ref: User),
  items: Array,
  total: Number,
  status: String (enum),
  supplier: Object,
  deliveryAddress: Object,
  paymentMethod: String,
  paymentStatus: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚦 Error Handling

The API uses consistent error response format:

```json
{
  "error": "Error Type",
  "message": "Human readable error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `409`: Conflict
- `429`: Too Many Requests
- `500`: Internal Server Error

## 🧪 Development Features

- **Mock Data**: Comprehensive mock data for development and testing
- **Graceful Fallbacks**: API works even when database is unavailable
- **Detailed Logging**: Comprehensive error logging and debugging information
- **Hot Reload**: Nodemon for development with automatic restarts

## 📈 Performance Considerations

- **Database Indexing**: Optimized queries with proper indexing
- **Rate Limiting**: Prevents API abuse and ensures fair usage
- **Pagination**: Efficient data loading with pagination support
- **Caching**: Ready for Redis integration for improved performance

## 🔄 API Versioning

Current API version: `v1`
All endpoints are prefixed with `/api/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

---

**SaajhaMandi Backend API** - Empowering street vendors with AI-powered market intelligence.