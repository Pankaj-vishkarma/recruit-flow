import os


def create_file(path: str, content: str):

    try:

        os.makedirs(os.path.dirname(path), exist_ok=True)

        with open(path, "w") as f:
            f.write(content)

        return {"status": "file created"}

    except Exception as e:
        return {"error": str(e)}
