# ARCON e-Ad Approval Portal - API Documentation

## 📋 Overview

This document outlines the API requirements and endpoints for the ARCON e-Ad Approval Portal backend implementation. The API follows RESTful principles and uses JWT authentication for secure access.

## 🔐 Authentication

### JWT Token Structure
All authenticated requests require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "role": "advertiser", // or "reviewer", "admin"
  "company": "ABC Advertising Ltd", // optional for advertisers
  "phone": "+234-803-123-4567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "user": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "advertiser",
    "verified": false
  }
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "advertiser",
    "verified": true
  }
}
```

#### POST `/api/auth/verify-email`
Verify user email address.

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

#### POST `/api/auth/forgot-password`
Request password reset.

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

#### POST `/api/auth/reset-password`
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePassword123!"
}
```

## 👤 User Management

#### GET `/api/users/profile`
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "role": "advertiser",
  "company": "ABC Advertising Ltd",
  "phone": "+234-803-123-4567",
  "verified": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### PUT `/api/users/profile`
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "company": "Updated Company Ltd",
  "phone": "+234-803-123-4568"
}
```

## 📝 Ad Submissions

#### POST `/api/submissions`
Submit new advertisement for approval.

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
```json
{
  "brand_name": "Nike",
  "campaign_title": "Nike Air Max Summer Campaign",
  "category": "digital", // "tv", "radio", "billboard", "digital", "print"
  "duration_start": "2024-02-01",
  "duration_end": "2024-03-31",
  "geographic_reach": ["Lagos", "Abuja", "Kano"], // Array of states/LGAs
  "notes": "Target audience: 18-35 age group",
  "files": ["file1.mp4", "file2.jpg"], // File uploads
  "supporting_docs": ["brief.pdf", "disclaimer.pdf"] // Supporting documents
}
```

**Response:**
```json
{
  "success": true,
  "submission": {
    "id": "ADV-001-2024",
    "advertiser_id": "uuid",
    "brand_name": "Nike",
    "campaign_title": "Nike Air Max Summer Campaign",
    "category": "digital",
    "status": "pending",
    "duration_start": "2024-02-01",
    "duration_end": "2024-03-31",
    "geographic_reach": ["Lagos", "Abuja", "Kano"],
    "notes": "Target audience: 18-35 age group",
    "files": [
      {
        "id": "file1",
        "name": "campaign_video.mp4",
        "url": "https://storage.example.com/files/file1.mp4",
        "type": "video/mp4",
        "size": 15728640
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET `/api/submissions`
Get user's submissions (advertisers) or all submissions (reviewers/admin).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status (pending, under_review, approved, rejected)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort order (created_at, updated_at)

**Response:**
```json
{
  "submissions": [
    {
      "id": "ADV-001-2024",
      "brand_name": "Nike",
      "campaign_title": "Nike Air Max Summer Campaign",
      "category": "digital",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z",
      "reviewer": null
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 47,
    "items_per_page": 10
  }
}
```

#### GET `/api/submissions/:id`
Get detailed submission information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "ADV-001-2024",
  "advertiser": {
    "id": "uuid",
    "name": "John Doe",
    "company": "ABC Advertising Ltd",
    "email": "john.doe@example.com"
  },
  "brand_name": "Nike",
  "campaign_title": "Nike Air Max Summer Campaign",
  "category": "digital",
  "status": "under_review",
  "duration_start": "2024-02-01",
  "duration_end": "2024-03-31",
  "geographic_reach": ["Lagos", "Abuja", "Kano"],
  "notes": "Target audience: 18-35 age group",
  "files": [...],
  "supporting_docs": [...],
  "comments": [
    {
      "id": "comment1",
      "reviewer": {
        "name": "Jane Smith",
        "role": "reviewer"
      },
      "message": "Please provide more details about target demographics",
      "created_at": "2024-01-16T09:15:00Z"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-16T09:15:00Z"
}
```

## 🔍 Review Process

#### PUT `/api/submissions/:id/assign`
Assign submission to reviewer (admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reviewer_id": "reviewer_uuid"
}
```

#### POST `/api/submissions/:id/comments`
Add comment to submission.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "Please revise the campaign duration and provide additional compliance documentation.",
  "type": "feedback" // or "internal_note"
}
```

#### PUT `/api/submissions/:id/status`
Update submission status (reviewers only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "approved", // "approved", "rejected", "under_review", "changes_requested"
  "reason": "Meets all regulatory requirements",
  "internal_notes": "Approved with minor recommendations"
}
```

**Response:**
```json
{
  "success": true,
  "submission": {
    "id": "ADV-001-2024",
    "status": "approved",
    "approved_at": "2024-01-17T14:30:00Z",
    "certificate": {
      "id": "CERT-001-2024",
      "url": "https://storage.example.com/certificates/cert-001.pdf",
      "qr_code": "https://verify.arcon.gov.ng/CERT-001-2024"
    }
  }
}
```

## 📄 Certificates

#### GET `/api/certificates`
Get user's certificates.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "certificates": [
    {
      "id": "CERT-001-2024",
      "submission_id": "ADV-001-2024",
      "campaign_title": "Nike Air Max Summer Campaign",
      "brand_name": "Nike",
      "approval_date": "2024-01-17T14:30:00Z",
      "expiry_date": "2024-03-31T23:59:59Z",
      "status": "active",
      "download_url": "https://storage.example.com/certificates/cert-001.pdf",
      "qr_code": "https://verify.arcon.gov.ng/CERT-001-2024"
    }
  ]
}
```

#### GET `/api/certificates/:id/download`
Download certificate PDF.

**Headers:** `Authorization: Bearer <token>`

**Response:** PDF file download

## 🔍 Public Verification

#### GET `/api/verify/:certificate_id`
Verify certificate (public endpoint).

**Response:**
```json
{
  "valid": true,
  "certificate": {
    "id": "CERT-001-2024",
    "campaign_title": "Nike Air Max Summer Campaign",
    "brand_name": "Nike",
    "advertiser": "ABC Advertising Ltd",
    "approval_date": "2024-01-17T14:30:00Z",
    "expiry_date": "2024-03-31T23:59:59Z",
    "status": "active",
    "categories": ["digital"],
    "geographic_reach": ["Lagos", "Abuja", "Kano"]
  }
}
```

#### POST `/api/verify/qr`
Verify certificate via QR code scan (public endpoint).

**Request Body:**
```json
{
  "qr_data": "CERT-001-2024-QR-STRING"
}
```

## 📊 Analytics & Reports

#### GET `/api/analytics/dashboard`
Get dashboard analytics (role-based).

**Headers:** `Authorization: Bearer <token>`

**Response (for advertisers):**
```json
{
  "total_submissions": 12,
  "pending": 3,
  "approved": 8,
  "rejected": 1,
  "avg_review_time": "2.5 days",
  "recent_activity": [...]
}
```

**Response (for reviewers):**
```json
{
  "pending_reviews": 15,
  "completed_today": 8,
  "avg_review_time": "2.1 hours",
  "approval_rate": 85.5,
  "recent_activity": [...]
}
```

**Response (for admin):**
```json
{
  "total_users": 234,
  "active_advertisers": 89,
  "active_reviewers": 12,
  "submissions_this_month": 156,
  "approval_rate": 82.3,
  "avg_review_time": "2.3 hours",
  "system_health": {
    "uptime": "99.9%",
    "response_time": "245ms"
  }
}
```

## 📁 File Management

#### POST `/api/files/upload`
Upload files (authenticated).

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
- `file`: File to upload
- `type`: File type ("creative", "document", "supporting")

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "file_uuid",
    "name": "campaign_video.mp4",
    "url": "https://storage.example.com/files/file_uuid.mp4",
    "type": "video/mp4",
    "size": 15728640,
    "uploaded_at": "2024-01-15T10:30:00Z"
  }
}
```

#### DELETE `/api/files/:id`
Delete file (authenticated).

**Headers:** `Authorization: Bearer <token>`

## ⚙️ System Configuration

#### GET `/api/config/categories`
Get available ad categories (public).

**Response:**
```json
{
  "categories": [
    {
      "id": "tv",
      "name": "Television",
      "description": "TV commercials and advertisements"
    },
    {
      "id": "radio",
      "name": "Radio",
      "description": "Radio advertisements and jingles"
    },
    {
      "id": "digital",
      "name": "Digital",
      "description": "Online and social media advertisements"
    },
    {
      "id": "billboard",
      "name": "Billboard",
      "description": "Outdoor advertising and billboards"
    },
    {
      "id": "print",
      "name": "Print",
      "description": "Newspaper and magazine advertisements"
    }
  ]
}
```

#### GET `/api/config/locations`
Get available geographic locations (public).

**Response:**
```json
{
  "states": [
    {
      "id": "lagos",
      "name": "Lagos",
      "lgas": ["Ikeja", "Lagos Island", "Lagos Mainland", ...]
    },
    {
      "id": "abuja",
      "name": "Federal Capital Territory",
      "lgas": ["Abuja Municipal", "Gwagwalada", "Kuje", ...]
    }
  ]
}
```

## 📧 Notifications

#### GET `/api/notifications`
Get user notifications.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif_uuid",
      "type": "submission_approved",
      "title": "Campaign Approved",
      "message": "Your Nike Air Max campaign has been approved",
      "read": false,
      "created_at": "2024-01-17T14:30:00Z",
      "data": {
        "submission_id": "ADV-001-2024"
      }
    }
  ]
}
```

#### PUT `/api/notifications/:id/read`
Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

## 🔧 Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `429`: Rate Limit Exceeded
- `500`: Internal Server Error

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_REQUIRED`: Missing or invalid token
- `AUTHORIZATION_FAILED`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `DUPLICATE_ENTRY`: Resource already exists
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `RATE_LIMIT_EXCEEDED`: Too many requests

## 🔒 Security Considerations

### Rate Limiting
- Authentication endpoints: 5 requests per minute
- File uploads: 10 requests per hour
- General API: 100 requests per minute

### File Upload Security
- Maximum file size: 100MB
- Allowed file types: PDF, DOC, DOCX, JPG, PNG, MP4, MP3
- Virus scanning on upload
- File type validation

### Data Protection
- All sensitive data encrypted at rest
- HTTPS required for all requests
- JWT token expiration: 24 hours
- Refresh token rotation

---

This API documentation serves as a blueprint for backend implementation. For Supabase integration, these endpoints would be implemented as Edge Functions with appropriate database schema and storage configurations.