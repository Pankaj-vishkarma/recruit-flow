from app.config.database import candidates_collection


def save_candidate_data(name, data):

    candidates_collection.update_one({"name": name}, {"$set": data}, upsert=True)


def get_candidate_data(name):

    user = candidates_collection.find_one({"name": name})

    if user:
        return user

    return {}
