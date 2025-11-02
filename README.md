# JobBoard 💼
<p align="center">
  <!-- GitHub followers -->
  <a href="https://github.com/hugoegry"><img src="https://img.shields.io/github/followers/hugoegry?style=social" alt="GitHub followers"></a>
  &nbsp;
  <!--mail-->
  <a href="mailto:hugo.egry@epitech.eu"><img src="https://img.shields.io/badge/Email-hugo.egry@epitech.eu-blue?style=social&logo=gmail"></a> <!--@ = maildotru-->
  &nbsp;
  <!-- Repo stars -->
  <a href="https://github.com/hugoegry?tab=stars"><img src="https://img.shields.io/github/stars/hugoegry?style=social" alt="GitHub stars"></a>
</p>
<br>

<h2 align="center">A <strong>modern full-stack job board platform</strong> built with <strong>React, Express, and PostgreSQL</strong>, designed for recruiters to post jobs and candidates to browse and apply seamlessly through a clean and responsive interface.</h2>

<h3 align="center">Enjoying JobBoard? ⭐ Star this repo and follow me on GitHub to stay updated with exciting projects and future releases!</h3>
<br>

---

## 📋 Table of Contents | Table des Matières

- [Documentation](#documentation)
  - [Technical Overview](#-technical-overview)
  - [Architecture](#-architecture)
  - [Installation & Setup](#-installation--setup)
  - [API Documentation](#-api-documentation)
  - [Database Schema](#-database-schema)
- [Collaborators](Collaborators)


<br>

---

## 🏗 Built With

[![Java Script](https://img.shields.io/badge/Java%20Script-%23323330.svg?&logo=javascript&logoColor=%23F7DF1E)](#)
[![React](https://custom-icon-badges.demolab.com/badge/React-61DAFB?logo=react&logoColor=black)](#)
[![Express](https://custom-icon-badges.demolab.com/badge/Express-000000?logo=express&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/Postgres-%23316192.svg?logo=postgresql&logoColor=white)](#)
[![NodeJs](https://img.shields.io/badge/node.js-6DA55F?&logo=node.js&logoColor=white)](#)
[![Visual Studio](https://custom-icon-badges.demolab.com/badge/Visual%20Studio%20Code-0078d7.svg?logo=vsc&logoColor=white)](#)

---

# Documentation

## 🔧 Technical Overview

JobBoard is a full-stack web application implementing a modern RESTful architecture with JWT-based authentication. The platform enables bidirectional interaction between recruiters and job seekers through a scalable, secure infrastructure.

### Core Technologies

- **Frontend**: React 18+ with functional components and hooks
- **Backend**: Node.js with Express.js framework
- **Database**: PostgreSQL 14+ with connection pooling
- **Authentication**: Token and password with Argon2 (Argon2id) password hashing
- **API**: RESTful architecture

### Key Features

- 🔐 **Authentication System**: Role-based access control (RBAC) with JWT tokens
- 💼 **Job Management**: Full CRUD operations with validation and sanitization
- 👥 **User Management**: Separate recruiter and candidate workflows
- 🔍 **Search & Filtering**: Advanced query capabilities with pagination
- 📧 **Application System**: File upload and application tracking
- 🛡 **Security**: Input validation, SQL injection prevention, XSS protection

---

## 🏛 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   React     │  │   Router    │  │   Context   │          │
│  │ Components  │  │   (React)   │  │    API      │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Express   │  │ Middleware  │  │   Routes    │          │
│  │   Server    │  │   Layer     │  │  Handlers   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                           ↕ SQL Queries
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ PostgreSQL  │  │ Connection  │  │   Schemas   │          │
│  │  Database   │  │    Pool     │  │ & Indexes   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
jobboard/
├── backend/
│   ├── controllers/
│   │   ├── baseController.class.js             # Base class inherited by all other controllers (common logic like error handling, responses, etc.).
│   │   ├── authController.class.js             # Handles user authentication.
│   │   ├── applicationController.class.js      # Manages job applications.
│   │   ├── companyController.class.js          # Handles company-related logic (profile, info, etc.).
│   │   ├── companyMemberController.class.js    # Manages members associated with a company.
│   │   ├── documentController.class.js         # Handles document uploads and retrieval.
│   │   ├── documentSelectedController.class.js # Manages selected or attached documents for applications.
│   │   ├── offerController.class.js            # Job operations
│   │   └── userController.class.js             # User management (profiles, updates, deletion, etc.).
│   ├── middleware/
│   │   └── checkPermission.js # check user permissions and roles before accessing routes.
│   ├── models/
│   │   ├── baseModel.class.js             # Base class inherited by all models (shared SQL logic).
│   │   ├── userModel.class.js             # User queries & database operations.
│   │   ├── applicationModel.class.js      # Job application queries and logic.
│   │   ├── companyModel.class.js          # Company data and queries.
│   │   ├── companyMemberModel.class.js    # Manages relationships between companies and members.
│   │   ├── offerModel.class.js            # Job model & queries
│   │   ├── documentModel.class.js         # Document storage and metadata.
│   │   └── documentSelectedModel.class.js # Handles selected documents for applications.
│   ├── routes/
│   │   ├── authRoutes.js             # Authentication endpoints
│   │   ├── offerRoutes.js            # Job endpoints
│   │   ├── applicationRoutes.js      # application endpoints
│   │   ├── companyMemberRoutes.js    # Endpoints for company members.
│   │   ├── companyRoutes.js          # ndpoints for company.
│   │   ├── documentRoutes.js         # Endpoints for document management.
│   │   ├── documentSelectedRoutes.js # Endpoints for selected documents.
│   │   └── userRoutes.js             # User management endpoints.
│   ├── .env             # Environment variables
│   ├── server.js        # Main entry point of the backend.
│   └── package.json     # Backend dependencies, scripts, and configuration.
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── component/
│   │   │   ├── admin/
│   │   │   │   ├── EntityForm/  
│   │   │   │   ├── Sidebar/     
│   │   │   │   └── ModulePanel/ 
│   │   │   ├── header/ 
│   │   │   └── footer/ 
│   │   ├── asset/
│   │   │   └── [...]
│   │   ├── styles/
│   │   │   └── [... all css]      
│   │   ├── pages/
│   │   │   ├── accueil.js
│   │   │   ├── accountInfo.js
│   │   │   ├── apply.js
│   │   │   ├── connexion.js
│   │   │   ├── jobPages.js
│   │   │   ├── userManual.js
│   │   │   ├── vueApplication.js
│   │   │   ├── vueEmployeur.js
│   │   │   └── admin.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── api.js
│   └── package.json
└── README.md
```

---

## 📦 Installation & Setup

### Prerequisites

- Node.js >= 16.x
- PostgreSQL >= 14.x
- npm or yarn or pnpm
- Git

### Backend Setup

```bash
# Clone repository
git clone https://github.com/hugoegry/jobboard.git
cd jobboard/backend

# Install dependencies
npm install

# Install required packages
npm install express pg express-session argon2 dotenv cors
npm install --save-dev nodemon

# Create .env file
cat > .env << EOL
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jobboard
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# CORS
CORS_ORIGIN=http://localhost:3000
EOL

# Initialize database
psql -U postgres
CREATE DATABASE jobboard;
\c jobboard
\i database/schema.sql
```

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Install required packages
npm install react-router-dom axios

# Create .env
cat > .env << EOL
REACT_APP_API_URL=http://localhost:5000/api
EOL

# Start development server
npm start
```

### Package.json Configuration

**Backend package.json**:
```json
{
  "name": "jobboard-backend",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

**Frontend package.json**:
```json
{
  "name": "jobboard-frontend",
  "version": "1.0.0",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.0",
    "axios": "^1.4.0"
  }
}
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": false
}

Response: 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Job Endpoints

#### Get All Jobs
```http
GET /api/offer

Response: 200 OK
{
  "success": true,
  "data": [ ... ]
}
```

#### Create Job (Recruiter only)
```http
POST /api/offer
Content-Type: application/json

{
  "title": "Full Stack Developer",
  "company": "StartupXYZ",
  "location": "Remote",
  "salary": "45000-65000",
  "type": "CDI",
  "description": "We are looking for...",
  "requirements": ["React", "Node.js", "PostgreSQL"]
}

Response: 201 Created
```

#### Update Job
```http
PUT /api/offer
Content-Type: application/json

{
  "title": "Updated Title",
  "location": "New Location",
  "salary": "50000-70000"
}

Response: 200 OK
```

#### Delete Job
```http
DELETE /api/offer
Content-Type: multipart/form-data

FormData:
  - id: "823436a2-8588-4753-a95c-65c7bac93d8a"

Response: 204 No Content
```

### Application Endpoints

#### Apply to Job
```http
POST /api/application/
Content-Type: multipart/form-data

FormData:
  - offers_id: "823436a2-8588-4753-a95c-65c7bac93d8a"
  - users_id: "e0830ade-9d5b-41f8-9c0f-c2f38e6a2a94"
  - candidate_email: "testmail@gmail.com"
  - candidate_phone: "0674879532"
  - message: "testemessage"
  - coverLetter: "I am interested..."
  - resume: [file]

Response: 201 Created
```

---

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  phone TEXT,
  profile JSONB,
  role website_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  login_metadata JSONB DEFAULT '{
        "login_attempts": 0,
        "lock_count": 0,
        "lock_until": null
    }'::JSONB
);

CREATE INDEX idx_users_email ON users(email);
```

### Jobs Table
```sql
CREATE TYPE offer_type AS ENUM ('cdi','cdd','alternance','mi-temps','freelance','stage','benevolat');

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  tags TEXT[],
  type offer_type NOT NULL,
  external_url TEXT,
  collect_application boolean DEFAULT true,
  recruiter_email TEXT,
  created_when TIMESTAMPTZ DEFAULT now(),
  updated_when TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_offers_title_trgm ON offers USING gin (title gin_trgm_ops);
CREATE INDEX idx_offers_tags_gin ON offers USING gin (tags);
CREATE INDEX idx_offers_location_trgm ON offers USING gin (location gin_trgm_ops);
CREATE INDEX idx_offers_created_when ON offers (created_when);
```

### Applications Table
```sql
CREATE TABLE applications (
  offers_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  users_id UUID REFERENCES users(id) ON DELETE CASCADE,
  candidate_email TEXT,
  candidate_phone TEXT,
  message TEXT,
  created_when TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (offers_id, users_id)
);

CREATE INDEX idx_applications_offer ON applications(offer_id);
CREATE INDEX idx_applications_user ON applications(user_id);
```

---

## 🛡 Security Features

- **Password Hashing**: Argon2 with salt rounds
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Restricted origins
- **Rate Limiting**: API request throttling
- **Environment Variables**: Sensitive data protection

---

## 🤝 Collaborators

<h3>Hugo Egry <a href="https://github.com/hugoegry"><img src="https://img.shields.io/badge/Git%20Hub-hugoegry-blue?style=social&logo=refinedgithub"></a></h3>

<h3>Rewann Tannou <a href="https://github.com/RewannTannou"><img src="https://img.shields.io/badge/Git%20Hub-RewannTannou-blue?style=social&logo=refinedgithub"></a></h3>

<h3>Manech Laguens <a href="https://github.com/Manech-Laguens"><img src="https://img.shields.io/badge/Git%20Hub-Manech Laguens-blue?style=social&logo=refinedgithub"></a></h3>


<!--HEG_GIT_HUB_API
[
  {
    "name": "JS / Expres / React Job Board",
    "desc": "JobBoard is a full-stack web application implementing a modern RESTful architecture with JWT-based authentication. The platform enables bidirectional interaction between recruiters and job seekers through a scalable, secure infrastructure.",
    "date": "2025-10-08T14:00:00Z",
    "link": {
      "codeReview": "https://github.com/hugoegry/jobBoard",
      "show": null
    },
    "preview": {
      "p1": {
        "name": "miniatureJobBoard",
        "ex": "jpg"
      }
    }
  }
]
-->
