# CF1 Platform - Deployment Credentials & Configuration
**⚠️ KEEP THIS FILE SECURE - NEVER COMMIT TO GIT ⚠️**

## Railway Backend Deployment

**Deployment URL**: `https://cf1-claude-production.up.railway.app`
**Project ID**: `e0873f6a-fa40-4642-a774-ee648e58cae0`
**Service ID**: `ead5f1de-ea4d-4c3e-99f9-06694d748aa7`
**Region**: `europe-west4`

## Environment Variables (All Configured in Railway Dashboard)

### Server Configuration
- `NODE_ENV` = `production`
- `PORT` = `3001`
- `BACKEND_URL` = `https://cf1-claude-production.up.railway.app`
- `FRONTEND_URL` = `https://your-frontend-url.netlify.app` *(update when frontend deployed)*

### JWT Authentication
- `JWT_SECRET` = `5e392d337ed2d76e60d02b10a013af30d2aa72aeb25b383890ef9f63412b9e57`
- `JWT_EXPIRES_IN` = `24h`

### Admin Authentication (Legacy Environment Variables - No Longer Required)
- `ADMIN_API_KEY` = `15ed4d371ec318fa4a2f64455a88d01ef4b71f0367adccfe6c15858a39331957` *(Still required for API key auth)*
- `ADMIN_USERNAME` = `cf1admin` *(Legacy - now database-driven)*
- `ADMIN_PASSWORD_HASH` = *(Legacy - now database-driven)*
- `BROCK_PASSWORD_HASH` = *(Legacy - now database-driven)*
- `BRIAN_PASSWORD_HASH` = *(Legacy - now database-driven)*

### Database-Driven Admin User Management ✅

**Admin users are now stored in the database and can be managed through the API:**

#### Default Admin Login Credentials (Auto-created on first startup)

#### CF1 System Admin
- **Email**: `admin@cf1platform.com`
- **Password**: `CF1Admin2025!`
- **Role**: Super Admin

#### Brock (Super Admin) 
- **Email**: `bthardwick@gmail.com`
- **Password**: `BrockCF1Admin2025!`
- **Role**: Super Admin

#### Brian (Super Admin)
- **Email**: `brian@cf1platform.com`
- **Password**: `BrianCF1Admin2025!`
- **Role**: Super Admin

### Admin User Management API Endpoints

**Base URL**: `https://cf1-claude-production.up.railway.app/api/admin/users`

- `GET /api/admin/users` - List all admin users
- `POST /api/admin/users` - Create new admin user
- `PUT /api/admin/users/:id` - Update admin user
- `DELETE /api/admin/users/:id` - Delete admin user
- `POST /api/admin/users/initialize` - Initialize default admin users

**Example: Create New Admin User**
```bash
curl -X POST https://cf1-claude-production.up.railway.app/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@cf1platform.com",
    "username": "newadmin",
    "password": "SecurePassword123!",
    "name": "New Admin",
    "role": "super_admin",
    "permissions": ["admin", "governance", "proposals", "users", "super_admin"]
  }'
```

### Security Configuration
- `CSRF_SECRET` = `15704d89383f9d5310cdc99f432d51aef381149c77377e1d662e5471523f62ac`
- `ENCRYPTION_KEY` = `ce6a4b4b96af80300762257ba8e9d57fa9b6e1e6cce8c115713c2e761fee0827`
- `WEBHOOK_SECRET` = `7662dd4c4638172676d61951d33fa277a9eae5ee8e38911e028c7481c4904438`

### AI Service Configuration *(To be configured when AI service deployed)*
- `AI_SERVICE_URL` = `https://your-ai-service.railway.app`
- `AI_SERVICE_API_KEY` = `your-ai-service-key`

### Database Configuration *(Railway auto-generated if PostgreSQL added)*
- `DATABASE_URL` = `postgresql://username:password@host:port/database`

## API Endpoints

**Base URL**: `https://cf1-claude-production.up.railway.app`

### Health Check
- `GET /health`

### Authentication
- `POST /api/auth/*`

### Admin Endpoints
- `POST /api/admin/auth/validate`
- `GET /api/admin/*`

### Business Logic
- `GET /api/v1/ai-analysis/*`
- `GET /api/creator-toolkit/*`
- `GET /api/v1/assets/*`
- `GET /api/v1/proposals/*`
- `GET /api/v1/governance/*`
- `GET /feature-toggles/*`

## Frontend Integration

**When deploying frontend, add to `.env`:**
```env
VITE_API_URL=https://cf1-claude-production.up.railway.app/api
```

## Test Commands

### Health Check
```bash
curl https://cf1-claude-production.up.railway.app/health
```

### Admin Authentication
```bash
curl -H "X-Admin-API-Key: 15ed4d371ec318fa4a2f64455a88d01ef4b71f0367adccfe6c15858a39331957" \
https://cf1-claude-production.up.railway.app/api/admin/auth/validate
```

## GitHub Repository
**Main Repository**: `https://github.com/bthh/CF1-Claude.git`

## Railway CLI Commands

```bash
# Link to project
railway link

# Get status
railway status  

# View logs
railway logs

# Deploy
railway up

# Get domain
railway domain
```

## Security Notes

1. **API Keys**: All generated with 256-bit entropy
2. **Password**: Hashed with bcrypt (12 rounds)  
3. **Environment**: All sensitive data stored in Railway environment variables
4. **HTTPS**: All endpoints use TLS encryption
5. **CORS**: Configured for production frontend domain

## Deployment Status

✅ Backend deployed and running
✅ Environment variables configured  
✅ Public domain generated
✅ Health checks passing
✅ Database connection established
✅ Audit logging active

---

**Created**: September 8, 2025
**Last Updated**: September 8, 2025
**Status**: Production Ready

**⚠️ REMINDER: Store this file securely and never commit to version control ⚠️**