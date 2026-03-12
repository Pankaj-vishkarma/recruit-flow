from passlib.context import CryptContext
from app.config.database import get_database
from app.utils.jwt_handler import create_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = get_database()


# --------------------------------
# Hash Password
# --------------------------------
def hash_password(password: str):
    return pwd_context.hash(password)


# --------------------------------
# Verify Password
# --------------------------------
def verify_password(password: str, hashed_password: str):
    return pwd_context.verify(password, hashed_password)


# --------------------------------
# Create User
# --------------------------------
def create_user(name: str, email: str, password: str, role: str):

    users = db["users"]

    existing_user = users.find_one({"email": email})

    if existing_user:
        return None

    hashed_password = hash_password(password)

    user_data = {
        "name": name,
        "email": email,
        "hashed_password": hashed_password,
        "role": role,
    }

    users.insert_one(user_data)

    return user_data


# --------------------------------
# Get User by Email
# --------------------------------
def get_user(email: str):

    users = db["users"]

    return users.find_one({"email": email})


# --------------------------------
# Authenticate User (LOGIN)
# --------------------------------
def authenticate_user(email: str, password: str):

    user = get_user(email)

    if not user:
        return None

    if not verify_password(password, user["hashed_password"]):
        return None

    # create JWT token
    token = create_access_token({"email": user["email"], "role": user["role"]})

    return {"access_token": token, "token_type": "bearer", "role": user["role"]}
