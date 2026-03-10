from app.tools.bash_tool import run_command
from app.tools.text_editor_tool import create_file


def onboarding_agent(state):

    name = state.get("candidate_name", "candidate")

    folder = f"./employees/{name}"

    print("Creating employee folder...")

    run_command(f"mkdir {folder}")

    print("Creating welcome file...")

    create_file(
        f"{folder}/welcome.txt",
        f"""
Welcome {name} to the company!

Your development environment has been created successfully.

Best Regards,
HR Team
""",
    )

    print("Verifying files...")

    verification = run_command(f"ls {folder}")

    print(verification)

    state["current_step"] = "completed"

    return state
