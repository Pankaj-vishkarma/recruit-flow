from typing import TypedDict, List, Dict


class AgentState(TypedDict):

    messages: List[str]

    candidate_name: str

    current_step: str

    candidate_data: Dict
