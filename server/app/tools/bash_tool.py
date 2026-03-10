import subprocess


def run_command(command: str):

    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)

        return {"stdout": result.stdout, "stderr": result.stderr}

    except Exception as e:
        return {"error": str(e)}
