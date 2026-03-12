import uuid
import pdfplumber


def generate_id():
    return str(uuid.uuid4())


def format_response(message):
    return {"status": "success", "message": message}


# --------------------------------
# Extract Text From PDF Resume
# --------------------------------
def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text content from a PDF file.
    """

    text = ""

    try:

        with pdfplumber.open(file_path) as pdf:

            for page in pdf.pages:

                page_text = page.extract_text()

                if page_text:
                    text += page_text + "\n"

    except Exception as e:

        raise Exception(f"Failed to extract text from PDF: {e}")

    return text
