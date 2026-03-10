import uuid

def generate_id():
    return str(uuid.uuid4())


def format_response(message):
    return {
        "status": "success",
        "message": message
    }