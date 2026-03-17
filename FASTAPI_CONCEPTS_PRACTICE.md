# FastAPI + MongoDB Concepts Practice - Banking System Interview Prep

Based on your banking project backend, here are mini practice tasks for each FastAPI and MongoDB concept you've implemented. These will help you confidently explain your backend code to interviewers.

## 1. FastAPI Basic Setup & Structure

### **Used in Your Project:**
- FastAPI application initialization
- Router organization
- CORS middleware
- Environment configuration

### **Practice Task:**
Create a simple FastAPI app with basic structure:

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

# Database connection (we'll add this later)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up...")
    yield
    # Shutdown
    print("Shutting down...")

app = FastAPI(
    title="Banking API",
    description="A simple banking system API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Banking API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "banking-api"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

### **Interview Explanation:**
"In my banking system, I structure the FastAPI app with proper middleware configuration. I use CORS middleware to allow frontend connections, and organize routes using APIRouter for better code organization. The lifespan events handle database connections."

---

## 2. Pydantic Models & Data Validation

### **Used in Your Project:**
- User models (registration, login)
- Account models (creation, updates)
- Response models
- Data validation

### **Practice Task:**
Create Pydantic models for a simple user system:

```python
# models.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class AccountType(str, Enum):
    SAVINGS = "savings"
    CHECKING = "checking"
    BUSINESS = "business"

# Request Models
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: str = Field(..., regex=r'^\+?1?\d{9,15}$')
    role: UserRole = UserRole.USER

    @validator('username')
    def username_alphanumeric(cls, v):
        assert v.isalnum(), 'Username must be alphanumeric'
        return v

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class AccountCreate(BaseModel):
    account_name: str = Field(..., min_length=2, max_length=100)
    account_type: AccountType
    initial_deposit: float = Field(..., ge=100)  # Minimum $100
    
    @validator('initial_deposit')
    def validate_deposit(cls, v):
        if v < 100:
            raise ValueError('Minimum initial deposit is $100')
        return round(v, 2)

class TransactionCreate(BaseModel):
    account_id: str
    amount: float = Field(..., gt=0)
    transaction_type: str = Field(..., regex=r'^(deposit|withdrawal)$')
    description: Optional[str] = None

# Response Models
class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    phone: str
    role: UserRole
    created_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True

class AccountResponse(BaseModel):
    id: str
    user_id: str
    account_name: str
    account_type: AccountType
    balance: float
    account_number: str
    created_at: datetime

    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    id: str
    account_id: str
    amount: float
    transaction_type: str
    description: Optional[str]
    timestamp: datetime
    balance_after: float

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None
```

### **Interview Explanation:**
"I use Pydantic models extensively for data validation in my banking API. For example, the UserCreate model validates email format, password strength, and phone number format. This ensures data integrity before it reaches the database and provides clear error messages to the frontend."

---

## 3. MongoDB Connection & Database Operations

### **Used in Your Project:**
- MongoDB connection with Motor
- Database operations (CRUD)
- Collection management

### **Practice Task:**
Set up MongoDB connection and basic operations:

```python
# database.py
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import os
from typing import Optional

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    database = None

# Database instance
mongodb = MongoDB()

async def connect_to_mongo():
    """Create database connection"""
    try:
        mongodb.client = AsyncIOMotorClient(
            os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        )
        mongodb.database = mongodb.client.banking_system
        
        # Test connection
        await mongodb.client.admin.command('ping')
        print("Connected to MongoDB successfully!")
        
    except ConnectionFailure as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if mongodb.client:
        mongodb.client.close()
        print("Disconnected from MongoDB")

def get_database():
    """Get database instance"""
    return mongodb.database

# collections.py
from database import get_database
from bson import ObjectId
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserCollection:
    def __init__(self):
        self.db = get_database()
        self.collection = self.db.users

    async def create_user(self, user_data: dict) -> str:
        """Create a new user"""
        user_data["created_at"] = datetime.utcnow()
        user_data["is_active"] = True
        
        result = await self.collection.insert_one(user_data)
        return str(result.inserted_id)

    async def get_user_by_username(self, username: str) -> Optional[dict]:
        """Get user by username"""
        user = await self.collection.find_one({"username": username})
        if user:
            user["id"] = str(user["_id"])
        return user

    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID"""
        try:
            user = await self.collection.find_one({"_id": ObjectId(user_id)})
            if user:
                user["id"] = str(user["_id"])
            return user
        except Exception:
            return None

    async def update_user(self, user_id: str, update_data: dict) -> bool:
        """Update user"""
        try:
            update_data["updated_at"] = datetime.utcnow()
            result = await self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception:
            return False

    async def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        try:
            result = await self.collection.delete_one({"_id": ObjectId(user_id)})
            return result.deleted_count > 0
        except Exception:
            return False

    async def get_all_users(self, skip: int = 0, limit: int = 100) -> List[dict]:
        """Get all users with pagination"""
        cursor = self.collection.find().skip(skip).limit(limit)
        users = []
        async for user in cursor:
            user["id"] = str(user["_id"])
            users.append(user)
        return users

class AccountCollection:
    def __init__(self):
        self.db = get_database()
        self.collection = self.db.accounts

    async def create_account(self, account_data: dict) -> str:
        """Create a new account"""
        account_data["created_at"] = datetime.utcnow()
        account_data["balance"] = account_data.get("initial_deposit", 0)
        account_data["account_number"] = await self._generate_account_number()
        
        result = await self.collection.insert_one(account_data)
        return str(result.inserted_id)

    async def _generate_account_number(self) -> str:
        """Generate unique account number"""
        import random
        while True:
            account_number = f"ACC{random.randint(100000, 999999)}"
            existing = await self.collection.find_one({"account_number": account_number})
            if not existing:
                return account_number

    async def get_accounts_by_user(self, user_id: str) -> List[dict]:
        """Get all accounts for a user"""
        cursor = self.collection.find({"user_id": user_id})
        accounts = []
        async for account in cursor:
            account["id"] = str(account["_id"])
            accounts.append(account)
        return accounts

    async def get_account_by_id(self, account_id: str) -> Optional[dict]:
        """Get account by ID"""
        try:
            account = await self.collection.find_one({"_id": ObjectId(account_id)})
            if account:
                account["id"] = str(account["_id"])
            return account
        except Exception:
            return None

    async def update_balance(self, account_id: str, new_balance: float) -> bool:
        """Update account balance"""
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(account_id)},
                {"$set": {"balance": new_balance, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception:
            return False

# Initialize collections
user_collection = UserCollection()
account_collection = AccountCollection()
```

### **Interview Explanation:**
"I use Motor (async MongoDB driver) for database operations in my banking system. I've created collection classes that encapsulate all database operations with proper error handling. Each operation returns appropriate data types and handles ObjectId conversions for the frontend."

---

## 4. JWT Authentication & Security

### **Used in Your Project:**
- JWT token generation and validation
- Password hashing
- Protected routes
- User authentication

### **Practice Task:**
Implement JWT authentication system:

```python
# auth.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
import os

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Get user from database
    from collections import user_collection
    user = await user_collection.get_user_by_username(username)
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    """Get current active user"""
    if not current_user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_admin_user(current_user: dict = Depends(get_current_active_user)):
    """Require admin role"""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# Authentication routes
from fastapi import APIRouter
from fastapi.security import OAuth2PasswordRequestForm

auth_router = APIRouter(prefix="/auth", tags=["authentication"])

@auth_router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    """Register new user"""
    # Check if user exists
    existing_user = await user_collection.get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    user_dict = user_data.dict()
    user_dict["password"] = hashed_password
    del user_dict["password"]  # Remove plain password
    user_dict["hashed_password"] = hashed_password
    
    user_id = await user_collection.create_user(user_dict)
    
    # Get created user
    created_user = await user_collection.get_user_by_id(user_id)
    return UserResponse(**created_user)

@auth_router.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login user"""
    # Get user
    user = await user_collection.get_user_by_username(form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Verify password
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_active_user)):
    """Get current user profile"""
    return UserResponse(**current_user)
```

### **Interview Explanation:**
"I implement JWT authentication with proper password hashing using bcrypt. The system creates tokens with expiration times and validates them on protected routes. I use dependency injection to check user permissions, with separate dependencies for regular users and admin users."

---

## 5. API Routes & CRUD Operations

### **Used in Your Project:**
- RESTful API design
- CRUD operations for users and accounts
- Query parameters and path parameters
- Response models

### **Practice Task:**
Create comprehensive API routes:

```python
# routes/users.py
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from models import UserCreate, UserResponse, UserUpdate
from auth import get_current_active_user, get_admin_user
from collections import user_collection

user_router = APIRouter(prefix="/users", tags=["users"])

@user_router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: dict = Depends(get_admin_user)
):
    """Get all users (Admin only)"""
    users = await user_collection.get_all_users(skip=skip, limit=limit)
    return [UserResponse(**user) for user in users]

@user_router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get user by ID"""
    # Users can only access their own data, admins can access any
    if current_user["role"] != "admin" and current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = await user_collection.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(**user)

@user_router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """Update user"""
    # Users can only update their own data, admins can update any
    if current_user["role"] != "admin" and current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if user exists
    existing_user = await user_collection.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user
    update_data = user_update.dict(exclude_unset=True)
    success = await user_collection.update_user(user_id, update_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )
    
    # Return updated user
    updated_user = await user_collection.get_user_by_id(user_id)
    return UserResponse(**updated_user)

@user_router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_admin_user)
):
    """Delete user (Admin only)"""
    # Check if user exists
    existing_user = await user_collection.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Don't allow deleting self
    if current_user["id"] == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete user
    success = await user_collection.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )
    
    return {"message": "User deleted successfully"}

# routes/accounts.py
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models import AccountCreate, AccountResponse, TransactionCreate
from auth import get_current_active_user, get_admin_user
from collections import account_collection

account_router = APIRouter(prefix="/accounts", tags=["accounts"])

@account_router.post("/", response_model=AccountResponse)
async def create_account(
    account_data: AccountCreate,
    current_user: dict = Depends(get_current_active_user)
):
    """Create new account"""
    account_dict = account_data.dict()
    account_dict["user_id"] = current_user["id"]
    
    account_id = await account_collection.create_account(account_dict)
    created_account = await account_collection.get_account_by_id(account_id)
    
    return AccountResponse(**created_account)

@account_router.get("/", response_model=List[AccountResponse])
async def get_accounts(
    current_user: dict = Depends(get_current_active_user)
):
    """Get user's accounts"""
    if current_user["role"] == "admin":
        # Admin can see all accounts
        accounts = await account_collection.get_all_accounts()
    else:
        # Regular users see only their accounts
        accounts = await account_collection.get_accounts_by_user(current_user["id"])
    
    return [AccountResponse(**account) for account in accounts]

@account_router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get account by ID"""
    account = await account_collection.get_account_by_id(account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    # Check ownership
    if current_user["role"] != "admin" and account["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return AccountResponse(**account)

@account_router.post("/{account_id}/deposit")
async def deposit_money(
    account_id: str,
    amount: float = Query(..., gt=0),
    current_user: dict = Depends(get_current_active_user)
):
    """Deposit money to account"""
    # Get account
    account = await account_collection.get_account_by_id(account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    # Check ownership (admin can deposit to any account)
    if current_user["role"] != "admin" and account["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update balance
    new_balance = account["balance"] + amount
    success = await account_collection.update_balance(account_id, new_balance)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deposit money"
        )
    
    return {
        "message": "Deposit successful",
        "amount": amount,
        "new_balance": new_balance
    }

@account_router.post("/{account_id}/withdraw")
async def withdraw_money(
    account_id: str,
    amount: float = Query(..., gt=0),
    current_user: dict = Depends(get_current_active_user)
):
    """Withdraw money from account"""
    # Get account
    account = await account_collection.get_account_by_id(account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    # Check ownership
    if current_user["role"] != "admin" and account["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check sufficient balance
    if account["balance"] < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance"
        )
    
    # Update balance
    new_balance = account["balance"] - amount
    success = await account_collection.update_balance(account_id, new_balance)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to withdraw money"
        )
    
    return {
        "message": "Withdrawal successful",
        "amount": amount,
        "new_balance": new_balance
    }
```

### **Interview Explanation:**
"I design RESTful APIs with proper HTTP methods and status codes. Each route has appropriate authentication and authorization checks. For example, users can only access their own accounts, but admins can access all accounts. I use query parameters for pagination and path parameters for resource identification."

---

## 6. Error Handling & HTTP Status Codes

### **Used in Your Project:**
- Custom HTTP exceptions
- Proper status codes
- Error response models
- Global exception handling

### **Practice Task:**
Implement comprehensive error handling:

```python
# exceptions.py
from fastapi import HTTPException, status
from typing import Any, Dict, Optional

class BankingException(HTTPException):
    """Base banking exception"""
    def __init__(
        self,
        status_code: int,
        detail: Any = None,
        headers: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(status_code, detail, headers)

class UserNotFoundException(BankingException):
    def __init__(self, user_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )

class AccountNotFoundException(BankingException):
    def __init__(self, account_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account with ID {account_id} not found"
        )

class InsufficientFundsException(BankingException):
    def __init__(self, available: float, requested: float):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient funds. Available: ${available:.2f}, Requested: ${requested:.2f}"
        )

class UnauthorizedAccountAccessException(BankingException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this account"
        )

class DuplicateUsernameException(BankingException):
    def __init__(self, username: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{username}' is already taken"
        )

# error_handlers.py
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

logger = logging.getLogger(__name__)

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.error(f"Validation error: {exc.errors()}")
    
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "message": "The request data is invalid",
            "details": exc.errors()
        }
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP error {exc.status_code}: {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "detail": str(exc) if os.getenv("DEBUG") else "Contact support"
        }
    )

# Add to main.py
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Usage in routes
@account_router.post("/{account_id}/withdraw")
async def withdraw_money(
    account_id: str,
    amount: float = Query(..., gt=0),
    current_user: dict = Depends(get_current_active_user)
):
    """Withdraw money with proper error handling"""
    # Get account
    account = await account_collection.get_account_by_id(account_id)
    if not account:
        raise AccountNotFoundException(account_id)
    
    # Check ownership
    if current_user["role"] != "admin" and account["user_id"] != current_user["id"]:
        raise UnauthorizedAccountAccessException()
    
    # Check sufficient balance
    if account["balance"] < amount:
        raise InsufficientFundsException(account["balance"], amount)
    
    try:
        # Update balance
        new_balance = account["balance"] - amount
        success = await account_collection.update_balance(account_id, new_balance)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process withdrawal"
            )
        
        return {
            "message": "Withdrawal successful",
            "amount": amount,
            "new_balance": new_balance,
            "transaction_id": f"TXN{datetime.now().strftime('%Y%m%d%H%M%S')}"
        }
        
    except Exception as e:
        logger.error(f"Withdrawal failed for account {account_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Transaction failed. Please try again."
        )
```

### **Interview Explanation:**
"I implement comprehensive error handling with custom exception classes for different business scenarios. Each exception returns appropriate HTTP status codes and user-friendly messages. I also use global exception handlers to catch unexpected errors and log them for debugging."

---

## 7. Dependency Injection & Middleware

### **Used in Your Project:**
- Authentication dependencies
- Database dependencies
- Custom middleware
- Request/response processing

### **Practice Task:**
Create custom dependencies and middleware:

```python
# dependencies.py
from fastapi import Depends, HTTPException, status, Request
from typing import Optional
import time
import logging

logger = logging.getLogger(__name__)

# Database dependency
async def get_db():
    """Get database connection"""
    from database import get_database
    db = get_database()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable"
        )
    return db

# Pagination dependency
class PaginationParams:
    def __init__(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(50, ge=1, le=100, description="Number of records to return")
    ):
        self.skip = skip
        self.limit = limit

# Rate limiting dependency
class RateLimiter:
    def __init__(self, calls: int, period: int):
        self.calls = calls
        self.period = period
        self.requests = {}

    def __call__(self, request: Request):
        client_ip = request.client.host
        now = time.time()
        
        # Clean old requests
        if client_ip in self.requests:
            self.requests[client_ip] = [
                req_time for req_time in self.requests[client_ip]
                if now - req_time < self.period
            ]
        else:
            self.requests[client_ip] = []
        
        # Check rate limit
        if len(self.requests[client_ip]) >= self.calls:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Max {self.calls} requests per {self.period} seconds"
            )
        
        # Add current request
        self.requests[client_ip].append(now)
        return True

# Create rate limiter instances
rate_limiter = RateLimiter(calls=10, period=60)  # 10 calls per minute
strict_rate_limiter = RateLimiter(calls=5, period=60)  # 5 calls per minute

# Account ownership dependency
async def verify_account_ownership(
    account_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Verify user owns the account or is admin"""
    from collections import account_collection
    
    account = await account_collection.get_account_by_id(account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    if current_user["role"] != "admin" and account["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this account"
        )
    
    return account

# middleware.py
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time
import uuid
import logging

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests and responses"""
    
    async def dispatch(self, request: Request, call_next):
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Log request
        start_time = time.time()
        logger.info(
            f"Request {request_id}: {request.method} {request.url} "
            f"from {request.client.host}"
        )
        
        # Process request
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Response {request_id}: {response.status_code} "
            f"in {process_time:.4f}s"
        )
        
        # Add headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = str(process_time)
        
        return response

class SecurityMiddleware(BaseHTTPMiddleware):
    """Add security headers"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

# Add to main.py
app.add_middleware(LoggingMiddleware)
app.add_middleware(SecurityMiddleware)

# Usage in routes with dependencies
@account_router.post("/{account_id}/transfer")
async def transfer_money(
    account_id: str,
    to_account_id: str,
    amount: float = Query(..., gt=0),
    description: Optional[str] = None,
    from_account: dict = Depends(verify_account_ownership),
    current_user: dict = Depends(get_current_active_user),
    db = Depends(get_db),
    _: bool = Depends(strict_rate_limiter)  # Apply strict rate limiting
):
    """Transfer money between accounts"""
    # Get destination account
    to_account = await account_collection.get_account_by_id(to_account_id)
    if not to_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination account not found"
        )
    
    # Check sufficient balance
    if from_account["balance"] < amount:
        raise InsufficientFundsException(from_account["balance"], amount)
    
    try:
        # Start transaction (pseudo-code for MongoDB transaction)
        async with await db.start_session() as session:
            async with session.start_transaction():
                # Debit from source
                await account_collection.update_balance(
                    account_id, 
                    from_account["balance"] - amount
                )
                
                # Credit to destination
                await account_collection.update_balance(
                    to_account_id, 
                    to_account["balance"] + amount
                )
                
                # Log transaction
                logger.info(
                    f"Transfer completed: ${amount} from {account_id} to {to_account_id} "
                    f"by user {current_user['username']}"
                )
        
        return {
            "message": "Transfer successful",
            "amount": amount,
            "from_account": account_id,
            "to_account": to_account_id,
            "new_balance": from_account["balance"] - amount
        }
        
    except Exception as e:
        logger.error(f"Transfer failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Transfer failed. Please try again."
        )
```

### **Interview Explanation:**
"I use FastAPI's dependency injection system extensively. For example, I have dependencies for authentication, account ownership verification, and rate limiting. I also implement custom middleware for logging requests and adding security headers. This makes the code modular and testable."

---

## 8. API Documentation & Testing

### **Used in Your Project:**
- Automatic OpenAPI documentation
- Response models
- API testing
- Documentation customization

### **Practice Task:**
Enhance API documentation and add testing:

```python
# main.py - Enhanced documentation
from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Banking System API",
        version="1.0.0",
        description="""
        A comprehensive banking system API with the following features:
        
        ## Authentication
        * User registration and login
        * JWT token-based authentication
        * Role-based access control (User/Admin)
        
        ## Account Management
        * Create and manage bank accounts
        * Multiple account types (Savings, Checking, Business)
        * Account balance tracking
        
        ## Transactions
        * Deposit and withdrawal operations
        * Account-to-account transfers
        * Transaction history
        
        ## Admin Features
        * User management
        * Account oversight
        * System administration
        """,
        routes=app.routes,
        tags=[
            {
                "name": "authentication",
                "description": "User authentication and authorization"
            },
            {
                "name": "users",
                "description": "User management operations"
            },
            {
                "name": "accounts",
                "description": "Bank account operations"
            },
            {
                "name": "transactions",
                "description": "Financial transactions"
            }
        ]
    )
    
    # Add security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# test_main.py
import pytest
from fastapi.testclient import TestClient
from main import app
import asyncio

client = TestClient(app)

class TestAuthentication:
    def test_register_user(self):
        """Test user registration"""
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
            "phone": "+1234567890"
        }
        
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["username"] == user_data["username"]
        assert data["email"] == user_data["email"]
        assert "id" in data

    def test_login_user(self):
        """Test user login"""
        # First register a user
        user_data = {
            "username": "logintest",
            "email": "login@example.com",
            "password": "testpass123",
            "phone": "+1234567890"
        }
        client.post("/auth/register", json=user_data)
        
        # Then login
        login_data = {
            "username": "logintest",
            "password": "testpass123"
        }
        
        response = client.post("/auth/login", data=login_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_invalid_login(self):
        """Test invalid login credentials"""
        login_data = {
            "username": "nonexistent",
            "password": "wrongpass"
        }
        
        response = client.post("/auth/login", data=login_data)
        assert response.status_code == 401

class TestAccounts:
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        # Register and login user
        user_data = {
            "username": "accounttest",
            "email": "account@example.com",
            "password": "testpass123",
            "phone": "+1234567890"
        }
        client.post("/auth/register", json=user_data)
        
        login_response = client.post("/auth/login", data={
            "username": "accounttest",
            "password": "testpass123"
        })
        
        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_create_account(self, auth_headers):
        """Test account creation"""
        account_data = {
            "account_name": "Test Savings",
            "account_type": "savings",
            "initial_deposit": 1000.0
        }
        
        response = client.post("/accounts/", json=account_data, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["account_name"] == account_data["account_name"]
        assert data["account_type"] == account_data["account_type"]
        assert data["balance"] == account_data["initial_deposit"]

    def test_get_accounts(self, auth_headers):
        """Test getting user accounts"""
        response = client.get("/accounts/", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)

    def test_deposit_money(self, auth_headers):
        """Test money deposit"""
        # First create an account
        account_data = {
            "account_name": "Deposit Test",
            "account_type": "checking",
            "initial_deposit": 500.0
        }
        
        account_response = client.post("/accounts/", json=account_data, headers=auth_headers)
        account_id = account_response.json()["id"]
        
        # Then deposit money
        response = client.post(
            f"/accounts/{account_id}/deposit?amount=200.0",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 200.0
        assert data["new_balance"] == 700.0

    def test_insufficient_withdrawal(self, auth_headers):
        """Test withdrawal with insufficient funds"""
        # Create account with small balance
        account_data = {
            "account_name": "Small Balance",
            "account_type": "savings",
            "initial_deposit": 100.0
        }
        
        account_response = client.post("/accounts/", json=account_data, headers=auth_headers)
        account_id = account_response.json()["id"]
        
        # Try to withdraw more than balance
        response = client.post(
            f"/accounts/{account_id}/withdraw?amount=200.0",
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert "insufficient" in response.json()["detail"].lower()

# Performance test
def test_api_performance():
    """Test API response times"""
    import time
    
    start_time = time.time()
    response = client.get("/health")
    end_time = time.time()
    
    assert response.status_code == 200
    assert (end_time - start_time) < 1.0  # Should respond within 1 second

# Run tests with: pytest test_main.py -v
```

### **Interview Explanation:**
"I enhance FastAPI's automatic documentation with custom descriptions, tags, and security schemes. I write comprehensive tests using pytest and TestClient, covering authentication, CRUD operations, and error scenarios. This ensures API reliability and provides clear documentation for frontend developers."

---

## Interview Practice Questions

### **1. FastAPI vs Flask/Django:**
**Q:** "Why did you choose FastAPI for your banking system?"

**A:** "I chose FastAPI because it provides automatic API documentation, built-in data validation with Pydantic, async support for better performance, and type hints for better code quality. For a banking system, the automatic validation and documentation are crucial for security and maintainability."

### **2. MongoDB vs SQL:**
**Q:** "Why MongoDB for a banking system instead of a relational database?"

**A:** "While traditional banking systems use SQL databases, I chose MongoDB for this project because it offers flexible schema design, easy horizontal scaling, and natural JSON integration with FastAPI. However, for production banking systems, I'd consider PostgreSQL for ACID compliance and complex transactions."

### **3. Security Implementation:**
**Q:** "How do you ensure security in your FastAPI banking API?"

**A:** "I implement multiple security layers: JWT authentication with expiring tokens, password hashing with bcrypt, role-based access control, input validation with Pydantic, rate limiting to prevent abuse, HTTPS enforcement, and comprehensive logging for audit trails."

### **4. Error Handling:**
**Q:** "How do you handle errors in your FastAPI application?"

**A:** "I use custom exception classes for business logic errors, global exception handlers for unexpected errors, proper HTTP status codes, structured error responses, and comprehensive logging. For example, insufficient funds returns a 400 status with a clear message."

### **5. Performance Optimization:**
**Q:** "How would you optimize your FastAPI application for production?"

**A:** "I'd implement database connection pooling, add caching with Redis, use async operations throughout, implement proper indexing in MongoDB, add request/response compression, use CDN for static assets, and implement database query optimization."

This comprehensive FastAPI + MongoDB practice guide covers all the backend concepts in your banking system and provides hands-on examples you can discuss confidently in interviews! 🚀


---

## 9. Session Management & Token Handling

### **How Your Banking System Manages Sessions:**

Your banking system uses **JWT (JSON Web Tokens)** for stateless session management instead of traditional server-side sessions. Here's how it works:

### **Session Flow in Your System:**

```
1. User Login → Backend generates JWT token
2. Token sent to Frontend → Stored in localStorage
3. Every API Request → Token sent in Authorization header
4. Backend validates token → Extracts user info
5. Token expires → User must login again
```

### **Why JWT Instead of Sessions?**

**Traditional Sessions (Not Used):**
```python
# Server stores session data
sessions = {
    "session_id_123": {
        "user_id": 1,
        "username": "john",
        "expires": "2025-01-01"
    }
}
# Problem: Doesn't scale well, requires server memory
```

**JWT Tokens (Your Approach):**
```python
# Token contains all user info (stateless)
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# Decoded token:
{
    "sub": "john",  # username
    "exp": 1735689600,  # expiration timestamp
    "role": "user"
}
# Benefit: No server storage needed, scales horizontally
```

### **Practice Task: Complete Session Management System**

```python
# session_manager.py
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
import os

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class SessionManager:
    """Manage user sessions with JWT tokens"""
    
    def __init__(self):
        self.active_tokens = set()  # Optional: Track active tokens for logout
        self.blacklisted_tokens = set()  # Optional: Blacklist revoked tokens
    
    def create_access_token(
        self, 
        data: dict, 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create JWT access token
        
        Args:
            data: User data to encode (username, role, etc.)
            expires_delta: Custom expiration time
            
        Returns:
            JWT token string
        """
        to_encode = data.copy()
        
        # Set expiration time
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        # Add standard JWT claims
        to_encode.update({
            "exp": expire,  # Expiration time
            "iat": datetime.utcnow(),  # Issued at
            "type": "access"  # Token type
        })
        
        # Encode token
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        
        # Track active token (optional)
        self.active_tokens.add(encoded_jwt)
        
        return encoded_jwt
    
    def create_refresh_token(self, data: dict) -> str:
        """
        Create refresh token for long-term sessions
        
        Refresh tokens are used to get new access tokens without re-login
        """
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })
        
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    def verify_token(self, token: str) -> Dict:
        """
        Verify and decode JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token payload
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        try:
            # Check if token is blacklisted
            if token in self.blacklisted_tokens:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been revoked"
                )
            
            # Decode token
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # Verify token type
            if payload.get("type") != "access":
                raise credentials_exception
            
            # Extract username
            username: str = payload.get("sub")
            if username is None:
                raise credentials_exception
            
            return payload
            
        except JWTError as e:
            # Token expired or invalid
            raise credentials_exception
    
    def revoke_token(self, token: str):
        """
        Revoke/blacklist a token (for logout)
        
        Note: In production, use Redis with TTL for blacklist
        """
        self.blacklisted_tokens.add(token)
        if token in self.active_tokens:
            self.active_tokens.remove(token)
    
    def refresh_access_token(self, refresh_token: str) -> str:
        """
        Generate new access token from refresh token
        
        Args:
            refresh_token: Valid refresh token
            
        Returns:
            New access token
        """
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # Verify it's a refresh token
            if payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            # Create new access token
            username = payload.get("sub")
            new_token_data = {"sub": username, "role": payload.get("role")}
            return self.create_access_token(new_token_data)
            
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
    
    async def get_current_user(self, token: str = Depends(oauth2_scheme)):
        """
        Dependency to get current user from token
        
        Usage:
            @app.get("/profile")
            async def get_profile(user = Depends(session_manager.get_current_user)):
                return user
        """
        payload = self.verify_token(token)
        
        # Get user from database
        from collections import user_collection
        username = payload.get("sub")
        user = await user_collection.get_user_by_username(username)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
    
    async def get_current_active_user(
        self, 
        current_user: dict = Depends(get_current_user)
    ):
        """Ensure user is active"""
        if not current_user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        return current_user
    
    def get_token_expiry(self, token: str) -> datetime:
        """Get token expiration time"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            exp_timestamp = payload.get("exp")
            return datetime.fromtimestamp(exp_timestamp)
        except JWTError:
            return None

# Create global session manager instance
session_manager = SessionManager()

# auth_routes.py - Using Session Manager
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models import UserCreate, UserResponse, Token

auth_router = APIRouter(prefix="/auth", tags=["authentication"])

@auth_router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register new user"""
    from collections import user_collection
    
    # Check if user exists
    existing = await user_collection.get_user_by_username(user_data.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Hash password
    hashed_password = pwd_context.hash(user_data.password)
    
    # Create user
    user_dict = user_data.dict()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]
    
    user_id = await user_collection.create_user(user_dict)
    created_user = await user_collection.get_user_by_id(user_id)
    
    return UserResponse(**created_user)

@auth_router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login user and create session (JWT token)
    
    This is where the session starts!
    """
    from collections import user_collection
    
    # Authenticate user
    user = await user_collection.get_user_by_username(form_data.username)
    if not user or not pwd_context.verify(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create session token
    token_data = {
        "sub": user["username"],
        "role": user["role"],
        "user_id": str(user["_id"])
    }
    
    access_token = session_manager.create_access_token(token_data)
    refresh_token = session_manager.create_refresh_token(token_data)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # seconds
    }

@auth_router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    """
    Logout user and end session
    
    This revokes the token (blacklists it)
    """
    session_manager.revoke_token(token)
    return {"message": "Successfully logged out"}

@auth_router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    """
    Refresh access token using refresh token
    
    This extends the session without re-login
    """
    new_access_token = session_manager.refresh_access_token(refresh_token)
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }

@auth_router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: dict = Depends(session_manager.get_current_active_user)
):
    """
    Get current user profile
    
    This uses the session token to identify the user
    """
    return UserResponse(**current_user)

@auth_router.get("/session-info")
async def get_session_info(token: str = Depends(oauth2_scheme)):
    """Get information about current session"""
    payload = session_manager.verify_token(token)
    expiry = session_manager.get_token_expiry(token)
    
    return {
        "username": payload.get("sub"),
        "role": payload.get("role"),
        "issued_at": datetime.fromtimestamp(payload.get("iat")),
        "expires_at": expiry,
        "time_remaining": (expiry - datetime.utcnow()).total_seconds() if expiry else None
    }

# Protected route example
@auth_router.get("/protected")
async def protected_route(
    current_user: dict = Depends(session_manager.get_current_active_user)
):
    """
    Example of protected route
    
    Only accessible with valid session token
    """
    return {
        "message": f"Hello {current_user['username']}!",
        "role": current_user["role"],
        "access_granted": True
    }
```

### **Frontend Session Management (React)**

```javascript
// sessionManager.js
class SessionManager {
  constructor() {
    this.TOKEN_KEY = 'access_token';
    this.REFRESH_TOKEN_KEY = 'refresh_token';
    this.USER_KEY = 'user_data';
  }

  // Save session after login
  saveSession(accessToken, refreshToken, userData) {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  }

  // Get current session token
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Get user data
  getUserData() {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  // Check if session is active
  isAuthenticated() {
    return !!this.getToken();
  }

  // Clear session (logout)
  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Refresh access token
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch('http://localhost:8000/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(this.TOKEN_KEY, data.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Auto-refresh token before expiry
  setupAutoRefresh(expiresIn) {
    // Refresh 5 minutes before expiry
    const refreshTime = (expiresIn - 300) * 1000;
    
    setTimeout(async () => {
      const success = await this.refreshAccessToken();
      if (success) {
        // Setup next refresh
        this.setupAutoRefresh(expiresIn);
      } else {
        // Refresh failed, logout user
        this.clearSession();
        window.location.href = '/login';
      }
    }, refreshTime);
  }
}

export const sessionManager = new SessionManager();

// Usage in React components
import { sessionManager } from './sessionManager';

// Login component
const handleLogin = async (username, password) => {
  const response = await axios.post('/auth/login', { username, password });
  
  const { access_token, refresh_token, expires_in } = response.data;
  
  // Get user data
  const userResponse = await axios.get('/auth/me', {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  
  // Save session
  sessionManager.saveSession(access_token, refresh_token, userResponse.data);
  
  // Setup auto-refresh
  sessionManager.setupAutoRefresh(expires_in);
  
  // Redirect to dashboard
  navigate('/dashboard');
};

// Logout component
const handleLogout = async () => {
  const token = sessionManager.getToken();
  
  // Call logout endpoint
  await axios.post('/auth/logout', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Clear local session
  sessionManager.clearSession();
  
  // Redirect to login
  navigate('/login');
};

// Axios interceptor for automatic token injection
axios.interceptors.request.use(
  (config) => {
    const token = sessionManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios interceptor for token refresh on 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshed = await sessionManager.refreshAccessToken();
      if (refreshed) {
        // Retry original request with new token
        const token = sessionManager.getToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } else {
        // Refresh failed, logout
        sessionManager.clearSession();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

### **Session Management Best Practices:**

```python
# 1. Token Expiration Strategy
SHORT_LIVED_ACCESS_TOKEN = 30  # minutes - for API requests
LONG_LIVED_REFRESH_TOKEN = 7   # days - for getting new access tokens

# 2. Secure Token Storage (Frontend)
# ✅ Good: localStorage for web apps
# ✅ Better: httpOnly cookies (prevents XSS)
# ❌ Bad: Regular cookies without httpOnly

# 3. Token Blacklisting (Backend)
# For production, use Redis with TTL
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def blacklist_token(token: str, expires_in: int):
    """Store blacklisted token in Redis with expiration"""
    redis_client.setex(f"blacklist:{token}", expires_in, "1")

def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted"""
    return redis_client.exists(f"blacklist:{token}") > 0

# 4. Session Monitoring
class SessionMonitor:
    """Monitor active sessions"""
    
    async def get_active_sessions(self, user_id: str):
        """Get all active sessions for a user"""
        # In production, store session metadata in Redis
        return await redis_client.keys(f"session:{user_id}:*")
    
    async def revoke_all_sessions(self, user_id: str):
        """Revoke all sessions for a user (e.g., password change)"""
        sessions = await self.get_active_sessions(user_id)
        for session in sessions:
            await redis_client.delete(session)
    
    async def get_session_info(self, user_id: str):
        """Get session statistics"""
        sessions = await self.get_active_sessions(user_id)
        return {
            "user_id": user_id,
            "active_sessions": len(sessions),
            "last_activity": await redis_client.get(f"last_activity:{user_id}")
        }
```

### **Interview Explanation:**

**Q: "How do you manage user sessions in your banking system?"**

**A:** "I use JWT tokens for stateless session management. When a user logs in, the backend generates a JWT token containing the user's identity and role. This token is sent to the frontend and stored in localStorage. For every subsequent API request, the frontend includes this token in the Authorization header. The backend validates the token and extracts user information without needing to store session data on the server.

I implement both access tokens (short-lived, 30 minutes) and refresh tokens (long-lived, 7 days) for better security. Access tokens are used for API requests, while refresh tokens allow users to get new access tokens without re-logging in.

For logout, I blacklist the token so it can't be reused. In production, I'd use Redis with TTL for efficient token blacklisting. This approach is stateless, scales horizontally, and provides good security for a banking application."

### **Key Differences: Sessions vs JWT**

| Feature | Traditional Sessions | JWT Tokens (Your System) |
|---------|---------------------|--------------------------|
| Storage | Server-side (memory/database) | Client-side (localStorage) |
| Scalability | Requires sticky sessions | Stateless, scales easily |
| Revocation | Easy (delete from server) | Requires blacklist |
| Size | Small session ID | Larger token |
| Security | Server controls everything | Token can be stolen if not secured |
| Best For | Monolithic apps | Microservices, APIs |

Your banking system uses JWT because it's an API-based architecture with a separate React frontend, making stateless authentication the better choice! 🚀